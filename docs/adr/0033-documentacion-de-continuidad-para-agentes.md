# 0033 - Documentacion de continuidad para multiples agentes

## Estado

Aceptado. 2026-11-12.

## Contexto

El proyecto se mejora desde varias laptops y con varios agentes IA (Codex, Claude Code, opencode, etc.). Cada agente empieza sin memoria de lo que hicieron los demas. Se detectaron problemas concretos:

- una laptop estaba 7 commits por detras de `origin/main` y tenia cambios sin commitear ya publicados desde otra;
- el indice de ADR no listaba los ADR 0028 a 0031;
- `AGENTS.md` y `docs/contexto-general.md` describian un estado antiguo (mock data, sin produccion);
- no existia una linea de tiempo completa: la bitacora empieza el 2026-06-18.

## Decision

La documentacion de continuidad tiene estas piezas, cada una con un rol unico:

| Documento | Rol |
| --- | --- |
| `AGENTS.md` | Punto de entrada para cualquier agente: estado, reglas, orden de lectura y checklist de cierre. |
| `CLAUDE.md` | Solo importa `AGENTS.md` para agentes que leen `CLAUDE.md`. No duplica contenido. |
| `docs/historial-cronologico.md` | Linea de tiempo completa con fechas, una linea por cambio, desde el primer commit. |
| `docs/bitacora-cambios-gestion-tareas.md` | Detalle de cada cambio: objetivo, cambios, validaciones, despliegue y commit. |
| `docs/adr/` | Decisiones de arquitectura y de proceso, numeradas, con indice en `docs/adr/README.md`. |
| `docs/contexto-general.md` | Fotografia del estado funcional actual. |
| `docs/guia-continuidad-y-despliegue-produccion.md` | Procedimiento para sincronizar laptops y desplegar. |

Reglas:

- Al empezar: `git pull --ff-only origin main` y leer `AGENTS.md`, las ultimas entradas de la bitacora y el historial.
- Al terminar cualquier cambio: entrada en la bitacora, linea en el historial y, si hay decision tecnica, ADR nuevo agregado al indice.
- Al desplegar: registrar release, backups y commit en la bitacora y el historial.
- Commit y push al terminar para que la siguiente laptop o agente parta del mismo estado.
- No se borra historial en ningun documento; los cambios de decision se registran con entradas o ADR nuevos.

## Consecuencias

- Cualquier agente puede reconstruir el contexto leyendo cuatro archivos.
- Cerrar una tarea cuesta unos minutos mas de documentacion.
- Si un agente no actualiza el historial o la bitacora, el siguiente debe hacerlo con base en `git log` antes de empezar.
