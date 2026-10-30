# 0031 - Duracion directa en reportes de horas

## Estado

Aceptado.

## Contexto

El reporte original calcula TH a partir de HI y HF. Los partes de octubre de IDM registran duraciones por actividad, pero no horarios de inicio o fin. Inventar horarios para completar el reporte seria incorrecto; dejar HI/HF vacios hacia que el total apareciera en cero.

## Decision

- `Page.content.rows[]` admite el campo opcional `durationMinutes`, entero no negativo.
- Si HI y HF son horas validas, TH se calcula con el rango horario como hasta ahora.
- Si falta alguna de esas horas, TH usa `durationMinutes` cuando existe.
- La vista permite editar la duracion en horas cuando no hay un rango horario completo.
- El total y las exportaciones Excel/PDF usan el mismo calculo de TH. HI y HF permanecen vacios si la fuente no los proporciona.

## Consecuencias

- Los reportes anteriores permanecen compatibles.
- Los reportes basados en duraciones muestran totales correctos sin atribuir horarios inexistentes.
- No se requiere migracion de PostgreSQL: `Page.content` ya almacena JSON serializado.
