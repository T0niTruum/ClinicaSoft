# ClinicaSoft

Aplicación backend de gestión clínica construida con Node.js, Express y PostgreSQL. Esta aplicación permite administrar pacientes, médicos, especialidades, horarios y citas médicas.

## Características principales

- Gestión de pacientes (CRUD)
- Visualización de citas agendadas
- Agendamiento de citas con médicos y especialidades
- Generación de horarios semanales para médicos
- API híbrida para respuestas JSON y vistas EJS
- Uso de Express, Sequelize, PostgreSQL y sesiones con `express-session`

## Requisitos

- Node.js 18+ / 20+
- `pnpm`
- PostgreSQL
- Una base de datos PostgreSQL accesible desde el proyecto

## Configuración

1. Clona el repositorio y entra en la carpeta del proyecto:

```bash
cd c:\Users\gless\Documents\GitHub\ClinicaSoft\ClinicaSoft
```

2. Instala dependencias:

```bash
pnpm install
```

3. Crea un archivo `.env` en la raíz del proyecto con al menos esta variable:

```env
DATABASE_URL=postgres://usuario:contraseña@localhost:5432/nombre_base_datos
```

4. Opcionalmente, define `PORT` y `SESSION_SECRET`:

```env
PORT=3000
SESSION_SECRET=mi-secreto-seguro
```

> Nota: Si no se define `SESSION_SECRET`, el proyecto usará un valor por defecto `clinicasoft-secret`.

## Inicializar la base de datos

Este proyecto usa un archivo SQL de esquema en `prisma/schema.sql` y un script de seed para cargar datos iniciales.

1. Asegúrate de que PostgreSQL esté ejecutándose y la base de datos indicada en `DATABASE_URL` exista.
2. Ejecuta el script de inicialización:

```bash
pnpm exec node src/db/initDB.js
```

3. Si necesitas generar nuevos horarios de la semana actual, usa:

```bash
pnpm exec node src/db/seedHorariosSemana.js
```

## Comandos disponibles

- `pnpm start`: Inicia el servidor en modo producción
- `pnpm dev`: Inicia el servidor con `nodemon` para recarga automática
- `pnpm exec node src/db/initDB.js`: Inicializa el esquema de base de datos y ejecuta seed
- `pnpm exec node src/db/seedHorariosSemana.js`: Inserta horarios de la semana actual en la base de datos

## Uso

1. Inicia el servidor:

```bash
pnpm dev
```

2. Abre el navegador en:

```text
http://localhost:3000
```

3. El acceso principal redirige a la lista de pacientes en `/pacientes`.

## Rutas principales

- `GET /` → Redirige a `/pacientes`
- `GET /pacientes` → Lista de pacientes
- `GET /agendar-cita` → Formulario para agendar cita
- `GET /citas` → Página de citas
- `GET /health` → Ruta de salud para comprobar el servicio

## Estructura del proyecto

- `src/server.js`: Configuración principal de Express
- `src/config/database.js`: Configuración de conexión a PostgreSQL
- `src/db/initDB.js`: Inicializa esquema y datos de prueba
- `src/db/seedHorariosSemana.js`: Genera horarios semanales para médicos
- `src/routes/`: Definición de rutas para API y páginas
- `src/controllers/`: Lógica de controladores
- `src/services/`: Lógica de negocio
- `src/repositories/`: Acceso a datos
- `src/views/`: Plantillas EJS
- `public/`: Activos estáticos (`css`, `js`)

## Notas adicionales

- La aplicación usa `express-session` para manejar sesiones del lado del servidor.
- La base de datos se conecta mediante `DATABASE_URL`; sin esta variable el servidor no arrancará.
- El proyecto está preparado para ejecutar en Windows y otros sistemas que soporten Node.js y PostgreSQL.

---

