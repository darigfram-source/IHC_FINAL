# Guía de Despliegue en Vercel y Configuración de Base de Datos Gratuita - NutriMasa

Esta guía detalla los pasos para desplegar el **Panel Web del Nutriólogo NutriMasa** en **Vercel** conectado a una base de datos PostgreSQL gratuita (**Supabase**, **Neon** o **Vercel Postgres**).

---

## 1. Configuración de Base de Datos Gratuita

El proyecto incluye dos archivos SQL listos para ejecutarse:
- `schema.sql`: Define las tablas (`nutriologos`, `usuarios`, `registros_diarios`, `mensajes_chat`, `ajustes_plan`, `reportes`, `articulos_educativos`) e índices.
- `seed.sql`: Carga datos iniciales con los usuarios y valores del maquetado (Figura 8: Usuario 01, Usuario 02, Usuario 03, registros de 4 semanas, etc.).

### Opción A: Supabase (Recomendada - 500 MB gratis)
1. Ve a [https://supabase.com](https://supabase.com) y crea una cuenta gratuita.
2. Haz clic en **"New project"**, asígnale el nombre `nutrimasa-db` y define una contraseña segura para la base de datos.
3. Una vez creado el proyecto, ve al menú lateral izquierdo y abre el **"SQL Editor"**.
4. Haz clic en **"New query"**, copia y pega el contenido completo de `schema.sql` y presiona **"Run"**.
5. Abre otra consulta, copia y pega el contenido de `seed.sql` y presiona **"Run"**.
6. Ve a **Project Settings** > **Database** > **Connection string** > selecciona **URI** y copia la URL (ejemplo: `postgresql://postgres.[ref]:[password]@aws-0-us-west-1.pooler.supabase.com:6543/postgres`).

### Opción B: Neon Serverless Postgres (Gratuito - 512 MB)
1. Ingresa a [https://neon.tech](https://neon.tech) e inicia sesión con GitHub.
2. Crea un proyecto con el nombre `nutrimasa`.
3. Ve a la pestaña **SQL Editor**, ejecuta primero `schema.sql` y luego `seed.sql`.
4. En el Dashboard principal copia la **Connection String** que tiene el formato:
   `postgresql://usuario:password@ep-xyz.us-east-2.aws.neon.tech/neondb?sslmode=require`.

### Opción C: Vercel Postgres / Neon Marketplace
1. En tu panel de Vercel, entra a la pestaña **Storage**.
2. Selecciona **Create Database** > **Postgres** (desarrollado por Neon).
3. Conéctalo a tu proyecto y Vercel inyectará automáticamente las variables `POSTGRES_URL` y `DATABASE_URL`.
4. En la pestaña **Query Console** de Vercel Storage, ejecuta el script de `schema.sql` y `seed.sql`.

---

## 2. Despliegue en Vercel

### Paso 1: Subir el proyecto a GitHub
Si no tienes el repositorio inicializado:
```bash
git init
git add .
git commit -m "NutriMasa - Panel del Nutriólogo Deportivo (CUCEI IHC)"
git branch -M main
git remote add origin https://github.com/TU_USUARIO/nutrimasa-web.git
git push -u origin main
```

### Paso 2: Importar en Vercel
1. Ingresa a [https://vercel.com](https://vercel.com) e inicia sesión.
2. Haz clic en **"Add New..."** > **"Project"**.
3. Importa tu repositorio `nutrimasa-web`.
4. En **Framework Preset**, Vercel detectará automáticamente **Next.js**.

### Paso 3: Configurar Variables de Entorno en Vercel
En la sección **Environment Variables**, añade:
| Variable | Valor |
|---|---|
| `DATABASE_URL` | La cadena de conexión obtenida de Supabase o Neon |
| `NEXT_PUBLIC_APP_ENV` | `production` |

*(Nota: La aplicación cuenta con un motor de contingencia resiliente que permite operar y navegar inmediatamente aún si la base de datos se conecta posteriormente).*

### Paso 4: Desplegar
1. Haz clic en **"Deploy"**.
2. En menos de 2 minutos, Vercel generará tu URL pública de producción (ejemplo: `https://nutrimasa.vercel.app`).

---

## 3. Credenciales y Uso del Panel

- **URL de Acceso**: `/`
- **Pestaña de Acceso**: "Soy nutriólogo"
- **Correo Demo**: `nutriologo@nutrimasa.com`
- **Contraseña**: `12345678` (o presionar el botón *"Acceso Rápido con Cuenta Demo Certificada"*).

### Módulos Listos y Probados:
- **Dashboard / Mis Usuarios**: Tabla interactiva idéntica a la Figura 8 con estados (*En progreso*, *Estancado*, *Peso sube, cargas no*).
- **Inspector Rápido**: Gráfico de peso de las últimas 4 semanas y botones de ajuste, mensaje y reporte.
- **Detalle del Paciente**: Gráficos de sentadilla, press de banca, volumen de trabajo, cálculo de proteína (1.6 - 1.8 g/kg) y límite seguro de 2.0 g/kg.
- **Chat Asíncrono**: Con aviso legal obligatorio y sugerencias científicas (Creatina, Timing de Carbos).
- **Reportes**: Generación y formato imprimible para exportar a PDF con cédula profesional.
- **Biblioteca Educativa**: Panel para activar/desactivar guías y combatir el *bro-science*.
