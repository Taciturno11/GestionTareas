# 0014 - Hojas de texto y pizarra

## Estado

Aceptado.

## Contexto

La hoja en blanco original solo permitia texto simple. El producto necesita dos experiencias distintas: una para escribir contenido con formato y otra para formas, diagramas y dibujo.

## Decision

Separar las hojas en dos tipos principales:

- `text`: hoja de texto enriquecido.
- `board`: hoja tipo pizarra.

Se mantiene `blank` en el tipo por compatibilidad con datos viejos, pero las hojas nuevas de texto se crean como `text`.

Librerias:

- Tiptap para hojas de texto. Los paquetes instalados de Tiptap usan licencia MIT.
- tldraw para hojas de pizarra.

Persistencia:

- La hoja `text` guarda contenido estructurado JSON en `WorkspacePage.content`.
- La hoja `board` usa `persistenceKey` de tldraw por `page.id`, con persistencia local del canvas.

Documentacion operativa: `docs/hojas-texto-pizarra.md`.

## Consecuencias

- El usuario puede escoger entre crear hoja de texto o pizarra.
- El editor de texto deja de depender de un textarea simple y queda preparado para toolbar.
- La pizarra agrega capacidades de dibujo y diagramas sin construir canvas propio.
- El bundle crece por las nuevas librerias; mas adelante conviene evaluar lazy loading/code splitting.
