/**
 * Cloudflare Pages Function -- Raices Medicas
 * Latest YouTube Video Feed
 *
 * Served at: raicesmedicas.health/api/latest-video
 * This is a Pages Function (not a standalone Worker) so it works
 * alongside the Cloudflare Pages deployment on the same domain.
 */

const CHANNEL_ID = "UCdjmZMIZIEd24EfV-NahQ2w";
// UULF plus the channel ID without the UC prefix is the automatic long-form-only playlist, so no Shorts
const LONG_FORM_PLAYLIST_ID = "UULF" + CHANNEL_ID.slice(2);
const RSS_URL = `https://www.youtube.com/feeds/videos.xml?playlist_id=${LONG_FORM_PLAYLIST_ID}`;
const CHANNEL_VIDEOS_URL = "https://www.youtube.com/@raicesmedicas/videos";
const CACHE_TTL = 3600; // Cache for 1 hour (in seconds)
const BROWSER_HEADERS = {
  "User-Agent":
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36",
  "Accept-Language": "es-MX,es;q=0.9,en;q=0.8",
  Cookie: "CONSENT=YES+1; SOCS=CAI",
};

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

  // --- Fetch latest video: RSS feed first, channel page as fallback ---
  const errors = [];
  let video = null;
  try {
    video = await fetchFromRss();
  } catch (err) {
    errors.push(`rss: ${err.message}`);
  }
  if (!video) {
    try {
      video = await fetchFromChannelPage();
    } catch (err) {
      errors.push(`channel: ${err.message}`);
    }
  }

  if (!video) {
    return new Response(
      JSON.stringify({ error: "Failed to fetch YouTube feed", detail: errors.join("; ") }),
      { status: 502, headers: corsHeaders }
    );
  }

  const payload = {
    videoId:     video.videoId,
    title:       video.title,
    published:   video.published,
    thumbnail:   video.thumbnail || `https://i.ytimg.com/vi/${video.videoId}/hqdefault.jpg`,
    embedUrl:    `https://www.youtube.com/embed/${video.videoId}`,
    watchUrl:    `https://www.youtube.com/watch?v=${video.videoId}`,
    channelName: video.channelName || "Raices Medicas",
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

// --- Sources ---

async function fetchFromRss() {
  const res = await fetch(RSS_URL, { headers: BROWSER_HEADERS });
  if (!res.ok) throw new Error(`YouTube RSS returned ${res.status}`);
  const xml = await res.text();
  const videoId = extractTag(xml, "yt:videoId");
  if (!videoId) throw new Error("Could not parse video ID from feed");
  return {
    videoId,
    title:       decodeXML(extractTag(xml, "title", 1) || ""), // index 0 is the channel title
    published:   extractTag(xml, "published", 1) || "",       // index 0 is the channel creation date
    thumbnail:   extractAttr(xml, "media:thumbnail", "url"),
    channelName: decodeXML(extractTag(xml, "name", 0) || ""),
  };
}

async function fetchFromChannelPage() {
  const res = await fetch(CHANNEL_VIDEOS_URL, { headers: BROWSER_HEADERS });
  if (!res.ok) throw new Error(`YouTube channel page returned ${res.status}`);
  const html = await res.text();
  const start = html.indexOf('"richItemRenderer":{');
  if (start === -1) throw new Error("Could not find video list on channel page");
  const item = html.slice(start, start + 20000);
  const idMatch =
    item.match(/"videoId":"([A-Za-z0-9_-]{11})"/) ||
    item.match(/i\.ytimg\.com\/vi(?:_webp)?\/([A-Za-z0-9_-]{11})\//);
  if (!idMatch) throw new Error("Could not parse video ID from channel page");
  const videoId = idMatch[1];
  const titleMatch =
    item.match(/"lockupMetadataViewModel":\{"title":\{"content":"((?:[^"\\]|\\.)*)"/) ||
    item.match(/"title":\{"runs":\[\{"text":"((?:[^"\\]|\\.)*)"/);
  const channelMatch = html.match(/<meta property="og:title" content="([^"]*)"/);
  return {
    videoId,
    title:       titleMatch ? decodeJSONString(titleMatch[1]) : "",
    published:   "", // the channel page only exposes relative dates ("hace 2 días")
    thumbnail:   null,
    channelName: channelMatch ? decodeXML(channelMatch[1]) : "",
  };
}

// --- Helpers ---

/** Decode the escaped contents of a JSON string literal */
function decodeJSONString(str) {
  try {
    return JSON.parse(`"${str}"`);
  } catch {
    return str;
  }
}

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
