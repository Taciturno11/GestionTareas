# 0024 - Multitenancy por workspace personal y proyectos como entidad

## Estado

Aceptado.

## Contexto

GESTION_TAREAS ya permite crear varias cuentas y aislar datos mediante `Workspace` y `WorkspaceMember`.

El backend actual distingue dos niveles de autorizacion:

- `User.role` define el rol global de la cuenta: `admin` o `usuario`.
- `WorkspaceMember.role` define el permiso dentro de un workspace: `OWNER` o `MEMBER`.

Al crear un usuario desde Administracion, el sistema ya genera:

- una cuenta;
- un workspace propio;
- una membresia `OWNER`;
- un espacio inicial;
- una pagina de bienvenida;
- ajustes iniciales de tareas.

Sin embargo, los datos importados originalmente contienen varios workspaces llamados `Unitek`, `Seleria`, `Estudios` y `Personal`. Los mismos nombres tambien aparecen como proyectos configurables dentro de `TaskSettings.projects`.

Esta duplicacion provoca confusion:

- `Task.workspaceId` representa el contenedor real de seguridad y datos;
- `Task.projectId` representa la clasificacion visible de una tarea;
- el frontend antiguo reutiliza localmente el nombre `workspaceId` para guardar un proyecto;
- cuando una tarea no tiene proyecto, algunas transformaciones muestran por error el nombre del workspace como si fuera un proyecto.

Tambien se quiere preservar la posibilidad futura de que usuarios colaboren entre ellos, sin implementar aun invitaciones ni gestion de miembros.

## Decision

### 1. Modelo de tenancy

La aplicacion adopta un modelo multitenant con base de datos compartida y aislamiento logico por workspace.

Cada workspace funciona como frontera de datos y autorizacion. Todas las consultas y escrituras de recursos privados deben validar membresia en el workspace correspondiente.

Los recursos aislados por workspace incluyen:

- proyectos;
- tareas;
- ajustes de tareas;
- espacios y subespacios;
- paginas;
- hojas de texto;
- pizarras;
- diagramas.

No se crea una base de datos ni un schema PostgreSQL separado por usuario.

### 2. Workspace personal inicial

Cada usuario nuevo recibe automaticamente un workspace personal e independiente.

Reglas iniciales:

- el usuario creador queda como `OWNER`;
- el workspace se crea durante la misma transaccion que la cuenta;
- se crean los datos iniciales necesarios para que la aplicacion sea util desde el primer acceso;
- el workspace personal es el workspace activo por defecto;
- en la primera fase, el usuario normal no necesita seleccionar ni administrar workspaces desde la interfaz;
- la palabra `workspace` puede permanecer oculta en la experiencia comun y utilizarse como concepto tecnico interno.

El modelo no impone una restriccion permanente de un solo workspace por usuario. La relacion muchos-a-muchos mediante `WorkspaceMember` se conserva.

### 3. Colaboracion futura

La colaboracion queda prevista, pero fuera del alcance de esta fase.

Cuando se implemente:

- un workspace podra tener varios miembros;
- el propietario podra invitar o retirar miembros;
- los miembros compartiran los recursos del workspace segun permisos;
- `WorkspaceMember.role` seguira siendo la base de autorizacion interna;
- se podran ampliar los roles o permisos mediante otro ADR si `OWNER` y `MEMBER` dejan de ser suficientes.

No se implementan ahora:

- invitaciones;
- solicitudes para unirse;
- selector de workspace compartido;
- permisos granulares por proyecto, espacio o pagina;
- propiedad individual de recursos dentro de un workspace compartido;
- actividad colaborativa en tiempo real.

### 4. Roles globales y roles del workspace

Se mantienen separados:

```text
Rol global de aplicacion
├── admin
└── usuario

Rol dentro de workspace
├── OWNER
└── MEMBER
```

El rol global `admin` permite administrar cuentas y operaciones globales autorizadas. No debe sustituir automaticamente la membresia del workspace al consultar datos privados.

Un usuario con rol global `usuario` puede ser `OWNER` de su workspace personal y, en el futuro, `MEMBER` de otros workspaces.

### 5. Proyectos

`Proyecto` es una clasificacion visible de tareas dentro de un workspace. No es un workspace y no organiza hojas o pizarras.

Se decide normalizar proyectos como entidad persistente:

```text
Project
├── id
├── workspaceId
├── name
├── color
├── createdAt
└── updatedAt
```

Reglas:

- un proyecto pertenece siempre a un workspace;
- `Task.projectId` es opcional;
- una tarea sin proyecto sigue perteneciendo a su workspace;
- la integridad debe impedir asignar a una tarea un proyecto de otro workspace;
- los nombres de proyecto pueden repetirse entre workspaces;
- los proyectos dejan de vivir definitivamente dentro de `TaskSettings.projects`;
- `TaskSettings` conserva responsables, etiquetas, prioridades y estados mientras no exista otra decision.

La UI solo presenta el selector `Proyecto`. El `workspaceId` se resuelve desde la sesion y el workspace activo, no desde el formulario de tarea.

### 6. Nombres y contratos del frontend

El frontend deja de usar `BoardTask.workspaceId` como alias de proyecto.

Los contratos deben separar:

```text
workspaceId -> tenant y frontera de datos
projectId   -> clasificacion opcional de la tarea
```

Las transformaciones API no deben usar `task.workspaceId` como valor alternativo cuando `task.projectId` sea `null`.

Una tarea sin proyecto debe mostrar un estado vacio como `Seleccionar proyecto`.

### 7. Administracion de usuarios

La vista Administracion > Usuarios se mantiene como administracion global de cuentas.

Capacidades actuales aceptadas:

- listar usuarios;
- crear usuarios;
- asignar rol global `admin` o `usuario`;
- crear automaticamente el workspace personal inicial.

Capacidades pendientes para fases posteriores:

- editar datos de la cuenta;
- activar o desactivar usuarios;
- restablecer contrasenas;
- eliminar cuentas con politica explicita de datos;
- ver el workspace personal asociado;
- administrar membresias;
- cambiar propietarios;
- auditoria de acciones administrativas.

La vista `Roles y permisos` sigue siendo informativa hasta definir permisos reales.

### 8. Migracion de datos existentes

La migracion no debe asumir que los workspaces historicos `Unitek`, `Seleria`, `Estudios` y `Personal` son proyectos o workspaces personales correctos.

Antes de modificar datos se debe generar un inventario por usuario y workspace:

- membresias;
- tareas;
- espacios;
- paginas;
- ajustes;
- proyectos JSON;
- referencias y contenidos.

La conversion de datos historicos debe ejecutarse con script versionado, respaldo, modo de simulacion y validacion posterior.

No se eliminara ningun workspace historico hasta confirmar que sus recursos fueron asignados al workspace personal correcto y que los proyectos normalizados conservan las relaciones esperadas.

## Consecuencias

### Positivas

- Cada usuario tiene datos privados e independientes por defecto.
- El modelo queda preparado para colaboracion futura sin redisenar las relaciones principales.
- Workspace y proyecto dejan de competir como conceptos visibles.
- Los permisos tienen una frontera clara.
- Los proyectos pueden validarse, consultar y relacionarse con integridad referencial.
- Kanban, Calendario y Ajustes usan un contrato de datos coherente.

### Costes y riesgos

- Se requiere una migracion Prisma para crear `Project`.
- Se necesita migrar proyectos JSON y tareas existentes.
- El frontend debe renombrar contratos locales y eliminar compatibilidad ambigua.
- Las rutas de proyectos requieren un nuevo modulo backend.
- La produccion necesita respaldo y despliegue coordinado de backend, migracion y frontend.
- La administracion de miembros sigue pendiente y no debe simularse solo con UI.

## Decisiones reemplazadas o complementadas

- Complementa `0017`, manteniendo el backend monolitico MVC modular.
- Complementa `0021`, aclarando la separacion entre roles globales y roles de workspace.
- Reemplaza parcialmente `0019`: se conserva `Task.projectId`, pero deja de apuntar a datos JSON de `TaskSettings.projects` y pasa a relacionarse con la entidad `Project`.
- Mantiene la decision de `0010`: el selector de workspace no aparece en la interfaz comun durante la fase de workspace personal.

## Criterios de aceptacion arquitectonica

La implementacion se considera completa cuando:

- cada usuario nuevo recibe exactamente un workspace personal inicial;
- los recursos privados se consultan solo con membresia valida;
- existe una tabla `Project` relacionada con `Workspace`;
- `Task.projectId` referencia un proyecto del mismo workspace o es `null`;
- `TaskSettings.projects` deja de ser fuente activa;
- el frontend distingue `workspaceId` y `projectId`;
- una tarea sin proyecto no muestra el nombre del workspace;
- los datos historicos quedan migrados y validados;
- Administracion sigue creando cuentas y workspaces de forma transaccional;
- la colaboracion futura sigue siendo posible mediante `WorkspaceMember`, aunque no este expuesta en UI.
