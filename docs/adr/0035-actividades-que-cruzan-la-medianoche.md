# 0035 - Actividades que cruzan la medianoche en el reporte de horas

## Estado

Aceptado. 2026-11-16. Complementa ADR 0029 y 0031.

## Contexto

ADR 0029 calcula `TH` como `HF - HI`. Si una actividad empezaba antes de la medianoche y terminaba despues (por ejemplo `23:46` a `00:40`), `HF` era menor que `HI` y la fila valia `0 min`, sin aviso. Se revisaron otros sistemas (Toggl Track, Personio, PeopleForce, Raken, la formula `MOD(HF-HI,1)` de Excel/Sheets): la practica comun es asumir que la actividad termino al dia siguiente.

## Decision

- Si `HF < HI`, la actividad termina al dia siguiente: `TH = HF + 24 h - HI`. `23:46` a `00:40` da `54 min`.
- Si `HF == HI`, `TH` sigue siendo `0`.
- La fila se queda en la fecha de inicio; no se divide ni se agrega fecha de fin.
- La tabla muestra la etiqueta `+1 día` junto a `HF` en esas filas, para que un error de tipeo (por ejemplo `14:00` a `13:00`, que daria 23 h) sea visible.
- En la exportacion Excel y PDF, `HF` se muestra como `00:40 (+1)`.
- No cambia el modelo de datos ni el contenido guardado; la duracion directa de ADR 0031 no cambia.

## Consecuencias

- Las filas que antes valian `0 min` por cruzar la medianoche pasan a sumar su duracion real en total, precio, Excel y PDF; el resto de filas da lo mismo que antes.
- No se pueden registrar actividades de mas de 24 h con HI/HF; para eso se usa la duracion directa (ADR 0031) o varias filas.
