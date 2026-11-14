// Validación de "Mi perfil y datos". La usan la pantalla y la ruta del servidor para que
// acepten exactamente lo mismo. Mismos rangos que la app Flutter (menu_pages.dart: PerfilPage).

export const EDAD_MIN = 18;
export const EDAD_MAX = 40;
export const PESO_MIN = 30;
export const PESO_MAX = 250;
export const ESTATURA_MIN = 100;
export const ESTATURA_MAX = 230;
export const NIVELES = ['Principiante', 'Intermedio'] as const;
export type NivelEntrenamiento = (typeof NIVELES)[number];

/** Lee un número escrito por la persona ("78", "78.5", "78,5"). null si no es un número. */
export function leerNumero(texto: string): number | null {
  const t = String(texto ?? '').trim().replace(',', '.');
  if (!/^\d{1,4}(\.\d{1,2})?$/.test(t)) return null;
  return Number(t);
}

const enRango = (v: number | null, a: number, b: number): v is number => v !== null && v >= a && v <= b;

export interface DatosPerfil {
  nombre: string;
  edad: number;
  peso_actual: number;
  estatura_cm: number;
  nivel_entrenamiento: NivelEntrenamiento;
}

export type ErroresPerfil = Partial<Record<'nombre' | 'edad' | 'peso' | 'estatura', string>>;

/** Valida lo escrito en el formulario. Devuelve los datos limpios o un texto de error por campo. */
export function validarPerfil(f: {
  nombre: string;
  edad: string;
  peso: string;
  estatura: string;
  nivel: string;
}): { ok: true; datos: DatosPerfil } | { ok: false; errores: ErroresPerfil } {
  const errores: ErroresPerfil = {};
  const nombre = f.nombre.trim().replace(/\s+/g, ' ');
  if (!nombre) errores.nombre = 'Escribe tu nombre';
  else if (nombre.length > 80) errores.nombre = 'Máximo 80 letras';

  const edad = leerNumero(f.edad);
  if (!enRango(edad, EDAD_MIN, EDAD_MAX) || !Number.isInteger(edad)) errores.edad = `Entre ${EDAD_MIN} y ${EDAD_MAX}`;

  const peso = leerNumero(f.peso);
  if (!enRango(peso, PESO_MIN, PESO_MAX)) errores.peso = `Entre ${PESO_MIN} y ${PESO_MAX}`;

  const estatura = leerNumero(f.estatura);
  if (!enRango(estatura, ESTATURA_MIN, ESTATURA_MAX)) errores.estatura = `Entre ${ESTATURA_MIN} y ${ESTATURA_MAX}`;

  const nivel = (NIVELES as readonly string[]).includes(f.nivel) ? (f.nivel as NivelEntrenamiento) : null;

  if (Object.keys(errores).length > 0 || !nivel) return { ok: false, errores };
  return {
    ok: true,
    datos: {
      nombre,
      edad: edad as number,
      peso_actual: Math.round((peso as number) * 10) / 10,
      estatura_cm: Math.round((estatura as number) * 10) / 10,
      nivel_entrenamiento: nivel,
    },
  };
}
