# 0005 - Uso de mock data local mientras se define el backend

## Estado

Aprobado

## Contexto

El backend todavia no esta definido por completo y el proyecto se esta desarrollando primero desde el frontend.

Sin una fuente de datos temporal, seria dificil avanzar en vistas, estados y componentes interactivos.

## Decision

Mientras no exista una API estable, el frontend trabajara con mock data local.

La mock data se ubicara en `src/data/` y sus formas se apoyaran en tipos definidos en `src/types/`.

El objetivo de esta decision es permitir:

- construir pantallas reales
- validar estructuras de datos
- probar estados visuales e interacciones
- preparar una futura integracion con backend

## Consecuencias

- El frontend puede avanzar sin esperar al backend.
- Algunos contratos de datos podran cambiar cuando exista la API real.
- La logica de acceso a datos debera desacoplarse luego para reemplazar la mock data por servicios reales.
- Esta decision es temporal y debe revisarse cuando se defina la arquitectura backend.
