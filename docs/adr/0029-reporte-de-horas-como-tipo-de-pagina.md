# 0029 - Reporte de horas como tipo de pagina

## Estado

Aceptado.

## Contexto

La aplicacion ya maneja contenido dentro de espacios mediante paginas tipadas:

- texto enriquecido;
- pizarra;
- diagrama BD;
- hoja de tareas.

El usuario necesita crear un nuevo elemento llamado `Reporte de horas` desde los mismos lugares donde crea hojas, pizarras y diagramas. El reporte debe poder abrirse, editarse y continuar luego sin crear un modulo independiente ni duplicar persistencia.

## Decision

Se agrega `Reporte de horas` como un nuevo tipo de pagina:

- frontend: `time-report`;
- backend/Prisma: `TIME_REPORT`;
- almacenamiento: `Page.content` como JSON serializado;
- render: `PageView` selecciona `TimeReportPage` cuando `page.type === 'time-report'`;
- guardado: se reutiliza `usePageSaveQueue` y `PATCH /api/pages/:id`;
- permisos: se reutiliza el acceso de paginas existente:
  - `VIEWER` puede abrir en solo lectura;
  - `EDITOR` y propietario pueden editar.

El contenido del reporte mantiene los datos editables del encabezado y filas:

```json
{
  "client": "",
  "service": "",
  "period": "",
  "hourlyRate": "",
  "rows": [
    {
      "id": "",
      "activity": "",
      "date": "",
      "startTime": "",
      "endTime": "",
      "observations": ""
    }
  ]
}
```

Los campos calculados no se persisten como fuente de verdad:

- `TH` se calcula en frontend como `HF - HI`;
- `Total de horas` suma los `TH`;
- `Precio estimado` calcula `Total de horas * Precio por hora`.

## Consecuencias

- No se crea una tabla nueva en PostgreSQL para reportes.
- No se duplica el mecanismo de autosave de paginas.
- El reporte funciona en espacios propios y compartidos con permisos heredados.
- El tipo nuevo requiere migracion Prisma/PostgreSQL para agregar `TIME_REPORT` al enum `PageType`.
- Si en el futuro se requiere facturacion formal, exportacion o auditoria contable, podria agregarse una entidad propia sin romper los reportes existentes.
