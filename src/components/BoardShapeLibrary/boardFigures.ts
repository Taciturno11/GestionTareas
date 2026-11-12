export interface BoardFigure {
  id: string
  label: string
  svg: string
}

// Trazos en gris medio y acentos de color: se leen sobre fondo claro y oscuro.
const STROKE = '#64748b'
const BLUE = '#3b82f6'
const BLUE_SOFT = '#dbeafe'
const GREEN = '#22c55e'
const ORANGE = '#f97316'
const RED = '#ef4444'
const YELLOW = '#facc15'

function figureSvg(body: string, width = 80, height = 80) {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 64 64" fill="none" stroke="${STROKE}" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">${body}</svg>`
}

export const BOARD_FIGURES: BoardFigure[] = [
  {
    id: 'database',
    label: 'Base de datos',
    svg: figureSvg(`
      <path d="M12 14v36c0 3.9 9 7 20 7s20-3.1 20-7V14" fill="${BLUE_SOFT}" stroke="${BLUE}"/>
      <ellipse cx="32" cy="14" rx="20" ry="7" fill="${BLUE_SOFT}" stroke="${BLUE}"/>
      <path d="M12 26c0 3.9 9 7 20 7s20-3.1 20-7M12 38c0 3.9 9 7 20 7s20-3.1 20-7" stroke="${BLUE}"/>
    `),
  },
  {
    id: 'server',
    label: 'Servidor',
    svg: figureSvg(`
      <rect x="12" y="6" width="40" height="15" rx="3"/>
      <rect x="12" y="25" width="40" height="15" rx="3"/>
      <rect x="12" y="44" width="40" height="15" rx="3"/>
      <path d="M20 13.5h12M20 32.5h12M20 51.5h12"/>
      <circle cx="44" cy="13.5" r="2" fill="${GREEN}" stroke="${GREEN}"/>
      <circle cx="44" cy="32.5" r="2" fill="${GREEN}" stroke="${GREEN}"/>
      <circle cx="44" cy="51.5" r="2" fill="${GREEN}" stroke="${GREEN}"/>
    `),
  },
  {
    id: 'cloud',
    label: 'Nube',
    svg: figureSvg(`
      <path d="M19 48h28a11 11 0 0 0 1-22 15 15 0 0 0-29-2 12 12 0 0 0 0 24z" fill="${BLUE_SOFT}" stroke="${BLUE}"/>
    `),
  },
  {
    id: 'internet',
    label: 'Internet',
    svg: figureSvg(`
      <circle cx="32" cy="32" r="24" stroke="${BLUE}"/>
      <ellipse cx="32" cy="32" rx="10" ry="24" stroke="${BLUE}"/>
      <path d="M8 32h48M12 20h40M12 44h40" stroke="${BLUE}"/>
    `),
  },
  {
    id: 'linux',
    label: 'Linux',
    svg: figureSvg(`
      <path d="M32 6c-9 0-13 8-13 17 0 6-7 12-7 22 0 9 9 13 20 13s20-4 20-13c0-10-7-16-7-22 0-9-4-17-13-17z" fill="#334155"/>
      <ellipse cx="32" cy="42" rx="11" ry="14" fill="#ffffff" stroke="#ffffff"/>
      <circle cx="27" cy="19" r="3" fill="#ffffff" stroke="#ffffff"/>
      <circle cx="37" cy="19" r="3" fill="#ffffff" stroke="#ffffff"/>
      <circle cx="27.5" cy="19.5" r="1" fill="#0f172a" stroke="#0f172a"/>
      <circle cx="36.5" cy="19.5" r="1" fill="#0f172a" stroke="#0f172a"/>
      <path d="M27 26l5 4 5-4z" fill="${YELLOW}" stroke="${ORANGE}" stroke-width="2"/>
      <path d="M14 58c2-5 10-5 12 0zM38 58c2-5 10-5 12 0z" fill="${YELLOW}" stroke="${ORANGE}" stroke-width="2"/>
    `),
  },
  {
    id: 'router',
    label: 'Router',
    svg: figureSvg(`
      <rect x="8" y="34" width="48" height="18" rx="4"/>
      <path d="M18 34 14 16M46 34l4-18"/>
      <circle cx="18" cy="43" r="2" fill="${GREEN}" stroke="${GREEN}"/>
      <circle cx="26" cy="43" r="2" fill="${GREEN}" stroke="${GREEN}"/>
      <path d="M36 43h12"/>
      <path d="M26 18a9 9 0 0 1 12 0M22 13a15 15 0 0 1 20 0" stroke="${BLUE}"/>
    `),
  },
  {
    id: 'network',
    label: 'Red',
    svg: figureSvg(`
      <path d="M32 18v12M32 30 14 44M32 30l18 14M32 30v14"/>
      <circle cx="32" cy="12" r="6" fill="${BLUE_SOFT}" stroke="${BLUE}"/>
      <circle cx="12" cy="50" r="6" fill="${BLUE_SOFT}" stroke="${BLUE}"/>
      <circle cx="32" cy="50" r="6" fill="${BLUE_SOFT}" stroke="${BLUE}"/>
      <circle cx="52" cy="50" r="6" fill="${BLUE_SOFT}" stroke="${BLUE}"/>
    `),
  },
  {
    id: 'firewall',
    label: 'Firewall',
    svg: figureSvg(`
      <rect x="8" y="12" width="48" height="40" rx="2" fill="#fed7aa" stroke="${ORANGE}"/>
      <path d="M8 25.3h48M8 38.6h48M24 12v13.3M40 12v13.3M16 25.3v13.3M32 25.3v13.3M48 25.3v13.3M24 38.6V52M40 38.6V52" stroke="${ORANGE}"/>
    `),
  },
  {
    id: 'man',
    label: 'Persona',
    svg: figureSvg(`
      <circle cx="32" cy="12" r="7"/>
      <path d="M32 19v21M18 28h28M32 40 22 58M32 40l10 18"/>
    `),
  },
  {
    id: 'woman',
    label: 'Mujer',
    svg: figureSvg(`
      <circle cx="32" cy="11" r="7"/>
      <path d="M32 18 20 44h24z" fill="#fce7f3" stroke="#ec4899"/>
      <path d="M26 26 16 34M38 26l10 8M27 44v14M37 44v14"/>
    `),
  },
  {
    id: 'group',
    label: 'Usuarios',
    svg: figureSvg(`
      <circle cx="22" cy="20" r="7"/>
      <path d="M8 50c0-9 6-16 14-16s14 7 14 16"/>
      <circle cx="42" cy="20" r="7" stroke="${BLUE}"/>
      <path d="M36 35c2-1 4-1 6-1 8 0 14 7 14 16" stroke="${BLUE}"/>
    `),
  },
  {
    id: 'laptop',
    label: 'Laptop',
    svg: figureSvg(`
      <rect x="12" y="14" width="40" height="26" rx="2" fill="${BLUE_SOFT}"/>
      <path d="M6 48h52l-4-8H10z"/>
    `),
  },
  {
    id: 'desktop',
    label: 'PC',
    svg: figureSvg(`
      <rect x="8" y="10" width="48" height="32" rx="3" fill="${BLUE_SOFT}"/>
      <path d="M32 42v10M20 54h24"/>
    `),
  },
  {
    id: 'phone',
    label: 'Celular',
    svg: figureSvg(`
      <rect x="20" y="6" width="24" height="52" rx="4" fill="${BLUE_SOFT}"/>
      <path d="M28 12h8M30 51h4"/>
    `),
  },
  {
    id: 'api',
    label: 'API / servicio',
    svg: figureSvg(`
      <circle cx="32" cy="32" r="10"/>
      <path d="M32 8v8M32 48v8M8 32h8M48 32h8M15 15l6 6M43 43l6 6M15 49l6-6M43 21l6-6" stroke-width="5"/>
      <circle cx="32" cy="32" r="3" fill="${STROKE}"/>
    `),
  },
  {
    id: 'security',
    label: 'Seguridad',
    svg: figureSvg(`
      <path d="M22 28v-8a10 10 0 0 1 20 0v8"/>
      <rect x="14" y="28" width="36" height="28" rx="4" fill="#fef3c7" stroke="#d97706"/>
      <path d="M32 38v8" stroke="#d97706"/>
    `),
  },
  {
    id: 'email',
    label: 'Correo',
    svg: figureSvg(`
      <rect x="8" y="14" width="48" height="36" rx="3" fill="#fee2e2" stroke="${RED}"/>
      <path d="m8 18 24 18 24-18" stroke="${RED}"/>
    `),
  },
  {
    id: 'document',
    label: 'Documento',
    svg: figureSvg(`
      <path d="M16 6h22l12 12v40H16z"/>
      <path d="M38 6v12h12M23 30h20M23 39h20M23 48h12"/>
    `),
  },
]

export function figureToDataUrl(figure: BoardFigure) {
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(figure.svg)}`
}
