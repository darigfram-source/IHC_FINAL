import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { envSupabase } from './env';

/** Cliente de Supabase para rutas API y componentes de servidor. Actúa como la persona
 *  con sesión, así que las reglas RLS de tu base se aplican igual que en la app Flutter. */
export async function crearClienteServidor() {
  const { url, key } = envSupabase();
  const cookieStore = await cookies();
  return createServerClient(url, key, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(lista) {
        try {
          lista.forEach(({ name, value, options }) => cookieStore.set(name, value, options));
        } catch {
          // Se ignora si se llama desde un componente de servidor: el proxy refresca la sesión.
        }
      },
    },
  });
}
