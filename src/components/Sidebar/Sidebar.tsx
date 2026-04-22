import {
  ArchiveBoxIcon,
  CalendarDaysIcon,
  ClipboardDocumentListIcon,
  FolderIcon,
  HomeIcon,
  PlusIcon,
  BellIcon,
  MagnifyingGlassIcon,
  BriefcaseIcon,
} from '@heroicons/react/24/outline'
import { NavLink, useLocation } from 'react-router-dom'

const NAVIGATION = [
  { label: 'Inicio',     icon: HomeIcon,                  to: '/' },
  { label: 'Mis tareas', icon: ClipboardDocumentListIcon, to: '/tareas' },
  { label: 'Proyectos',  icon: FolderIcon,                to: '/proyectos' },
  { label: 'Calendario', icon: CalendarDaysIcon,          to: '/calendario' },
  { label: 'Archivo',    icon: ArchiveBoxIcon,            to: '/archivo' },
]

const WORKSPACES = [
  { id: 'job-1', label: 'Trabajo 1' },
  { id: 'job-2', label: 'Trabajo 2' },
]

interface SidebarProps {
  collapsed: boolean
}

export default function Sidebar({ collapsed }: SidebarProps) {
  const location = useLocation()
  const currentWorkspace = new URLSearchParams(location.search).get('w')

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
          // If this is the "Mis tareas" link, only highlight if there's NO workspace selected
          const isGlobalTasksLink = to === '/tareas'
          const isActiveOverride = isGlobalTasksLink && currentWorkspace != null ? false : undefined

          return (
            <NavLink
              key={to}
              to={to}
              end={to === '/'}
              className={({ isActive }) => {
                const finalActive = isActiveOverride !== undefined ? isActiveOverride : isActive
                return `flex items-center gap-2.5 w-full px-3 py-1.5 rounded-md text-[13px] transition-colors mb-0.5 ${
                  finalActive ? 'nav-active' : 'hover:bg-gray-100'
                }`
              }}
              style={({ isActive }) => {
                const finalActive = isActiveOverride !== undefined ? isActiveOverride : isActive
                return {
                  color: finalActive ? 'var(--color-accent)' : 'var(--color-text-secondary)',
                }
              }}
            >
              <Icon className="h-4 w-4 shrink-0" />
              {label}
            </NavLink>
          )
        })}

        <div className="mt-6 mb-2 flex items-center justify-between px-3">
          <p
            className="text-[11px] font-semibold uppercase tracking-widest"
            style={{ color: 'var(--color-text-muted)' }}
          >
            Entornos
          </p>
        </div>

        {WORKSPACES.map((ws) => {
          const isActive = location.pathname === '/tareas' && currentWorkspace === ws.id
          return (
            <NavLink
              key={ws.id}
              to={`/tareas?w=${ws.id}`}
              className={`flex items-center gap-2.5 w-full px-3 py-1.5 rounded-md text-[13px] transition-colors mb-0.5 ${
                isActive ? 'bg-indigo-50/80 font-medium' : 'hover:bg-gray-100'
              }`}
              style={{
                color: isActive ? 'var(--color-accent)' : 'var(--color-text-secondary)',
              }}
            >
              <BriefcaseIcon className="h-4 w-4 shrink-0" />
              {ws.label}
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
