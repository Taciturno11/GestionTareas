# 0015 - Diagramas BD con React Flow

## Estado

Aceptado.

## Contexto

Ademas de hojas de texto y pizarras, el producto necesita una hoja especializada para modelar bases de datos: tablas, campos y relaciones.

Aunque tldraw permite dibujar formas, no ofrece estructura especifica para nodos de entidad-relacion. Para este caso conviene usar una libreria de nodos/conexiones.

## Decision

Agregar `database` como nuevo `WorkspacePage.type`.

Usar `@xyflow/react` para renderizar y editar diagramas BD.

Reglas:

- Cada tabla es un nodo de React Flow.
- Cada relacion es un edge de React Flow.
- Los campos de tabla se editan desde un panel lateral.
- El contenido se guarda como JSON serializado en `WorkspacePage.content`.
- Las hojas `database` se crean desde los mismos menus que `Texto` y `Pizarra`.

## Consecuencias

- El usuario puede crear diagramas entidad-relacion basicos dentro del workspace.
- React Flow evita construir desde cero una herramienta de nodos y relaciones.
- El bundle crece mas; conviene priorizar lazy loading/code splitting para hojas especializadas.
