# Hojas de texto, pizarra y diagramas BD

Esta documentacion resume como funcionan los dos tipos de hojas actuales.

## Tipos

Las hojas usan `WorkspacePage.type`.

- `text`: hoja de texto enriquecido.
- `board`: hoja tipo pizarra.
- `blank`: compatibilidad con hojas antiguas; se renderiza como texto.
- `database`: hoja para diagramas BD/entidad-relacion.
- `tasks`: reservado para hoja de tareas.

## Hoja de texto

Archivo principal: `src/pages/TextPage.tsx`

Usa Tiptap:

- `@tiptap/react`
- `@tiptap/starter-kit`
- `@tiptap/extension-text-style`
- `@tiptap/extension-color`
- `@tiptap/extension-underline`

Licencia verificada en paquetes instalados: MIT.

La hoja de texto guarda el contenido como JSON serializado en `WorkspacePage.content`.

Reglas:

- No volver a usar textarea plano para hojas de texto enriquecido.
- Los nuevos formatos deben agregarse como extensiones de Tiptap.
- La toolbar debe mantenerse estable y usable; si crece mucho, dividir en grupos.
- Antes de agregar extensiones pesadas, revisar impacto en bundle.
- Mantener compatibilidad con contenido viejo en texto plano.

## Hoja pizarra

Archivo principal: `src/pages/BoardPage.tsx`

Usa tldraw:

- `tldraw`

La pizarra usa `WorkspacePage.content` como fuente principal de persistencia.

Formato actual para nuevas escrituras:

- `tldraw-snapshot-v1`: snapshot serializado de tldraw guardado en `WorkspacePage.content`.

Compatibilidad:

- Las pizarras importadas desde backups antiguos pueden venir como `tldraw-indexeddb-backup-v1`.
- Al abrir una pizarra antigua, el frontend convierte ese backup a un snapshot de tldraw en memoria.
- Al editar y guardar, la pizarra pasa a persistirse como `tldraw-snapshot-v1`.

Reglas:

- No construir canvas propio mientras tldraw cubra dibujo, formas y diagramas.
- La pizarra no muestra titulo en el area principal; su nombre se edita desde el sidebar.
- No usar `persistenceKey` como fuente principal en produccion; IndexedDB no debe ser la verdad de datos.
- Si se necesita exportar/importar pizarras, usar snapshots de tldraw y mantener compatibilidad con backups antiguos.
- Separar mejoras de pizarra de mejoras de texto para evitar mezclar modelos de persistencia.

## Hoja diagrama BD

Archivo principal: `src/pages/DatabaseDiagramPage.tsx`

Usa React Flow:

- `@xyflow/react`

La hoja BD guarda nodos y relaciones como JSON serializado en `WorkspacePage.content`.

Reglas:

- Usar nodos para tablas y edges para relaciones.
- Editar campos desde panel lateral, no dentro de cards demasiado pequenas.
- Mantener la herramienta orientada a entidad-relacion; para dibujo libre usar `board`.

## Creacion desde sidebar

Al crear una hoja desde `Hojas`, un espacio o un subespacio, el usuario escoge:

- `Texto`
- `Pizarra`
- `Diagrama BD`

Las hojas nuevas de texto se crean con tipo `text`.
