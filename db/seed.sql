-- Seed Data — Raíces Médicas

-- ============================================================
-- Quiz: First Quiz (Week of March 24, 2026)
-- ============================================================

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

-- ============================================================
-- Quiz: Week of April 14, 2026 — Fallo Renal
-- ============================================================

INSERT INTO quizzes (week_start, subtitle) VALUES ('2026-04-14', 'Semana del 14 de abril · Fallo Renal');

INSERT INTO quiz_questions (quiz_id, position, question, option_a, option_b, option_c, option_d, correct_index, explanation) VALUES
((SELECT id FROM quizzes WHERE week_start = '2026-04-14'), 1,
  '¿Cuál es la diferencia principal entre la insuficiencia renal aguda y la crónica?',
  'La aguda solo afecta un riñón', 'La crónica se cura con antibióticos', 'La aguda aparece de forma súbita y puede ser reversible', 'No hay diferencia clínica real',
  2,
  'La insuficiencia renal aguda (IRA) se desarrolla en horas o días — frecuentemente por deshidratación severa, medicamentos nefrotóxicos o sepsis — y puede ser reversible si se trata a tiempo. La crónica (ERC) es un deterioro progresivo e irreversible que ocurre a lo largo de meses o años.'
),
((SELECT id FROM quizzes WHERE week_start = '2026-04-14'), 2,
  '¿Qué sustancia en la sangre se eleva cuando los riñones pierden su capacidad de filtración?',
  'Hemoglobina', 'Creatinina', 'Insulina', 'Albúmina',
  1,
  'La creatinina es un producto de desecho del metabolismo muscular que normalmente es filtrada por los riñones. Cuando los riñones fallan, la creatinina se acumula en la sangre. Por eso, el nivel de creatinina sérica es uno de los indicadores más utilizados para evaluar la función renal y detectar fallo renal.'
),
((SELECT id FROM quizzes WHERE week_start = '2026-04-14'), 3,
  '¿Cuál de los siguientes síntomas es característico de la uremia en fallo renal avanzado?',
  'Aumento del apetito', 'Piel rosada y saludable', 'Náuseas persistentes y aliento con olor a amoniaco', 'Aumento en la producción de orina',
  2,
  'La uremia ocurre cuando los productos de desecho se acumulan en la sangre porque los riñones no pueden eliminarlos. Los síntomas clásicos incluyen náuseas, vómitos, aliento urémico (olor a amoniaco), confusión mental y picazón en la piel. Reconocer estos signos es crucial para buscar atención médica oportuna.'
);

-- ============================================================
-- Actualidades: First Entry (Día Mundial del Riñón 2026)
-- ============================================================

INSERT INTO actualidades (titulo, fuente, url_original, categoria, autor, resumen, imagen_url, fecha_publicacion) VALUES (
  'El Día Mundial del Riñón 2026: Cuidar tus Riñones es Cuidar tu Vida',
  'NKF / World Kidney Day Organization',
  'https://www.worldkidneyday.org',
  'Comunidad',
  'Equipo Raíces Médicas',
  'El pasado 12 de marzo de 2026 se celebró el Día Mundial del Riñón, una iniciativa global que busca crear conciencia sobre la importancia de la salud renal y la prevención de la enfermedad renal crónica. Este año, el tema central fue la detección temprana — recordándonos que millones de personas en el mundo viven con daño renal sin saberlo, ya que la enfermedad frecuentemente no presenta síntomas hasta etapas avanzadas. Desde Raíces Médicas, nos unimos a este mensaje: hazte revisar la función de tus riñones con tu médico, especialmente si tienes diabetes, hipertensión, o antecedentes familiares de enfermedad renal.',
  '/assets/images/dia-mundial-rinon-2026.jpg',
  '2026-03-27'
);

-- ============================================================
-- Actualidades: Kolff & Scribner — Los Padres de la Hemodiálisis
-- ============================================================

INSERT INTO actualidades (titulo, fuente, url_original, categoria, autor, resumen, imagen_url, fecha_publicacion) VALUES (
  'Los Padres de la Hemodiálisis: Willem Kolff y Belding Scribner',
  'Albert Lasker Foundation · 2002',
  'https://raicesmedicas.health/historia-dialisis/kolff-scribner.html',
  'Diálisis',
  'Equipo Raíces Médicas',
  'Cómo Willem Kolff y Belding Scribner transformaron la insuficiencia renal de sentencia de muerte a enfermedad tratable, salvando más de 1.5 millones de vidas en el mundo. Desde el primer riñón artificial construido bajo ocupación nazi hasta el shunt de Teflón que hizo posible la diálisis crónica indefinida — esta es la historia completa de los dos hombres que fundaron la nefrología moderna.',
  NULL,
  '2026-04-08'
);
