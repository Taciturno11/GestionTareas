# Backend - Gestion de tareas

API para la aplicacion de gestion de tareas.

## Objetivo

Este backend reemplazara gradualmente la persistencia actual del frontend en `localStorage`.

La base esta pensada para un uso inicial pequeno, alrededor de 10 a 20 personas, manteniendo una estructura escalable sin adoptar microservicios ni complejidad innecesaria.

## Stack

- Node.js
- Express
- TypeScript
- Prisma
- PostgreSQL
- Zod
- JWT
- Nodemailer

## Arquitectura

Se usa MVC modular por dominio.

```text
React frontend
  -> API REST
    -> routes
      -> controller
        -> service
          -> repository
            -> Prisma
              -> PostgreSQL
```

Responsabilidades:

- `routes`: define rutas HTTP y middlewares.
- `controller`: lee request, valida DTO y responde JSON.
- `service`: concentra reglas de negocio y permisos.
- `repository`: encapsula acceso a base de datos con Prisma.
- `dto`: define validacion de entrada con Zod.

## Estructura

```text
backend/
  prisma/
    schema.prisma

  src/
    modules/
      auth/
        auth.routes.ts
        auth.controller.ts
        auth.service.ts
        auth.dto.ts

      users/
        users.routes.ts
        users.controller.ts
        users.service.ts
        users.repository.ts
        users.dto.ts

      workspaces/
      spaces/
      pages/
      tasks/
      task-settings/

    database/
      prisma.ts

    middlewares/
      auth.middleware.ts
      error.middleware.ts

    config/
      env.ts

    shared/
      constants/
      utils/
      validators/

    app.ts
    server.ts
```

## Configuracion

Crear archivo `.env` desde `.env.example`.

```bash
cp .env.example .env
```

Variables:

```env
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/gestion_tareas?schema=public"
PORT=4000
CORS_ORIGIN="http://localhost:5173"
JWT_SECRET="change-me-in-development"
JWT_EXPIRES_IN="7d"
SMTP_HOST="smtp.gmail.com"
SMTP_PORT=465
SMTP_SECURE=true
SMTP_USER="unitek.signage@gmail.com"
SMTP_PASS=""
SMTP_FROM_EMAIL="unitek.signage@gmail.com"
SMTP_FROM_NAME="Unitek Signage"
AUTH_OTP_TTL_MINUTES=10
AUTH_OTP_LENGTH=6
AUTH_OTP_MAX_ATTEMPTS=5
AUTH_OTP_RESEND_COOLDOWN_SECONDS=60
AUTH_OTP_PEPPER=""
```

Notas:

- `DATABASE_URL`: conexion a PostgreSQL.
- `PORT`: puerto de API.
- `CORS_ORIGIN`: URL del frontend Vite.
- `JWT_SECRET`: secreto para firmar tokens. En produccion debe ser largo y privado.
- `JWT_EXPIRES_IN`: duracion del token.
- `SMTP_*`: configuracion del correo para 2FA por email.
- `AUTH_OTP_*`: reglas de vencimiento, intentos y cooldown del OTP.

## Comandos

Instalar dependencias:

```bash
npm install
```

Generar Prisma Client:

```bash
npm run prisma:generate
```

Crear/aplicar migraciones:

```bash
npm run prisma:migrate
```

Sincronizar schema directamente en desarrollo local:

```bash
npm run prisma:push
```

Levantar servidor de desarrollo:

```bash
npm run dev
```

Compilar TypeScript:

```bash
npm run build
```

Ejecutar build compilado:

```bash
npm start
```

Abrir Prisma Studio:

```bash
npm run prisma:studio
```

Importar backup local exportado desde Ajustes:

```bash
npm run import:backup -- ../backups-locales/gestion-tareas-backup-YYYY-MM-DD.json
```

El importador crea/actualiza:

- usuario local `martin.local@gestion-tareas.dev`.
- workspaces.
- espacios y subespacios.
- hojas.
- tareas.
- ajustes de tareas.
- snapshots de pizarras tldraw dentro de `Page.content`.

## Endpoints iniciales

Base API:

```text
/api
```

Healthcheck:

```text
GET /health
```

Auth:

```text
POST /api/auth/register
POST /api/auth/login
POST /api/auth/login/verify-otp
POST /api/auth/login/resend-otp
GET  /api/auth/me
PATCH /api/auth/me/2fa
```

Users:

```text
GET   /api/users/me
PATCH /api/users/me
```

Workspaces:

```text
GET    /api/workspaces
POST   /api/workspaces
GET    /api/workspaces/:id
PATCH  /api/workspaces/:id
DELETE /api/workspaces/:id
```

Spaces:

```text
GET    /api/spaces?workspaceId=
POST   /api/spaces
PATCH  /api/spaces/:id
POST   /api/spaces/:id/archive
POST   /api/spaces/:id/restore
DELETE /api/spaces/:id
```

Pages:

```text
GET    /api/pages?workspaceId=
GET    /api/pages?workspaceId=&spaceId=
POST   /api/pages
GET    /api/pages/:id
PATCH  /api/pages/:id
DELETE /api/pages/:id
```

Tasks:

```text
GET    /api/tasks?workspaceId=
GET    /api/tasks?workspaceId=&pageId=
POST   /api/tasks
PATCH  /api/tasks/:id
DELETE /api/tasks/:id
```

Task settings:

```text
GET /api/task-settings?workspaceId=
PUT /api/task-settings
```

## Autenticacion

Los endpoints privados requieren header:

```http
Authorization: Bearer <token>
```

El token se obtiene con:

```text
POST /api/auth/login
```

Si el usuario tiene `twoFactorEnabled=true`, ese endpoint primero responde un challenge OTP y el JWT solo se obtiene despues con:

```text
POST /api/auth/login/verify-otp
```

o:

```text
POST /api/auth/register
```

## Modelo de datos

Modelos principales en `prisma/schema.prisma`:

- `User`
- `Workspace`
- `WorkspaceMember`
- `Space`
- `Page`
- `Task`
- `TaskSettings`

## Importacion de backup local

Archivo:

```text
scripts/import-local-backup.ts
```

Uso:

```bash
npm run import:backup -- ../backups-locales/<archivo>.json
```

La importacion usa `upsert`, por lo que se puede ejecutar mas de una vez sin duplicar entidades principales.

Nota sobre pizarras:

- El frontend actual guarda pizarras tldraw en IndexedDB.
- El importador busca bases `TLDRAW_DOCUMENT_v2workspace-page-<pageId>`.
- Si encuentra datos, los guarda serializados en `Page.content` como backup.
- Falta conectar la UI para leer/restaurar esa pizarra desde API.

Relaciones principales:

- un usuario pertenece a muchos workspaces mediante `WorkspaceMember`.
- un workspace tiene espacios, paginas, tareas y ajustes.
- un espacio puede tener subespacios mediante `parentId`.
- una pagina pertenece a un espacio.
- una tarea pertenece a un workspace y opcionalmente a una pagina.

## Permisos

Base inicial:

- `OWNER`
- `MEMBER`

Regla actual:

- Todo endpoint privado valida que el usuario pertenezca al workspace.
- Operaciones destructivas sobre workspace requieren `OWNER`.
- Spaces, pages, tasks y task-settings requieren membresia del workspace.

## Convenciones para nuevos modulos

Crear un folder en `src/modules/<dominio>/` con:

```text
<dominio>.routes.ts
<dominio>.controller.ts
<dominio>.service.ts
<dominio>.repository.ts
<dominio>.dto.ts
```

Reglas:

- No acceder a Prisma desde controllers.
- No meter reglas de negocio en routes.
- Validar entradas con Zod en DTOs.
- Centralizar errores con `HttpError`.
- Usar `asyncHandler` para rutas async.
- Revisar permisos en services.

## Estado actual

Base funcional creada y compilando.

La base local puede sincronizarse con `npm run prisma:push`. Para despliegue en servidor conviene usar migraciones versionadas con `npm run prisma:migrate` durante desarrollo y `prisma migrate deploy` en produccion.

Pendiente:

- crear primera migracion versionada para despliegue controlado.
- agregar seed inicial.
- conectar frontend con API.
- migrar tareas de `localStorage` a backend.
- agregar refresh token o cookies seguras si se requiere mayor seguridad.
- agregar pruebas para OTP, expiracion y bloqueo por intentos.
- agregar tests de services y endpoints criticos.
