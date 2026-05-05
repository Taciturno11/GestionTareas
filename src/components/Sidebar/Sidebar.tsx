import {
  CalendarDaysIcon,
  ClipboardDocumentListIcon,
  HomeIcon,
  PlusIcon,
  BellIcon,
  MagnifyingGlassIcon,
  Cog6ToothIcon,
} from '@heroicons/react/24/outline'
import { NavLink } from 'react-router-dom'

const NAVIGATION = [
  { label: 'Inicio',     icon: HomeIcon,                  to: '/' },
  { label: 'Mis tareas', icon: ClipboardDocumentListIcon, to: '/tareas' },
  { label: 'Calendario', icon: CalendarDaysIcon,          to: '/calendario' },
  { label: 'Ajustes',    icon: Cog6ToothIcon,             to: '/ajustes' },
]

interface SidebarProps {
  collapsed: boolean
}

export default function Sidebar({ collapsed }: SidebarProps) {
  return (
    <aside
      className="flex flex-col shrink-0 transition-all duration-300 overflow-hidden border-r"
      style={{
        width: collapsed ? 0 : 240,
        opacity: collapsed ? 0 : 1,
        background: 'var(--color-bg-sidebar)',
        borderColor: 'var(--color-border)',
      }}
    >
      {/* Workspace header */}
      <div
        className="flex items-center gap-2.5 px-4 py-3.5 cursor-pointer transition-colors hover:bg-gray-50"
        style={{ borderBottom: '1px solid var(--color-border)' }}
      >
        <div className="h-6 w-6 rounded-md bg-[var(--color-accent)] flex items-center justify-center text-white text-[10px] font-bold shrink-0">
          GT
        </div>
        <span className="font-semibold text-[13px] truncate" style={{ color: 'var(--color-text-primary)' }}>
          Gestión de Tareas
        </span>
      </div>

      {/* Search + notifications */}
      <div className="px-3 pt-3 space-y-0.5">
        {[
          { icon: MagnifyingGlassIcon, label: 'Buscar' },
          { icon: BellIcon,            label: 'Notificaciones' },
        ].map(({ icon: Icon, label }) => (
          <button
            key={label}
            className="flex items-center gap-2.5 w-full px-3 py-1.5 rounded-md text-[13px] transition-colors hover:bg-gray-100"
            style={{ color: 'var(--color-text-secondary)' }}
          >
            <Icon className="h-4 w-4 shrink-0" />
            {label}
          </button>
        ))}
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 pt-4">
        <p
          className="px-3 pb-1.5 text-[11px] font-semibold uppercase tracking-widest"
          style={{ color: 'var(--color-text-muted)' }}
        >
          Páginas
        </p>
        {NAVIGATION.map(({ label, icon: Icon, to }) => {
          return (
            <NavLink
              key={to}
              to={to}
              end={to === '/'}
              className={({ isActive }) => {
                return `flex items-center gap-2.5 w-full px-3 py-1.5 rounded-md text-[13px] transition-colors mb-0.5 ${
                  isActive ? 'nav-active' : 'hover:bg-gray-100'
                }`
              }}
              style={({ isActive }) => {
                return {
                  color: isActive ? 'var(--color-accent)' : 'var(--color-text-secondary)',
                }
              }}
            >
              <Icon className="h-4 w-4 shrink-0" />
              {label}
            </NavLink>
          )
        })}
      </nav>

      {/* Footer */}
      <div
        className="px-3 pb-4 pt-3"
        style={{ borderTop: '1px solid var(--color-border)' }}
      >
        <button
          className="flex items-center gap-2.5 w-full px-3 py-1.5 rounded-md text-[13px] transition-colors hover:bg-gray-100"
          style={{ color: 'var(--color-text-secondary)' }}
        >
          <PlusIcon className="h-4 w-4" />
          Nueva página
        </button>
      </div>
    </aside>
  )
}
