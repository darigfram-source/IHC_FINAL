// Consejos fijos de respaldo (los mismos de la app Flutter, contenido.dart).
// Se muestran cuando la IA no responde o su respuesta no pasa el filtro.
import { respuestaSegura } from './asesor';

export interface Consejo {
  tema: string;
  texto: string;
}

export const CONSEJOS: Consejo[] = [
  { tema: "Proteína", texto: "Apunta a 1.6 a 1.8 g de proteína por kg al día. Más de 2.0 g/kg no aporta más músculo." },
  { tema: "Proteína", texto: "Reparte tu proteína en 3 a 5 comidas de unos 0.4 g/kg cada una." },
  { tema: "Proteína", texto: "Un huevo aporta unos 6 g de proteína: tres en el desayuno ya son casi 20 g." },
  { tema: "Proteína", texto: "Frijoles, lentejas, requesón y yogur griego suman proteína accesible y económica." },
  { tema: "Proteína", texto: "Prepara proteína con anticipación (pollo, huevo cocido, atún) para no saltarte comidas." },
  { tema: "Superávit", texto: "Sube de peso despacio: de 0.25 a 0.5 % de tu peso por semana es un ritmo razonable." },
  { tema: "Superávit", texto: "El superávit se suma a lo que ya comes: antes de añadir calorías, anota tus comidas habituales." },
  { tema: "Superávit", texto: "Si tu peso sube pero tus cargas no, avísale a tu nutriólogo: puede haber exceso de calorías." },
  { tema: "Superávit", texto: "Si tu peso se estanca 2 semanas con buenos registros, tu nutriólogo puede subir el superávit hasta 500 kcal." },
  { tema: "Progreso", texto: "Pésate en ayunas, a la misma hora y después de ir al baño: la tendencia importa más que un día." },
  { tema: "Progreso", texto: "Registrar tu peso y tus cargas toma menos de 30 segundos: la constancia vale más que la perfección." },
  { tema: "Progreso", texto: "Una semana mala no arruina el plan: vuelve a tu rutina en la siguiente comida." },
  { tema: "Carbohidratos", texto: "Come carbohidratos 1 a 4 horas antes de entrenar: arroz, avena, tortilla, plátano o papa." },
  { tema: "Carbohidratos", texto: "Si entrenas cerca de 1 hora al día, apunta a 5 a 7 g de carbohidratos por kg al día." },
  { tema: "Carbohidratos", texto: "Después de entrenar combina proteína con carbohidratos; el total del día es lo que más cuenta." },
  { tema: "Entrenamiento", texto: "Busca 10 o más series semanales por grupo muscular y entrena cada grupo al menos 2 veces por semana." },
  { tema: "Entrenamiento", texto: "Termina cada serie con 1 a 3 repeticiones en reserva: cerca del fallo, pero con buena técnica." },
  { tema: "Entrenamiento", texto: "Anota tus cargas: subir un poco el peso o las repeticiones cada semana es la señal de progreso." },
  { tema: "Entrenamiento", texto: "Calienta con series ligeras de tu primer ejercicio antes de cargar pesado." },
  { tema: "Recuperación", texto: "Duerme al menos 7 horas: la recuperación también es parte del entrenamiento." },
  { tema: "Recuperación", texto: "Toma agua durante el día; la orina amarillo pálido es buena señal de hidratación." },
  { tema: "Recuperación", texto: "El alcohol después de entrenar reduce la síntesis de proteína muscular, aunque comas proteína." },
  { tema: "Suplementos", texto: "La creatina (3 a 5 g al día) es el suplemento con más evidencia; pregunta a tu nutriólogo si es para ti." },
  { tema: "Suplementos", texto: "La cafeína puede ayudarte a entrenar, pero no la tomes en las 6 horas previas a dormir." },
  { tema: "Suplementos", texto: "Desconfía de quemagrasas y pre-entrenos de fórmula secreta: busca sellos de pruebas de terceros." },
  { tema: "Mitos", texto: "No hay una ventana de 30 minutos que perder: lo importante es la proteína total del día." },
  { tema: "Mitos", texto: "Comer cada 2 o 3 horas no acelera el metabolismo: elige un horario que sí puedas cumplir." },
  { tema: "Hábitos", texto: "Come al menos 400 g de frutas y verduras al día (recomendación de la OMS)." },
  { tema: "Hábitos", texto: "Mide tus porciones unas semanas: ayuda a calibrar cuánto comes en realidad." },
  { tema: "Seguridad", texto: "Si algo te duele o te mareas, no lo ignores: consulta a un profesional de la salud." },
];

/** Un consejo distinto cada día (se repite al terminar la lista). `dia` es AAAA-MM-DD. */
export function consejoDelDia(dia: string): Consejo {
  const [y, m, d] = dia.split('-').map(Number);
  const n = Math.floor((Date.UTC(y, m - 1, d) - Date.UTC(y, 0, 1)) / 86_400_000);
  return CONSEJOS[((n % CONSEJOS.length) + CONSEJOS.length) % CONSEJOS.length];
}

const PROHIBIDAS = [
  'dolor', 'duele', 'mareo', 'desmay', 'sangre', 'diagnos', 'recet', 'medicament',
  'esteroide', 'quemagras', 'ayuno', 'purga', 'atracon', 'http', 'www.',
];

/** Mismos límites que la app: largo, palabras vetadas y rangos de proteína y superávit. */
export function consejoValido(tema: string, texto: string): boolean {
  const t = texto.trim();
  if (t.length < 25 || t.length > 220) return false;
  if (tema.trim().length === 0 || tema.trim().length > 20) return false;
  const bajo = t.toLowerCase();
  if (PROHIBIDAS.some((p) => bajo.includes(p))) return false;
  return respuestaSegura(t);
}
