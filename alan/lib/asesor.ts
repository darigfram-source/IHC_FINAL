// Port a TypeScript de lib/asesor.dart y de respuestaSegura (sugerencias.dart) de la app Flutter.
// Mantener sincronizado: el asistente debe responder igual en la app y en la web.
import { GKG_MIN, GKG_MAX, GKG_TOPE, SUPERAVIT_MIN, SUPERAVIT_MAX, limitarSuperavit } from './motor-reglas';

export interface ConsultaAsesor {
  mensaje: string;
  pesoKg: number;
  superavit: number;
  metaPeso: number;
  estado: 'sinDatos' | 'enProgreso' | 'estancado' | 'pesoSubeCargasNo';
}

export interface RespuestaAsesor {
  texto: string;
  pedirRevision?: boolean; // avisa al nutriólogo
  canalizar?: boolean; // pide acudir con un profesional de la salud
}

export function normalizar(s: string): string {
  return s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');
}

const contiene = (t: string, claves: string[]) => claves.some((c) => t.includes(c));

// Temas de estilo de vida (sobre texto normalizado). Con \b se evita confundir "agua" con "aguacate".
const reCarbos = /\bcarbo(s|hidratos?)?\b|\bcarbs?\b|hidratos de carbono/;
const reCafeina = /cafeina|\bcafes?\b|energizante|bebidas? energetica|red bull/;
const reCafeinaPastilla = /pastilla|capsula|energizante|energetica|red bull/;
const reHidratacion = /hidratac|hidratar|deshidrat|\bagua\b|\bsed\b|\blitros?\b|electrolit|isotonic|gatorade/;
const reSueno = /sueno|dormir|duermo|dormi\b|desvel|insomnio|siesta/;

/** Filtro de seguridad que corre ANTES de cualquier respuesta (reglas o IA). null si no hay nada que derivar. */
export function filtroSeguridad(mensaje: string): RespuestaAsesor | null {
  const t = normalizar(mensaje);
  const sintomas = [
    'dolor', 'duele', 'duelen', 'molestia', 'adormec', 'hormigue', 'fiebre', 'mareo', 'mareado', 'nausea',
    'vomit', 'desmay', 'sangre', 'orina', 'rinon', 'falta de aire', 'hinchaz', 'lesion', 'palpitacion',
    'diabetes', 'embaraz',
  ];
  const conducta = ['atracon', 'purg', 'no comer', 'dejar de comer', 'ayuno extremo'];
  if (contiene(t, sintomas) || contiene(t, conducta)) {
    return {
      texto:
        'Lo que describes es un tema de salud y no puedo valorarlo. Por favor acude con un profesional de la salud. ' +
        'Si es urgente, llama al 911 o ve a urgencias. No sigas ajustando tu plan hasta que te revisen.',
      canalizar: true,
    };
  }
  const m = t.match(/(\d+(?:[.,]\d+)?)\s*g\s*(?:\/|por)\s*kg/);
  if (m) {
    const v = parseFloat(m[1].replace(',', '.'));
    if (Number.isFinite(v) && v > GKG_TOPE) {
      return {
        texto:
          'No puedo recomendar más de 2.0 g de proteína por kg al día. Pasar de ahí no aporta más músculo y, de forma ' +
          'sostenida, puede exigir más a los riñones. Si tienes dudas, pide la revisión de un nutriólogo.',
        pedirRevision: true,
      };
    }
  }
  return null;
}

/** Descarta respuestas de la IA que se salgan de lo que respalda la propuesta:
 *  proteína de más de 2.0 g/kg o superávit fuera de 400 a 500 kcal. */
export function respuestaSegura(texto: string): boolean {
  const t = texto.toLowerCase();
  for (const m of t.matchAll(/(\d+(?:[.,]\d+)?)\s*g\s*\/\s*kg/g)) {
    const v = parseFloat(m[1].replace(',', '.'));
    if (Number.isFinite(v) && v > GKG_TOPE) return false;
  }
  for (const m of t.matchAll(/super[aá]vit[^.\d]{0,30}\+?\s*(\d{3,4})/g)) {
    const v = parseInt(m[1], 10);
    if (v < SUPERAVIT_MIN || v > SUPERAVIT_MAX) return false;
  }
  return true;
}

/** Asistente local por reglas (sin internet ni IA): respaldo cuando el servidor de IA falla. */
export function asesorReglas(c: ConsultaAsesor): RespuestaAsesor {
  const seguro = filtroSeguridad(c.mensaje);
  if (seguro) return seguro;

  const t = normalizar(c.mensaje);
  const peso = c.pesoKg;
  const superavit = limitarSuperavit(c.superavit);
  const n0 = (v: number) => v.toFixed(0);
  const n1 = (v: number) => v.toFixed(1);
  const pMin = peso * GKG_MIN;
  const pMax = peso * GKG_MAX;
  const pTope = peso * GKG_TOPE;

  if (contiene(t, ['creatina', 'suplement', 'whey', 'pre entreno', 'preentreno'])) {
    return {
      texto:
        'Los suplementos los indica o valida un nutriólogo según tu caso. La creatina tiene efecto documentado en ' +
        'entrenamientos de hipertrofia, pero no te la recomiendo por mi cuenta. Ya pedí que un nutriólogo lo revise.',
      pedirRevision: true,
    };
  }

  if (reCarbos.test(t)) {
    return {
      texto:
        `Los carbohidratos son el combustible principal de tu entrenamiento y ayudan a recuperarte. No los recortes por ` +
        `tu cuenta: tu superávit de +${superavit} kcal se completa con carbohidratos y grasas una vez cubierta tu ` +
        `proteína (${n0(pMin)} a ${n0(pMax)} g al día). Buenas fuentes: arroz, avena, tortilla, frijoles, papa, plátano ` +
        'y pasta. Una comida con carbohidratos y algo de proteína 2 a 3 horas antes de entrenar, y otra después, suele ' +
        'funcionar bien. Si quieres una cifra en gramos para ti, la define el nutriólogo.',
    };
  }

  if (reCafeina.test(t)) {
    if (reCafeinaPastilla.test(t)) {
      return {
        texto:
          'Las pastillas, cápsulas y bebidas energizantes concentran mucha cafeína y su uso lo valida un nutriólogo, así ' +
          'que no te las recomiendo por mi cuenta. Ya pedí que un nutriólogo lo revise.',
        pedirRevision: true,
      };
    }
    return {
      texto:
        'Un café o té normal antes de entrenar es habitual. Para un adulto sano, las autoridades de salud consideran ' +
        'seguro hasta unos 400 mg de cafeína al día, repartidos en el día (más o menos 3 a 4 tazas de café). Evítala en ' +
        'la tarde o noche, porque dura varias horas en el cuerpo y puede quitarte sueño. Si te pone nervioso o sientes ' +
        'el corazón acelerado, bájale y consúltalo con un profesional de la salud.',
    };
  }

  if (reHidratacion.test(t)) {
    return {
      texto:
        'Toma agua a lo largo del día y un poco más antes, durante y después de entrenar, sobre todo con calor. Como ' +
        'referencia general, el consumo total de agua (contando la de los alimentos) ronda 2 a 2.5 litros al día en ' +
        'adultos; necesitas más si sudas mucho. Un buen indicador es que tu orina salga amarillo claro. Con un ' +
        'entrenamiento normal el agua simple basta; las bebidas deportivas no son necesarias.',
    };
  }

  if (reSueno.test(t) && !t.includes('proteina')) {
    if (t.includes('insomnio')) {
      return {
        texto:
          'Si llevas varias noches sin poder dormir, conviene que lo vea un profesional de la salud. Mientras tanto, ' +
          'mantén horarios fijos y evita pantallas y cafeína por la noche.',
        canalizar: true,
      };
    }
    return {
      texto:
        'El sueño es donde tu cuerpo se recupera y construye músculo. Procura al menos 7 horas por noche (muchos ' +
        'adultos rinden mejor con 7 a 9) y horarios parecidos todos los días. Evita la cafeína en la tarde y las ' +
        'pantallas justo antes de acostarte. Si duermes poco, puede costarte más subir cargas aunque comas bien.',
    };
  }

  if (contiene(t, ['proteina'])) {
    return {
      texto:
        `Con tu peso de ${n1(peso)} kg, tu rango es de 1.6 a 1.8 g/kg: ${n0(pMin)} a ${n0(pMax)} g al día. ` +
        `No conviene pasar de 2.0 g/kg (${n0(pTope)} g).`,
    };
  }

  if (contiene(t, ['superavit', 'caloria', 'kcal', 'comer mas', 'cuanto como'])) {
    return {
      texto:
        `Tu superávit actual es de +${superavit} kcal sobre tu dieta habitual. El rango respaldado es de 400 a 500 kcal. ` +
        'Si tu peso no cambia o tus cargas no suben, el nutriólogo puede ajustarlo.',
    };
  }

  if (contiene(t, ['estanc', 'no subo', 'no avanzo', 'no gano', 'plateau'])) {
    switch (c.estado) {
      case 'estancado':
        return {
          texto:
            'Tu peso y tus cargas llevan casi dos semanas sin cambios. Un nutriólogo puede subir tu superávit (hasta 500 kcal). Ya pedí su revisión.',
          pedirRevision: true,
        };
      case 'pesoSubeCargasNo':
        return {
          texto:
            'Tu peso sube pero tus cargas no. No subas calorías por tu cuenta: conviene que un nutriólogo revise tu plan. Ya pedí su revisión.',
          pedirRevision: true,
        };
      case 'enProgreso':
        return {
          texto:
            'Según tus registros vas en progreso: tu peso o tus cargas están subiendo. Mantén la constancia.',
        };
      default:
        return {
          texto:
            'Aún no tengo suficientes registros para saberlo. Registra al menos 3 días en una semana y te digo cómo vas.',
        };
    }
  }

  if (contiene(t, ['peso', 'meta', 'progreso', 'avance', 'como voy'])) {
    const falta = c.metaPeso - peso;
    return {
      texto:
        falta > 0
          ? `Hoy pesas ${n1(peso)} kg y tu meta es ${n1(c.metaPeso)} kg: te faltan ${n1(falta)} kg.`
          : `Hoy pesas ${n1(peso)} kg: ¡ya alcanzaste tu meta de ${n1(c.metaPeso)} kg!`,
    };
  }

  if (contiene(t, ['gracias'])) return { texto: '¡De nada! Aquí estoy si tienes otra duda.' };

  if (contiene(t, ['hola', 'buenas', 'ayuda'])) {
    return {
      texto:
        'Hola. Puedo explicarte tu plan de proteína, tu superávit calórico y tu progreso, y darte consejos generales de ' +
        'carbohidratos, sueño, cafeína e hidratación. Para suplementos o casos especiales, pide la revisión de un nutriólogo.',
    };
  }

  return {
    texto:
      'No estoy seguro de entenderte. Puedo ayudarte con tu proteína, tu superávit, tu progreso, carbohidratos, sueño, ' +
      'cafeína o hidratación, o puedes pedir la revisión de un nutriólogo.',
  };
}
