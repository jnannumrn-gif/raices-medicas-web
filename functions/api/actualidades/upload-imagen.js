/**
 * Cloudflare Pages Function — Image Upload to R2
 *
 * POST /api/actualidades/upload-imagen
 * Accepts multipart/form-data with a file field named "imagen"
 * Stores the image in R2 and returns the public URL
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
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, X-Admin-Password',
      },
    });
  }

  var corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Content-Type': 'application/json',
  };

  if (method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: corsHeaders,
    });
  }

  // Authenticate
  var password = request.headers.get('X-Admin-Password') || '';
  var expected = env.QUIZ_ADMIN_PASSWORD || '';
  if (!expected || password !== expected) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), {
      status: 401,
      headers: corsHeaders,
    });
  }

  try {
    var formData = await request.formData();
    var file = formData.get('imagen');

    if (!file || !file.name) {
      return new Response(JSON.stringify({ error: 'No image file provided. Use field name "imagen".' }), {
        status: 400,
        headers: corsHeaders,
      });
    }

    // Validate file type
    var allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
    if (allowedTypes.indexOf(file.type) === -1) {
      return new Response(JSON.stringify({ error: 'Invalid file type. Allowed: JPG, PNG, WebP, GIF' }), {
        status: 400,
        headers: corsHeaders,
      });
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      return new Response(JSON.stringify({ error: 'File too large. Maximum 5MB.' }), {
        status: 400,
        headers: corsHeaders,
      });
    }

    // Generate unique filename
    var ext = file.name.split('.').pop().toLowerCase();
    var timestamp = Date.now();
    var randomSuffix = Math.random().toString(36).substring(2, 8);
    var key = 'actualidades/' + timestamp + '-' + randomSuffix + '.' + ext;

    // Upload to R2
    var arrayBuffer = await file.arrayBuffer();
    await env.MEDIA_BUCKET.put(key, arrayBuffer, {
      httpMetadata: {
        contentType: file.type,
      },
    });

    // Build public URL — uses the R2 custom domain or public bucket URL
    // The public URL pattern depends on the R2 bucket's public access configuration
    var publicUrl = '/media/' + key;

    return new Response(JSON.stringify({
      success: true,
      url: publicUrl,
      key: key,
      message: 'Image uploaded successfully',
    }), {
      status: 201,
      headers: corsHeaders,
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: 'Upload error: ' + err.message }), {
      status: 500,
      headers: corsHeaders,
    });
  }
}
