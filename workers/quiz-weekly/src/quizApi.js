/**
 * Thin client for the site's existing /api/quiz/admin endpoints. Never
 * touches functions/api/quiz/* or the D1 schema directly — this worker is
 * just another HTTP caller of the already-hardened admin API.
 */

function headers(env) {
  return {
    'Content-Type': 'application/json',
    'X-Admin-Password': env.QUIZ_ADMIN_PASSWORD,
  };
}

/** List existing quizzes (most recent first per the API's own ordering). */
export async function listQuizzes(env) {
  const res = await fetch(`${env.QUIZ_SITE_BASE_URL}/api/quiz/admin`, { headers: headers(env) });
  if (!res.ok) {
    throw new Error(`GET /api/quiz/admin failed: ${res.status}`);
  }
  const data = await res.json();
  return data.quizzes || [];
}

export async function getQuizDetail(env, id) {
  const res = await fetch(`${env.QUIZ_SITE_BASE_URL}/api/quiz/admin/${id}`, { headers: headers(env) });
  if (!res.ok) {
    throw new Error(`GET /api/quiz/admin/${id} failed: ${res.status}`);
  }
  return res.json();
}

/** Fetches the subtitle + question text of the N most recent quizzes, for "don't repeat topics". */
export async function recentTopics(env, limit = 8) {
  const quizzes = await listQuizzes(env);
  const recent = quizzes.slice(0, limit);
  const details = await Promise.all(recent.map((q) => getQuizDetail(env, q.id).catch(() => null)));
  return details
    .filter(Boolean)
    .map((d) => `${d.subtitle} (${d.questions.map((q) => q.question).join(' / ')})`);
}

/**
 * Returns { published: true } on success, { published: false, reason: 'duplicate' }
 * on a 409 (already published — treated as success for idempotency), or throws
 * for any other failure.
 */
export async function publishQuiz(env, payload) {
  const res = await fetch(`${env.QUIZ_SITE_BASE_URL}/api/quiz/admin`, {
    method: 'POST',
    headers: headers(env),
    body: JSON.stringify(payload),
  });

  if (res.status === 409) {
    return { published: false, reason: 'duplicate' };
  }
  if (!res.ok) {
    const body = await res.text();
    throw new Error(`POST /api/quiz/admin failed: ${res.status} ${body.slice(0, 500)}`);
  }
  return { published: true };
}
