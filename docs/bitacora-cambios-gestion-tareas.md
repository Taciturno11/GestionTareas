# Bitacora de cambios de GESTION_TAREAS

Documento vivo para conservar el contexto cronologico de los cambios realizados en el proyecto.

## Regla de mantenimiento

- Leer esta bitacora antes de comenzar cualquier implementacion, correccion o despliegue.
- Registrar cada cambio terminado en la seccion `Cambios recientes`.
- Agregar las entradas nuevas al inicio, manteniendo orden cronologico inverso.
- Cada entrada debe indicar como minimo:
  - fecha;
  - objetivo;
  - cambios realizados;
  - validaciones ejecutadas;
  - estado del despliegue;
  - commit, si existe.
- No borrar entradas anteriores. Si una decision cambia, agregar una entrada nueva que explique el reemplazo.
- No registrar secretos, contrasenas, tokens, claves privadas ni valores sensibles del servidor.

## Plantilla para nuevas entradas

```md
### AAAA-MM-DD - Titulo breve

- Objetivo:
- Cambios:
- Validaciones:
- Despliegue:
- Commit:
```

## Cambios recientes

### 2026-07-09 - Transicion de tema con mascara SVG difuminada

- Objetivo: hacer que el cambio claro/oscuro se sienta mas natural, similar a la referencia `theme-toggle.rdsx.dev`.
- Cambios:
  - se reemplazo la animacion manual de `clip-path` por una mascara CSS aplicada a `::view-transition-new(root)`;
  - el toggle ahora solo inicia `document.startViewTransition` y agrega temporalmente la clase `theme-transition-circle`;
  - el circulo usa una mascara SVG centrada con blur para suavizar el borde;
  - la curva de animacion usa un easing tipo `expo-out`;
  - se respeta `prefers-reduced-motion` desactivando la transicion animada.
- Validaciones:
  - `npm run lint`;
  - `npm run build`.
- Despliegue: no realizado.
- Commit: `6ef8d6a`.

### 2026-07-09 - Despliegue frontend correccion centro del toggle

- Objetivo: publicar en produccion la correccion para que la transicion circular de tema nazca desde el centro real de la pantalla.
- Cambios:
  - se desplego el release frontend `20260709022517` en `https://agenda.martinnauca.com`;
  - se publico solo frontend porque no hubo cambios de backend ni migraciones Prisma;
  - se preservo `/var/www/gestion_tareas/config.js` de produccion;
  - se creo backup del frontend anterior en `/var/www/gestion_tareas_backup_20260709022517`;
  - se verifico que produccion sirve `assets/index-Bmzx9pfg.js`;
  - se verifico que el bundle publicado contiene `50vw`, `150vmax` y ya no contiene `circle(0px)`;
  - se ejecuto limpieza de retencion del servidor.
- Validaciones:
  - `npm run lint`;
  - `npm run build`;
  - health publico `https://agenda.martinnauca.com/health`;
  - carga publica `https://agenda.martinnauca.com`;
  - servicio backend `gestion-tareas-backend` activo.
- Despliegue: completado.
- Commit: `32ed189`.

### 2026-07-09 - Ajuste centro real en transicion de tema

- Objetivo: corregir que el circulo del cambio de tema no se perciba naciendo desde el centro exacto de la pantalla.
- Cambios:
  - el `clip-path` del View Transition ahora usa `50vw 50vh` como origen fijo;
  - se reemplazo el calculo JS con `window.innerWidth / 2` y `window.innerHeight / 2` por unidades de viewport;
  - la expansion usa `150vmax` para cubrir toda la pantalla desde el centro.
- Validaciones:
  - `npm run lint`;
  - `npm run build`.
- Despliegue: completado en release frontend `20260709022517`.
- Commit: `32ed189`.

### 2026-07-09 - Documentar patron seguro PowerShell SSH Bash

- Objetivo: evitar errores recurrentes de despliegue por interpolacion de variables al ejecutar Bash remoto desde PowerShell.
- Cambios:
  - se agrego una regla en `AGENTS.md` para no enviar scripts remotos largos dentro de comillas dobles;
  - se documento en `docs/guia-continuidad-y-despliegue-produccion.md` el patron recomendado con here-string de PowerShell y `ssh "bash -s -- ARG"`;
  - se explico el sintoma tipico `bash: line X: -f: command not found` y la causa: PowerShell interpola variables Bash antes de enviarlas al servidor.
- Validaciones:
  - revision documental.
- Despliegue: no aplica; cambio documental local.
- Commit: `0d29eb1`.

### 2026-07-09 - Despliegue frontend tema oscuro y particulas

- Objetivo: publicar en produccion el sistema de tema claro/oscuro, particulas en modo oscuro y la transicion circular del toggle.
- Cambios:
  - se desplego el release frontend `20260709020939` en `https://agenda.martinnauca.com`;
  - se publico solo frontend porque no hubo cambios de backend ni migraciones Prisma;
  - se preservo `/var/www/gestion_tareas/config.js` de produccion;
  - se creo backup del frontend anterior en `/var/www/gestion_tareas_backup_20260709020939`;
  - se ejecuto limpieza de retencion del servidor;
  - no se subieron `nuevo-reporte-de-horas.xls` ni `opencode.json`.
- Validaciones:
  - `npm run build`;
  - health publico `https://agenda.martinnauca.com/health`;
  - carga publica `https://agenda.martinnauca.com`;
  - verificacion de release publicado en `/opt/gestion_tareas/releases/20260709020939`;
  - servicio backend `gestion-tareas-backend` activo.
- Despliegue: completado.
- Commit: `ba03bb0`.

### 2026-07-09 - Exclusion de archivos locales antes de despliegue

- Objetivo: evitar que archivos locales no deseados se suban al repositorio o al servidor.
- Cambios:
  - se saco del seguimiento de Git `nuevo-reporte-de-horas.xls`;
  - se saco del seguimiento de Git `opencode.json`;
  - se agregaron ambos archivos a `.gitignore` para prevenir que vuelvan a incluirse por accidente.
- Validaciones:
  - verificacion de estado Git pendiente antes de commit/despliegue.
- Despliegue: no realizado.
- Commit: pendiente.

### 2026-07-09 - Particulas solo en oscuro y transicion circular de tema

- Objetivo: quitar las particulas del modo claro y mejorar el cambio de tema con View Transitions API.
- Cambios:
  - `ParticleBackground` ahora no renderiza canvas ni inicializa `particles.js` en modo claro;
  - se conserva la configuracion de particulas solo para modo oscuro;
  - el toggle del header usa `document.startViewTransition`;
  - el cambio de tema se envuelve en `flushSync` de `react-dom`;
  - se aplica una animacion circular `clip-path` desde el centro de la pantalla;
  - se agrego CSS base para neutralizar la animacion default de View Transitions;
  - se genero captura local en `docs/theme-screenshots/theme-toggle-circle-dark-preview.png`.
- Validaciones:
  - `npm run lint`;
  - `npm run build`;
  - verificacion headless: en claro no hay canvas, el toggle cambia a oscuro, `agenda-theme = dark`, canvas activo en oscuro y sin excepciones JS.
- Despliegue: no realizado.
- Commit: pendiente.

### 2026-07-09 - Particulas plomo en modo claro

- Objetivo: mejorar el color de las particulas en modo claro para que no compitan con la identidad indigo de la UI.
- Cambios:
  - se cambio el color de puntos claros a `#64748B`;
  - se cambio el color de lineas claras a `#94A3B8`;
  - se mantuvieron opacidad, densidad y tamano del ajuste visible anterior;
  - se genero captura local en `docs/theme-screenshots/particles-light-slate-preview.png`.
- Validaciones:
  - `npm run lint`;
  - `npm run build`;
  - verificacion headless en modo claro: canvas presente, `pJSDom = 1`, colores plomo aplicados y sin excepciones JS.
- Despliegue: no realizado.
- Commit: pendiente.

### 2026-07-09 - Mayor visibilidad de particulas en modo claro

- Objetivo: hacer que las particulas del modo claro sean claramente visibles.
- Cambios:
  - se ajusto el color claro hacia un indigo mas definido;
  - se aumento la cantidad base de particulas claras a `78`;
  - se aumento la opacidad de particulas claras a `0.42` y lineas a `0.24`;
  - se aumento levemente el tamano de particulas claras a `2`;
  - se genero captura local en `docs/theme-screenshots/particles-light-visible-preview.png`.
- Validaciones:
  - `npm run lint`;
  - `npm run build`;
  - verificacion headless en modo claro: canvas presente, `pJSDom = 1`, `particleOpacity = 0.42`, `lineOpacity = 0.24` y muestras dibujadas elevadas.
- Despliegue: no realizado.
- Commit: pendiente.

### 2026-07-09 - Particulas visibles y sutiles en modo claro

- Objetivo: hacer que el fondo de particulas se perciba tambien en modo claro sin ensuciar la lectura.
- Cambios:
  - se ajusto el color claro de particulas y lineas hacia indigo suave;
  - se aumento la cantidad de particulas claras de `44` a `52`;
  - se aumento la opacidad de particulas claras a `0.26` y lineas a `0.14`;
  - se genero captura local en `docs/theme-screenshots/particles-light-balanced-preview.png`.
- Validaciones:
  - `npm run lint`;
  - `npm run build`;
  - verificacion headless en modo claro: canvas presente, `pJSDom = 1`, opacidades nuevas aplicadas y muestras dibujadas.
- Despliegue: no realizado.
- Commit: pendiente.

### 2026-07-09 - Toggle rapido de tema en header

- Objetivo: permitir alternar rapido entre fondo claro y noche desde el header.
- Cambios:
  - se agrego un boton iconico junto a notificaciones;
  - el boton muestra luna en claro y sol en oscuro;
  - el toggle usa `useTheme` y persiste la preferencia como `light` o `dark`.
- Validaciones:
  - `npm run lint`;
  - `npm run build`;
  - verificacion headless: cambio de `dark` a `light`, persistencia en `agenda-theme` y actualizacion de `aria-label`.
- Despliegue: no realizado.
- Commit: pendiente.

### 2026-07-09 - Empuje suave de particulas al mouse

- Objetivo: hacer que el movimiento de repulsion de las particulas se sienta mas natural y menos brusco.
- Cambios:
  - se sobrescribio el `repulseParticle` nativo de `particles.js` despues de inicializar la instancia;
  - se reemplazo el salto fuerte por una fuerza progresiva basada en cercania al mouse;
  - se redujo el radio de repulsion en oscuro a `105`;
  - se agregaron tipos locales para representar la instancia runtime de `particles.js`;
  - se genero captura local en `docs/theme-screenshots/particles-smooth-repulse-dark-preview.png`.
- Validaciones:
  - `npm run lint`;
  - `npm run build`;
  - verificacion headless: canvas activo, `hoverMode = repulse`, `repulseDistance = 105`, `smoothPatch = true` y sin excepciones JS.
- Despliegue: no realizado.
- Commit: pendiente.

### 2026-07-09 - Particulas mas densas e interactivas al mouse

- Objetivo: aumentar la presencia del fondo de particulas y activar movimiento al pasar el mouse.
- Cambios:
  - se aumento la cantidad de particulas en tema oscuro y claro;
  - se aumento ligeramente la velocidad de movimiento;
  - se activo `onhover.mode = repulse` con deteccion sobre `window`;
  - se mantuvo el canvas como `pointer-events: none` para no bloquear clicks de la app;
  - se genero captura local en `docs/theme-screenshots/particles-repulse-dark-preview.png`.
- Validaciones:
  - `npm run lint`;
  - `npm run build`;
  - verificacion headless: `detect_on = window`, `hoverMode = repulse`, `mouseStatus = mousemove`, `pJSDom = 1` y canvas activo.
- Despliegue: no realizado.
- Commit: pendiente.

### 2026-07-09 - Mayor paso visual de particulas en sidebar y header

- Objetivo: hacer que las particulas atraviesen de forma claramente visible el sidebar y el header en modo oscuro.
- Cambios:
  - se bajo el fondo oscuro del sidebar a `rgb(18 18 18 / 22%)`;
  - se bajo el fondo oscuro del header a `rgb(18 18 18 / 18%)`;
  - se redujo el blur de ambos contenedores a `2px`;
  - se aumento la densidad y opacidad de las particulas en tema oscuro;
  - se genero captura local en `docs/theme-screenshots/header-sidebar-particles-through-dark-preview.png`.
- Validaciones:
  - `npm run lint`;
  - `npm run build`;
  - verificacion headless en modo oscuro: canvas presente, `pJSDom = 1`, sidebar/header con rgba final y muestras de particulas bajo ambas zonas.
- Despliegue: no realizado.
- Commit: pendiente.

### 2026-07-09 - Transparencia visible en sidebar y header oscuros

- Objetivo: hacer que las particulas sean visibles tambien bajo el sidebar y el header en modo oscuro.
- Cambios:
  - se redujo la opacidad del fondo oscuro del sidebar a `rgb(18 18 18 / 54%)`;
  - se hizo translucido el header con `rgb(18 18 18 / 50%)`;
  - se redujo el blur de sidebar y header a `10px` para que las particulas no queden ocultas;
  - se agrego borde translucido especifico para el header;
  - se genero captura local en `docs/theme-screenshots/header-sidebar-particles-dark-preview.png`.
- Validaciones:
  - `npm run lint`;
  - `npm run build`;
  - verificacion headless en modo oscuro: canvas presente, sidebar/header con fondos rgba y sin excepciones JS.
- Despliegue: no realizado.
- Commit: pendiente.

### 2026-07-09 - Sidebar translucido sobre fondo de particulas

- Objetivo: mejorar la integracion visual del sidebar con el fondo de particulas sin reducir la legibilidad del contenido.
- Cambios:
  - se ajusto `--color-bg-sidebar` a fondos translucidos en claro y oscuro;
  - se agrego `--sidebar-shell-border` para mantener un borde lateral sutil;
  - se aplico `backdrop-filter` al contenedor del sidebar, manteniendo textos, iconos y estados con opacidad normal;
  - se generaron capturas locales de verificacion en `docs/theme-screenshots/sidebar-particles-dark-preview.png` y `docs/theme-screenshots/sidebar-particles-light-preview.png`.
- Validaciones:
  - `npm run lint`;
  - `npm run build` paso en el segundo intento; el primero fallo por asignacion de memoria interna de Vite/Rolldown;
  - verificacion headless en claro y oscuro: canvas presente, sidebar con opacidad `1` y fondo translucido.
- Despliegue: no realizado.
- Commit: pendiente.

### 2026-07-09 - Fondo de particulas con particles.js

- Objetivo: agregar un fondo de particulas usando la libreria `particles.js`.
- Cambios:
  - se agrego la dependencia `particles.js`;
  - se creo `src/components/ParticleBackground/ParticleBackground.tsx`;
  - se agregaron tipos locales para la API global de `particles.js`;
  - se carga `particles.js` como script clasico para evitar el error de `arguments.callee` al empaquetarlo como modulo estricto;
  - se monto el fondo en `AppLayout` con `pointer-events: none` y capas `z-index` seguras;
  - se ajustaron los fondos generales de Dashboard y Calendario a transparente para dejar ver el fondo global;
  - se documento la integracion en `docs/THEME-IMPLEMENTATION.md`.
- Validaciones:
  - `npm run lint`;
  - `npm run build`;
  - verificacion headless en `/tareas`: app renderizada, canvas presente y muestras con pixeles dibujados.
- Despliegue: no realizado.
- Commit: pendiente.

### 2026-07-09 - Refinamiento visual del tema oscuro inspirado en CMS

- Objetivo: mejorar la estetica del tema oscuro usando como referencia el dark mode del proyecto CMS local.
- Cambios:
  - se analizaron `src/index.css`, `ThemeProvider` y documentacion de tema noche del CMS;
  - se ajusto la paleta oscura de `gestion_tareas` hacia carbon neutro (`#121212`, `#1E1E1E`, `#252525`);
  - se suavizaron fondos activos, estados, bordes y sombras;
  - se conservaron el tema claro, el sistema `light`/`dark`/`system`, la identidad indigo y los colores persistidos por el usuario;
  - se alinearon React Flow y login con el nuevo fondo oscuro;
  - se documento el ajuste en `docs/COLOR-PALETTE-AUDIT.md` y `docs/THEME-IMPLEMENTATION.md`.
- Validaciones:
  - `npm run lint`;
  - `npm run build`.
- Despliegue: no realizado.
- Commit: pendiente.

### 2026-07-05 - Implementacion de tema claro oscuro y sistema

- Objetivo: implementar un sistema completo de temas basado en la auditoria visual, sin desplegar ni tocar servidor.
- Cambios:
  - se centralizaron tokens semanticos claros/oscuros en `src/index.css` y se alinearon tokens shadcn;
  - se agrego `ThemeProvider`, `useTheme`, resolucion `light`/`dark`/`system`, persistencia `agenda-theme` y script anti-flash en `index.html`;
  - se agrego selector de tema en `Ajustes > Apariencia`;
  - se migraron layout, header, Dashboard/Kanban, chips dinamicos, Inicio/Recharts, Login, tldraw y React Flow;
  - se creo `src/utils/theme-colors.ts` para interpretar colores dinamicos sin alterar datos persistidos;
  - se creo `docs/THEME-IMPLEMENTATION.md` y se actualizo `docs/COLOR-PALETTE-AUDIT.md`;
  - se generaron capturas locales en `docs/theme-screenshots/`.
- Validaciones:
  - `npm run lint`;
  - `npm run build`;
  - servidor local Vite en `http://127.0.0.1:5175/`;
  - capturas headless de login claro y oscuro con Chrome DevTools Protocol.
- Despliegue: no realizado por instruccion del usuario.
- Commit: pendiente.

### 2026-07-05 - Auditoria de paleta visual

- Objetivo: documentar la estetica visual actual y preparar una futura implementacion de tema oscuro sin modificar estilos.
- Cambios:
  - se creo `docs/COLOR-PALETTE-AUDIT.md`;
  - se inventariaron colores fisicos, tokens Tailwind, variables CSS, estados, hardcodes e inconsistencias visuales;
  - se agrego mapa por componente y recomendaciones para tokenizacion futura.
- Validaciones:
  - inspeccion local con `rg` y scripts de conteo sobre codigo versionado;
  - revision de diff documental.
- Despliegue: no aplica; cambio documental local.
- Commit: pendiente.

### 2026-06-30 - Despliegue produccion mejoras UI y F2

- Objetivo: publicar en produccion las mejoras recientes de UI y atajos del sidebar.
- Cambios:
  - release de produccion `20260630013030`;
  - se desplegaron frontend y backend preservando `config.js` de produccion;
  - se creo backup PostgreSQL `gestion_tareas_before_20260630013030.dump`;
  - se crearon backups de frontend y backend antes de reemplazar archivos;
  - se aplico en produccion la migracion pendiente `20260629_add_task_archived_at`;
  - se ejecuto limpieza de retencion del servidor si el script estaba disponible.
- Validaciones:
  - `npm run lint`;
  - `npm run build`;
  - `backend/npm run build`;
  - servidor `npx prisma generate`;
  - servidor `npm run prisma:migrate:deploy`;
  - health local servidor `http://127.0.0.1:4100/health`;
  - health publico `https://agenda.martinnauca.com/health`;
  - home publica `https://agenda.martinnauca.com`.
- Despliegue: completado en produccion.
- Commit: `5f9e827`.

### 2026-06-30 - Renombrar elementos del sidebar con F2

- Objetivo: permitir renombrar carpetas, subcarpetas y hojas desde el sidebar usando la tecla `F2`.
- Cambios:
  - se recuerda el ultimo elemento clickeado o abierto por menu contextual en el sidebar;
  - `F2` abre el mismo flujo que `Editar nombre` para espacios y hojas;
  - el atajo ignora inputs, textareas, selects, contenido editable, modales abiertos y sidebar colapsado;
  - en espacios compartidos se respeta el permiso `EDITOR`; usuarios `VIEWER` no activan renombrado.
- Validaciones:
  - `npm run lint`;
  - `npm run build`.
- Despliegue: pendiente.
- Commit: `5a62336`.

### 2026-06-30 - Fondo anterior en toolbar de texto

- Objetivo: conservar el fondo visual anterior de la toolbar de hojas de texto.
- Cambios:
  - la nueva toolbar tipo segundo header mantiene `bg-white/90` con blur;
  - se conserva el comportamiento sticky y la distribucion horizontal.
- Validaciones:
  - `npm run lint`;
  - `npm run build`.
- Despliegue: pendiente.
- Commit: `dfb2ec9`.

### 2026-06-30 - Toolbar de hojas de texto como segundo header

- Objetivo: mejorar la barra de formato de hojas de texto para que se vea como un segundo header debajo del header principal.
- Cambios:
  - se reemplazo la toolbar pequena/flotante por una barra sticky de ancho completo dentro del area de contenido;
  - se mantuvieron acciones de encabezados, negrita, cursiva, subrayado, listas y colores;
  - se agruparon controles con separadores y estados activos mas visibles;
  - la toolbar conserva scroll horizontal en pantallas pequenas;
  - en modo lectura la toolbar no se muestra.
- Validaciones:
  - `npm run lint`;
  - `npm run build`.
- Despliegue: pendiente.
- Commit: `84623ab`.

### 2026-06-30 - Contador fuera de filtros archivados

- Objetivo: reducir el alto visual de la barra de filtros de `/archivo/tareas`.
- Cambios:
  - el texto `Mostrando X de Y tareas archivadas` ahora aparece fuera del card de filtros;
  - el card de filtros queda dedicado solo a busqueda, selectores y limpieza.
- Validaciones:
  - `npm run lint`;
  - `npm run build`.
- Despliegue: pendiente.
- Commit: `2347c7e`.

### 2026-06-30 - Simplificacion de filtros en tareas archivadas

- Objetivo: simplificar la barra de filtros de `/archivo/tareas`.
- Cambios:
  - se retiro el filtro de estado;
  - los selectores ahora muestran textos mas breves: `Proyectos`, `Etiqueta` y `Prioridad`;
  - se mantuvo busqueda por titulo, contador, limpieza de filtros y filtrado local.
- Validaciones:
  - `npm run lint`;
  - `npm run build`.
- Despliegue: pendiente.
- Commit: `2def727`.

### 2026-06-30 - Filtros en tareas archivadas

- Objetivo: agregar filtros locales en `/archivo/tareas` para encontrar tareas archivadas rapidamente.
- Cambios:
  - se agrego busqueda por titulo;
  - se agregaron filtros por proyecto, etiqueta, prioridad y estado;
  - se agrego contador `Mostrando X de Y tareas archivadas`;
  - se agrego boton `Limpiar filtros`;
  - se agrego estado vacio cuando no hay resultados por filtros;
  - el filtrado es local y no modifica backend ni Prisma.
- Validaciones:
  - `npm run lint`;
  - `npm run build`;
  - `backend/npm run build`.
- Despliegue: pendiente.
- Commit: `2cfd5bc`.

### 2026-06-29 - Card de tareas archivadas en Archivo

- Objetivo: ordenar el modulo `Archivo` para que las tareas archivadas vivan dentro de una card y una vista dedicada.
- Cambios:
  - `/archivo` ya no lista todas las tareas archivadas directamente;
  - se agrego una card `Tareas archivadas` con contador y accion `Ver tareas`;
  - se agrego la ruta `/archivo/tareas` con listado completo de tareas archivadas;
  - la vista dedicada permite restaurar tareas y volver a `Archivo`;
  - se reutiliza la API existente de tareas archivadas, sin cambios de backend ni Prisma.
- Validaciones:
  - `npm run lint`;
  - `npm run build`;
  - `backend/npm run build`.
- Despliegue: pendiente.
- Commit: `8f5de79`.

### 2026-06-29 - Archivado manual de tareas completadas

- Objetivo: limpiar la columna `Hecho` del Kanban sin borrar tareas ni perder historial.
- Cambios:
  - se agrego `Task.archivedAt` con migracion Prisma `20260629_add_task_archived_at`;
  - `GET /api/tasks` oculta tareas archivadas por defecto y soporta `includeArchived=true`;
  - se agregaron endpoints `POST /api/tasks/:id/archive` y `POST /api/tasks/:id/restore`;
  - `Mis tareas` permite archivar tareas hechas individualmente y con `Archivar hechas`;
  - `Archivo` muestra `Tareas archivadas` y permite restaurarlas;
  - Inicio y Calendario quedan usando el listado normal de tareas no archivadas.
- Validaciones:
  - `backend/npm run prisma:migrate:deploy`;
  - `backend/npm run prisma:generate`;
  - `backend/npm run build`;
  - `backend/npx prisma migrate status`;
  - `npm run lint`;
  - `npm run build`.
- Despliegue: pendiente.
- Commit: `feb06ee`.

### 2026-06-27 - Titulo limpio en PDF de reporte de horas

- Objetivo: ajustar la cabecera del PDF para que no use el titulo editable de la hoja ni muestre la fecha de generacion.
- Cambios:
  - el PDF ahora muestra siempre `Reporte de horas` como titulo principal;
  - se retiro la linea `Generado: ...` de la descarga PDF;
  - el titulo real de la hoja en la app no se modifica;
  - la exportacion Excel conserva su comportamiento previo.
- Validaciones:
  - `npm run lint`;
  - `npm run build`.
- Despliegue: pendiente.
- Commit: `f866d08`.

### 2026-06-27 - Precio por hora solo en resumen final PDF

- Objetivo: retirar `Precio por hora` del resumen final visible del reporte y dejarlo solo en el resumen final del PDF.
- Cambios:
  - se elimino la tarjeta final `Precio por hora` de la vista del reporte;
  - se elimino `Precio por hora` del resumen final de la exportacion Excel;
  - se mantuvo `Precio por hora` en el resumen final de la descarga PDF;
  - el campo superior `Precio por hora` se conserva para calcular el precio estimado.
- Validaciones:
  - `npm run lint`;
  - `npm run build`.
- Despliegue: pendiente.
- Commit: `0c69ed0`.

### 2026-06-27 - Precio por hora en resumen final de reporte de horas

- Objetivo: mostrar `Precio por hora` entre `Total de horas` y `Precio estimado` en la parte final del reporte.
- Cambios:
  - se agrego `Precio por hora` al resumen final visible de la pagina;
  - se agrego `Precio por hora` al resumen final del PDF;
  - se agrego `Precio por hora` al resumen final de la exportacion Excel;
  - el orden final queda `Total de horas`, `Precio por hora`, `Precio estimado`.
- Validaciones:
  - `npm run lint`;
  - `npm run build`.
- Despliegue: pendiente.
- Commit: `7dd1901`.

### 2026-06-27 - Correccion definitiva de desborde en observaciones PDF

- Objetivo: evitar que los textos de `Observaciones` se espacien o se salgan de la celda en el PDF.
- Cambios:
  - se mantuvo el envio de texto como string normal para no reintroducir comas artificiales;
  - se reemplazan solo simbolos incompatibles con la fuente PDF basica, como flechas y bullets especiales;
  - las flechas `→` se exportan como `->` en PDF sin modificar el contenido guardado del reporte;
  - se valido el reporte local para confirmar que no quedan dobles comas ni flechas Unicode en el texto enviado al PDF.
- Validaciones:
  - `npm run lint`;
  - `npm run build`;
  - verificacion local del contenido transformado para PDF.
- Despliegue: pendiente.
- Commit: `9daee8e`.

### 2026-06-27 - Correccion de comas artificiales en PDF de reporte de horas

- Objetivo: hacer que `Actividad` y `Observaciones` del PDF respeten el texto del reporte sin agregar comas artificiales.
- Cambios:
  - se elimino el envio de arreglos de lineas a `jspdf-autotable`;
  - `Actividad` y `Observaciones` vuelven a enviarse como strings normales;
  - se mantiene solo una normalizacion minima de saltos de linea y espacios no separables.
- Validaciones:
  - `npm run lint`;
  - `npm run build`.
- Despliegue: pendiente.
- Commit: `de9b585`.

### 2026-06-27 - Correccion de texto en observaciones del PDF

- Objetivo: corregir palabras mal renderizadas o espaciadas en la columna `Observaciones` del PDF de reporte de horas.
- Cambios:
  - se normaliza texto antes de enviarlo al PDF para reemplazar caracteres problematicos como flechas, bullets y guiones especiales;
  - se controlan manualmente los saltos de linea en `Actividad` y `Observaciones`;
  - se fuerza `overflow: linebreak` y alineacion izquierda en columnas largas.
- Validaciones:
  - `npm run lint`;
  - `npm run build`.
- Despliegue: pendiente.
- Commit: `33dad34`.

### 2026-06-27 - Resumen PDF solo al final del reporte de horas

- Objetivo: evitar que `Total de horas` y `Precio estimado` se repitan en cada pagina del PDF.
- Cambios:
  - se retiro el resumen del `foot` repetible de la tabla PDF;
  - se agrego un bloque de resumen independiente que se dibuja una sola vez al final;
  - si el resumen no entra en la ultima pagina, se mueve completo a una pagina nueva.
- Validaciones:
  - `npm run lint`;
  - `npm run build`.
- Despliegue: pendiente.
- Commit: `7c9efbf`.

### 2026-06-27 - Mejora visual del PDF de reporte de horas

- Objetivo: mejorar la parte superior del PDF y dar mas protagonismo a `Actividad` y `Observaciones`.
- Cambios:
  - se simplifico la cabecera del PDF quitando `Precio por hora` del bloque superior;
  - se mantuvo el calculo de precio estimado en el resumen final;
  - se reorganizaron los metadatos superiores en dos filas mas limpias;
  - se redujo el ancho de `Fecha`, `HI`, `HF` y `TH`;
  - se amplio el ancho de `Actividad` y `Observaciones`.
- Validaciones:
  - `npm run lint`;
  - `npm run build`.
- Despliegue: pendiente.
- Commit: `a35dbcf`.

### 2026-06-27 - Descarga directa de PDF en reporte de horas

- Objetivo: hacer que el boton `Generar PDF` descargue literalmente un archivo `.pdf`, sin depender del dialogo de impresion del navegador.
- Cambios:
  - se agregaron `jspdf` y `jspdf-autotable` para generar el PDF desde el frontend;
  - `Generar PDF` ahora crea y descarga un archivo `.pdf` con cabecera, datos del reporte, tabla de actividades, total de horas y precio estimado;
  - se mantuvo la descarga Excel existente;
  - no se incluyo ningun archivo `.xls` generado localmente.
- Validaciones:
  - `npm run lint`;
  - `npm run build`.
- Despliegue: pendiente.
- Commit: `a6845ab`.

### 2026-06-27 - Despliegue frontend PDF reporte de horas

- Objetivo: publicar el campo `Trabajador` y la generacion de PDF en `Reporte de horas`.
- Cambios:
  - se desplego el release frontend `20260627194707` en `https://agenda.martinnauca.com`;
  - se publico solo frontend porque no hubo cambios de backend ni migraciones;
  - se preservo `config.js` de produccion;
  - se creo backup del frontend anterior antes de reemplazarlo;
  - no se subieron archivos `.xls` generados localmente.
- Validaciones:
  - `npm run lint`;
  - `npm run build`;
  - health publico `https://agenda.martinnauca.com/health`;
  - carga publica `https://agenda.martinnauca.com`.
- Despliegue: completado.
- Commit: `d380943`.

### 2026-06-27 - PDF y trabajador en reporte de horas

- Objetivo: ampliar el `Reporte de horas` con campo `Trabajador` y exportacion en PDF.
- Cambios:
  - se agrego el campo `Trabajador` en la cabecera del reporte;
  - la cabecera ahora queda en dos lineas: `Cliente`/`Servicio` y luego `Trabajador`/`Periodo`/`Precio por hora`;
  - se agrego el boton `Generar PDF` al costado de `Descargar Excel`;
  - la exportacion Excel incluye tambien `Trabajador`;
  - el PDF usa una vista imprimible con formato y abre el dialogo del navegador para guardar como PDF.
- Validaciones:
  - `npm run lint`;
  - `npm run build`.
- Despliegue: pendiente.
- Commit: pendiente.

### 2026-06-27 - Despliegue frontend exportacion Excel y compartidos

- Objetivo: publicar los ajustes de exportacion Excel del `Reporte de horas` y la alineacion de menus contextuales en `Compartido`.
- Cambios:
  - se desplego el release frontend `20260627184318` en `https://agenda.martinnauca.com`;
  - se publico solo frontend porque no hubo cambios de backend ni migraciones;
  - se preservo `config.js` de produccion;
  - se creo backup del frontend anterior antes de reemplazarlo;
  - se ejecuto limpieza de retencion si el script estaba disponible.
- Validaciones:
  - `npm run lint`;
  - `npm run build`;
  - health publico `https://agenda.martinnauca.com/health`;
  - carga publica `https://agenda.martinnauca.com`.
- Despliegue: completado.
- Commit: `93c3da0`.

### 2026-06-27 - Descarga Excel para reporte de horas

- Objetivo: permitir exportar el `Reporte de horas` a un archivo compatible con Excel y con formato visual.
- Cambios:
  - se agrego boton `Descargar Excel` en `TimeReportPage`;
  - la exportacion genera un archivo `.xls` desde una tabla HTML con estilos;
  - el archivo incluye titulo, fecha de generacion, cliente, servicio, periodo, precio por hora, actividades, fechas, HI, HF, TH, observaciones, total de horas y precio estimado;
  - se preservan saltos de linea en actividad y observaciones;
  - se sanitiza el nombre del archivo a partir del titulo del reporte.
- Validaciones:
  - `npm run lint`;
  - `npm run build`.
- Despliegue: pendiente.
- Commit: pendiente.

### 2026-06-25 - Menus contextuales en compartidos igual a espacios normales

- Objetivo: alinear la interaccion de `Compartido` con los espacios normales.
- Cambios:
  - el anticlick sobre espacios compartidos con permiso `EDITOR` ahora muestra tambien `Editar`;
  - las hojas/pizarras/diagramas/reportes dentro de espacios compartidos ahora tienen menu contextual por anticlick;
  - se retiro el boton de borrar visible en hover para hojas compartidas;
  - `Editar nombre` en hojas compartidas abre el mismo input inline del sidebar;
  - al editar o borrar contenido compartido se refresca la seccion `Compartido`.
- Validaciones:
  - `npm run lint`;
  - `npm run build`.
- Despliegue: pendiente.
- Commit: pendiente.

### 2026-06-25 - Despliegue produccion reporte de horas

- Objetivo: publicar en produccion el nuevo tipo de pagina `Reporte de horas` y los ajustes recientes de UI/compartidos.
- Cambios:
  - se desplego el release `20260625093254` en `https://agenda.martinnauca.com`;
  - se aplico la migracion Prisma `20260625_time_report_page_type`;
  - se desplego backend y frontend preservando `config.js` de produccion;
  - se genero backup PostgreSQL y backups de frontend/backend antes de publicar;
  - se ejecuto limpieza de retencion si el script estaba disponible.
- Validaciones:
  - `npm run lint`;
  - `npm run build`;
  - `backend/npm run build`;
  - `backend/npx prisma generate`;
  - health interno `http://127.0.0.1:4100/health`;
  - health publico `https://agenda.martinnauca.com/health`;
  - carga publica `https://agenda.martinnauca.com`.
- Despliegue: completado.
- Commit: `618a515`.

### 2026-06-25 - Centrado vertical en filas altas del reporte

- Objetivo: mejorar la lectura de filas altas en `Reporte de horas` cuando `Actividad` u `Observaciones` crecen dinamicamente.
- Cambios:
  - las columnas `Fecha`, `HI`, `HF` y `TH` ahora se alinean verticalmente al centro de la celda;
  - las columnas de texto largo mantienen alineacion superior para facilitar lectura/escritura.
- Validaciones:
  - `npm run lint`;
  - `npm run build`.
- Despliegue: pendiente.
- Commit: pendiente.

### 2026-06-25 - Textareas autoajustables en reporte de horas

- Objetivo: evitar scroll interno en las columnas `Actividad` y `Observaciones` del `Reporte de horas`.
- Cambios:
  - se agrego un textarea autoajustable dentro de `TimeReportPage`;
  - `Actividad` y `Observaciones` empiezan con alto de una linea;
  - al escribir contenido que ocupa mas lineas, la celda crece automaticamente;
  - se retiro el resize manual y el scroll interno de esos campos.
- Validaciones:
  - `npm run lint`;
  - `npm run build`.
- Despliegue: pendiente.
- Commit: pendiente.

### 2026-06-25 - Duracion de reporte en horas y minutos

- Objetivo: mostrar `TH` y `Total de horas` en formato legible de horas y minutos.
- Cambios:
  - `TH` ahora se presenta como `X h Y min`, `X h`, `Y min` o `0 min`;
  - `Total de horas` usa el mismo formato;
  - el precio estimado mantiene el calculo interno en horas decimales para conservar la formula `total de horas x precio por hora`.
- Validaciones:
  - `npm run lint`;
  - `npm run build`.
- Despliegue: pendiente.
- Commit: pendiente.

### 2026-06-25 - TimeInput compacto para HI y HF

- Objetivo: mejorar la edicion de horas en `Reporte de horas` evitando el scroll vertical excesivo del selector visual.
- Cambios:
  - se reemplazo `TimePicker` por `TimeInput`;
  - `HI` y `HF` ahora usan un input compacto con formato `HH:mm`;
  - el input acepta escritura rapida como `830` y normaliza a `08:30` al perder foco;
  - las horas invalidas se marcan visualmente y no participan en el calculo de horas.
- Validaciones:
  - `npm run lint`;
  - `npm run build`.
- Despliegue: pendiente.
- Commit: pendiente.

### 2026-06-25 - TimePicker visual para reporte de horas

- Objetivo: reemplazar los inputs nativos de hora en `HI` y `HF` por un selector visual consistente con el sistema UI.
- Cambios:
  - se creo `src/components/ui/time-picker.tsx`;
  - el selector usa `Popover` y opciones de hora en intervalos de 15 minutos;
  - se agrego opcion `Limpiar hora`;
  - `Reporte de horas` ahora usa `TimePicker` en las columnas `HI` y `HF`.
- Nota: reemplazado por `TimeInput` compacto porque el selector visual exigia demasiado scroll vertical en tablas.
- Validaciones:
  - `npm run lint`;
  - `npm run build`.
- Despliegue: pendiente.
- Commit: pendiente.

### 2026-06-25 - Mejora UI del reporte de horas

- Objetivo: mejorar la experiencia de edicion del `Reporte de horas` para textos largos y fechas.
- Cambios:
  - las columnas `Actividad` y `Observaciones` ahora usan `textarea` para permitir varias lineas;
  - la columna `Fecha` dejo de usar input nativo y reutiliza el `DatePicker` del sistema basado en `Calendar`;
  - `DatePicker` acepta props opcionales para estado deshabilitado, blur, clase visual y formato de presentacion sin romper usos existentes;
  - se ajustaron anchos de tabla para dar mas espacio a contenido descriptivo.
- Validaciones:
  - `npm run lint`;
  - `npm run build`.
- Despliegue: pendiente.
- Commit: pendiente.

### 2026-06-25 - Reporte de horas como nuevo tipo de pagina

- Objetivo: agregar una funcionalidad `Reporte de horas` siguiendo el mismo patron de hojas, pizarras y diagramas BD.
- Cambios:
  - se agrego el tipo de pagina `time-report` en frontend y `TIME_REPORT` en Prisma;
  - se creo la migracion `20260625_time_report_page_type`;
  - se agrego `TimeReportPage` con encabezado editable, tabla de actividades, calculo automatico de `TH`, total de horas y precio estimado;
  - se integro la creacion del reporte en `Nueva hoja`, menus de espacios, subespacios y espacios compartidos;
  - se reutilizo `PageView`, `usePageSaveQueue`, `PATCH /api/pages/:id` y permisos existentes;
  - se creo el ADR `0029-reporte-de-horas-como-tipo-de-pagina`.
- Validaciones:
  - `npm run lint`;
  - `npm run build`;
  - `backend/npm run build`;
  - `backend/npx prisma generate`;
  - `backend/npx prisma migrate deploy` aplicado en base local.
- Despliegue: pendiente.
- Commit: pendiente.

### 2026-06-25 - Colapsar y expandir espacios compartidos

- Objetivo: permitir colapsar y expandir carpetas en la seccion `Compartido`.
- Cambios:
  - `SharedSpaceTree` ahora respeta estado colapsado;
  - se agrego toggle local para espacios compartidos sin depender de permisos de edicion;
  - el espacio raiz compartido colapsa/expande con click;
  - subespacios compartidos colapsan/expanden desde el icono, igual que los espacios normales.
- Validaciones:
  - `npm run lint`;
  - `npm run build`.
- Despliegue: pendiente.
- Commit: pendiente.

### 2026-06-25 - Correccion fecha invalida en Inicio

- Objetivo: evitar crash `RangeError: Invalid time value` en la tarjeta de actividad reciente.
- Cambios:
  - se agrego un formateador seguro para fechas de actividad reciente;
  - si `updatedAt`/`createdAt` viene invalido, la UI muestra `Fecha no disponible` en lugar de romper la pagina.
- Validaciones:
  - `npm run lint`;
  - `npm run build`.
- Despliegue: pendiente.
- Commit: pendiente.

### 2026-06-25 - Interaccion compartidos igual a espacios normales

- Objetivo: unificar la interaccion de la seccion `Compartido` con los espacios propios.
- Cambios:
  - se quitaron los iconos de accion visibles en hover en espacios compartidos;
  - las acciones de crear subespacio, texto, pizarra, diagrama y borrar quedan solo en el menu contextual por anticlick;
  - se simplificaron props internas de `SharedSpaceTree` al centralizar acciones en el menu contextual.
- Validaciones:
  - `npm run lint`;
  - `npm run build`.
- Despliegue: pendiente.
- Commit: pendiente.

### 2026-06-24 - Prompt para desplegar otro proyecto

- Objetivo: crear una guia sencilla para entregar a otro chat de Codex y desplegar un proyecto distinto en el mismo servidor sin tocar `gestion_tareas`.
- Cambios:
  - se creo `docs/prompt-despliegue-nuevo-proyecto-servidor.md`;
  - el prompt define rutas separadas por proyecto, preguntas previas, reglas de seguridad y flujo general de despliegue;
  - se ajusto para usar el dominio `mundial.martinnauca.com` y evitar mencionar rutas especificas de otros proyectos.
- Validaciones:
  - revision documental.
- Despliegue: no aplica.
- Commit: pendiente.

### 2026-06-24 - Despliegue produccion amigos, avatars y compartidos

- Objetivo: publicar en produccion el bloque de amigos, solicitudes, avatars y mejoras de espacios compartidos.
- Cambios:
  - release de produccion `20260624152510`;
  - backend desplegado en `/opt/gestion_tareas/current/backend`;
  - frontend desplegado en `/var/www/gestion_tareas` preservando `config.js`;
  - migraciones aplicadas en produccion: `20260624_friends`, `20260624_space_shares`, `20260624_user_avatar`;
  - se ejecuto limpieza de retencion del servidor.
- Validaciones:
  - `npm run lint`;
  - `npm run build`;
  - `backend/npm run build`;
  - `backend/npx prisma validate`;
  - backup PostgreSQL previo creado;
  - health local servidor `http://127.0.0.1:4100/health`;
  - health publico `https://agenda.martinnauca.com/health`;
  - frontend publico `https://agenda.martinnauca.com`;
  - servicio `gestion-tareas-backend` activo.
- Despliegue: completado.
- Commit: `e4aefca`.

### 2026-06-24 - Menu contextual para espacios compartidos

- Objetivo: permitir crear pizarra y otras hojas desde carpetas compartidas con permiso de edicion.
- Cambios:
  - se agrego menu contextual con anticlick en espacios compartidos `EDITOR`;
  - el menu permite crear subespacio, texto, pizarra y diagrama BD;
  - se conserva el borrado de espacio compartido para editores;
  - el menu se posiciona evitando salirse del borde inferior.
- Validaciones:
  - `npm run lint`;
  - `npm run build`.
- Despliegue: incluido en despliegue de produccion 2026-06-24.
- Commit: pendiente.

### 2026-06-24 - Borde visible en avatar de compartido

- Objetivo: mejorar la legibilidad del avatar del invitador en la seccion `Compartido`.
- Cambios:
  - se agrego borde blanco y contorno sutil al avatar con imagen;
  - se aplico el mismo borde al fallback de iniciales.
- Validaciones:
  - `npm run lint`;
  - `npm run build`.
- Despliegue: incluido en despliegue de produccion 2026-06-24.
- Commit: pendiente.

### 2026-06-24 - Avatar del invitador en seccion Compartido

- Objetivo: limpiar la seccion `Compartido` y mostrar quien compartio cada espacio.
- Cambios:
  - se retiro la linea `workspace · permiso` debajo de cada espacio compartido;
  - la respuesta de compartidos incluye `createdBy.avatarUrl`;
  - el sidebar muestra el avatar o iniciales del usuario que compartio el espacio junto a la carpeta raiz.
- Validaciones:
  - `backend/npm run build`;
  - `npm run lint`;
  - `npm run build`.
- Despliegue: incluido en despliegue de produccion 2026-06-24.
- Commit: pendiente.

### 2026-06-24 - Cache de espacios compartidos por usuario

- Objetivo: corregir que un espacio compartido no aparezca al cambiar entre cuentas, por reutilizacion de cache global.
- Cambios:
  - `useSharedSpaces` ahora separa la cache por `userId`;
  - `Sidebar` recibe el usuario actual desde `AppLayout` para consultar sus compartidos;
  - la seccion del sidebar se renombro a `Compartido`.
- Validaciones:
  - se verifico en base local que `martinsitonauca@gmail.com` tiene un `SpaceShare` creado por `pepito@gmail.com`;
  - `npm run lint`;
  - `npm run build`.
- Despliegue: incluido en despliegue de produccion 2026-06-24.
- Commit: pendiente.

### 2026-06-24 - Apertura explicita del dropdown de amigos

- Objetivo: asegurar que el dropdown de amigos se abra inmediatamente al presionar el input `Buscar amigo`.
- Cambios:
  - el input abre el selector con `mouse down`, foco y click;
  - al volver a presionar el input se limpia la seleccion previa para poder escoger otro amigo;
  - la seleccion usa `mouse down` para evitar que el blur cierre el dropdown antes de elegir.
- Validaciones:
  - `npm run lint`;
  - `npm run build`.
- Despliegue: incluido en despliegue de produccion 2026-06-24.
- Commit: pendiente.

### 2026-06-24 - Combobox de amigos en compartir espacio

- Objetivo: mejorar el modal `Compartir espacio` para que el selector de amigos se abra al presionar el input.
- Cambios:
  - el campo `Buscar amigo` abre la lista de amigos al recibir foco;
  - el selector se cierra al elegir un amigo o al salir del campo;
  - los mensajes de vacio/sin resultados solo aparecen mientras el selector esta activo.
- Validaciones:
  - `npm run lint`;
  - `npm run build`.
- Despliegue: incluido en despliegue de produccion 2026-06-24.
- Commit: pendiente.

### 2026-06-24 - Avatar cuadrado y comprimido automaticamente

- Objetivo: evitar guardar imagenes grandes como avatar y normalizar la foto a un formato pequeno tipo Gmail.
- Cambios:
  - la carga de avatar ahora recorta automaticamente al centro en formato cuadrado;
  - el avatar se redimensiona a `128x128`;
  - la imagen se exporta como `WebP` y se comprime hasta quedar bajo `50 KB`;
  - el backend acepta solo `data:image/webp;base64` pequeno para `avatarUrl`;
  - se retiro la accion visual `Quitar avatar` del perfil.
- Validaciones:
  - `backend/npm run build`;
  - `npm run lint`;
  - `npm run build`.
- Despliegue: incluido en despliegue de produccion 2026-06-24.
- Commit: pendiente.

### 2026-06-24 - Avatar de usuario y perfil simple

- Objetivo: mostrar avatar en solicitudes de amistad y permitir cambiar la imagen desde el perfil del usuario.
- Cambios:
  - se agrego `User.avatarUrl` con migracion local;
  - auth, usuarios publicos, amigos y compartidos devuelven `avatarUrl`;
  - el dropdown del avatar incluye vista `Ver perfil`;
  - el perfil permite cargar una imagen y quitar el avatar;
  - solicitudes de amistad en campanita y pagina Amigos muestran avatar o iniciales.
- Validaciones:
  - `backend/npm run prisma:generate`;
  - `backend/npm run prisma:migrate:deploy`;
  - `backend/npm run build`;
  - `npm run lint`;
  - `npm run build`;
  - health local del backend `200`.
- Despliegue: incluido en despliegue de produccion 2026-06-24.
- Commit: pendiente.

### 2026-06-24 - Pagina dedicada para Amigos

- Objetivo: evitar que el sidebar contenga el formulario de solicitudes y mover la gestion de amigos a una pagina propia.
- Cambios:
  - se agrego la ruta `/amigos`;
  - el sidebar ahora muestra `Amigos` como modulo de navegacion;
  - nueva pagina `FriendsPage` con formulario para enviar solicitud por correo exacto;
  - la pagina lista amigos, solicitudes recibidas y solicitudes enviadas;
  - se mantiene el modal `Compartir espacio` usando solo amigos aceptados.
- Validaciones:
  - `npm run lint`;
  - `npm run build`.
- Despliegue: incluido en despliegue de produccion 2026-06-24.
- Commit: pendiente.

### 2026-06-24 - Amigos y solicitudes para compartir espacios

- Objetivo: permitir compartir espacios solo con amigos aceptados y agregar solicitudes de amistad dentro de la app.
- Cambios:
  - nuevos modelos `FriendRequest` y `Friendship` con estados `PENDING`, `ACCEPTED`, `REJECTED` y `CANCELED`;
  - APIs `/api/friends` y `/api/friend-requests` para listar amigos, enviar, aceptar, rechazar y cancelar solicitudes;
  - `POST /api/spaces/:id/shares` ahora exige que el usuario destino sea amigo aceptado;
  - sidebar agrega seccion `Amigos` con envio por correo exacto, lista de amigos y solicitudes enviadas;
  - header agrega campanita con solicitudes pendientes y acciones aceptar/rechazar;
  - modal `Compartir espacio` lista y filtra solo amigos aceptados;
  - ADR 0028 documenta la decision.
- Validaciones:
  - `backend/npm run prisma:generate`;
  - `backend/npm run build`;
  - `backend/npm run prisma:migrate:deploy`;
  - `backend/npx prisma migrate status`;
  - `npm run lint`;
  - `npm run build`.
- Despliegue: incluido en despliegue de produccion 2026-06-24.
- Commit: pendiente.

### 2026-06-24 - Espacios compartidos con usuarios existentes

- Objetivo: permitir compartir un espacio y sus hojas con otros usuarios sin exponer todo el workspace.
- Cambios:
  - nuevo modelo `SpaceShare` con roles `VIEWER` y `EDITOR`;
  - permisos heredados para espacio, subespacios y hojas;
  - APIs para listar compartidos, gestionar personas y buscar usuarios existentes;
  - `PageView` respeta modo lectura para viewers;
  - sidebar agrega `Compartir` y seccion `Compartidos conmigo`;
  - ADR 0027 documenta la decision.
- Validaciones:
  - backend build;
  - frontend build y lint;
  - migracion local aplicada;
  - prueba API local: viewer lee y recibe `403` al editar; editor edita y crea subespacio; al quitar acceso recibe `403`.
- Despliegue: pendiente.
- Commit: pendiente.

### 2026-06-20 - Continuidad entre laptops y despliegue documentado

- Objetivo: permitir clonar, continuar y desplegar el proyecto desde otra laptop sin versionar secretos.
- Cambios:
  - se creo una guia unica de GitHub, entorno local, SSH, produccion, backups, migraciones, health checks y rollback;
  - se documentaron las rutas y servicios reales de produccion;
  - README, guia de laptop nueva y contexto de agentes enlazan el nuevo procedimiento;
  - `.gitignore` protege archivos `.env` generales y conserva las plantillas versionadas.
- Validaciones:
  - `npm run lint`;
  - `npm run build`;
  - `backend/npm run build`;
  - `backend/npm run prisma:migrate:deploy`, sin migraciones pendientes;
  - acceso SSH por llave y servicios `gestion-tareas-backend`/Nginx activos;
  - health checks local del servidor y publico con respuesta `200`;
  - revision de diff y escaneo documental sin secretos.
- Despliegue: no aplica; cambio local documental.
- Commit principal: `25d9423`.

### 2026-06-18 - Correccion de escritura rapida en titulos

- Objetivo: respetar escritura rapida y permitir titulos vacios sin solicitudes por caracter.
- Cambios:
  - callbacks de cache y autoguardado estabilizados entre renders;
  - la limpieza del efecto deja de ejecutar `flush` por cada tecla;
  - respuestas anteriores ya no reemplazan el titulo local que sigue editandose;
  - el backend acepta titulo vacio en actualizaciones;
  - `Pagina sin titulo` queda como placeholder y etiqueta visual, no como valor forzado.
- Validaciones:
  - frontend build y lint;
  - backend build;
  - API local y produccion confirman que el titulo vacio se persiste como `""`;
  - web y backend responden `200`;
  - `config.js` preservado y cero copias automaticas del chunk.
- Despliegue: publicado en `agenda.martinnauca.com` el 2026-06-18; backend y frontend actualizados.
- Commit: `f3c3bff`.

### 2026-06-18 - Rendimiento de hojas y almacenamiento aislado

- Objetivo: eliminar la lentitud al escribir y evitar cargar o copiar contenido pesado innecesariamente.
- Cambios:
  - API separada entre metadatos de paginas y detalle completo;
  - caches TanStack Query `pages/workspace` y `page/id`;
  - `gt_workspace_pages` reducido a metadatos;
  - autoguardado de texto a 800 ms con cola serial, borrador temporal e indicador visual;
  - snapshot de pizarra generado una vez tras 1.5 segundos de inactividad;
  - diagramas y paginas actualizan solamente su cache aislada;
  - listado de workspaces restringido nuevamente a membresias, incluido el administrador;
  - ADR 0026 y documentacion operativa actualizados.
- Validaciones:
  - frontend build y lint;
  - backend build;
  - prueba local de API: listado de 32 paginas reducido de 619625 a 6648 bytes (98.93%);
  - detalle conserva contenido, `PATCH` responde sin contenido y persiste correctamente;
  - listado de workspaces coincide con las membresias del usuario;
  - produccion: listado de 34 paginas reducido de 4685774 a 7089 bytes;
  - prueba de humo `POST/PATCH/GET/DELETE` exitosa;
  - jerarquia `Relampago -> Repaso -> prueba` y contenido conservados;
  - web y backend responden `200`;
  - monitor idempotente ejecutado dos veces sin crear copias de chunks.
- Despliegue:
  - backend compatible publicado antes que el frontend;
  - frontend publicado preservando exactamente `config.js`;
  - no se modifico `TLDRAW_LICENSE_KEY`;
  - respaldo PostgreSQL `gestion_tareas_before_page_performance_20260618225820.dump`;
  - politica aplicada: 2 releases, 1 rollback frontend, 1 rollback backend y 3 respaldos PostgreSQL;
  - limpieza de copias y respaldos antiguos libero aproximadamente 2.98 GB;
  - monitor temporal activo cada cinco minutos hasta el 2026-06-19 23:04, hora de Lima.
- Commits: `57680df`, `55c4258` y `fd447d8`.

### 2026-06-18 - Bitacora continua obligatoria

- Objetivo: mantener un historial legible de todo cambio futuro y facilitar la continuidad entre chats, agentes y desarrolladores.
- Cambios:
  - se convirtio este documento en una bitacora viva;
  - se definio una plantilla minima para nuevas entradas;
  - se agrego en `AGENTS.md` la obligacion de leer y actualizar la bitacora.
- Validaciones: revision documental y comprobacion de enlaces existentes desde README.
- Despliegue: incorporado al repositorio junto con la mejora de rendimiento.
- Commit: `57680df`.

### 2026-06-18 - Profundidad visual de tarjetas Kanban

- Objetivo: separar visualmente las tarjetas de tareas del fondo sin generar movimiento incomodo.
- Cambios:
  - borde de tarjeta aumentado a `slate-300`;
  - sombra ligera `0 2px 6px`;
  - hover sin desplazamiento vertical y con sombra moderada.
- Validaciones: `npm run build` y `npm run lint`.
- Despliegue: publicado en `agenda.martinnauca.com`; frontend respaldado y `config.js` preservado.
- Commit: `12cbd3d`.

### 2026-06-18 - Workspaces personales y proyectos normalizados

- Objetivo: separar workspace y proyecto, consolidar los datos de Martin y preparar colaboración futura.
- Cambios:
  - entidad PostgreSQL `Project`;
  - relación segura entre tareas, proyectos y workspace;
  - `personalWorkspaceId` para usuarios;
  - API y cache compartida de proyectos;
  - archivado y restauración de proyectos;
  - acceso administrativo mediante `Ver workspace`;
  - registro público desactivado;
  - placeholders vacíos para proyecto, prioridad y etiqueta;
  - consolidación de los workspaces históricos de Martin.
- Validaciones:
  - frontend build y lint;
  - backend build;
  - Prisma validate y migrate status;
  - pruebas de permisos `200/403`;
  - auditoría sin proyectos inválidos.
- Despliegue:
  - publicado en producción;
  - Martin conserva 20 espacios, 28 páginas, 15 tareas y 7 proyectos;
  - los workspaces huérfanos permanecen aislados;
  - respaldo PostgreSQL: `gestion_tareas_before_projects_20260618205546.dump`.
- Commits: `f650c81` y `a6c6a1f`.

## Historial anterior

Fecha de cierre de la etapa anterior: 2026-06-07

## Resumen

GESTION_TAREAS quedo recuperado como una aplicacion de productividad tipo workspace. No es CMS, carteleria digital, TV Live ni un sistema relacionado con pantallas o dispositivos.

El proyecto actual combina frontend React con backend Express, Prisma y PostgreSQL. La data local historica fue analizada, sanitizada, fusionada y validada en PostgreSQL antes de preparar el trabajo para continuar desde otra laptop.

## Estado inicial retomado

- Existia una SPA frontend con React, Vite, TypeScript, Tailwind CSS y React Router.
- Existia un backend inicial en `backend/` con Express, Prisma y PostgreSQL.
- La aplicacion usaba localStorage como fuente principal para varias entidades del frontend.
- Habia datos historicos en backups JSON locales y datos actuales en el navegador.
- La carpeta de migraciones Prisma tenia una migracion parcial, pero no una migracion inicial completa.

## Correcciones de estabilizacion

- Se corrigio el error de lint detectado en el backend sin cambiar el login.
- Se revisaron textos con encoding roto y se corrigieron casos visibles cuando correspondia.
- Se validaron builds de frontend y backend durante las fases de estabilizacion.

## Prisma y PostgreSQL

- Se reviso `backend/prisma/schema.prisma`.
- Se confirmaron los modelos principales:
  - `User`
  - `Workspace`
  - `WorkspaceMember`
  - `Space`
  - `Page`
  - `Task`
  - `TaskSettings`
- Se reemplazo la migracion parcial por una migracion inicial reproducible: `20260607_initial_schema`.
- Se agrego el script `prisma:migrate:deploy` para produccion o bases limpias.
- Se valido que una base PostgreSQL limpia pueda crearse usando migraciones.

## Backups, sanitizacion y fusion

- Se reviso el backup anterior local.
- Se reviso el JSON exportado desde el navegador actual.
- Se detecto que el JSON nuevo era la fuente mas reciente.
- Se creo una copia sanitizada sin `gt_auth_token` ni tokens JWT-like.
- Se preparo una fusion conservadora:
  - el backup actual manda,
  - paginas existentes en ambos conservan la version actual,
  - paginas solo antiguas se rescatan,
  - tareas solo antiguas se rescatan,
  - pizarras tldraw antiguas se conservan si no existian en el backup actual.
- Se genero el backup fusionado sanitizado:
  - `backups-locales/gestion-tareas-backup-fusionado-2026-06-07.sanitized.json`
- Ese archivo no se debe subir a GitHub. Debe copiarse manualmente entre equipos si se necesita restaurar data.

## Dataset validado

El dataset fusionado original quedo validado con estos conteos:

- workspaces: 4
- spaces: 17
- pages: 33
- tasks: 12
- settings: 4

Tipos de pagina del backup fusionado original:

- TEXT: 11
- BOARD: 17
- DATABASE: 2
- BLANK: 3

Estado local vigente decidido el 2026-06-08:

- pages: 32
- DATABASE: 1
- `page-eb526578` - Nuevo diagrama BD no se restaura por decision manual.
- No se debe tratar esa pagina como dato faltante en la base local actual.

Paginas rescatadas relevantes:

- `page-40714fb0` - Nueva pizarra
- `page-dbe4cfcf` - Nuevo diagrama BD
- `page-b52f65c4` - Nueva pizarra
- `page-96356da8` - Contexto -Alcances

Tarea rescatada:

- `1778729855344` - SDafa

## Importador de backup

- Se reviso `backend/scripts/import-local-backup.ts`.
- Se ajusto para soportar formatos de backup viejo y nuevo.
- Se valido importando el backup fusionado en una base limpia de prueba.
- Se confirmo que paginas, tareas, settings y contenido JSON/tldraw se importan correctamente.

## Backend/API

- Se valido lectura por API con el dataset fusionado.
- Se valido escritura por API usando datos dummy de prueba.
- Se probaron endpoints reales de:
  - auth
  - users
  - workspaces
  - spaces
  - pages
  - tasks
  - task-settings
- Se confirmo login local con el usuario restaurado desde datos locales.
- Se confirmo que las paginas rescatadas y la tarea `SDafa` son visibles por API.

## Entorno local real

- Se respaldo la base local `gestion_tareas` antes de completar datos.
- Se comparo la base local contra el backup fusionado.
- Se insertaron solo los datos faltantes, sin reemplazar ni borrar datos existentes.
- Se confirmaron conteos finales originales:
  - users: 1
  - workspaces: 4
  - spaces: 17
  - pages: 33
  - tasks: 12
  - settings: 4
- El 2026-06-08 se decidio conservar la base local con 32 paginas y 1 pagina `DATABASE`, sin restaurar `page-eb526578`.
- Se valido que `_prisma_migrations` estuviera coherente.
- Se marco `20260607_initial_schema` como aplicada solo despues de confirmar que el schema real coincidia.
- Se valido backend, frontend, login, navegacion, recarga y rutas principales.

## CORS simple

- Se simplifico CORS en backend.
- Se elimino el uso de `CORS_ORIGIN`.
- La configuracion actual permite cualquier origen:
  - `origin: '*'`
  - metodos `GET`, `POST`, `PUT`, `PATCH`, `DELETE`, `OPTIONS`
  - headers `Content-Type`, `Authorization`
- Se valido `OPTIONS /api/auth/login` y `POST /api/auth/login`.

## Layout de Ajustes

- Se reorganizo `Ajustes` con un sidebar interno.
- Rutas internas agregadas:
  - `/ajustes/seguridad`
  - `/ajustes/usuarios`
  - `/ajustes/roles`
  - `/ajustes/proyectos`
  - `/ajustes/responsables`
  - `/ajustes/etiquetas`
  - `/ajustes/prioridades`
  - `/ajustes/estados`
  - `/ajustes/exportar`
- `/ajustes` redirige a `/ajustes/seguridad`.
- `Usuarios` y `Roles y permisos` quedaron como placeholders visuales, sin logica real de backend.
- Se conservaron:
  - seguridad de cuenta,
  - proyectos,
  - responsables,
  - etiquetas,
  - prioridades,
  - estados,
  - exportacion de datos.

## Mejoras de distribucion visual

- Se agrego soporte para alinear `PageContainer` al inicio sin romper el comportamiento anterior.
- Se aplico `align="start"` en:
  - Ajustes
  - Inicio
  - Archivo
- Se agrego `size="fluid"` a `PageContainer`.
- Solo `Inicio` usa `size="fluid"` para aprovechar mejor pantallas grandes.
- No se cambio la identidad visual: colores, tarjetas, bordes, tipografia e iconos se mantienen.

## Estado actual

El proyecto queda listo para continuar desde otra laptop:

- frontend compila,
- backend compila,
- lint pasa,
- PostgreSQL local fue validado,
- migraciones Prisma son reproducibles,
- dataset fusionado esta probado,
- la guia de instalacion nueva indica como restaurar el entorno sin subir backups sensibles.

## Pendientes recomendados

1. Implementar gestion real de usuarios y roles en backend/frontend.
2. Completar migracion gradual de tareas/settings/frontend desde localStorage hacia API.
3. Definir estrategia final para tldraw: IndexedDB local, `Page.content` o sincronizacion hibrida.
4. Preparar despliegue en servidor con PostgreSQL limpio, `prisma migrate deploy`, PM2 y Nginx.
5. Revisar `SubspaceView` y `TextPage` para decidir si deben usar layout alineado o de documento.
6. Revisar bundle splitting para dependencias grandes como tldraw si se vuelve necesario.

## Limpieza de contexto externo

El 2026-06-08 se decidio que GESTION_TAREAS es un proyecto personal y no debe conservar nombres ni flujos heredados de otro contexto. Los roles tecnicos finales son:

- `admin`
- `usuario`

El acceso queda como login simple con correo, contrasena y JWT.
