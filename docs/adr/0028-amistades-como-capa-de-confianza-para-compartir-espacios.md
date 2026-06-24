# ADR 0028 - Amistades como capa de confianza para compartir espacios

## Estado

Aceptado - 2026-06-24

## Contexto

ADR 0027 habilito compartir espacios con usuarios existentes mediante `SpaceShare`.
Ese flujo permitia buscar usuarios de la aplicacion directamente desde el modal de compartir.

Para una experiencia mas clara y privada, el usuario necesita primero construir una lista de amigos
y luego compartir carpetas/espacios solo con personas aceptadas.

## Decision

- Se agrega una relacion de amistad entre usuarios mediante solicitudes.
- Las solicitudes se envian usando el correo exacto de un usuario existente.
- La amistad aceptada es bidireccional.
- El header muestra una campanita con solicitudes pendientes y acciones aceptar/rechazar.
- El sidebar incluye una seccion `Amigos` para enviar solicitudes, ver amigos y cancelar solicitudes enviadas.
- El modal `Compartir espacio` solo lista amigos aceptados.
- `SpaceShare` sigue siendo la fuente de permisos sobre espacios.
- Eliminar una amistad no revoca automaticamente espacios ya compartidos; el propietario debe quitarlos desde `Compartir espacio`.

## Consecuencias

- Se reduce la exposicion de usuarios porque el modal ya no funciona como directorio global.
- Compartir espacios requiere una relacion previa de confianza.
- Las reglas de permisos existentes `VIEWER` y `EDITOR` se mantienen sin cambios.
- La colaboracion en tiempo real, invitaciones por correo externo y notificaciones genericas quedan fuera de esta version.
