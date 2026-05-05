# 0008 - Workspaces y paginas locales

## Estado

Aceptado.

## Contexto

El proyecto necesita evolucionar hacia una experiencia similar a Notion: un sidebar con espacio de trabajo activo y hojas creadas por el usuario. Hasta ahora existian rutas globales fijas como Inicio, Mis tareas, Calendario y Ajustes.

Se requiere una primera base que permita crear hojas dentro de un workspace sin definir todavia backend.

## Decision

Se agrega un modelo local de workspaces y paginas.

Archivos principales:

- `src/types/workspace.ts`
- `src/data/workspaces.ts`
- `src/pages/PageView.tsx`
- `src/pages/BlankPage.tsx`

Persistencia temporal:

- `gt_workspaces`
- `gt_workspace_pages`
- `gt_active_workspace`

Ruta nueva:

- `/p/:pageId`

Tipos iniciales de pagina:

- `blank`: hoja en blanco con titulo y contenido.
- `tasks`: hoja de tareas base, pendiente de conectar a tareas filtradas por `pageId`.

El sidebar muestra:

- selector de workspace arriba.
- navegacion principal.
- seccion `Hojas`.
- accion `+ Nueva pagina`.

## Consecuencias

- La app empieza a tener estructura de workspace sin backend.
- Las hojas pueden crecer luego hacia jerarquia, duplicado, borrado y tipos adicionales.
- `DashboardPage` y `CalendarPage` todavia no consumen `pageId`; eso queda como siguiente fase.
- Cuando exista backend, `src/data/workspaces.ts` debe reemplazarse por repositorio/API sin cambiar todo el UI.
