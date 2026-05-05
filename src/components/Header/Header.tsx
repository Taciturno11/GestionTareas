import { ChevronRightIcon, EllipsisHorizontalIcon } from '@heroicons/react/24/outline'
import { useEffect, useState } from 'react'
import { useLocation } from 'react-router-dom'

import { findWorkspacePage, WORKSPACE_DATA_CHANGE_EVENT } from '@/data/workspaces'

const PAGE_TITLES: Record<string, string> = {
  '/': 'Inicio',
  '/tareas': 'Mis tareas',
  '/proyectos': 'Proyectos',
  '/calendario': 'Calendario',
  '/archivo': 'Archivo',
  '/ajustes': 'Ajustes',
}

interface HeaderProps {
  collapsed: boolean
  onToggleSidebar: () => void
}

export default function Header({ collapsed, onToggleSidebar }: HeaderProps) {
  const { pathname } = useLocation()
  const [, setWorkspaceDataVersion] = useState(0)
  const dynamicPageId = pathname.startsWith('/p/') ? pathname.replace('/p/', '') : null
  const pageTitle = dynamicPageId
    ? findWorkspacePage(dynamicPageId)?.title ?? 'Pagina'
    : PAGE_TITLES[pathname] ?? 'Pagina'

  useEffect(() => {
    const syncWorkspaceData = () => setWorkspaceDataVersion(version => version + 1)

    window.addEventListener(WORKSPACE_DATA_CHANGE_EVENT, syncWorkspaceData)
    return () => window.removeEventListener(WORKSPACE_DATA_CHANGE_EVENT, syncWorkspaceData)
  }, [])

  return (
    <header
      className="z-10 flex h-11 shrink-0 items-center justify-between px-4"
      style={{
        background: '#F7F6F3',
        borderBottom: '1px solid #E8E7E3',
      }}
    >
      <div className="flex items-center gap-2">
        <button
          onClick={onToggleSidebar}
          className="rounded-md p-1.5 transition-colors hover:bg-gray-100"
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
          <span style={{ color: 'var(--color-text-secondary)' }}>Gestion de Tareas</span>
          <span>/</span>
          <span className="font-medium" style={{ color: 'var(--color-text-primary)' }}>
            {pageTitle}
          </span>
        </div>
      </div>

      <div className="flex items-center gap-3" style={{ color: 'var(--color-text-muted)' }}>
        <span className="text-[12px]">Editado hace 2 min</span>
        <button
          className="rounded-md px-3 py-1 text-[13px] font-medium transition-colors hover:bg-gray-100"
          style={{ color: 'var(--color-text-secondary)' }}
        >
          Compartir
        </button>
        <button className="rounded-md p-1.5 transition-colors hover:bg-gray-100">
          <EllipsisHorizontalIcon className="h-4 w-4" />
        </button>
      </div>
    </header>
  )
}
