import { NextResponse } from 'next/server';
import { crearClienteServidor } from '@/lib/supabase/server';
import { GUIAS_BASE, type ArticuloBiblioteca } from '@/lib/guias-base';

/** Nombre público del autor: el apodo si lo puso; si no, el nombre real. */
function nombreAutor(a: unknown): string | null {
  const o = (Array.isArray(a) ? a[0] : a) as { nombre?: string; apodo?: string } | null | undefined;
  if (!o) return null;
  const apodo = (o.apodo ?? '').trim();
  if (apodo) return apodo;
  const nombre = (o.nombre ?? '').trim();
  return nombre || null;
}

/** Biblioteca del paciente: artículos visibles de los nutriólogos (primero) + guías base de la app. */
export async function GET() {
  const supabase = await crearClienteServidor();
  const { data: auth } = await supabase.auth.getUser();
  if (!auth.user) return NextResponse.json({ success: false, error: 'No autorizado' }, { status: 401 });

  // Con el nombre del autor; si esa relación no existe, se piden igual los artículos.
  let filas: Record<string, any>[] = []; // eslint-disable-line @typescript-eslint/no-explicit-any
  const conAutor = await supabase
    .from('articulos_educativos')
    .select('*, autor:nutriologos(nombre, apodo)')
    .order('creado_en', { ascending: false });
  if (!conAutor.error) {
    filas = conAutor.data ?? [];
  } else {
    const simple = await supabase.from('articulos_educativos').select('*').order('creado_en', { ascending: false });
    if (simple.error) console.error('biblioteca:', simple.error.message);
    filas = simple.data ?? [];
  }

  const nube: ArticuloBiblioteca[] = filas
    .filter((f) => f.visible_en_app !== false)
    .map((f) => ({
      id: String(f.id),
      titulo: String(f.titulo ?? ''),
      categoria: String(f.categoria ?? 'General'),
      minutos: Math.max(1, Number(f.tiempo_lectura_min) || 3),
      resumen: String(f.resumen ?? ''),
      cuerpo: String(f.contenido_completo ?? ''),
      citas: String(f.citas_cientificas ?? ''),
      autor: nombreAutor(f.autor),
      deNutriologo: true,
    }))
    .filter((a) => a.titulo && a.cuerpo);

  // Las guías base no se repiten si un nutriólogo ya publicó una con el mismo título.
  const titulos = new Set(nube.map((a) => a.titulo.toLowerCase()));
  const base = GUIAS_BASE.filter((g) => !titulos.has(g.titulo.toLowerCase()));

  return NextResponse.json({ success: true, data: [...nube, ...base] });
}
