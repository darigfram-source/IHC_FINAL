import { NextResponse } from 'next/server';
import { crearClienteServidor } from '@/lib/supabase/server';
import { CAMPOS_PUBLICOS_NUTRI } from '@/lib/nutri-perfil';

/** El nutriólogo asignado a la persona con sesión (`data` es null si aún no tiene uno). */
export async function GET() {
  const supabase = await crearClienteServidor();
  const { data: auth } = await supabase.auth.getUser();
  if (!auth.user) return NextResponse.json({ success: false, error: 'No autorizado' }, { status: 401 });

  const { data: usuario } = await supabase.from('usuarios').select('id, nutriologo_id').eq('auth_id', auth.user.id).maybeSingle();
  if (!usuario) return NextResponse.json({ success: false, error: 'Paciente no encontrado' }, { status: 404 });

  let nutriologoId: string | null = usuario.nutriologo_id ?? null;

  // Cuenta creada cuando aún no había nutriólogos activos: se asigna el primero activo
  // (igual que la app al sincronizar). Si la base no lo permite, sigue sin asignación.
  if (!nutriologoId) {
    const { data: primero } = await supabase.from('nutriologos').select('id').eq('activo', true).order('creado_en').limit(1).maybeSingle();
    if (primero) {
      const { data: asignado } = await supabase
        .from('usuarios')
        .update({ nutriologo_id: primero.id })
        .eq('id', usuario.id)
        .is('nutriologo_id', null)
        .select('nutriologo_id')
        .maybeSingle();
      nutriologoId = asignado?.nutriologo_id ?? null;
    }
  }
  if (!nutriologoId) return NextResponse.json({ success: true, data: null });

  const { data: nut, error } = await supabase
    .from('nutriologos')
    .select(`${CAMPOS_PUBLICOS_NUTRI}, cedula_profesional`)
    .eq('id', nutriologoId)
    .maybeSingle();
  if (error) {
    console.error('paciente/nutriologo:', error.message);
    return NextResponse.json({ success: false, error: 'No se pudo cargar a tu nutriólogo' }, { status: 500 });
  }
  return NextResponse.json({ success: true, data: nut ?? null });
}
