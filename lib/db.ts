// ============================================================================
// CONEXIÓN A BASE DE DATOS Y CONSULTAS: NUTRIMASA
// Compatible con Vercel Postgres, Neon y Supabase
// ============================================================================

import { Pool } from 'pg';
import { neon } from '@neondatabase/serverless';
import { INITIAL_USUARIOS, INITIAL_MENSAJES, INITIAL_ARTICULOS, INITIAL_REPORTES } from './data/initialData';

// Cadena de conexión
const connectionString =
  process.env.DATABASE_URL ||
  process.env.POSTGRES_URL ||
  process.env.POSTGRES_PRISMA_URL ||
  '';

let pool: Pool | null = null;

export const hasDbConnection = (): boolean => Boolean(connectionString);

export async function query(text: string, params: any[] = []): Promise<any> {
  if (connectionString) {
    try {
      if (!pool) {
        pool = new Pool({
          connectionString,
          ssl: connectionString.includes('localhost') ? false : { rejectUnauthorized: false },
        });
      }
      const res = await pool.query(text, params);
      return res.rows;
    } catch (error) {
      console.error('Error ejecutando query PostgreSQL:', error);
      throw error;
    }
  }

  // Si no hay conexión configurada, retornar array vacío para evitar caídas
  return [];
}

// ============================================================================
// CONSULTAS DEL PACIENTE (Segregadas por ID)
// ============================================================================

export async function getPatientCompleteData(usuarioId: string) {
  if (hasDbConnection()) {
    try {
      const userRes = await query('SELECT * FROM usuarios WHERE id = $1', [usuarioId]);
      const user = userRes[0];
      if (!user) return null;

      const profileRes = await query('SELECT * FROM perfiles_paciente WHERE usuario_id = $1', [usuarioId]);
      const profile = profileRes[0] || {};

      const logs = await query(
        'SELECT * FROM registros_diarios WHERE usuario_id = $1 ORDER BY fecha ASC',
        [usuarioId]
      );

      const msgs = await query(
        'SELECT * FROM mensajes_chat WHERE usuario_id = $1 ORDER BY creado_en ASC',
        [usuarioId]
      );

      const reps = await query(
        'SELECT * FROM reportes WHERE usuario_id = $1 ORDER BY creado_en DESC',
        [usuarioId]
      );

      return {
        ...user,
        ...profile,
        registros: logs,
        mensajes: msgs,
        reportes: reps,
      };
    } catch (e) {
      console.warn('Fallback a datos precargados para paciente:', e);
    }
  }

  // Fallback si la BD no está aún vinculada
  const fallback = INITIAL_USUARIOS.find((u) => u.id === usuarioId || u.email.includes(usuarioId)) || INITIAL_USUARIOS[1];
  const msgs = INITIAL_MENSAJES.filter((m) => m.usuario_id === fallback.id);
  const reps = INITIAL_REPORTES.filter((r) => r.usuario_id === fallback.id);

  return {
    ...fallback,
    rol: 'paciente',
    mensajes: msgs,
    reportes: reps,
  };
}

export async function insertDailyLog(usuarioId: string, logData: {
  fecha: string;
  peso_ayunas: number;
  sentadilla_kg: number;
  press_banca_kg: number;
  volumen_entrenamiento_kg: number;
  series_efectivas?: number;
  proteina_consumida_g?: number;
  calorias_consumidas?: number;
  alerta_exceso_proteina?: boolean;
  notas?: string;
}) {
  const logId = `reg-${Date.now()}`;

  if (hasDbConnection()) {
    try {
      // 1. Insertar o actualizar registro del día
      await query(
        `INSERT INTO registros_diarios (
          id, usuario_id, fecha, peso_ayunas, sentadilla_kg, press_banca_kg,
          volumen_entrenamiento_kg, series_efectivas, proteina_consumida_g,
          calorias_consumidas, alerta_exceso_proteina, notas
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
        ON CONFLICT (usuario_id, fecha) DO UPDATE SET
          peso_ayunas = EXCLUDED.peso_ayunas,
          sentadilla_kg = EXCLUDED.sentadilla_kg,
          press_banca_kg = EXCLUDED.press_banca_kg,
          volumen_entrenamiento_kg = EXCLUDED.volumen_entrenamiento_kg,
          proteina_consumida_g = EXCLUDED.proteina_consumida_g,
          alerta_exceso_proteina = EXCLUDED.alerta_exceso_proteina,
          notas = EXCLUDED.notas`,
        [
          logId,
          usuarioId,
          logData.fecha,
          logData.peso_ayunas,
          logData.sentadilla_kg,
          logData.press_banca_kg,
          logData.volumen_entrenamiento_kg,
          logData.series_efectivas || 16,
          logData.proteina_consumida_g || 0,
          logData.calorias_consumidas || 2700,
          logData.alerta_exceso_proteina || false,
          logData.notas || '',
        ]
      );

      // 2. Actualizar el peso_actual en perfiles_paciente
      await query(
        `UPDATE perfiles_paciente
         SET peso_actual = $1, actualizado_en = CURRENT_TIMESTAMP
         WHERE usuario_id = $2`,
        [logData.peso_ayunas, usuarioId]
      );

      return { success: true, id: logId };
    } catch (e) {
      console.error('Error insertando registro diario en BD:', e);
    }
  }

  return { success: true, id: logId };
}

// ============================================================================
// CONSULTAS DEL NUTRIÓLOGO (ADMIN)
// ============================================================================

export async function getAllPatients() {
  if (hasDbConnection()) {
    try {
      const users = await query(`
        SELECT u.id, u.email, u.nombre, u.rol, p.*
        FROM usuarios u
        JOIN perfiles_paciente p ON u.id = p.usuario_id
        WHERE u.rol = 'paciente'
        ORDER BY u.creado_en ASC
      `);

      // Cargar registros para cada paciente
      const results = await Promise.all(
        users.map(async (u: any) => {
          const logs = await query(
            'SELECT * FROM registros_diarios WHERE usuario_id = $1 ORDER BY fecha ASC',
            [u.id]
          );
          return {
            ...u,
            registros: logs,
          };
        })
      );

      if (results.length > 0) return results;
    } catch (e) {
      console.warn('Fallback a usuarios precargados:', e);
    }
  }

  return INITIAL_USUARIOS;
}
