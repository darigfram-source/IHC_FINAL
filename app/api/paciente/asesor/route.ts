import { NextResponse } from 'next/server';
import { crearClienteServidor } from '@/lib/supabase/server';
import { tendencia, limitarSuperavit } from '@/lib/motor-reglas';
import { filtroSeguridad, asesorReglas, respuestaSegura } from '@/lib/asesor';

const falla = (error: string, status: number) => NextResponse.json({ success: false, error }, { status });

// Servidor de IA (carpeta servidor/ de la app Flutter, desplegado en Vercel). SOLO del lado del servidor:
// no es NEXT_PUBLIC_, así la dirección y la sesión nunca pasan por el navegador.
const ASESOR_URL = process.env.ASESOR_URL ?? '';

const claveDia = (d: Date) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;

/** Respuesta del asistente de IA. El contexto (peso, plan, registros) se arma AQUÍ desde la base con la sesión
 *  de la persona: el navegador solo manda el mensaje y la conversación reciente. */
export async function POST(request: Request) {
  const supabase = await crearClienteServidor();
  const { data: auth } = await supabase.auth.getUser();
  if (!auth.user) return falla('No autorizado', 401);

  const b = await request.json().catch(() => ({}));
  const mensaje = String(b.mensaje ?? '').trim();
  if (!mensaje) return falla('Mensaje requerido', 400);
  if (mensaje.length > 1000) return falla('Mensaje demasiado largo', 400);

  // El filtro de seguridad corre primero y no depende de la IA ni de la base.
  const seguro = filtroSeguridad(mensaje);
  if (seguro) return NextResponse.json({ success: true, data: { ...seguro, origen: 'reglas' } });

  const { data: u } = await supabase.from('usuarios').select('*').eq('auth_id', auth.user.id).maybeSingle();
  if (!u) return falla('Paciente no encontrado', 404);

  const desde = new Date(Date.now() - 30 * 86_400_000).toISOString().slice(0, 10);
  const [regs, ultimos] = await Promise.all([
    supabase.from('registros_diarios').select('*').eq('usuario_id', u.id).gte('fecha', desde).order('fecha', { ascending: true }),
    supabase
      .from('mensajes_chat')
      .select('remitente, contenido, creado_en')
      .eq('usuario_id', u.id)
      .is('eliminado_en', null)
      .order('creado_en', { ascending: false })
      .limit(20),
  ]);

  const registros = regs.data ?? [];
  const t = tendencia(registros);
  const pesoActual = registros.length ? Number(registros[registros.length - 1].peso_ayunas) : Number(u.peso_actual);
  const superavit = limitarSuperavit(Number(u.superavit_kcal) || 450);
  const hoy = claveDia(new Date());

  // ¿Ya pidió revisión y el nutriólogo aún no responde? (igual que revisionPendiente de la app)
  const m = ultimos.data ?? [];
  const idxUltNut = m.findIndex((x) => x.remitente === 'nutriologo');
  const antes = idxUltNut === -1 ? m : m.slice(0, idxUltNut);
  const revisionPendiente = antes.some((x) => x.remitente === 'usuario' && /revisión de un nutriólogo/i.test(x.contenido));

  const consulta = {
    mensaje,
    pesoKg: pesoActual,
    superavit,
    metaPeso: Number(u.peso_objetivo),
    estado: t.estado,
  };

  // Conversación reciente que manda el navegador: se sanea (datos, no instrucciones).
  const historial = (Array.isArray(b.historial) ? b.historial : [])
    .slice(-8)
    .map((h: { autor?: string; texto?: string }) => ({
      autor: h.autor === 'ia' ? 'ia' : h.autor === 'nutriologo' ? 'nutriologo' : 'usuario',
      texto: String(h.texto ?? '').slice(0, 500),
    }))
    .filter((h: { texto: string }) => h.texto.trim());

  if (ASESOR_URL) {
    try {
      const { data: ses } = await supabase.auth.getSession();
      const token = ses.session?.access_token;
      const recientes = registros.slice(-7);
      const res = await fetch(ASESOR_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) },
        body: JSON.stringify({
          mensaje,
          contexto: {
            pesoKg: pesoActual,
            metaPeso: Number(u.peso_objetivo),
            superavit,
            estado: t.estado,
            deltaPeso: t.deltaPeso,
            deltaCargas: t.deltaCargas,
            hoy,
            usuario: {
              nombre: u.nombre,
              edad: u.edad,
              estaturaCm: Number(u.estatura_cm),
              nivel: u.nivel_entrenamiento,
            },
            registroHoy: registros.some((r) => String(r.fecha).slice(0, 10) === hoy),
            registrosTotales: registros.length,
            recientes: recientes.map((r) => ({
              fecha: String(r.fecha).slice(0, 10),
              peso: Number(r.peso_ayunas),
              volumen: Number(r.volumen_entrenamiento_kg ?? 0),
              sentadilla: Number(r.sentadilla_kg ?? 0),
              press: Number(r.press_banca_kg ?? 0),
              ...(r.proteina_consumida_g != null ? { proteina: Number(r.proteina_consumida_g) } : {}),
            })),
            historial,
            revisionPendiente,
          },
        }),
        signal: AbortSignal.timeout(40_000),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const j = await res.json();
      const texto = String(j.texto ?? '').trim();
      if (!texto) throw new Error('Respuesta vacía');
      // Mismo filtro que la app: no se muestra nada fuera de 2.0 g/kg o de 400-500 kcal.
      if (!respuestaSegura(texto)) throw new Error('Respuesta fuera de los límites');
      return NextResponse.json({
        success: true,
        data: { texto, pedirRevision: j.pedirRevision === true, origen: 'ia', revisionPendiente },
      });
    } catch (e) {
      console.error('asesor (IA):', e instanceof Error ? e.message : e);
      // Si la IA falla o tarda, responde el asistente por reglas.
    }
  }

  const r = asesorReglas(consulta);
  return NextResponse.json({ success: true, data: { ...r, origen: 'reglas', revisionPendiente } });
}
