/**
 * Cloudflare Pages Function — SMS/WhatsApp opt-in consent
 * POST /api/sms-optin
 *
 * Stores proof of consent for the A2P 10DLC registration. This endpoint
 * ONLY writes a consent record — it never sends any SMS/WhatsApp message
 * and never talks to Twilio or WhatsApp.
 *
 * Uses D1 database binding: QUIZ_DB (table: sms_consents, see db/sms_consents.sql)
 */

const VALID_LANGUAGES = ["es", "en", "pt"];

// Canonical consent copy per language. The server — not the client — decides
// which text is stored, so a tampered request body can't forge consent text.
const CONSENT_TEXT = {
  es: "Acepto recibir mensajes de texto (SMS) y de WhatsApp de Ra\u00edces M\u00e9dicas LLC con contenido educativo sobre salud renal y avisos de contenido nuevo del sitio. La frecuencia de los mensajes var\u00eda. Pueden aplicar tarifas de mensajes y datos. Responda STOP para cancelar o HELP para ayuda. El consentimiento no es condici\u00f3n para usar el sitio ni recibir ning\u00fan servicio.",
  en: "I agree to receive text messages (SMS) and WhatsApp messages from Ra\u00edces M\u00e9dicas LLC with educational content about kidney health and notices about new content on the site. Message frequency varies. Message and data rates may apply. Reply STOP to cancel or HELP for help. Consent is not a condition of using the site or receiving any service.",
  pt: "Concordo em receber mensagens de texto (SMS) e mensagens de WhatsApp da Ra\u00edces M\u00e9dicas LLC com conte\u00fado educativo sobre sa\u00fade renal e avisos de novo conte\u00fado do site. A frequ\u00eancia das mensagens varia. Podem ser aplicadas tarifas de mensagens e dados. Responda STOP para cancelar ou HELP para ajuda. O consentimento n\u00e3o \u00e9 condi\u00e7\u00e3o para usar o site nem para receber nenhum servi\u00e7o.",
};

const JSON_HEADERS = {
  "Content-Type": "application/json",
  "Cache-Control": "no-store",
};

/**
 * Validates a phone number that the client has already assembled into E.164
 * (+ and digits only). The country code always comes from the form's country
 * selector — the server never guesses or defaults a country code. Mirrors
 * the client-side logic in mensajes.html — keep both in sync if this changes.
 *
 * Rules: +1 numbers must have exactly 10 national digits; +55 (Brazil)
 * numbers must have 10 or 11 national digits; any other country code must
 * total 8-15 digits after the +.
 */
function isValidPhoneE164(raw) {
  const e164 = String(raw || "").trim();

  if (/^\+1\d{10}$/.test(e164)) return true;
  if (e164.indexOf("+1") === 0) return false;

  if (/^\+55\d{10}$/.test(e164) || /^\+55\d{11}$/.test(e164)) return true;
  if (e164.indexOf("+55") === 0) return false;

  return /^\+[1-9]\d{7,14}$/.test(e164);
}

export async function onRequestPost(context) {
  const { request, env } = context;

  let body;
  try {
    body = await request.json();
  } catch (e) {
    return new Response(JSON.stringify({ error: "Invalid request" }), {
      status: 400,
      headers: JSON_HEADERS,
    });
  }

  // Honeypot: real visitors never fill this hidden field. Pretend success
  // so bots don't learn anything, but don't write a row.
  if (body && typeof body.website === "string" && body.website.trim() !== "") {
    return new Response(JSON.stringify({ success: true }), { headers: JSON_HEADERS });
  }

  if (body.consent !== true) {
    return new Response(JSON.stringify({ error: "Consent is required" }), {
      status: 400,
      headers: JSON_HEADERS,
    });
  }

  const phoneE164 = String(body.phone || "").trim();
  if (!isValidPhoneE164(phoneE164)) {
    return new Response(JSON.stringify({ error: "Invalid phone number" }), {
      status: 400,
      headers: JSON_HEADERS,
    });
  }

  const language = VALID_LANGUAGES.indexOf(body.language) !== -1 ? body.language : "es";
  const consentText = CONSENT_TEXT[language];
  const consentedAt = new Date().toISOString();
  const sourceUrl = request.headers.get("Referer") || new URL(request.url).origin + "/mensajes.html";
  const ip = request.headers.get("CF-Connecting-IP") || "";
  const userAgent = request.headers.get("User-Agent") || "";

  try {
    const existing = await env.QUIZ_DB.prepare(
      "SELECT id FROM sms_consents WHERE phone_e164 = ?"
    ).bind(phoneE164).first();

    if (!existing) {
      await env.QUIZ_DB.prepare(
        "INSERT INTO sms_consents (phone_e164, consent_text, language, consented_at, source_url, ip, user_agent) VALUES (?, ?, ?, ?, ?, ?, ?)"
      ).bind(phoneE164, consentText, language, consentedAt, sourceUrl, ip, userAgent).run();
    }

    return new Response(JSON.stringify({ success: true }), { headers: JSON_HEADERS });
  } catch (err) {
    // Never log the phone number or request body — only the error itself.
    console.error("sms-optin D1 error:", err && err.stack ? err.stack : err);
    return new Response(JSON.stringify({ error: "Could not save consent" }), {
      status: 500,
      headers: JSON_HEADERS,
    });
  }
}
