# 0027 - Espacios compartidos con permisos heredados

## Estado

Aceptado.

## Contexto

La colaboracion estaba prevista mediante `WorkspaceMember`, pero compartir un
workspace completo expone todos los espacios, hojas, proyectos, tareas y ajustes.
Para la primera version colaborativa se requiere compartir una carpeta/espacio
concreto sin abrir todo el workspace.

## Decision

Se agrega colaboracion por `Space`.

- `SpaceShare` relaciona un `Space` con un usuario existente.
- Roles: `VIEWER` y `EDITOR`.
- El permiso se hereda al espacio compartido, sus subespacios y sus hojas.
- Solo el `OWNER` del workspace o el admin global gestionan compartidos.
- `VIEWER` puede abrir hojas, pizarras y diagramas sin autoguardado.
- `EDITOR` puede crear, editar, archivar y borrar dentro del arbol compartido.
- Los usuarios invitados no se convierten en `WorkspaceMember`.
- Kanban, Calendario, proyectos, tareas y ajustes quedan fuera de esta version.

## Consecuencias

- La frontera principal del workspace se conserva.
- Se habilita colaboracion puntual por carpeta sin exponer todo el tenant.
- Las APIs de paginas y espacios deben resolver acceso por membresia o por share.
- El frontend distingue entre espacios propios y `Compartidos conmigo`.
- No hay colaboracion en tiempo real; se mantiene el autoguardado actual para editores.

