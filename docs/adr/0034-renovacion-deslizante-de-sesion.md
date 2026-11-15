# 0034 - Renovacion deslizante de la sesion

## Estado

Aceptado. 2026-11-15. Complementa ADR 0030.

## Contexto

En produccion `JWT_EXPIRES_IN` estaba en `1d` y el frontend nunca renovaba el token. La sesion caducaba 24 horas despues del login aunque el usuario usara la app a diario. Desde ADR 0030 un token vencido redirige a `/login`, por lo que el usuario tenia que volver a iniciar sesion casi cada vez que entraba.

## Decision

- El backend expone `POST /api/auth/refresh` (requiere token valido). Si el usuario sigue existiendo devuelve `{ user, token }` con un token nuevo de la misma duracion; si no existe responde `401`.
- El frontend (`src/hooks/useSessionRefresh.ts`, usado en `RequireAuth`) renueva el token cuando tiene mas de 1 hora de emitido. Comprueba al abrir la app, cada 15 minutos, al recuperar el foco y al volver a la pestana. Solo hay una renovacion en curso a la vez.
- El token renovado solo se guarda si el almacenado sigue siendo el mismo (`replaceAuthToken`), para no pisar un login nuevo.
- Un `401` en la renovacion cierra la sesion como cualquier `401` autenticado (ADR 0030). Los errores de red se ignoran y se reintenta en el siguiente chequeo.
- Produccion usa `JWT_EXPIRES_IN=30d`. La sesion solo caduca tras 30 dias sin abrir la app.

## Consecuencias

- Quien usa la app con cierta frecuencia no vuelve a ver el login.
- Un token robado sirve hasta 30 dias y puede renovarse; no hay revocacion del lado del servidor. Si se necesita, el siguiente paso seria una version de sesion por usuario o una lista de revocacion.
- Borrar un usuario impide renovar su sesion, pero un token ya emitido sigue siendo aceptado por el resto de endpoints hasta que vence.
- Los tokens emitidos antes del cambio (duracion 1 dia) se renuevan en la primera visita dentro de su vigencia; los ya vencidos requieren un ultimo login.
