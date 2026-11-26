# Historial cronologico de GESTION_TAREAS

Linea de tiempo completa del proyecto, con fechas, desde el primer commit. Sirve para que cualquier agente o persona entienda rapidamente **que se hizo, cuando y donde esta documentado**.

- Detalle de cada cambio (objetivo, validaciones, despliegue): [bitacora-cambios-gestion-tareas.md](./bitacora-cambios-gestion-tareas.md). La bitacora empieza el 2026-06-18; lo anterior solo existe en git y en este documento.
- Decisiones de arquitectura: [adr/README.md](./adr/README.md).
- Fuente de las fechas: `git log --date=short` y la bitacora. Las fechas son las del commit o de la entrada de bitacora.

## Como mantener este documento

- Agregar una linea por cada cambio relevante terminado (feature, fix, despliegue, cambio de datos en produccion o de documentacion estructural), **arriba de todo en su mes**, en orden cronologico inverso.
- Formato: `- AAAA-MM-DD - descripcion breve (commit `abc1234`, ADR 00XX, release `AAAAMMDDHHMMSS`)`. Omitir lo que no aplique.
- No borrar lineas. Si algo se revierte, agregar una linea nueva que lo diga.
- El detalle va en la bitacora; aqui solo el resumen de una linea.

## Estado actual (2026-11-25)

- Produccion: `https://agenda.martinnauca.com` (frontend estatico en Nginx + backend Express/Prisma/PostgreSQL). Ultimo release: `20261125215551` (solo frontend).
- Codigo: rama `main` de `https://github.com/Taciturno11/GestionTareas` (repositorio publico).
- ADR mas reciente: `0035`.

## 2026-11

- 2026-11-25 - Reporte de horas: boton `+` para insertar una fila debajo de cualquier fila (commit `963da6d`, release `20261125215551`).
- 2026-11-16 - Reporte de horas: actividades que cruzan la medianoche cuentan su duracion real y muestran `+1 día` (commit `2bb64a9`, ADR 0035, release `20261116130626`).
- 2026-11-16 - Reporte de horas: boton `Agregar fila` tambien al final de la tabla (commit `5719682`, release `20261116122415`).
- 2026-11-15 - Sesion con renovacion deslizante: `POST /api/auth/refresh`, hook `useSessionRefresh` y `JWT_EXPIRES_IN=30d` en produccion; antes caducaba a las 24 h (commit `e11ad51`, ADR 0034, release `20261115132827`).
- 2026-11-12 - Documentacion de continuidad para agentes: historial cronologico, ADR 0032 y 0033, `AGENTS.md`, `CLAUDE.md`, README e indice de ADR actualizados.
- 2026-11-12 - Despliegue frontend del panel de figuras (release `20261112161419`, commit `b1db91c`).
- 2026-11-12 - Pizarra: panel `Figuras` con 18 SVG arrastrables bajo el panel de estilos de tldraw, y panel de estilos siempre visible (commit `3f149e3`, ADR 0032).
- 2026-11-12 - Guia reutilizable de transicion circular de tema publicada en el repo (commit `133c594`; redactada el 2026-10-31).

## 2026-10

- 2026-10-31 - Guia `docs/guia-transicion-circular-tema.md` redactada (commit posterior `133c594`).
- 2026-10-30 - Reportes de horas IDM de octubre cargados en produccion (dos quincenas, horarios referenciales y limpieza de observaciones; cambios de datos con backup puntual).
- 2026-10-30 - Reporte de horas admite duracion directa `durationMinutes` cuando no hay HI/HF (commit `0f9a23d`, ADR 0031).
- 2026-10-11 - Cierre de sesion y redireccion a `/login` al expirar el JWT o recibir `401` (commit `218b0bb`, ADR 0030, release `20261011235331`).

## 2026-09

- 2026-09-30 - Reporte `DT-SEPTIEMBRE` actualizado en produccion (24 actividades, 45 h). Solo datos.

## 2026-08

- 2026-08-30 - Reporte `horas-Martin` de agosto actualizado en produccion (29 actividades, 45 h). Solo datos.
- 2026-08-01 - Reporte de horas de julio actualizado en produccion (20 actividades, 30 h). Solo datos.

## 2026-07

- 2026-07-09 - Transicion de tema con mascara SVG difuminada y centrada; despliegues `20260709022517` y `20260709023913` (commits `32ed189`, `6ef8d6a`).
- 2026-07-09 - Patron seguro PowerShell -> SSH -> Bash documentado en la guia de despliegue (commit `0d29eb1`).
- 2026-07-09 - Tema oscuro refinado, fondo de particulas (particles.js), sidebar/header translucidos y toggle rapido de tema; desplegado (commit `ba03bb0`).
- 2026-07-05 - Tema claro/oscuro/sistema y auditoria de paleta (`docs/THEME-IMPLEMENTATION.md`, `docs/COLOR-PALETTE-AUDIT.md`).

## 2026-06

- 2026-06-30 - Renombrar elementos del sidebar con F2, toolbar de texto como segundo header, filtros y contador de tareas archivadas; desplegado (commits `5a62336`, `84623ab`, `2cfd5bc`).
- 2026-06-29 - Archivado manual de tareas completadas y vista propia de tareas archivadas (commits `feb06ee`, `8f5de79`).
- 2026-06-27 - Reporte de horas: exportacion Excel, PDF descargable con resumen final y precio por hora, varias correcciones de formato PDF (commits `93c3da0` a `f866d08`).
- 2026-06-25 - Reporte de horas como nuevo tipo de pagina, con TimePicker y textareas autoajustables; desplegado (commit `618a515`, ADR 0029).
- 2026-06-24 - Espacios compartidos con permisos heredados, amigos y solicitudes, avatar de usuario; desplegado (commits `2fb022f`, `e4aefca`, ADR 0027 y 0028).
- 2026-06-20 - Guia de continuidad entre laptops y despliegue seguro (commit `25d9423`).
- 2026-06-18 - Bitacora continua obligatoria creada; carga y autoguardado de paginas aislados (ADR 0026), monitor de rendimiento y retencion de backups en `ops/` (commits `57680df`, `55c4258`, `fd447d8`).
- 2026-06-18 - Workspaces personales y proyectos normalizados; pizarras backend-first y cache compartida de tareas formalizadas (commit `f650c81`, ADR 0022 a 0025).
- 2026-06-16 - Dashboard carga datos del workspace activo; calendario localizado (commits `71ea975`, `072c6ff`).
- 2026-06-08 - Roles normalizados (`admin`/`usuario`), login simple sin verificacion por correo, gestion de usuarios admin (commits `ffd35da`, `4182b9f`, ADR 0021).
- 2026-06-07 - Estructura de workspaces cargada desde la API con fallback local (commit `06bdddc`).
- 2026-06-06 - Primera migracion Prisma, importacion del backup local fusionado, lint estabilizado (commits `5b3ffb8`, `3ad18ee`, `6913663`; ADR 0019 y 0020 agregados en `a0c5983`).

## 2026-05

- 2026-05-19 - Backend Express/Prisma/PostgreSQL y base de integracion con la API; guia para clonar (commits `96610ae`, `6fc3d2a`, ADR 0016 a 0018).
- 2026-05-08 - Prototipo funcional 2.0: hojas de texto/pizarra y diagramas BD (commit `a254190`, ADR 0014 y 0015).
- 2026-05-05 - Primer prototipo oficial; sidebar con espacios, subespacios y hojas (commits `ab9363f`, `e799940`, ADR 0006 a 0013).

## 2026-04

- 2026-04-22 - Nueva estetica (commit `bf18cd2`).
- 2026-04-21 - Primera version del frontend SPA con React, Vite, TypeScript y Tailwind (commits `f77fece`, `d7793bb`, ADR 0001 a 0005).
