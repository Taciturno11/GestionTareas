# 0007 - Reglas generales de diseno UI

## Estado

Aceptado.

## Contexto

El proyecto esta creciendo en vistas y componentes reutilizables. Algunas mejoras visuales recientes funcionaban en una variante, pero se degradaban en otras opciones de la misma seccion. Un ejemplo claro fue el flujo de `Agregar` en ajustes: al meter input, preview, colores y acciones dentro del mismo componente pequeno, algunas opciones comprimian el campo de texto y generaban mala experiencia.

Necesitamos una regla explicita para que los cambios visuales no se evaluen de forma aislada. Cada ajuste debe revisarse con el resto de componentes de su seccion y con sus variantes principales.

## Decision

Se define `docs/diseno-ui.md` como documento maestro de reglas practicas de diseno y UX para el frontend.

Las reglas principales son:

- Antes de aplicar o cerrar un cambio visual, revisar como se ve junto al resto de componentes de la misma seccion.
- Todo componente reutilizable debe probarse en sus variantes principales.
- Los inputs deben tener ancho util suficiente y no competir por espacio con botones, color pickers, iconos o previews.
- Los componentes pequenos no deben transformarse en formularios complejos si eso comprime el contenido o genera saltos de layout.
- Las acciones de hover deben ayudar a descubrir opciones sin tapar texto ni volver incomodo el componente.
- Si un flujo necesita varios controles, debe usarse un formulario, panel o zona separada.

`AGENTS.md` debe incluir un resumen operativo para que agentes IA respeten estas reglas antes de modificar UI.

## Consecuencias

- Los cambios de UI tendran una revision mas amplia antes de considerarse terminados.
- Algunas soluciones requeriran separar trigger, formulario y acciones en vez de compactarlo todo en un unico componente.
- El proyecto gana consistencia visual y reduce regresiones entre variantes de una misma seccion.
- Nuevos patrones visuales relevantes deberan documentarse o justificar su uso si se separan de estas reglas.
