-- ============================================================================
-- SEED DE DATOS: NUTRIMASA
-- Contraseñas para todas las cuentas de prueba: Password123!
-- Hash bcrypt generado: $2b$10$qXBM1jcsDg7lPkKTyuO8f.kLvIiO8.3O3gHir24nbhcwegI6VkpCi
-- ============================================================================

TRUNCATE TABLE articulos_educativos, reportes, ajustes_plan, mensajes_chat, registros_diarios, perfiles_paciente, usuarios CASCADE;

-- 1. CUENTAS DE USUARIO (ADMIN Y PACIENTES)
INSERT INTO usuarios (id, email, password_hash, rol, nombre)
VALUES
(
    'usr-admin',
    'admin@nutrimasa.com',
    '$2b$10$qXBM1jcsDg7lPkKTyuO8f.kLvIiO8.3O3gHir24nbhcwegI6VkpCi',
    'admin',
    'Nutriólogo Admin'
),
(
    'usr-02',
    'dario@nutrimasa.com',
    '$2b$10$qXBM1jcsDg7lPkKTyuO8f.kLvIiO8.3O3gHir24nbhcwegI6VkpCi',
    'paciente',
    'Darío Fuentes'
),
(
    'usr-01',
    'alan@nutrimasa.com',
    '$2b$10$qXBM1jcsDg7lPkKTyuO8f.kLvIiO8.3O3gHir24nbhcwegI6VkpCi',
    'paciente',
    'Alan Salazar'
),
(
    'usr-03',
    'carlos@nutrimasa.com',
    '$2b$10$qXBM1jcsDg7lPkKTyuO8f.kLvIiO8.3O3gHir24nbhcwegI6VkpCi',
    'paciente',
    'Carlos Mendoza'
);

-- 2. PERFILES DE PACIENTE
INSERT INTO perfiles_paciente (
    usuario_id, nutriologo_id, edad, estatura_cm, peso_inicial, peso_actual, peso_objetivo,
    nivel_entrenamiento, proteina_g_kg, superavit_kcal, calorias_mantenimiento, calorias_totales,
    carbohidratos_g, carbs_peri_entreno_g, grasas_g, suplementacion_sugerida, estado, tendencia_cargas
) VALUES
(
    'usr-02', 'usr-admin', 24, 175.0, 70.8, 71.0, 75.0,
    'Intermedio', 1.75, 400, 2300, 2700, 360, 70, 68,
    'Creatina monohidratada 5g/día constante', 'Estancado', 'Sin cambio'
),
(
    'usr-01', 'usr-admin', 24, 178.0, 76.5, 78.4, 82.0,
    'Intermedio', 1.70, 450, 2400, 2850, 380, 80, 75,
    'Creatina monohidratada 5g/día post-entreno', 'En progreso', 'Suben'
),
(
    'usr-03', 'usr-admin', 27, 180.0, 81.0, 84.2, 85.0,
    'Principiante', 1.65, 500, 2500, 3000, 400, 90, 78,
    'Ajustar timing de carbohidratos peri-entrenamiento', 'Peso sube, cargas no', 'Sin cambio'
);

-- 3. REGISTROS DIARIOS HISTÓRICOS (Últimas 4 semanas)
INSERT INTO registros_diarios (id, usuario_id, fecha, peso_ayunas, sentadilla_kg, press_banca_kg, volumen_entrenamiento_kg, series_efectivas, proteina_consumida_g, calorias_consumidas)
VALUES
-- Darío Fuentes (usr-02 - Estancado en 71.0 kg)
('reg-02-01', 'usr-02', CURRENT_DATE - INTERVAL '28 days', 70.8, 100.0, 70.0, 9200, 16, 122.0, 2680),
('reg-02-02', 'usr-02', CURRENT_DATE - INTERVAL '21 days', 70.9, 100.0, 70.0, 9300, 16, 124.0, 2710),
('reg-02-03', 'usr-02', CURRENT_DATE - INTERVAL '14 days', 71.1, 100.0, 70.0, 9400, 16, 120.0, 2690),
('reg-02-04', 'usr-02', CURRENT_DATE - INTERVAL '7 days',  71.0, 100.0, 70.0, 9450, 16, 125.0, 2700),
('reg-02-05', 'usr-02', CURRENT_DATE - INTERVAL '1 days',  71.0, 100.0, 70.0, 9450, 16, 124.0, 2700),

-- Alan Salazar (usr-01 - En progreso favorable)
('reg-01-01', 'usr-01', CURRENT_DATE - INTERVAL '28 days', 76.5, 110.0, 80.0, 10200, 18, 130.0, 2800),
('reg-01-02', 'usr-01', CURRENT_DATE - INTERVAL '21 days', 77.1, 112.5, 82.5, 10500, 18, 133.0, 2850),
('reg-01-03', 'usr-01', CURRENT_DATE - INTERVAL '14 days', 77.8, 115.0, 85.0, 10800, 18, 135.0, 2860),
('reg-01-04', 'usr-01', CURRENT_DATE - INTERVAL '7 days',  78.2, 117.5, 85.0, 11000, 18, 136.0, 2870),
('reg-01-05', 'usr-01', CURRENT_DATE - INTERVAL '1 days',  78.4, 120.0, 87.5, 11200, 18, 138.0, 2890),

-- Carlos Mendoza (usr-03 - Peso sube, cargas no)
('reg-03-01', 'usr-03', CURRENT_DATE - INTERVAL '28 days', 81.0, 95.0, 65.0, 8100, 14, 138.0, 3100),
('reg-03-02', 'usr-03', CURRENT_DATE - INTERVAL '21 days', 82.1, 95.0, 65.0, 8000, 14, 142.0, 3150),
('reg-03-03', 'usr-03', CURRENT_DATE - INTERVAL '14 days', 83.2, 95.0, 65.0, 8200, 14, 145.0, 3200),
('reg-03-04', 'usr-03', CURRENT_DATE - INTERVAL '7 days',  83.9, 95.0, 65.0, 8150, 14, 140.0, 3180),
('reg-03-05', 'usr-03', CURRENT_DATE - INTERVAL '1 days',  84.2, 95.0, 65.0, 8100, 14, 139.0, 3150);

-- 4. MENSAJES DE CHAT
INSERT INTO mensajes_chat (id, usuario_id, nutriologo_id, remitente, contenido, tipo, leido, creado_en)
VALUES
(
    'msg-01', 'usr-02', 'usr-admin', 'nutriologo',
    'Tu peso lleva dos semanas igual. Subo tu superávit a 450 kcal y concentra carbohidratos antes de entrenar.',
    'ajuste_plan', true, CURRENT_TIMESTAMP - INTERVAL '3 days'
),
(
    'msg-02', 'usr-02', 'usr-admin', 'usuario',
    'Gracias. ¿Puedo agregar creatina?',
    'texto', true, CURRENT_TIMESTAMP - INTERVAL '2 days'
),
(
    'msg-03', 'usr-02', 'usr-admin', 'nutriologo',
    'Sí, te dejé una guía en la biblioteca. Te aviso cuando revise tu semana.',
    'sugerencia_suplementacion', true, CURRENT_TIMESTAMP - INTERVAL '1 days'
);

-- 5. BIBLIOTECA EDUCATIVA
INSERT INTO articulos_educativos (id, titulo, categoria, resumen, contenido_completo, citas_cientificas, tiempo_lectura_min, visible_en_app)
VALUES
(
    'art-01',
    'Proteína e hipertrofia: Por qué el rango óptimo es 1.6 a 1.8 g/kg al día',
    'Proteína & Salud Renal',
    'El metaanálisis de Morton et al. demuestra que ingestas mayores a 1.62 g/kg no generan ganancias adicionales de masa muscular.',
    'Existe el mito arraigado en los gimnasios de consumir más de 2.5 a 3.0 g/kg de proteína ("bro-science"). Sin embargo, la evidencia científica más sólida (Morton et al., 2018; Jäger et al., 2017) demuestra que la síntesis de proteína miofibrilar alcanza su meseta entre 1.6 y 1.8 g/kg al día. Consumir cantidades superiores no acelera el crecimiento muscular y eleva la presión intraglomerular en el riñón.',
    'Morton et al. (2018) Br J Sports Med; Jäger et al. (2017) J Int Soc Sports Nutr.',
    4, true
),
(
    'art-02',
    'Superávit Calórico Controlado: 400 a 500 kcal para hipertrofia limpia',
    'Superávit Calórico',
    'Comer calorías desmedidas no acelera el crecimiento muscular, solo acumula grasa no deseada. Descubre la ciencia del superávit medido.',
    'Para construir nuevo tejido muscular se requiere energía, pero la tasa máxima de síntesis proteica está biológicamente limitada. Un superávit prudente de 400 a 500 kcal sobre tu dieta habitual (Urdampilleta et al., 2012) provee la energía necesaria para la síntesis de miofibrillas minimizando el depósito de tejido adiposo visceral.',
    'Urdampilleta, Vicente-Salar, & Martínez-Sanz (2012) Rev Esp Nutr Hum Diet.',
    3, true
),
(
    'art-03',
    'Creatina Monohidratada: Guía práctica y evidencia ergogénica',
    'Suplementación',
    'Dosis recomendada de 3 a 5 gramos diarios constantes, sin necesidad imperativa de fase de carga y con efecto directo en la resíntesis de ATP.',
    'La creatina monohidrato es el suplemento con mayor respaldo científico grado A para entrenamientos orientados a la fuerza y la hipertrofia muscular. Incrementa los depósitos de fosfocreatina intracelular en el músculo esquelético, permitiendo realizar 1 a 2 repeticiones adicionales en series pesadas.',
    'Urdampilleta et al. (2012); Jäger et al. (2017).',
    3, true
),
(
    'art-04',
    'Carbohidratos Peri-Entrenamiento y Recuperación del Glucógeno',
    'Entrenamiento',
    'Cómo posicionar estratégicamente los carbohidratos 60-90 minutos antes y después del estímulo para maximizar las cargas de sentadilla y banca.',
    'El entrenamiento anaeróbico de fuerza depende primordialmente de la glucólisis rápida como fuente energética. Llegar con reservas reducidas de glucógeno merma el rendimiento en ejercicios multiarticulares demandantes.',
    'Palacios (2020); Leal Lizcano et al. (2024).',
    4, true
);

-- 6. REPORTE BASE
INSERT INTO reportes (
    id, usuario_id, nutriologo_id, periodo_tipo, fecha_inicio, fecha_fin,
    peso_inicial_periodo, peso_final_periodo, cambio_peso,
    progreso_sentadilla_kg, progreso_banca_kg, adherencia_registro_pct,
    evaluacion_clinica, recomendaciones_siguientes
) VALUES
(
    'rep-01', 'usr-02', 'usr-admin', 'mensual', CURRENT_DATE - INTERVAL '30 days', CURRENT_DATE,
    70.8, 71.0, 0.2, 0.0, 0.0, 94,
    'El paciente ha mantenido excelente constancia en sus registros diarios (94% de cumplimiento). Sin embargo, se observa meseta tanto en peso ponderado como en la progresión de cargas.',
    'Incrementar el superávit calórico de 400 a 450 kcal, incorporar 5g de creatina monohidratada y concentrar carbohidratos 90 min antes de la sesión.'
);
