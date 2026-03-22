/**
 * Cloudflare Pages Function -- Raices Medicas
 * Latest YouTube Video Feed
 *
 * Served at: raicesmedicas.health/api/latest-video
 * This is a Pages Function (not a standalone Worker) so it works
 * alongside the Cloudflare Pages deployment on the same domain.
 */

const CHANNEL_ID = "UCdjmZMIZIEd24EfV-NahQ2w";
const RSS_URL = `https://www.youtube.com/feeds/videos.xml?channel_id=${CHANNEL_ID}`;
const CACHE_TTL = 3600; // Cache for 1 hour (in seconds)

export async function onRequest(context) {
  const { request } = context;

  // Allow cross-origin requests from your own domain
  const corsHeaders = {
    "Access-Control-Allow-Origin": "https://raicesmedicas.health",
    "Access-Control-Allow-Methods": "GET, OPTIONS",
    "Content-Type": "application/json",
  };

  // Handle preflight
  if (request.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  // --- Check Cloudflare Cache first ---
  const cacheKey = new Request(RSS_URL, request);
  const cache = caches.default;
  let cachedResponse = await cache.match(cacheKey);

  if (cachedResponse) {
    // Return cached data with CORS headers added
    const cachedData = await cachedResponse.json();
    return new Response(JSON.stringify(cachedData), {
      headers: corsHeaders,
    });
  }

  // --- Fetch fresh RSS feed from YouTube ---
  let rssText;
  try {
    const rssResponse = await fetch(RSS_URL);
    if (!rssResponse.ok) {
      throw new Error(`YouTube RSS returned ${rssResponse.status}`);
    }
    rssText = await rssResponse.text();
  } catch (err) {
    return new Response(
      JSON.stringify({ error: "Failed to fetch YouTube feed", detail: err.message }),
      { status: 502, headers: corsHeaders }
    );
  }

  // --- Parse the XML to extract latest video ---
  const videoId    = extractTag(rssText, "yt:videoId");
  const title      = extractTag(rssText, "title", 1); // index 1 = first video title (index 0 is channel title)
  const published  = extractTag(rssText, "published", 1); // index 1 = first video's publish date (index 0 is channel creation date)
  const thumbnail  = extractAttr(rssText, "media:thumbnail", "url");
  const channelName = extractTag(rssText, "title", 0);

  if (!videoId) {
    return new Response(
      JSON.stringify({ error: "Could not parse video ID from feed" }),
      { status: 500, headers: corsHeaders }
    );
  }

  const payload = {
    videoId,
    title:       decodeXML(title || ""),
    published:   published || "",
    thumbnail:   thumbnail || `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`,
    embedUrl:    `https://www.youtube.com/embed/${videoId}`,
    watchUrl:    `https://www.youtube.com/watch?v=${videoId}`,
    channelName: decodeXML(channelName || "Raices Medicas"),
  };

  // --- Store result in Cloudflare Cache for 1 hour ---
  const responseToCache = new Response(JSON.stringify(payload), {
    headers: {
      "Content-Type": "application/json",
      "Cache-Control": `public, max-age=${CACHE_TTL}`,
    },
  });
  context.waitUntil(cache.put(cacheKey, responseToCache));

  return new Response(JSON.stringify(payload), { headers: corsHeaders });
}

// --- Helpers ---

/** Extract the Nth occurrence of a tag's text content from XML */
function extractTag(xml, tag, index = 0) {
  const regex = new RegExp(`<${tag}[^>]*>([\\s\\S]*?)<\\/${tag}>`, "g");
  let match;
  let count = 0;
  while ((match = regex.exec(xml)) !== null) {
    if (count === index) return match[1].trim();
    count++;
  }
  return null;
}

/** Extract an attribute value from an XML tag */
function extractAttr(xml, tag, attr) {
  const regex = new RegExp(`<${tag}[^>]*${attr}="([^"]*)"`, "i");
  const match = xml.match(regex);
  return match ? match[1] : null;
}

/** Decode basic XML entities */
function decodeXML(str) {
  return str
    .replace(/&lt;/g,   "<")
    .replace(/&gt;/g,   ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g,  "'")
    .replace(/&amp;/g,  "&");
}
