import { getDraft, setDraft, getAuthorizedChatId, isPaused } from '../kv.js';
import { sendMessage, answerCallbackQuery, formatDraftMessage, draftKeyboard } from '../telegram.js';
import { generateWithRetry } from './cron.js';
import { notifyError } from '../notify.js';
import { targetSundayFromWeekStart } from '../scheduler.js';

/**
 * The little toast/checkmark Telegram shows after a button tap is cosmetic —
 * the real side effects (KV update + follow-up message) happen regardless.
 * Never let a failure here (e.g. an already-expired callback) block or
 * error out the actual approve/change logic.
 */
async function ackCallback(env, callbackId, text) {
  try {
    await answerCallbackQuery(env, callbackId, text);
  } catch (err) {
    console.warn('[quiz-weekly] answerCallbackQuery failed (non-fatal):', err);
  }
}

/**
 * Handles one Telegram update. The caller (index.js) has already verified
 * the X-Telegram-Bot-Api-Secret-Token header before this runs. Any update
 * from a chat other than the authorized one, or any update shape we don't
 * recognize, is ignored without a response — per spec, no information is
 * ever leaked to an unauthorized sender.
 */
export async function handleTelegramUpdate(env, update) {
  if (await isPaused(env)) return;

  const authorizedChatId = await getAuthorizedChatId(env);
  if (!authorizedChatId) return; // not configured yet — nothing we can safely do

  if (update.callback_query) {
    await handleCallback(env, update.callback_query, authorizedChatId);
    return;
  }

  if (update.message) {
    await handleMessage(env, update.message, authorizedChatId);
  }
}

async function handleCallback(env, callback, authorizedChatId) {
  const chatId = callback.message?.chat?.id;
  if (String(chatId) !== String(authorizedChatId)) return;

  const draft = await getDraft(env);
  if (!draft || draft.status !== 'pending') {
    await ackCallback(env, callback.id, 'No hay un borrador pendiente.');
    return;
  }

  if (callback.data === 'approve') {
    draft.status = 'approved';
    draft.approved_at = new Date().toISOString();
    await setDraft(env, draft);
    await ackCallback(env, callback.id, 'Aprobado ✅');
    const targetSunday = targetSundayFromWeekStart(draft.week_start);
    await sendMessage(
      env,
      chatId,
      `✅ Quiz aprobado. Se publicará el domingo <b>${targetSunday}</b> a las 10pm (hora de Nueva York) — nunca antes, sin importar cuándo lo apruebes.`
    );
    return;
  }

  if (callback.data === 'change') {
    draft.awaiting_comment = true;
    await setDraft(env, draft);
    await ackCallback(env, callback.id, 'Cuéntame qué ajustar');
    await sendMessage(env, chatId, '✏️ ¿Qué te gustaría ajustar del borrador? Escríbeme tu comentario en un mensaje.');
    return;
  }

  await ackCallback(env, callback.id);
}

async function handleMessage(env, message, authorizedChatId) {
  const chatId = message.chat?.id;
  if (String(chatId) !== String(authorizedChatId)) return;

  const text = (message.text || '').trim();
  if (!text) return;

  const draft = await getDraft(env);
  if (!draft || draft.status !== 'pending' || !draft.awaiting_comment) {
    // Not currently expecting free-text input — ignore rather than guess intent.
    return;
  }

  try {
    await sendMessage(env, chatId, '🔄 Regenerando el quiz con tu comentario...');

    const generated = await generateWithRetry(env, { changeComment: text });
    const updated = {
      ...draft,
      subtitle: generated.subtitle,
      questions: generated.questions,
      awaiting_comment: false,
      generated_at: new Date().toISOString(),
      change_history: [...(draft.change_history || []), { comment: text, at: new Date().toISOString() }],
    };
    await setDraft(env, updated);
    await sendMessage(env, chatId, formatDraftMessage(updated), { reply_markup: draftKeyboard() });
  } catch (err) {
    await notifyError(env, 'webhook:change', err);
  }
}
