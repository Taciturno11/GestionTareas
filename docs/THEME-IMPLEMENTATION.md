# Implementacion de temas

Fecha: 2026-07-05

## Arquitectura

El tema vive en tres capas:

- `index.html`: aplica `dark` en `<html>` antes de montar React para evitar
  flash blanco.
- `src/theme/`: resuelve `light`, `dark` y `system`, persiste la preferencia
  en `localStorage` con la clave `agenda-theme` y escucha cambios de
  `prefers-color-scheme`.
- `src/index.css`: concentra tokens semanticos y mapea shadcn hacia esos
  tokens.

El fondo autenticado incluye una cuarta pieza visual:

- `src/components/ParticleBackground/ParticleBackground.tsx`: monta
  `particles.js` como canvas `pointer-events: none`, sincronizado con
  `resolvedTheme`.

## Referencia CMS

El 2026-07-09 se reviso el proyecto CMS como referencia de refinamiento visual.
La leccion principal fue separar mejor fondo, superficie y superficie elevada
con una paleta carbon neutra:

- `#121212` para fondo general;
- `#1E1E1E` para cards/superficies;
- `#252525` para inputs, popovers y superficies elevadas;
- `#2D2D2D` y `#3D3D3D` para bordes.

En `gestion_tareas` se conserva la identidad indigo `#6472EB`/`#7C87F3`,
pero se redujo la saturacion de fondos suaves y hovers para que el oscuro se
sienta mas profesional y menos pesado.

## Cambiar el tema

Usar:

```tsx
import { useTheme } from '@/theme/theme-context'

const { theme, resolvedTheme, setTheme } = useTheme()
setTheme('dark')
```

`theme` es la preferencia guardada. `resolvedTheme` siempre es `light` o
`dark`.

## Consumir tokens

Preferir tokens semanticos:

```tsx
style={{ background: 'var(--surface)', color: 'var(--text-primary)' }}
```

O clases ya cubiertas por la compatibilidad legacy (`bg-white`, `text-gray-*`,
`border-gray-*`) cuando se este migrando una vista existente.

Evitar nuevos HEX para fondos/textos/bordes de UI. Los HEX siguen siendo
validos para colores elegidos por el usuario, proyectos, etiquetas, estados y
exportaciones.

## Colores dinamicos

Usar `src/utils/theme-colors.ts`:

- `getDynamicChipStyle(color, resolvedTheme)`;
- `getSoftDynamicPair(pair, resolvedTheme)`;
- `getTaskCardBackground(color, resolvedTheme)`;
- `getTaskCardSwatchBackground(color, resolvedTheme)`.

Estas funciones solo cambian la representacion visual en oscuro. No modifican
el valor persistido.

## Kanban

`Task.color` conserva la paleta clara:

- `#FFFFFF`;
- `#EEF2FF`;
- `#ECFDF5`;
- `#FEF3C7`;
- `#FEE2E2`;
- `#F5F3FF`;
- `#F1F5F9`.

En oscuro se mapea a tokens `--kanban-card-*`.

## Tiptap

El texto sin color explicito usa tokens/clases del editor. Los colores
explicitos guardados en el contenido se respetan.

No convertir automaticamente JSON/HTML de Tiptap al tema oscuro.

## tldraw

La pizarra usa la API de tldraw:

```tsx
editor.user.updateUserPreferences({ colorScheme: resolvedTheme })
```

No sobrescribir clases internas de tldraw.

## React Flow

`DatabaseDiagramPage` sincroniza:

- `colorMode`;
- `Background`;
- `Controls`;
- `MiniMap`;
- edges y labels;
- nodos mediante clases/tokens.

## Recharts

Los colores de proyectos se conservan. Textos, ticks y labels se eligen segun
`resolvedTheme`.

## Exportaciones

PDF y Excel no heredan el tema visual de la app. Mantienen paleta clara e
imprimible dentro de `TimeReportPage`.

## Ejemplos

Correcto:

```tsx
const { resolvedTheme } = useTheme()
const style = getDynamicChipStyle(project.color, resolvedTheme)
```

Incorrecto:

```tsx
const color = resolvedTheme === 'dark' ? '#222' : project.color
updateProject(id, { color })
```

Correcto:

```css
background: var(--surface);
border-color: var(--border);
color: var(--text-primary);
```

Incorrecto:

```css
background: #ffffff;
color: #111827;
```

## Fondo de particulas

`particles.js` se usa solo como fondo de la app autenticada desde `AppLayout`.
Se carga como script clasico desde el asset de la dependencia porque la libreria
usa APIs antiguas incompatibles con el modo estricto de los bundles ESM. La
configuracion es sobria:

- menos particulas en tema claro;
- mas presencia en tema oscuro;
- sin interacciones de hover/click;
- sin bloquear clicks (`pointer-events: none`);
- limpieza del canvas al cambiar de tema o desmontar.

Las vistas con fondo general (`DashboardPage`, `CalendarPage`) usan fondo
transparente para que el fondo global sea visible; las cards y paneles siguen
usando superficies opacas para conservar legibilidad.
