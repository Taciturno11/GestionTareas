# Bitacora de cambios de GESTION_TAREAS

Documento vivo para conservar el contexto cronologico de los cambios realizados en el proyecto.

## Regla de mantenimiento

- Leer esta bitacora antes de comenzar cualquier implementacion, correccion o despliegue.
- Registrar cada cambio terminado en la seccion `Cambios recientes`.
- Agregar las entradas nuevas al inicio, manteniendo orden cronologico inverso.
- Cada entrada debe indicar como minimo:
  - fecha;
  - objetivo;
  - cambios realizados;
  - validaciones ejecutadas;
  - estado del despliegue;
  - commit, si existe.
- No borrar entradas anteriores. Si una decision cambia, agregar una entrada nueva que explique el reemplazo.
- No registrar secretos, contrasenas, tokens, claves privadas ni valores sensibles del servidor.

## Plantilla para nuevas entradas

```md
### AAAA-MM-DD - Titulo breve

- Objetivo:
- Cambios:
- Validaciones:
- Despliegue:
- Commit:
```

## Cambios recientes

### 2026-06-18 - Rendimiento de hojas y almacenamiento aislado

- Objetivo: eliminar la lentitud al escribir y evitar cargar o copiar contenido pesado innecesariamente.
- Cambios:
  - API separada entre metadatos de paginas y detalle completo;
  - caches TanStack Query `pages/workspace` y `page/id`;
  - `gt_workspace_pages` reducido a metadatos;
  - autoguardado de texto a 800 ms con cola serial, borrador temporal e indicador visual;
  - snapshot de pizarra generado una vez tras 1.5 segundos de inactividad;
  - diagramas y paginas actualizan solamente su cache aislada;
  - listado de workspaces restringido nuevamente a membresias, incluido el administrador;
  - ADR 0026 y documentacion operativa actualizados.
- Validaciones:
  - frontend build y lint;
  - backend build;
  - prueba local de API: listado de 32 paginas reducido de 619625 a 6648 bytes (98.93%);
  - detalle conserva contenido, `PATCH` responde sin contenido y persiste correctamente;
  - listado de workspaces coincide con las membresias del usuario.
- Despliegue: pendiente.
- Commit: pendiente.

### 2026-06-18 - Bitacora continua obligatoria

- Objetivo: mantener un historial legible de todo cambio futuro y facilitar la continuidad entre chats, agentes y desarrolladores.
- Cambios:
  - se convirtio este documento en una bitacora viva;
  - se definio una plantilla minima para nuevas entradas;
  - se agrego en `AGENTS.md` la obligacion de leer y actualizar la bitacora.
- Validaciones: revision documental y comprobacion de enlaces existentes desde README.
- Despliegue: pendiente; cambio exclusivamente documental.
- Commit: pendiente.

### 2026-06-18 - Profundidad visual de tarjetas Kanban

- Objetivo: separar visualmente las tarjetas de tareas del fondo sin generar movimiento incomodo.
- Cambios:
  - borde de tarjeta aumentado a `slate-300`;
  - sombra ligera `0 2px 6px`;
  - hover sin desplazamiento vertical y con sombra moderada.
- Validaciones: `npm run build` y `npm run lint`.
- Despliegue: publicado en `agenda.martinnauca.com`; frontend respaldado y `config.js` preservado.
- Commit: `12cbd3d`.

### 2026-06-18 - Workspaces personales y proyectos normalizados

- Objetivo: separar workspace y proyecto, consolidar los datos de Martin y preparar colaboración futura.
- Cambios:
  - entidad PostgreSQL `Project`;
  - relación segura entre tareas, proyectos y workspace;
  - `personalWorkspaceId` para usuarios;
  - API y cache compartida de proyectos;
  - archivado y restauración de proyectos;
  - acceso administrativo mediante `Ver workspace`;
  - registro público desactivado;
  - placeholders vacíos para proyecto, prioridad y etiqueta;
  - consolidación de los workspaces históricos de Martin.
- Validaciones:
  - frontend build y lint;
  - backend build;
  - Prisma validate y migrate status;
  - pruebas de permisos `200/403`;
  - auditoría sin proyectos inválidos.
- Despliegue:
  - publicado en producción;
  - Martin conserva 20 espacios, 28 páginas, 15 tareas y 7 proyectos;
  - los workspaces huérfanos permanecen aislados;
  - respaldo PostgreSQL: `gestion_tareas_before_projects_20260618205546.dump`.
- Commits: `f650c81` y `a6c6a1f`.

## Historial anterior

Fecha de cierre de la etapa anterior: 2026-06-07

## Resumen

GESTION_TAREAS quedo recuperado como una aplicacion de productividad tipo workspace. No es CMS, carteleria digital, TV Live ni un sistema relacionado con pantallas o dispositivos.

El proyecto actual combina frontend React con backend Express, Prisma y PostgreSQL. La data local historica fue analizada, sanitizada, fusionada y validada en PostgreSQL antes de preparar el trabajo para continuar desde otra laptop.

## Estado inicial retomado

- Existia una SPA frontend con React, Vite, TypeScript, Tailwind CSS y React Router.
- Existia un backend inicial en `backend/` con Express, Prisma y PostgreSQL.
- La aplicacion usaba localStorage como fuente principal para varias entidades del frontend.
- Habia datos historicos en backups JSON locales y datos actuales en el navegador.
- La carpeta de migraciones Prisma tenia una migracion parcial, pero no una migracion inicial completa.

## Correcciones de estabilizacion

- Se corrigio el error de lint detectado en el backend sin cambiar el login.
- Se revisaron textos con encoding roto y se corrigieron casos visibles cuando correspondia.
- Se validaron builds de frontend y backend durante las fases de estabilizacion.

## Prisma y PostgreSQL

- Se reviso `backend/prisma/schema.prisma`.
- Se confirmaron los modelos principales:
  - `User`
  - `Workspace`
  - `WorkspaceMember`
  - `Space`
  - `Page`
  - `Task`
  - `TaskSettings`
- Se reemplazo la migracion parcial por una migracion inicial reproducible: `20260607_initial_schema`.
- Se agrego el script `prisma:migrate:deploy` para produccion o bases limpias.
- Se valido que una base PostgreSQL limpia pueda crearse usando migraciones.

## Backups, sanitizacion y fusion

- Se reviso el backup anterior local.
- Se reviso el JSON exportado desde el navegador actual.
- Se detecto que el JSON nuevo era la fuente mas reciente.
- Se creo una copia sanitizada sin `gt_auth_token` ni tokens JWT-like.
- Se preparo una fusion conservadora:
  - el backup actual manda,
  - paginas existentes en ambos conservan la version actual,
  - paginas solo antiguas se rescatan,
  - tareas solo antiguas se rescatan,
  - pizarras tldraw antiguas se conservan si no existian en el backup actual.
- Se genero el backup fusionado sanitizado:
  - `backups-locales/gestion-tareas-backup-fusionado-2026-06-07.sanitized.json`
- Ese archivo no se debe subir a GitHub. Debe copiarse manualmente entre equipos si se necesita restaurar data.

## Dataset validado

El dataset fusionado original quedo validado con estos conteos:

- workspaces: 4
- spaces: 17
- pages: 33
- tasks: 12
- settings: 4

Tipos de pagina del backup fusionado original:

- TEXT: 11
- BOARD: 17
- DATABASE: 2
- BLANK: 3

Estado local vigente decidido el 2026-06-08:

- pages: 32
- DATABASE: 1
- `page-eb526578` - Nuevo diagrama BD no se restaura por decision manual.
- No se debe tratar esa pagina como dato faltante en la base local actual.

Paginas rescatadas relevantes:

- `page-40714fb0` - Nueva pizarra
- `page-dbe4cfcf` - Nuevo diagrama BD
- `page-b52f65c4` - Nueva pizarra
- `page-96356da8` - Contexto -Alcances

Tarea rescatada:

- `1778729855344` - SDafa

## Importador de backup

- Se reviso `backend/scripts/import-local-backup.ts`.
- Se ajusto para soportar formatos de backup viejo y nuevo.
- Se valido importando el backup fusionado en una base limpia de prueba.
- Se confirmo que paginas, tareas, settings y contenido JSON/tldraw se importan correctamente.

## Backend/API

- Se valido lectura por API con el dataset fusionado.
- Se valido escritura por API usando datos dummy de prueba.
- Se probaron endpoints reales de:
  - auth
  - users
  - workspaces
  - spaces
  - pages
  - tasks
  - task-settings
- Se confirmo login local con el usuario restaurado desde datos locales.
- Se confirmo que las paginas rescatadas y la tarea `SDafa` son visibles por API.

## Entorno local real

- Se respaldo la base local `gestion_tareas` antes de completar datos.
- Se comparo la base local contra el backup fusionado.
- Se insertaron solo los datos faltantes, sin reemplazar ni borrar datos existentes.
- Se confirmaron conteos finales originales:
  - users: 1
  - workspaces: 4
  - spaces: 17
  - pages: 33
  - tasks: 12
  - settings: 4
- El 2026-06-08 se decidio conservar la base local con 32 paginas y 1 pagina `DATABASE`, sin restaurar `page-eb526578`.
- Se valido que `_prisma_migrations` estuviera coherente.
- Se marco `20260607_initial_schema` como aplicada solo despues de confirmar que el schema real coincidia.
- Se valido backend, frontend, login, navegacion, recarga y rutas principales.

## CORS simple

- Se simplifico CORS en backend.
- Se elimino el uso de `CORS_ORIGIN`.
- La configuracion actual permite cualquier origen:
  - `origin: '*'`
  - metodos `GET`, `POST`, `PUT`, `PATCH`, `DELETE`, `OPTIONS`
  - headers `Content-Type`, `Authorization`
- Se valido `OPTIONS /api/auth/login` y `POST /api/auth/login`.

## Layout de Ajustes

- Se reorganizo `Ajustes` con un sidebar interno.
- Rutas internas agregadas:
  - `/ajustes/seguridad`
  - `/ajustes/usuarios`
  - `/ajustes/roles`
  - `/ajustes/proyectos`
  - `/ajustes/responsables`
  - `/ajustes/etiquetas`
  - `/ajustes/prioridades`
  - `/ajustes/estados`
  - `/ajustes/exportar`
- `/ajustes` redirige a `/ajustes/seguridad`.
- `Usuarios` y `Roles y permisos` quedaron como placeholders visuales, sin logica real de backend.
- Se conservaron:
  - seguridad de cuenta,
  - proyectos,
  - responsables,
  - etiquetas,
  - prioridades,
  - estados,
  - exportacion de datos.

## Mejoras de distribucion visual

- Se agrego soporte para alinear `PageContainer` al inicio sin romper el comportamiento anterior.
- Se aplico `align="start"` en:
  - Ajustes
  - Inicio
  - Archivo
- Se agrego `size="fluid"` a `PageContainer`.
- Solo `Inicio` usa `size="fluid"` para aprovechar mejor pantallas grandes.
- No se cambio la identidad visual: colores, tarjetas, bordes, tipografia e iconos se mantienen.

## Estado actual

El proyecto queda listo para continuar desde otra laptop:

- frontend compila,
- backend compila,
- lint pasa,
- PostgreSQL local fue validado,
- migraciones Prisma son reproducibles,
- dataset fusionado esta probado,
- la guia de instalacion nueva indica como restaurar el entorno sin subir backups sensibles.

## Pendientes recomendados

1. Implementar gestion real de usuarios y roles en backend/frontend.
2. Completar migracion gradual de tareas/settings/frontend desde localStorage hacia API.
3. Definir estrategia final para tldraw: IndexedDB local, `Page.content` o sincronizacion hibrida.
4. Preparar despliegue en servidor con PostgreSQL limpio, `prisma migrate deploy`, PM2 y Nginx.
5. Revisar `SubspaceView` y `TextPage` para decidir si deben usar layout alineado o de documento.
6. Revisar bundle splitting para dependencias grandes como tldraw si se vuelve necesario.

## Limpieza de contexto externo

El 2026-06-08 se decidio que GESTION_TAREAS es un proyecto personal y no debe conservar nombres ni flujos heredados de otro contexto. Los roles tecnicos finales son:

- `admin`
- `usuario`

El acceso queda como login simple con correo, contrasena y JWT.
