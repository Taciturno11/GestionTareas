import { ArchiveBoxIcon, ArrowLeftIcon, ArrowUturnLeftIcon } from '@heroicons/react/24/outline'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'

import { tasksApi } from '@/api/tasks.api'
import PageContainer from '@/components/PageContainer/PageContainer'
import { TaskSelect } from '@/components/ui/task-select'
import { loadActiveWorkspaceId, WORKSPACE_DATA_CHANGE_EVENT } from '@/data/workspaces'
import { useProjects } from '@/hooks/useProjects'
import { useTaskSettings } from '@/hooks/useTaskSettings'
import { formatTaskDateRange } from '@/utils/date.utils'

export default function ArchivedTasksPage() {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const [activeWorkspaceId, setActiveWorkspaceId] = useState(() => loadActiveWorkspaceId())
  const [searchTerm, setSearchTerm] = useState('')
  const [projectFilter, setProjectFilter] = useState('all')
  const [tagFilter, setTagFilter] = useState('all')
  const [priorityFilter, setPriorityFilter] = useState('all')
  const [statusFilter, setStatusFilter] = useState('all')
  const { projects } = useProjects(activeWorkspaceId, true)
  const { settings } = useTaskSettings(activeWorkspaceId)
  const archivedTasksQuery = useQuery({
    queryKey: ['tasks', activeWorkspaceId, 'archived'],
    queryFn: () => tasksApi.list(activeWorkspaceId!, undefined, true),
    enabled: Boolean(activeWorkspaceId),
  })

  useEffect(() => {
    const syncWorkspace = () => setActiveWorkspaceId(loadActiveWorkspaceId())

    window.addEventListener(WORKSPACE_DATA_CHANGE_EVENT, syncWorkspace)
    return () => window.removeEventListener(WORKSPACE_DATA_CHANGE_EVENT, syncWorkspace)
  }, [])

  const archivedTasks = (archivedTasksQuery.data ?? []).filter(task => task.archivedAt)
  const projectLabels = Object.fromEntries(projects.map(project => [project.id, project.name]))
  const statusLabels = Object.fromEntries(settings.statuses.map(status => [status.id, status.label]))
  const normalizedSearch = searchTerm.trim().toLowerCase()
  const filteredTasks = archivedTasks.filter(task => {
    const matchesSearch = !normalizedSearch || task.title.toLowerCase().includes(normalizedSearch)
    const matchesProject = projectFilter === 'all' || (projectFilter === 'none' ? !task.projectId : task.projectId === projectFilter)
    const matchesTag = tagFilter === 'all' || task.tag === tagFilter
    const matchesPriority = priorityFilter === 'all' || task.priority === priorityFilter
    const matchesStatus = statusFilter === 'all' || task.status === statusFilter

    return matchesSearch && matchesProject && matchesTag && matchesPriority && matchesStatus
  })
  const hasActiveFilters = Boolean(
    normalizedSearch
      || projectFilter !== 'all'
      || tagFilter !== 'all'
      || priorityFilter !== 'all'
      || statusFilter !== 'all',
  )
  const selectTriggerClass = 'h-10 w-full rounded-xl text-[13px] shadow-sm'

  function clearFilters() {
    setSearchTerm('')
    setProjectFilter('all')
    setTagFilter('all')
    setPriorityFilter('all')
    setStatusFilter('all')
  }

  async function restoreTask(taskId: string) {
    await tasksApi.restore(taskId)
    await queryClient.invalidateQueries({ queryKey: ['tasks', activeWorkspaceId] })
    await queryClient.invalidateQueries({ queryKey: ['tasks', activeWorkspaceId, 'archived'] })
  }

  return (
    <PageContainer size="wide" align="start">
      <div className="mb-7 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-[28px] font-bold text-gray-900">Tareas archivadas</h1>
          <p className="mt-1 text-[13px] text-gray-500">
            Tareas completadas que salieron del Kanban. Puedes restaurarlas cuando las necesites.
          </p>
        </div>

        <button
          type="button"
          onClick={() => navigate('/archivo')}
          className="inline-flex h-10 items-center justify-center gap-2 rounded-lg border border-gray-200 bg-white px-4 text-[13px] font-medium text-gray-600 shadow-sm transition-colors hover:bg-gray-50 hover:text-gray-900"
        >
          <ArrowLeftIcon className="h-4 w-4" />
          Volver a Archivo
        </button>
      </div>

      <section className="mb-5 rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
        <div className="grid gap-3 lg:grid-cols-[minmax(220px,1.4fr)_repeat(4,minmax(150px,1fr))_auto]">
          <input
            value={searchTerm}
            onChange={event => setSearchTerm(event.target.value)}
            placeholder="Buscar por titulo"
            className="cursor-text-dark h-10 w-full rounded-xl border border-gray-200 bg-white px-3 text-[13px] text-gray-700 caret-gray-900 outline-none transition placeholder:text-gray-400 focus:border-indigo-500 focus:ring-3 focus:ring-indigo-500/15"
          />
          <TaskSelect
            value={projectFilter}
            options={[
              { value: 'all', label: 'Todos los proyectos' },
              { value: 'none', label: 'Sin proyecto' },
              ...projects.map(project => ({ value: project.id, label: project.name })),
            ]}
            onChange={setProjectFilter}
            triggerClassName={selectTriggerClass}
          />
          <TaskSelect
            value={tagFilter}
            options={[
              { value: 'all', label: 'Todas las etiquetas' },
              ...settings.labels.map(label => ({ value: label.id, label: label.label })),
            ]}
            onChange={setTagFilter}
            triggerClassName={selectTriggerClass}
          />
          <TaskSelect
            value={priorityFilter}
            options={[
              { value: 'all', label: 'Todas las prioridades' },
              ...settings.priorities.map(priority => ({ value: priority.id, label: priority.label })),
            ]}
            onChange={setPriorityFilter}
            triggerClassName={selectTriggerClass}
          />
          <TaskSelect
            value={statusFilter}
            options={[
              { value: 'all', label: 'Todos los estados' },
              ...settings.statuses.map(status => ({ value: status.id, label: status.label })),
            ]}
            onChange={setStatusFilter}
            triggerClassName={selectTriggerClass}
          />
          <button
            type="button"
            onClick={clearFilters}
            disabled={!hasActiveFilters}
            className="h-10 whitespace-nowrap rounded-xl border border-gray-200 bg-white px-4 text-[13px] font-medium text-gray-600 shadow-sm transition-colors hover:bg-gray-50 hover:text-gray-900 disabled:cursor-not-allowed disabled:opacity-45"
          >
            Limpiar filtros
          </button>
        </div>

        <p className="mt-3 text-[12px] text-gray-500">
          Mostrando {filteredTasks.length} de {archivedTasks.length} tareas archivadas
        </p>
      </section>

      {archivedTasks.length > 0 && filteredTasks.length === 0 ? (
        <div className="rounded-xl border border-dashed border-gray-300 bg-white/60 p-8 text-center">
          <ArchiveBoxIcon className="mx-auto h-8 w-8 text-gray-300" />
          <p className="mt-3 text-[14px] font-medium text-gray-600">No hay tareas archivadas que coincidan con los filtros.</p>
          <p className="mt-1 text-[13px] text-gray-400">Prueba limpiando filtros o cambiando la busqueda.</p>
        </div>
      ) : archivedTasks.length ? (
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          {filteredTasks.map(task => (
            <article
              key={task.id}
              className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm"
            >
              <div className="mb-4 flex items-start gap-3">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-amber-50 text-amber-600">
                  <ArchiveBoxIcon className="h-5 w-5" />
                </div>
                <div className="min-w-0">
                  <h2 className="truncate text-[14px] font-semibold text-gray-900">{task.title}</h2>
                  <p className="mt-1 text-[12px] text-gray-500">
                    {projectLabels[task.projectId ?? ''] ?? 'Sin proyecto'} · {statusLabels[task.status] ?? task.status}
                  </p>
                  <p className="mt-1 text-[12px] text-gray-400">
                    {formatTaskDateRange(task.startDate?.slice(0, 10) ?? '—', task.endDate?.slice(0, 10) ?? '—') || 'Sin fechas'}
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => void restoreTask(task.id)}
                className="flex h-9 w-full items-center justify-center gap-2 rounded-lg border border-gray-200 text-[13px] font-medium text-gray-600 transition-colors hover:bg-gray-50 hover:text-gray-900"
              >
                <ArrowUturnLeftIcon className="h-4 w-4" />
                Restaurar
              </button>
            </article>
          ))}
        </div>
      ) : (
        <div className="rounded-xl border border-dashed border-gray-300 bg-white/60 p-8 text-center">
          <ArchiveBoxIcon className="mx-auto h-8 w-8 text-gray-300" />
          <p className="mt-3 text-[14px] font-medium text-gray-600">No hay tareas archivadas.</p>
          <p className="mt-1 text-[13px] text-gray-400">Archiva tareas hechas desde Mis tareas.</p>
        </div>
      )}
    </PageContainer>
  )
}
