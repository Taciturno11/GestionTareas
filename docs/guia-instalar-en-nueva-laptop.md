# Guia para instalar GESTION_TAREAS en una nueva laptop

Esta guia permite clonar el proyecto, instalar dependencias, crear la base local y restaurar los datos validados. No incluye backups ni secretos reales porque esos archivos no deben subirse a GitHub.

Para configurar GitHub, acceso SSH y despliegues de produccion, continuar con
`docs/guia-continuidad-y-despliegue-produccion.md`.

## A. Requisitos

- Git
- Node.js LTS
- npm
- PostgreSQL
- VS Code recomendado

Verificar versiones:

```bash
node -v
npm -v
git --version
psql --version
```

## B. Clonar repositorio

```bash
git clone https://github.com/Taciturno11/GestionTareas.git
cd GestionTareas
```

## C. Instalar frontend

En la raiz del proyecto:

```bash
npm install
```

Si se quiere una instalacion estricta desde `package-lock.json`:

```bash
npm ci
```

## D. Instalar backend

```bash
cd backend
npm install
```

O:

```bash
npm ci
```

Volver a la raiz cuando sea necesario:

```bash
cd ..
```

## E. Crear base PostgreSQL local

Entrar a PostgreSQL como usuario administrador:

```bash
psql -U postgres
```

Crear base:

```sql
CREATE DATABASE gestion_tareas;
```

Opcionalmente crear usuario dedicado:

```sql
CREATE USER gestion_tareas_user WITH PASSWORD 'CAMBIAR_PASSWORD_LOCAL';
GRANT ALL PRIVILEGES ON DATABASE gestion_tareas TO gestion_tareas_user;
```

Salir:

```sql
\q
```

## F. Crear `backend/.env`

Crear manualmente `backend/.env`. No subir este archivo a GitHub.

Ejemplo sin secretos reales:

```env
NODE_ENV=development
DATABASE_URL="postgresql://USUARIO:PASSWORD@localhost:5432/gestion_tareas?schema=public"
PORT=4000
JWT_SECRET="CAMBIAR_POR_UN_SECRETO_LOCAL_LARGO"
JWT_EXPIRES_IN="7d"
```

## G. Crear `.env` del frontend si aplica

En la raiz del proyecto se puede crear `.env.local`:

```env
VITE_API_BASE_URL=http://localhost:4000/api
```

Si no existe, el frontend usa por defecto `http://localhost:4000/api`.

## H. Ejecutar Prisma

Desde `backend/`:

```bash
npm run prisma:generate
npm run prisma:migrate:deploy
```

No usar `prisma db push` para restaurar el entorno validado. El flujo recomendado es migraciones versionadas.

## I. Importar datos

El backup real no se sube a GitHub. Copiar manualmente en la nueva laptop el archivo:

```text
backups-locales/gestion-tareas-backup-fusionado-2026-06-07.sanitized.json
```

La carpeta `backups-locales/` esta ignorada por Git.

Luego ejecutar desde `backend/`:

```bash
npm run import:backup -- ../backups-locales/gestion-tareas-backup-fusionado-2026-06-07.sanitized.json
```

## J. Levantar backend

Desde `backend/`:

```bash
npm run dev
```

Backend esperado:

```text
http://localhost:4000
```

Validar:

```bash
curl http://localhost:4000/health
```

## K. Levantar frontend

En otra terminal, desde la raiz:

```bash
npm run dev
```

Frontend esperado:

```text
http://localhost:5173
```

## L. Credenciales locales

Las credenciales reales no se documentan en GitHub. Si se importa el backup fusionado validado, usar las credenciales locales acordadas fuera del repositorio o regenerar el usuario desde la base/importador segun corresponda.

Antes de produccion, cambiar cualquier password temporal y usar un `JWT_SECRET` nuevo.

## M. Validaciones

Abrir:

```text
http://localhost:5173
```

Validar:

- login correcto,
- sidebar principal visible,
- workspaces: 4,
- spaces: 17,
- pages: 32 en la base local vigente,
- tasks: 12,
- settings: 4,
- `/ajustes`,
- `/tareas`,
- `/calendario`,
- `/archivo`,
- una pagina de texto,
- una pagina board,
- una pagina database.

Nota: el backup fusionado original contenia `page-eb526578`, pero no se restaura en la base local vigente por decision manual. El estado esperado actual es 32 paginas y 1 pagina `DATABASE`.

## N. Problemas comunes

### Error de `DATABASE_URL`

Revisar usuario, password, host, puerto y nombre de base en `backend/.env`.

### PostgreSQL apagado

Iniciar el servicio de PostgreSQL y repetir `npm run prisma:migrate:deploy`.

### Puerto 4000 ocupado

Cerrar el proceso que usa el puerto o cambiar `PORT` en `backend/.env`.

### Puerto 5173 ocupado

Cerrar el proceso que usa el puerto o iniciar Vite en otro puerto.

### Migraciones no aplicadas

Ejecutar desde `backend/`:

```bash
npm run prisma:migrate:deploy
```

### No aparece la data

Confirmar que el backup fusionado sanitizado fue copiado manualmente y que se ejecuto:

```bash
npm run import:backup -- ../backups-locales/gestion-tareas-backup-fusionado-2026-06-07.sanitized.json
```

### Login o CORS

Confirmar que el backend responde:

```bash
curl http://localhost:4000/health
```

Confirmar que el frontend apunta a:

```text
http://localhost:4000/api
```

El backend usa CORS simple con origen libre para desarrollo.

## O. Continuar y desplegar desde esta laptop

Cuando el entorno local ya funcione, seguir la guia:

```text
docs/guia-continuidad-y-despliegue-produccion.md
```

Esa guia documenta acceso de escritura a GitHub, llave SSH independiente,
backups, despliegue, migraciones, health checks y rollback.
