import { ClipboardDocumentListIcon } from '@heroicons/react/24/outline'
import { Suspense, lazy, useEffect, useState } from 'react'
import { Link, Navigate, useParams } from 'react-router-dom'

import RouteFallback from '@/components/RouteFallback/RouteFallback'
import { findWorkspacePage, updateWorkspacePage, WORKSPACE_DATA_CHANGE_EVENT } from '@/data/workspaces'
import type { WorkspacePage } from '@/types/workspace'

const BoardPage = lazy(() => import('./BoardPage'))
const DatabaseDiagramPage = lazy(() => import('./DatabaseDiagramPage'))
const TextPage = lazy(() => import('./TextPage'))

export default function PageView() {
  const { pageId } = useParams()
  const [page, setPage] = useState<WorkspacePage | null>(() => (
    pageId ? findWorkspacePage(pageId) : null
  ))

  useEffect(() => {
    if (!pageId) return

    const syncPage = () => setPage(findWorkspacePage(pageId))

    syncPage()
    window.addEventListener(WORKSPACE_DATA_CHANGE_EVENT, syncPage)
    return () => window.removeEventListener(WORKSPACE_DATA_CHANGE_EVENT, syncPage)
  }, [pageId])

  if (!pageId) return <Navigate to="/" replace />
  if (!page) {
    return (
      <div className="px-10 py-10">
        <h1 className="text-[24px] font-bold text-gray-900">Pagina no encontrada</h1>
        <p className="mt-2 text-[13px] text-gray-500">Esta hoja no existe o fue eliminada.</p>
      </div>
    )
  }

  function handleChange(patch: Partial<WorkspacePage>) {
    if (!page) return
    const nextPage = { ...page, ...patch, updatedAt: new Date().toISOString() }
    setPage(nextPage)
    updateWorkspacePage(page.id, patch)
  }

  if (page.type === 'blank' || page.type === 'text') {
    return (
      <Suspense fallback={<RouteFallback />}>
        <TextPage page={page} onChange={handleChange} />
      </Suspense>
    )
  }

  if (page.type === 'board') {
    return (
      <Suspense fallback={<RouteFallback />}>
        <BoardPage page={page} onChange={handleChange} />
      </Suspense>
    )
  }

  if (page.type === 'database') {
    return (
      <Suspense fallback={<RouteFallback />}>
        <DatabaseDiagramPage page={page} onChange={handleChange} />
      </Suspense>
    )
  }

  return (
    <div className="mx-auto w-full max-w-[900px] px-10 py-10">
      <div className="mb-8 flex h-12 w-12 items-center justify-center rounded-xl bg-[#6472EB]/10 text-[#6472EB]">
        <ClipboardDocumentListIcon className="h-6 w-6" />
      </div>
      <input
        value={page.title}
        onChange={event => handleChange({ title: event.target.value })}
        className="mb-3 w-full border-none bg-transparent text-[34px] font-bold tracking-tight text-gray-900 outline-none placeholder:text-gray-300"
      />
      <p className="max-w-[560px] text-[14px] leading-6 text-gray-500">
        Hoja de tareas creada. Siguiente paso: conectar esta hoja con tareas filtradas por `pageId`.
      </p>
      <Link
        to="/tareas"
        className="mt-6 inline-flex rounded-md bg-[#6472EB] px-3 py-1.5 text-[13px] font-semibold text-white transition-colors hover:bg-[#5360D8]"
      >
        Abrir Mis tareas
      </Link>
    </div>
  )
}
