// Normativa aplicable al nutriólogo que usa NutriMasa (port de contenido.dart). No aplica al paciente.

export interface NormaSeccion {
  titulo: string;
  resumen: string;
  puntos: string[];
  fuente: string;
}

export const NORMATIVA_AVISO =
  'Resumen informativo para el profesional que usa NutriMasa. Es orientación del prototipo, no asesoría legal: antes de operar con pacientes reales, valídalo con un abogado o responsable de cumplimiento.';

export const NORMATIVA_PROFESIONAL: NormaSeccion[] = [
  {
    titulo: 'Datos personales de salud (LFPDPPP)',
    resumen: 'Los datos de salud son datos sensibles; quien los recaba es el responsable.',
    puntos: [
      'El 20 de marzo de 2025 se publicó en el DOF la nueva Ley Federal de Protección de Datos Personales en Posesión de los Particulares, vigente desde el 21 de marzo de 2025. Sustituye a la ley de 2010.',
      'La autoridad ya no es el INAI: ahora es la Secretaría Anticorrupción y Buen Gobierno.',
      'El estado de salud presente o futuro es un dato personal sensible: pide consentimiento informado y documentado, y usa los datos solo para las finalidades del aviso de privacidad.',
      'Pon el aviso de privacidad a disposición de cada persona desde que recabas sus datos.',
      'Atiende solicitudes de acceso, rectificación, cancelación y oposición (ARCO). Consulta los plazos vigentes en la ley y su reglamento.',
      'Aplica medidas de seguridad administrativas, técnicas y físicas. Si hay una vulneración, notifica a las personas afectadas según el procedimiento vigente.',
    ],
    fuente: 'Ley Federal de Protección de Datos Personales en Posesión de los Particulares (DOF 20/03/2025).',
  },
  {
    titulo: 'Expediente (NOM-004-SSA3-2012)',
    resumen: 'El expediente es tuyo como prestador, y se conserva al menos 5 años.',
    puntos: [
      'La norma aplica a profesionales y establecimientos de atención, incluidos consultorios. Para nutriología, el numeral 5.16 indica que el expediente se ajusta a la naturaleza del servicio.',
      'Conserva el expediente mínimo 5 años a partir de la fecha del último acto médico (numeral 5.4). Si no dependes de una institución, el prestador es el propietario.',
      'Cada nota lleva fecha y hora, nombre completo de quien la elabora y firma autógrafa, electrónica o digital (numeral 5.10).',
      'Escribe con lenguaje claro, sin abreviaturas ambiguas, sin enmendaduras ni tachaduras (numeral 5.11).',
      'Los datos que identifican a la persona no se divulgan. Publicarlos en docencia o investigación requiere autorización escrita (numeral 5.5).',
      'Un resumen clínico u otra constancia se entrega por solicitud escrita (numeral 5.6).',
    ],
    fuente: 'NOM-004-SSA3-2012, Del expediente clínico.',
  },
  {
    titulo: 'Ejercicio profesional',
    resumen: 'Solo con título registrado; no se sustituye la atención médica.',
    puntos: [
      'La Ley General de Salud (art. 79) exige título profesional legalmente expedido y registrado ante la autoridad educativa para ejercer actividades profesionales de nutrición y dietología. La cédula profesional es la constancia de ese registro.',
      'Ten a la vista tu cédula y los datos de tu consultorio o institución.',
      'Mantén la orientación dentro de tu competencia: alimentación y hábitos. No diagnostiques ni prescribas medicamentos.',
      'Cuando haya una condición médica, canaliza con un médico y documéntalo.',
    ],
    fuente: 'Ley General de Salud, art. 79; Ley Reglamentaria del art. 5 constitucional.',
  },
  {
    titulo: 'Secreto profesional y confidencialidad',
    resumen: 'Lo que te cuenta cada persona es confidencial.',
    puntos: [
      'Solo se entrega información a terceros con solicitud escrita de la persona o de su representante legal, o a autoridades competentes (NOM-004, numerales 5.5.1 y 5.7).',
      'Revelar un secreto sin justa causa y con perjuicio de alguien puede constituir un delito (Código Penal Federal, arts. 210 y 211).',
      'No compartas capturas de chats ni datos de pacientes en redes sociales o grupos, ni siquiera sin nombre si la persona puede ser identificada.',
      'Cierra la sesión en equipos compartidos y protege tu cuenta con contraseña robusta.',
    ],
    fuente: 'NOM-004-SSA3-2012; Código Penal Federal, arts. 210 y 211.',
  },
  {
    titulo: 'Orientación alimentaria (NOM-043-SSA2-2012)',
    resumen: 'Criterios para dar orientación alimentaria de forma segura.',
    puntos: [
      'La orientación se basa en evidencia científica y se adapta a la persona.',
      'No prometas resultados ni uses mensajes engañosos o de “milagro”.',
      'Mantén los rangos de la app: proteína de 1.6 a 1.8 g/kg (tope 2.0 g/kg) y superávit de 400 a 500 kcal.',
      'Informa los límites del servicio: no sustituye a un médico ni sirve para urgencias.',
    ],
    fuente: 'NOM-043-SSA2-2012, Promoción y educación para la salud en materia alimentaria.',
  },
  {
    titulo: 'Alcance de NutriMasa y canalización',
    resumen: 'La app no es para todas las personas.',
    puntos: [
      'No es para personas de menos de 18 o más de 40 años, ni para nivel avanzado en esta versión.',
      'Canaliza a un profesional médico si hay enfermedad renal o diabetes, embarazo o lactancia, o trastorno de la conducta alimentaria.',
      'El asistente de IA no es un profesional de la salud: sus respuestas numéricas salen del motor de reglas y los casos de salud se derivan.',
      'El chat es asíncrono y no es canal de urgencias.',
    ],
    fuente: 'Criterios de elegibilidad de NutriMasa.',
  },
  {
    titulo: 'Registro electrónico y seguridad',
    resumen: 'Si la app se vuelve un sistema de registro de salud, habrá más requisitos.',
    puntos: [
      'La NOM-024-SSA3-2012 establece los requisitos de los sistemas de información de registro electrónico para la salud y el intercambio de información. Revísala antes de usar NutriMasa como expediente electrónico.',
      'Este prototipo guarda los datos en el dispositivo y, si se configura Supabase, en la nube. El cifrado y la seguridad de servidores requieren una revisión formal.',
      'Usa copias de seguridad, control de accesos y registro de quién consulta cada expediente.',
    ],
    fuente: 'NOM-024-SSA3-2012; LFPDPPP (medidas de seguridad).',
  },
];

export const LISTA_VERIFICACION_PROFESIONAL: string[] = [
  'Aviso de privacidad entregado y consentimiento informado registrado.',
  'Tu cédula profesional está a la vista y es verificable.',
  'Cada ajuste del plan queda anotado con fecha, motivo y valores anterior y nuevo.',
  'Las derivaciones médicas quedaron documentadas.',
  'Tienes un procedimiento para atender solicitudes ARCO.',
  'Conservas el expediente al menos 5 años desde el último acto.',
  'Ningún dato de salud se comparte fuera de la app sin autorización escrita.',
];
