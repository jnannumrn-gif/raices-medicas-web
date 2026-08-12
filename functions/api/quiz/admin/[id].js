/**
 * Cloudflare Pages Function — Quiz de la Semana (admin)
 * GET /api/quiz/admin/:id
 *
 * Returns the full detail of one quiz, including each question's options,
 * correct_index and explanation. Read-only, for auditing published quizzes.
 * Auth: X-Admin-Password header, same as /api/quiz/admin.
 * Uses D1 database binding: QUIZ_DB
 */

import { adminHeaders, isAuthorized, unauthorized, databaseError } from '../_admin.js';

export async function onRequestGet(context) {
  const { request, env, params } = context;

  const headers = adminHeaders(request);

  if (!isAuthorized(request, env)) {
    return unauthorized(headers);
  }

  const id = Number(params.id);
  if (!Number.isInteger(id) || id <= 0) {
    return new Response(JSON.stringify({ error: 'Invalid quiz id' }), {
      status: 400,
      headers,
    });
  }

  const db = env.QUIZ_DB;

  try {
    const quiz = await db.prepare(
      'SELECT id, week_start, subtitle, active FROM quizzes WHERE id = ?'
    ).bind(id).first();

    if (!quiz) {
      return new Response(JSON.stringify({ error: 'Quiz not found' }), {
        status: 404,
        headers,
      });
    }

    const { results: questions } = await db.prepare(
      'SELECT id, position, question, option_a, option_b, option_c, option_d, correct_index, explanation FROM quiz_questions WHERE quiz_id = ? ORDER BY position ASC'
    ).bind(id).all();

    const payload = {
      id: quiz.id,
      week_start: quiz.week_start,
      subtitle: quiz.subtitle,
      active: quiz.active,
      question_count: questions.length,
      questions: questions.map(function (q) {
        return {
          id: q.id,
          position: q.position,
          question: q.question,
          option_a: q.option_a,
          option_b: q.option_b,
          option_c: q.option_c,
          option_d: q.option_d,
          options: [q.option_a, q.option_b, q.option_c, q.option_d],
          correct_index: q.correct_index,
          correct_option: ['A', 'B', 'C', 'D'][q.correct_index] || null,
          explanation: q.explanation,
        };
      }),
    };

    return new Response(JSON.stringify(payload), { headers });
  } catch (err) {
    return databaseError(err, headers);
  }
}

export async function onRequestOptions(context) {
  return new Response(null, {
    headers: adminHeaders(context.request, {
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, X-Admin-Password',
    }),
  });
}
