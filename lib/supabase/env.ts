// Variables públicas de Supabase (las mismas que usa la app Flutter en supabase.json).
// La llave "anon"/publishable es pública por diseño: la seguridad real la dan las reglas RLS.
// NUNCA pongas aquí la llave service_role.
export function envSupabase() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key =
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
  if (!url || !key) {
    throw new Error(
      'Faltan NEXT_PUBLIC_SUPABASE_URL y NEXT_PUBLIC_SUPABASE_ANON_KEY (ver .env.example).'
    );
  }
  return { url, key };
}
