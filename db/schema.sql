-- Quiz de la Semana — D1 Schema
-- Run against the Cloudflare D1 database bound as QUIZ_DB

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
