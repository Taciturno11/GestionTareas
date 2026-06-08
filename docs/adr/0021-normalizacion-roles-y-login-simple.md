# 0021 - Normalizacion de roles y login simple

## Estado

Aceptado.

## Contexto

GESTION_TAREAS es un proyecto personal de productividad. En fases previas quedaron nombres de rol y un flujo de verificacion por correo que venian de otro contexto y no pertenecen a este producto.

## Decision

- El rol administrador global es `admin`.
- El rol normal global es `usuario`.
- El login se mantiene con correo, contrasena y JWT.
- No se usa verificacion por correo en esta etapa.
- Los permisos por workspace siguen usando `WorkspaceMember.role` con `OWNER` y `MEMBER`.

## Consecuencias

- `User.role` usa valores limpios y propios del proyecto.
- El importador local crea el usuario principal con rol `admin`.
- La gestion real de usuarios se construira despues sobre estos valores.
