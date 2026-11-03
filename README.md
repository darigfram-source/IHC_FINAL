# NutriMasa - Panel Web del Nutriólogo Deportivo

Plataforma Web de Escritorio de Nutrición Deportiva Supervisada para Hipertrofia Muscular orientada a **Nutriólogos Deportivos Certificados**, desarrollada como parte del proyecto de **Interacción Humano-Computadora (IHC)** del **Centro Universitario de Ciencias Exactas e Ingenierías (CUCEI)** de la **Universidad de Guadalajara (UdeG)**.

Este sistema implementa con fidelidad absoluta el **maquetado de la Figura 8 ("Panel web del nutriólogo")** y los requerimientos funcionales y técnicos descritos en el documento de investigación académica.

---

## 🏋️‍♂️ Fundamento Científico y Reglas Nutricionales Implementadas

El sistema automatiza y asiste el criterio del especialista en base a la literatura citada en el proyecto:
- **Ingesta de Proteína Óptima**: 1.6 a 1.8 g/kg de peso corporal al día (Morton et al., 2018; Urdampilleta et al., 2012).
- **Tope de Seguridad Renal**: Advertencias clínicas al aproximarse o rebasar el límite seguro de **2.0 g/kg** para evitar aumento de presión intraglomerular e hiperfiltración renal (Jäger et al., 2017; de Lorenzo & Mihic, 2026; Ko et al., 2020).
- **Superávit Calórico Controlado**: Cálculo y ajuste de **400 a 500 kcal** sobre la dieta habitual para ganancia de masa magra sin acúmulo desproporcionado de tejido adiposo (Urdampilleta et al., 2012).
- **Ajuste Dinámico**: Recálculo automático de requerimientos conforme cambia el peso en ayunas reportado por el usuario (Palacios, 2020).
- **Suplementación con Evidencia Grado A**: Prescripción de Creatina Monohidratada (3–5 g/día continuos) y carbohidratos peri-entrenamiento (Urdampilleta et al., 2012).
- **Combate al "Bro-Science"**: Biblioteca de artículos educativos revisados para contrarrestar la desinformación en los gimnasios (Leal Lizcano et al., 2024).
- **Protección de Datos Sensibles**: Cumplimiento ético y normativo con la Ley Federal de Protección de Datos Personales en Posesión de los Particulares (LFPDPPP).

---

## 🖥️ Módulos y Pantallas Web

### 1. Autenticación y Acceso Médico
- Pestañas con selector de rol (*"Soy usuario"* vs *"Soy nutriólogo"* conforme a la Figura 1).
- Aviso legal de datos sensibles de salud conforme a la LFPDPPP.
- Acceso rápido con 1-clic a cuenta demo de especialista para evaluación ágil.

### 2. Dashboard / Mis Usuarios (Fiel a la Figura 8)
- **Barra lateral oscura (*Panel*)**: Con accesos a *Usuarios*, *Mensajes*, *Reportes* y *Biblioteca*.
- **Tabla interactiva central (*Mis usuarios*)**:
  - Columnas: `Usuario`, `Peso`, `Cargas`, `Estado`, `Acción rápida`.
  - Estados clínicos: `En progreso` (verde), `Estancado` (ámbar), `Peso sube, cargas no` (rojo).
  - Filtros instantáneos y buscador por paciente.
- **Tarjeta de Inspección Rápida (Columna derecha)**:
  - Ficha de *Usuario 02* (Darío Fuentes) y demás pacientes.
  - Gráfica interactiva de *"Peso, últimas 4 semanas"*.
  - Botones de acción directa: `[Ajustar superávit]`, `[Escribir mensaje]` y `[Exportar reporte]`.

### 3. Detalle Profundo y Gráficas de Evolución
- Gráfica de evolución de peso en ayunas con línea de objetivo.
- Gráfica de progresión de cargas en **Sentadilla** y **Press de banca** (kg).
- Gráfica de volumen total de entrenamiento semanal.
- Motor de cálculo y desglose de macronutrientes.
- Historial completo de registros diarios (sincronizados desde la app móvil).
- Cuestionario de elegibilidad y salud.

### 4. Chat Asíncrono Especialista-Paciente
- **Aviso legal fijo y obligatorio**: *"Este chat no es en tiempo real ni sirve para urgencias médicas. Si tienes síntomas, acude con un profesional de la salud."*
- Botones de plantillas clínicas rápidas: Recomendar Creatina (5g/día), Timing de carbohidratos pre-entrenamiento, Alerta de moderación proteica.
- Historial de mensajes etiquetados con ajustes nutricionales y confirmación de lectura.

### 5. Generador y Exportador de Reportes Periódicos
- Periodos semanal y mensual.
- Evaluación clínica y recomendaciones para el siguiente periodo.
- Formato imprimible oficial con membrete de la Universidad de Guadalajara (CUCEI), métricas de adherencia, variación neta de masa y firma con cédula profesional del nutriólogo deportivo.

### 6. Biblioteca Educativa
- Panel para activar/desactivar la visibilidad de guías en la app móvil del paciente.
- Creador de nuevos artículos y lector interactivo de revisiones científicas.

---

## 🗄️ Esquema de Base de Datos PostgreSQL

Se incluyen los scripts SQL listos para producción:
- [`schema.sql`](./schema.sql): Tablas `nutriologos`, `usuarios`, `registros_diarios`, `mensajes_chat`, `ajustes_plan`, `reportes` y `articulos_educativos`.
- [`seed.sql`](./seed.sql): Poblado inicial de datos realistas correspondientes a las figuras del maquetado.

Compatible con **Supabase**, **Neon** y **Vercel Postgres**.

---

## 🚀 Despliegue en Vercel y Configuración

Consulta la guía detallada en [`DEPLOYMENT.md`](./DEPLOYMENT.md) para los pasos paso a paso de aprovisionamiento de base de datos gratuita y despliegue a producción en un clic.

```bash
# Desarrollo local:
npm run dev

# Compilación de producción:
npm run build
```
