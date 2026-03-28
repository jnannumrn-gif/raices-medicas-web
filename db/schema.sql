-- Raíces Médicas — D1 Schema
-- Run against the Cloudflare D1 database bound as QUIZ_DB

-- ============================================================
-- Quiz de la Semana
-- ============================================================

CREATE TABLE IF NOT EXISTS quizzes (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  week_start TEXT NOT NULL UNIQUE,  -- ISO date of Monday, e.g. "2026-03-24"
  subtitle TEXT NOT NULL,           -- e.g. "Semana del 24 de marzo · Salud Renal"
  active INTEGER DEFAULT 1
);

CREATE TABLE IF NOT EXISTS quiz_questions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  quiz_id INTEGER NOT NULL REFERENCES quizzes(id),
  position INTEGER NOT NULL,        -- 1, 2, or 3
  question TEXT NOT NULL,
  option_a TEXT NOT NULL,
  option_b TEXT NOT NULL,
  option_c TEXT NOT NULL,
  option_d TEXT NOT NULL,
  correct_index INTEGER NOT NULL,   -- 0=A, 1=B, 2=C, 3=D
  explanation TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS quiz_responses (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  quiz_id INTEGER NOT NULL REFERENCES quizzes(id),
  question_id INTEGER NOT NULL REFERENCES quiz_questions(id),
  selected_index INTEGER NOT NULL,
  is_correct INTEGER NOT NULL,      -- 1 or 0
  created_at TEXT DEFAULT (datetime('now'))
);

-- ============================================================
-- Actualidades de Salud Renal
-- ============================================================

CREATE TABLE IF NOT EXISTS actualidades (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  titulo TEXT NOT NULL,
  fuente TEXT NOT NULL,                -- NKF, WHO, NIDDK, KDIGO, etc.
  url_original TEXT NOT NULL,          -- External article URL
  categoria TEXT NOT NULL,             -- Prevención, Nutrición Renal, Diálisis, Investigación, Comunidad
  autor TEXT NOT NULL DEFAULT 'Equipo Raíces Médicas',
  resumen TEXT NOT NULL,               -- 2-3 sentence summary in Spanish
  contenido_completo TEXT,             -- NULL for now — future full articles
  imagen_url TEXT,                     -- R2 public URL (optional)
  numero_edicion INTEGER,              -- NULL for now — future magazine numbering
  fecha_publicacion TEXT NOT NULL,     -- ISO date, e.g. "2026-03-27"
  activo INTEGER DEFAULT 1,           -- 1 = visible, 0 = hidden
  created_at TEXT DEFAULT (datetime('now'))
);
