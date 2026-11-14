import { NextResponse } from 'next/server';
import { crearClienteServidor } from '@/lib/supabase/server';
import { obtenerRol } from '@/lib/roles';

export async function GET() {
  const supabase = await crearClienteServidor();
  const { data } = await supabase.auth.getUser();
  if (!data.user) return NextResponse.json({ authenticated: false }, { status: 401 });
  const info = await obtenerRol(supabase, data.user.id);
  if (info.rol === null) return NextResponse.json({ authenticated: false }, { status: 403 });
  return NextResponse.json({
    authenticated: true,
    user: { userId: info.id, email: data.user.email, nombre: info.nombre, rol: info.rol },
  });
}
