# Arquitectura frontend

Documento operativo para mantener el frontend escalable mientras se migra de `localStorage` a backend.

## Objetivo

Separar responsabilidades sin reescribir toda la app de golpe.

El frontend actual sigue funcionando con datos locales, pero ya existe una base para conectar la API real del backend.

## Estructura

```text
src/
  api/
    http.ts
    auth.api.ts
    workspaces.api.ts
    spaces.api.ts
    pages.api.ts
    tasks.api.ts
    task-settings.api.ts

  assets/

  components/
    AppLayout/
    Header/
    Sidebar/
    PageContainer/
    TaskDetailPanel/
    ui/

  data/
    mock y persistencia local temporal

  hooks/
    useTasks.ts
    useWorkspaces.ts
    useTaskSettings.ts

  pages/

  services/
    auth-token.ts

  types/

  utils/
    date.utils.ts
    task.utils.ts

  lib/
    utils.ts
```

## Responsabilidades

### `api/`

Clientes HTTP por modulo del backend.

Reglas:

- No usar `fetch` directo desde paginas.
- Usar `http.ts` para base URL, token, errores y JSON.
- Mantener un archivo por dominio: `tasks.api.ts`, `spaces.api.ts`, etc.

### `services/`

Servicios de aplicacion que no son UI.

Ejemplo actual:

- `auth-token.ts`: guardar, leer y limpiar token.

### `hooks/`

Hooks para coordinar datos y estado compartido.

Reglas:

- Las paginas deben ir migrando a hooks para no concentrar persistencia y eventos.
- Mientras dure la migracion, los hooks pueden envolver `localStorage`.
- Cuando la API este lista, los hooks pueden pasar a usar `api/` sin cambiar toda la UI.

### `utils/`

Funciones puras reutilizables.

Ejemplos:

- formateo de fechas.
- helpers de tareas.
- transformaciones de datos.

### `data/`

Temporal.

Mantiene mock data y persistencia local mientras no se complete la migracion al backend.

No agregar nueva logica de negocio compleja aqui si ya corresponde a `hooks/`, `api/` o `utils/`.

### `components/`

Componentes reutilizables, layout y UI base.

Reglas:

- `components/ui/` queda para componentes base.
- componentes ligados a una vista pueden vivir junto a su dominio futuro cuando se extraiga `features/`.
- no meter llamadas API directas en componentes de UI base.

### `pages/`

Vistas principales conectadas a routing.

Reglas:

- Las paginas pueden coordinar la vista.
- La logica pesada debe moverse gradualmente a hooks, utils o componentes internos.

## Migracion recomendada

Orden:

1. Mantener backup local antes de cambios grandes.
2. Usar `api/` para clientes HTTP.
3. Usar `hooks/` como capa entre paginas y datos.
4. Migrar primero `Ajustes` y `task-settings`.
5. Migrar `workspaces`, `spaces` y `pages`.
6. Migrar `tasks`.
7. Reemplazar lecturas directas de `localStorage`.
8. Limpiar `src/data/` cuando backend sea fuente principal.

## Integracion backend actual

Estado:

- `LoginPage` autentica contra `/api/auth/login`.
- El token se guarda en `gt_auth_token`.
- `AppLayout` intenta sincronizar datos del backend si existe token.
- `backend-sync.ts` trae `workspaces`, `spaces` y `pages` desde API y los vuelca en `localStorage` temporal.
- `src/data/workspaces.ts` conserva compatibilidad local y espeja cambios de espacios/paginas al backend.

Esta capa hibrida es temporal. Permite usar la UI actual sin reescribir `Sidebar`, `PageView`, `SubspaceView` y `ArchivePage` de golpe.

## Convenciones

- No renombrar tipos existentes masivamente sin necesidad.
- Si se agregan tipos espejo para convencion, usar re-export temporal:

```ts
export type * from './task'
```

- Evitar refactors grandes que mezclen UI, datos y backend en el mismo cambio.
- Cada migracion debe preservar datos locales hasta que exista importacion al backend.

## Lazy loading y bundle

Las rutas principales usan `React.lazy` desde `src/App.tsx`.

Las hojas especializadas usan lazy loading desde `src/pages/PageView.tsx`:

- `TextPage`: carga Tiptap solo al abrir hoja de texto.
- `BoardPage`: carga tldraw solo al abrir pizarra.
- `DatabaseDiagramPage`: carga React Flow solo al abrir diagrama BD.

Reglas:

- Las librerias pesadas no deben importarse desde `App.tsx`.
- Si una vista usa una libreria grande, cargarla por ruta o por componente lazy.
- Un chunk lazy puede seguir siendo grande si la libreria lo es, pero no debe penalizar la carga inicial de la app.
