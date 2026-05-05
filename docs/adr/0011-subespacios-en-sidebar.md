# 0011 - Subespacios en sidebar

## Estado

Aceptado.

## Contexto

El sidebar ya usa `Espacios` como organizacion principal de hojas. La siguiente necesidad es agrupar hojas dentro de un espacio, por ejemplo `Estudios -> Programacion -> React`.

Por ahora la app sigue sin backend y la persistencia vive en `localStorage`.

## Decision

Agregar subespacios dentro de `WorkspaceSpace` usando `parentId?: string`.

Reglas:

- Un espacio sin `parentId` es un espacio principal.
- Un espacio con `parentId` es subespacio de otro espacio.
- El sidebar soporta dos niveles: espacio principal -> subespacio -> hojas.
- Las hojas pueden vivir directamente en un espacio principal o dentro de un subespacio.
- Crear subespacio reutiliza el mismo dialog de crear espacio.
- Editar subespacio reutiliza el mismo dialog de editar espacio.
- Borrar un espacio borra tambien sus subespacios directos y hojas asociadas.
- Borrar un subespacio borra sus hojas.

## Consecuencias

- El modelo local queda preparado para una jerarquia simple tipo Notion sin implementar un arbol infinito.
- La UI del sidebar sigue siendo legible y predecible.
- La migracion desde datos existentes es suave porque `parentId` es opcional.
- Si mas adelante se necesitan niveles infinitos, se debe crear otro ADR porque cambiaria render, borrado, movimiento y UX.
