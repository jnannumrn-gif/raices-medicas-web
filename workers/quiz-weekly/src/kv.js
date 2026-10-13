/**
 * All KV access for the quiz-weekly worker goes through this module.
 * Keys:
 *   draft:current          -> JSON draft object (see shape below) or absent
 *   chat_id:authorized      -> string, the only Telegram chat.id allowed to approve/change
 *   kill_switch:paused      -> "1" when the automation must stop (crons + webhook)
 *   config:dry_run          -> "true" | "false" (missing => treated as "true", safe default)
 *   ran:<slot>:<ny-date>    -> "1", idempotency marker so a slot runs at most once per NY day
 *
 * Draft shape:
 * {
 *   week_start: "YYYY-MM-DD",       // Monday, UTC date used as the quiz's unique key
 *   subtitle: string,
 *   questions: [{ position, question, option_a, option_b, option_c, option_d, correct_index, explanation }],
 *   status: "pending" | "approved" | "published" | "dry_run_published",
 *   awaiting_comment: boolean,       // true right after "❌ Cambiar" was pressed, until the next text message
 *   generated_at: ISO string,
 *   approved_at: ISO string | null,
 *   published_at: ISO string | null,
 *   change_history: [{ comment: string, at: ISO string }],
 * }
 */

const DRAFT_KEY = 'draft:current';
const AUTHORIZED_CHAT_KEY = 'chat_id:authorized';
const PAUSED_KEY = 'kill_switch:paused';
const DRY_RUN_KEY = 'config:dry_run';

export async function getDraft(env) {
  const raw = await env.QUIZ_WEEKLY_KV.get(DRAFT_KEY);
  return raw ? JSON.parse(raw) : null;
}

export async function setDraft(env, draft) {
  await env.QUIZ_WEEKLY_KV.put(DRAFT_KEY, JSON.stringify(draft));
}

export async function getAuthorizedChatId(env) {
  return env.QUIZ_WEEKLY_KV.get(AUTHORIZED_CHAT_KEY);
}

export async function isPaused(env) {
  const v = await env.QUIZ_WEEKLY_KV.get(PAUSED_KEY);
  return v === '1';
}

/** Defaults to true (dry run) when unset, so a fresh deploy never publishes by accident. */
export async function isDryRun(env) {
  const v = await env.QUIZ_WEEKLY_KV.get(DRY_RUN_KEY);
  return v !== 'false';
}

export async function hasRun(env, slot, dateKey) {
  const v = await env.QUIZ_WEEKLY_KV.get(`ran:${slot}:${dateKey}`);
  return v === '1';
}

export async function markRun(env, slot, dateKey) {
  // Expire after 3 days; we only ever need "did this run today" for a few hours.
  await env.QUIZ_WEEKLY_KV.put(`ran:${slot}:${dateKey}`, '1', { expirationTtl: 3 * 24 * 60 * 60 });
}
