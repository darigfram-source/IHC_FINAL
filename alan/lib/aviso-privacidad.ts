// Texto del aviso de privacidad. Una sola fuente: lo usan la página pública /aviso-privacidad (enlazada en el
// registro) y la ventana del menú. Lo que dice sobre la IA corresponde a lo que hoy envían estas rutas:
// app/api/paciente/asesor, app/api/paciente/consejo y app/api/nutriologo/sugerencias. Si cambias lo que se
// envía, cambia también este texto.

export interface SeccionAviso {
  titulo: string;
  texto: string;
}

export const SECCIONES_AVISO: SeccionAviso[] = [
  {
    titulo: 'Qué datos recabamos',
    texto:
      'Tu nombre, correo, edad, peso, estatura y nivel de entrenamiento; las declaraciones sobre tu estado de salud que haces al registrarte ' +
      '(sirven para confirmar que NutriMasa es adecuada para ti); tus registros diarios (peso en ayunas, volumen y cargas, y proteína si la anotas); ' +
      'tus metas; tus mensajes con tu nutriólogo; tus solicitudes de derechos ARCO y tus respuestas a la evaluación de usabilidad. ' +
      'Son datos personales de salud y se tratan como datos sensibles.',
  },
  {
    titulo: 'Para qué los usamos',
    texto:
      'Para confirmar que la app es adecuada para ti, calcular tu plan de proteína y calorías, mostrar tu progreso y permitir que tu nutriólogo te acompañe.',
  },
  {
    titulo: 'Quién puede verlos',
    texto:
      'Tú y el nutriólogo que tienes asignado. Además, cuando usas las funciones de inteligencia artificial, los proveedores externos de IA reciben ' +
      'los datos que se describen en el apartado siguiente.',
  },
  {
    titulo: 'Asistente de IA y proveedores externos',
    texto:
      'El asistente del chat, las sugerencias de respuesta que puede usar tu nutriólogo y el consejo del día se generan con proveedores externos de inteligencia artificial. ' +
      'El servidor intermedio de NutriMasa les envía: para el asistente del chat, tu nombre, edad, estatura, nivel, peso, meta y plan, tus 7 registros más recientes ' +
      'y los mensajes de tu conversación con el asistente; para las sugerencias a tu nutriólogo, tu primer nombre, peso, meta y plan, tus registros recientes y los mensajes ' +
      'de tu chat con él; y para el consejo del día, solo tu tendencia, sin nombre ni peso. Esos proveedores tratan los datos fuera de NutriMasa y según sus propias ' +
      'políticas, que NutriMasa no controla, y NutriMasa no puede borrar lo que ellos conserven. Si no estás de acuerdo con este uso, no escribas al asistente ' +
      'y ejerce tu derecho de oposición en “Ejercer mis derechos”.',
  },
  {
    titulo: 'Copia en tu dispositivo',
    texto:
      'Para que la app funcione sin internet, guardamos en este navegador una copia de tus datos y lo que está pendiente de enviar. ' +
      'Esa copia se borra al cerrar sesión desde la app.',
  },
  {
    titulo: 'Tus derechos',
    texto:
      'Puedes solicitar acceso, rectificación, cancelación u oposición al uso de tus datos (derechos ARCO) desde Menú > Ejercer mis derechos. ' +
      'Tu solicitud llega a tu nutriólogo, que debe responderte en el plazo que marca la ley. Si quieres que se eliminen tus datos, pídelo como solicitud de cancelación.',
  },
  {
    titulo: 'Consentimiento',
    texto: 'Antes de crear tu cuenta se te pide tu consentimiento informado, conforme a la Ley Federal de Protección de Datos Personales en Posesión de los Particulares (LFPDPPP).',
  },
];
