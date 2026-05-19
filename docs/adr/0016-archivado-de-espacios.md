# 0016 - Archivado de espacios

## Estado

Aceptado.

## Contexto

Los espacios pueden acumular subespacios y hojas. Borrar es destructivo, pero el usuario necesita ocultar un espacio completo sin perder su contenido.

## Decision

Agregar archivado reversible para espacios principales.

Reglas:

- Un espacio archivado guarda `archived: true` y `archivedAt`.
- Solo se archiva el espacio principal.
- Al archivar un espacio principal, se oculta todo su contenido: subespacios y hojas.
- Los subespacios y hojas no se modifican ni se borran.
- Al desarchivar, el espacio vuelve con todo su contenido.
- Los espacios archivados se muestran en `/archivo`.
- Si el usuario estaba dentro de una hoja o subespacio del espacio archivado, se navega a `/archivo`.
- El espacio `General` no muestra accion de archivar para no romper la seccion global `Hojas`.

## Consecuencias

- Archivar y borrar quedan separados: archivar es reversible, borrar es destructivo.
- La persistencia sigue en `gt_workspace_spaces`; no se crea una coleccion separada.
- La vista `/archivo` deja de ser placeholder y pasa a mostrar espacios archivados.
