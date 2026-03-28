/**
 * Cloudflare Pages Function — Actualidades de Salud Renal
 *
 * GET  /api/actualidades          → list active entries (public)
 * POST /api/actualidades          → create new entry (admin)
 * PUT  /api/actualidades          → update entry (admin, id in body)
 * DELETE /api/actualidades        → deactivate entry (admin, id in body)
 *
 * Query params (GET):
 *   ?categoria=Prevención   → filter by category
 *   ?page=1&limit=10        → pagination
 */

export async function onRequest(context) {
  var request = context.request;
  var env = context.env;
  var method = request.method;

  // CORS preflight
  if (method === 'OPTIONS') {
    return new Response(null, {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, X-Admin-Password',
      },
    });
  }

  var corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Content-Type': 'application/json',
  };

  var db = env.QUIZ_DB;

  if (method === 'GET') {
    return handleGet(db, request, corsHeaders);
  }

  // Admin-only methods
  var password = request.headers.get('X-Admin-Password') || '';
  var expected = env.QUIZ_ADMIN_PASSWORD || '';
  if (!expected || password !== expected) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), {
      status: 401,
      headers: corsHeaders,
    });
  }

  if (method === 'POST') {
    return handlePost(db, request, corsHeaders);
  }

  if (method === 'PUT') {
    return handlePut(db, request, corsHeaders);
  }

  if (method === 'DELETE') {
    return handleDelete(db, request, corsHeaders);
  }

  return new Response(JSON.stringify({ error: 'Method not allowed' }), {
    status: 405,
    headers: corsHeaders,
  });
}

async function handleGet(db, request, headers) {
  try {
    var url = new URL(request.url);
    var categoria = url.searchParams.get('categoria') || '';
    var page = parseInt(url.searchParams.get('page'), 10) || 1;
    var limit = parseInt(url.searchParams.get('limit'), 10) || 10;
    if (limit > 50) limit = 50;
    if (page < 1) page = 1;
    var offset = (page - 1) * limit;

    var countQuery = 'SELECT COUNT(*) as total FROM actualidades WHERE activo = 1';
    var dataQuery = 'SELECT id, titulo, fuente, url_original, categoria, autor, resumen, imagen_url, numero_edicion, fecha_publicacion, created_at FROM actualidades WHERE activo = 1';

    if (categoria) {
      countQuery += ' AND categoria = ?';
      dataQuery += ' AND categoria = ?';
    }

    dataQuery += ' ORDER BY fecha_publicacion DESC, id DESC LIMIT ? OFFSET ?';

    var countResult;
    var dataResult;

    if (categoria) {
      countResult = await db.prepare(countQuery).bind(categoria).first();
      dataResult = await db.prepare(dataQuery).bind(categoria, limit, offset).all();
    } else {
      countResult = await db.prepare(countQuery).first();
      dataResult = await db.prepare(dataQuery).bind(limit, offset).all();
    }

    var total = countResult.total || 0;
    var totalPages = Math.ceil(total / limit);

    return new Response(JSON.stringify({
      entries: dataResult.results,
      pagination: {
        page: page,
        limit: limit,
        total: total,
        totalPages: totalPages,
      },
    }), { headers: headers });
  } catch (err) {
    return new Response(JSON.stringify({ error: 'Database error: ' + err.message }), {
      status: 500,
      headers: headers,
    });
  }
}

async function handlePost(db, request, headers) {
  var body;
  try {
    body = await request.json();
  } catch (e) {
    return new Response(JSON.stringify({ error: 'Invalid JSON' }), {
      status: 400,
      headers: headers,
    });
  }

  var titulo = (body.titulo || '').trim();
  var fuente = (body.fuente || '').trim();
  var url_original = (body.url_original || '').trim();
  var categoria = (body.categoria || '').trim();
  var autor = (body.autor || 'Equipo Raíces Médicas').trim();
  var resumen = (body.resumen || '').trim();
  var imagen_url = (body.imagen_url || '').trim() || null;
  var numero_edicion = body.numero_edicion != null ? body.numero_edicion : null;
  var fecha_publicacion = (body.fecha_publicacion || '').trim();

  if (!titulo || !fuente || !url_original || !categoria || !resumen || !fecha_publicacion) {
    return new Response(JSON.stringify({ error: 'Missing required fields: titulo, fuente, url_original, categoria, resumen, fecha_publicacion' }), {
      status: 400,
      headers: headers,
    });
  }

  try {
    var result = await db.prepare(
      'INSERT INTO actualidades (titulo, fuente, url_original, categoria, autor, resumen, imagen_url, numero_edicion, fecha_publicacion) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)'
    ).bind(titulo, fuente, url_original, categoria, autor, resumen, imagen_url, numero_edicion, fecha_publicacion).run();

    return new Response(JSON.stringify({
      success: true,
      id: result.meta.last_row_id,
      message: 'Entry created successfully',
    }), {
      status: 201,
      headers: headers,
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: 'Database error: ' + err.message }), {
      status: 500,
      headers: headers,
    });
  }
}

async function handlePut(db, request, headers) {
  var body;
  try {
    body = await request.json();
  } catch (e) {
    return new Response(JSON.stringify({ error: 'Invalid JSON' }), {
      status: 400,
      headers: headers,
    });
  }

  var id = body.id;
  if (!id) {
    return new Response(JSON.stringify({ error: 'id is required' }), {
      status: 400,
      headers: headers,
    });
  }

  // Build dynamic update
  var fields = [];
  var values = [];
  var allowedFields = ['titulo', 'fuente', 'url_original', 'categoria', 'autor', 'resumen', 'imagen_url', 'numero_edicion', 'fecha_publicacion', 'activo'];

  for (var i = 0; i < allowedFields.length; i++) {
    var field = allowedFields[i];
    if (body[field] !== undefined) {
      fields.push(field + ' = ?');
      values.push(body[field]);
    }
  }

  if (fields.length === 0) {
    return new Response(JSON.stringify({ error: 'No fields to update' }), {
      status: 400,
      headers: headers,
    });
  }

  values.push(id);

  try {
    var stmt = db.prepare('UPDATE actualidades SET ' + fields.join(', ') + ' WHERE id = ?');
    await stmt.bind.apply(stmt, values).run();

    return new Response(JSON.stringify({
      success: true,
      message: 'Entry updated successfully',
    }), { headers: headers });
  } catch (err) {
    return new Response(JSON.stringify({ error: 'Database error: ' + err.message }), {
      status: 500,
      headers: headers,
    });
  }
}

async function handleDelete(db, request, headers) {
  var body;
  try {
    body = await request.json();
  } catch (e) {
    return new Response(JSON.stringify({ error: 'Invalid JSON' }), {
      status: 400,
      headers: headers,
    });
  }

  var id = body.id;
  if (!id) {
    return new Response(JSON.stringify({ error: 'id is required' }), {
      status: 400,
      headers: headers,
    });
  }

  try {
    await db.prepare('UPDATE actualidades SET activo = 0 WHERE id = ?').bind(id).run();
    return new Response(JSON.stringify({
      success: true,
      message: 'Entry deactivated successfully',
    }), { headers: headers });
  } catch (err) {
    return new Response(JSON.stringify({ error: 'Database error: ' + err.message }), {
      status: 500,
      headers: headers,
    });
  }
}
