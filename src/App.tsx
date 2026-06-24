import { Suspense, lazy } from 'react'
import { BrowserRouter, Navigate, Route, Routes, useLocation } from 'react-router-dom'

import AppLayout from './components/AppLayout/AppLayout'
import RouteFallback from './components/RouteFallback/RouteFallback'
import { getAuthToken } from './services/auth-token'

const AjustesPage = lazy(() => import('./pages/AjustesPage'))
const ArchivePage = lazy(() => import('./pages/ArchivePage'))
const CalendarPage = lazy(() => import('./pages/CalendarPage'))
const DashboardPage = lazy(() => import('./pages/DashboardPage'))
const FriendsPage = lazy(() => import('./pages/FriendsPage'))
const InicioPage = lazy(() => import('./pages/InicioPage'))
const LoginPage = lazy(() => import('./pages/LoginPage'))
const PageView = lazy(() => import('./pages/PageView'))
const SubspaceView = lazy(() => import('./pages/SubspaceView'))

function PlaceholderPage({ title }: { title: string }) {
  return (
    <div className="px-10 pt-12">
      <h1 className="text-[28px] font-bold" style={{ color: 'var(--color-text-primary)' }}>
        {title}
      </h1>
      <p className="mt-2 text-[13px]" style={{ color: 'var(--color-text-muted)' }}>
        Esta seccion esta en construccion.
      </p>
    </div>
  )
}

function RequireAuth() {
  const location = useLocation()

  if (!getAuthToken()) {
    return <Navigate to="/login" replace state={{ from: location }} />
  }

  return <AppLayout />
}

function PublicOnlyRoute({ children }: { children: React.ReactNode }) {
  if (getAuthToken()) return <Navigate to="/" replace />
  return children
}

export default function App() {
  return (
    <BrowserRouter>
      <Suspense fallback={<RouteFallback />}>
        <Routes>
          <Route path="/login" element={<PublicOnlyRoute><LoginPage /></PublicOnlyRoute>} />

          <Route element={<RequireAuth />}>
            <Route path="/" element={<InicioPage />} />
            <Route path="/tareas" element={<DashboardPage />} />
            <Route path="/proyectos" element={<PlaceholderPage title="Proyectos" />} />
            <Route path="/calendario" element={<CalendarPage />} />
            <Route path="/amigos" element={<FriendsPage />} />
            <Route path="/archivo" element={<ArchivePage />} />
            <Route path="/ajustes/*" element={<AjustesPage />} />
            <Route path="/p/:pageId" element={<PageView />} />
            <Route path="/e/:spaceId" element={<SubspaceView />} />
            <Route path="/s/:spaceId" element={<SubspaceView />} />
          </Route>

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  )
}
