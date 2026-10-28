import { currentSlot, nextMondayUtcDateFromFriday, hasReachedTargetPublishTime, targetSundayFromWeekStart, isMondayDateKey } from '../scheduler.js';
import { getDraft, setDraft, getAuthorizedChatId, isPaused, isDryRun, hasRun, markRun } from '../kv.js';
import { generateQuiz } from '../anthropic.js';
import { validateGeneratedQuiz, toPublishPayload } from '../validate.js';
import { recentTopics, publishQuiz } from '../quizApi.js';
import { sendMessage, formatDraftMessage, draftKeyboard } from '../telegram.js';
import { notifyError, notifyInfo } from '../notify.js';

export async function handleScheduled(env) {
  if (await isPaused(env)) {
    console.log('[quiz-weekly] kill switch is on, skipping scheduled run');
    return;
  }

  const hit = currentSlot(new Date());
  if (!hit) return; // not one of the three weekly windows

  const { slot, dateKey } = hit;
  if (await hasRun(env, slot, dateKey)) return; // already handled this slot today

  try {
    await runSlot(env, slot);
    await markRun(env, slot, dateKey);
  } catch (err) {
    await notifyError(env, `cron:${slot}`, err);
    // Deliberately do NOT mark the slot as run, so the next 15-minute tick
    // inside the same window retries rather than silently giving up.
  }
}

/**
 * Runs one named slot ('generate' | 'reminder' | 'publish') regardless of
 * what time it actually is. Used by the real cron dispatcher above, and by
 * the manual /admin/trigger/:slot HTTP endpoint for testing and for
 * publishing by hand if a cron run is ever missed.
 */
export async function runSlot(env, slot) {
  if (slot === 'generate') return runGenerate(env);
  if (slot === 'reminder') return runReminder(env);
  if (slot === 'publish') return runPublish(env);
  throw new Error(`Unknown slot: ${slot}`);
}

async function runGenerate(env) {
  const chatId = await getAuthorizedChatId(env);
  if (!chatId) throw new Error('No hay chat_id autorizado configurado en KV (chat_id:authorized)');

  const existing = await getDraft(env);
  if (existing && existing.status !== 'published' && existing.status !== 'dry_run_published') {
    await notifyInfo(
      env,
      `ℹ️ No se generó un nuevo quiz esta semana: todavía hay un borrador de la semana del ${existing.week_start} sin aprobar. Apruébalo o pide cambios para que se publique en la próxima corrida del domingo.`
    );
    return;
  }

  const weekStart = nextMondayUtcDateFromFriday(new Date());
  if (!isMondayDateKey(weekStart)) {
    // Should be unreachable given nextMondayUtcDateFromFriday's contract,
    // but we never want to silently save/send a quiz with a broken
    // week_start — fail loudly instead. Thrown (not notified here directly)
    // so the single catch in handleScheduled/runSlot's callers reports it.
    throw new Error(`week_start calculado (${weekStart}) no es un lunes; no se genera el quiz.`);
  }
  const avoidTopics = await recentTopics(env).catch(() => []);

  const draft = await generateWithRetry(env, { avoidTopics });
  draft.week_start = weekStart;
  draft.status = 'pending';
  draft.awaiting_comment = false;
  draft.generated_at = new Date().toISOString();
  draft.approved_at = null;
  draft.published_at = null;
  draft.change_history = [];

  await setDraft(env, draft);
  await sendMessage(env, chatId, formatDraftMessage(draft), { reply_markup: draftKeyboard() });
}

async function runReminder(env) {
  const chatId = await getAuthorizedChatId(env);
  if (!chatId) throw new Error('No hay chat_id autorizado configurado en KV (chat_id:authorized)');

  const draft = await getDraft(env);
  if (!draft || draft.status !== 'pending') return; // already approved, or nothing to remind about

  await sendMessage(env, chatId, formatDraftMessage(draft, { reminder: true }), { reply_markup: draftKeyboard() });
}

async function runPublish(env) {
  const chatId = await getAuthorizedChatId(env);
  const draft = await getDraft(env);
  if (!draft || draft.status !== 'approved') return; // nothing approved to publish this round

  // Hard safety check, independent of how/when week_start was computed:
  // current.js on the site activates a quiz by `week_start <= fecha UTC
  // actual` (date only), so week_start MUST be a Monday for the weekly
  // cadence to make sense. Never publish a malformed draft — block it and
  // tell a human instead of guessing.
  if (!isMondayDateKey(draft.week_start)) {
    draft.status = 'blocked';
    await setDraft(env, draft);
    const msg = `🚫 Quiz NO publicado: su week_start (<b>${draft.week_start}</b>) no es un lunes. Revísalo manualmente antes de continuar.`;
    console.error(`[quiz-weekly] ${msg}`);
    if (chatId) await sendMessage(env, chatId, msg);
    return;
  }

  // A quiz approved early in the week (e.g. right after it was generated on
  // Friday, or during Saturday's reminder) must still wait for its own
  // target Sunday 10pm ET — approval is not a trigger to publish early.
  // This check applies to every caller of runPublish (the real weekly cron
  // AND the manual /admin/trigger/publish escape hatch), so there is no way
  // to publish a quiz ahead of its scheduled week from either path.
  if (!hasReachedTargetPublishTime(draft.week_start, new Date())) {
    console.log(
      `[quiz-weekly] draft for week_start=${draft.week_start} is approved but its target Sunday (${targetSundayFromWeekStart(draft.week_start)} 10pm ET) hasn't arrived yet — not publishing.`
    );
    return;
  }

  // Belt-and-suspenders: current.js on the site only activates a quiz once
  // `week_start <= fecha UTC actual`. hasReachedTargetPublishTime() above
  // already guarantees this (domingo 10pm ET is always already Monday in
  // UTC), but we assert it explicitly so a future scheduler bug can never
  // silently publish a quiz the site itself wouldn't yet show.
  const nowUtcDate = new Date().toISOString().slice(0, 10);
  if (draft.week_start > nowUtcDate) {
    const msg = `🚫 Quiz NO publicado: su week_start (<b>${draft.week_start}</b>) es posterior a la fecha UTC actual (${nowUtcDate}) — current.js todavía no lo activaría.`;
    console.error(`[quiz-weekly] ${msg}`);
    if (chatId) await sendMessage(env, chatId, msg);
    return;
  }

  const dryRun = await isDryRun(env);
  const payload = toPublishPayload(draft);

  if (dryRun) {
    console.log('[quiz-weekly] DRY RUN — would publish:', JSON.stringify(payload));
    draft.status = 'dry_run_published';
    draft.published_at = new Date().toISOString();
    await setDraft(env, draft);
    if (chatId) {
      await sendMessage(
        env,
        chatId,
        `🧪 <b>Modo prueba (dry run)</b>\nSe habría publicado el quiz de la semana del <b>${draft.week_start}</b>, pero no se envió nada al sitio real.\nCuando confirmes por escrito, desactivo el dry run y este mismo quiz se publicará en la próxima corrida.`
      );
    }
    return;
  }

  const result = await publishQuiz(env, payload);
  draft.status = 'published';
  draft.published_at = new Date().toISOString();
  await setDraft(env, draft);

  if (chatId) {
    const msg =
      result.reason === 'duplicate'
        ? `ℹ️ El quiz de la semana del <b>${draft.week_start}</b> ya existía en el sitio (409); no se duplicó, solo se marcó como publicado.`
        : `✅ Quiz de la semana del <b>${draft.week_start}</b> publicado en el sitio.`;
    await sendMessage(env, chatId, msg);
  }
}

/** Generates once, validates, and retries generation exactly once more on failure. */
export async function generateWithRetry(env, { avoidTopics = [], changeComment = null } = {}) {
  for (let attempt = 1; attempt <= 2; attempt++) {
    const generated = await generateQuiz(env, { avoidTopics, changeComment });
    const check = validateGeneratedQuiz(generated);
    if (check.ok) return generated;

    console.warn(`[quiz-weekly] generated quiz failed validation (attempt ${attempt}): ${check.error}`);
    if (attempt === 2) {
      await notifyError(env, 'generate', new Error(`El modelo no produjo un quiz válido tras 2 intentos: ${check.error}`));
      throw new Error('quiz generation validation failed twice');
    }
  }
}
