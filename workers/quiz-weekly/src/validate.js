/**
 * Validates the shape the model produced against exactly what
 * POST /api/quiz/admin requires. Returns { ok: true } or { ok: false, error }.
 */
export function validateGeneratedQuiz(generated) {
  if (!generated || typeof generated !== 'object') {
    return { ok: false, error: 'La respuesta del modelo no es un objeto' };
  }
  if (!generated.subtitle || typeof generated.subtitle !== 'string') {
    return { ok: false, error: 'Falta subtitle o no es texto' };
  }
  if (!Array.isArray(generated.questions) || generated.questions.length !== 3) {
    return { ok: false, error: 'Se requieren exactamente 3 preguntas' };
  }

  for (let i = 0; i < generated.questions.length; i++) {
    const q = generated.questions[i];
    const n = i + 1;
    for (const field of ['question', 'option_a', 'option_b', 'option_c', 'option_d', 'explanation']) {
      if (!q[field] || typeof q[field] !== 'string' || !q[field].trim()) {
        return { ok: false, error: `Pregunta ${n}: falta el campo "${field}"` };
      }
    }
    if (!Number.isInteger(q.correct_index) || q.correct_index < 0 || q.correct_index > 3) {
      return { ok: false, error: `Pregunta ${n}: correct_index debe ser un entero 0-3` };
    }
  }

  return { ok: true };
}

/** Converts a validated generated-quiz object into the POST /api/quiz/admin body shape. */
export function toPublishPayload(draft) {
  return {
    week_start: draft.week_start,
    subtitle: draft.subtitle,
    questions: draft.questions.map((q, i) => ({
      position: i + 1,
      question: q.question,
      option_a: q.option_a,
      option_b: q.option_b,
      option_c: q.option_c,
      option_d: q.option_d,
      correct_index: q.correct_index,
      explanation: q.explanation,
    })),
  };
}
