# AGENTS.md

Contexto operativo para agentes IA que trabajen en este repositorio (Codex, Claude Code, opencode u otros). `CLAUDE.md` solo importa este archivo.

Ultima revision de este archivo: 2026-11-15.

## Primero: orden de lectura obligatorio

Cada agente empieza sin memoria de lo que hicieron otros agentes u otras laptops. Antes de tocar nada:

1. `git pull --ff-only origin main` y `git status`. Si la laptop esta atrasada o tiene cambios sin commitear, resolverlo primero sin perder trabajo (ver `docs/guia-continuidad-y-despliegue-produccion.md`).
2. Este archivo completo.
3. Las ultimas entradas de `docs/bitacora-cambios-gestion-tareas.md` (detalle de cada cambio).
4. `docs/historial-cronologico.md` (linea de tiempo completa con fechas).
5. Los ADR relacionados con la tarea (`docs/adr/README.md` tiene el indice con fechas).
6. `docs/guia-continuidad-y-despliegue-produccion.md` antes de conectarse o desplegar en produccion.

Ver ADR 0033 para el rol de cada documento.

## Objetivo del proyecto

Aplicacion web full-stack de productividad tipo workspace: espacios y subespacios, hojas de texto, pizarras, diagramas BD, reportes de horas, tareas Kanban, calendario, archivo, amigos y espacios compartidos.

## Estado actual

- **En produccion** en `https://agenda.martinnauca.com` (frontend estatico en Nginx, backend Express en el puerto interno 4100, PostgreSQL). Ultimo release frontend: `20261112161419` (2026-11-12).
- Repositorio publico: `https://github.com/Taciturno11/GestionTareas`, rama `main`.
- Frontend SPA (React + Vite) conectado al backend `backend/` (Express MVC modular + Prisma + PostgreSQL) con login JWT. La sesion se renueva sola mientras se usa (`POST /api/auth/refresh`, ADR 0034) y en produccion caduca tras `JWT_EXPIRES_IN=30d` sin actividad.
- Los datos viven en PostgreSQL. `localStorage` solo funciona como cache/fallback (`src/data/workspaces.ts`, `gt_tasks`); `src/data/mockTasks.ts` y `mockHome.ts` son mocks antiguos sin uso.
- Routing con `react-router-dom`; todas las rutas son lazy.
- UI con Tailwind CSS, componentes `components/ui`, Base UI/shadcn, Heroicons/Lucide, tema claro/oscuro y fondo de particulas.
- Ultimos cambios: ver la parte superior de `docs/historial-cronologico.md`.

## Stack principal

- React
- TypeScript
- Vite
- Tailwind CSS
- React Router
- TanStack Query para cache compartida de tareas y ajustes
- shadcn/Base UI
- Tiptap para hojas de texto enriquecido
- tldraw para hojas tipo pizarra
- React Flow para diagramas BD
- jspdf + jspdf-autotable para PDF del reporte de horas; el Excel se genera como HTML `.xls` sin libreria
- Backend: Node.js, Express, Prisma, PostgreSQL, Zod, JWT

## Estructura importante

- `src/App.tsx`: rutas principales.
- `src/components/AppLayout/`: layout base de app privada.
- `src/components/Header/`: cabecera.
- `src/components/Sidebar/`: navegacion lateral.
- `src/components/ui/`: componentes base reutilizables.
- `src/data/`: cache local y fallback de workspaces/paginas; mocks antiguos sin uso.
- `src/api/`, `src/hooks/`, `src/services/`: clientes HTTP, hooks de datos (TanStack Query) y servicios (token de sesion).
- `src/components/BoardShapeLibrary/`: panel `Figuras` de la pizarra (ADR 0032).
- `backend/src/modules/`: modulos MVC del backend (auth, users, workspaces, spaces, pages, tasks, projects, friends, shared-spaces...).
- `backend/prisma/`: schema y migraciones.
- `ops/production/`: scripts de produccion (retencion, monitores). No modificar sin pedido explicito del usuario.
- `src/pages/`: paginas principales.
- `src/types/`: tipos compartidos.
- `docs/adr/`: decisiones arquitectonicas; indice con fechas en `docs/adr/README.md`.
- `docs/bitacora-cambios-gestion-tareas.md`: historial vivo y obligatorio con el detalle de cada cambio (desde 2026-06-18).
- `docs/historial-cronologico.md`: linea de tiempo completa con fechas desde el primer commit (2026-04-21).
- `docs/contexto-general.md`: fotografia del estado funcional actual.
- `docs/guia-continuidad-y-despliegue-produccion.md`: procedimiento obligatorio para trabajar entre laptops y desplegar.
- `docs/hojas-texto-pizarra.md`: reglas operativas para hojas de texto y pizarra.
- `docs/plan-migracion-workspaces-proyectos.md`: plan aprobado para workspaces personales y proyectos normalizados.

## Reglas para cambios

- Hacer solo lo que el usuario pidio. No modificar, borrar ni cambiar el funcionamiento de scripts del usuario (`ops/`, scripts del servidor, archivos no trackeados como `ops/apply-tldraw-bypass.sh`) salvo pedido explicito.
- No commitear archivos personales no trackeados (por ejemplo los `.xlsx` de la raiz) salvo pedido explicito.
- Leer `docs/bitacora-cambios-gestion-tareas.md` antes de comenzar cualquier cambio para conocer el contexto mas reciente.
- Leer `docs/guia-continuidad-y-despliegue-produccion.md` antes de conectarse o desplegar en produccion.
- Actualizar la bitacora al terminar cada implementacion, correccion, cambio documental o despliegue.
- Agregar las entradas nuevas al inicio de `Cambios recientes` y nunca borrar el historial anterior.
- Registrar objetivo, cambios, validaciones, despliegue y commit cuando corresponda.
- No escribir secretos, tokens, contrasenas ni claves sensibles en la bitacora.
- No reemplazar el `.env` del servidor ni `config.js` de produccion durante un despliegue.
- Antes de desplegar, exigir working tree limpio, build, backup, migraciones y health checks.
- Para `pg_dump` en el servidor, quitar el parametro de Prisma `?schema=...` de la URL: `pg_dump "${DATABASE_URL%%\?*}" ...`; con la URL completa falla.
- Si solo cambia el frontend, desplegar solo frontend (backup de BD y frontend igualmente, preservar `config.js`).
- Al ejecutar scripts Bash remotos desde PowerShell por SSH, evitar comandos largos dentro de comillas dobles porque PowerShell interpola variables como `$PACKAGE`, `$STAGING` o `$DATABASE_URL` antes de enviarlas al servidor. Usar un here-string de PowerShell y enviarlo por stdin con `ssh root@72.60.138.218 "bash -s -- ARG"`; dentro del script Bash leer argumentos como `$1`, `$2`, etc.
- Leer ADRs antes de cambiar decisiones de arquitectura.
- Crear ADR nuevo si una decision aprobada cambia o aparece una decision tecnica relevante.
- No editar ADR antiguo para ocultar historia; solo corregir typos o enlaces.
- Preferir patrones existentes sobre abstracciones nuevas.
- Las nuevas funcionalidades leen y escriben via `src/api/` + hooks; no agregar nuevos datos mock.
- Evitar mezclar nuevos sistemas de estilos sin ADR o razon clara.
- Mantener componentes de UI reutilizables en `src/components/ui/`.
- Mantener vistas principales en `src/pages/`.
- Para hojas de texto enriquecido, usar Tiptap; no volver a textarea plano salvo compatibilidad puntual.
- Para pizarras, usar tldraw; no crear canvas propio mientras tldraw cubra el caso.
- Para diagramas BD, usar React Flow (`@xyflow/react`); no construir motor de nodos/conexiones propio.
- Archivar espacios debe ser reversible; borrar espacios sigue siendo destructivo y requiere confirmacion.
- Si se cambia el modelo de `WorkspacePage.content` o `WorkspacePage.type`, crear o actualizar ADR/documentacion.
- Antes de agregar extensiones pesadas de Tiptap/tldraw, revisar impacto en bundle y considerar lazy loading.

## Reglas de diseno UX/UI

- Revisar `docs/diseno-ui.md` antes de crear o modificar componentes visuales.
- Antes de aplicar o cerrar un cambio visual, verificar que el resto de componentes de la misma seccion sigan viendose bien.
- Probar componentes reutilizables en sus variantes principales, no solo en el caso que se esta editando.
- No meter formularios complejos dentro de cards pequenas, pills o botones si eso comprime inputs o genera saltos de layout.
- Inputs, color pickers, previews y acciones no deben competir por el mismo espacio.
- Si una interaccion necesita varios controles, usar un formulario, panel o zona separada.
- Estados hover, editar, eliminar y agregar deben ser comodos y no tapar texto ni acciones principales.
- Si un input o textarea necesita cursor de texto, usar `cursor-text-dark` junto con `caret-gray-900`; evita que el I-beam nativo se vea blanco/invisible.
- Si un popover/dropdown se abre dentro de un modal, revisar z-index; `PopoverContent` usa portal y debe quedar encima del modal/backdrop.

## Comandos utiles

```bash
npm run dev            # frontend (Vite, por defecto 5173; proxy /api -> localhost:4000)
npm run build
npm run lint
cd backend && npm run dev     # backend local en el PORT de backend/.env (4000)
cd backend && npm run build
```

- Antes de levantar servidores locales, revisar puertos ocupados (`netstat -ano | findstr LISTENING`); el usuario suele tener otros proyectos corriendo (por ejemplo 5173). Usar otro puerto con `npx vite --port XXXX --strictPort` si hace falta.
- Apagar los servidores locales que se levanten al terminar la prueba.

## Antes de terminar una tarea

- Ejecutar `npm run build` si cambia codigo TypeScript o configuracion.
- Ejecutar `npm run lint` si cambia logica, componentes o imports.
- Actualizar `docs/bitacora-cambios-gestion-tareas.md` con el resultado real de la tarea (entrada nueva arriba, con fecha).
- Agregar una linea con fecha en `docs/historial-cronologico.md`.
- Si hay decision tecnica nueva o cambia una existente: ADR nuevo y agregarlo a la tabla de `docs/adr/README.md`.
- Actualizar README, `docs/contexto-general.md`, la doc especifica (por ejemplo `docs/hojas-texto-pizarra.md`) y este archivo si cambia contexto, estructura, estado de produccion o reglas.
- Commit y push a `main` para que la siguiente laptop o agente parta del mismo estado; si se desplego, registrar release y commit en bitacora e historial.

## Notas de contexto

- `docs/adr/0002` dice que routing se evaluaria despues, pero el repo ya usa React Router. Aun no hay ADR que lo formalice.
- `docs/adr/0003` describe una estructura inicial; la estructura real ya incluye `components/ui` y `lib`.
- `docs/adr/0004` cubre Tailwind, pero no formaliza shadcn/Base UI/iconos.
- `docs/adr/0020` describe verificacion por correo, pero fue retirada en ADR 0021; no hay 2FA activo.
- Existe una revision de codigo del 2026-11-12 con pendientes de seguridad y robustez (limite de intentos en login, validacion de `spaceId` al mover hojas, ciclos de espacios, limpieza de cache al cerrar sesion). No se han corregido todavia; consultar con el usuario antes de abordarlos.
