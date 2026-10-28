import { sendMessage } from './telegram.js';
import { getAuthorizedChatId } from './kv.js';

/**
 * Best-effort error notification: every failure path in this worker should
 * call this instead of failing silently. Swallows its own errors (e.g. if
 * Telegram itself is down) so a notification failure never masks the
 * original error or crashes the handler a second time.
 */
export async function notifyError(env, context, err) {
  console.error(`[quiz-weekly] ${context}:`, err && err.stack ? err.stack : err);
  try {
    const chatId = await getAuthorizedChatId(env);
    if (!chatId) return;
    const message = `🚨 <b>Error en Quiz Semanal</b>\n<b>Dónde:</b> ${context}\n<b>Detalle:</b> ${String(err && err.message ? err.message : err).slice(0, 500)}`;
    await sendMessage(env, chatId, message);
  } catch (notifyErr) {
    console.error('[quiz-weekly] also failed to send the error notification:', notifyErr);
  }
}

export async function notifyInfo(env, text) {
  try {
    const chatId = await getAuthorizedChatId(env);
    if (!chatId) return;
    await sendMessage(env, chatId, text);
  } catch (err) {
    console.error('[quiz-weekly] failed to send info notification:', err);
  }
}
