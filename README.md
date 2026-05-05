# Gestion de tareas

Frontend de una aplicacion web para gestion de tareas.

## Contexto rapido

- Producto: panel web para organizar tareas, proyectos, calendario y archivo.
- Etapa: frontend en evolucion, con mock data local mientras se define backend.
- Enfoque actual: SPA con React, Vite, TypeScript y Tailwind CSS.
- Documentacion de decisiones: [docs/adr](./docs/adr/README.md).
- Contexto general del estado actual: [docs/contexto-general.md](./docs/contexto-general.md).
- Reglas generales de diseno UI: [docs/diseno-ui.md](./docs/diseno-ui.md).
- Contexto para agentes IA: [AGENTS.md](./AGENTS.md).

## Stack

- React
- TypeScript
- Vite
- Tailwind CSS
- React Router
- shadcn/Base UI para componentes base

## Estructura

```text
src/
  assets/       Recursos visuales
  components/   Layout, navegacion y componentes reutilizables
  components/ui Componentes base de UI
  data/         Mock data local
  lib/          Utilidades compartidas
  pages/        Vistas principales
  types/        Tipos compartidos
```

## Scripts

- `npm run dev`: servidor local
- `npm run build`: build de produccion
- `npm run lint`: revision estatica

## Convenciones

- Mantener cambios pequenos y coherentes con la estructura actual.
- Usar `src/data/` y `src/types/` para datos temporales hasta que exista API estable.
- Registrar decisiones arquitectonicas nuevas como ADR incremental en `docs/adr/`.
- No reescribir el sentido historico de ADR aprobados; crear uno nuevo si cambia una decision.
- Antes de cerrar cambios visuales, revisar la seccion completa y las variantes del componente segun `docs/diseno-ui.md`.
