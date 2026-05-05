# 0013 - Iconos con color en espacios

## Estado

Aceptado.

## Contexto

Los espacios y subespacios necesitan mas opciones visuales para diferenciar areas de trabajo, cursos, proyectos o temas. El selector anterior tenia pocos iconos y todos se veian grises.

## Decision

Ampliar la lista cerrada de iconos basada en Heroicons y agregar color configurable por espacio/subespacio.

Reglas:

- El icono se guarda en `WorkspaceSpace.icon`.
- El color del icono se guarda en `WorkspaceSpace.iconColor`.
- Si un dato viejo no tiene color, se usa `#6472EB`.
- Crear y editar espacio/subespacio permiten escoger icono y color.
- La lista sigue siendo cerrada para mantener consistencia visual.

## Consecuencias

- El sidebar permite mayor diferenciacion visual sin introducir librerias nuevas.
- La migracion local es compatible con espacios existentes.
- Si se desea usar emojis o una libreria distinta de iconos, debe evaluarse aparte porque cambia la consistencia visual actual.
