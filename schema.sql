-- ============================================================================
-- ESQUEMA DE BASE DE DATOS: NUTRIMASA (PostgreSQL / Supabase / Neon / Vercel Postgres)
-- Plataforma Web para Nutriólogos Deportivos Certificados
-- Conforme a la propuesta de solución académica (UdeG - CUCEI)
-- ============================================================================

-- 1. EXTENSIÓN PARA UUIDs (si está disponible)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. TABLA: NUTRIÓLOGOS (Especialistas Certificados)
CREATE TABLE IF NOT EXISTS nutriologos (
    id VARCHAR(64) PRIMARY KEY,
    nombre VARCHAR(150) NOT NULL,
    email VARCHAR(150) UNIQUE NOT NULL,
    cedula_profesional VARCHAR(50) NOT NULL,
    institucion VARCHAR(150) DEFAULT 'Universidad de Guadalajara (CUCEI)',
    especialidad VARCHAR(100) DEFAULT 'Nutrición Deportiva e Hipertrofia',
    password_hash VARCHAR(255) NOT NULL,
    activo BOOLEAN DEFAULT TRUE,
    creado_en TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 3. TABLA: USUARIOS (Pacientes que entrenan fuerza)
-- Incluye cumplimiento con LFPDPPP y cuestionario de elegibilidad (18-40 años, sin patologías)
CREATE TABLE IF NOT EXISTS usuarios (
    id VARCHAR(64) PRIMARY KEY,
    nutriologo_id VARCHAR(64) REFERENCES nutriologos(id) ON DELETE SET NULL,
    nombre VARCHAR(150) NOT NULL,
    email VARCHAR(150) UNIQUE NOT NULL,
    edad INTEGER NOT NULL CHECK (edad >= 18 AND edad <= 40),
    estatura_cm NUMERIC(5,2) NOT NULL,
    peso_inicial NUMERIC(5,2) NOT NULL,
    peso_actual NUMERIC(5,2) NOT NULL,
    peso_objetivo NUMERIC(5,2) NOT NULL,
    nivel_entrenamiento VARCHAR(30) DEFAULT 'Intermedio', -- 'Principiante', 'Intermedio'
    
    -- Cuestionario de elegibilidad y salud
    condicion_renal_diabetes BOOLEAN DEFAULT FALSE,
    embarazo_lactancia BOOLEAN DEFAULT FALSE,
    trastorno_conducta_alimentaria BOOLEAN DEFAULT FALSE,
    elegible BOOLEAN DEFAULT TRUE,
    consentimiento_informado BOOLEAN DEFAULT TRUE, -- LFPDPPP Art. 12-14
    
    -- Prescripción nutricional activa (1.6 - 1.8 g/kg, superávit 400 - 500 kcal)
    proteina_g_kg NUMERIC(3,2) DEFAULT 1.70 CHECK (proteina_g_kg <= 2.0),
    superavit_kcal INTEGER DEFAULT 450 CHECK (superavit_kcal BETWEEN 300 AND 600),
    calorias_mantenimiento INTEGER DEFAULT 2300,
    calorias_totales INTEGER DEFAULT 2750,
    carbohidratos_g INTEGER DEFAULT 360,
    carbs_peri_entreno_g INTEGER DEFAULT 75, -- Carbos alrededor del entreno
    grasas_g INTEGER DEFAULT 70,
    suplementacion_sugerida TEXT DEFAULT 'Creatina Monohidratada 5g/día constante',

    -- Estado clínico en el panel
    estado VARCHAR(40) DEFAULT 'En progreso', -- 'En progreso', 'Estancado', 'Peso sube, cargas no'
    tendencia_cargas VARCHAR(30) DEFAULT 'Suben', -- 'Suben', 'Sin cambio', 'Bajan'
    
    creado_en TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    actualizado_en TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 4. TABLA: REGISTROS DIARIOS (Datos de peso en ayunas, cargas y volumen)
-- Requerimiento: Llenado en <30s, soporta almacenamiento offline y sincronización
CREATE TABLE IF NOT EXISTS registros_diarios (
    id VARCHAR(64) PRIMARY KEY,
    usuario_id VARCHAR(64) NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
    fecha DATE NOT NULL,
    peso_ayunas NUMERIC(5,2) NOT NULL,
    
    -- Cargas principales de referencia (kg)
    sentadilla_kg NUMERIC(6,2),
    press_banca_kg NUMERIC(6,2),
    peso_muerto_kg NUMERIC(6,2),
    
    -- Volumen de entrenamiento (kg totales o series efectivas)
    volumen_entrenamiento_kg INTEGER,
    series_efectivas INTEGER,
    
    -- Ingesta real reportada para alertas educativas
    proteina_consumida_g NUMERIC(5,2),
    calorias_consumidas INTEGER,
    alerta_exceso_proteina BOOLEAN DEFAULT FALSE, -- Alerta si > 2.0 g/kg
    
    notas TEXT,
    creado_en TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT unq_usuario_fecha UNIQUE (usuario_id, fecha)
);

-- 5. TABLA: MENSAJES DE CHAT (Comunicación Asíncrona Especialista-Paciente)
-- Aviso legal permanente: No es tiempo real ni urgencias médicas
CREATE TABLE IF NOT EXISTS mensajes_chat (
    id VARCHAR(64) PRIMARY KEY,
    usuario_id VARCHAR(64) NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
    nutriologo_id VARCHAR(64) NOT NULL REFERENCES nutriologos(id) ON DELETE CASCADE,
    remitente VARCHAR(20) NOT NULL CHECK (remitente IN ('nutriologo', 'usuario')),
    contenido TEXT NOT NULL,
    tipo VARCHAR(30) DEFAULT 'texto', -- 'texto', 'sugerencia_suplementacion', 'ajuste_plan', 'guia_educativa'
    recurso_adjunto_id VARCHAR(64),
    leido BOOLEAN DEFAULT FALSE,
    creado_en TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 6. TABLA: HISTORIAL DE AJUSTES DEL PLAN NUTRICIONAL
CREATE TABLE IF NOT EXISTS ajustes_plan (
    id VARCHAR(64) PRIMARY KEY,
    usuario_id VARCHAR(64) NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
    nutriologo_id VARCHAR(64) NOT NULL REFERENCES nutriologos(id) ON DELETE CASCADE,
    superavit_kcal_anterior INTEGER,
    superavit_kcal_nuevo INTEGER NOT NULL,
    proteina_g_kg_anterior NUMERIC(3,2),
    proteina_g_kg_nuevo NUMERIC(3,2) NOT NULL,
    motivo_ajuste TEXT NOT NULL, -- ej: "Estancamiento en cargas semana 3", "Peso subiendo sin aumento de fuerza"
    creado_en TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 7. TABLA: REPORTES PERIÓDICOS (Semanales / Mensuales Exportables)
CREATE TABLE IF NOT EXISTS reportes (
    id VARCHAR(64) PRIMARY KEY,
    usuario_id VARCHAR(64) NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
    nutriologo_id VARCHAR(64) NOT NULL REFERENCES nutriologos(id) ON DELETE CASCADE,
    periodo_tipo VARCHAR(20) NOT NULL CHECK (periodo_tipo IN ('semanal', 'mensual')),
    fecha_inicio DATE NOT NULL,
    fecha_fin DATE NOT NULL,
    peso_inicial_periodo NUMERIC(5,2) NOT NULL,
    peso_final_periodo NUMERIC(5,2) NOT NULL,
    cambio_peso NUMERIC(5,2) NOT NULL,
    progreso_sentadilla_kg NUMERIC(5,2),
    progreso_banca_kg NUMERIC(5,2),
    adherencia_registro_pct INTEGER DEFAULT 95,
    evaluacion_clinica TEXT NOT NULL,
    recomendaciones_siguientes TEXT NOT NULL,
    archivo_pdf_url TEXT,
    creado_en TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 8. TABLA: BIBLIOTECA EDUCATIVA (Material validado contra 'bro-science')
CREATE TABLE IF NOT EXISTS articulos_educativos (
    id VARCHAR(64) PRIMARY KEY,
    titulo VARCHAR(200) NOT NULL,
    categoria VARCHAR(50) NOT NULL, -- 'Proteína & Salud Renal', 'Superávit Calórico', 'Suplementación', 'Entrenamiento'
    resumen TEXT NOT NULL,
    contenido_completo TEXT NOT NULL,
    citas_cientificas TEXT NOT NULL,
    tiempo_lectura_min INTEGER DEFAULT 3,
    visible_en_app BOOLEAN DEFAULT TRUE,
    autor_nutriologo_id VARCHAR(64) REFERENCES nutriologos(id) ON DELETE SET NULL,
    creado_en TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ÍNDICES PARA ALTO RENDIMIENTO
CREATE INDEX IF NOT EXISTS idx_usuarios_nutriologo ON usuarios(nutriologo_id);
CREATE INDEX IF NOT EXISTS idx_registros_usuario_fecha ON registros_diarios(usuario_id, fecha DESC);
CREATE INDEX IF NOT EXISTS idx_mensajes_usuario_nutriologo ON mensajes_chat(usuario_id, nutriologo_id, creado_en ASC);
CREATE INDEX IF NOT EXISTS idx_reportes_usuario ON reportes(usuario_id, creado_en DESC);
