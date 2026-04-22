import { useState } from 'react'
import { Outlet } from 'react-router-dom'
import Header from '../Header/Header'
import Sidebar from '../Sidebar/Sidebar'

/**
 * AppLayout envuelve todas las páginas autenticadas.
 * Contiene el estado `collapsed` del sidebar para que ambos componentes
 * (Sidebar y Header) lo compartan sin necesidad de prop-drilling profundo.
 * Las páginas hijas se renderizan dentro del <Outlet />.
 */
export default function AppLayout() {
  const [collapsed, setCollapsed] = useState(false)

  return (
    <div
      className="flex h-screen overflow-hidden font-sans text-[14px]"
      style={{ background: 'var(--color-bg-app)' }}
    >
      <Sidebar collapsed={collapsed} />

      <main className="flex-1 flex flex-col overflow-hidden min-w-0">
        <Header
          collapsed={collapsed}
          onToggleSidebar={() => setCollapsed(prev => !prev)}
        />

        {/* Área de contenido: flex-1 + overflow-hidden para que
            cada página controle su propio scroll internamente */}
        <div className="flex-1 overflow-hidden min-h-0">
          <div className="h-full overflow-y-auto">
            <Outlet />
          </div>
        </div>
      </main>
    </div>
  )
}
