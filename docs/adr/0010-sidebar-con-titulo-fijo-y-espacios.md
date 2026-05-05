# 0010 - Sidebar con titulo fijo y espacios como organizacion principal

## Estado

Aceptado.

## Contexto

El sidebar tenia un selector superior de workspace. Esto generaba confusion porque el usuario quiere que la parte superior sea solo titulo de producto/app, y que la organizacion real ocurra dentro de la seccion `Espacios`.

La logica visual deseada es:

- parte superior: titulo fijo.
- seccion `Espacios`: agrupacion real de hojas.

## Decision

Se elimina el selector visual superior de workspace del sidebar.

La cabecera del sidebar queda como titulo fijo:

- icono `GT`.
- texto `Gestion de Tareas`.

La seccion `Espacios` queda como organizador principal de hojas.

## Consecuencias

- Menos ruido visual en sidebar.
- `Espacios` queda como concepto central para organizar cursos, areas o carpetas internas.
- La data de workspace sigue existiendo internamente, pero no se expone como selector de UI por ahora.
- Si se necesita cambiar workspace en el futuro, se debe disenar un flujo separado sin confundirlo con `Espacios`.
