# ADR

Este directorio guarda los Architecture Decision Records del proyecto.

## Lista

Fecha = fecha en que el ADR se agrego al repositorio (`git log`).

| ADR | Fecha | Decision |
| --- | --- | --- |
| [0001](./0001-registro-de-adrs-en-docs-adr.md) | 2026-04-21 | Registro de ADRs en docs/adr |
| [0002](./0002-frontend-spa-con-react-vite-y-typescript.md) | 2026-04-21 | Frontend SPA con React, Vite y TypeScript |
| [0003](./0003-estructura-simple-del-frontend.md) | 2026-04-21 | Estructura simple del frontend |
| [0004](./0004-tailwind-como-base-de-estilos.md) | 2026-04-21 | Tailwind como base de estilos |
| [0005](./0005-uso-de-mock-data-local-mientras-se-define-el-backend.md) | 2026-04-21 | Uso de mock data local mientras se define el backend |
| [0006](./0006-contenedor-global-para-paginas-principales.md) | 2026-05-05 | Contenedor global para paginas principales |
| [0007](./0007-reglas-generales-de-diseno-ui.md) | 2026-05-05 | Reglas generales de diseno UI |
| [0008](./0008-workspaces-y-paginas-locales.md) | 2026-05-05 | Workspaces y paginas locales |
| [0009](./0009-espacios-dentro-de-workspaces.md) | 2026-05-05 | Espacios dentro de workspaces |
| [0010](./0010-sidebar-con-titulo-fijo-y-espacios.md) | 2026-05-05 | Sidebar con titulo fijo y espacios como organizacion principal |
| [0011](./0011-subespacios-en-sidebar.md) | 2026-05-05 | Subespacios en sidebar |
| [0012](./0012-vista-propia-para-subespacios.md) | 2026-05-05 | Vista propia para subespacios |
| [0013](./0013-iconos-con-color-en-espacios.md) | 2026-05-05 | Iconos con color en espacios |
| [0014](./0014-hojas-texto-y-pizarra.md) | 2026-05-08 | Hojas de texto y pizarra |
| [0015](./0015-diagramas-bd-con-react-flow.md) | 2026-05-08 | Diagramas BD con React Flow |
| [0016](./0016-archivado-de-espacios.md) | 2026-05-19 | Archivado de espacios |
| [0017](./0017-backend-mvc-modular-con-express-prisma-y-postgresql.md) | 2026-05-19 | Backend MVC modular con Express, Prisma y PostgreSQL |
| [0018](./0018-estructura-frontend-escalable-para-api-hooks-y-utils.md) | 2026-05-19 | Estructura frontend escalable para API, hooks y utils |
| [0019](./0019-projectid-en-tareas-para-proyectos-configurables.md) | 2026-06-06 | ProjectId en tareas para proyectos configurables |
| [0020](./0020-2fa-opcional-por-correo-en-autenticacion.md) | 2026-06-06 | Decision historica de verificacion por correo |
| [0021](./0021-normalizacion-roles-y-login-simple.md) | 2026-06-08 | Normalizacion de roles y login simple |
| [0022](./0022-pizarras-backend-first-con-snapshots-tldraw.md) | 2026-06-18 | Pizarras backend-first con snapshots de tldraw |
| [0023](./0023-cache-compartida-para-tareas-y-estado-de-calendario-en-url.md) | 2026-06-18 | Cache compartida para tareas y estado de calendario en URL |
| [0024](./0024-multitenancy-por-workspace-personal-y-proyectos-como-entidad.md) | 2026-06-18 | Multitenancy por workspace personal y proyectos como entidad |
| [0025](./0025-acceso-administrativo-y-ciclo-de-vida-de-proyectos.md) | 2026-06-18 | Acceso administrativo y ciclo de vida de proyectos |
| [0026](./0026-paginas-por-metadatos-detalle-y-autoguardado-aislado.md) | 2026-06-18 | Paginas por metadatos, detalle y autoguardado aislado |
| [0027](./0027-espacios-compartidos-con-permisos-heredados.md) | 2026-06-24 | Espacios compartidos con permisos heredados |
| [0028](./0028-amistades-como-capa-de-confianza-para-compartir-espacios.md) | 2026-06-24 | Amistades como capa de confianza para compartir espacios |
| [0029](./0029-reporte-de-horas-como-tipo-de-pagina.md) | 2026-06-25 | Reporte de horas como tipo de pagina |
| [0030](./0030-cierre-de-sesion-al-expirar-jwt.md) | 2026-10-11 | Cierre de sesion al expirar el JWT |
| [0031](./0031-duracion-directa-en-reportes-de-horas.md) | 2026-10-30 | Duracion directa en reportes de horas |
| [0032](./0032-panel-de-figuras-en-pizarra.md) | 2026-11-12 | Panel de figuras en la pizarra |
| [0033](./0033-documentacion-de-continuidad-para-agentes.md) | 2026-11-12 | Documentacion de continuidad para multiples agentes |
| [0034](./0034-renovacion-deslizante-de-sesion.md) | 2026-11-15 | Renovacion deslizante de la sesion |

## Convencion

- Los archivos usan numeracion incremental.
- Cada ADR debe incluir al menos: `Estado`, `Contexto`, `Decision` y `Consecuencias`.
- Si una decision cambia, no se reescribe el ADR anterior; se crea uno nuevo que lo complemente o lo reemplace.
- Al crear un ADR, agregarlo a esta tabla y registrar el cambio en `docs/bitacora-cambios-gestion-tareas.md` y `docs/historial-cronologico.md` (ver ADR 0033).
