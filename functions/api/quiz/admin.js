export async function onRequest(context) {
  const { request, env } = context;
  const method = request.method;

  // Handle CORS preflight
  if (method === 'OPTIONS') {
    return new Response(null, {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, X-Admin-Password',
      },
    });
  }

  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Content-Type': 'application/json',
  };

  // Authenticate
  const password = request.headers.get('X-Admin-Password') || '';
  const expected = env.QUIZ_ADMIN_PASSWORD || '';
  if (!expected || password !== expected) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), {
      status: 401,
      headers: corsHeaders,
    });
  }

  const db = env.QUIZ_DB;

  if (method === 'GET') {
    return handleGet(db, corsHeaders);
  }

  if (method === 'POST') {
    return handlePost(db, request, corsHeaders);
  }

  return new Response(JSON.stringify({ error: 'Method not allowed' }), {
    status: 405,
    headers: corsHeaders,
  });
}

async function handleGet(db, headers) {
  try {
    const result = await db.prepare(`
      SELECT q.id, q.week_start, q.subtitle, q.active,
        (SELECT COUNT(*) FROM quiz_questions WHERE quiz_id = q.id) AS question_count
      FROM quizzes q
      ORDER BY q.week_start DESC
    `).all();

    return new Response(JSON.stringify({ quizzes: result.results }), { headers });
  } catch (err) {
    return new Response(JSON.stringify({ error: 'Database error: ' + err.message }), {
      status: 500,
      headers,
    });
  }
}

async function handlePost(db, request, headers) {
  let body;
  try {
    body = await request.json();
  } catch (e) {
    return new Response(JSON.stringify({ error: 'Invalid JSON' }), {
      status: 400,
      headers,
    });
  }

  const { week_start, subtitle, questions } = body;

  // Validate
  if (!week_start || !subtitle) {
    return new Response(JSON.stringify({ error: 'week_start and subtitle are required' }), {
      status: 400,
      headers,
    });
  }

  if (!Array.isArray(questions) || questions.length !== 3) {
    return new Response(JSON.stringify({ error: 'Exactly 3 questions are required' }), {
      status: 400,
      headers,
    });
  }

  for (let i = 0; i < questions.length; i++) {
    const q = questions[i];
    if (!q.question || !q.option_a || !q.option_b || !q.option_c || !q.option_d || q.correct_index == null || !q.explanation) {
      return new Response(JSON.stringify({ error: 'Question ' + (i + 1) + ' is missing required fields' }), {
        status: 400,
        headers,
      });
    }
    if (!Number.isInteger(q.correct_index) || q.correct_index < 0 || q.correct_index > 3) {
      return new Response(JSON.stringify({ error: 'Question ' + (i + 1) + ' correct_index must be 0-3' }), {
        status: 400,
        headers,
      });
    }
  }

  try {
    // Check if quiz for this week already exists
    const existing = await db.prepare('SELECT id FROM quizzes WHERE week_start = ?').bind(week_start).first();
    if (existing) {
      return new Response(JSON.stringify({ error: 'A quiz for week ' + week_start + ' already exists' }), {
        status: 409,
        headers,
      });
    }

    // Insert quiz + all questions in a single db.batch() for true atomicity.
    // Question inserts use a subquery to resolve the quiz_id by week_start.
    const quizStmt = db.prepare(
      'INSERT INTO quizzes (week_start, subtitle) VALUES (?, ?)'
    ).bind(week_start, subtitle);

    const questionStmts = questions.map(function(q, i) {
      return db.prepare(
        'INSERT INTO quiz_questions (quiz_id, position, question, option_a, option_b, option_c, option_d, correct_index, explanation) VALUES ((SELECT id FROM quizzes WHERE week_start = ?), ?, ?, ?, ?, ?, ?, ?, ?)'
      ).bind(
        week_start,
        q.position || (i + 1),
        q.question,
        q.option_a,
        q.option_b,
        q.option_c,
        q.option_d,
        q.correct_index,
        q.explanation
      );
    });

    const results = await db.batch([quizStmt, ...questionStmts]);
    const quizId = results[0].meta.last_row_id;

    return new Response(JSON.stringify({
      success: true,
      quiz_id: quizId,
      week_start: week_start,
      message: 'Quiz created successfully with 3 questions',
    }), {
      status: 201,
      headers,
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: 'Database error: ' + err.message }), {
      status: 500,
      headers,
    });
  }
}
