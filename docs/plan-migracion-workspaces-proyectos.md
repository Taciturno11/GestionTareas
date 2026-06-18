# Plan de implementacion - Workspaces personales y proyectos normalizados

Este plan implementa ADR `0024` de forma incremental y segura.

## Estado local al 18 de junio de 2026

- Entidad `Project`, relación compuesta con tareas y `personalWorkspaceId`: implementados.
- API de proyectos con archivado y restauración: implementada.
- Contratos principales del frontend separados entre `workspaceId` y `projectId`: implementados.
- Registro público: desactivado.
- Acceso administrativo mediante `Ver workspace`: implementado.
- Migración local de Martin: completada y validada con 16 espacios, 32 páginas y 13 tareas.
- Workspaces huérfanos: conservados sin cambios.
- Despliegue de producción: pendiente; requiere respaldo y ventana coordinada.

## Objetivo final

- Cada usuario nuevo tiene un workspace personal propio.
- El workspace es la frontera interna de datos y permisos.
- El usuario trabaja visualmente con proyectos, tareas y espacios.
- Proyecto es una entidad real de PostgreSQL.
- `Task.workspaceId` y `Task.projectId` no se confunden.
- La arquitectura queda preparada para colaboracion futura mediante `WorkspaceMember`.

## Principios de ejecucion

- Primero local, luego produccion.
- No borrar datos durante las primeras fases.
- Toda transformacion de datos debe ser reproducible mediante script versionado.
- Ejecutar respaldo antes de migraciones.
- Usar modo `dry-run` para inspeccionar cambios antes de escribir.
- Desplegar backend compatible antes de retirar campos antiguos del frontend.
- Mantener rollback documentado.

## Fase 0 - Congelar e inventariar el estado actual

### Tareas

1. Registrar el estado Git y separar los cambios pendientes por tema.
2. Crear backup de PostgreSQL local.
3. Crear backup de PostgreSQL de produccion.
4. Inventariar:
   - usuarios;
   - workspaces;
   - membresias;
   - tareas por workspace;
   - espacios y paginas por workspace;
   - `TaskSettings.projects`;
   - valores actuales de `Task.projectId`.
5. Detectar:
   - usuarios con cero workspaces;
   - usuarios con varios workspaces propios;
   - workspaces compartidos;
   - proyectos duplicados;
   - tareas cuyo `projectId` no existe en ajustes;
   - IDs de proyecto que coinciden con IDs de workspace.

### Entregables

- reporte JSON o Markdown del inventario;
- script de auditoria de solo lectura;
- criterio explicito para asignar workspaces historicos a usuarios.

### Condicion de salida

No avanzar si no se puede explicar a que usuario pertenece cada dataset historico.

## Fase 1 - Corregir contratos sin migrar datos

### Frontend

1. Renombrar `BoardTask.workspaceId` a `BoardTask.projectId`.
2. Ajustar mappers:
   - API `workspaceId` permanece workspace;
   - API `projectId` permanece proyecto;
   - `projectId: null` se transforma a cadena vacia solo para UI.
3. Eliminar fallback `task.projectId ?? task.workspaceId`.
4. Revisar Kanban, Lista, Calendario, Inicio y panel de detalle.
5. Hacer que los placeholders representen valores realmente vacios.

### Backend

1. Mantener temporalmente `Task.projectId` como string opcional.
2. Agregar validaciones de coherencia donde sea posible sin tabla `Project`.

### Pruebas

- crear tarea sin proyecto;
- asignar y cambiar proyecto;
- comprobar que el workspace nunca aparece como proyecto;
- verificar requests POST y PATCH;
- verificar filtros y calendario.

### Condicion de salida

El frontend distingue ambos conceptos antes de introducir la relacion nueva.

## Fase 2 - Crear entidad Project

### Prisma

Agregar modelo aproximado:

```prisma
model Project {
  id          String    @id @default(cuid())
  workspaceId String
  name        String
  color       String    @default("#6472EB")
  createdAt   DateTime  @default(now())
  updatedAt   DateTime  @updatedAt
  workspace   Workspace @relation(fields: [workspaceId], references: [id], onDelete: Cascade)
  tasks       Task[]

  @@unique([workspaceId, name])
  @@index([workspaceId])
}
```

Actualizar:

- `Workspace.projects`;
- relacion opcional `Task.project`;
- indice de `Task.projectId`.

La migracion inicial debe permitir temporalmente valores historicos. Si una clave foranea inmediata bloquea datos existentes, usar una migracion en dos pasos:

1. crear `Project` y poblarla;
2. validar referencias y agregar la relacion/constraint final.

### Backend

Crear modulo:

```text
backend/src/modules/projects/
  projects.routes.ts
  projects.controller.ts
  projects.service.ts
  projects.repository.ts
  projects.dto.ts
```

Endpoints iniciales:

```text
GET    /api/projects?workspaceId=
POST   /api/projects
PATCH  /api/projects/:id
DELETE /api/projects/:id
```

Reglas:

- toda operacion valida membresia;
- crear, editar y borrar requieren `OWNER` inicialmente;
- no se puede asignar un proyecto de otro workspace;
- borrar proyecto deja las tareas con `projectId = null` o exige confirmacion segun UX acordada.

### Condicion de salida

Backend local compila y CRUD de proyectos funciona con permisos.

## Fase 3 - Migrar proyectos JSON y tareas

### Script versionado

Crear un script como:

```text
backend/scripts/migrate-projects-from-task-settings.ts
```

Debe soportar:

- `--dry-run`;
- seleccion de base mediante `DATABASE_URL`;
- reporte de filas creadas y tareas modificadas;
- ejecucion idempotente;
- log de conflictos;
- transaccion por workspace o estrategia recuperable.

### Reglas de conversion

Por cada workspace:

1. leer `TaskSettings.projects`;
2. crear proyectos reales conservando nombre y color;
3. construir mapa `oldProjectId -> newProjectId`;
4. actualizar tareas del mismo workspace;
5. dejar `null` si no existe proyecto valido;
6. nunca enlazar una tarea a un proyecto de otro workspace.

### Datos historicos especiales

Los workspaces importados con nombres `Unitek`, `Seleria`, `Estudios` y `Personal` deben revisarse como datasets, no convertirse ni eliminarse automaticamente solo por nombre.

Si pertenecen a un mismo usuario y se decide consolidarlos:

1. elegir workspace personal destino;
2. crear proyectos equivalentes;
3. mover tareas, espacios, paginas y ajustes con mapeos explicitos;
4. validar IDs y relaciones;
5. conservar workspaces origen archivados o respaldados antes de borrarlos.

Esta consolidacion requiere aprobacion basada en el inventario de Fase 0.

### Condicion de salida

- todas las tareas tienen `projectId` valido o `null`;
- no existen referencias cruzadas entre workspaces;
- conteos antes y despues son conciliables.

## Fase 4 - Migrar frontend a /api/projects

### Datos

1. Crear `src/api/projects.api.ts`.
2. Crear `src/hooks/useProjects.ts`.
3. Usar TanStack Query con clave:

```text
['projects', workspaceId]
```

4. Actualizar cache tras crear, editar o borrar.

### UI

1. Ajustes > Proyectos consume `/api/projects`.
2. Panel de tarea consume proyectos reales.
3. Kanban, filtros, Calendario e Inicio usan `Project`.
4. Eliminar `projects` del contrato frontend de `TaskSettings`.
5. Mantener placeholders para proyecto opcional.

### Condicion de salida

Ninguna vista activa lee proyectos desde JSON.

## Fase 5 - Completar workspace personal por usuario

### Creacion de cuentas

Mantener transaccion actual:

```text
User
-> Workspace
-> WorkspaceMember OWNER
-> Space inicial
-> Page inicial
-> TaskSettings inicial
```

Agregar:

- nombre coherente del workspace personal;
- proyecto inicial solo si el producto lo necesita;
- validacion automatizada de que la transaccion no deja cuentas parciales.

### Usuarios existentes

Script de reparacion:

- usuario sin workspace: crear uno;
- usuario con un solo workspace: marcarlo como personal mediante convencion futura si se agrega campo;
- usuario con varios workspaces: no eliminar; seleccionar activo segun regla documentada;
- preservar membresias compartidas.

No es obligatorio agregar ahora `Workspace.type`. Si se necesita distinguir `PERSONAL` y `SHARED`, debe evaluarse con ADR adicional.

## Fase 6 - Administracion

### Alcance de esta migracion

Mejorar Administracion > Usuarios para mostrar:

- cuenta;
- rol global;
- workspace personal inicial;
- estado de creacion.

### Siguientes fases, no bloqueantes

- editar usuario;
- activar/desactivar;
- restablecer password;
- eliminar con politica de retencion;
- administrar miembros;
- transferir propiedad;
- auditoria.

La pantalla `Roles y permisos` no debe prometer configuracion granular hasta que el backend la soporte.

## Fase 7 - Retirar compatibilidad antigua

Solo despues de validar produccion:

1. retirar `TaskSettings.projects` del DTO;
2. retirar escritura de proyectos JSON;
3. crear migracion para eliminar columna JSON `projects` si se aprueba;
4. eliminar mappers antiguos;
5. eliminar nombres locales ambiguos;
6. actualizar importador de backups;
7. actualizar `docs/database-er.md`, README y guias.

La eliminacion fisica puede posponerse una version para facilitar rollback.

## Fase 8 - Pruebas

### Backend

- permisos por workspace;
- CRUD de proyectos;
- proyecto de otro workspace rechazado;
- tarea sin proyecto permitida;
- borrar proyecto;
- creacion transaccional de usuario y workspace.

### Frontend

- crear tarea sin proyecto;
- asignar proyecto;
- cambiar proyecto;
- filtrar Kanban;
- filtrar Calendario;
- cache entre rutas;
- usuario A no ve proyectos ni tareas de usuario B;
- placeholders correctos;
- flujos de borrador y guardado.

### Migracion

- dry-run;
- idempotencia;
- conteos;
- rollback desde backup;
- prueba sobre clon de produccion.

## Fase 9 - Despliegue de produccion

Orden recomendado:

1. ventana de mantenimiento corta para escrituras;
2. backup PostgreSQL;
3. backup de frontend y backend actuales;
4. desplegar backend compatible con schema anterior y nuevo cuando sea posible;
5. ejecutar migracion Prisma;
6. ejecutar script de proyectos en dry-run;
7. revisar reporte;
8. ejecutar migracion real;
9. validar API y conteos;
10. desplegar frontend;
11. pruebas de humo con usuario admin y usuario normal;
12. reabrir escrituras;
13. monitorear logs.

## Rollback

Debe existir antes del despliegue:

- dump PostgreSQL;
- copia del backend anterior;
- copia del frontend anterior;
- comando para restaurar servicio systemd;
- registro de migraciones ejecutadas;
- estrategia para volver a proyectos JSON durante la ventana de compatibilidad.

## Colaboracion futura

No se implementa en este plan, pero la arquitectura la permite.

Fase futura posible:

1. endpoint de miembros;
2. invitaciones;
3. selector de workspace;
4. roles y permisos;
5. actividad y notificaciones;
6. edicion colaborativa si el producto lo requiere.

Esa fase debe tener ADR propio porque cambia seguridad, UX y ciclo de vida de datos.
