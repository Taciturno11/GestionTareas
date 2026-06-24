import { useEffect, useState } from 'react'
import { Outlet } from 'react-router-dom'
import Header from '../Header/Header'
import Sidebar from '../Sidebar/Sidebar'
import { getAuthToken } from '@/services/auth-token'
import { syncBackendWorkspaceDataToLocalStorage } from '@/services/backend-sync'
import { useCurrentUser } from '@/hooks/useCurrentUser'
import { useWorkspaces } from '@/hooks/useWorkspaces'

/**
 * AppLayout envuelve todas las páginas autenticadas.
 * Contiene el estado `collapsed` del sidebar para que ambos componentes
 * (Sidebar y Header) lo compartan sin necesidad de prop-drilling profundo.
 * Las páginas hijas se renderizan dentro del <Outlet />.
 */
export default function AppLayout() {
  const [collapsed, setCollapsed] = useState(false)
  const { user, isLoading: isUserLoading, refreshUser } = useCurrentUser()
  const { setActiveWorkspaceId } = useWorkspaces()
  const adminContext = (() => {
    try {
      const raw = sessionStorage.getItem('gt_admin_workspace_context')
      return raw ? JSON.parse(raw) as { userName: string; workspaceId: string } : null
    } catch {
      return null
    }
  })()

  function leaveAdminWorkspace() {
    sessionStorage.removeItem('gt_admin_workspace_context')
    if (user?.personalWorkspaceId) setActiveWorkspaceId(user.personalWorkspaceId)
    window.location.assign('/ajustes/usuarios')
  }

  useEffect(() => {
    if (!getAuthToken()) return

    syncBackendWorkspaceDataToLocalStorage().catch(error => {
      console.warn('No se pudo sincronizar con backend local.', error)
    })
  }, [])

  return (
    <div
      className="flex h-screen overflow-hidden font-sans text-[14px]"
      style={{ background: 'var(--color-bg-app)' }}
    >
      <Sidebar collapsed={collapsed} currentUserId={user?.id ?? null} />

      <main className="flex-1 flex flex-col overflow-hidden min-w-0">
        <Header
          collapsed={collapsed}
          onToggleSidebar={() => setCollapsed(prev => !prev)}
          user={user}
          isUserLoading={isUserLoading}
          onUserUpdated={refreshUser}
        />

        {/* Área de contenido: flex-1 + overflow-hidden para que
            cada página controle su propio scroll internamente */}
        {user?.role === 'admin' && adminContext && (
          <div className="flex h-10 shrink-0 items-center justify-between gap-3 border-b border-amber-200 bg-amber-50 px-4 text-[12px] text-amber-900">
            <span>
              Vista administrativa del workspace de <strong>{adminContext.userName}</strong>
            </span>
            <button
              type="button"
              onClick={leaveAdminWorkspace}
              className="rounded-md border border-amber-300 bg-white px-3 py-1 font-semibold transition-colors hover:bg-amber-100"
            >
              Volver a Administración
            </button>
          </div>
        )}

        <div className="flex-1 overflow-hidden min-h-0">
          <div className="h-full overflow-y-auto">
            <Outlet />
          </div>
        </div>
      </main>
    </div>
  )
}
