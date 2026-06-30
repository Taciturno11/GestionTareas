import { ArchiveBoxIcon, ArrowRightIcon, ArrowUturnLeftIcon } from '@heroicons/react/24/outline'
import { useQuery } from '@tanstack/react-query'
import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'

import PageContainer from '@/components/PageContainer/PageContainer'
import {
  loadActiveWorkspaceId,
  loadWorkspaceSpaces,
  updateWorkspaceSpace,
  WORKSPACE_DATA_CHANGE_EVENT,
} from '@/data/workspaces'
import type { WorkspaceSpace } from '@/types/workspace'
import { usePageSummaries } from '@/hooks/usePages'
import { tasksApi } from '@/api/tasks.api'

export default function ArchivePage() {
  const navigate = useNavigate()
  const [spaces, setSpaces] = useState<WorkspaceSpace[]>(() => loadWorkspaceSpaces())
  const [activeWorkspaceId, setActiveWorkspaceId] = useState(() => loadActiveWorkspaceId())
  const { data: pages = [] } = usePageSummaries(activeWorkspaceId)
  const archivedTasksQuery = useQuery({
    queryKey: ['tasks', activeWorkspaceId, 'archived'],
    queryFn: () => tasksApi.list(activeWorkspaceId!, undefined, true),
    enabled: Boolean(activeWorkspaceId),
  })

  useEffect(() => {
    const syncData = () => {
      setSpaces(loadWorkspaceSpaces())
      setActiveWorkspaceId(loadActiveWorkspaceId())
    }

    window.addEventListener(WORKSPACE_DATA_CHANGE_EVENT, syncData)
    return () => window.removeEventListener(WORKSPACE_DATA_CHANGE_EVENT, syncData)
  }, [])

  const archivedSpaces = spaces.filter(space =>
    space.workspaceId === activeWorkspaceId && !space.parentId && space.archived
  )
  const archivedTasks = (archivedTasksQuery.data ?? []).filter(task => task.archivedAt)

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
          Espacios y tareas archivadas. Al restaurar, vuelven a su ubicacion original.
        </p>
      </div>

      <section>
        <h2 className="mb-3 text-[15px] font-semibold text-gray-900">Espacios archivados</h2>

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
      </section>

      <section className="mt-8">
        <h2 className="mb-3 text-[15px] font-semibold text-gray-900">Tareas</h2>

        <button
          type="button"
          onClick={() => navigate('/archivo/tareas')}
          className="group flex w-full max-w-[380px] items-center justify-between gap-4 rounded-xl border border-gray-200 bg-white p-4 text-left shadow-sm transition-colors hover:border-amber-200 hover:bg-amber-50/40"
        >
          <span className="flex min-w-0 items-center gap-3">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-amber-50 text-amber-600">
              <ArchiveBoxIcon className="h-5 w-5" />
            </span>
            <span className="min-w-0">
              <span className="block truncate text-[14px] font-semibold text-gray-900">Tareas archivadas</span>
              <span className="mt-0.5 block text-[12px] text-gray-500">
                {archivedTasks.length} tareas · Tareas completadas que salieron del Kanban
              </span>
              <span className="mt-2 inline-flex items-center gap-1 text-[12px] font-semibold text-amber-600">
                Ver tareas
                <ArrowRightIcon className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
              </span>
            </span>
          </span>
        </button>
      </section>
    </PageContainer>
  )
}
