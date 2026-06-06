# Gestion de tareas

Aplicacion web full-stack para gestion de tareas, espacios, hojas, calendario y archivo.

## Contexto rapido

- Producto: panel web para organizar tareas, proyectos, calendario y archivo.
- Etapa: frontend en evolucion, con mock data local mientras se define backend.
- Enfoque actual: SPA con React, Vite, TypeScript y Tailwind CSS.
- Documentacion de decisiones: [docs/adr](./docs/adr/README.md).
- Contexto general del estado actual: [docs/contexto-general.md](./docs/contexto-general.md).
- Reglas generales de diseno UI: [docs/diseno-ui.md](./docs/diseno-ui.md).
- Hojas de texto y pizarra: [docs/hojas-texto-pizarra.md](./docs/hojas-texto-pizarra.md).
- Arquitectura frontend: [docs/frontend-arquitectura.md](./docs/frontend-arquitectura.md).
- Backend MVC modular: [docs/backend.md](./docs/backend.md).
- Modelo entidad-relacion: [docs/database-er.md](./docs/database-er.md).
- Resumen de implementacion full-stack: [docs/resumen-implementacion-2026-05-19.md](./docs/resumen-implementacion-2026-05-19.md).
- Guia para clonar y ejecutar: [docs/guia-clonar-y-ejecutar.md](./docs/guia-clonar-y-ejecutar.md).
- Contexto para agentes IA: [AGENTS.md](./AGENTS.md).

## Stack

- React
- TypeScript
- Vite
- Tailwind CSS
- React Router
- shadcn/Base UI para componentes base
- Tiptap para hojas de texto enriquecido
- tldraw para hojas tipo pizarra
- React Flow para diagramas BD
- Node.js + Express para backend
- Prisma + PostgreSQL para base de datos

## Inicio rapido

Clonar:

```bash
git clone https://github.com/Taciturno11/GestionTareas.git
cd GestionTareas
```

Instalar frontend:

```bash
npm install
```

Instalar backend:

```bash
cd backend
npm install
cp .env.example .env
npm run prisma:generate
npm run prisma:push
```

Levantar backend:

```bash
cd backend
npm run dev
```

Levantar frontend en otra terminal:

```bash
npm run dev
```

Guia completa:

- [docs/guia-clonar-y-ejecutar.md](./docs/guia-clonar-y-ejecutar.md)

## Estructura

```text
src/
  api/          Clientes HTTP del frontend
  assets/       Recursos visuales
  components/   Layout, navegacion y componentes reutilizables
  components/ui Componentes base de UI
  data/         Mock data local
  hooks/        Hooks compartidos
  lib/          Utilidades compartidas
  pages/        Vistas principales
  services/     Servicios frontend
  types/        Tipos compartidos
  utils/        Utilidades puras
backend/
  prisma/       Schema Prisma
  src/          API Express MVC modular
docs/           Documentacion y ADRs
```

## Scripts

- `npm run dev`: servidor local
- `npm run build`: build de produccion
- `npm run lint`: revision estatica

## Backend

El backend vive en `backend/` y usa arquitectura MVC modular con Express, TypeScript, Prisma y PostgreSQL.

Documentacion especifica:

- [backend/README.md](./backend/README.md)
- [docs/backend.md](./docs/backend.md)

Scripts principales:

- `cd backend && npm run dev`: API local
- `cd backend && npm run build`: compilar TypeScript
- `cd backend && npm run prisma:migrate`: ejecutar migraciones Prisma
- `cd backend && npm run prisma:studio`: abrir Prisma Studio

## Convenciones

- Mantener cambios pequenos y coherentes con la estructura actual.
- Usar `src/data/` y `src/types/` para datos temporales hasta que exista API estable.
- Registrar decisiones arquitectonicas nuevas como ADR incremental en `docs/adr/`.
- No reescribir el sentido historico de ADR aprobados; crear uno nuevo si cambia una decision.
- Antes de cerrar cambios visuales, revisar la seccion completa y las variantes del componente segun `docs/diseno-ui.md`.
- Inputs, textareas y editores deben usar `cursor-text-dark` junto con `caret-gray-900` si el I-beam nativo se ve blanco o poco visible.
