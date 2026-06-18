# 0022 - Pizarras backend-first con snapshots de tldraw

## Estado

Aceptado.

## Contexto

La decision original de `0014` usaba `persistenceKey` de tldraw para persistir pizarras en IndexedDB local por `page.id`.

Al pasar el proyecto a backend/PostgreSQL, esa estrategia quedo incompleta:

- IndexedDB no sirve como fuente principal entre navegadores o dispositivos.
- `persistenceKey` compite con snapshots cargados desde `WorkspacePage.content`.
- Guardar pizarras mediante el flujo general `onChange -> localStorage -> evento global` puede remontar la vista mientras tldraw sigue activo.
- Los backups importados desde navegador contienen pizarras antiguas como `tldraw-indexeddb-backup-v1`.

## Decision

La fuente principal de las pizarras pasa a ser `WorkspacePage.content` en PostgreSQL.

Formato nuevo:

- `tldraw-snapshot-v1`: wrapper JSON con `savedAt` y `snapshot` de tldraw.

Compatibilidad:

- `BoardPage` acepta contenido antiguo `tldraw-indexeddb-backup-v1`.
- Al abrir una pizarra antigua, el frontend transforma los registros del backup a un snapshot inicial compatible con tldraw.
- Al editar, el autoguardado guarda el snapshot nuevo en backend con `PATCH /api/pages/:id`.

Persistencia local:

- `persistenceKey` deja de usarse como fuente principal de datos.
- La cache local de paginas puede actualizarse sin emitir evento global para evitar remounts del canvas.

## Consecuencias

- Las pizarras nuevas y editadas quedan persistidas en backend/PostgreSQL.
- El flujo es mas estable para produccion y multi-dispositivo.
- Las pizarras antiguas siguen abriendo desde el backup importado cuando hay registros suficientes.
- Los assets binarios antiguos provenientes de IndexedDB pueden no estar disponibles si el backup no contenia los blobs reales.
- El backend y Nginx deben aceptar payloads JSON mas grandes que una pagina de texto comun.
