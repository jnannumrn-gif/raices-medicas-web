const API_BASE = 'https://api.telegram.org';

function api(env) {
  return `${API_BASE}/bot${env.TELEGRAM_BOT_TOKEN}`;
}

async function call(env, method, body) {
  const res = await fetch(`${api(env)}/${method}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  const data = await res.json();
  if (!data.ok) {
    throw new Error(`Telegram ${method} failed: ${data.description || res.status}`);
  }
  return data.result;
}

export async function sendMessage(env, chatId, text, extra = {}) {
  return call(env, 'sendMessage', {
    chat_id: chatId,
    text,
    parse_mode: 'HTML',
    ...extra,
  });
}

export async function answerCallbackQuery(env, callbackQueryId, text) {
  return call(env, 'answerCallbackQuery', {
    callback_query_id: callbackQueryId,
    text,
  });
}

export async function editMessageReplyMarkup(env, chatId, messageId, replyMarkup) {
  return call(env, 'editMessageReplyMarkup', {
    chat_id: chatId,
    message_id: messageId,
    reply_markup: replyMarkup,
  });
}

export async function setWebhook(env, url, secretToken) {
  return call(env, 'setWebhook', {
    url,
    secret_token: secretToken,
    allowed_updates: ['message', 'callback_query'],
  });
}

function escapeHtml(s) {
  return String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

const LETTERS = ['A', 'B', 'C', 'D'];

/** Builds the human-readable draft message shown in Telegram for review. */
export function formatDraftMessage(draft, { reminder = false } = {}) {
  const header = reminder
    ? '⏰ <b>Recordatorio: Quiz de la Semana pendiente de aprobación</b>'
    : '🧩 <b>Nuevo borrador — Quiz de la Semana</b>';

  const lines = [
    header,
    `<b>Semana del:</b> ${escapeHtml(draft.week_start)}`,
    `<b>Subtítulo:</b> ${escapeHtml(draft.subtitle)}`,
    '',
  ];

  draft.questions.forEach((q, i) => {
    lines.push(`<b>${i + 1}. ${escapeHtml(q.question)}</b>`);
    ['option_a', 'option_b', 'option_c', 'option_d'].forEach((key, idx) => {
      const mark = idx === q.correct_index ? '✅ ' : '• ';
      lines.push(`${mark}${LETTERS[idx]}) ${escapeHtml(q[key])}`);
    });
    lines.push(`<i>Explicación:</i> ${escapeHtml(q.explanation)}`);
    lines.push('');
  });

  if (draft.status === 'dry_run_published') {
    lines.push('🧪 <i>Modo prueba: este quiz NO se publicó realmente.</i>');
  }

  return lines.join('\n');
}

export function draftKeyboard() {
  return {
    inline_keyboard: [
      [
        { text: '✅ Aprobar', callback_data: 'approve' },
        { text: '❌ Cambiar', callback_data: 'change' },
      ],
    ],
  };
}
