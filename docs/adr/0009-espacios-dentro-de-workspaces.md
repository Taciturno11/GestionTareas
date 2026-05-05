# 0009 - Espacios dentro de workspaces

## Estado

Aceptado.

## Contexto

El sidebar ya soporta workspaces y hojas locales. Para casos como estudios, cursos o areas internas, una lista plana de hojas no escala bien.

Se necesita un nivel intermedio dentro del workspace para agrupar hojas sin tocar el selector superior de workspace.

## Decision

Se agrega el concepto `WorkspaceSpace`.

Modelo:

- `Workspace`: contenedor superior, visible en selector superior.
- `WorkspaceSpace`: grupo interno dentro del workspace.
- `WorkspacePage`: hoja dentro de un espacio.

El sidebar mantiene el selector superior intacto y agrega:

- seccion `Espacios`.
- boton `+` para crear espacio.
- espacios expandibles/colapsables.
- acciones directas para editar y borrar espacios.
- hojas dentro de cada espacio.
- accion `+ Nueva hoja` dentro de cada espacio.
- accion `Nueva hoja general` que usa el espacio `General`.

Persistencia nueva:

- `gt_workspace_spaces`

Las hojas existentes sin `spaceId` se migran en lectura hacia el espacio `General` del workspace.

## Consecuencias

- El sidebar queda preparado para organizar cursos, areas o subespacios sin crear arbol profundo.
- Se mantiene un maximo practico de tres niveles: workspace, espacio, hoja.
- Borrar un espacio borra sus hojas actuales.
- Borrar un espacio requiere confirmacion.
- A futuro se puede agregar mover hojas y crear workspaces desde UI.
