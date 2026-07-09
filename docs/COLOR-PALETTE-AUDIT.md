# Auditoria de paleta visual

Fecha: 2026-07-05

Alcance: inspeccion local del codigo versionado. Se excluyeron `node_modules`, `dist`,
`backups-locales` y backups generados bajo `backend/backups` para que las metricas
representen la interfaz actual y no artefactos externos. No se modifico ningun estilo.

## 1. Resumen de la identidad visual actual

La app privada tiene una estetica clara, operativa y tipo workspace: fondo general
calido `#F7F6F3`, superficies blancas, bordes grises suaves, sombras discretas,
texto gris oscuro y una accion principal indigo-violeta `#6472EB` con hover
`#5360D8`. La sensacion general es cercana a Notion: mucho blanco, bajo contraste
decorativo, estados por chips pastel y navegacion lateral discreta.

La pantalla publica de login es una excepcion visual importante. Usa una portada
fotografica, overlays negros, fondo `#f5f5f7`, foco teal/cyan y boton `teal-600`,
por lo que no comparte la identidad indigo dominante de la app privada.

El sistema mezcla tres fuentes de estilo:

- Variables propias en `src/index.css`: `--color-bg-app`, `--color-text-primary`,
  `--color-border`, etc.
- Tokens shadcn/Tailwind v4 en OKLCH: `--background`, `--card`, `--popover`,
  `--primary`, `--destructive`, etc.
- Valores directos en TSX/TS: `#6472EB`, `#5360D8`, `#FEE2E2`, clases `gray`,
  `slate`, `indigo`, `amber`, `red`, estilos inline y colores dinamicos.

Metricas de rastreo:

- Valores fisicos unicos (`hex`, `rgb/rgba`, `hsl/hsla`, `oklch`): 84.
- Tokens cromaticos unicos incluyendo clases Tailwind, variables y estados: 315.
- Ocurrencias fisicas hardcodeadas: 474.
- Archivos con estilos o tokens cromaticos: 46.
- Archivos con colores fisicos hardcodeados: 34.

## 2. Paleta principal detectada

| Color | Formato | Uso principal | Componentes donde aparece | Frecuencia aproximada |
| --- | --- | --- | --- | --- |
| `#6472EB` | HEX | Identidad principal: CTA, badges, iconos por defecto, seleccion | `Sidebar`, `DashboardPage`, `CalendarPage`, `FriendsPage`, `AjustesPage`, `Header`, backend defaults | Muy alta: 87 tokens/ocurrencias combinadas; 37 fisicas |
| `#5360D8` | HEX | Hover de CTA principal | `Sidebar`, `Header`, `UserMenu`, `AjustesPage`, `CalendarPage`, `FriendsPage`, `TimeReportPage`, `PageView` | Alta: 16 |
| `#F7F6F3` | HEX | Fondo app privada, header | `index.css`, `AppLayout`, `Header`, `DashboardPage`, `CalendarPage` | Media |
| `#FFFFFF` / `bg-white` / `white` | HEX/Tailwind/nombre | Superficies, cards, modales, tablas, popovers | Casi todas las pantallas privadas | Muy alta |
| `#111827` / `text-gray-900` | HEX/Tailwind | Texto principal | `index.css`, `TextPage`, titulos, inputs | Muy alta |
| `#6B7280` / `text-gray-500` | HEX/Tailwind | Texto secundario | Header, cards, formularios, listas | Muy alta |
| `#9CA3AF` / `text-gray-400` | HEX/Tailwind | Texto tenue, labels, placeholders, iconos secundarios | Practicamente todas las pantallas | Muy alta; clase mas repetida |
| `#E5E7EB` / `border-gray-200` | HEX/Tailwind | Borde base y divisores | Cards, inputs, tablas, calendario, sidebar | Muy alta |
| `#F3F4F6` / `bg-gray-100` | HEX/Tailwind | Fondo muted, nav activo, headers de tabla | Sidebar, tablas, estados, cards | Alta |
| `#F9FAFB` / `bg-gray-50` | HEX/Tailwind | Fondo suave alterno, hovers, celdas | Tablas, inputs, cards, modales | Alta |
| `#64748B` | HEX | Fallback de proyecto/prioridad baja | `DashboardPage`, `CalendarPage`, `taskSettings`, utils | Alta: 25 |
| `#10B981` | HEX | Exito/completado, proyecto personal | Inicio, task settings, estados | Media |
| `#F59E0B` | HEX | Advertencia/pendiente/media | Inicio, task settings, estados, iconos | Media-alta |
| `#EF4444` / `red-*` | HEX/Tailwind | Error, borrar, alta | Sidebar, Dashboard, Ajustes, TimeInput | Media |
| `#3B82F6` | HEX | Informacion/progreso | Inicio, task settings | Media |
| `#EEF2FF` | HEX | Fondo indigo suave | Inicio, Kanban cards, reporte export, swatches | Media |
| `#FEE2E2` | HEX | Fondo rojo suave para prioridad alta/error | Prioridades, chips, swatches | Media |
| `#FEF3C7` | HEX | Fondo amber suave para prioridad media/pendiente | Prioridades, Inicio, swatches | Media |
| `#F1F5F9` / `slate-50` | HEX/Tailwind | Fondo slate suave, prioridad baja | Ajustes, prioridades, paneles | Media |
| `oklch(...)` | OKLCH | Tokens shadcn claro/oscuro | `src/index.css`, UI base | Media |

## 3. Paleta organizada por funcion

### Fondos generales

- App privada: `#F7F6F3`, `var(--color-bg-app)`, `bg-[#F7F6F3]`.
- Header privado: `#F7F6F3` con borde `#E8E7E3`.
- Login: `#f5f5f7`, imagen de portada, `bg-black/40`,
  `bg-gradient-to-t from-black/45 via-black/10 to-black/20`.
- Pizarras: tldraw controla el fondo internamente.
- Diagrama BD: `bg-white` para canvas shell, `bg-gray-50` en panel lateral.

### Superficies

- Superficie base: `bg-white`, `#FFFFFF`, `--card: oklch(1 0 0)`.
- Superficie muted: `bg-gray-50`, `bg-slate-50`, `#F9FAFB`, `#F3F4F6`.
- Popovers: `bg-popover`, `text-popover-foreground`, `ring-foreground/10`
  en `src/components/ui/popover.tsx`.
- Modales: `bg-white`, overlay `bg-black/20` o `bg-black/25`.

### Tarjetas

- Cards generales: `bg-white`, `border-gray-200`, `shadow-sm`.
- Inicio: card propia con `border: 1px solid #E5E7EB` y
  `boxShadow: 0 1px 3px rgba(0,0,0,0.05)`.
- Kanban: `border-slate-300`, `bg-white`, sombra
  `rgba(15,23,42,0.08)`, hover `border-slate-400`.
- Ajustes: cards de proyecto/responsable con `border-gray-200`, `bg-white`,
  hover shadow `rgba(0,0,0,0.07)`.
- Archivo/Amigos/Reporte: cards con `rounded-xl`/`rounded-2xl`,
  `border-gray-200`, `bg-white`, `shadow-sm`.

### Textos

- Principal: `#111827`, `text-gray-900`, `text-slate-950`.
- Secundario: `#6B7280`, `text-gray-500`, `text-slate-500`.
- Tenue: `#9CA3AF`, `text-gray-400`, `text-slate-400`.
- Blanco: `text-white` en CTA y hero login.
- Error: `text-red-600`, `text-red-500`, `#B91C1C`.
- Marca/accion: `#6472EB`, `text-[#6472EB]`, `text-indigo-600`.

### Bordes

- Base: `#E5E7EB`, `border-gray-200`, `border-slate-200`.
- Divisores mas suaves: `border-gray-100`, `divide-gray-100`, `#F3F4F6`.
- Input focus: `focus:border-gray-300`, `focus:ring-gray-200/60`.
- Focus legacy/seleccion: `focus-visible:border-indigo-500`,
  `focus-visible:ring-indigo-500/15`.
- Calendario seleccionado: `ring-[#6472EB]/40`.
- Error input: `border-red-200`, `focus:border-red-300`,
  `focus:ring-red-100`.

### Acciones principales

- CTA dominante privado: `bg-[#6472EB] text-white hover:bg-[#5360D8]`.
- CTA alterno panel tarea: `bg-indigo-600 hover:bg-indigo-700`.
- CTA login: `bg-teal-600 hover:bg-teal-700`, `focus:border-teal-500`.
- Acciones destructivas: `bg-red-600 hover:bg-red-700`, `text-red-600`,
  `hover:bg-red-50`.
- Acciones secundarias: `border-gray-200 bg-white text-gray-600
  hover:bg-gray-50 hover:text-gray-900`.

### Estados

- Exito: `#10B981`, `#D1FAE5`, `#065F46`, `text-emerald-600`,
  `bg-emerald-50`, `bg-emerald-100`.
- Advertencia: `#F59E0B`, `#FEF3C7`, `#92400E`, `amber-50`,
  `amber-200`, `amber-600`, `amber-900`.
- Error/destructivo: `#EF4444`, `#FEE2E2`, `#B91C1C`, `red-50`,
  `red-500`, `red-600`, `red-700`.
- Informacion/progreso: `#3B82F6`, `#DBEAFE`, `#1D4ED8`,
  `indigo-50`, `indigo-600`.

### Categorias

Versionadas en codigo:

- `Personal`: `#10B981` en `src/data/workspaces.ts`.
- `Trabajo 1`: `#6472EB` / `#6366f1`.
- `Trabajo 2`: `#10b981`.
- `Diseño`: fondo `#DBEAFE`, texto `#1D4ED8`.
- `Reunion`: fondo `#EDE9FE`, texto `#5B21B6`.
- `Desarrollo`: fondo `#D1FAE5`, texto `#065F46`.
- `Finanzas`: fondo `#FEF3C7`, texto `#92400E`.
- `General`: fondo `#F3F4F6`, texto `#374151`.

No se detectaron en el codigo versionado categorias `ODOO`, `Casa` ni `Repasar`.
Si existen en la app real, probablemente viven en PostgreSQL/localStorage como
datos de usuario y heredan la misma mecanica de proyectos/etiquetas.

### Prioridades

- Alta: `#FEE2E2` + `#B91C1C`; tambien `#ef4444` como selector/fallback.
- Media: `#FEF3C7` + `#92400E`; tambien `#f59e0b`.
- Baja: `#F1F5F9` + `#64748B`; tambien `#64748b`.

### Kanban

- Fondo de vista: `#F7F6F3`.
- Columnas: contenedor transparente; drop activo `bg-indigo-50/80`
  y `ring-indigo-200`.
- Tarjetas: colores seleccionables `#FFFFFF`, `#EEF2FF`, `#ECFDF5`,
  `#FEF3C7`, `#FEE2E2`, `#F5F3FF`, `#F1F5F9`.
- Borde tarjeta: `border-slate-300`; hover `border-slate-400`.
- Sombra tarjeta: `0 2px 6px rgba(15,23,42,0.08)`; hover
  `0 3px 8px rgba(15,23,42,0.10)`.
- Chips de proyecto/etiqueta/prioridad: fondo color con alpha (`14`, `1F`),
  borde con alpha (`24`, `33`) y texto saturado.

### Formularios

- Inputs privados: `bg-white`, `border-gray-200`, `text-gray-800/900`,
  `placeholder:text-gray-300/400`, `caret-gray-900`, focus gris
  `border-gray-300 + ring-gray-200/60`.
- Inputs login: `bg-transparent`, `border-slate-200`, focus teal,
  `focus:bg-white`.
- Invalidos: `TimeInput` usa `border-red-200 bg-red-50 text-red-700`.
- Selects: `TaskSelect` usa `bg-white`, `border-gray-200`,
  `focus-visible:border-indigo-500`, popup `shadow-xl shadow-gray-900/10`.

### Modales y elementos flotantes

- Overlay: `bg-black/20` o `bg-black/25`.
- Modal shell: `bg-white`, `border-gray-200`, `shadow-xl`.
- Popover base: `bg-popover`, `text-popover-foreground`, `ring-foreground/10`.
- Menus contextuales custom: `fixed`, `bg-white`, `border-gray-200`,
  `shadow-xl`, opciones `hover:bg-gray-100`, destructivas `hover:bg-red-50`.

## 4. Patrones visuales encontrados

- Fondo calido de app + superficie blanca + borde gris azulado.
- Boton principal indigo `#6472EB` + texto blanco + hover `#5360D8`.
- Cards operativas blancas + `border-gray-200` + `shadow-sm`.
- Chips pastel: fondo claro del color, borde del mismo color con alpha,
  texto saturado.
- Estados de navegacion: default gris, hover `gray-100`, activo `nav-active`
  con `--color-accent-light` y `--color-accent`.
- Inputs: blanco o transparente, borde gris, focus gris claro; algunos
  selects usan focus indigo.
- Destructivo: texto rojo + hover rojo claro; confirmacion destructiva usa
  boton rojo solido.
- Empty states: borde dashed gris, icono gris claro, texto gris tenue.
- Popovers/dropdowns: superficie blanca/popover, borde/ring tenue, sombra
  media.
- Exportaciones de reporte: paleta paralela embebida en HTML/PDF que replica
  indigo, grises y verde de precio.

## 5. Colores duplicados o equivalentes

- Blanco aparece como `#FFFFFF`, `#ffffff`, `white`, `bg-white`,
  `oklch(1 0 0)` y `--card`.
- Texto principal aparece como `#111827`, `text-gray-900`,
  `text-slate-950`, `oklch(0.145 0 0)` y `var(--color-text-primary)`.
- Texto secundario aparece como `#6B7280`, `text-gray-500`,
  `text-slate-500`, `oklch(0.556 0 0)` y `var(--color-text-secondary)`.
- Texto tenue aparece como `#9CA3AF`, `text-gray-400`,
  `text-slate-400`, `text-muted-foreground` y `var(--color-text-muted)`.
- Borde base aparece como `#E5E7EB`, `border-gray-200`,
  `border-slate-200`, `oklch(0.922 0 0)`, `border-border`.
- Fondo muted aparece como `#F3F4F6`, `bg-gray-100`, `bg-muted`,
  `oklch(0.97 0 0)`.
- Fondo app aparece como `#F7F6F3`, `bg-[#F7F6F3]`,
  `var(--color-bg-app)` y estilos inline.
- Marca principal aparece como `#6472EB`, `bg-[#6472EB]`,
  `text-[#6472EB]`, `#6366f1`, `text-indigo-600`, `#4F46E5`.
- Verde de exito aparece como `#10B981`, `#10b981`,
  `text-emerald-600`, `#047857`, `#065F46`.
- Rojo de peligro aparece como `#EF4444`, `#ef4444`,
  `text-red-600`, `bg-red-600`, `#B91C1C`.

## 6. Colores hardcodeados

Archivos con mas ocurrencias fisicas:

| Archivo | Ocurrencias | Notas |
| --- | ---: | --- |
| `src/index.css` | 76 | Variables propias y tokens shadcn claro/oscuro OKLCH. |
| `src/pages/InicioPage.tsx` | 58 | Estados, avatars, charts, cards con inline styles. |
| `src/pages/DashboardPage.tsx` | 49 | Kanban, chips dinamicos, tablas, sombras. |
| `src/data/taskSettings.ts` | 39 | Defaults de proyectos, responsables, etiquetas, prioridades y estados. |
| `src/pages/AjustesPage.tsx` | 37 | Swatches, chips, cards y CTAs. |
| `src/components/Sidebar/Sidebar.tsx` | 36 | Marca, swatches de iconos, modales/menus. |
| `src/components/TaskSettingFormModal/TaskSettingFormModal.tsx` | 33 | Paleta duplicada de Ajustes. |
| `src/data/mockHome.ts` | 24 | Paleta antigua de dashboard/mock. |
| `src/pages/TimeReportPage.tsx` | 23 | UI + HTML Excel + PDF jsPDF. |
| `src/pages/CalendarPage.tsx` | 22 | Filtros, seleccion, tareas por proyecto. |

Lineas representativas:

- `src/index.css:12-26`: define `--color-accent`, textos, fondos y borde
  en HEX.
- `src/index.css:152-217`: define tokens shadcn claro/oscuro en OKLCH.
- `src/components/Sidebar/Sidebar.tsx:98-106`: paleta de iconos de espacios.
- `src/components/Sidebar/Sidebar.tsx:747`: logo GT usa `bg-[#6472EB]`.
- `src/components/Sidebar/Sidebar.tsx:1642`, `1783`, `1873`: botones
  usan `bg-[#6472EB] hover:bg-[#5360D8]`.
- `src/components/Sidebar/Sidebar.tsx:1758-1759`, `1851-1852`: swatch
  seleccionado usa `#111827` y `rgba(17, 24, 39, ...)`.
- `src/components/Header/Header.tsx:195-196`: header hardcodea
  `#F7F6F3` y `#E8E7E3`.
- `src/components/Header/Header.tsx:126`, `151`: badge y boton de amistad
  con `#6472EB`.
- `src/components/Header/UserMenu.tsx:141`, `273`: avatar fallback y boton
  de avatar con `#6472EB`.
- `src/pages/DashboardPage.tsx:94-100`: colores seleccionables de tarjetas.
- `src/pages/DashboardPage.tsx:424-432`: tarjeta Kanban con sombra, borde
  y fondo inline.
- `src/pages/DashboardPage.tsx:458`: swatch seleccionado usa `#4F46E5`.
- `src/pages/DashboardPage.tsx:1029`: fondo de vista `#F7F6F3`.
- `src/pages/DashboardPage.tsx:1143`: boton Nuevo usa `#6472EB/#5360D8`.
- `src/pages/DashboardPage.tsx:1225`, `1251`, `1285`: tabla con bordes y
  fondos inline.
- `src/pages/CalendarPage.tsx:224`: fondo `#F7F6F3`.
- `src/pages/CalendarPage.tsx:257`, `278`, `300`, `366`, `375`: filtros,
  seleccion y dia actual con `#6472EB`.
- `src/pages/CalendarPage.tsx:460-462`: prioridad fallback `#F1F5F9`,
  `#64748B`.
- `src/pages/AjustesPage.tsx:30-31`: `COLORS` y `SOFT_COLORS`.
- `src/pages/AjustesPage.tsx:73-85`: logica especial de prioridad.
- `src/pages/AjustesPage.tsx:209`: hover shadow `rgba(0,0,0,0.07)`.
- `src/pages/AjustesPage.tsx:432`, `539`: CTAs `#6472EB/#5360D8`.
- `src/components/TaskSettingFormModal/TaskSettingFormModal.tsx:7-29`:
  paleta duplicada de Ajustes.
- `src/components/TaskSettingFormModal/TaskSettingFormModal.tsx:205`:
  outline seleccionado `#1c1917`.
- `src/pages/InicioPage.tsx:18-48`: avatars, urgencias, prioridades y
  status dots.
- `src/pages/InicioPage.tsx:272`, `399`, `427`: cards/chart/activity con
  colores inline.
- `src/pages/LoginPage.tsx:33`: SVG divider `fill="#f5f5f7"`.
- `src/pages/LoginPage.tsx:98`, `109`: fondos `bg-[#f5f5f7]`.
- `src/pages/TimeReportPage.tsx:285-363`: CSS embebido para Excel.
- `src/pages/TimeReportPage.tsx:443-549`: colores RGB para PDF.
- `src/pages/TextPage.tsx:23`: paleta de color de Tiptap.
- `src/pages/DatabaseDiagramPage.tsx:104`: nodo seleccionado usa
  `#6472EB` y `ring-[#6472EB]/15`.
- `backend/prisma/schema.prisma:89`, `105`, `136`: defaults de color
  `#6472EB`.
- `backend/src/modules/task-settings/task-settings.defaults.ts:17-30`:
  defaults que deben coincidir con frontend.

## 7. Inconsistencias

- Identidad principal no es unica: `#6472EB`, `#6366f1`, `#4F46E5`,
  `indigo-600` y `oklch` `--primary` cumplen roles cercanos.
- `LoginPage` usa teal/cyan y una composicion editorial con imagen; la app
  privada usa indigo, grises y estilo operativo.
- `TaskDetailPanel` guarda con `bg-indigo-600 hover:bg-indigo-700`, mientras
  la mayoria de CTAs usan `#6472EB/#5360D8`.
- `button-variants.ts` usa tokens shadcn (`bg-primary`) que hoy son casi
  negros en light mode, pero gran parte de la app no usa ese Button para CTAs.
- `Header` y `AppLayout` declaran variables/fondos de forma distinta:
  `Header` hardcodea `#F7F6F3`, mientras `AppLayout` usa `var(--color-bg-app)`.
- `TaskSelect` usa focus indigo, pero la mayoria de inputs usa focus gris.
- `AjustesPage` y `TaskSettingFormModal` duplican arrays `COLORS`/`SOFT_COLORS`
  y funciones de prioridad.
- `InicioPage`, `data/mockHome.ts`, `data/taskSettings.ts` y backend defaults
  repiten mapas de estado/prioridad con pequeñas variaciones.
- `DashboardPage` tiene tabla con estilos inline y Kanban con Tailwind, por lo
  que tabla/lista y cards no comparten tokens.
- Reporte de horas tiene una paleta embebida para Excel/PDF que puede quedar
  fuera de sincronizacion con UI.
- `ArchivePage` usa amber para tareas archivadas; espacio archivado usa gris.
  Funcionalmente tiene sentido, pero no esta tokenizado.
- Variables `.dark` ya existen para shadcn, pero la app privada usa muchos
  hardcodes que no responderan a `.dark`.

## 8. Posibles tokens semanticos

Tokens base:

- `--background-app`
- `--background-page`
- `--surface`
- `--surface-muted`
- `--surface-subtle`
- `--surface-overlay`
- `--surface-popover`
- `--surface-card`
- `--surface-card-hover`
- `--text-primary`
- `--text-secondary`
- `--text-muted`
- `--text-placeholder`
- `--text-inverse`
- `--border`
- `--border-muted`
- `--border-strong`
- `--ring-focus`
- `--shadow-card`
- `--shadow-popover`
- `--shadow-panel`

Tokens de marca y accion:

- `--primary`
- `--primary-hover`
- `--primary-soft`
- `--primary-border`
- `--primary-foreground`
- `--action-secondary-bg`
- `--action-secondary-hover`
- `--action-danger`
- `--action-danger-hover`
- `--action-danger-soft`

Tokens de estado:

- `--success`
- `--success-soft`
- `--success-foreground`
- `--warning`
- `--warning-soft`
- `--warning-foreground`
- `--danger`
- `--danger-soft`
- `--danger-foreground`
- `--info`
- `--info-soft`
- `--info-foreground`

Tokens de dominio:

- `--priority-high-bg`
- `--priority-high-text`
- `--priority-medium-bg`
- `--priority-medium-text`
- `--priority-low-bg`
- `--priority-low-text`
- `--status-pending`
- `--status-progress`
- `--status-review`
- `--status-done`
- `--kanban-card-white`
- `--kanban-card-indigo`
- `--kanban-card-green`
- `--kanban-card-yellow`
- `--kanban-card-red`
- `--kanban-card-purple`
- `--kanban-card-slate`
- `--space-icon-default`
- `--project-fallback`
- `--chip-border-alpha`
- `--chip-bg-alpha`

Tokens especiales:

- `--login-background`
- `--login-primary`
- `--login-primary-hover`
- `--export-header`
- `--pdf-header`
- `--diagram-selected`
- `--tldraw-license-background` si se customiza entorno externo.

## 9. Mapa por componente

### Layout principal (`AppLayout`, `PageContainer`, `RouteFallback`)

- Fondo: `var(--color-bg-app)` / `#F7F6F3`.
- Texto: hereda `#111827`.
- Bordes: delegados a header/sidebar; warning admin usa `amber-50`,
  `amber-200`, `amber-900`.
- Hover: admin banner boton `hover:bg-amber-100`.
- Estados: `RouteFallback` usa `text-gray-500`.

### Sidebar

- Fondo: `var(--color-bg-sidebar)` (`#FFFFFF`).
- Texto: `var(--color-text-primary/secondary/muted)`, `text-gray-600`,
  `text-gray-400`.
- Bordes: `var(--color-border)`, `border-gray-200`.
- Active: `.nav-active` (`#F3F4F6` + `#4B5563`), no usa el indigo principal.
- Hover: `hover:bg-gray-100`, `hover:text-gray-800/900`.
- Iconos: default `space.iconColor ?? #6472EB`; swatches definidos en
  `SPACE_ICON_COLORS`.
- Modales/menus: overlay `bg-black/20`, card `bg-white`, border gris,
  shadow-xl, destructivo rojo.
- Focus: inputs `focus:border-gray-300 focus:ring-gray-200/60`.
- Disabled: botones comparten `disabled:opacity-50` cuando aplica.

### Header y menu de usuario

- Fondo: `#F7F6F3`, borde inferior `#E8E7E3`.
- Texto: variables `--color-text-*`, clases `gray`.
- Badge notificaciones: `bg-[#6472EB] text-white`.
- Avatar fallback: `bg-[#6472EB] text-white` en UserMenu; `bg-indigo-50
  text-indigo-600` en Header.
- Popovers: `PopoverContent` tokenizado, contenido usa grises y botones indigo.
- Hover: `hover:bg-gray-100`, `hover:bg-gray-50`, logout `hover:bg-red-50`.
- Disabled: subida avatar `disabled:opacity-50`.

### Inicio

- Fondo: `PageContainer` sobre app warm.
- Cards: `bg-white`, borde `#E5E7EB`, shadow `rgba(0,0,0,0.03/0.05)`.
- KPIs: iconos con fondos pastel `#EEF2FF`, `#D1FAE5`, `#DBEAFE`,
  `#FEF3C7`.
- Texto: `gray-900/800/500/400`.
- Chips: prioridad y urgencia usan `FEE2E2/FEF3C7/F1F5F9`.
- Chart: colores de proyecto y labels `#374151`, ticks `#6B7280/#9CA3AF`.
- Hover: filas `hover:bg-gray-50`.
- Empty: texto gris, sin iconografia fuerte.

### Mis tareas / Kanban / Lista

- Fondo: `#F7F6F3`.
- Header de vista: grises, filtro activo `#6472EB` suave.
- CTA: `#6472EB/#5360D8`.
- Kanban cards: paleta pastel, borde slate, sombras custom.
- Column drop active: `bg-indigo-50/80 ring-indigo-200`.
- Chips: fondos dinamicos con alpha; fallback `#64748B`.
- Hover: acciones aparecen con `opacity`, botones `bg-white/90`,
  `hover:bg-gray-50`, destructivo `red-50`.
- Lista: tabla `bg-white`, header `#F3F4F6`, border `#E5E7EB`,
  hover fila `gray-50`.
- Focus inline: ring indigo en titulo de tabla; selects usan TaskSelect.
- Disabled: no centralizado salvo botones de panel/modal.

### Panel lateral de tarea

- Fondo: panel `bg-white`; footer `bg-gray-50`; sin overlay visible.
- Borde: `border-l border-gray-200`, divisores `gray-100`.
- Sombra: `rgba(15,23,42,0.12)`.
- Texto: `gray-900`, `gray-800`, labels `gray-400`.
- Inputs: `TaskSelect`, `DatePicker`, textarea blanco con focus gris.
- CTA guardar: `bg-indigo-600 hover:bg-indigo-700`, inconsistente con
  `#6472EB`.
- Hover: cerrar/cancelar grises.

### Calendario

- Fondo: `#F7F6F3`.
- Grid: `bg-white`, headers `bg-gray-50`, borders `gray-200`.
- Dia seleccionado: `bg-[#6472EB]/5`, `ring-[#6472EB]/40`.
- Hoy: `bg-[#6472EB] text-white`.
- Tareas en dia: color de proyecto con alpha (`10`, `2E`).
- Panel lateral: `bg-white`, card tarea con border left por proyecto.
- Filtros: seleccionado `#6472EB` suave.
- Empty: dashed border, icono `gray-300`.

### Amigos

- Cards: `rounded-2xl border-gray-200 bg-white shadow-sm`.
- Titulo seccion: eyebrow `text-[#6472EB]`.
- Avatars fallback: `bg-indigo-50 text-indigo-600`.
- CTA: `#6472EB/#5360D8`.
- Inputs: borde gris, focus gris.
- Empty/message: `border-dashed border-gray-200`, `bg-gray-50`, texto gris.
- Destructivo: `text-red-500 hover:bg-red-50`.

### Ajustes

- Layout: `PageContainer wide`, paneles `bg-white`, `border-slate-200`,
  `shadow-sm`.
- Sidebar interno: item activo `bg-[#6472EB] text-white`; badges activos
  `bg-white/25`.
- Cards: proyecto/responsable con avatar colorido y hover shadow custom.
- Chips: labels/prioridades/status con fondo suave y borde por color.
- Formularios: `TaskSettingFormModal` con `bg-white`, inputs grises,
  swatches coloridos.
- CTA: `#6472EB/#5360D8`.
- Estados: seguridad usa emerald; errores red.

### Archivo y tareas archivadas

- Cards: `bg-white`, `border-gray-200`, `shadow-sm`.
- Empty: `border-dashed border-gray-300 bg-white/60`, iconos `gray-300`.
- Tareas archivadas: acento amber (`bg-amber-50`, `text-amber-600`,
  hover `amber-50/40`).
- Filtros: inputs/selects gris + focus indigo en search.
- Restore: boton secundario gris.

### Paginas de texto

- Toolbar: sticky `bg-white/90`, `border-gray-200`, `backdrop-blur`.
- Boton toolbar: default `text-gray-500`, hover `gray-100`, activo
  `bg-white text-gray-900 shadow-sm ring-gray-200`.
- Paleta Tiptap: `#111827`, `#6472EB`, `#0EA5E9`, `#10B981`,
  `#F59E0B`, `#EF4444`, `#EC4899`.
- Editor: texto `gray-800`, titulos `.prose-editor` `#111827`.
- Inputs titulo: transparente, texto `gray-900`, placeholder `gray-300`.

### Pizarras

- Contenedor: `h-full min-h-0`.
- UI visual principal: controlada por `tldraw/tldraw.css` y runtime tldraw.
- Licencia: key desde `public/config.js` o `VITE_TLDRAW_LICENSE_KEY`.
- Tema oscuro futuro: requiere revisar variables propias de tldraw, no solo
  Tailwind.

### Diagramas BD

- Canvas shell: `bg-white`.
- Toolbar: `bg-white`, `border-gray-200`.
- CTA: `#6472EB/#5360D8`.
- Nodo tabla: `bg-white`, header `bg-gray-50`, border `gray-200`,
  selected `border-[#6472EB] ring-[#6472EB]/15`.
- Handles: `!bg-gray-400`.
- Panel derecho: `bg-gray-50`, cards de campos `bg-white`.
- Destructivo: `hover:bg-red-50 hover:text-red-600`.

### Reporte de horas

- UI: cards blancas, bordes grises, sombras suaves, CTA indigo.
- Inputs: `inputClass` central en el archivo, focus gris.
- Tabla: header `bg-gray-50`, divisores `divide-gray-100`.
- TH: `bg-gray-50 text-gray-700`.
- Empty: texto gris.
- Excel/PDF: CSS/RGB embebidos con `#6472EB`, `#EEF2FF`, `#ECFDF5`,
  `#047857`, grises; no heredan tokens de UI.

### Componentes UI base

- `TaskSelect`: blanco, borde gris, shadow sutil, focus indigo, popup blanco
  con `shadow-xl`; selected check `text-indigo-600`.
- `Popover`: usa tokens shadcn `bg-popover`, `text-popover-foreground`,
  `ring-foreground/10`.
- `DatePicker/Calendar`: usa `bg-background`, `bg-muted`, `bg-primary`,
  `text-primary-foreground`, `ring-ring/50`.
- `TimeInput`: transparente, focus gris, invalid rojo.
- `Button`: usa shadcn tokens; su `default` es `bg-primary`, que hoy no
  equivale al indigo de producto.

## 10. Recomendaciones para preparar el tema oscuro

1. Elegir una fuente de verdad antes de implementar:
   - O migrar variables propias hacia shadcn/Tailwind tokens.
   - O crear tokens semanticos propios y mapear shadcn a ellos.

2. Convertir primero estos colores a tokens:
   - `#F7F6F3`, `#FFFFFF`, `#111827`, `#6B7280`, `#9CA3AF`,
     `#E5E7EB`, `#F3F4F6`, `#F9FAFB`.
   - `#6472EB`, `#5360D8`, `#6472EB` con alpha.
   - Estados `success/warning/danger/info`.
   - Chips de prioridad y estados de tarea.

3. Componentes de mayor cuidado:
   - `Sidebar`: mucha logica visual inline, menus, modales y swatches.
   - `DashboardPage`: Kanban, tabla, DragOverlay, chips y colores por tarea.
   - `AjustesPage` y `TaskSettingFormModal`: duplicacion de paletas.
   - `CalendarPage`: grilla con seleccion por fondo/ring y tareas por color.
   - `TimeReportPage`: UI + exportaciones Excel/PDF.
   - `TextPage`: contenido Tiptap puede guardar colores en JSON.
   - `DatabaseDiagramPage`: React Flow y nodos custom.
   - `LoginPage`: decidir si mantiene identidad propia o se alinea.

4. Estilos que se romperian con `.dark` actual:
   - `bg-white`, `text-gray-*`, `border-gray-*` hardcodeados.
   - `style={{ background: 'white' }}` y `#FFFFFF`.
   - Overlays y sombras con negro fijo si no se ajustan opacidades.
   - Chips pastel con texto saturado: varios tienen contraste aceptable en
     claro pero no sobre superficies oscuras.
   - Tiptap content guardado con `#111827` puede quedar ilegible en dark si no
     se normaliza o se interpreta semanticamente.
   - PDF/Excel no deben heredar tema oscuro automaticamente.

5. Colores que no deberian convertirse automaticamente:
   - Colores de usuario/proyecto/espacio elegidos por el usuario.
   - Colores persistidos en `Project.color`, `Space.iconColor`,
     `Task.color`, labels/prioridades custom.
   - Paleta de exportacion PDF/Excel si se quiere salida imprimible clara.
   - Colores de marca o categoria historica importada.

6. Librerias externas a revisar:
   - `tldraw`: CSS propio y posible tema interno.
   - `@xyflow/react`: background, controls, minimap, edges y node selection.
   - `react-day-picker` via `Calendar`: hoy ya usa tokens shadcn parcialmente.
   - `Tiptap`: contenido HTML/JSON con color persistido.
   - `Recharts`: ticks, labels y `Cell fill` por proyecto.
   - `jspdf`/`jspdf-autotable`: colores independientes para PDF.

7. Orden sugerido de futura implementacion:
   - Consolidar tokens base en `src/index.css`.
   - Alinear `Button` shadcn con el indigo real del producto o cambiar CTAs a
     un componente comun.
   - Extraer paletas de dominio (`taskSettings`, prioridades, estados,
     swatches de espacios, Kanban cards) a un modulo compartido.
   - Migrar layout/header/sidebar y UI base.
   - Migrar pantallas densas: Dashboard, Ajustes, Calendar, TimeReport.
   - Revisar librerias pesadas y exportaciones.

## Resumen ejecutivo

- El producto ya tiene una identidad clara: blanco/gris/indigo sobre fondo
  warm off-white.
- La mayor deuda visual no es estetica, sino falta de tokenizacion y
  duplicacion de paletas.
- El tema oscuro no se puede activar solo con `.dark`: ya existen tokens
  oscuros de shadcn, pero la UI real depende mayormente de hardcodes Tailwind
  y estilos inline.
- La migracion a dark mode deberia empezar por tokens semanticos, no por
  reemplazos masivos de clases.

## 11. Implementacion de tema claro/oscuro/sistema

Fecha: 2026-07-05

Se implemento el sistema de temas usando esta auditoria como fuente principal.
El tema claro conserva los valores visuales base detectados:

- fondo app `#F7F6F3`;
- superficie `#FFFFFF`;
- texto principal `#111827`;
- texto secundario `#6B7280`;
- texto tenue `#9CA3AF`;
- borde base `#E5E7EB`;
- marca principal `#6472EB`;
- hover principal `#5360D8`.

La paleta oscura final queda centralizada en `src/index.css`:

- fondo app `#0F1115`;
- fondo pagina `#12151A`;
- sidebar `#181C23`;
- superficie `#191D24`;
- superficie elevada/popover `#202630` a `#222832`;
- hover `#252B35`;
- borde `#323A46`;
- borde fuerte `#414B58`;
- texto principal `#F4F6F8`;
- texto secundario `#C1C7D0`;
- texto tenue `#8E97A5`;
- primario `#7C87F3`;
- hover primario `#9099F6`.

Tokens finales creados o normalizados:

- fondos: `--background-app`, `--background-page`;
- superficies: `--surface`, `--surface-muted`, `--surface-subtle`,
  `--surface-hover`, `--surface-active`, `--surface-elevated`,
  `--surface-popover`, `--surface-overlay`;
- textos: `--text-primary`, `--text-secondary`, `--text-muted`,
  `--text-placeholder`, `--text-disabled`, `--text-inverse`;
- bordes: `--border`, `--border-muted`, `--border-strong`;
- marca: `--primary`, `--primary-hover`, `--primary-active`,
  `--primary-soft`, `--primary-border`, `--primary-foreground`;
- estados: `--success`, `--warning`, `--danger`, `--info` y sus variantes
  `soft`/`foreground`;
- foco y sombras: `--ring-focus`, `--shadow-card`, `--shadow-panel`,
  `--shadow-popover`;
- Kanban: `--kanban-card-white`, `--kanban-card-indigo`,
  `--kanban-card-green`, `--kanban-card-yellow`, `--kanban-card-red`,
  `--kanban-card-purple`, `--kanban-card-slate`;
- especiales: `--login-background`, `--login-primary`,
  `--login-primary-hover`, `--export-background`.

Los tokens shadcn (`--background`, `--foreground`, `--card`, `--popover`,
`--primary`, `--secondary`, `--muted`, `--accent`, `--destructive`,
`--border`, `--input`, `--ring`, `--sidebar-*`) quedaron alineados con los
tokens semanticos del producto.

Archivos migrados:

- `index.html`: script anti-flash antes de React.
- `src/theme/theme.ts`, `src/theme/theme-context.ts`,
  `src/theme/ThemeProvider.tsx`: preferencia `light`/`dark`/`system`.
- `src/index.css`: tokens semanticos, mapeo shadcn y compatibilidad legacy.
- `src/main.tsx`: provider global.
- `src/pages/AjustesPage.tsx`: selector de tema en Apariencia.
- `src/components/AppLayout/AppLayout.tsx` y `src/components/Header/Header.tsx`:
  fondos/bordes tokenizados.
- `src/pages/DashboardPage.tsx` y `src/utils/theme-colors.ts`: interpretacion
  oscura de tarjetas Kanban y chips dinamicos sin alterar datos persistidos.
- `src/pages/InicioPage.tsx`: Recharts y chips/avatars dinamicos.
- `src/pages/BoardPage.tsx`: tldraw sincronizado con `resolvedTheme`.
- `src/pages/DatabaseDiagramPage.tsx`: React Flow con canvas, controles,
  minimap y edges adaptados al tema.
- `src/pages/LoginPage.tsx`: fondo y divisor sincronizados manteniendo teal.

Excepciones justificadas:

- `src/pages/TimeReportPage.tsx` mantiene colores claros embebidos para Excel
  y PDF porque las exportaciones deben seguir siendo imprimibles.
- `src/data/taskSettings.ts` mantiene defaults de colores configurables; se
  interpretan visualmente en UI cuando corresponde.
- `TEXT_COLORS` de Tiptap mantiene colores explicitos para no modificar
  contenido elegido por el usuario.
- `Project.color`, `Space.iconColor`, `Task.color`, etiquetas, prioridades,
  estados y colores de usuario no se reescriben.

Validacion visual registrada:

- capturas locales de login claro y oscuro en `docs/theme-screenshots/`;
- `npm run lint`;
- `npm run build`.

## 12. Ajuste estetico posterior inspirado en CMS

Fecha: 2026-07-09

Se reviso el dark mode del proyecto de referencia
`C:\Users\marti\OneDrive\Escritorio\Proyectos_Martin\CMS`, especialmente:

- `src/index.css`;
- `src/providers/ThemeProvider.tsx`;
- `docs/tema-noche-plan-implementacion.md`;
- `docs/brief-ia-web-redisenar-tema-noche.md`.

Hallazgos aplicables:

- El refinamiento del CMS no depende de un provider mas complejo, sino de una
  segunda pasada de paleta y jerarquia visual.
- La version mas pulida usa fondos carbon neutros (`#121212`, `#1e1e1e`,
  `#252525`) en vez de depender de azules slate profundos en toda la UI.
- Las cards se apoyan mas en bordes y sombras controladas que en contrastes
  muy fuertes.
- Los hovers y estados activos usan alpha bajo para evitar sensacion neon.
- Inputs, popovers y modales se sienten mejor cuando usan una superficie
  elevada consistente y bordes visibles.

Ajustes aplicados a `gestion_tareas`:

- fondo oscuro principal `#121212`;
- superficie base `#1E1E1E`;
- superficie/input/elevada `#252525`;
- borde base `#2D2D2D`;
- borde fuerte `#3D3D3D`;
- texto principal `#F7F7F8`;
- texto secundario `#D0D0D4`;
- texto tenue `#92929A`;
- primario indigo conservado con `#7C87F3`, pero con alpha mas bajo en fondos
  suaves;
- tarjetas Kanban oscuras ajustadas a fondos menos azulados;
- React Flow y login alineados al nuevo fondo carbon.

No se modifico:

- tema claro;
- valores persistidos de usuario;
- paleta de exportacion PDF/Excel;
- contenido Tiptap;
- arquitectura del selector `light`/`dark`/`system`.
