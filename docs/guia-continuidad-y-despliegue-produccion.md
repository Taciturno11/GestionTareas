# Guia de continuidad y despliegue de produccion

Esta guia permite continuar GESTION_TAREAS desde otra laptop y desplegar cambios
en produccion sin copiar secretos al repositorio.

## 1. Fuentes de verdad

- Codigo y documentacion: rama `main` de
  `https://github.com/Taciturno11/GestionTareas`.
- Secretos locales: `backend/.env` de cada laptop.
- Secretos de produccion: `/etc/gestion_tareas/backend.env` en el servidor.
- Base local: PostgreSQL de cada laptop.
- Base de produccion: PostgreSQL del servidor.
- Frontend publicado: `/var/www/gestion_tareas`.
- Backend publicado: `/opt/gestion_tareas/current/backend`.
- Servicio backend: `gestion-tareas-backend.service`.
- Nginx: `/etc/nginx/sites-enabled/gestion_tareas`.
- Dominio: `https://agenda.martinnauca.com`.

El `.env`, las bases, los dumps y las llaves SSH no se sincronizan mediante
GitHub.

## 2. Preparar una laptop nueva

### Requisitos

- Git.
- Node.js LTS compatible con el proyecto.
- npm.
- PostgreSQL.
- OpenSSH Client.

Verificar:

```powershell
git --version
node --version
npm --version
psql --version
ssh -V
```

### Configurar Git y acceso a GitHub

```powershell
git config --global user.name "Martin Nauca"
git config --global user.email "TU_CORREO_DE_GITHUB"
```

El repositorio es publico y puede clonarse sin autenticacion. Para hacer
`git push`, iniciar sesion mediante Git Credential Manager cuando Git lo
solicite, o instalar GitHub CLI y ejecutar `gh auth login`.

Nunca guardar un token de GitHub dentro del repositorio.

### Clonar e instalar

```powershell
git clone https://github.com/Taciturno11/GestionTareas.git
cd GestionTareas
npm ci
cd backend
npm ci
Copy-Item .env.example .env
cd ..
```

Completar `backend/.env` con valores propios de esa laptop. No copiar el
archivo de produccion ni reutilizar sus secretos.

### Preparar PostgreSQL local

Crear la base y ajustar `DATABASE_URL` en `backend/.env`. Después:

```powershell
cd backend
npm run prisma:generate
npm run prisma:migrate:deploy
cd ..
```

Si se necesitan los mismos datos locales de otra laptop, transferir un dump o
backup por un medio privado y guardarlo en `backups-locales/`. Esa carpeta no
se versiona. Restaurar datos es opcional; las migraciones bastan para empezar
con una base limpia.

### Validar el entorno local

Terminal 1:

```powershell
cd backend
npm run dev
```

Terminal 2:

```powershell
npm run dev
```

Comprobaciones:

```powershell
Invoke-WebRequest http://localhost:4000/health -UseBasicParsing
npm run lint
npm run build
cd backend
npm run build
```

## 3. Configurar acceso SSH al servidor

Se recomienda crear una llave distinta por laptop. No enviar una llave privada
por chat, correo ni GitHub.

En la laptop nueva:

```powershell
ssh-keygen -t ed25519 -C "gestion-tareas-laptop"
Get-Content $HOME\.ssh\id_ed25519.pub
```

Copiar solamente la clave publica. Desde una maquina que ya tenga acceso al
servidor, agregarla a `/root/.ssh/authorized_keys`:

```powershell
Get-Content C:\RUTA\A\LA\NUEVA_LLAVE.pub |
  ssh root@72.60.138.218 "umask 077; mkdir -p /root/.ssh; cat >> /root/.ssh/authorized_keys"
```

Probar desde la laptop nueva:

```powershell
ssh -o BatchMode=yes root@72.60.138.218 "hostname"
```

Una alternativa es transferir la llave privada existente mediante un medio
seguro y fuera de GitHub, pero una llave independiente es preferible porque
puede revocarse sin afectar las demás laptops.

## 4. Flujo diario entre laptops

Antes de comenzar:

```powershell
git switch main
git pull --ff-only origin main
git status
```

Después de implementar y validar:

```powershell
git add .
git commit -m "tipo: descripcion breve"
git push origin main
```

Antes de cambiar de laptop, confirmar:

```powershell
git status
git rev-list --left-right --count HEAD...origin/main
```

El resultado esperado del segundo comando es `0  0` y `git status` debe
indicar un working tree limpio.

## 5. Arquitectura real de produccion

| Componente | Ubicacion o servicio |
| --- | --- |
| Frontend estatico | `/var/www/gestion_tareas` |
| Backend | `/opt/gestion_tareas/current/backend` |
| Releases | `/opt/gestion_tareas/releases` |
| Variables backend | `/etc/gestion_tareas/backend.env` |
| Servicio backend | `gestion-tareas-backend.service` |
| Puerto backend interno | `4100` |
| Configuracion Nginx | `/etc/nginx/sites-enabled/gestion_tareas` |
| Backups PostgreSQL | `/opt/backups/gestion_tareas` |
| Dominio | `https://agenda.martinnauca.com` |

Nginx sirve el frontend y reenvía `/api/` y `/health` al backend. El archivo
`/var/www/gestion_tareas/config.js` es configuracion runtime de produccion y
debe preservarse en cada despliegue.

## 6. Flujo obligatorio de despliegue

El orden es:

```text
pull -> build -> backup -> deploy -> migrate -> health checks
```

No desplegar con cambios locales sin commit ni reemplazar
`/etc/gestion_tareas/backend.env`.

### A. Pull y validacion local

Desde la raiz:

```powershell
git switch main
git pull --ff-only origin main
git status
npm ci
npm run lint
npm run build
cd backend
npm ci
npm run build
npm run prisma:generate
cd ..
```

### B. Preparar artefactos

```powershell
$Release = Get-Date -Format "yyyyMMddHHmmss"
$Package = Join-Path $env:TEMP "gestion_tareas_$Release"
New-Item -ItemType Directory -Force "$Package\frontend" | Out-Null
New-Item -ItemType Directory -Force "$Package\backend" | Out-Null

Copy-Item -Recurse -Force "dist\*" "$Package\frontend"
Copy-Item -Recurse -Force "backend\dist" "$Package\backend\dist"
Copy-Item -Recurse -Force "backend\prisma" "$Package\backend\prisma"
Copy-Item -Force "backend\package.json","backend\package-lock.json" "$Package\backend"

tar -czf "$env:TEMP\gestion_tareas_$Release.tar.gz" -C $Package .
scp "$env:TEMP\gestion_tareas_$Release.tar.gz" root@72.60.138.218:/tmp/
```

### Nota importante: PowerShell + Bash por SSH

Cuando se ejecuten comandos Bash remotos desde PowerShell, no enviar scripts
largos dentro de una sola cadena con comillas dobles, por ejemplo:

```powershell
ssh root@72.60.138.218 "set -e; PACKAGE="/tmp/gestion_tareas_${RELEASE}.tar.gz"; test -f "$PACKAGE""
```

Ese patron es propenso a fallar porque PowerShell puede interpolar variables
como `$PACKAGE`, `$STAGING`, `$DATABASE_URL` o `$RELEASE` antes de que el script
llegue al servidor. El sintoma tipico es un error raro de Bash como:

```text
bash: line X: -f: command not found
```

El patron recomendado es enviar el script por stdin usando un here-string de
PowerShell y pasar solo los argumentos necesarios:

```powershell
$Release = Get-Date -Format "yyyyMMddHHmmss"

$Script = @'
set -euo pipefail
RELEASE="$1"
PACKAGE="/tmp/gestion_tareas_${RELEASE}.tar.gz"
STAGING="/opt/gestion_tareas/releases/${RELEASE}"

test -f "$PACKAGE"
mkdir -p "$STAGING"
tar -xzf "$PACKAGE" -C "$STAGING"
'@

$Script | ssh root@72.60.138.218 "bash -s -- $Release"
```

Reglas practicas:

- usar `@' ... '@` para que PowerShell no interpole variables internas del script;
- pasar valores externos como argumentos (`$1`, `$2`, etc.);
- dejar que Bash resuelva variables remotas como `$PACKAGE`, `$STAGING` y `$DATABASE_URL`;
- nunca imprimir secretos ni ejecutar `cat /etc/gestion_tareas/backend.env`;
- preferir este patron para backups, deploy, migraciones, health checks y limpieza.

### C. Crear backup antes de tocar produccion

Entrar al servidor:

```powershell
ssh root@72.60.138.218
```

En el servidor:

```bash
set -euo pipefail
RELEASE="PEGAR_EL_VALOR_GENERADO_EN_POWERSHELL"
PACKAGE="/tmp/gestion_tareas_${RELEASE}.tar.gz"
STAGING="/opt/gestion_tareas/releases/${RELEASE}"

test -f "$PACKAGE"
mkdir -p "$STAGING"
tar -xzf "$PACKAGE" -C "$STAGING"
test -f "$STAGING/frontend/index.html"
test -f "$STAGING/backend/dist/server.js"

mkdir -p /opt/backups/gestion_tareas
umask 077
set -a
. /etc/gestion_tareas/backend.env
set +a
pg_dump "$DATABASE_URL" \
  --format=custom \
  --file="/opt/backups/gestion_tareas/gestion_tareas_before_${RELEASE}.dump"

cp -a /var/www/gestion_tareas \
  "/var/www/gestion_tareas_backup_${RELEASE}"
cp -a /opt/gestion_tareas/current/backend \
  "/opt/gestion_tareas/backend_backup_${RELEASE}"
```

Los comandos no imprimen `DATABASE_URL`; solo la cargan en el proceso actual.

### D. Desplegar backend y migrar

En el servidor:

```bash
rm -rf /opt/gestion_tareas/current/backend/dist
cp -a "$STAGING/backend/dist" /opt/gestion_tareas/current/backend/dist
rm -rf /opt/gestion_tareas/current/backend/prisma
cp -a "$STAGING/backend/prisma" /opt/gestion_tareas/current/backend/prisma
cp "$STAGING/backend/package.json" \
  "$STAGING/backend/package-lock.json" \
  /opt/gestion_tareas/current/backend/

cd /opt/gestion_tareas/current/backend
npm ci
npx prisma generate
npm run prisma:migrate:deploy
systemctl restart gestion-tareas-backend
systemctl is-active --quiet gestion-tareas-backend
```

Las migraciones se ejecutan después del backup y antes de publicar el
frontend. Las migraciones nuevas deben ser compatibles con el backend anterior
durante esta ventana breve.

### E. Desplegar frontend preservando `config.js`

En el servidor:

```bash
cp /var/www/gestion_tareas/config.js /tmp/gestion_tareas_config.js
rm -rf /var/www/gestion_tareas
mkdir -p /var/www/gestion_tareas
cp -a "$STAGING/frontend/." /var/www/gestion_tareas/
cp /tmp/gestion_tareas_config.js /var/www/gestion_tareas/config.js

nginx -t
systemctl reload nginx
```

No copiar el `public/config.js` local encima del archivo runtime del servidor.

### F. Health checks obligatorios

En el servidor:

```bash
curl --fail --silent --show-error http://127.0.0.1:4100/health
curl --fail --silent --show-error https://agenda.martinnauca.com/health
curl --fail --silent --show-error \
  --output /dev/null \
  https://agenda.martinnauca.com
systemctl --no-pager --full status gestion-tareas-backend
journalctl -u gestion-tareas-backend -n 50 --no-pager
```

Desde la laptop:

```powershell
Invoke-WebRequest https://agenda.martinnauca.com -UseBasicParsing
Invoke-WebRequest https://agenda.martinnauca.com/health -UseBasicParsing
```

Validar también login y la funcionalidad modificada.

### G. Retencion

Después de confirmar el despliegue:

```bash
bash /opt/gestion_tareas/cleanup-retention.sh
```

La politica vigente conserva dos releases, un rollback de frontend, un
rollback de backend y tres dumps PostgreSQL. Si el script no está instalado en
esa ruta, no borrar manualmente; copiar primero la version controlada desde
`ops/production/cleanup-retention.sh`.

## 7. Rollback

Usar rollback si falla el arranque, los health checks o el flujo principal.

### Frontend

```bash
FAILED_RELEASE="RELEASE_FALLIDO"
rm -rf /var/www/gestion_tareas
mv "/var/www/gestion_tareas_backup_${FAILED_RELEASE}" \
  /var/www/gestion_tareas
nginx -t
systemctl reload nginx
```

### Backend

```bash
FAILED_RELEASE="RELEASE_FALLIDO"
systemctl stop gestion-tareas-backend
rm -rf /opt/gestion_tareas/current/backend
mv "/opt/gestion_tareas/backend_backup_${FAILED_RELEASE}" \
  /opt/gestion_tareas/current/backend
systemctl start gestion-tareas-backend
systemctl is-active --quiet gestion-tareas-backend
```

### Base de datos

No restaurar PostgreSQL automáticamente. Primero determinar si la migracion es
reversible y si se escribieron datos después del despliegue. Si se aprueba una
restauracion:

```bash
set -a
. /etc/gestion_tareas/backend.env
set +a
pg_restore --clean --if-exists --no-owner \
  --dbname="$DATABASE_URL" \
  "/opt/backups/gestion_tareas/ARCHIVO.dump"
```

La restauracion de base es destructiva y requiere una decision explícita.

## 8. Reglas de seguridad

- No subir `.env`, dumps, backups, tokens ni llaves privadas.
- No copiar el `.env` local al servidor.
- No imprimir `/etc/gestion_tareas/backend.env`.
- No editar directamente bundles de producción como flujo normal.
- No desplegar sin backup de PostgreSQL.
- No ejecutar `prisma db push` en producción.
- No borrar releases o backups fuera de la politica de retencion.
- No trabajar simultáneamente en dos laptops sin hacer `pull` antes y `push`
  al terminar.

## 9. Contexto para Codex en otra laptop

Al abrir el repositorio, pedir a Codex que lea en este orden:

1. `AGENTS.md`.
2. `docs/bitacora-cambios-gestion-tareas.md`.
3. `docs/contexto-general.md`.
4. Esta guia antes de cualquier despliegue.

Codex puede leer los `.env` locales cuando sea necesario para ejecutar el
proyecto, pero nunca debe imprimir ni registrar sus valores sensibles.
