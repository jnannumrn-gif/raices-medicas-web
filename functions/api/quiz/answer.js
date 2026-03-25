/**
 * Cloudflare Pages Function — Quiz de la Semana
 * POST /api/quiz/answer
 *
 * User submits one answer at a time.
 * Uses D1 database binding: QUIZ_DB
 */

export async function onRequestPost(context) {
  const { request, env } = context;

  const headers = {
    "Content-Type": "application/json",
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
  };

  try {
    const body = await request.json();
    const { quiz_id, question_id, selected_index } = body;

    if (quiz_id == null || question_id == null || selected_index == null) {
      return new Response(
        JSON.stringify({ error: "Missing required fields: quiz_id, question_id, selected_index" }),
        { status: 400, headers }
      );
    }

    if (selected_index < 0 || selected_index > 3) {
      return new Response(
        JSON.stringify({ error: "selected_index must be 0-3" }),
        { status: 400, headers }
      );
    }

    // Look up the question
    const question = await env.QUIZ_DB.prepare(
      "SELECT id, correct_index, explanation FROM quiz_questions WHERE id = ? AND quiz_id = ?"
    ).bind(question_id, quiz_id).first();

    if (!question) {
      return new Response(
        JSON.stringify({ error: "Question not found" }),
        { status: 404, headers }
      );
    }

    const is_correct = selected_index === question.correct_index ? 1 : 0;

    // Record the response
    await env.QUIZ_DB.prepare(
      "INSERT INTO quiz_responses (quiz_id, question_id, selected_index, is_correct) VALUES (?, ?, ?, ?)"
    ).bind(quiz_id, question_id, selected_index, is_correct).run();

    // Get updated stats for this question
    const stats = await env.QUIZ_DB.prepare(
      "SELECT COUNT(*) as total_answers, SUM(is_correct) as correct_count FROM quiz_responses WHERE question_id = ? AND quiz_id = ?"
    ).bind(question_id, quiz_id).first();

    const payload = {
      is_correct: is_correct === 1,
      correct_index: question.correct_index,
      explanation: question.explanation,
      stats: {
        total_answers: stats.total_answers,
        correct_pct: stats.total_answers > 0 ? Math.round((stats.correct_count / stats.total_answers) * 100) : 0,
      },
    };

    return new Response(JSON.stringify(payload), { headers });
  } catch (err) {
    return new Response(
      JSON.stringify({ error: "Failed to submit answer", detail: err.message }),
      { status: 500, headers }
    );
  }
}

export async function onRequestOptions() {
  return new Response(null, {
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
    },
  });
}
