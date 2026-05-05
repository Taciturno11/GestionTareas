# 0012 - Vista propia para subespacios

## Estado

Aceptado.

## Contexto

Los subespacios dejaron de ser solo contenedores colapsables en el sidebar. El usuario necesita abrir un subespacio y ver contenido propio, como descripcion, junto con enlaces a sus hojas internas.

## Decision

Agregar una ruta propia para subespacios: `/s/:spaceId`.

Reglas:

- Solo los subespacios navegan a una vista propia.
- Los espacios principales siguen funcionando como agrupadores del sidebar.
- El chevron del subespacio expande o contrae sus hojas en el sidebar.
- El nombre/icono del subespacio navega a `/s/:spaceId`.
- La vista del subespacio permite editar nombre y descripcion.
- La parte inferior de la vista muestra enlaces a hojas creadas dentro de ese subespacio.
- La descripcion se guarda en `WorkspaceSpace.description` dentro de `localStorage`.

## Consecuencias

- La jerarquia queda mas cercana a Notion: un subespacio puede tener contexto propio y hojas relacionadas.
- `WorkspaceSpace` ahora tambien puede guardar contenido descriptivo ligero.
- Si mas adelante los espacios principales tambien necesitan vista propia, debe definirse con otra decision para no mezclar su rol de agrupador actual.
