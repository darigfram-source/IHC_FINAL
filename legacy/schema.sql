-- ============================================================================
-- ESQUEMA DE BASE DE DATOS: NUTRIMASA (PostgreSQL / Vercel Postgres / Neon / Supabase)
-- Plataforma de Nutrición Deportiva e Hipertrofia Supervisada
-- Autenticación con Roles: 'admin' (Nutriólogo) y 'paciente'
-- ============================================================================

-- 1. TABLA PRINCIPAL DE USUARIOS Y AUTENTICACIÓN
CREATE TABLE IF NOT EXISTS usuarios (
    id VARCHAR(64) PRIMARY KEY,
    email VARCHAR(150) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    rol VARCHAR(20) NOT NULL CHECK (rol IN ('admin', 'paciente')),
    nombre VARCHAR(150) NOT NULL,
    creado_en TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 2. TABLA DE PERFILES DE PACIENTE
CREATE TABLE IF NOT EXISTS perfiles_paciente (
    usuario_id VARCHAR(64) PRIMARY KEY REFERENCES usuarios(id) ON DELETE CASCADE,
    nutriologo_id VARCHAR(64) REFERENCES usuarios(id) ON DELETE SET NULL,
    edad INTEGER NOT NULL DEFAULT 24,
    estatura_cm NUMERIC(5,2) NOT NULL DEFAULT 175.0,
    peso_inicial NUMERIC(5,2) NOT NULL DEFAULT 70.8,
    peso_actual NUMERIC(5,2) NOT NULL DEFAULT 71.0,
    peso_objetivo NUMERIC(5,2) NOT NULL DEFAULT 75.0,
    nivel_entrenamiento VARCHAR(30) NOT NULL DEFAULT 'Intermedio',
    
    -- Cuestionario de salud y consentimiento LFPDPPP
    condicion_renal_diabetes BOOLEAN DEFAULT FALSE,
    embarazo_lactancia BOOLEAN DEFAULT FALSE,
    trastorno_conducta_alimentaria BOOLEAN DEFAULT FALSE,
    elegible BOOLEAN DEFAULT TRUE,
    consentimiento_informado BOOLEAN DEFAULT TRUE,

    -- Prescripción nutricional activa (1.6 - 1.8 g/kg, superávit 400 - 500 kcal)
    proteina_g_kg NUMERIC(3,2) NOT NULL DEFAULT 1.75,
    superavit_kcal INTEGER NOT NULL DEFAULT 400,
    calorias_mantenimiento INTEGER NOT NULL DEFAULT 2300,
    calorias_totales INTEGER NOT NULL DEFAULT 2700,
    carbohidratos_g INTEGER NOT NULL DEFAULT 360,
    carbs_peri_entreno_g INTEGER NOT NULL DEFAULT 70,
    grasas_g INTEGER NOT NULL DEFAULT 68,
    suplementacion_sugerida TEXT DEFAULT 'Creatina Monohidratada 5g/día constante',

    -- Estado clínico en el panel
    estado VARCHAR(40) NOT NULL DEFAULT 'Estancado', -- 'En progreso', 'Estancado', 'Peso sube, cargas no'
    tendencia_cargas VARCHAR(30) NOT NULL DEFAULT 'Sin cambio', -- 'Suben', 'Sin cambio', 'Bajan'
    
    actualizado_en TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 3. TABLA DE REGISTROS DIARIOS DEL PACIENTE (<30s)
CREATE TABLE IF NOT EXISTS registros_diarios (
    id VARCHAR(64) PRIMARY KEY,
    usuario_id VARCHAR(64) NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
    fecha DATE NOT NULL,
    peso_ayunas NUMERIC(5,2) NOT NULL,
    sentadilla_kg NUMERIC(6,2),
    press_banca_kg NUMERIC(6,2),
    peso_muerto_kg NUMERIC(6,2),
    volumen_entrenamiento_kg INTEGER,
    series_efectivas INTEGER DEFAULT 16,
    proteina_consumida_g NUMERIC(5,2),
    calorias_consumidas INTEGER,
    alerta_exceso_proteina BOOLEAN DEFAULT FALSE,
    notas TEXT,
    creado_en TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT unq_usuario_fecha UNIQUE (usuario_id, fecha)
);

-- 4. TABLA DE MENSAJES DE CHAT (Asíncrono entre Paciente y Nutriólogo)
CREATE TABLE IF NOT EXISTS mensajes_chat (
    id VARCHAR(64) PRIMARY KEY,
    usuario_id VARCHAR(64) NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
    nutriologo_id VARCHAR(64) REFERENCES usuarios(id) ON DELETE SET NULL,
    remitente VARCHAR(20) NOT NULL CHECK (remitente IN ('nutriologo', 'usuario')),
    contenido TEXT NOT NULL,
    tipo VARCHAR(30) DEFAULT 'texto', -- 'texto', 'sugerencia_suplementacion', 'ajuste_plan'
    leido BOOLEAN DEFAULT FALSE,
    creado_en TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 5. TABLA DE HISTORIAL DE AJUSTES DEL PLAN
CREATE TABLE IF NOT EXISTS ajustes_plan (
    id VARCHAR(64) PRIMARY KEY,
    usuario_id VARCHAR(64) NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
    nutriologo_id VARCHAR(64) REFERENCES usuarios(id) ON DELETE SET NULL,
    superavit_kcal_anterior INTEGER,
    superavit_kcal_nuevo INTEGER NOT NULL,
    proteina_g_kg_anterior NUMERIC(3,2),
    proteina_g_kg_nuevo NUMERIC(3,2) NOT NULL,
    motivo_ajuste TEXT NOT NULL,
    creado_en TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 6. TABLA DE REPORTES PERIÓDICOS
CREATE TABLE IF NOT EXISTS reportes (
    id VARCHAR(64) PRIMARY KEY,
    usuario_id VARCHAR(64) NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
    nutriologo_id VARCHAR(64) REFERENCES usuarios(id) ON DELETE SET NULL,
    periodo_tipo VARCHAR(20) NOT NULL CHECK (periodo_tipo IN ('semanal', 'mensual')),
    fecha_inicio DATE NOT NULL,
    fecha_fin DATE NOT NULL,
    peso_inicial_periodo NUMERIC(5,2) NOT NULL,
    peso_final_periodo NUMERIC(5,2) NOT NULL,
    cambio_peso NUMERIC(5,2) NOT NULL,
    progreso_sentadilla_kg NUMERIC(5,2) DEFAULT 0,
    progreso_banca_kg NUMERIC(5,2) DEFAULT 0,
    adherencia_registro_pct INTEGER DEFAULT 94,
    evaluacion_clinica TEXT NOT NULL,
    recomendaciones_siguientes TEXT NOT NULL,
    creado_en TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 7. TABLA DE BIBLIOTECA EDUCATIVA
CREATE TABLE IF NOT EXISTS articulos_educativos (
    id VARCHAR(64) PRIMARY KEY,
    titulo VARCHAR(200) NOT NULL,
    categoria VARCHAR(50) NOT NULL,
    resumen TEXT NOT NULL,
    contenido_completo TEXT NOT NULL,
    citas_cientificas TEXT NOT NULL,
    tiempo_lectura_min INTEGER DEFAULT 3,
    visible_en_app BOOLEAN DEFAULT TRUE,
    creado_en TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ÍNDICES PARA ALTO RENDIMIENTO
CREATE INDEX IF NOT EXISTS idx_perfiles_nutriologo ON perfiles_paciente(nutriologo_id);
CREATE INDEX IF NOT EXISTS idx_registros_usuario_fecha ON registros_diarios(usuario_id, fecha DESC);
CREATE INDEX IF NOT EXISTS idx_mensajes_usuario_nutriologo ON mensajes_chat(usuario_id, creado_en ASC);
