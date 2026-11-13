import { NextResponse } from 'next/server';
import { crearClienteServidor } from '@/lib/supabase/server';
import { CAMPOS_PUBLICOS_NUTRI } from '@/lib/nutri-perfil';

/** Nutriólogos activos (del más antiguo al más nuevo) para elegir al registrarse.
 *  Solo datos profesionales públicos: sin correo ni número de cédula. Si las reglas RLS de la base
 *  no dejan leerlos sin sesión, la lista llega vacía y el registro asigna al primero activo. */
export async function GET() {
  try {
    const supabase = await crearClienteServidor();
    const { data, error } = await supabase
      .from('nutriologos')
      .select(CAMPOS_PUBLICOS_NUTRI)
      .eq('activo', true)
      .order('creado_en');
    if (error) return NextResponse.json({ success: true, data: [] });
    return NextResponse.json({ success: true, data: data ?? [] });
  } catch {
    return NextResponse.json({ success: true, data: [] });
  }
}
