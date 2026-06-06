# 0019 - ProjectId en tareas para proyectos configurables

## Estado

Aceptado.

## Contexto

La UI de tareas ya tenia una opcion llamada `Proyecto` configurada desde Ajustes. En el frontend antiguo ese valor se guardaba en el campo local `workspaceId` de cada tarea, pero en el backend `workspaceId` representa el workspace real de la base de datos.

Esa diferencia bloqueaba la migracion de `DashboardPage`, `CalendarPage` y `AjustesPage` hacia la API, porque una tarea necesita pertenecer a un workspace real y, al mismo tiempo, conservar su proyecto configurable.

## Decision

Agregar `projectId` opcional al modelo `Task`.

Reglas:

- `Task.workspaceId` sigue representando el workspace real.
- `Task.projectId` representa el proyecto configurable definido en `TaskSettings.projects`.
- Durante la migracion, la UI puede seguir usando su forma local antigua y mapearla hacia `projectId` al sincronizar con la API.
- El importador de backups locales interpreta el antiguo `task.workspaceId` local como `projectId` y usa el workspace activo como `workspaceId` real.

## Consecuencias

- Las tareas pueden migrar al backend sin perder el filtro visual por proyecto.
- Se evita mezclar el concepto de workspace con el concepto de proyecto de tarea.
- El frontend mantiene compatibilidad temporal con datos guardados en `localStorage`.
- La base de datos necesita sincronizarse con Prisma para crear la columna `projectId`.
