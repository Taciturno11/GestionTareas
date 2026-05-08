import { DocumentTextIcon } from '@heroicons/react/24/outline'
import { useEffect, useMemo, useState } from 'react'
import { Link, Navigate, useParams } from 'react-router-dom'

import PageContainer from '@/components/PageContainer/PageContainer'
import {
  findWorkspaceSpace,
  loadWorkspacePages,
  updateWorkspaceSpace,
  WORKSPACE_DATA_CHANGE_EVENT,
} from '@/data/workspaces'
import type { WorkspacePage, WorkspaceSpace } from '@/types/workspace'

export default function SubspaceView() {
  const { spaceId } = useParams()
  const [space, setSpace] = useState<WorkspaceSpace | null>(() => (
    spaceId ? findWorkspaceSpace(spaceId) : null
  ))
  const [pages, setPages] = useState<WorkspacePage[]>(() => loadWorkspacePages())

  useEffect(() => {
    if (!spaceId) return

    const syncSpace = () => {
      setSpace(findWorkspaceSpace(spaceId))
      setPages(loadWorkspacePages())
    }

    syncSpace()
    window.addEventListener(WORKSPACE_DATA_CHANGE_EVENT, syncSpace)
    return () => window.removeEventListener(WORKSPACE_DATA_CHANGE_EVENT, syncSpace)
  }, [spaceId])

  const spacePages = useMemo(() => (
    spaceId ? pages.filter(page => page.spaceId === spaceId) : []
  ), [pages, spaceId])

  if (!spaceId) return <Navigate to="/" replace />

  if (!space) {
    return (
      <PageContainer size="wide">
        <h1 className="text-[24px] font-bold text-gray-900">Subespacio no encontrado</h1>
        <p className="mt-2 text-[13px] text-gray-500">Este espacio no existe o fue eliminado.</p>
      </PageContainer>
    )
  }

  function handleChange(patch: Partial<Omit<WorkspaceSpace, 'id'>>) {
    if (!space) return
    const nextSpace = { ...space, ...patch, updatedAt: new Date().toISOString() }
    setSpace(nextSpace)
    updateWorkspaceSpace(space.id, patch)
  }

  return (
    <PageContainer size="wide">
      <input
        value={space.name}
        onChange={event => handleChange({ name: event.target.value })}
        placeholder="Espacio sin titulo"
        className="cursor-text-dark mb-5 w-full border-none bg-transparent text-[34px] font-bold tracking-tight text-gray-900 caret-gray-900 outline-none placeholder:text-gray-300"
      />

      <textarea
        value={space.description ?? ''}
        onChange={event => handleChange({ description: event.target.value })}
        placeholder="Agrega una descripcion..."
        className="cursor-text-dark min-h-[180px] w-full resize-none rounded-xl border border-transparent bg-transparent px-0 py-1 text-[15px] leading-7 text-gray-700 caret-gray-900 outline-none placeholder:text-gray-400 focus:border-transparent focus:ring-0"
      />

      <section className="mt-8 border-t border-gray-200 pt-5">
        <h2 className="mb-3 text-[12px] font-semibold uppercase tracking-widest text-gray-400">
          Hojas
        </h2>

        {spacePages.length ? (
          <div className="space-y-1">
            {spacePages.map(page => (
              <Link
                key={page.id}
                to={`/p/${page.id}`}
                className="flex cursor-pointer items-center gap-2 rounded-md px-2 py-1.5 text-[14px] text-gray-700 transition-colors hover:bg-gray-100 hover:text-gray-950"
              >
                <DocumentTextIcon className="h-4 w-4 shrink-0 text-gray-400" />
                <span className="truncate">{page.title}</span>
              </Link>
            ))}
          </div>
        ) : (
          <p className="text-[13px] text-gray-400">Aun no hay hojas dentro de este espacio.</p>
        )}
      </section>
    </PageContainer>
  )
}
