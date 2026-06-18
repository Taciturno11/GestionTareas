import {
  AdjustmentsHorizontalIcon,
  CalendarDaysIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  ClockIcon,
} from '@heroicons/react/24/outline'
import {
  addMonths,
  compareAsc,
  eachDayOfInterval,
  endOfMonth,
  endOfWeek,
  format,
  isSameDay,
  isSameMonth,
  isToday,
  isValid,
  parseISO,
  startOfMonth,
  startOfWeek,
  subMonths,
} from 'date-fns'
import { es } from 'date-fns/locale'
import { useEffect, useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'

import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { useTaskSettings } from '@/hooks/useTaskSettings'
import { useTasks } from '@/hooks/useTasks'
import { useWorkspaces } from '@/hooks/useWorkspaces'
import { useProjects } from '@/hooks/useProjects'
import type { Task } from '@/types/task'
import { formatTaskDateRange as formatSharedTaskDateRange } from '@/utils/date.utils'

interface CalendarTask {
  id: string
  title: string
  colId: string
  priority: string
  tag: string
  startDate: string
  endDate: string
  assignee: string
  projectId: string
  color?: string
}

const CALENDAR_VIEW_KEY = 'gt_calendar_view'

function defaultCalendarParams() {
  const savedParams = sessionStorage.getItem(CALENDAR_VIEW_KEY)
  if (savedParams) return new URLSearchParams(savedParams)

  const today = new Date()
  return new URLSearchParams({
    date: format(today, 'yyyy-MM-dd'),
    month: format(today, 'yyyy-MM'),
  })
}

function parseTaskDate(value: string) {
  const dateOnly = value.slice(0, 10)
  const date = parseISO(dateOnly)
  return isValid(date) ? date : null
}

function parseCalendarDate(value: string | null) {
  if (!value) return null
  const date = parseISO(value)
  return isValid(date) ? date : null
}

function parseCalendarMonth(value: string | null) {
  const date = parseCalendarDate(value ? `${value}-01` : null)
  return date ? startOfMonth(date) : null
}

function taskTouchesDate(task: CalendarTask, date: Date) {
  const startDate = parseTaskDate(task.startDate)
  const endDate = parseTaskDate(task.endDate)

  if (startDate && endDate) {
    const first = compareAsc(startDate, endDate) <= 0 ? startDate : endDate
    const last = compareAsc(startDate, endDate) <= 0 ? endDate : startDate
    return date >= first && date <= last
  }

  if (startDate) return isSameDay(startDate, date)
  if (endDate) return isSameDay(endDate, date)
  return false
}

function formatTaskDateRange(task: CalendarTask) {
  return formatSharedTaskDateRange(task.startDate, task.endDate, '->') || 'Sin fecha'
}

function getTaskSortDate(task: CalendarTask) {
  return parseTaskDate(task.startDate) ?? parseTaskDate(task.endDate) ?? new Date(0)
}

function fromApiTasks(tasks: Task[]): CalendarTask[] {
  return tasks.map(task => ({
    id: task.id,
    title: task.title,
    colId: task.status,
    priority: task.priority,
    tag: task.tag,
    startDate: task.startDate?.slice(0, 10) ?? '',
    endDate: task.endDate?.slice(0, 10) ?? '',
    assignee: task.assigneeId ?? task.assignee ?? '',
    projectId: task.projectId ?? '',
    color: task.color ?? undefined,
  }))
}

function ProjectPill({
  projectId,
  projectLabels,
  projectColors,
}: {
  projectId: string
  projectLabels: Record<string, string>
  projectColors: Record<string, string>
}) {
  const color = projectColors[projectId] ?? '#64748B'

  return (
    <span
      className="inline-flex min-w-0 items-center gap-1.5 rounded border px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wider"
      style={{
        background: `${color}14`,
        borderColor: `${color}33`,
        color,
      }}
    >
      <span className="h-1.5 w-1.5 shrink-0 rounded-full" style={{ background: color }} />
      <span className="truncate">{projectLabels[projectId] ?? projectId}</span>
    </span>
  )
}

export default function CalendarPage() {
  const { activeWorkspaceId } = useWorkspaces()
  const { settings, refresh: refreshSettings } = useTaskSettings(activeWorkspaceId)
  const { projects, refresh: refreshProjects } = useProjects(activeWorkspaceId, true)
  const activeProjects = projects.filter(project => !project.archivedAt)
  const { tasks, refresh: refreshTasks } = useTasks<CalendarTask[]>([], {
    workspaceId: activeWorkspaceId,
    fromApi: fromApiTasks,
  })
  const [searchParams, setSearchParams] = useSearchParams(defaultCalendarParams())
  const [isFilterOpen, setIsFilterOpen] = useState(false)
  const selectedDate = parseCalendarDate(searchParams.get('date')) ?? new Date()
  const currentMonth = parseCalendarMonth(searchParams.get('month')) ?? startOfMonth(selectedDate)
  const projectFilter = searchParams.get('project') || 'all'

  useEffect(() => {
    const serializedParams = searchParams.toString()
    sessionStorage.setItem(CALENDAR_VIEW_KEY, serializedParams)

    if (!window.location.search && serializedParams) {
      setSearchParams(searchParams, { replace: true })
    }
  }, [searchParams, setSearchParams])

  function updateCalendarParams(updates: Record<string, string | null>) {
    setSearchParams(currentParams => {
      const nextParams = new URLSearchParams(currentParams)

      Object.entries(updates).forEach(([key, value]) => {
        if (value === null || value === '' || value === 'all') {
          nextParams.delete(key)
        } else {
          nextParams.set(key, value)
        }
      })

      return nextParams
    }, { replace: true })
  }

  const projectLabels = useMemo(
    () => Object.fromEntries(projects.map(project => [project.id, project.name])),
    [projects]
  )
  const projectColors = useMemo(
    () => Object.fromEntries(projects.map(project => [project.id, project.color ?? '#64748B'])),
    [projects]
  )
  const statusLabels = useMemo(
    () => Object.fromEntries(settings.statuses.map(status => [status.id, status.label])),
    [settings.statuses]
  )
  const priorityColors = useMemo(
    () => Object.fromEntries(settings.priorities.map(priority => [priority.id, priority])),
    [settings.priorities]
  )

  const monthStart = startOfMonth(currentMonth)
  const monthDays = eachDayOfInterval({
    start: startOfWeek(monthStart, { weekStartsOn: 1 }),
    end: endOfWeek(endOfMonth(monthStart), { weekStartsOn: 1 }),
  })

  const filteredTasks = useMemo(() => {
    const nextTasks = projectFilter === 'all'
      ? tasks
      : tasks.filter(task => task.projectId === projectFilter)

    return nextTasks.sort((a, b) => compareAsc(getTaskSortDate(a), getTaskSortDate(b)))
  }, [projectFilter, tasks])

  const selectedDateTasks = filteredTasks.filter(task => taskTouchesDate(task, selectedDate))
  const selectedProjectLabel = projectFilter === 'all'
    ? 'Todos los proyectos'
    : projectLabels[projectFilter] ?? projectFilter

  function refreshData() {
    void Promise.all([refreshTasks(), refreshSettings(), refreshProjects()])
  }

  return (
    <div className="flex h-full flex-col bg-[#F7F6F3]">
      <div className="border-b border-gray-200 px-10 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => updateCalendarParams({
                month: format(subMonths(currentMonth, 1), 'yyyy-MM'),
              })}
              className="flex h-8 w-8 items-center justify-center rounded-md text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-800"
              title="Mes anterior"
            >
              <ChevronLeftIcon className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={() => updateCalendarParams({
                month: format(addMonths(currentMonth, 1), 'yyyy-MM'),
              })}
              className="flex h-8 w-8 items-center justify-center rounded-md text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-800"
              title="Mes siguiente"
            >
              <ChevronRightIcon className="h-4 w-4" />
            </button>
            <h2 className="ml-2 text-[18px] font-semibold capitalize text-gray-900">
              {format(currentMonth, 'MMMM yyyy', { locale: es })}
            </h2>
          </div>

          <div className="flex items-center gap-2">
            <Popover open={isFilterOpen} onOpenChange={setIsFilterOpen}>
              <PopoverTrigger className={`flex items-center gap-1.5 rounded-md px-3 py-1.5 text-[13px] font-medium transition-colors ${
                projectFilter !== 'all'
                  ? 'bg-[#6472EB]/10 text-[#6472EB]'
                  : 'text-gray-500 hover:bg-gray-100 hover:text-gray-700'
              }`}
              >
                <AdjustmentsHorizontalIcon className="h-4 w-4" />
                Filtrar
                {projectFilter !== 'all' && (
                  <span className="max-w-[120px] truncate text-[12px] font-semibold">
                    {selectedProjectLabel}
                  </span>
                )}
              </PopoverTrigger>
              <PopoverContent className="w-48 gap-1 p-1.5" align="end">
                <button
                  type="button"
                  onClick={() => {
                    updateCalendarParams({ project: null })
                    setIsFilterOpen(false)
                  }}
                  className={`flex w-full items-center justify-between rounded-md px-2 py-1.5 text-left text-[13px] transition-colors ${
                    projectFilter === 'all'
                      ? 'bg-[#6472EB]/10 font-semibold text-[#6472EB]'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-800'
                  }`}
                >
                  <span>Todos</span>
                  {projectFilter === 'all' && <span className="h-1.5 w-1.5 rounded-full bg-[#6472EB]" />}
                </button>

                {activeProjects.map(project => {
                  const color = project.color ?? '#64748B'
                  const isSelected = projectFilter === project.id

                  return (
                    <button
                      key={project.id}
                      type="button"
                      onClick={() => {
                        updateCalendarParams({ project: project.id })
                        setIsFilterOpen(false)
                      }}
                      className={`flex w-full items-center justify-between gap-2 rounded-md px-2 py-1.5 text-left text-[13px] transition-colors ${
                        isSelected
                          ? 'bg-[#6472EB]/10 font-semibold text-[#6472EB]'
                          : 'text-gray-600 hover:bg-gray-50 hover:text-gray-800'
                      }`}
                    >
                      <span className="flex min-w-0 items-center gap-2">
                        <span className="h-2 w-2 shrink-0 rounded-full" style={{ background: color }} />
                        <span className="truncate">{project.name}</span>
                      </span>
                      {isSelected && <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-[#6472EB]" />}
                    </button>
                  )
                })}
              </PopoverContent>
            </Popover>

            <button
              type="button"
              onClick={refreshData}
              className="rounded-md px-3 py-1.5 text-[13px] font-medium text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-700"
            >
              Actualizar
            </button>

            <button
              type="button"
              onClick={() => {
                const today = new Date()
                updateCalendarParams({
                  date: format(today, 'yyyy-MM-dd'),
                  month: format(today, 'yyyy-MM'),
                })
              }}
              className="rounded-md bg-[#6472EB] px-3 py-1.5 text-[13px] font-semibold text-white shadow-sm transition-colors hover:bg-[#5360D8]"
            >
              Hoy
            </button>
          </div>
        </div>
      </div>

      <div className="grid min-h-0 flex-1 grid-cols-[minmax(0,1fr)_320px] gap-0">
        <div className="min-w-0 overflow-auto px-10 py-6">
          <div className="grid grid-cols-7 border-l border-t border-gray-200 bg-white shadow-sm">
            {['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'].map(day => (
              <div
                key={day}
                className="border-b border-r border-gray-200 bg-gray-50 px-3 py-2 text-[11px] font-semibold uppercase tracking-wide text-gray-400"
              >
                {day}
              </div>
            ))}

            {monthDays.map(day => {
              const dayTasks = filteredTasks.filter(task => taskTouchesDate(task, day))
              const isSelected = isSameDay(day, selectedDate)

              return (
                <button
                  key={day.toISOString()}
                  type="button"
                  onClick={() => updateCalendarParams({
                    date: format(day, 'yyyy-MM-dd'),
                    month: format(day, 'yyyy-MM'),
                  })}
                  className={`min-h-[126px] border-b border-r border-gray-200 p-2 text-left align-top transition-colors ${
                    isSelected
                      ? 'bg-[#6472EB]/5 ring-1 ring-inset ring-[#6472EB]/40'
                      : isSameMonth(day, currentMonth)
                        ? 'bg-white hover:bg-gray-50'
                        : 'bg-gray-50/60 text-gray-300 hover:bg-gray-50'
                  }`}
                >
                  <div className="mb-2 flex items-center justify-between">
                    <span className={`flex h-6 w-6 items-center justify-center rounded-full text-[12px] font-semibold ${
                      isToday(day)
                        ? 'bg-[#6472EB] text-white'
                        : isSameMonth(day, currentMonth)
                          ? 'text-gray-700'
                          : 'text-gray-300'
                    }`}
                    >
                      {format(day, 'd')}
                    </span>
                    {dayTasks.length > 0 && (
                      <span className="text-[11px] font-semibold text-gray-400">{dayTasks.length}</span>
                    )}
                  </div>

                  <div className="space-y-1">
                    {dayTasks.slice(0, 3).map(task => {
                      const color = projectColors[task.projectId] ?? '#64748B'
                      return (
                        <div
                          key={task.id}
                          className="truncate rounded border px-1.5 py-1 text-[11px] font-medium"
                          style={{
                            background: `${color}10`,
                            borderColor: `${color}2E`,
                            color,
                          }}
                        >
                          {task.title || 'Tarea sin titulo'}
                        </div>
                      )
                    })}
                    {dayTasks.length > 3 && (
                      <div className="px-1 text-[11px] font-medium text-gray-400">
                        +{dayTasks.length - 3} más
                      </div>
                    )}
                  </div>
                </button>
              )
            })}
          </div>
        </div>

        <aside className="min-h-0 border-l border-gray-200 bg-white">
          <div className="border-b border-gray-100 px-5 py-4">
            <p className="text-[12px] font-semibold uppercase tracking-wide text-gray-400">
              Día seleccionado
            </p>
            <h3 className="mt-1 text-[18px] font-semibold capitalize text-gray-900">
              {format(selectedDate, "EEEE d 'de' MMMM", { locale: es })}
            </h3>
          </div>

          <div className="h-full overflow-y-auto px-4 py-4">
            {selectedDateTasks.length === 0 ? (
              <div className="rounded-lg border border-dashed border-gray-200 px-4 py-8 text-center">
                <CalendarDaysIcon className="mx-auto h-6 w-6 text-gray-300" />
                <p className="mt-2 text-[13px] font-medium text-gray-500">Sin tareas</p>
                <p className="mt-1 text-[12px] text-gray-400">
                  No hay tareas con fecha para este día.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {selectedDateTasks.map(task => {
                  const priority = priorityColors[task.priority]
                  const projectColor = projectColors[task.projectId] ?? '#64748B'

                  return (
                    <div
                      key={task.id}
                      className="rounded-lg border border-gray-200 bg-white p-3 shadow-sm"
                      style={{ borderLeft: `3px solid ${projectColor}` }}
                    >
                      <p className="text-[13px] font-semibold leading-snug text-gray-900">
                        {task.title || 'Tarea sin titulo'}
                      </p>
                      <div className="mt-2 flex flex-wrap items-center gap-1.5">
                        <ProjectPill
                          projectId={task.projectId}
                          projectLabels={projectLabels}
                          projectColors={projectColors}
                        />
                        <span
                          className="rounded border px-1.5 py-0.5 text-[10px] font-semibold"
                          style={{
                            background: priority?.bg ?? '#F1F5F9',
                            borderColor: `${priority?.text ?? '#64748B'}24`,
                            color: priority?.text ?? '#64748B',
                          }}
                        >
                          {task.priority}
                        </span>
                      </div>
                      <div className="mt-3 flex items-center gap-1.5 text-[11px] font-medium text-gray-500">
                        <ClockIcon className="h-3.5 w-3.5" />
                        {formatTaskDateRange(task)}
                      </div>
                      <p className="mt-1 text-[11px] text-gray-400">
                        Estado: {statusLabels[task.colId] ?? task.colId}
                      </p>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        </aside>
      </div>
    </div>
  )
}
