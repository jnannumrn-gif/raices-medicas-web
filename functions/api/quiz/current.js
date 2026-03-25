/**
 * Cloudflare Pages Function — Quiz de la Semana
 * GET /api/quiz/current
 *
 * Returns the active quiz for the current week.
 * Uses D1 database binding: QUIZ_DB
 */

export async function onRequestGet(context) {
  const { env } = context;

  const headers = {
    "Content-Type": "application/json",
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, OPTIONS",
    "Cache-Control": "no-cache",
  };

  try {
    const today = new Date().toISOString().slice(0, 10);

    // Find the active quiz where week_start <= today
    const quiz = await env.QUIZ_DB.prepare(
      "SELECT id, week_start, subtitle FROM quizzes WHERE week_start <= ? AND active = 1 ORDER BY week_start DESC LIMIT 1"
    ).bind(today).first();

    if (!quiz) {
      return new Response(
        JSON.stringify({ error: "No active quiz this week" }),
        { status: 404, headers }
      );
    }

    // Fetch questions for this quiz
    const { results: questions } = await env.QUIZ_DB.prepare(
      "SELECT id, position, question, option_a, option_b, option_c, option_d FROM quiz_questions WHERE quiz_id = ? ORDER BY position ASC"
    ).bind(quiz.id).all();

    // Fetch aggregate stats per question
    const { results: stats } = await env.QUIZ_DB.prepare(
      "SELECT question_id, COUNT(*) as total_answers, SUM(is_correct) as correct_count FROM quiz_responses WHERE quiz_id = ? GROUP BY question_id"
    ).bind(quiz.id).all();

    const statsMap = {};
    for (const s of stats) {
      statsMap[s.question_id] = {
        total_answers: s.total_answers,
        correct_pct: s.total_answers > 0 ? Math.round((s.correct_count / s.total_answers) * 100) : 0,
      };
    }

    const payload = {
      quiz_id: quiz.id,
      subtitle: quiz.subtitle,
      questions: questions.map((q) => ({
        id: q.id,
        position: q.position,
        question: q.question,
        options: [q.option_a, q.option_b, q.option_c, q.option_d],
        stats: statsMap[q.id] || { total_answers: 0, correct_pct: 0 },
      })),
    };

    return new Response(JSON.stringify(payload), { headers });
  } catch (err) {
    return new Response(
      JSON.stringify({ error: "Failed to load quiz", detail: err.message }),
      { status: 500, headers }
    );
  }
}

export async function onRequestOptions() {
  return new Response(null, {
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
    },
  });
}
