// ============================================================================
// CONEXIÓN A BASE DE DATOS: NUTRIMASA
// Compatible con Supabase, Neon y Vercel Postgres
// Implementa fallback automático para ejecución autónoma sin variables de entorno
// ============================================================================

export interface DbConfig {
  connectionString?: string;
}

export const getDbConnectionString = (): string | null => {
  return (
    process.env.DATABASE_URL ||
    process.env.POSTGRES_URL ||
    process.env.SUPABASE_DB_URL ||
    null
  );
};

export const isDbConnected = (): boolean => {
  return Boolean(getDbConnectionString());
};
