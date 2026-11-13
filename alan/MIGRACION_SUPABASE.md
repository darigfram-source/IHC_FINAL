# Migración a Supabase (fase 1)

El web ahora usa **el mismo Supabase que la app Flutter**: una cuenta sirve en ambos lados.

## Configurar (una sola vez)
1. Vercel > Settings > Environment Variables: `NEXT_PUBLIC_SUPABASE_URL` y `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   (los mismos valores de `supabase.json` de la app). **Nunca** la llave `service_role`.
2. Supabase > Authentication > URL Configuration > **Redirect URLs**: agregar
   `https://nutrimasa.vercel.app/auth/callback` (y `http://localhost:3000/auth/callback` para desarrollo).
3. Borrar de Vercel las variables viejas `DATABASE_URL` y `AUTH_SECRET`: ya no se usan.

## Qué cambió
- Login/registro/logout con **Supabase Auth** (confirmación de correo incluida). Se eliminó el JWT propio,
  bcrypt, la conexión directa `pg`/Neon y las credenciales de prueba (`Password123!`), que además eran
  un acceso trasero real al panel.
- `proxy.ts` (antes `middleware.ts`, Next 16) valida la sesión con Supabase y el rol:
  **nutriólogo** = fila en `nutriologos` con `cedula_verificada` y `activo`; **paciente** = fila en `usuarios`.
- Portal del paciente (`/paciente/*`): perfil, registro diario y chat leen/escriben en Supabase con la sesión
  de la persona, así que **aplican tus reglas RLS**.
- `lib/motor-reglas.ts` es port de `motor_reglas.dart`: mismo plan (1.6-1.8 g/kg, tope 2.0, superávit 400-500)
  y mismo estado (En progreso / Estancado / Peso sube, cargas no).
- Registro web: la fila en `usuarios` se crea en el primer inicio de sesión (igual que en la app).
- Se borraron las rutas `/api/usuarios|mensajes|reportes|articulos` (devolvían datos de ejemplo sin sesión).
- `schema.sql` y `seed.sql` (Neon) quedaron en `legacy/`; ya no aplican.

## Pendiente (fase 2)
El **panel del nutriólogo** (`/admin`) ya exige sesión de nutriólogo verificado, pero sus pantallas siguen
leyendo `lib/data/initialData.ts` (datos de ejemplo en memoria). Falta conectar `NutriMasaContext` a Supabase:
usuarios del nutriólogo, chat, ajuste de plan (`ajustes_plan`), reportes y biblioteca.

## Asistente de IA del chat (paciente)
- Ruta: `POST /api/paciente/asesor`. Arma el contexto desde Supabase con la sesión de la persona, aplica el filtro de
  seguridad (`lib/asesor.ts`, port de `asesor.dart`), consulta al servidor de IA y, si falla o tarda, responde por reglas.
- Variable de entorno **solo de servidor** en Vercel: `ASESOR_URL` = la misma URL que usa la app
  (`https://tu-servidor/asesor`). Sin ella, el asistente responde solo por reglas.
- Ese servidor (carpeta `servidor/` de la app) debe tener `SUPABASE_URL` y `SUPABASE_ANON_KEY`: valida el token que
  manda la página. Sin ellas queda abierto a cualquiera.
- La conversación con el asistente se guarda solo en el navegador del paciente (igual que en la app).
