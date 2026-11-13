// Port a TypeScript de lib/sugerencias.dart (app Flutter). Mantener sincronizado:
// los borradores de respuesta del nutriólogo deben salir igual en la app y en la web.
import { SUPERAVIT_MIN, SUPERAVIT_MAX, SUPERAVIT_BASE, type EstadoMotor } from './motor-reglas';

/** Superávit que se propone al nutriólogo según el estado del paciente (siempre entre 400 y 500 kcal). */
export function superavitSugerido(estado: EstadoMotor): number {
  switch (estado) {
    case 'estancado':
      return SUPERAVIT_MAX;
    case 'pesoSubeCargasNo':
      return SUPERAVIT_MIN;
    default:
      return SUPERAVIT_BASE;
  }
}

/** Tres borradores sin IA, según el estado del paciente. Respaldo si el servidor de IA falla.
 *  "variante" impar alterna con el otro juego, para que "Generar otras" no repita lo mismo. */
export function sugerenciasDeReglas(p: {
  nombre: string;
  estado: EstadoMotor;
  superavit: number;
  variante?: number;
}): string[] {
  const { nombre, estado, superavit } = p;
  const sug = superavitSugerido(estado);
  let ajuste: string;
  switch (estado) {
    case 'estancado':
      ajuste =
        `Veo que llevas unos días estancado con buenos registros. Propongo subir tu superávit de +${superavit} a ` +
        `+${sug} kcal y concentrar los carbohidratos alrededor del entrenamiento.`;
      break;
    case 'pesoSubeCargasNo':
      ajuste =
        `Tu peso sube pero tus cargas no. Propongo bajar tu superávit de +${superavit} a +${sug} kcal ` +
        'y revisar tu descanso y tu progresión de entrenamiento.';
      break;
    case 'enProgreso':
      ajuste = `Vas bien: tu peso y tus cargas avanzan. Mantenemos tu plan actual (+${superavit} kcal).`;
      break;
    default:
      ajuste =
        'Todavía tengo pocos registros para evaluar tu tendencia. Con 3 o más en una semana ' +
        'puedo ajustar tu plan con más precisión.';
  }
  if ((p.variante ?? 0) % 2 === 1) {
    return [
      `Hola ${nombre}, ¿cómo te has sentido con el plan esta semana? ${ajuste}`,
      `Hola ${nombre}, ¿qué comidas se te complican más? Con eso te propongo opciones fáciles ` +
        'para llegar a tu proteína del día.',
      `Hola ${nombre}, gracias por mantener tus registros. Si algo te preocupa o tienes dudas, ` +
        'escríbeme y lo vemos.',
    ];
  }
  return [
    `Hola ${nombre}, gracias por escribir. ${ajuste}`,
    `Hola ${nombre}, para ayudarte mejor cuéntame: ¿cómo has dormido y cuántas comidas haces al día? ` +
      'Con eso reviso si conviene ajustar algo.',
    `Hola ${nombre}, buen trabajo con tu constancia. Sigue registrando tu peso en ayunas y tus cargas; ` +
      'la próxima semana revisamos tu avance juntos.',
  ];
}
