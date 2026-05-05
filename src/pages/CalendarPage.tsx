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
import { useMemo, useState } from 'react'

import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { loadTaskSettings } from '@/data/taskSettings'

interface CalendarTask {
  id: number
  title: string
  colId: string
  priority: string
  tag: string
  startDate: string
  endDate: string
  assignee: string
  workspaceId: string
  color?: string
}

const TASKS_KEY = 'gt_tasks'

function parseTaskDate(value: string) {
  const date = parseISO(value)
  return isValid(date) ? date : null
}

function loadCalendarTasks(): CalendarTask[] {
  const saved = localStorage.getItem(TASKS_KEY)
  if (!saved) return []

  try {
    const parsed = JSON.parse(saved)
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
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
  const startDate = parseTaskDate(task.startDate)
  const endDate = parseTaskDate(task.endDate)

  if (!startDate && !endDate) return 'Sin fecha'
  if (startDate && (!endDate || isSameDay(startDate, endDate))) {
    return format(startDate, 'd MMM', { locale: es })
  }
  if (!startDate && endDate) return format(endDate, 'd MMM', { locale: es })

  return `${format(startDate!, 'd MMM', { locale: es })} -> ${format(endDate!, 'd MMM', { locale: es })}`
}

function getTaskSortDate(task: CalendarTask) {
  return parseTaskDate(task.startDate) ?? parseTaskDate(task.endDate) ?? new Date(0)
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
  const [settings, setSettings] = useState(() => loadTaskSettings())
  const [tasks, setTasks] = useState<CalendarTask[]>(() => loadCalendarTasks())
  const [currentMonth, setCurrentMonth] = useState(() => startOfMonth(new Date()))
  const [selectedDate, setSelectedDate] = useState(() => new Date())
  const [projectFilter, setProjectFilter] = useState('all')
  const [isFilterOpen, setIsFilterOpen] = useState(false)

  const projectLabels = useMemo(
    () => Object.fromEntries(settings.projects.map(project => [project.id, project.label])),
    [settings.projects]
  )
  const projectColors = useMemo(
    () => Object.fromEntries(settings.projects.map(project => [project.id, project.color ?? '#64748B'])),
    [settings.projects]
  )
  const statusLabels = useMemo(
    () => Object.fromEntries(settings.statuses.map(status => [status.id, status.label])),
    [settings.statuses]
  )
  const priorityColors = useMemo(
    () => Object.fromEntries(settings.priorities.map(priority => [priority.id, priority])),
    [settings.priorities]
  )

  const monthDays = useMemo(() => {
    const start = startOfWeek(startOfMonth(currentMonth), { weekStartsOn: 1 })
    const end = endOfWeek(endOfMonth(currentMonth), { weekStartsOn: 1 })
    return eachDayOfInterval({ start, end })
  }, [currentMonth])

  const filteredTasks = useMemo(() => {
    const nextTasks = projectFilter === 'all'
      ? tasks
      : tasks.filter(task => task.workspaceId === projectFilter)

    return nextTasks.sort((a, b) => compareAsc(getTaskSortDate(a), getTaskSortDate(b)))
  }, [projectFilter, tasks])

  const selectedDateTasks = filteredTasks.filter(task => taskTouchesDate(task, selectedDate))
  const selectedProjectLabel = projectFilter === 'all'
    ? 'Todos los proyectos'
    : projectLabels[projectFilter] ?? projectFilter

  function refreshData() {
    setSettings(loadTaskSettings())
    setTasks(loadCalendarTasks())
  }

  return (
    <div className="flex h-full flex-col bg-[#F7F6F3]">
      <div className="border-b border-gray-200 px-10 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setCurrentMonth(prev => subMonths(prev, 1))}
              className="flex h-8 w-8 items-center justify-center rounded-md text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-800"
              title="Mes anterior"
            >
              <ChevronLeftIcon className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={() => setCurrentMonth(prev => addMonths(prev, 1))}
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
                    setProjectFilter('all')
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

                {settings.projects.map(project => {
                  const color = project.color ?? '#64748B'
                  const isSelected = projectFilter === project.id

                  return (
                    <button
                      key={project.id}
                      type="button"
                      onClick={() => {
                        setProjectFilter(project.id)
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
                        <span className="truncate">{project.label}</span>
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
                setCurrentMonth(startOfMonth(today))
                setSelectedDate(today)
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
            {['Lun', 'Mar', 'Mie', 'Jue', 'Vie', 'Sab', 'Dom'].map(day => (
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
                  onClick={() => setSelectedDate(day)}
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
                      const color = projectColors[task.workspaceId] ?? '#64748B'
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
                        +{dayTasks.length - 3} mas
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
              Dia seleccionado
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
                  No hay tareas con fecha para este dia.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {selectedDateTasks.map(task => {
                  const priority = priorityColors[task.priority]
                  const projectColor = projectColors[task.workspaceId] ?? '#64748B'

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
                          projectId={task.workspaceId}
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
