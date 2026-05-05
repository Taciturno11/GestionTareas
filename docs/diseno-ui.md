# Reglas generales de diseno UI

Este documento define reglas practicas para mantener una experiencia visual consistente en todo el frontend.

## Principios

- La experiencia de usuario tiene prioridad sobre completar una pieza visual de forma aislada.
- Antes de aplicar un cambio visual, revisar como se ve con el resto de componentes de la misma seccion.
- Todo componente reutilizable debe revisarse en sus variantes principales antes de darlo por terminado.
- Un cambio no debe mejorar una opcion y empeorar otra dentro del mismo grupo visual.
- Los elementos interactivos deben mantener tamanos estables para evitar saltos de layout.

## Formularios e inputs

- Un input debe tener ancho util suficiente para escribir con comodidad.
- Los inputs no deben competir por espacio con selectores de color, botones, iconos o previews.
- Si una accion necesita input, preview, colores y botones, usar un formulario separado en vez de meter todo dentro de una card pequena.
- Un boton pequeno de `Agregar` no debe transformarse en un formulario complejo si eso comprime el contenido.
- Las acciones de guardar/cancelar deben estar visibles, pero no deben dominar visualmente el formulario.

## Cards, pills y elementos compactos

- Las cards pequenas, pills, etiquetas, estados y prioridades deben conservar su forma principal.
- Las acciones como editar o eliminar pueden aparecer en hover, pero no deben tapar el texto ni volver incomodo el click.
- Si el elemento es demasiado pequeno para alojar acciones, usar acciones externas, barra contextual o formulario separado.
- El hover debe ayudar a descubrir acciones sin cambiar drasticamente el tamano del componente.

## Selectores y color pickers

- Los selectores deben abrirse con posicion clara, sin superponerse de forma confusa con el input o el trigger.
- Los dropdowns deben usar el ancho necesario para su contenido; evitar width grande si la lista es corta o los labels son breves.
- Los color pickers deben vivir en una fila o zona separada cuando hay tambien un input principal.
- No comprimir una lista de colores dentro del mismo espacio horizontal del input si reduce su legibilidad.
- El color seleccionado debe tener un indicador visible, pero discreto.

## Layout

- Usar los contenedores globales definidos para paginas principales salvo que una vista necesite comportamiento especial.
- La separacion entre sidebar, contenido y paneles debe sentirse consistente con el resto de la aplicacion.
- Evitar grandes vacios visuales cuando el contenido necesita lectura o edicion concentrada.
- Si una seccion usa columnas, validar que la cantidad de columnas no degrade elementos pequenos.

## Revision antes de cerrar un cambio visual

Antes de terminar una tarea de UI, revisar:

- La opcion modificada.
- Las otras opciones de la misma seccion.
- Estados vacio, hover, edicion, creacion y eliminacion si aplican.
- Desktop y anchos reducidos cuando el layout pueda romperse.
- Que inputs, botones, colores y acciones no se pisen ni compitan por el mismo espacio.

Si el componente se ve bien solo en una variante, el cambio no esta terminado.
