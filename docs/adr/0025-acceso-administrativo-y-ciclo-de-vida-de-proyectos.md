# 0025 - Acceso administrativo y ciclo de vida de proyectos

## Estado

Aceptado.

## Contexto

El ADR 0024 definió el workspace como frontera de aislamiento y propuso que el rol global `admin` no sustituyera automáticamente una membresía. Después se decidió que la operación real necesita soporte administrativo global, sin suplantar la identidad de los usuarios.

También se decidió que los proyectos normalizados deben conservar el historial de sus tareas cuando dejan de utilizarse.

## Decisión

- El rol global `admin` puede consultar y operar recursos de cualquier workspace.
- La interfaz ofrece el acceso mediante `Administración > Usuarios > Ver workspace`.
- La aplicación muestra un aviso persistente mientras el administrador revisa datos ajenos.
- El administrador conserva su identidad real; no se implementa suplantación de usuario.
- Los usuarios normales continúan requiriendo una membresía válida.
- Los proyectos se archivan y restauran; no se eliminan físicamente desde la interfaz.
- Un proyecto archivado no aparece en selectores para tareas nuevas, pero su nombre y color siguen disponibles para tareas históricas.
- Solo `OWNER` y el administrador global pueden crear, editar, archivar o restaurar proyectos.
- El registro público queda desactivado. Las cuentas se crean desde Administración y reciben un workspace personal transaccionalmente.

## Consecuencias

- El acceso de soporte es sencillo y explícito.
- El backend debe aplicar el bypass administrativo de manera centralizada y no desde el frontend.
- Una cuenta comprometida con rol `admin` tiene impacto global, por lo que las acciones administrativas deberán incorporarse a una auditoría persistente en una fase posterior.
- El historial de tareas no se pierde al retirar un proyecto.

## Relación con decisiones anteriores

- Complementa ADR 0024.
- Reemplaza únicamente la regla de ADR 0024 que impedía al administrador atravesar la membresía del workspace.
- Mantiene separados el rol global y el rol interno del workspace.
