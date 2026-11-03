-- ============================================================================
-- DATOS DE PRUEBA (SEED) PARA NUTRIMASA
-- Basado en la propuesta académica de IHC (CUCEI - UdeG)
-- ============================================================================

-- Limpiar datos previos si existen
TRUNCATE TABLE articulos_educativos, reportes, ajustes_plan, mensajes_chat, registros_diarios, usuarios, nutriologos CASCADE;

-- 1. NUTRIÓLOGO DEPORTIVO PRINCIPAL
INSERT INTO nutriologos (id, nombre, email, cedula_profesional, institucion, especialidad, password_hash)
VALUES (
    'nut-01',
    'Lic. Jovan Ricardo Zepeda',
    'nutriologo@nutrimasa.com',
    'CED-PROF-894721',
    'Universidad de Guadalajara (CUCEI)',
    'Nutrición Deportiva e Hipertrofia Muscular',
    '$2b$10$demo_hash_nutrimasa_2026'
);

-- 2. USUARIOS (PACIENTES) - Corresponden a Figura 8 del maquetado
INSERT INTO usuarios (
    id, nutriologo_id, nombre, email, edad, estatura_cm, peso_inicial, peso_actual, peso_objetivo,
    nivel_entrenamiento, proteina_g_kg, superavit_kcal, calorias_mantenimiento, calorias_totales,
    carbohidratos_g, carbs_peri_entreno_g, grasas_g, suplementacion_sugerida, estado, tendencia_cargas
) VALUES
(
    'usr-01', 'nut-01', 'Usuario 01 (Alan Salazar)', 'alan.salazar@alumnos.udg.mx', 23, 178.0, 76.5, 78.4, 82.0,
    'Intermedio', 1.70, 450, 2400, 2850, 380, 80, 75,
    'Creatina monohidratada 5g/día post-entreno', 'En progreso', 'Suben'
),
(
    'usr-02', 'nut-01', 'Usuario 02 (Darío Fuentes)', 'dario.fuentes@alumnos.udg.mx', 24, 175.0, 70.8, 71.0, 75.0,
    'Intermedio', 1.75, 400, 2300, 2700, 360, 70, 68,
    'Creatina monohidratada 5g/día, evaluar electrolitos', 'Estancado', 'Sin cambio'
),
(
    'usr-03', 'nut-01', 'Usuario 03 (Carlos Mendoza)', 'carlos.mendoza@gymmail.com', 27, 180.0, 81.0, 84.2, 85.0,
    'Principiante', 1.65, 500, 2500, 3000, 400, 90, 78,
    'Ajustar timing de carbohidratos, pausar exceso calórico', 'Peso sube, cargas no', 'Sin cambio'
),
(
    'usr-04', 'nut-01', 'Usuario 04 (Mariana Flores)', 'mariana.flores@cucei.udg.mx', 22, 164.0, 59.0, 62.5, 65.0,
    'Intermedio', 1.80, 420, 2000, 2420, 320, 65, 60,
    'Creatina monohidrato 3g/día con carbohidratos', 'En progreso', 'Suben'
),
(
    'usr-05', 'nut-01', 'Usuario 05 (Héctor Rivera)', 'hector.rivera@correo.com', 29, 172.0, 78.5, 76.8, 80.0,
    'Intermedio', 1.70, 400, 2350, 2750, 370, 75, 65,
    'Revisar recuperación del sueño y volumen de sentadilla', 'Estancado', 'Bajan'
);

-- 3. REGISTROS DIARIOS HISTÓRICOS (Últimas 4 semanas para Usuario 02 y Usuario 01)
-- Usuario 02: Peso oscilando 70.8 -> 71.2 -> 71.0 (Estancado), Banca 70kg, Sentadilla 100kg
INSERT INTO registros_diarios (id, usuario_id, fecha, peso_ayunas, sentadilla_kg, press_banca_kg, volumen_entrenamiento_kg, series_efectivas, proteina_consumida_g, calorias_consumidas)
VALUES
('reg-02-01', 'usr-02', CURRENT_DATE - INTERVAL '28 days', 70.8, 100.0, 70.0, 9200, 16, 122.0, 2680),
('reg-02-02', 'usr-02', CURRENT_DATE - INTERVAL '21 days', 70.9, 100.0, 70.0, 9300, 16, 124.0, 2710),
('reg-02-03', 'usr-02', CURRENT_DATE - INTERVAL '14 days', 71.1, 100.0, 70.0, 9400, 16, 120.0, 2690),
('reg-02-04', 'usr-02', CURRENT_DATE - INTERVAL '7 days',  71.0, 100.0, 70.0, 9450, 16, 125.0, 2700),
('reg-02-05', 'usr-02', CURRENT_DATE - INTERVAL '1 days',  71.0, 100.0, 70.0, 9450, 16, 123.0, 2700),

-- Usuario 01: En progreso favorable
('reg-01-01', 'usr-01', CURRENT_DATE - INTERVAL '28 days', 76.5, 110.0, 80.0, 10200, 18, 130.0, 2800),
('reg-01-02', 'usr-01', CURRENT_DATE - INTERVAL '21 days', 77.1, 112.5, 82.5, 10500, 18, 133.0, 2850),
('reg-01-03', 'usr-01', CURRENT_DATE - INTERVAL '14 days', 77.8, 115.0, 85.0, 10800, 18, 135.0, 2860),
('reg-01-04', 'usr-01', CURRENT_DATE - INTERVAL '7 days',  78.2, 117.5, 85.0, 11000, 18, 136.0, 2870),
('reg-01-05', 'usr-01', CURRENT_DATE - INTERVAL '1 days',  78.4, 120.0, 87.5, 11200, 18, 138.0, 2890),

-- Usuario 03: Alerta (Peso sube mucho pero cargas congeladas)
('reg-03-01', 'usr-03', CURRENT_DATE - INTERVAL '28 days', 81.0, 95.0, 65.0, 8100, 14, 138.0, 3100),
('reg-03-02', 'usr-03', CURRENT_DATE - INTERVAL '21 days', 82.1, 95.0, 65.0, 8000, 14, 142.0, 3150),
('reg-03-03', 'usr-03', CURRENT_DATE - INTERVAL '14 days', 83.2, 95.0, 65.0, 8200, 14, 145.0, 3200),
('reg-03-04', 'usr-03', CURRENT_DATE - INTERVAL '7 days',  83.9, 95.0, 65.0, 8150, 14, 140.0, 3180),
('reg-03-05', 'usr-03', CURRENT_DATE - INTERVAL '1 days',  84.2, 95.0, 65.0, 8100, 14, 139.0, 3150);

-- 4. MENSAJES DE CHAT (Fieles a Figura 6 del documento)
INSERT INTO mensajes_chat (id, usuario_id, nutriologo_id, remitente, contenido, tipo, leido, creado_en)
VALUES
(
    'msg-01', 'usr-02', 'nut-01', 'nutriologo',
    'Tu peso lleva dos semanas igual. Subo tu superávit a 450 kcal y concentra carbohidratos antes de entrenar.',
    'ajuste_plan', true, CURRENT_TIMESTAMP - INTERVAL '3 days'
),
(
    'msg-02', 'usr-02', 'nut-01', 'usuario',
    'Gracias. ¿Puedo agregar creatina?',
    'texto', true, CURRENT_TIMESTAMP - INTERVAL '2 days'
),
(
    'msg-03', 'usr-02', 'nut-01', 'nutriologo',
    'Sí, te dejé una guía en la biblioteca. Te aviso cuando revise tu semana.',
    'sugerencia_suplementacion', true, CURRENT_TIMESTAMP - INTERVAL '1 days'
);

-- 5. BIBLIOTECA EDUCATIVA (Material validado contra 'bro-science' citado en el proyecto)
INSERT INTO articulos_educativos (id, titulo, categoria, resumen, contenido_completo, citas_cientificas, tiempo_lectura_min, visible_en_app, autor_nutriologo_id)
VALUES
(
    'art-01',
    'Proteína e hipertrofia: Por qué el rango óptimo es 1.6 a 1.8 g/kg al día',
    'Proteína & Salud Renal',
    'El metaanálisis de Morton et al. demuestra que ingestas mayores a 1.62 g/kg no generan ganancias adicionales de masa muscular.',
    'Existe el mito arraigado en los gimnasios de consumir más de 2.5 a 3.0 g/kg de proteína. Sin embargo, la evidencia científica más sólida (Morton et al., 2018; Jäger et al., 2017) demuestra que la síntesis de proteína miofibrilar alcanza su meseta entre 1.6 y 1.8 g/kg. Además, un consumo desmedido e innecesario eleva la presión intraglomerular renal sin aportar ningún gramo extra de hipertrofia muscular.',
    'Morton et al. (2018) BJSM; Jäger et al. (2017) JISSN; de Lorenzo & Mihic (2026) Nefrología.',
    4, true, 'nut-01'
),
(
    'art-02',
    'Superávit Calórico Controlado: 400 a 500 kcal para hipertrofia limpia',
    'Superávit Calórico',
    'Comer miles de calorías de más no acelera el músculo, solo acumula grasa no deseada. Descubre la ciencia del superávit medido.',
    'Para construir nuevo tejido muscular se requiere energía, pero la tasa máxima de síntesis proteica está fisiológicamente limitada. Un superávit prudente de 400 a 500 kcal sobre tu tasa metabólica basal más actividad física (Urdampilleta et al., 2012) provee la energía necesaria para la síntesis de colágeno y miofibrillas minimizando el depósito de tejido adiposo visceral.',
    'Urdampilleta, Vicente-Salar, & Martínez-Sanz (2012) Rev Esp Nutr Hum Diet.',
    3, true, 'nut-01'
),
(
    'art-03',
    'Creatina Monohidratada: Guía práctica y evidencia ergogénica',
    'Suplementación',
    'Protocolo de 3 a 5 gramos diarios, sin necesidad obligatoria de fase de carga y con efecto directo en la reposición de fosfocreatina.',
    'La creatina monohidrato es el suplemento con mayor respaldo científico grado A para entrenamientos de fuerza e hipertrofia. Aumenta la disponibilidad de PCr intracelular, permitiendo realizar repeticiones adicionales en series de alta intensidad (como en sentadilla y press de banca), facilitando el volumen total de entrenamiento.',
    'Urdampilleta et al. (2012); Jäger et al. (2017).',
    3, true, 'nut-01'
),
(
    'art-04',
    'Carbohidratos Peri-Entrenamiento y Recuperación del Glucógeno',
    'Entrenamiento',
    'Cómo posicionar la mayor parte de tus hidratos de carbono 90 min antes y dentro de las 2 horas posteriores al estímulo de sobrecarga.',
    'Para maximizar el rendimiento en cargas pesadas y proteger las proteínas musculares del catabolismo, los carbohidratos complejos deben consumirse prioritariamente en las comidas adyacentes a tu rutina de gimnasio.',
    'Palacios (2020); Leal Lizcano et al. (2024).',
    4, true, 'nut-01'
);

-- 6. AJUSTES PREVIOS REGISTRADOS
INSERT INTO ajustes_plan (id, usuario_id, nutriologo_id, superavit_kcal_anterior, superavit_kcal_nuevo, proteina_g_kg_anterior, proteina_g_kg_nuevo, motivo_ajuste)
VALUES
(
    'aj-01', 'usr-02', 'nut-01', 350, 450, 1.70, 1.75,
    'Peso sin variaciones en 14 días (71.0 kg constante) y cargas de sentadilla estancadas en 100 kg. Se incrementa superávit a 450 kcal.'
);

-- 7. REPORTE MENSUAL BASE
INSERT INTO reportes (
    id, usuario_id, nutriologo_id, periodo_tipo, fecha_inicio, fecha_fin,
    peso_inicial_periodo, peso_final_periodo, cambio_peso,
    progreso_sentadilla_kg, progreso_banca_kg, adherencia_registro_pct,
    evaluacion_clinica, recomendaciones_siguientes
) VALUES
(
    'rep-01', 'usr-02', 'nut-01', 'mensual', CURRENT_DATE - INTERVAL '30 days', CURRENT_DATE,
    70.8, 71.0, 0.2, 0.0, 0.0, 94,
    'El paciente ha mantenido excelente constancia en sus registros (94% adherencia). Sin embargo, se observa meseta tanto en peso ponderado como en la progresión de cargas multiarticulares.',
    'Aumentar superávit calórico de 400 a 450 kcal, incorporar 5g de creatina monohidratada y concentrar 70g de hidratos de carbono en la comida pre-entrenamiento.'
);
