import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import AppLayout from './components/AppLayout/AppLayout'
import DashboardPage from './pages/DashboardPage'
import InicioPage from './pages/InicioPage'
import LoginPage from './pages/LoginPage'

// Páginas placeholder para rutas futuras
function PlaceholderPage({ title }: { title: string }) {
  return (
    <div className="px-10 pt-12">
      <h1 className="text-[28px] font-bold" style={{ color: 'var(--color-text-primary)' }}>
        {title}
      </h1>
      <p className="mt-2 text-[13px]" style={{ color: 'var(--color-text-muted)' }}>
        Esta sección está en construcción.
      </p>
    </div>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Ruta pública */}
        <Route path="/login" element={<LoginPage />} />

        {/* Rutas privadas: envueltas en AppLayout */}
        <Route element={<AppLayout />}>
          <Route path="/"           element={<InicioPage />} />
          <Route path="/tareas"     element={<DashboardPage />} />
          <Route path="/proyectos"  element={<PlaceholderPage title="Proyectos" />} />
          <Route path="/calendario" element={<PlaceholderPage title="Calendario" />} />
          <Route path="/archivo"    element={<PlaceholderPage title="Archivo" />} />
        </Route>

        {/* Catch-all */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}
