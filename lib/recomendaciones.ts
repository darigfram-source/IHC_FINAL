// Busca, en los mensajes del NUTRIÓLOGO, lo que ya le recomendó al paciente sobre suplementos, agua y macros.
// No usa IA ni manda datos a ningún servicio: solo palabras clave. Devuelve CITAS TEXTUALES con su fecha:
// nunca resume ni reformula, para que lo que se muestre sea lo que el nutriólogo realmente escribió.
export type TemaRecomendacion = 'suplementos' | 'hidratacion' | 'macros';

export interface CitaNutriologo {
  texto: string;
  fecha: string; // ISO del mensaje
}

export type Recomendaciones = Partial<Record<TemaRecomendacion, CitaNutriologo>>;

interface MensajeBusqueda {
  remitente: string;
  contenido: string;
  tipo?: string | null;
  creado_en: string;
  eliminado_en?: string | null;
}

// Se prueban sobre texto sin acentos y en minúsculas. \b evita confundir "agua" con "aguacate".
const PATRONES: Record<TemaRecomendacion, RegExp> = {
  suplementos: /creatina|suplement|\bwhey\b|pre[ -]?entreno|cafeina/,
  // "hidrata(c|r)" y no "hidrat": así no confunde "carbohidratos" con hidratación.
  hidratacion: /\bagua\b|hidrata(c|r)|deshidrat|\blitros?\b/,
  macros: /carbohidrat|\bcarbs?\b|\bgrasas?\b|calorias|\bmacros?\b/,
};

const MAX_CARACTERES = 280;

const sinAcentos = (s: string) => s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');

export function buscarRecomendaciones(mensajes: MensajeBusqueda[]): Recomendaciones {
  // Solo lo que escribió el nutriólogo (no el asistente ni el paciente), sin eliminados y sin avisos automáticos
  // de ajuste de plan (esos ya se muestran como plan).
  const delNutriologo = mensajes
    .filter((m) => m.remitente === 'nutriologo' && !m.eliminado_en && m.tipo !== 'ajuste_plan')
    .sort((a, b) => b.creado_en.localeCompare(a.creado_en)); // más reciente primero

  const out: Recomendaciones = {};
  for (const tema of Object.keys(PATRONES) as TemaRecomendacion[]) {
    for (const m of delNutriologo) {
      const frases = m.contenido
        .split(/(?<=[.!?])\s+|\n+/)
        .map((f) => f.trim())
        .filter(Boolean);
      const i = frases.findIndex((f) => PATRONES[tema].test(sinAcentos(f)));
      if (i === -1) continue;
      // La frase que coincide y la siguiente: así no se pierde un "si estás de acuerdo…" que cambia el sentido.
      let texto = frases.slice(i, i + 2).join(' ');
      if (texto.length > MAX_CARACTERES) texto = `${texto.slice(0, MAX_CARACTERES - 1).trimEnd()}…`;
      out[tema] = { texto, fecha: m.creado_en };
      break;
    }
  }
  return out;
}
