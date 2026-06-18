# Contexto general del proyecto

Documento maestro de contexto vivo para el frontend de gestion de tareas.

Este documento resume el estado actual del proyecto, lo que ya existe, las decisiones practicas implementadas y las zonas que conviene cuidar al seguir desarrollando. No reemplaza los ADR; los ADR siguen siendo el historial formal de decisiones arquitectonicas.

## Objetivo

Construir una SPA frontend para gestion de tareas que pueda evolucionar hacia vistas de inicio, tareas, proyectos, calendario, archivo y ajustes.

El backend ya tiene una base inicial en `backend/` con Express, TypeScript, Prisma y PostgreSQL. El frontend todavia usa mock data local y persistencia temporal en `localStorage` hasta conectar las vistas con la API.

## Modelo de usuarios y datos

- La aplicacion usa aislamiento por workspace.
- Cada usuario nuevo recibe un workspace personal y queda como `OWNER`.
- El workspace funciona como frontera tecnica de datos y permisos, pero no necesita mostrarse en la experiencia comun.
- Los roles globales son `admin` y `usuario`.
- Los roles internos son `OWNER` y `MEMBER`.
- La relacion de membresias se conserva para colaboracion futura, aunque las invitaciones no se implementan aun.
- Proyecto es una clasificacion visible de tareas dentro del workspace y debe separarse completamente de `workspaceId`.

Ver ADR `0024`.

## Stack actual

- React
- TypeScript
- Vite
- Tailwind CSS
- React Router
- TanStack Query para cache compartida de tareas y ajustes
- shadcn/Base UI para componentes base
- Heroicons y Lucide para iconos
- dnd-kit para drag and drop del Kanban
- Recharts para graficos en inicio
- date-fns y react-day-picker para fechas
- Tiptap para hojas de texto enriquecido
- tldraw para hojas tipo pizarra
- React Flow (`@xyflow/react`) para diagramas BD
- Backend MVC modular con Express, TypeScript, Prisma y PostgreSQL

Documentacion operativa relacionada:

- `docs/hojas-texto-pizarra.md`: reglas para hojas de texto y pizarra.
- `docs/database-er.md`: modelo entidad-relacion de PostgreSQL/Prisma.

## Estructura relevante

```text
src/
  App.tsx
  main.tsx
  index.css
  assets/
  api/
  components/
    AppLayout/
    Header/
    PageContainer/
    Sidebar/
    TaskDetailPanel/
    ui/
  data/
  hooks/
  lib/
  pages/
  services/
  types/
  utils/
docs/
  adr/
  diseno-ui.md
  contexto-general.md
backend/
  prisma/
  src/
```

## Rutas actuales

Las rutas principales estan en `src/App.tsx`.

- `/login`: pantalla publica de login.
- `/`: pagina de inicio/resumen.
- `/tareas`: vista principal de tareas.
- `/proyectos`: placeholder.
- `/calendario`: vista mensual de calendario.
- `/archivo`: espacios archivados.
- `/ajustes`: configuracion de opciones de tareas.
- `/p/:pageId`: hoja creada dentro de workspace.
- `/e/:spaceId`: vista propia de espacio.
- `/s/:spaceId`: vista propia de subespacio.

Las rutas privadas se renderizan dentro de `AppLayout`, que incluye `Sidebar`, `Header` y el area principal con `Outlet`.

## Layout global

Se creo `src/components/PageContainer/PageContainer.tsx` para unificar ancho util y padding de paginas principales.

Reglas:

- `default`: `max-w-[1200px]`
- `wide`: `max-w-[1400px]`
- `narrow`: `max-w-[900px]`
- base: `w-full px-4 py-8`
- alineacion `center`: contenido centrado
- alineacion `start`: contenido alineado al inicio del workspace

Esta decision esta documentada en `docs/adr/0006-contenedor-global-para-paginas-principales.md`.

`Inicio` y `Ajustes` usan variante `wide` para mantener el espaciado general entre vistas principales. En `Ajustes`, el panel interno limita su ancho para evitar que la tabla de configuracion se estire demasiado.

## Navegacion

`src/components/Sidebar/Sidebar.tsx` define la navegacion lateral.

Entradas actuales:

- Inicio
- Mis tareas
- Calendario
- Ajustes

El sidebar tambien incluye:

- titulo fijo `Gestion de Tareas` arriba.
- seccion `Espacios` para agrupar hojas.
- seccion `Hojas` para crear hojas generales.
- seccion `Archivado` como acceso unico a `/archivo`.
- acciones para crear espacios y hojas.
- `/archivo` permite desarchivar espacios.

El sidebar puede colapsarse desde el header. El estado `collapsed` vive en `AppLayout`.

## Workspaces y hojas

Archivos:

- `src/types/workspace.ts`
- `src/data/workspaces.ts`
- `src/pages/PageView.tsx`
- `src/pages/BlankPage.tsx`
- `src/pages/TextPage.tsx`
- `src/pages/BoardPage.tsx`
- `src/pages/DatabaseDiagramPage.tsx`

Persistencia temporal:

- `gt_workspaces`
- `gt_workspace_pages`
- `gt_active_workspace`

Tipos iniciales:

- `WorkspaceSpace`: grupo interno dentro de un workspace.
- `text`: hoja de texto enriquecido con Tiptap.
- `board`: hoja tipo pizarra con tldraw.
- `database`: hoja para diagrama BD/entidad-relacion con React Flow.
- `blank`: compatibilidad con hojas antiguas; se renderiza como texto.
- `tasks`: hoja de tareas base.

Comportamiento actual:

- la parte superior del sidebar es solo titulo fijo; no funciona como selector.
- la seccion `Espacios` agrupa hojas dentro del workspace.
- los espacios pueden tener subespacios de un nivel mediante `parentId`.
- `+` en `Espacios` abre dialog para crear espacio con nombre e icono, y crea una hoja inicial.
- el icono `+` de un espacio permite escoger entre crear subespacio o crear hoja.
- crear subespacio crea tambien una hoja inicial dentro de ese subespacio.
- cada espacio se puede expandir/colapsar.
- cada subespacio se puede expandir/colapsar.
- el sidebar no usa chevron separado para espacios/subespacios; el icono cambia a chevron en hover para ahorrar espacio.
- los espacios usan menu contextual con anticlick para agregar, editar y borrar.
- al presionar el nombre de un subespacio se abre su vista propia.
- los subespacios usan menu contextual con anticlick para agregar, editar y borrar.
- editar espacio permite cambiar nombre e icono en una sola linea.
- los iconos de espacios usan una lista cerrada ampliada basada en Heroicons, similar a selector simple tipo Notion.
- espacios y subespacios guardan color de icono mediante `iconColor`.
- los espacios principales pueden archivarse con `archived` y `archivedAt`.
- archivar un espacio oculta todos sus subespacios y hojas sin borrarlos.
- los espacios archivados se restauran desde `/archivo`.
- el sidebar muestra una entrada unica `Archivado`; los espacios archivados se listan dentro de `/archivo`.
- borrar espacio muestra confirmacion antes de eliminar sus subespacios y hojas.
- las hojas tambien tienen menu contextual con anticlick para editar nombre inline o borrar.
- `Hoja` desde el menu `+` del espacio crea una hoja dentro del espacio.
- las hojas de un subespacio se crean desde el menu contextual de anticlick del subespacio.
- la seccion `Hojas` muestra las hojas generales.
- `Nueva hoja` en la seccion `Hojas` crea una hoja general y queda visible ahi, no dentro de `Espacios`.
- al crear hoja se puede escoger entre `Texto`, `Pizarra` y `Diagrama BD`.
- `/p/:pageId` renderiza la hoja.
- `/e/:spaceId` renderiza el espacio con descripcion editable y enlaces a sus hojas.
- `/s/:spaceId` renderiza el subespacio con descripcion editable y enlaces a sus hojas.
- al borrar la hoja abierta, la app navega al subespacio o espacio que la contenia.
- `TextPage` permite editar titulo y contenido enriquecido.
- `BoardPage` dedica todo el espacio disponible a tldraw; el nombre de la pizarra se edita inline desde el sidebar.
- `DatabaseDiagramPage` permite crear tablas, campos y relaciones entre tablas.
- La documentacion operativa de estos tipos vive en `docs/hojas-texto-pizarra.md`.

Pendiente:

- conectar hojas tipo `tasks` con tareas reales mediante `pageId`.
- permitir duplicar y renombrar hojas desde sidebar.
- crear nuevos workspaces desde UI.
- permitir mover hojas entre espacios.

## Pagina Inicio

Archivo: `src/pages/InicioPage.tsx`

Muestra resumen tipo dashboard:

- KPIs
- tareas recientes
- proximos vencimientos
- progreso de metas con grafico
- actividad reciente

Usa datos de:

- `src/data/mockHome.ts`
- `src/data/mockTasks.ts`

Usa `PageContainer` para layout.

## Pagina Calendario

Archivo: `src/pages/CalendarPage.tsx`

Muestra una vista mensual de tareas basada en las mismas tareas de `Mis tareas`.

Datos:

- lee tareas desde `localStorage` con clave `gt_tasks`.
- lee proyectos, colores, estados y prioridades desde `taskSettings`.
- no usa mock data propia.

Funcionalidades actuales:

- navegacion por mes anterior/siguiente.
- boton `Hoy`.
- filtro directo por proyecto desde dropdown.
- calendario mensual con tareas visibles por dia.
- contador de tareas por dia.
- seleccion de dia.
- panel derecho con agenda del dia seleccionado.
- tareas de varios dias aparecen en cada dia dentro del rango.
- tareas con solo fecha de inicio aparecen solo en esa fecha.
- colores de proyecto se reflejan en las tareas y en el panel lateral.
- el dia, mes y filtro seleccionados se conservan en la URL y durante la sesion.
- tareas y ajustes reutilizan cache compartida al cambiar entre Calendario y Mis tareas.

La vista por ahora es de lectura. La edicion de tareas sigue viviendo en `Mis tareas`.

Pendiente para Calendario:

- abrir el panel de detalle al hacer click en una tarea del calendario.
- permitir crear tarea desde un dia del calendario.
- permitir filtros adicionales: responsable, prioridad, etiqueta y estado.
- agregar vista semanal o agenda si la vista mensual queda cargada.
- mejorar responsive mobile/tablet.
- sincronizar automaticamente cambios de `gt_tasks` si se modifican tareas en otra vista mientras Calendario esta abierto.

## Pagina Mis tareas

Archivo principal: `src/pages/DashboardPage.tsx`

Es la vista mas importante y todavia concentra bastante logica.

Funcionalidades actuales:

- vista Kanban
- vista Lista
- filtro por proyecto desde boton `Filtrar`
- creacion de tareas desde boton `Nuevo`
- edicion de tareas mediante panel lateral derecho
- drag and drop de tarjetas con dnd-kit
- edicion inline en tabla
- borrado de tarea desde tarjeta Kanban
- cambio de color de tarjeta desde la esquina de la tarjeta
- color de proyecto visible en tarjetas, selector del panel y tabla
- persistencia de tareas en `localStorage` con clave `gt_tasks`

### Kanban

Las tareas se agrupan por estado.

Los estados ahora vienen de ajustes (`taskSettings.statuses`), no de una constante fija.

Cada tarjeta permite:

- abrir detalle
- editar desde icono
- borrar
- cambiar color
- escoger proyecto, etiqueta y prioridad desde la tarjeta

Las tareas creadas rapidamente dentro de una columna no asignan proyecto, etiqueta ni prioridad por defecto. La tarjeta muestra placeholders hasta que el usuario escoja cada valor. Si la vista ya esta dentro de un proyecto mediante `?w=`, ese proyecto se conserva implicitamente.

Las tarjetas muestran:

- proyecto con color configurado en Ajustes
- etiqueta con color y borde
- prioridad con color y borde
- responsable
- fecha o rango de fechas

El formato de fechas usa una regla comun:

- sin fechas: no muestra fecha
- solo inicio: muestra solo `4 may`
- inicio y fin iguales: muestra solo `4 may`
- inicio y fin distintos: muestra `4 may -> 8 may`

El drag and drop se maneja con `dnd-kit`. El cambio real de columna/orden ocurre en `onDragEnd`. `onDragOver` solo actualiza el resaltado de columna para evitar loops de medicion/render durante el arrastre.

### Filtros

El boton `Filtrar` abre directamente un dropdown de proyectos.

Comportamiento:

- `Todos los proyectos` limpia el filtro.
- seleccionar un proyecto filtra Kanban y Lista.
- el boton muestra el proyecto activo cuando hay filtro.
- los proyectos usan el color configurado en Ajustes.

### Lista

Muestra tareas en tabla con columnas:

- proyecto
- nombre de la tarea
- responsable
- prioridad
- plazo
- estado

Al crear desde lista, la nueva fila aparece arriba y tambien se abre el panel lateral derecho.

La columna Proyecto es la primera columna y usa el mismo componente visual de color que el Kanban.

## Panel lateral de tarea

Archivo: `src/components/TaskDetailPanel/TaskDetailPanel.tsx`

Este componente reemplazo los modales.

Comportamiento:

- aparece desde el lado derecho
- se cierra con animacion
- el click fuera, `Cancelar` y `X` cierran directamente si no hubo cambios
- el click fuera, `Cancelar` y `X` piden confirmacion mediante modal si hay cambios sin guardar
- una tarea nueva existe como borrador hasta pulsar `Guardar cambios`
- editar una tarea usa una copia temporal; el Kanban conserva la version confirmada hasta guardar
- guardar crea o actualiza la tarea con una sola sincronizacion, no una solicitud por caracter

Campos actuales:

- titulo
- estado
- prioridad
- etiqueta
- responsable
- fechas de inicio y fin
- proyecto
- notas

El panel usa:

- `TaskSelect`
- `DatePicker`

El campo Proyecto del panel muestra el punto de color definido en Ajustes.

Al crear una tarea, Proyecto empieza vacio y muestra `Seleccionar proyecto`; no se asigna automaticamente el primer proyecto disponible.

Layout actual:

- panel derecho usa ancho maximo de `520px`.
- estado y prioridad van en una sola fila.
- etiqueta y responsable van en una sola fila.
- notas aparece debajo de proyecto como textarea amplio.

## Selector reutilizable

Archivo: `src/components/ui/task-select.tsx`

Se creo para reemplazar selects nativos.

Caracteristicas:

- basado en Base UI Select
- popup flotante
- check de opcion seleccionada
- alineacion inferior con `side="bottom"`
- `alignItemWithTrigger={false}` para evitar superposicion visual
- separacion controlada con `sideOffset`

Si se quiere acercar o alejar el dropdown del trigger, modificar `sideOffset` dentro de `Select.Positioner`.

## Ajustes

Archivo: `src/pages/AjustesPage.tsx`

Permite agregar opciones que impactan en `Mis tareas`.

La pantalla usa tabs/pills internos. Solo una seccion de ajustes se muestra a la vez para evitar scroll vertical innecesario.

Secciones actuales:

- Proyectos
- Responsables
- Etiquetas
- Prioridades
- Estados

Los ajustes se guardan en `localStorage` con clave `gt_task_settings`.

Archivo de soporte:

- `src/data/taskSettings.ts`

Tipos:

- `src/types/taskSettings.ts`

Cuando se guardan ajustes, se emite un evento `gt-task-settings-change` para que `DashboardPage` actualice sus opciones sin recargar.

Comportamiento actual:

- agregar opcion abre un formulario separado arriba del grid/lista.
- editar opcion usa el mismo formulario que agregar, en modo `Guardar`.
- borrar opcion se hace desde accion hover.
- proyectos guardan color propio y ese color impacta en `Mis tareas`.
- etiquetas, prioridades y estados usan formato compacto tipo pill con borde y sombra suave.
- prioridades por defecto mantienen convencion: Alta roja, Media amarilla, Baja gris.
- el boton `Agregar` de la lista es discreto y solo muestra fondo en hover.

## Datos locales y persistencia

Actualmente hay dos tipos de datos locales:

### Mock data estatica

Usada principalmente por Inicio:

- `src/data/mockHome.ts`
- `src/data/mockTasks.ts`

### Persistencia temporal en localStorage

Usada por Mis tareas y Ajustes:

- `gt_tasks`: tareas del tablero/lista.
- `gt_task_settings`: proyectos, responsables, etiquetas, prioridades y estados.

Esto es temporal hasta definir backend/API.

La migracion hacia API ya empezo para tareas y ajustes:

- `useTaskSettings(activeWorkspaceId)` lee/escribe `/api/task-settings` si hay token y conserva fallback local.
- `useTasks(..., { workspaceId })` lee/escribe `/api/tasks` si hay token y conserva fallback local.
- El proyecto configurable de una tarea se guarda en backend como `Task.projectId`; el `workspaceId` de backend queda reservado para el workspace real.

## Componentes UI relevantes

En `src/components/ui/` existen:

- `button.tsx`
- `button-variants.ts`
- `calendar.tsx`
- `date-picker.tsx`
- `popover.tsx`
- `task-select.tsx`

`task-select.tsx` fue agregado para tener selects visualmente consistentes y evitar los estilos nativos del navegador.

## Reglas de diseno y UX

Archivo: `docs/diseno-ui.md`

Se agregaron reglas generales para evitar regresiones visuales:

- revisar el resto de componentes de la misma seccion antes de cerrar un cambio visual.
- probar variantes principales del componente, no solo el caso editado.
- evitar meter formularios complejos dentro de cards pequenas, pills o botones.
- no hacer que inputs compitan por espacio con colores, acciones o previews.
- usar formularios, paneles o zonas separadas cuando una interaccion necesita varios controles.

La decision formal esta documentada en `docs/adr/0007-reglas-generales-de-diseno-ui.md`.

## Decisiones documentadas en ADR

Los ADR viven en `docs/adr/`.

Decisiones actuales:

- `0001`: uso de ADR en `docs/adr`.
- `0002`: SPA con React, Vite y TypeScript.
- `0003`: estructura simple del frontend.
- `0004`: Tailwind como base de estilos.
- `0005`: mock data local mientras no exista backend.
- `0006`: `PageContainer` como contenedor global para paginas principales.
- `0007`: reglas generales de diseno UI.
- `0008`: workspaces y paginas locales.
- `0009`: espacios dentro de workspaces.
- `0010`: sidebar con titulo fijo y espacios como organizacion principal.
- `0011`: subespacios de un nivel dentro del sidebar.
- `0012`: vista propia para subespacios.
- `0013`: iconos con color en espacios.
- `0014`: hojas de texto y pizarra.
- `0015`: diagramas BD con React Flow.
- `0016`: archivado de espacios.
- `0017`: backend MVC modular con Express, Prisma y PostgreSQL.
- `0018`: estructura frontend escalable para API, hooks y utils.
- `0019`: `projectId` en tareas para proyectos configurables.

## Deuda tecnica conocida

- `DashboardPage.tsx` todavia concentra mucha logica: tareas, drag and drop, tabla, Kanban, persistencia y coordinacion del panel.
- React Router ya esta implementado, pero falta ADR especifico formalizando esa decision.
- shadcn/Base UI, iconos y el sistema `components/ui` ya existen, pero falta ADR especifico.
- La persistencia con `localStorage` es temporal y debe cambiar cuando exista backend.
- `localStorage` puede quedar con datos viejos que no coincidan con nuevos ajustes si se cambian ids.
- El filtro de tareas por ahora solo cubre proyecto; mas adelante puede ampliarse a responsable, prioridad, etiqueta, estado y fechas.
- Si se borran opciones usadas por tareas existentes, todavia no hay validacion o migracion automatica de esas tareas.
- Calendario y Mis tareas comparten datos via `localStorage`, pero todavia no hay una capa unica de repositorio/servicio.
- Workspaces y hojas usan `localStorage`; falta integracion real con tareas por `pageId`.
- Hay logica repetida de formato visual: project pills, date ranges, colores de prioridad y lectura de tareas.
- No existe manejo global de errores o boundary para fallos de componentes complejos como drag and drop.
- El bundle sigue grande; Vite recomienda revisar code splitting.
- Tiptap y tldraw aumentan el bundle; conviene lazy loading para rutas `/p/:pageId`.
- React Flow aumenta el bundle; conviene lazy loading para hojas especializadas.
- Las rutas principales y hojas especializadas ya usan lazy loading para reducir el bundle inicial; tldraw sigue generando un chunk grande, pero solo carga al abrir pizarras.

## Convenciones actuales para seguir trabajando

- Usar `PageContainer` en paginas principales.
- Usar `src/api/` para llamadas HTTP al backend; evitar `fetch` directo en paginas.
- Usar `src/hooks/` como capa de migracion entre paginas y datos.
- Usar `src/utils/` para helpers puros compartidos como fechas y transformaciones de tareas.
- Mantener componentes reutilizables en `src/components/` o `src/components/ui/`.
- Mantener vistas principales en `src/pages/`.
- Si una decision tecnica cambia o se formaliza, crear ADR nuevo.
- No editar ADR antiguos para cambiar historia.
- Si se agregan opciones globales de tarea, hacerlo en Ajustes y en `taskSettings`.
- Evitar volver a usar selects nativos en formularios de tarea; preferir `TaskSelect`.
- Evitar modales para edicion de tareas; preferir `TaskDetailPanel`.
- Antes de cerrar cambios visuales, revisar el componente editado junto al resto de componentes de su seccion.
- En interacciones de drag and drop, evitar mutar listas completas durante `onDragOver`; preferir confirmar cambios en `onDragEnd`.

## Siguientes mejoras sugeridas

- Extraer logica de tareas de `DashboardPage` a hooks o helpers.
- Crear una capa `taskRepository` o similar para leer/escribir `gt_tasks` y `gt_task_settings`.
- Extraer componentes compartidos: `ProjectPill`, `PriorityPill`, `TaskDateLabel`, `TaskFilterDropdown`.
- Hacer que Calendario abra `TaskDetailPanel` al seleccionar una tarea.
- Permitir crear tareas desde Calendario seleccionando un dia.
- Ampliar filtros de tareas a responsable, prioridad, etiqueta, estado y fechas.
- Agregar validacion cuando se elimina una opcion de Ajustes usada por tareas existentes.
- Formalizar ADR de React Router.
- Formalizar ADR de shadcn/Base UI y componentes UI.
- Revisar code splitting porque Vite advierte bundle grande.

## Pendientes priorizados para retomar

### Prioridad alta

- Extraer una capa compartida de datos para tareas y ajustes.
- Conectar hojas tipo `tasks` con `DashboardPage` usando `pageId`.
- Abrir detalle de tarea desde Calendario.
- Crear tarea desde Calendario con fecha prellenada.
- Validar o manejar opciones borradas en Ajustes que ya estan usadas por tareas.

### Prioridad media

- Extraer componentes visuales repetidos de `DashboardPage` y `CalendarPage`.
- Agregar filtros por responsable, prioridad, etiqueta y estado.
- Mejorar responsive de Calendario.
- Crear ADR para React Router.
- Crear ADR para Base UI/shadcn/iconos.

### Prioridad baja

- Agregar vista semanal o agenda en Calendario.
- Agregar contador/resumen de tareas por proyecto.
- Revisar code splitting y lazy loading por advertencia de bundle grande.
- Agregar error boundary general.
