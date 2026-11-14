import { NextResponse } from 'next/server';
import { crearClienteServidor } from '@/lib/supabase/server';
import { tendencia, limitarSuperavit } from '@/lib/motor-reglas';
import { consejoDelDia, consejoValido } from '@/lib/consejos';

// Servidor de IA (el mismo del asistente). Solo del lado del servidor.
const ASESOR_URL = process.env.ASESOR_URL ?? '';

const claveDia = (d: Date) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;

/** Consejo del día. Manda a la IA solo la tendencia (estado, cambios y superávit): sin nombre ni peso.
 *  Si la IA falla, tarda o su texto no pasa el filtro, devuelve el consejo de la lista de siempre. */
export async function GET(request: Request) {
  const supabase = await crearClienteServidor();
  const { data: auth } = await supabase.auth.getUser();
  if (!auth.user) return NextResponse.json({ success: false, error: 'No autorizado' }, { status: 401 });

  // El navegador manda su fecha local (AAAA-MM-DD) para que "hoy" sea el del paciente.
  const q = new URL(request.url).searchParams.get('dia') ?? '';
  const hoy = /^\d{4}-\d{2}-\d{2}$/.test(q) ? q : claveDia(new Date());
  const respaldo = consejoDelDia(hoy);

  if (!ASESOR_URL) {
    return NextResponse.json({ success: true, data: { ...respaldo, deIA: false } });
  }

  try {
    const { data: u } = await supabase.from('usuarios').select('id, superavit_kcal').eq('auth_id', auth.user.id).maybeSingle();
    if (!u) throw new Error('Paciente no encontrado');

    const desde = new Date(Date.now() - 30 * 86_400_000).toISOString().slice(0, 10);
    const { data: regs } = await supabase
      .from('registros_diarios')
      .select('*')
      .eq('usuario_id', u.id)
      .gte('fecha', desde)
      .order('fecha', { ascending: true });
    const registros = regs ?? [];
    const t = tendencia(registros);

    const { data: ses } = await supabase.auth.getSession();
    const token = ses.session?.access_token;
    const res = await fetch(ASESOR_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) },
      body: JSON.stringify({
        modo: 'consejo',
        contexto: {
          estado: t.estado,
          deltaPeso: t.deltaPeso,
          deltaCargas: t.deltaCargas,
          superavit: limitarSuperavit(Number(u.superavit_kcal) || 450),
          registroHoy: registros.some((r) => String(r.fecha).slice(0, 10) === hoy),
          hoy,
        },
      }),
      signal: AbortSignal.timeout(14_000),
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const j = await res.json();
    const tema = String(j?.consejo?.tema ?? '').trim();
    const texto = String(j?.consejo?.texto ?? '').trim();
    if (!consejoValido(tema, texto)) throw new Error('Consejo fuera de los límites');
    return NextResponse.json({ success: true, data: { tema, texto, deIA: true } });
  } catch (e) {
    console.error('consejo (IA):', e instanceof Error ? e.message : e);
    return NextResponse.json({ success: true, data: { ...respaldo, deIA: false } });
  }
}
