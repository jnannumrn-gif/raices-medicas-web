-- Raíces Médicas — SMS/WhatsApp opt-in consent log
-- Run against the Cloudflare D1 database bound as QUIZ_DB (same database
-- used by the rest of the site; see db/schema.sql).
--
-- This table is ONLY a consent record for the A2P 10DLC registration. It is
-- never read by any public endpoint, and the application must never log the
-- phone_e164 value to console/logs.

CREATE TABLE IF NOT EXISTS sms_consents (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  phone_e164 TEXT NOT NULL UNIQUE,   -- E.164 format, e.g. "+18095551234"
  consent_text TEXT NOT NULL,        -- exact consent copy shown to the user
  language TEXT NOT NULL,            -- "es" | "en" | "pt"
  consented_at TEXT NOT NULL,        -- ISO 8601 UTC timestamp of consent
  source_url TEXT,                   -- page the form was submitted from
  ip TEXT,                           -- CF-Connecting-IP at submission time
  user_agent TEXT,                   -- browser User-Agent at submission time
  created_at TEXT DEFAULT (datetime('now'))
);

-- phone_e164 UNIQUE above already creates a unique index in SQLite/D1; this
-- explicit statement is kept for clarity and so it survives a future column
-- change that drops the inline UNIQUE constraint.
CREATE UNIQUE INDEX IF NOT EXISTS idx_sms_consents_phone ON sms_consents(phone_e164);
