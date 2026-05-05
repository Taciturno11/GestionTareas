# 0006 - Contenedor global para paginas principales

## Estado

Aprobado

## Contexto

Las paginas principales empezaron a definir su ancho util y espaciado de forma local.

Por ejemplo, `InicioPage` y `AjustesPage` usaban anchos maximos distintos y reglas de padding propias. Esto funciona en una etapa temprana, pero puede generar inconsistencias visuales a medida que crecen mas vistas.

## Decision

Se adopta un componente reutilizable `PageContainer` para definir el ancho util y espaciado base de las paginas principales.

El componente vive en:

```text
src/components/PageContainer/PageContainer.tsx
```

La regla base es:

- centrado horizontal con `mx-auto`
- ancho completo disponible con `w-full`
- ancho maximo default de `1200px`
- padding base `px-4 py-8`

El componente permite variantes controladas:

- `default`: `max-w-[1200px]`
- `wide`: `max-w-[1400px]`
- `narrow`: `max-w-[900px]`

El componente tambien permite controlar alineacion:

- `center`: centra el contenido en el area disponible.
- `start`: alinea el contenido hacia el inicio del workspace.

Las paginas de contenido general pueden usar `center`. Las vistas tipo dashboard operativo, como Inicio, pueden usar `wide` para aprovechar mas ancho horizontal sin generar un vacio lateral excesivo.

## Consecuencias

- Las paginas principales tendran una regla visual consistente.
- Cambios futuros de ancho o separacion se podran hacer en un solo lugar.
- Se reduce duplicacion de clases de layout en cada pagina.
- Si una vista necesita un ancho distinto, debera usar una variante explicita en lugar de definir reglas sueltas.
