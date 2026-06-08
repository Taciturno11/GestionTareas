# Guia para clonar y ejecutar el proyecto

Esta guia explica como levantar el proyecto completo en una maquina nueva.

## Requisitos

Instalar:

- Git
- Node.js 20 o superior
- npm
- PostgreSQL 17 recomendado

Verificar:

```bash
git --version
node --version
npm --version
```

## Clonar repositorio

```bash
git clone https://github.com/Taciturno11/GestionTareas.git
cd GestionTareas
```

## Instalar frontend

Desde la raiz:

```bash
npm install
```

## Instalar backend

```bash
cd backend
npm install
cd ..
```

## Configurar PostgreSQL local

Crear base de datos:

```bash
createdb -U postgres gestion_tareas
```

En Windows, si `createdb` no esta en PATH, usar ruta completa similar a:

```powershell
& "C:\Program Files\PostgreSQL\17\bin\createdb.exe" -U postgres gestion_tareas
```

Si la base ya existe, no hace falta crearla otra vez.

## Configurar variables de entorno

Copiar plantilla:

```bash
cd backend
cp .env.example .env
```

En Windows PowerShell:

```powershell
Copy-Item .env.example .env
```

Editar `backend/.env`:

```env
DATABASE_URL="postgresql://USUARIO:PASSWORD@localhost:5432/gestion_tareas?schema=public"
PORT=4000
JWT_SECRET="CAMBIAR_POR_UN_SECRETO_LOCAL_LARGO"
JWT_EXPIRES_IN="7d"
```

No subir `.env` a GitHub.

## Sincronizar base de datos

Desde `backend/`:

```bash
npm run prisma:generate
npm run prisma:migrate:deploy
```

Esto crea tablas segun:

```text
backend/prisma/schema.prisma
```

## Levantar backend

Desde `backend/`:

```bash
npm run dev
```

API:

```text
http://localhost:4000
```

Healthcheck:

```text
http://localhost:4000/health
```

Debe responder:

```json
{ "status": "ok" }
```

## Levantar frontend

En otra terminal, desde la raiz:

```bash
npm run dev
```

Frontend:

```text
http://localhost:5173
```

## Crear usuario inicial

Opcion 1: usar API register:

```bash
curl -X POST http://localhost:4000/api/auth/register \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"admin@example.com\",\"name\":\"Admin\",\"password\":\"12345678\"}"
```

Opcion 2: importar backup local si existe.

## Importar backup local

Guardar backup `.json` en:

```text
backups-locales/
```

Ejecutar:

```bash
cd backend
npm run import:backup -- ../backups-locales/<archivo>.json
```

El importador crea:

- usuario local.
- workspaces.
- espacios.
- hojas.
- tareas.
- ajustes.
- snapshots de pizarras tldraw.

Usuario creado por importador:

```text
email: martin.local@gestion-tareas.dev
password: 12345678
```

## Ejecutar verificaciones

Frontend:

```bash
npm run lint
npm run build
```

Backend:

```bash
cd backend
npm run build
```

## Flujo de uso local

1. Levantar PostgreSQL.
2. Levantar backend:

```bash
cd backend
npm run dev
```

3. Levantar frontend:

```bash
npm run dev
```

4. Abrir:

```text
http://localhost:5173
```

5. Iniciar sesion.

## Estructura principal

```text
GestionTareas/
  backend/
    prisma/
    scripts/
    src/
  docs/
  src/
  package.json
  README.md
```

## Archivos que no se suben

```text
backend/.env
backend/dist/
backups-locales/
node_modules/
dist/
*.log
```

## Documentacion relacionada

- `docs/resumen-implementacion-2026-05-19.md`
- `docs/backend.md`
- `docs/frontend-arquitectura.md`
- `docs/database-er.md`
- `backend/README.md`
