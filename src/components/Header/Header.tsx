import { BellIcon, ChevronRightIcon, EllipsisHorizontalIcon } from '@heroicons/react/24/outline'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { useEffect, useState } from 'react'
import { useLocation } from 'react-router-dom'

import type { AuthUser } from '@/api/auth.api'
import { friendsApi, friendsKeys, type FriendRequest } from '@/api/friends.api'
import type { PublicUser } from '@/api/users.api'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { findWorkspacePage, WORKSPACE_DATA_CHANGE_EVENT } from '@/data/workspaces'
import {
  PAGE_SAVE_STATUS_EVENT,
  type PageSaveStatus,
  type PageSaveStatusDetail,
} from '@/services/page-save-status'
import UserMenu from './UserMenu'

const PAGE_TITLES: Record<string, string> = {
  '/': 'Inicio',
  '/tareas': 'Mis tareas',
  '/proyectos': 'Proyectos',
  '/calendario': 'Calendario',
  '/amigos': 'Amigos',
  '/archivo': 'Archivo',
  '/ajustes': 'Ajustes',
}

interface HeaderProps {
  collapsed: boolean
  onToggleSidebar: () => void
  user: AuthUser | null
  isUserLoading?: boolean
  onUserUpdated?: () => void
}

function PageSaveStatusLabel({ pageId }: { pageId: string }) {
  const [saveStatus, setSaveStatus] = useState<PageSaveStatus>('idle')

  useEffect(() => {
    const syncSaveStatus = (event: Event) => {
      const detail = (event as CustomEvent<PageSaveStatusDetail>).detail
      if (detail.pageId === pageId) setSaveStatus(detail.status)
    }

    window.addEventListener(PAGE_SAVE_STATUS_EVENT, syncSaveStatus)
    return () => window.removeEventListener(PAGE_SAVE_STATUS_EVENT, syncSaveStatus)
  }, [pageId])

  const saveStatusLabel = {
    idle: 'Guardado',
    dirty: 'Cambios sin guardar',
    saving: 'Guardando…',
    saved: 'Guardado',
    error: 'Error al guardar',
  }[saveStatus]

  return (
    <span className={`text-[12px] ${saveStatus === 'error' ? 'text-red-600' : ''}`}>
      {saveStatusLabel}
    </span>
  )
}

function getUserInitials(user: Pick<PublicUser, 'name' | 'email'>) {
  const source = user.name?.trim() || user.email?.trim() || 'U'
  return source
    .split(/\s+/)
    .map(part => part[0])
    .join('')
    .slice(0, 2)
    .toUpperCase()
}

function RequestAvatar({ user }: { user: PublicUser }) {
  if (user.avatarUrl) {
    return (
      <img
        src={user.avatarUrl}
        alt={user.name}
        className="h-9 w-9 shrink-0 rounded-full object-cover"
      />
    )
  }

  return (
    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-indigo-50 text-[12px] font-bold text-indigo-600">
      {getUserInitials(user)}
    </span>
  )
}

function FriendRequestsBell() {
  const queryClient = useQueryClient()
  const { data: incomingRequests = [] } = useQuery({
    queryKey: friendsKeys.incoming,
    queryFn: friendsApi.listIncomingRequests,
    staleTime: 30 * 1000,
  })

  async function refreshFriends() {
    await Promise.all([
      queryClient.invalidateQueries({ queryKey: friendsKeys.incoming }),
      queryClient.invalidateQueries({ queryKey: friendsKeys.outgoing }),
      queryClient.invalidateQueries({ queryKey: friendsKeys.all }),
    ])
  }

  async function handleAccept(request: FriendRequest) {
    await friendsApi.acceptRequest(request.id)
    await refreshFriends()
  }

  async function handleReject(request: FriendRequest) {
    await friendsApi.rejectRequest(request.id)
    await refreshFriends()
  }

  return (
    <Popover>
      <PopoverTrigger
        className="relative rounded-md p-1.5 transition-colors hover:bg-gray-100"
        title="Solicitudes de amistad"
      >
        <BellIcon className="h-4 w-4" />
        {incomingRequests.length > 0 && (
          <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-[#6472EB] px-1 text-[10px] font-bold leading-none text-white">
            {incomingRequests.length}
          </span>
        )}
      </PopoverTrigger>
      <PopoverContent className="w-80 p-3" align="end" sideOffset={8}>
        <div className="mb-2">
          <p className="text-[13px] font-semibold text-gray-900">Solicitudes de amistad</p>
          <p className="text-[11px] text-gray-400">Acepta o rechaza personas que quieren compartir contigo.</p>
        </div>
        {incomingRequests.length ? (
          <div className="space-y-2">
            {incomingRequests.map(request => (
              <div key={request.id} className="rounded-lg border border-gray-100 p-2">
                <div className="flex items-center gap-2">
                  <RequestAvatar user={request.requester} />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-[13px] font-semibold text-gray-800">{request.requester.name}</p>
                    <p className="truncate text-[11px] text-gray-400">{request.requester.email}</p>
                  </div>
                </div>
                <div className="mt-2 flex items-center gap-2 pl-11">
                  <button
                    type="button"
                    onClick={() => void handleAccept(request)}
                    className="rounded-md bg-[#6472EB] px-2.5 py-1 text-[12px] font-semibold text-white hover:bg-[#5360D8]"
                  >
                    Aceptar
                  </button>
                  <button
                    type="button"
                    onClick={() => void handleReject(request)}
                    className="rounded-md px-2.5 py-1 text-[12px] font-medium text-gray-500 hover:bg-gray-100 hover:text-gray-800"
                  >
                    Rechazar
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="rounded-lg border border-dashed border-gray-200 p-3 text-[12px] text-gray-400">
            No tienes solicitudes pendientes.
          </p>
        )}
      </PopoverContent>
    </Popover>
  )
}

export default function Header({ collapsed, onToggleSidebar, user, isUserLoading = false, onUserUpdated }: HeaderProps) {
  const { pathname } = useLocation()
  const [, setWorkspaceDataVersion] = useState(0)
  const dynamicPageId = pathname.startsWith('/p/') ? pathname.replace('/p/', '') : null
  const pageTitle = dynamicPageId
    ? findWorkspacePage(dynamicPageId)?.title || 'Página sin título'
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

      <div className="flex min-w-0 items-center gap-3" style={{ color: 'var(--color-text-muted)' }}>
        {dynamicPageId
          ? <PageSaveStatusLabel key={dynamicPageId} pageId={dynamicPageId} />
          : <span className="text-[12px]">Editado hace 2 min</span>}
        <button
          className="rounded-md px-3 py-1 text-[13px] font-medium transition-colors hover:bg-gray-100"
          style={{ color: 'var(--color-text-secondary)' }}
        >
          Compartir
        </button>
        <button className="rounded-md p-1.5 transition-colors hover:bg-gray-100">
          <EllipsisHorizontalIcon className="h-4 w-4" />
        </button>
        <div className="h-4 w-px bg-gray-200" />
        {user && <FriendRequestsBell />}
        <UserMenu user={user} isLoading={isUserLoading} onUserUpdated={onUserUpdated} />
      </div>
    </header>
  )
}
