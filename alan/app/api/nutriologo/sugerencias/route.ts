import { NextResponse } from 'next/server';
import { crearClienteServidor } from '@/lib/supabase/server';
import { nutriologoActual } from '@/lib/nutriologo';
import { tendencia, limitarSuperavit } from '@/lib/motor-reglas';
import { respuestaSegura } from '@/lib/asesor';
import { sugerenciasDeReglas } from '@/lib/sugerencias';

const falla = (error: string, status: number) => NextResponse.json({ success: false, error }, { status });

// Servidor de IA (el mismo del asistente). SOLO del lado del servidor.
const ASESOR_URL = process.env.ASESOR_URL ?? '';

const claveDia = (d: Date) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;

/** Tres borradores de respuesta para un paciente del nutriólogo. NUNCA se envían solos: el panel los
 *  pone en la caja de texto para que el nutriólogo los revise, los edite y decida si los manda.
 *  El contexto se arma AQUÍ desde la base; el navegador solo manda el paciente y los borradores ya vistos.
 *  A la IA solo va el primer nombre del paciente (igual que la app). */
export async function POST(request: Request) {
  const supabase = await crearClienteServidor();
  const nut = await nutriologoActual(supabase);
  if (!nut) return falla('No autorizado', 401);

  const b = await request.json().catch(() => ({}));
  const usuarioId = String(b.usuario_id ?? '');
  if (!usuarioId) return falla('Paciente requerido', 400);

  // Solo pacientes asignados a este nutriólogo (además del RLS de la base).
  const { data: u } = await supabase
    .from('usuarios')
    .select('*')
    .eq('id', usuarioId)
    .eq('nutriologo_id', nut.id)
    .maybeSingle();
  if (!u) return falla('Paciente no encontrado', 404);

  const anteriores: string[] = (Array.isArray(b.anteriores) ? b.anteriores : [])
    .map((x: unknown) => String(x ?? '').trim().slice(0, 300))
    .filter(Boolean)
    .slice(-9);

  const desde = new Date(Date.now() - 30 * 86_400_000).toISOString().slice(0, 10);
  const [regs, msgs] = await Promise.all([
    supabase.from('registros_diarios').select('*').eq('usuario_id', u.id).gte('fecha', desde).order('fecha', { ascending: true }),
    supabase
      .from('mensajes_chat')
      .select('remitente, contenido, creado_en')
      .eq('usuario_id', u.id)
      .is('eliminado_en', null)
      .order('creado_en', { ascending: false })
      .limit(10),
  ]);

  const registros = regs.data ?? [];
  const t = tendencia(registros);
  const primerNombre = String(u.nombre ?? '').trim().split(/\s+/)[0] || 'paciente';
  const superavit = limitarSuperavit(Number(u.superavit_kcal) || 450);
  const pesoActual = registros.length ? Number(registros[registros.length - 1].peso_ayunas) : Number(u.peso_actual);
  const hoy = claveDia(new Date());

  const reglas = () =>
    NextResponse.json({
      success: true,
      data: {
        sugerencias: sugerenciasDeReglas({
          nombre: primerNombre,
          estado: t.estado,
          superavit,
          variante: Math.floor(anteriores.length / 3),
        }),
        deIA: false,
      },
    });

  if (!ASESOR_URL) return reglas();

  try {
    const historial = (msgs.data ?? [])
      .slice()
      .reverse()
      .map((m) => ({
        autor: m.remitente === 'nutriologo' ? 'nutriologo' : 'usuario',
        texto: String(m.contenido ?? '').slice(0, 400),
      }))
      .filter((m) => m.texto.trim());

    const { data: ses } = await supabase.auth.getSession();
    const token = ses.session?.access_token;
    const res = await fetch(ASESOR_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) },
      body: JSON.stringify({
        modo: 'sugerencias',
        contexto: {
          pesoKg: pesoActual,
          metaPeso: Number(u.peso_objetivo),
          superavit,
          estado: t.estado,
          deltaPeso: t.deltaPeso,
          deltaCargas: t.deltaCargas,
          hoy,
          usuario: { nombre: primerNombre },
          registroHoy: registros.some((r) => String(r.fecha).slice(0, 10) === hoy),
          registrosTotales: registros.length,
          recientes: registros.slice(-7).map((r) => ({
            fecha: String(r.fecha).slice(0, 10),
            peso: Number(r.peso_ayunas),
            volumen: Number(r.volumen_entrenamiento_kg ?? 0),
            sentadilla: Number(r.sentadilla_kg ?? 0),
            press: Number(r.press_banca_kg ?? 0),
            ...(r.proteina_consumida_g != null ? { proteina: Number(r.proteina_consumida_g) } : {}),
          })),
          historial,
          revisionPendiente: false,
          // Borradores ya mostrados: el servidor no los repite ni los toma de su caché.
          anteriores,
        },
      }),
      signal: AbortSignal.timeout(40_000),
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const j = await res.json();
    const textos: string[] = (Array.isArray(j.sugerencias) ? j.sugerencias : [])
      .filter((x: unknown): x is string => typeof x === 'string' && x.trim().length > 0 && respuestaSegura(x))
      .map((x: string) => x.trim())
      .slice(0, 3);
    if (!textos.length) throw new Error('Sin sugerencias válidas');
    return NextResponse.json({ success: true, data: { sugerencias: textos, deIA: true } });
  } catch (e) {
    console.error('sugerencias (IA):', e instanceof Error ? e.message : e);
    return reglas();
  }
}
