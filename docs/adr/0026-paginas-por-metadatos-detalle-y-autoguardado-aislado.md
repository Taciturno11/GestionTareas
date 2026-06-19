# 0026 - Paginas por metadatos, detalle y autoguardado aislado

## Estado

Aceptado.

## Contexto

El frontend cargaba el contenido completo de todas las paginas al iniciar. Esto incluia
snapshots de pizarras de varios megabytes dentro de `gt_workspace_pages`.

Cada tecla escrita en una hoja de texto provocaba:

- serializacion y escritura de todas las paginas en `localStorage`;
- eventos y renders globales;
- una solicitud `PATCH /api/pages/:id`;
- procesamiento innecesario del contenido de otras hojas y pizarras.

El servidor no era el cuello de botella. La mayor parte del costo ocurria en el hilo
principal del navegador.

## Decision

Las paginas se dividen en dos contratos:

- `PageSummary`: metadatos sin `content`, usado por sidebar, espacios, archivo y listados;
- `WorkspacePage`: detalle completo, cargado solamente al abrir una hoja.

La API mantiene compatibilidad temporal:

- `GET /api/pages?workspaceId=&includeContent=false` devuelve metadatos;
- si `includeContent` no se envia, devuelve temporalmente el contrato completo;
- `GET /api/pages/:id` devuelve el detalle completo;
- `PATCH /api/pages/:id` persiste los cambios y devuelve solo metadatos.

TanStack Query usa caches separadas:

- `['pages', workspaceId]` para metadatos;
- `['page', pageId]` para el detalle.

`gt_workspace_pages` conserva solamente metadatos. El contenido pesado no se replica
en `localStorage` ni se distribuye mediante eventos globales.

El guardado se aisla por pagina:

- texto: debounce de 800 ms, una solicitud activa y borrador local temporal;
- pizarra: snapshot unico actual despues de 1.5 segundos de inactividad;
- diagrama BD: guardado debounced de su propia pagina;
- cambio de foco, ruta o visibilidad intenta vaciar la cola pendiente.

La identidad de la cola y sus efectos permanece estable durante los renders del
editor. Una respuesta de guardado actualiza caches y metadatos, pero no reemplaza
el valor local que el usuario continua escribiendo. Los titulos vacios se persisten
como vacios y `Pagina sin titulo` es solo una representacion visual.

Los borradores locales se permiten unicamente para texto y usan
`gt_text_draft:<pageId>`. Una pizarra no genera copias ni borradores automaticos.

`GET /api/workspaces` lista solamente membresias del usuario. El administrador abre
un workspace ajeno mediante un contexto administrativo explicito y consulta por ID.

## Consecuencias

- La carga inicial deja de descargar snapshots de pizarras.
- Escribir no reserializa todas las paginas ni emite eventos globales.
- Varias ediciones consecutivas se combinan en una unica solicitud.
- Una respuesta antigua no puede sobrescribir una edicion mas reciente porque la cola
  procesa una sola solicitud a la vez.
- La recuperacion local protege texto pendiente ante errores de red sin duplicar
  contenido pesado.
- El backend conserva compatibilidad con el frontend anterior durante un despliegue
  escalonado.
- No se requiere migracion del esquema PostgreSQL.

## Operacion

- No se crean copias automaticas de chunks de pizarra.
- El monitor del chunk procesa cada archivo generado una sola vez mediante estado.
- Produccion conserva el release actual y el anterior, un rollback inmediato de
  frontend/backend y los tres respaldos PostgreSQL mas recientes.
- Los scripts operativos versionados viven en `ops/production/`.
- Cada despliegue de esta mejora inicia un monitor temporal de 24 horas que registra
  salud, memoria, CPU, disco, cantidad de `PATCH /api/pages`, errores y tiempo de
  respuesta.
- Los respaldos operativos no restauran contenido que un usuario elimino
  voluntariamente.
