import { ChevronRightIcon, EllipsisHorizontalIcon } from '@heroicons/react/24/outline'
import { useLocation } from 'react-router-dom'

// Mapa de ruta → título de página
const PAGE_TITLES: Record<string, string> = {
  '/':           'Inicio',
  '/tareas':     'Mis tareas',
  '/proyectos':  'Proyectos',
  '/calendario': 'Calendario',
  '/archivo':    'Archivo',
}

interface HeaderProps {
  collapsed: boolean
  onToggleSidebar: () => void
}

export default function Header({ collapsed, onToggleSidebar }: HeaderProps) {
  const { pathname } = useLocation()
  const pageTitle = PAGE_TITLES[pathname] ?? 'Página'

  return (
    <header
      className="flex items-center justify-between px-4 h-11 shrink-0 z-10"
      style={{
        background: '#F7F6F3',
        borderBottom: '1px solid #E8E7E3',
      }}
    >
      {/* Left: toggle + breadcrumb */}
      <div className="flex items-center gap-2">
        <button
          onClick={onToggleSidebar}
          className="p-1.5 rounded-md transition-colors hover:bg-gray-100"
          style={{ color: 'var(--color-text-muted)' }}
          title={collapsed ? 'Abrir sidebar' : 'Cerrar sidebar'}
        >
          <ChevronRightIcon
            className={`h-4 w-4 transition-transform ${collapsed ? '' : 'rotate-180'}`}
          />
        </button>
        <div
          className="flex items-center gap-1.5 text-[13px]"
          style={{ color: 'var(--color-text-muted)' }}
        >
          <span style={{ color: 'var(--color-text-secondary)' }}>Gestión de Tareas</span>
          <span>/</span>
          <span className="font-medium" style={{ color: 'var(--color-text-primary)' }}>
            {pageTitle}
          </span>
        </div>
      </div>

      {/* Right: actions */}
      <div className="flex items-center gap-3" style={{ color: 'var(--color-text-muted)' }}>
        <span className="text-[12px]">Editado hace 2 min</span>
        <button
          className="text-[13px] font-medium px-3 py-1 rounded-md transition-colors hover:bg-gray-100"
          style={{ color: 'var(--color-text-secondary)' }}
        >
          Compartir
        </button>
        <button className="p-1.5 rounded-md transition-colors hover:bg-gray-100">
          <EllipsisHorizontalIcon className="h-4 w-4" />
        </button>
      </div>
    </header>
  )
}
