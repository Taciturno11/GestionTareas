import { ArchiveBoxIcon, ArrowUturnLeftIcon } from '@heroicons/react/24/outline'
import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'

import PageContainer from '@/components/PageContainer/PageContainer'
import {
  loadActiveWorkspaceId,
  loadWorkspacePages,
  loadWorkspaceSpaces,
  updateWorkspaceSpace,
  WORKSPACE_DATA_CHANGE_EVENT,
} from '@/data/workspaces'
import type { WorkspacePage, WorkspaceSpace } from '@/types/workspace'

export default function ArchivePage() {
  const navigate = useNavigate()
  const [spaces, setSpaces] = useState<WorkspaceSpace[]>(() => loadWorkspaceSpaces())
  const [pages, setPages] = useState<WorkspacePage[]>(() => loadWorkspacePages())
  const [activeWorkspaceId, setActiveWorkspaceId] = useState(() => loadActiveWorkspaceId())

  useEffect(() => {
    const syncData = () => {
      setSpaces(loadWorkspaceSpaces())
      setPages(loadWorkspacePages())
      setActiveWorkspaceId(loadActiveWorkspaceId())
    }

    window.addEventListener(WORKSPACE_DATA_CHANGE_EVENT, syncData)
    return () => window.removeEventListener(WORKSPACE_DATA_CHANGE_EVENT, syncData)
  }, [])

  const archivedSpaces = spaces.filter(space =>
    space.workspaceId === activeWorkspaceId && !space.parentId && space.archived
  )

  function restoreSpace(space: WorkspaceSpace) {
    updateWorkspaceSpace(space.id, {
      archived: false,
      archivedAt: undefined,
    })
    setSpaces(loadWorkspaceSpaces())
    navigate(`/e/${space.id}`)
  }

  function getContentCount(space: WorkspaceSpace) {
    const childSpaceIds = spaces.filter(child => child.parentId === space.id).map(child => child.id)
    const relatedSpaceIds = new Set([space.id, ...childSpaceIds])
    const pageCount = pages.filter(page => relatedSpaceIds.has(page.spaceId)).length

    return {
      childCount: childSpaceIds.length,
      pageCount,
    }
  }

  return (
    <PageContainer size="wide" align="start">
      <div className="mb-7">
        <h1 className="text-[28px] font-bold text-gray-900">Archivo</h1>
        <p className="mt-1 text-[13px] text-gray-500">
          Espacios archivados. Al desarchivar, vuelven con todos sus subespacios y hojas.
        </p>
      </div>

      {archivedSpaces.length ? (
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          {archivedSpaces.map(space => {
            const { childCount, pageCount } = getContentCount(space)

            return (
              <article
                key={space.id}
                className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm"
              >
                <div className="mb-4 flex items-start justify-between gap-3">
                  <div className="flex min-w-0 items-center gap-3">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-gray-100 text-gray-500">
                      <ArchiveBoxIcon className="h-5 w-5" />
                    </div>
                    <div className="min-w-0">
                      <h2 className="truncate text-[14px] font-semibold text-gray-900">{space.name}</h2>
                      <p className="mt-0.5 text-[12px] text-gray-400">
                        {childCount} subespacios · {pageCount} hojas
                      </p>
                    </div>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => restoreSpace(space)}
                  className="flex h-9 w-full items-center justify-center gap-2 rounded-lg border border-gray-200 text-[13px] font-medium text-gray-600 transition-colors hover:bg-gray-50 hover:text-gray-900"
                >
                  <ArrowUturnLeftIcon className="h-4 w-4" />
                  Desarchivar
                </button>
              </article>
            )
          })}
        </div>
      ) : (
        <div className="rounded-xl border border-dashed border-gray-300 bg-white/60 p-8 text-center">
          <ArchiveBoxIcon className="mx-auto h-8 w-8 text-gray-300" />
          <p className="mt-3 text-[14px] font-medium text-gray-600">No hay espacios archivados.</p>
          <p className="mt-1 text-[13px] text-gray-400">Archiva un espacio desde el menu de anticlick.</p>
        </div>
      )}
    </PageContainer>
  )
}
