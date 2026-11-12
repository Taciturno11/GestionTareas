# 0032 - Panel de figuras en la pizarra

## Estado

Aceptado. 2026-11-12. Commit `3f149e3`, desplegado en el release frontend `20261112161419`.

## Contexto

En la pizarra (tldraw, ADR 0014 y 0022) se dibujan con frecuencia los mismos elementos de diagramas de infraestructura: base de datos, servidor, internet, Linux, redes, personas, etc. Dibujarlos a mano cada vez es lento.

Ademas, tldraw muestra el panel de estilos solo con los estilos relevantes para la seleccion o herramienta: con una imagen seleccionada se reduce a la opacidad y con la mano o el borrador desaparece. Un panel colocado debajo cambiaria de posicion constantemente.

## Decision

- Se agrega el panel plegable `Figuras` debajo del panel de estilos de tldraw, en `src/components/BoardShapeLibrary/`.
- Se inyecta mediante `components.StylePanel` de tldraw (`DefaultStylePanel` + `BoardShapeLibrary`) en `src/pages/BoardPage.tsx`. No se modifica ni se parchea tldraw.
- Las figuras son SVG simples definidos en `boardFigures.ts` (viewBox `0 0 64 64`, trazo gris medio y acentos de color legibles en tema claro y oscuro).
- Se insertan con `editor.putExternalContent({ type: 'svg-text' })`, por lo que quedan como imagenes normales de tldraw (mover, redimensionar, deshacer) y se guardan dentro del mismo snapshot `tldraw-snapshot-v1`. No hay cambio de modelo de datos ni migracion.
- Arrastrar suelta la figura centrada en el punto del lienzo; clic (o teclado) la inserta en el centro de la vista. El arrastre usa eventos de puntero propios, no drag and drop HTML5, para no interferir con los handlers de archivos de tldraw.
- El panel de estilos se muestra siempre con color, relleno, trazo y tamano: se completan los estilos relevantes de tldraw con los de la siguiente forma (`getStyleForNextShape`). Si la seleccion no admite un estilo, el cambio aplica a la siguiente forma dibujada.

## Consecuencias

- Agregar una figura nueva es sumar una entrada en `BOARD_FIGURES`.
- Las figuras no cambian de color con el selector de tldraw porque son imagenes.
- Las imagenes se guardan como data URL dentro del snapshot; cada figura agrega pocos KB al contenido de la hoja.
- El panel sigue las mismas reglas de visibilidad que el panel de estilos: no aparece en modo solo lectura ni en pantallas pequenas.
- El chunk `BoardPage` cambia en cada build que toque la pizarra.
