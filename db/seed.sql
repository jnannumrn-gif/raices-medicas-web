-- Seed Data — First Quiz (Week of March 24, 2026)

INSERT INTO quizzes (week_start, subtitle) VALUES ('2026-03-24', 'Semana del 24 de marzo · Salud Renal');

INSERT INTO quiz_questions (quiz_id, position, question, option_a, option_b, option_c, option_d, correct_index, explanation) VALUES
(1, 1,
  '¿Cuál es la causa número uno de enfermedad renal crónica en los Estados Unidos?',
  'Presión arterial alta', 'Diabetes', 'Infecciones frecuentes', 'Consumo de ibuprofeno',
  1,
  'La diabetes es responsable de aproximadamente el 38% de todos los casos nuevos de enfermedad renal crónica en EE.UU. Mantener el azúcar en sangre bajo control es clave para proteger los riñones.'
),
(1, 2,
  '¿Con cuántos riñones puede vivir una persona una vida normal y saludable?',
  'Solo con dos', 'Con uno solo', 'Con ninguno (con diálisis)', 'Depende de la edad',
  1,
  'Una persona puede vivir perfectamente con un solo riñón. Por eso miles de personas donan un riñón a familiares o desconocidos cada año — es un acto de vida.'
),
(1, 3,
  '¿Cuál de estas señales puede indicar que los riñones no están funcionando bien?',
  'Dolor de cabeza frecuente', 'Visión borrosa', 'Espuma en la orina', 'Pérdida del apetito',
  2,
  'La espuma en la orina puede ser señal de proteinuria — proteína que se filtra a la orina cuando los riñones están dañados. Es uno de los primeros síntomas de enfermedad renal y muchas veces se ignora.'
);
