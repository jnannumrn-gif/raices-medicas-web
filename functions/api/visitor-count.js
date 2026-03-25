/**
 * Cloudflare Pages Function -- Raices Medicas
 * Visitor Counter (KV-backed)
 *
 * GET  /api/visitor-count  → increment count and return { count }
 *
 * Uses KV namespace binding: VISITOR_COUNTER
 */

const KV_KEY = "total_visits";

export async function onRequest(context) {
  const { env } = context;

  const headers = {
    "Content-Type": "application/json",
    "Cache-Control": "no-cache, no-store",
  };

  try {
    const current = await env.VISITOR_COUNTER.get(KV_KEY);
    const count = (parseInt(current, 10) || 0) + 1;
    await env.VISITOR_COUNTER.put(KV_KEY, String(count));
    return new Response(JSON.stringify({ count }), { headers });
  } catch (err) {
    return new Response(
      JSON.stringify({ count: 0, error: err.message }),
      { status: 500, headers }
    );
  }
}
