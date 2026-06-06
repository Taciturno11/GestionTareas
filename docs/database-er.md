# Modelo entidad-relacion

Documento visual del modelo de base de datos definido en `backend/prisma/schema.prisma`.

## Diagrama ER

```mermaid
erDiagram
  USER {
    string id PK
    string email UK
    string name
    string role
    string passwordHash
    boolean twoFactorEnabled
    string twoFactorMethod
    datetime createdAt
    datetime updatedAt
  }

  LOGIN_OTP_CHALLENGE {
    string id PK
    string userId FK
    string email
    string codeHash
    datetime expiresAt
    datetime consumedAt
    int attemptsCount
    int resendCount
    datetime lastSentAt
    string ipAddress
    string userAgent
    datetime createdAt
    datetime updatedAt
  }

  WORKSPACE {
    string id PK
    string name
    string color
    datetime createdAt
    datetime updatedAt
  }

  WORKSPACE_MEMBER {
    string id PK
    enum role
    string userId FK
    string workspaceId FK
    datetime createdAt
  }

  SPACE {
    string id PK
    string workspaceId FK
    string parentId FK
    string name
    string icon
    string iconColor
    string description
    boolean archived
    datetime archivedAt
    boolean collapsed
    datetime createdAt
    datetime updatedAt
  }

  PAGE {
    string id PK
    string workspaceId FK
    string spaceId FK
    enum type
    string title
    string content
    datetime createdAt
    datetime updatedAt
  }

  TASK {
    string id PK
    string workspaceId FK
    string pageId FK
    string title
    string description
    string status
    string priority
    string projectId
    string tag
    string assigneeId FK
    datetime startDate
    datetime endDate
    string color
    string notes
    string createdById FK
    datetime createdAt
    datetime updatedAt
  }

  TASK_SETTINGS {
    string id PK
    string workspaceId FK_UK
    json projects
    json assignees
    json labels
    json priorities
    json statuses
    datetime createdAt
    datetime updatedAt
  }

  USER ||--o{ WORKSPACE_MEMBER : belongs_to
  WORKSPACE ||--o{ WORKSPACE_MEMBER : has_members
  USER ||--o{ LOGIN_OTP_CHALLENGE : receives

  WORKSPACE ||--o{ SPACE : has_spaces
  SPACE ||--o{ SPACE : has_subspaces
  SPACE ||--o{ PAGE : contains_pages

  WORKSPACE ||--o{ PAGE : has_pages
  WORKSPACE ||--o{ TASK : has_tasks
  WORKSPACE ||--o| TASK_SETTINGS : has_settings

  PAGE ||--o{ TASK : groups_tasks

  USER ||--o{ TASK : creates
  USER ||--o{ TASK : assigned_to
```

## Resumen de entidades

### `User`

Usuario de la aplicacion.

Guarda:

- email unico.
- nombre.
- rol.
- hash de password.
- flag opcional de 2FA.
- metodo de 2FA cuando aplica.

No guarda password en texto plano.

### `LoginOtpChallenge`

Desafio temporal para login con verificacion por correo.

Guarda:

- email y usuario asociados.
- hash del codigo OTP.
- expiracion.
- cantidad de intentos.
- cantidad de reenvios.
- datos basicos de contexto como IP y user agent.

No guarda el OTP en texto plano.

### `Workspace`

Contenedor principal de trabajo.

Un workspace agrupa:

- miembros.
- espacios.
- hojas.
- tareas.
- ajustes de tareas.

### `WorkspaceMember`

Tabla intermedia entre `User` y `Workspace`.

Permite relacion muchos-a-muchos:

```text
User N:M Workspace
```

Roles actuales:

- `OWNER`
- `MEMBER`

Restriccion:

```text
userId + workspaceId unico
```

Un usuario no puede estar duplicado dentro del mismo workspace.

### `Space`

Representa espacios/carpetas/subespacios.

Soporta jerarquia simple con:

```text
parentId
```

Un espacio sin `parentId` es espacio principal.

Un espacio con `parentId` es subespacio.

Tambien guarda:

- icono.
- color del icono.
- descripcion.
- estado archivado.
- estado colapsado.

### `Page`

Hoja dentro de un espacio.

Tipos:

- `BLANK`
- `TEXT`
- `BOARD`
- `DATABASE`
- `TASKS`

`content` guarda contenido serializado cuando aplica:

- texto enriquecido Tiptap.
- diagrama BD React Flow.

Pizarras tldraw pueden requerir almacenamiento propio o snapshot futuro.

### `Task`

Tarea principal del sistema.

Pertenece siempre a:

- `Workspace`
- `User` creador

Puede pertenecer opcionalmente a:

- `Page`
- `User` asignado

Campos funcionales:

- titulo.
- descripcion.
- estado.
- prioridad.
- proyecto configurable (`projectId`) tomado de `TaskSettings.projects`.
- etiqueta.
- fechas.
- color.
- notas.

### `TaskSettings`

Ajustes configurables por workspace.

Guarda como JSON:

- proyectos.
- responsables.
- etiquetas.
- prioridades.
- estados.

Hay una configuracion por workspace:

```text
workspaceId unique
```

## Reglas de borrado

Definidas en Prisma:

- borrar `Workspace` borra `WorkspaceMember`, `Space`, `Page`, `Task` y `TaskSettings` asociados.
- borrar `Space` borra subespacios y paginas asociadas.
- borrar `Page` deja tareas con `pageId = null`.
- borrar usuario creador de tarea esta restringido.
- borrar usuario asignado deja tareas con `assigneeId = null`.

## Indices importantes

```text
WorkspaceMember.workspaceId
Space.workspaceId
Space.parentId
Page.workspaceId
Page.spaceId
Task.workspaceId
Task.pageId
Task.assigneeId
```

Estos indices preparan consultas frecuentes:

- listar datos por workspace.
- listar subespacios.
- listar paginas por espacio.
- listar tareas por workspace o pagina.
- listar tareas asignadas a usuario.

## Pendientes de modelo

- decidir si `Task.assigneeId` debe apuntar a `User` o a responsables configurables de `TaskSettings`.
- definir migracion de pizarras tldraw hacia backend si se quieren sincronizar entre usuarios.
- evaluar si `TaskSettings.projects` debe seguir como JSON o normalizarse en tablas si crece mucho.
- agregar auditoria o historial si se requiere trazabilidad de cambios.
