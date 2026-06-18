# Backend

Documento operativo del backend MVC modular.

## Decision base

El backend vive en `backend/` y esta documentado formalmente en:

- `docs/adr/0017-backend-mvc-modular-con-express-prisma-y-postgresql.md`
- `docs/database-er.md`

Stack:

- Express
- TypeScript
- Prisma
- PostgreSQL
- Zod
- JWT

## Modelo de tenancy

La aplicacion usa multitenancy logico por workspace en una base PostgreSQL compartida.

- Cada usuario nuevo recibe un workspace personal y queda como `OWNER`.
- Los endpoints privados validan membresia mediante `WorkspaceMember`.
- El rol global `admin` tiene acceso administrativo explícito a cualquier workspace.
- La relacion muchos-a-muchos se conserva para colaboracion futura.
- Los proyectos son entidades normalizadas dentro del workspace.

Decision formal:

- `docs/adr/0024-multitenancy-por-workspace-personal-y-proyectos-como-entidad.md`
- `docs/adr/0025-acceso-administrativo-y-ciclo-de-vida-de-proyectos.md`

## Estructura

```text
backend/
  prisma/
    schema.prisma
  src/
    modules/
      auth/
      users/
      workspaces/
      spaces/
      pages/
      projects/
      tasks/
      task-settings/
    database/
    middlewares/
    config/
    shared/
    app.ts
    server.ts
```

## Flujo MVC

```text
route -> controller -> service -> repository -> prisma -> PostgreSQL
```

Reglas:

- `controller`: HTTP, DTO, respuesta.
- `service`: negocio, permisos, coordinacion.
- `repository`: Prisma.
- `dto`: Zod.
- `middlewares`: auth y errores transversales.

## Comandos

Desde `backend/`:

```bash
npm install
npm run prisma:generate
npm run prisma:migrate
npm run prisma:migrate:deploy
npm run import:backup -- ../backups-locales/<archivo>.json
npm run backup:database
npm run audit:tenancy
npm run migrate:martin
npm run dev
npm run build
```

## Variables de entorno

Ver `backend/.env.example`.

Minimo:

```env
DATABASE_URL="postgresql://USUARIO:PASSWORD@localhost:5432/gestion_tareas?schema=public"
PORT=4000
JWT_SECRET="CAMBIAR_POR_UN_SECRETO_LOCAL_LARGO"
JWT_EXPIRES_IN="7d"
```

## Endpoints

Base:

```text
/api
```

Publicos:

```text
GET  /health
POST /api/auth/login
```

Las cuentas se crean exclusivamente desde Administracion.

Privados:

```text
GET  /api/auth/me
GET  /api/users/me
GET  /api/workspaces
GET  /api/spaces?workspaceId=
GET  /api/pages?workspaceId=
GET  /api/tasks?workspaceId=
GET  /api/projects?workspaceId=
POST /api/projects
PATCH /api/projects/:id
POST /api/projects/:id/archive
POST /api/projects/:id/restore
GET  /api/task-settings?workspaceId=
GET  /api/admin/users/:userId/workspace
```

Usan:

```http
Authorization: Bearer <token>
```

## Integracion futura con frontend

Orden recomendado:

1. Crear `.env` y sincronizar PostgreSQL.
2. Importar backup local a PostgreSQL.
3. Probar login y creación administrativa de usuarios.
4. Sincronizar `workspaces`, `spaces` y `pages` desde API hacia la capa local temporal.
5. Leer `tasks` y `task-settings` desde API.
6. Reemplazar lecturas directas de `localStorage`.

Estado actual:

- Login frontend ya usa `/api/auth/login`.
- Al iniciar sesion se guarda `gt_auth_token`.
- Luego se sincronizan `workspaces`, `spaces` y `pages` desde PostgreSQL hacia `localStorage`.
- Las escrituras locales de espacios y paginas se espejan al backend de forma progresiva.

## Pendientes tecnicos

- Seed inicial.
- Migracion versionada inicial para servidor.
- Tests de auth y permisos.
- Repositorio frontend para API.
- Manejo de refresh tokens/cookies si se requiere.
- Auditoría persistente de acciones administrativas.
- Validaciones de integridad mas estrictas para `pageId`, `spaceId` y `assigneeId`.
