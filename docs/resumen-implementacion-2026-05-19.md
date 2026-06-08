# Resumen de implementacion - 2026-05-19

Este documento resume el trabajo realizado para pasar el proyecto de una SPA solo frontend con datos locales hacia una base full-stack con backend, base de datos PostgreSQL y migracion inicial de datos.

## Estado general

La aplicacion ahora tiene:

- frontend React/Vite/TypeScript.
- backend Express/TypeScript con arquitectura MVC modular.
- base de datos PostgreSQL local.
- Prisma como ORM.
- documentacion de arquitectura frontend, backend y modelo entidad-relacion.
- backup local exportable desde la UI.
- importacion del backup local hacia PostgreSQL.
- login frontend conectado al backend.
- sincronizacion inicial de workspaces, espacios y paginas desde PostgreSQL hacia la capa local temporal.

## Frontend

### Estructura agregada

Se agregaron capas para preparar el frontend para API real:

```text
src/
  api/
    http.ts
    auth.api.ts
    workspaces.api.ts
    spaces.api.ts
    pages.api.ts
    tasks.api.ts
    task-settings.api.ts

  hooks/
    useTasks.ts
    useWorkspaces.ts
    useTaskSettings.ts

  services/
    auth-token.ts
    backend-sync.ts

  utils/
    date.utils.ts
    task.utils.ts
```

La estructura anterior se mantiene:

```text
src/
  assets/
  components/
  data/
  lib/
  pages/
  types/
```

### API frontend

`src/api/http.ts` centraliza:

- URL base de API.
- token `Bearer`.
- JSON request/response.
- errores HTTP.
- limpieza de token ante `401`.

La URL base por defecto es:

```text
http://localhost:4000/api
```

Puede cambiarse con:

```env
VITE_API_BASE_URL=
```

### Auth frontend

`LoginPage` ahora usa:

```text
POST /api/auth/login
```

Al iniciar sesion:

1. guarda token en `gt_auth_token`.
2. sincroniza workspaces, spaces y pages desde backend.
3. navega a `/`.

Token:

```text
src/services/auth-token.ts
```

### Sincronizacion backend -> local temporal

Archivo:

```text
src/services/backend-sync.ts
```

Sincroniza:

- workspaces.
- spaces.
- pages.

Desde API hacia `localStorage`.

Esto es temporal para mantener funcionando `Sidebar`, `PageView`, `SubspaceView` y `ArchivePage` mientras se migran completamente a backend.

### Backup local

Archivo:

```text
src/lib/localBackup.ts
```

Boton en:

```text
src/pages/AjustesPage.tsx
```

Exporta:

- `localStorage`.
- `sessionStorage`.
- `indexedDB`.

Esto cubre datos principales y pizarras tldraw guardadas por el navegador.

La carpeta local recomendada para guardar backups es:

```text
backups-locales/
```

Esta carpeta esta ignorada por git.

### Lazy loading

Se redujo el bundle inicial con `React.lazy`.

Archivos:

```text
src/App.tsx
src/pages/PageView.tsx
src/components/RouteFallback/RouteFallback.tsx
```

Antes:

```text
index.js ~2.8 MB
gzip ~843 KB
```

Despues:

```text
index.js ~45 KB
gzip ~10 KB
```

Las librerias pesadas cargan solo cuando se necesitan:

- Tiptap al abrir hojas de texto.
- tldraw al abrir pizarras.
- React Flow al abrir diagramas BD.

## Backend

### Stack

```text
Node.js
Express
TypeScript
Prisma
PostgreSQL
Zod
JWT
```

### Estructura

```text
backend/
  prisma/
    schema.prisma

  scripts/
    import-local-backup.ts

  src/
    modules/
      auth/
      users/
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

### Arquitectura

MVC modular por dominio:

```text
routes -> controller -> service -> repository -> Prisma -> PostgreSQL
```

Reglas:

- controllers no acceden directo a Prisma.
- services validan reglas y permisos.
- repositories encapsulan queries Prisma.
- DTOs usan Zod.
- middlewares manejan auth y errores.

### Endpoints principales

```text
GET  /health

POST /api/auth/register
POST /api/auth/login
GET  /api/auth/me

GET   /api/users/me
PATCH /api/users/me

GET    /api/workspaces
POST   /api/workspaces
GET    /api/workspaces/:id
PATCH  /api/workspaces/:id
DELETE /api/workspaces/:id

GET    /api/spaces?workspaceId=
POST   /api/spaces
PATCH  /api/spaces/:id
POST   /api/spaces/:id/archive
POST   /api/spaces/:id/restore
DELETE /api/spaces/:id

GET    /api/pages?workspaceId=
GET    /api/pages/:id
POST   /api/pages
PATCH  /api/pages/:id
DELETE /api/pages/:id

GET    /api/tasks?workspaceId=
POST   /api/tasks
PATCH  /api/tasks/:id
DELETE /api/tasks/:id

GET /api/task-settings?workspaceId=
PUT /api/task-settings
```

## Base de datos

### Motor

PostgreSQL local:

```text
PostgreSQL 17.5
database: gestion_tareas
host: localhost
port: 5432
```

### Prisma schema

Archivo:

```text
backend/prisma/schema.prisma
```

Modelos:

```text
User
Workspace
WorkspaceMember
Space
Page
Task
TaskSettings
```

### Relaciones principales

```text
User N:M Workspace via WorkspaceMember
Workspace 1:N Space
Workspace 1:N Page
Workspace 1:N Task
Workspace 1:1 TaskSettings
Space 1:N Space via parentId
Space 1:N Page
Page 1:N Task opcional
User 1:N Task createdBy
User 1:N Task assignee opcional
```

Diagrama:

```text
docs/database-er.md
```

### Datos importados desde backup

Se importo el backup local hacia PostgreSQL.

Resultado:

```text
User: 1
Workspace: 4
Space: 17
Page: 31
Task: 1
TaskSettings: 4
Pizarras tldraw: 16 snapshots
```

Las pizarras tldraw se guardaron como snapshot serializado dentro de `Page.content`.

## Comandos utiles

Frontend:

```bash
npm run dev
npm run build
npm run lint
```

Backend:

```bash
cd backend
npm run dev
npm run build
npm start
npm run prisma:generate
npm run prisma:migrate:deploy
npm run prisma:migrate
npm run prisma:studio
```

Importar backup:

```bash
cd backend
npm run import:backup -- ../backups-locales/<archivo>.json
```

## Variables de entorno

Backend usa:

```text
backend/.env
```

No se sube a git.

Plantilla:

```text
backend/.env.example
```

Variables:

```env
DATABASE_URL=
PORT=4000
JWT_SECRET=
JWT_EXPIRES_IN=7d
```

## Documentacion creada

```text
docs/backend.md
docs/database-er.md
docs/frontend-arquitectura.md
docs/resumen-implementacion-2026-05-19.md
backend/README.md
```

ADRs:

```text
docs/adr/0016-archivado-de-espacios.md
docs/adr/0017-backend-mvc-modular-con-express-prisma-y-postgresql.md
docs/adr/0018-estructura-frontend-escalable-para-api-hooks-y-utils.md
```

## Estado actual de integracion

Hecho:

- backend creado.
- PostgreSQL local conectado.
- schema Prisma aplicado.
- backup local importado.
- login frontend conectado al backend.
- token frontend guardado.
- sync inicial backend -> localStorage para workspaces/spaces/pages.
- escrituras locales de spaces/pages espejadas al backend.
- bundle inicial optimizado con lazy loading.

Pendiente:

- migrar `DashboardPage` y `CalendarPage` a `/api/tasks`.
- migrar `AjustesPage` a `/api/task-settings`.
- hacer que `PageView`, `TextPage` y `DatabaseDiagramPage` dependan directamente de API.
- restaurar/guardar pizarras tldraw desde backend, no solo desde IndexedDB.
- reemplazar `localStorage` como fuente principal de datos.
- agregar tests para auth/permisos/importador.
- generar migracion versionada para despliegue en servidor.

## Seguridad y datos privados

No se debe subir a git:

```text
backend/.env
backups-locales/
backend/dist/
*.log
node_modules/
```

Ya estan cubiertos por `.gitignore`.
