// Preguntas frecuentes de la pantalla Ayuda. Las cinco primeras son las mismas que en la app Flutter
// (menu_pages.dart: AyudaPage); las demás explican pantallas que existen en la web. Mantener sincronizado.

export interface Pregunta {
  pregunta: string;
  respuesta: string;
}

export const PREGUNTAS_FRECUENTES: Pregunta[] = [
  {
    pregunta: '¿Cómo hago mi registro diario?',
    respuesta:
      'Ve a la pestaña Registro. Escribe tu peso en ayunas (es lo único obligatorio), tus cargas y, si quieres, tu proteína del día. Toca Guardar y sincronizar registro.',
  },
  {
    pregunta: '¿Qué pasa si no tengo internet?',
    respuesta: 'El registro se guarda en tu dispositivo y se sincroniza después, en cuanto vuelva la conexión.',
  },
  {
    pregunta: '¿Por qué mi proteína tiene un tope?',
    respuesta:
      'El rango que respalda la evidencia es de 1.6 a 1.8 g/kg al día, y la app no recomienda más de 2.0 g/kg. Pasar de ahí no aporta más músculo.',
  },
  {
    pregunta: '¿El chat sirve para urgencias?',
    respuesta: 'No. El chat no es en tiempo real. Si tienes síntomas, acude con un profesional de la salud.',
  },
  {
    pregunta: '¿Quién ve mis datos?',
    respuesta:
      'Solo tú y el nutriólogo que tienes asignado. Revisa el aviso de privacidad en el menú.',
  },
  {
    pregunta: '¿Tengo que registrar mi proteína todos los días?',
    respuesta:
      'No, es opcional. Si la registras, te avisamos cuando quede arriba de tu rango de 1.6 a 1.8 g/kg o cerca del tope de 2.0 g/kg.',
  },
  {
    pregunta: '¿Cómo cambio mi nombre, peso o estatura?',
    respuesta:
      'En Menú, entra a Mi perfil y datos. Tu peso objetivo se cambia en Metas fijadas. La proteína y el superávit los define tu nutriólogo.',
  },
  {
    pregunta: '¿Cómo borro mis registros y mensajes?',
    respuesta:
      'En Mi perfil y datos, al final, toca Borrar registros y mensajes. Se eliminan en tu dispositivo y en la nube, y no se puede deshacer. Necesitas internet.',
  },
  {
    pregunta: 'No me llegó el correo de confirmación',
    respuesta:
      'Revisa la carpeta de spam. Si no está, en Iniciar sesión escribe tu correo, intenta entrar y toca Reenviar correo de confirmación.',
  },
];
