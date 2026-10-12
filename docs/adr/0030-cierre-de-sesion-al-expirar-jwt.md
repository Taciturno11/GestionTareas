# 0030 - Cierre de sesion al expirar el JWT

## Estado

Aceptado.

## Contexto

El frontend eliminaba el token al recibir un `401`, pero la ruta privada permanecia montada. La interfaz mostraba el nombre generico `Usuario` hasta que la persona cerraba sesion manualmente.

## Decision

- El frontend comprueba la fecha `exp` del JWT al leerlo y programa el cierre de sesion mientras la ruta privada este montada. Ambas vias redirigen al login.
- Un `401` de una peticion autenticada invalida la sesion y redirige a `/login`. El `401` del formulario de login no lo hace.
- La invalidacion solo actua si el token de la respuesta sigue siendo el almacenado, para no cerrar una sesion nueva por una respuesta tardia.
- Los errores de red y otros estados HTTP no cierran la sesion.
- El backend sigue siendo la autoridad para validar el token; leer `exp` en el navegador solo mejora la experiencia de usuario.

## Consecuencias

- Al caducar la sesion, la navegacion privada se desmonta y se vuelve al login sin intervencion manual.
- Una red temporalmente indisponible no borra el token.
