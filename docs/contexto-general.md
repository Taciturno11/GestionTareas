# Contexto general del proyecto

Documento maestro de contexto vivo para el frontend de gestion de tareas.

Este documento resume el estado actual del proyecto, lo que ya existe, las decisiones practicas implementadas y las zonas que conviene cuidar al seguir desarrollando. No reemplaza los ADR; los ADR siguen siendo el historial formal de decisiones arquitectonicas.

## Objetivo

Construir una SPA frontend para gestion de tareas que pueda evolucionar hacia vistas de inicio, tareas, proyectos, calendario, archivo y ajustes.

El backend todavia no esta definido. Por ahora la aplicacion usa mock data local y persistencia temporal en `localStorage`.

## Stack actual

- React
- TypeScript
- Vite
- Tailwind CSS
- React Router
- shadcn/Base UI para componentes base
- Heroicons y Lucide para iconos
- dnd-kit para drag and drop del Kanban
- Recharts para graficos en inicio
- date-fns y react-day-picker para fechas

## Estructura relevante

```text
src/
  App.tsx
  main.tsx
  index.css
  assets/
  components/
    AppLayout/
    Header/
    PageContainer/
    Sidebar/
    TaskDetailPanel/
    ui/
  data/
  lib/
  pages/
  types/
docs/
  adr/
  diseno-ui.md
  contexto-general.md
```

## Rutas actuales

Las rutas principales estan en `src/App.tsx`.

- `/login`: pantalla publica de login.
- `/`: pagina de inicio/resumen.
- `/tareas`: vista principal de tareas.
- `/proyectos`: placeholder.
- `/calendario`: vista mensual de calendario.
- `/archivo`: placeholder.
- `/ajustes`: configuracion de opciones de tareas.

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

El sidebar puede colapsarse desde el header. El estado `collapsed` vive en `AppLayout`.

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

La vista por ahora es de lectura. La edicion de tareas sigue viviendo en `Mis tareas`.

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
- se cierra con `Cancelar`, `X`, click fuera o guardar
- edita campos de tarea
- cambios se reflejan en tiempo real en Kanban/lista

Campos actuales:

- titulo
- estado
- prioridad
- etiqueta
- responsable
- fechas de inicio y fin
- proyecto

El panel usa:

- `TaskSelect`
- `DatePicker`

El campo Proyecto del panel muestra el punto de color definido en Ajustes.

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

## Deuda tecnica conocida

- `DashboardPage.tsx` todavia concentra mucha logica: tareas, drag and drop, tabla, Kanban, persistencia y coordinacion del panel.
- React Router ya esta implementado, pero falta ADR especifico formalizando esa decision.
- shadcn/Base UI, iconos y el sistema `components/ui` ya existen, pero falta ADR especifico.
- La persistencia con `localStorage` es temporal y debe cambiar cuando exista backend.
- `localStorage` puede quedar con datos viejos que no coincidan con nuevos ajustes si se cambian ids.
- El filtro de tareas por ahora solo cubre proyecto; mas adelante puede ampliarse a responsable, prioridad, etiqueta, estado y fechas.
- Si se borran opciones usadas por tareas existentes, todavia no hay validacion o migracion automatica de esas tareas.

## Convenciones actuales para seguir trabajando

- Usar `PageContainer` en paginas principales.
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
- Formalizar ADR de React Router.
- Formalizar ADR de shadcn/Base UI y componentes UI.
- Ampliar filtros de tareas a responsable, prioridad, etiqueta, estado y fechas.
- Agregar servicios o repositorios de datos cuando se defina backend.
- Revisar code splitting porque Vite advierte bundle grande.
