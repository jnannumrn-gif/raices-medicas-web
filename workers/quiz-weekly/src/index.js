import { handleScheduled, runSlot } from './handlers/cron.js';
import { handleTelegramUpdate } from './handlers/webhook.js';
import { notifyError } from './notify.js';
import { isPaused } from './kv.js';

const VALID_SLOTS = ['generate', 'reminder', 'publish'];

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);

    if (request.method === 'POST' && url.pathname === '/telegram-webhook') {
      return handleWebhookRequest(request, env, ctx);
    }

    if (request.method === 'POST' && url.pathname.startsWith('/admin/trigger/')) {
      return handleManualTrigger(request, env, url);
    }

    return new Response('Not found', { status: 404 });
  },

  async scheduled(event, env, ctx) {
    ctx.waitUntil(
      handleScheduled(env).catch((err) => notifyError(env, 'scheduled (top-level)', err))
    );
  },
};

async function handleWebhookRequest(request, env, ctx) {
  // Telegram sends this header on every request when the webhook was
  // registered with a secret_token; a mismatch means the request did not
  // come from Telegram (or from a stale/unknown webhook) and is dropped
  // silently — no error body, nothing that confirms this endpoint exists.
  const secretHeader = request.headers.get('X-Telegram-Bot-Api-Secret-Token');
  if (!env.TELEGRAM_WEBHOOK_SECRET || secretHeader !== env.TELEGRAM_WEBHOOK_SECRET) {
    return new Response(null, { status: 404 });
  }

  let update;
  try {
    update = await request.json();
  } catch (err) {
    return new Response(null, { status: 200 });
  }

  // Telegram only cares about a fast 200; do the real work after responding.
  ctx.waitUntil(
    handleTelegramUpdate(env, update).catch((err) => notifyError(env, 'webhook (top-level)', err))
  );

  return new Response(null, { status: 200 });
}

/**
 * Manual escape hatch: POST /admin/trigger/generate|reminder|publish
 * Header: X-Admin-Password: <QUIZ_ADMIN_PASSWORD>
 *
 * Runs one slot's logic immediately, regardless of the current time or
 * whether it already ran today. Used for the initial dry-run test (so we
 * don't have to wait for an actual Friday) and documented in README.md as
 * the way to publish by hand if a cron run is ever missed. Reuses the
 * existing quiz admin password rather than inventing a second secret.
 */
async function handleManualTrigger(request, env, url) {
  if (!env.QUIZ_ADMIN_PASSWORD || request.headers.get('X-Admin-Password') !== env.QUIZ_ADMIN_PASSWORD) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  if (await isPaused(env)) {
    return new Response(JSON.stringify({ error: 'El kill switch está activo (AUTOMATION_PAUSED). No se ejecuta nada.' }), {
      status: 409,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const slot = url.pathname.split('/').pop();
  if (!VALID_SLOTS.includes(slot)) {
    return new Response(JSON.stringify({ error: `Slot inválido. Usa uno de: ${VALID_SLOTS.join(', ')}` }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  try {
    await runSlot(env, slot);
    return new Response(JSON.stringify({ ok: true, slot }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (err) {
    await notifyError(env, `manual-trigger:${slot}`, err);
    return new Response(JSON.stringify({ ok: false, error: String(err && err.message ? err.message : err) }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
