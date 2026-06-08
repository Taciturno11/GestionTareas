# 0020 - Decision historica de verificacion por correo

## Estado

Reemplazado por ADR 0021.

## Contexto

En una etapa anterior se evaluo agregar un segundo paso por correo dentro del modulo `auth`. Esa decision venia mezclada con contexto de otro proyecto y ya no representa la direccion actual de GESTION_TAREAS.

## Decision actual

La decision queda reemplazada. GESTION_TAREAS mantiene autenticacion simple con correo, contrasena y JWT.

## Consecuencias

- La implementacion activa se documenta en ADR 0021.
- Los nombres de roles se normalizan para este proyecto personal.
- El modelo de datos elimina el flujo de verificacion por correo.
