/**
 * Shared helpers for the /api/quiz/admin endpoints.
 * Files prefixed with "_" inside functions/ are not routed by Cloudflare Pages.
 */

const ALLOWED_ORIGINS = [
  'https://raicesmedicas.health',
  'https://www.raicesmedicas.health',
  'https://raices-medicas-web.pages.dev',
];

// Branch/deployment previews, e.g. https://abc123.raices-medicas-web.pages.dev
const PREVIEW_ORIGIN = /^https:\/\/[a-z0-9-]+\.raices-medicas-web\.pages\.dev$/;

/**
 * The site's own origin is always allowed, which covers local development
 * (wrangler pages dev) without granting loopback origins access in production.
 */
function isAllowedOrigin(origin, request) {
  return (
    origin === new URL(request.url).origin ||
    ALLOWED_ORIGINS.indexOf(origin) !== -1 ||
    PREVIEW_ORIGIN.test(origin)
  );
}

/**
 * CORS + JSON headers for an admin response. Only echoes Origin back when it
 * belongs to the site itself; unknown origins get no CORS grant at all.
 */
export function adminHeaders(request, extra) {
  const headers = {
    'Content-Type': 'application/json',
    'Cache-Control': 'no-store',
    Vary: 'Origin',
  };

  const origin = request.headers.get('Origin');
  if (origin && isAllowedOrigin(origin, request)) {
    headers['Access-Control-Allow-Origin'] = origin;
  }

  return Object.assign(headers, extra || {});
}

/** Timing-safe string comparison, to avoid leaking the password byte by byte. */
export function timingSafeEqual(a, b) {
  const encoder = new TextEncoder();
  const aBytes = encoder.encode(a);
  const bBytes = encoder.encode(b);

  // Length is not secret-dependent enough to matter, but keep the loop constant
  // over the expected value so a mismatch never short-circuits.
  let diff = aBytes.length ^ bBytes.length;
  for (let i = 0; i < bBytes.length; i++) {
    diff |= (aBytes[i] || 0) ^ bBytes[i];
  }

  return diff === 0;
}

/** True when the request carries the correct X-Admin-Password header. */
export function isAuthorized(request, env) {
  const expected = env.QUIZ_ADMIN_PASSWORD || '';
  if (!expected) return false;
  return timingSafeEqual(request.headers.get('X-Admin-Password') || '', expected);
}

export function jsonResponse(body, status, headers) {
  return new Response(JSON.stringify(body), { status: status, headers: headers });
}

export function unauthorized(headers) {
  return jsonResponse({ error: 'Unauthorized' }, 401, headers);
}

/** Logs the real cause and returns a generic message to the client. */
export function databaseError(err, headers) {
  console.error('quiz admin D1 error:', err && err.stack ? err.stack : err);
  return jsonResponse({ error: 'Database error' }, 500, headers);
}
