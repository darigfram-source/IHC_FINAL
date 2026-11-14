import { NextResponse } from 'next/server';
import { crearClienteServidor } from '@/lib/supabase/server';
import { nutriologoActual } from '@/lib/nutriologo';

const falla = (error: string, status: number) => NextResponse.json({ success: false, error }, { status });

export async function POST(request: Request) {
  const supabase = await crearClienteServidor();
  const nut = await nutriologoActual(supabase);
  if (!nut) return falla('No autorizado', 401);

  const b = await request.json();
  const titulo = String(b.titulo ?? '').trim();
  const contenido = String(b.contenido_completo ?? '').trim();
  if (!titulo || !contenido) return falla('Título y contenido requeridos', 400);

  const fila = {
    id: `art_${Date.now()}`,
    titulo,
    categoria: String(b.categoria ?? 'Entrenamiento'),
    resumen: String(b.resumen ?? ''),
    contenido_completo: contenido,
    citas_cientificas: String(b.citas_cientificas ?? '') || 'Literatura científica revisada.',
    tiempo_lectura_min: Math.max(1, Number(b.tiempo_lectura_min) || 3),
    visible_en_app: b.visible_en_app !== false,
    autor_nutriologo_id: nut.id,
  };
  const { data, error } = await supabase.from('articulos_educativos').insert(fila).select().maybeSingle();
  if (error) {
    console.error('nutriologo/articulos:', error.message);
    return falla('No se pudo guardar el artículo', 500);
  }
  return NextResponse.json({ success: true, data: data ?? fila });
}

export async function PATCH(request: Request) {
  const supabase = await crearClienteServidor();
  const nut = await nutriologoActual(supabase);
  if (!nut) return falla('No autorizado', 401);
  const { id, visible_en_app } = await request.json();
  if (!id || typeof visible_en_app !== 'boolean') return falla('Datos incompletos', 400);
  const { data, error } = await supabase
    .from('articulos_educativos')
    .update({ visible_en_app })
    .eq('id', String(id))
    .select('id');
  if (error || !data?.length) return falla('No se pudo cambiar la visibilidad', 500);
  return NextResponse.json({ success: true });
}
