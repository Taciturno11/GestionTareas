# 0018 - Estructura frontend escalable para API, hooks y utils

## Estado

Aceptado.

## Contexto

El frontend empezo como SPA con mock data y persistencia en `localStorage`.

Ahora existe una base de backend MVC modular y se necesita preparar el frontend para conectarse a una API real sin reescribir toda la app ni perder datos locales.

## Decision

Se agregan capas explicitas al frontend:

- `src/api/`: clientes HTTP por dominio.
- `src/services/`: servicios transversales de aplicacion.
- `src/hooks/`: hooks de datos y estado compartido.
- `src/utils/`: funciones puras reutilizables.

Se mantiene:

- `src/pages/` para vistas principales.
- `src/components/` para layout y componentes reutilizables.
- `src/components/ui/` para UI base.
- `src/data/` para mock data y persistencia local temporal.
- `src/types/` para tipos compartidos.

La migracion sera incremental. No se renombraran masivamente tipos o paginas mientras el frontend siga usando `localStorage`.

## Consecuencias

- Las paginas pueden migrar a backend de forma gradual.
- Las llamadas HTTP quedan centralizadas.
- La persistencia local queda encapsulada progresivamente en hooks.
- Se reduce el riesgo de perder datos locales durante refactors.
- `src/data/` seguira existiendo temporalmente hasta completar la migracion al backend.
