import { NextResponse } from 'next/server';
import { crearClienteServidor } from '@/lib/supabase/server';
import { leerMeta } from '@/lib/metas';

const falla = (error: string, status: number) => NextResponse.json({ success: false, error }, { status });

/** Cambia el peso objetivo de la persona con sesión. Comprueba que la base realmente guardó el cambio
 *  (si las reglas RLS no dejan actualizar, el update no da error pero tampoco cambia nada). */
export async function PUT(request: Request) {
  const supabase = await crearClienteServidor();
  const { data: auth } = await supabase.auth.getUser();
  if (!auth.user) return falla('No autorizado', 401);

  const b = await request.json().catch(() => ({}));
  const meta = leerMeta(String(b.peso_objetivo ?? ''));
  if (meta === null) return falla('El peso objetivo debe estar entre 30 y 250 kg.', 400);

  const { data, error } = await supabase
    .from('usuarios')
    .update({ peso_objetivo: meta })
    .eq('auth_id', auth.user.id)
    .select('peso_objetivo');
  if (error || !data?.length) {
    console.error('meta PUT:', error?.message ?? 'sin filas actualizadas');
    return falla('No se pudo guardar la meta. Intenta de nuevo.', 500);
  }
  return NextResponse.json({ success: true, data: { peso_objetivo: Number(data[0].peso_objetivo) } });
}
