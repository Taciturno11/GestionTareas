# 0023 - Cache compartida para tareas y estado de calendario en URL

## Estado

Aceptado.

## Contexto

`DashboardPage`, `CalendarPage`, `InicioPage` y `AjustesPage` consumen tareas o ajustes mediante hooks propios.

Al navegar entre rutas, React desmonta la pagina anterior. Los hooks volvían a consultar la API cada vez que una pagina se montaba, aunque los mismos datos acabaran de cargarse. Al mismo tiempo, el dia, mes y filtro seleccionados en Calendario vivian en estado local y se perdian al salir de la ruta.

La aplicacion ya tiene varios usuarios. Evitar todas las actualizaciones remotas dejaria datos obsoletos, pero repetir consultas en cada cambio de modulo agrega trafico y empeora la experiencia.

## Decision

Se incorpora `@tanstack/react-query` como cache compartida inicial para:

- tareas por `workspaceId` y `pageId`;
- ajustes de tareas por `workspaceId`.

Configuracion inicial:

- `staleTime`: 30 segundos;
- `gcTime`: 10 minutos;
- revalidacion al recuperar foco;
- revalidacion al recuperar conexion;
- un reintento para consultas.

Los hooks existentes `useTasks` y `useTaskSettings` conservan su interfaz publica para evitar reescribir las paginas. `localStorage` se mantiene temporalmente como respaldo de compatibilidad, no como estrategia principal de frescura.

Las escrituras actualizan la cache de forma inmediata y solo envian a la API las tareas que realmente cambiaron. La respuesta de la escritura reconcilia la cache con PostgreSQL sin forzar una lectura adicional. Si una escritura falla, la consulta se invalida para recuperar el estado real.

El estado navegable de Calendario se guarda en parametros de URL:

- `date`: dia seleccionado;
- `month`: mes visible;
- `project`: filtro de proyecto.

La ultima combinacion tambien se conserva en `sessionStorage` para que el acceso fijo `/calendario` del sidebar recupere la vista durante la sesion.

## Consecuencias

- Cambiar rapidamente entre Mis tareas y Calendario reutiliza datos recientes.
- La informacion puede actualizarse en segundo plano cuando queda obsoleta, vuelve el foco o regresa la conexion.
- Crear, editar, borrar y reordenar tareas mantiene sincronizacion con el backend.
- El dia, mes y filtro de Calendario sobreviven al cambio de modulo y a una recarga durante la sesion.
- TanStack Query pasa a ser una dependencia arquitectonica del frontend.
- La migracion es incremental; workspaces, espacios y paginas conservan por ahora su flujo hibrido existente.
