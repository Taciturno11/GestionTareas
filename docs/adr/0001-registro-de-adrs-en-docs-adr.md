# 0001 - Registro de ADRs en docs/adr

## Estado

Aprobado

## Contexto

El proyecto esta empezando y todavia se estan definiendo decisiones importantes sobre frontend, backend, estructura y flujo de trabajo.

Si estas decisiones solo quedan en conversaciones, se pierde contexto rapido y se vuelve dificil entender por que se eligio una ruta tecnica.

## Decision

Se adopta el uso de ADRs para registrar decisiones tecnicas relevantes del proyecto.

Los ADRs se guardaran en `docs/adr/` en la raiz del repositorio.

Cada ADR usara numeracion incremental y una estructura minima con estas secciones:

- `Estado`
- `Contexto`
- `Decision`
- `Consecuencias`

## Consecuencias

- El proyecto tendra un historial claro de decisiones tecnicas.
- Sera mas facil revisar cambios de direccion sin depender de memoria o chat previo.
- Las decisiones arquitectonicas se separan del codigo fuente y se mantienen en documentacion.
- Si una decision cambia, se debera crear un nuevo ADR en lugar de editar el sentido historico del anterior.
