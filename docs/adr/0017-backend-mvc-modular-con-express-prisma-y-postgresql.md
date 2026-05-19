# 0017 - Backend MVC modular con Express, Prisma y PostgreSQL

## Estado

Aceptado.

## Contexto

La aplicacion empezo como frontend SPA con datos mock y persistencia temporal en `localStorage`.

Ahora se necesita que varios usuarios puedan usar la aplicacion de forma compartida. El volumen esperado inicial es bajo, aproximadamente 10 a 20 personas, pero la base debe permitir crecer sin adoptar una arquitectura excesiva.

## Decision

Se agrega un backend separado en `backend/` con arquitectura MVC modular por dominio.

Stack inicial:

- Node.js
- Express
- TypeScript
- Prisma
- PostgreSQL
- Zod para validacion
- JWT para autenticacion inicial

Estructura principal:

```text
backend/
  prisma/
    schema.prisma
  src/
    modules/
      auth/
      users/
      workspaces/
      spaces/
      pages/
      tasks/
      task-settings/
    database/
    middlewares/
    config/
    shared/
    app.ts
    server.ts
```

Cada modulo mantiene juntos sus archivos MVC:

- `*.routes.ts`: rutas HTTP.
- `*.controller.ts`: entrada/salida HTTP.
- `*.service.ts`: reglas de negocio y permisos.
- `*.repository.ts`: acceso a datos con Prisma cuando aplica.
- `*.dto.ts`: validacion y contratos de entrada.

## Consecuencias

- La app queda preparada para reemplazar `localStorage` por API sin reescribir todo el frontend de una vez.
- El backend sigue siendo simple para el volumen esperado.
- Los dominios principales quedan separados para facilitar mantenimiento.
- Prisma centraliza modelos, relaciones y migraciones.
- Si el producto crece mucho, esta base puede evolucionar sin saltar directamente a microservicios.
