import {
  PlusIcon,
  EllipsisHorizontalIcon,
  QuestionMarkCircleIcon,
  CalendarIcon,
  AdjustmentsHorizontalIcon,
  DocumentTextIcon,
  BriefcaseIcon,
  UserGroupIcon,
  ClockIcon,
  CheckCircleIcon,
  PencilSquareIcon,
  TrashIcon,
  SwatchIcon,
} from '@heroicons/react/24/outline'
import { Squares2X2Icon, TableCellsIcon, ListBulletIcon } from '@heroicons/react/24/outline'
import { useRef, useState } from 'react'
import { useLocation } from 'react-router-dom'
import {
  closestCorners,
  DndContext,
  DragOverlay,
  PointerSensor,
  useDroppable,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragOverEvent,
  type DragStartEvent,
} from '@dnd-kit/core'
import {
  arrayMove,
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { Calendar } from '@/components/ui/calendar'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { TaskSelect } from '@/components/ui/task-select'
import TaskDetailPanel, { type TaskDetailPanelTask } from '@/components/TaskDetailPanel/TaskDetailPanel'
import { defaultTaskSettings } from '@/data/taskSettings'
import { useTaskSettings } from '@/hooks/useTaskSettings'
import { useTasks } from '@/hooks/useTasks'
import { useWorkspaces } from '@/hooks/useWorkspaces'
import { formatTaskDateRange } from '@/utils/date.utils'
import type { Task } from '@/types/task'
import { format, parseISO } from 'date-fns'
import { es } from 'date-fns/locale'

/* ─────────────────────── Types ─────────────────────── */
type TaskPriority = string
type ViewMode = 'board' | 'table'

interface BoardTask {
  id: string
  title: string
  colId: string
  priority: TaskPriority
  tag: string
  startDate: string
  endDate: string
  assignee: string
  workspaceId: string
  color?: string
  notes?: string
}

type EditableTaskField = keyof Pick<
  BoardTask,
  'title' | 'assignee' | 'priority' | 'colId' | 'startDate' | 'endDate' | 'tag' | 'workspaceId'
>

interface BoardColumn {
  id: string
  label: string
  dot: string   // Tailwind bg color class for the dot
}

/* ─────────────────────── Data ─────────────────────── */

const TASKS: BoardTask[] = [
  { id: '1', title: 'Revisar propuesta de diseño',     colId: 'progreso',   priority: 'Alta',  tag: 'Diseño',     startDate: '2026-07-15', endDate: '2026-07-22', assignee: 'AG', workspaceId: 'job-1' },
  { id: '2', title: 'Reunión con equipo de producto',  colId: 'pendiente',  priority: 'Media', tag: 'Reunión',    startDate: '2026-07-18', endDate: '2026-07-23', assignee: 'LT', workspaceId: 'job-1' },
  { id: '3', title: 'Documentar API de autenticación', colId: 'completado', priority: 'Alta',  tag: 'Desarrollo', startDate: '2026-07-10', endDate: '2026-07-20', assignee: 'ML', workspaceId: 'job-1' },
  { id: '4', title: 'Actualizar dependencias npm',     colId: 'pendiente',  priority: 'Baja',  tag: 'Desarrollo', startDate: '2026-07-05', endDate: '2026-07-25', assignee: 'CR', workspaceId: 'job-2' },
  { id: '5', title: 'Redactar informe Q2',             colId: 'progreso',   priority: 'Alta',  tag: 'Finanzas',   startDate: '2026-07-18', endDate: '2026-07-24', assignee: 'SD', workspaceId: 'job-2' },
]

// Tag colors — pastel pills exactamente como Notion
const TAG_COLORS: Record<string, { bg: string; text: string }> = {
  Diseño:     { bg: '#DBEAFE', text: '#1D4ED8' },
  Reunión:    { bg: '#EDE9FE', text: '#5B21B6' },
  Desarrollo: { bg: '#D1FAE5', text: '#065F46' },
  Finanzas:   { bg: '#FEF3C7', text: '#92400E' },
  General:    { bg: '#F3F4F6', text: '#374151' },
}

const PRIORITY_COLORS: Record<TaskPriority, { bg: string; text: string }> = {
  Alta:  { bg: '#FEE2E2', text: '#B91C1C' },
  Media: { bg: '#FEF3C7', text: '#92400E' },
  Baja:  { bg: '#F1F5F9', text: '#64748B' },
}

const TASK_COLORS = [
  '#FFFFFF',
  '#EEF2FF',
  '#ECFDF5',
  '#FEF3C7',
  '#FEE2E2',
  '#F5F3FF',
  '#F1F5F9',
]

function fromApiTasks(tasks: Task[]): BoardTask[] {
  return tasks.map(task => ({
    id: task.id,
    title: task.title,
    colId: task.status,
    priority: task.priority,
    tag: task.tag,
    startDate: task.startDate ?? '—',
    endDate: task.endDate ?? '—',
    assignee: task.assigneeId ?? task.assignee ?? 'MN',
    workspaceId: task.projectId ?? task.workspaceId,
    color: task.color ?? undefined,
    notes: task.notes ?? '',
  }))
}

function toApiTask(task: unknown) {
  const localTask = task as BoardTask
  return {
    id: localTask.id,
    title: localTask.title,
    description: '',
    status: localTask.colId,
    priority: localTask.priority,
    projectId: localTask.workspaceId,
    tag: localTask.tag,
    assigneeId: null,
    startDate: localTask.startDate,
    endDate: localTask.endDate,
    color: localTask.color ?? null,
    notes: localTask.notes ?? '',
  }
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
      className="inline-flex max-w-full items-center gap-1.5 rounded border px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wider"
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

function TaskCardContent({
  task,
  currentWorkspace,
  tagColors,
  priorityColors,
  assigneeColors,
  projectLabels,
  projectColors,
}: {
  task: BoardTask
  currentWorkspace: string | null
  tagColors: Record<string, { bg: string; text: string }>
  priorityColors: Record<string, { bg: string; text: string }>
  assigneeColors: Record<string, { bg: string; text: string; fullName: string }>
  projectLabels: Record<string, string>
  projectColors: Record<string, string>
}) {
  const tagCfg = tagColors[task.tag] ?? TAG_COLORS.General
  const priCfg = priorityColors[task.priority] ?? PRIORITY_COLORS.Media
  const aCfg = assigneeColors[task.assignee] ?? { bg: '#F3F4F6', text: '#374151', fullName: 'Desconocido' }
  const dateLabel = formatTaskDateRange(task.startDate, task.endDate)

  return (
    <>
      <p className="mb-1.5 text-[13.5px] font-medium leading-snug text-gray-800">
        {task.title}
      </p>

      {dateLabel && (
        <div className="mb-2.5 flex items-center gap-1.5 text-[11px] font-medium text-gray-500">
          <CalendarIcon className="h-3 w-3" />
          <span>{dateLabel}</span>
        </div>
      )}

      <div className="mt-auto flex flex-wrap items-center gap-1.5 pt-1">
        {!currentWorkspace && (
          <ProjectPill
            projectId={task.workspaceId}
            projectLabels={projectLabels}
            projectColors={projectColors}
          />
        )}

        <span
          className="rounded border px-2 py-0.5 text-[11px] font-semibold"
          style={{
            background: tagCfg.bg,
            borderColor: `${tagCfg.text}24`,
            color: tagCfg.text,
          }}
        >
          {task.tag}
        </span>
        <span
          className="rounded border px-2 py-0.5 text-[11px] font-semibold"
          style={{
            background: priCfg.bg,
            borderColor: `${priCfg.text}24`,
            color: priCfg.text,
          }}
        >
          {task.priority}
        </span>

        <div className="flex-1" />

        <div className="flex items-center gap-1.5" title={aCfg.fullName}>
          <div
            className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-[8px] font-bold"
            style={{ background: aCfg.bg, color: aCfg.text }}
          >
            {task.assignee}
          </div>
          <span className="max-w-[110px] truncate text-[11px] font-medium text-gray-600">
            {aCfg.fullName}
          </span>
        </div>
      </div>
    </>
  )
}

function KanbanTaskCard({
  task,
  currentWorkspace,
  tagColors,
  priorityColors,
  assigneeColors,
  projectLabels,
  projectColors,
  onOpen,
  onDelete,
  onColorChange,
}: {
  task: BoardTask
  currentWorkspace: string | null
  tagColors: Record<string, { bg: string; text: string }>
  priorityColors: Record<string, { bg: string; text: string }>
  assigneeColors: Record<string, { bg: string; text: string; fullName: string }>
  projectLabels: Record<string, string>
  projectColors: Record<string, string>
  onOpen: (task: BoardTask) => void
  onDelete: (taskId: string) => void
  onColorChange: (taskId: string, color: string) => void
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: task.id,
    data: { type: 'task' },
  })

  return (
    <div
      ref={setNodeRef}
      {...attributes}
      {...listeners}
      onClick={() => onOpen(task)}
      className={`group/task relative touch-none select-none rounded-xl border border-gray-200 bg-white p-4 shadow-[0_1px_2px_rgba(0,0,0,0.05)] transition-shadow duration-100 hover:border-gray-300 hover:shadow-[0_4px_10px_rgba(0,0,0,0.08)] ${
        isDragging
          ? 'opacity-0'
          : 'cursor-pointer'
      }`}
      style={{
        transform: CSS.Transform.toString(transform),
        transition,
        background: task.color ?? '#FFFFFF',
      }}
    >
      <div className="absolute right-2 top-2 flex items-center gap-1 opacity-0 transition-opacity group-hover/task:opacity-100">
        <Popover>
          <PopoverTrigger
            onPointerDown={event => event.stopPropagation()}
            onClick={event => event.stopPropagation()}
            className="rounded-md bg-white/90 p-1 text-gray-400 shadow-sm ring-1 ring-gray-200 transition-colors hover:bg-gray-50 hover:text-gray-700"
            title="Cambiar color"
          >
            <SwatchIcon className="h-3.5 w-3.5" />
          </PopoverTrigger>
          <PopoverContent className="w-auto p-2" align="end">
            <div className="grid grid-cols-4 gap-1.5">
              {TASK_COLORS.map(color => (
                <button
                  key={color}
                  type="button"
                  onClick={event => {
                    event.stopPropagation()
                    onColorChange(task.id, color)
                  }}
                  className="h-6 w-6 rounded-md border border-gray-200 transition-transform hover:scale-110"
                  style={{
                    background: color,
                    boxShadow: (task.color ?? '#FFFFFF') === color ? '0 0 0 2px #4F46E5' : undefined,
                  }}
                  title="Aplicar color"
                />
              ))}
            </div>
          </PopoverContent>
        </Popover>
        <button
          type="button"
          onPointerDown={event => event.stopPropagation()}
          onClick={event => {
            event.stopPropagation()
            onOpen(task)
          }}
          className="rounded-md bg-white/90 p-1 text-gray-400 shadow-sm ring-1 ring-gray-200 transition-colors hover:bg-gray-50 hover:text-gray-700"
          title="Editar tarea"
        >
          <PencilSquareIcon className="h-3.5 w-3.5" />
        </button>
        <button
          type="button"
          onPointerDown={event => event.stopPropagation()}
          onClick={event => {
            event.stopPropagation()
            onDelete(task.id)
          }}
          className="rounded-md bg-white/90 p-1 text-gray-400 shadow-sm ring-1 ring-gray-200 transition-colors hover:bg-red-50 hover:text-red-600"
          title="Borrar tarea"
        >
          <TrashIcon className="h-3.5 w-3.5" />
        </button>
      </div>
      <TaskCardContent
        task={task}
        currentWorkspace={currentWorkspace}
        tagColors={tagColors}
        priorityColors={priorityColors}
        assigneeColors={assigneeColors}
        projectLabels={projectLabels}
        projectColors={projectColors}
      />
    </div>
  )
}

function KanbanColumn({
  col,
  tasks,
  currentWorkspace,
  tagColors,
  priorityColors,
  assigneeColors,
  projectLabels,
  projectColors,
  activeDropColId,
  isDraggingAny,
  addingToCol,
  newTaskTitle,
  onOpenTask,
  onDeleteTask,
  onColorTask,
  onStartAdd,
  onNewTaskTitleChange,
  onAddTask,
  onCancelAdd,
}: {
  col: BoardColumn
  tasks: BoardTask[]
  currentWorkspace: string | null
  tagColors: Record<string, { bg: string; text: string }>
  priorityColors: Record<string, { bg: string; text: string }>
  assigneeColors: Record<string, { bg: string; text: string; fullName: string }>
  projectLabels: Record<string, string>
  projectColors: Record<string, string>
  activeDropColId: string | null
  isDraggingAny: boolean
  addingToCol: string | null
  newTaskTitle: string
  onOpenTask: (task: BoardTask) => void
  onDeleteTask: (taskId: string) => void
  onColorTask: (taskId: string, color: string) => void
  onStartAdd: (colId: string) => void
  onNewTaskTitleChange: (title: string) => void
  onAddTask: (colId: string) => void
  onCancelAdd: () => void
}) {
  const { setNodeRef } = useDroppable({ id: col.id })
  const isOver = activeDropColId === col.id

  return (
    <div
      ref={setNodeRef}
      className={`w-[330px] shrink-0 rounded-xl p-2 -m-2 transition-colors duration-150 group/col ${
        isOver ? 'bg-indigo-50/80 ring-1 ring-indigo-200' : ''
      }`}
    >
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="inline-block h-2.5 w-2.5 shrink-0 rounded-full" style={{ background: col.dot }} />
          <span className="text-[15px] font-semibold text-gray-800">{col.label}</span>
          <span className="text-[14px] font-medium text-gray-400">{tasks.length}</span>
        </div>

        <div className="flex items-center gap-0.5 opacity-0 transition-opacity group-hover/col:opacity-100">
          <button
            onClick={() => onStartAdd(col.id)}
            className="rounded p-1 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-700"
            title="Añadir tarea"
          >
            <PlusIcon className="h-3.5 w-3.5" />
          </button>
          <button
            type="button"
            className="rounded p-1 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-700"
            title="Opciones"
          >
            <EllipsisHorizontalIcon className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>

      <div className="flex min-h-[80px] flex-col gap-2.5">
        <SortableContext items={tasks.map(task => task.id)} strategy={verticalListSortingStrategy}>
          {tasks.map(task => (
            <KanbanTaskCard
              key={task.id}
              task={task}
              currentWorkspace={currentWorkspace}
              tagColors={tagColors}
              priorityColors={priorityColors}
              assigneeColors={assigneeColors}
              projectLabels={projectLabels}
              projectColors={projectColors}
              onOpen={onOpenTask}
              onDelete={onDeleteTask}
              onColorChange={onColorTask}
            />
          ))}
        </SortableContext>

        {addingToCol === col.id ? (
          <div
            className="rounded-lg p-3"
            style={{
              background: 'white',
              border: `1.5px solid ${col.dot}`,
              boxShadow: `0 0 0 3px ${col.dot}18`,
            }}
          >
            <textarea
              autoFocus
              placeholder="Título de la tarea…"
              className="w-full resize-none bg-transparent text-[13px] text-gray-800 outline-none placeholder-gray-400"
              rows={2}
              value={newTaskTitle}
              onChange={e => onNewTaskTitleChange(e.target.value)}
              onKeyDown={e => {
                if (e.key === 'Enter') {
                  e.preventDefault()
                  onAddTask(col.id)
                }
                if (e.key === 'Escape') onCancelAdd()
              }}
              onBlur={() => onAddTask(col.id)}
            />
            <p className="mt-1 text-[10px] text-gray-400">↵ guardar · Esc cancelar</p>
          </div>
        ) : (
          <button
            onClick={() => onStartAdd(col.id)}
            className={`flex items-center gap-1.5 px-1 py-1.5 text-[13px] text-gray-400 transition-colors hover:text-gray-600 ${
              isDraggingAny ? 'pointer-events-none' : ''
            }`}
          >
            <PlusIcon className="h-3.5 w-3.5" />
            Nuevo
          </button>
        )}
      </div>
    </div>
  )
}

/* ─────────────────────── Component ─────────────────────── */
export default function DashboardPage() {
  const location = useLocation()
  const currentWorkspace = new URLSearchParams(location.search).get('w')
  const { activeWorkspaceId } = useWorkspaces()
  const { settings: taskSettings } = useTaskSettings(activeWorkspaceId)
  const { tasks, setTasks } = useTasks<BoardTask[]>(TASKS, {
    workspaceId: activeWorkspaceId,
    fromApi: fromApiTasks,
    toApi: toApiTask,
  })

  const [view, setView]                   = useState<ViewMode>('board')
  const [projectFilter, setProjectFilter] = useState('all')
  const [isFilterOpen, setIsFilterOpen] = useState(false)
  const [extraCols, setExtraCols] = useState<BoardColumn[]>([])
  const cols: BoardColumn[] = [
    ...(taskSettings.statuses.length ? taskSettings.statuses : defaultTaskSettings.statuses),
    ...extraCols,
  ]
  const [addingToCol, setAddingToCol]     = useState<string | null>(null)
  const [newTaskTitle, setNewTaskTitle]   = useState('')

  const [isPanelOpen, setIsPanelOpen]     = useState(false)
  const [isPanelClosing, setIsPanelClosing] = useState(false)
  const [newTaskData, setNewTaskData]     = useState<Partial<BoardTask>>({})

  const [editingCell, setEditingCell] = useState<{ taskId: string, field: EditableTaskField } | null>(null)
  const [activeTaskId, setActiveTaskId] = useState<string | null>(null)
  const [activeDropColId, setActiveDropColId] = useState<string | null>(null)
  const suppressTaskClickRef = useRef(false)
  const dragSnapshotRef = useRef<BoardTask[] | null>(null)
  const activeDropColIdRef = useRef<string | null>(null)
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 6 },
    })
  )

  const tagColors = Object.fromEntries(
    taskSettings.labels.map(label => [label.id, { bg: label.bg, text: label.text }])
  )
  const priorityColors = Object.fromEntries(
    taskSettings.priorities.map(priority => [priority.id, { bg: priority.bg, text: priority.text }])
  ) as Record<string, { bg: string; text: string }>
  const assigneeColors = Object.fromEntries(
    taskSettings.assignees.map(assignee => [assignee.id, {
      bg: assignee.bg,
      text: assignee.text,
      fullName: assignee.fullName,
    }])
  )
  const projectLabels = Object.fromEntries(
    taskSettings.projects.map(project => [project.id, project.label])
  )
  const projectColors = Object.fromEntries(
    taskSettings.projects.map(project => [project.id, project.color ?? '#64748B'])
  )

  const updateTaskField = <K extends EditableTaskField>(taskId: string, field: K, value: BoardTask[K]) => {
    setTasks(prev => prev.map(t => t.id === taskId ? { ...t, [field]: value } : t))
  }

  const effectiveProjectFilter = projectFilter !== 'all' ? projectFilter : currentWorkspace
  const filteredTasks = effectiveProjectFilter ? tasks.filter(t => t.workspaceId === effectiveProjectFilter) : tasks
  const activeTask = activeTaskId === null ? null : tasks.find(task => task.id === activeTaskId) ?? null
  const defaultProjectId = effectiveProjectFilter || taskSettings.projects[0]?.id || 'job-1'
  const selectedProjectLabel = effectiveProjectFilter
    ? projectLabels[effectiveProjectFilter] ?? effectiveProjectFilter
    : 'Todos los proyectos'

  const handleDragStart = (event: DragStartEvent) => {
    suppressTaskClickRef.current = true
    dragSnapshotRef.current = tasks
    setActiveTaskId(String(event.active.id))
  }

  const updateActiveDropColId = (colId: string | null) => {
    if (activeDropColIdRef.current === colId) return
    activeDropColIdRef.current = colId
    setActiveDropColId(colId)
  }

  const handleDragOver = (event: DragOverEvent) => {
    const { active, over } = event
    if (!over) {
      updateActiveDropColId(null)
      return
    }

    const activeId = String(active.id)
    const overTask = tasks.find(task => task.id === String(over.id))
    const overColId = overTask?.colId ?? cols.find(col => col.id === String(over.id))?.id
    const activeTask = tasks.find(task => task.id === activeId)

    updateActiveDropColId(overColId ?? null)

    if (!activeTask || !overColId) return
  }

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event

    if (!over) {
      if (dragSnapshotRef.current) setTasks(dragSnapshotRef.current)
    } else {
      const activeId = String(active.id)
      const overId = over.id

      setTasks(prev => {
        const activeIndex = prev.findIndex(task => task.id === activeId)
        if (activeIndex === -1) return prev

        const activeTask = prev[activeIndex]
        const overTask = prev.find(task => task.id === String(overId))
        const overColId = overTask?.colId ?? cols.find(col => col.id === String(overId))?.id

        if (!overColId) return prev

        if (overTask) {
          const overIndex = prev.findIndex(task => task.id === overTask.id)
          if (overIndex === -1 || (activeIndex === overIndex && activeTask.colId === overTask.colId)) return prev

          const withTargetColumn = prev.map(task =>
            task.id === activeId ? { ...task, colId: overTask.colId } : task
          )

          return arrayMove(withTargetColumn, activeIndex, overIndex)
        }

        if (activeTask.colId === overColId) return prev

        const withoutActive = prev.filter(task => task.id !== activeId)
        const movedTask = { ...activeTask, colId: overColId }
        const lastTargetIndex = withoutActive.reduce(
          (lastIndex, task, index) => task.colId === overColId ? index : lastIndex,
          -1
        )
        const insertIndex = lastTargetIndex === -1 ? withoutActive.length : lastTargetIndex + 1

        return [
          ...withoutActive.slice(0, insertIndex),
          movedTask,
          ...withoutActive.slice(insertIndex),
        ]
      })
    }

    dragSnapshotRef.current = null
    setActiveTaskId(null)
    updateActiveDropColId(null)
    window.setTimeout(() => {
      suppressTaskClickRef.current = false
    }, 0)
  }

  const handleDragCancel = () => {
    if (dragSnapshotRef.current) {
      setTasks(dragSnapshotRef.current)
    }

    dragSnapshotRef.current = null
    setActiveTaskId(null)
    updateActiveDropColId(null)
    window.setTimeout(() => {
      suppressTaskClickRef.current = false
    }, 0)
  }

  const openTaskPanel = (colId?: string, existingTask?: BoardTask) => {
    if (existingTask) {
      setNewTaskData(existingTask)
    } else {
      setNewTaskData({
        title: '',
        colId: colId || 'pendiente',
        priority: 'Media',
        tag: 'General',
        startDate: '',
        endDate: '',
        assignee: 'MN',
        workspaceId: defaultProjectId,
        notes: '',
      })
    }
    setIsPanelClosing(false)
    setIsPanelOpen(true)
  }

  const closeTaskPanel = () => {
    setIsPanelClosing(true)
    window.setTimeout(() => {
      setIsPanelOpen(false)
      setIsPanelClosing(false)
    }, 200)
  }

  const handleSaveTask = () => {
    if (!newTaskData.title?.trim()) return
    
    if (newTaskData.id) {
      setTasks(prev => prev.map(t => t.id === newTaskData.id ? {
        ...t,
        ...newTaskData,
        title: newTaskData.title!.trim(),
        startDate: newTaskData.startDate || '—',
        endDate: newTaskData.endDate || '—',
      } as BoardTask : t))
    } else {
      setTasks(prev => [...prev, {
        ...newTaskData,
        id: crypto.randomUUID(),
        title: newTaskData.title!.trim(),
        startDate: newTaskData.startDate || '—',
        endDate: newTaskData.endDate || '—',
      } as BoardTask])
    }
    closeTaskPanel()
  }

  const handlePanelTaskChange = (updatedTask: Partial<TaskDetailPanelTask>) => {
    const nextTaskData = { ...newTaskData, ...updatedTask }
    setNewTaskData(nextTaskData)

    if (!nextTaskData.id) return

    setTasks(prev => prev.map(task =>
      task.id === nextTaskData.id
        ? { ...task, ...nextTaskData } as BoardTask
        : task
    ))
  }

  const addTask = (colId: string) => {
    if (!newTaskTitle.trim()) { setAddingToCol(null); return }
    setTasks(prev => [...prev, {
      id: crypto.randomUUID(), title: newTaskTitle.trim(), colId,
      priority: 'Media', tag: 'General', startDate: '—', endDate: '—', assignee: 'MN',
      workspaceId: defaultProjectId,
      color: '#FFFFFF',
      notes: '',
    }])
    setNewTaskTitle('')
    setAddingToCol(null)
  }

  const createTableTask = () => {
    const id = crypto.randomUUID()
    const task: BoardTask = {
      id,
      title: '',
      colId: 'pendiente',
      priority: 'Media',
      tag: 'General',
      startDate: '—',
      endDate: '—',
      assignee: 'MN',
      workspaceId: defaultProjectId,
      color: '#FFFFFF',
      notes: '',
    }

    setTasks(prev => [task, ...prev])
    setNewTaskData(task)
    setIsPanelClosing(false)
    setIsPanelOpen(true)
    setEditingCell({ taskId: id, field: 'title' })
  }

  const handleNewTaskClick = () => {
    if (view === 'board') {
      const id = crypto.randomUUID()
      const task: BoardTask = {
        id,
        title: '',
        colId: 'pendiente',
        priority: 'Media',
        tag: 'General',
        startDate: '—',
        endDate: '—',
        assignee: 'MN',
        workspaceId: defaultProjectId,
        color: '#FFFFFF',
        notes: '',
      }

      setTasks(prev => [...prev, task])
      setNewTaskData(task)
      setIsPanelClosing(false)
      setIsPanelOpen(true)
      setAddingToCol(null)
      return
    }

    createTableTask()
  }

  const deleteTask = (taskId: string) => {
    setTasks(prev => prev.filter(task => task.id !== taskId))
  }

  const updateTaskColor = (taskId: string, color: string) => {
    setTasks(prev => prev.map(task =>
      task.id === taskId ? { ...task, color } : task
    ))
    setNewTaskData(prev =>
      prev.id === taskId ? { ...prev, color } : prev
    )
  }

  return (
    <div
      className="flex flex-col h-full"
      style={{
        background: '#F7F6F3',
        cursor: activeTask ? 'grabbing' : undefined,
      }}
    >

      {/* ─── Page top bar (Notion-style) ─── */}
      <div className="px-10 pt-8">

        {/* Title row */}
        <div className="flex items-center justify-between mb-1">
          <h1 className="text-[26px] font-bold text-gray-900 tracking-tight">
            Mis tareas
          </h1>

          {/* Right icons */}
          <div className="flex items-center gap-2 text-gray-400">
            <Popover open={isFilterOpen} onOpenChange={setIsFilterOpen}>
              <PopoverTrigger className={`flex items-center gap-1.5 rounded-md px-3 py-1.5 text-[13px] font-medium transition-colors ${
                effectiveProjectFilter
                  ? 'bg-[#6472EB]/10 text-[#6472EB]'
                  : 'hover:bg-gray-100'
              }`}
              >
                <AdjustmentsHorizontalIcon className="h-4 w-4" />
                Filtrar
                {effectiveProjectFilter && (
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
                  <span>Todos los proyectos</span>
                  {projectFilter === 'all' && <span className="h-1.5 w-1.5 rounded-full bg-[#6472EB]" />}
                </button>

                {taskSettings.projects.map(project => {
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
            <div className="w-px h-4 bg-gray-200" />
            <button className="p-1.5 rounded-md hover:bg-gray-100 transition-colors">
              <Squares2X2Icon className="h-4 w-4" />
            </button>
            <button className="p-1.5 rounded-md hover:bg-gray-100 transition-colors">
              <ListBulletIcon className="h-4 w-4" />
            </button>
            <button className="p-1.5 rounded-md hover:bg-gray-100 transition-colors">
              <TableCellsIcon className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* View Mode Tabs & Add Action */}
        <div className="flex items-center gap-4 border-b border-gray-200 pb-2">
          <div className="flex items-center gap-4">
            <div className="flex items-center bg-gray-100/80 p-0.5 rounded-lg border border-gray-200/60 shadow-sm">
              {([
                { id: 'board', label: 'Kanban', Icon: Squares2X2Icon },
                { id: 'table', label: 'Lista',  Icon: ListBulletIcon },
              ] as const).map(({ id, label, Icon }) => (
                <button
                  key={id}
                  onClick={() => setView(id)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-[12px] font-semibold transition-all ${
                    view === id
                      ? 'bg-white text-gray-900 shadow-sm ring-1 ring-gray-900/5'
                      : 'text-gray-500 hover:text-gray-700 hover:bg-gray-200/50'
                  }`}
                >
                  <Icon className="h-3.5 w-3.5" />
                  {label}
                </button>
              ))}
            </div>

            <button
              onClick={handleNewTaskClick}
              className="flex items-center gap-1 px-2.5 py-1 rounded bg-[#6472EB] hover:bg-[#5360D8] text-white text-[12px] font-semibold transition-colors shadow-sm"
            >
              <PlusIcon className="h-3.5 w-3.5" />
              Nuevo
            </button>
          </div>
        </div>
      </div>

      {/* ─── BOARD VIEW ─── */}
      {view === 'board' && (
        <div className="flex-1 overflow-x-auto px-12 py-8">
          <DndContext
            sensors={sensors}
            collisionDetection={closestCorners}
            onDragStart={handleDragStart}
            onDragOver={handleDragOver}
            onDragEnd={handleDragEnd}
            onDragCancel={handleDragCancel}
          >
            <div className="flex items-start gap-10" style={{ minWidth: 'max-content' }}>
              {cols.map(col => (
                <KanbanColumn
                  key={col.id}
                  col={col}
                  tasks={filteredTasks.filter(task => task.colId === col.id)}
                  currentWorkspace={currentWorkspace}
                  tagColors={tagColors}
                  priorityColors={priorityColors}
                  assigneeColors={assigneeColors}
                  projectLabels={projectLabels}
                  projectColors={projectColors}
                  activeDropColId={activeDropColId}
                  isDraggingAny={activeTask !== null}
                  addingToCol={addingToCol}
                  newTaskTitle={newTaskTitle}
                  onOpenTask={task => {
                    if (suppressTaskClickRef.current) return
                    openTaskPanel(task.colId, task)
                  }}
                  onDeleteTask={deleteTask}
                  onColorTask={updateTaskColor}
                  onStartAdd={setAddingToCol}
                  onNewTaskTitleChange={setNewTaskTitle}
                  onAddTask={addTask}
                  onCancelAdd={() => setAddingToCol(null)}
                />
              ))}

              <button
                className="shrink-0 flex items-center gap-1.5 text-[13px] text-gray-400 hover:text-gray-600 transition-colors py-0.5 whitespace-nowrap"
                onClick={() => {
                  const label = prompt('Nombre del nuevo estado:')
                  if (!label) return
                  setExtraCols(prev => [...prev, {
                    id: label.toLowerCase().replace(/\s+/g, '_'),
                    label,
                    dot: '#8B5CF6',
                  }])
                }}
              >
                <PlusIcon className="h-3.5 w-3.5" />
                Añadir grupo
              </button>
            </div>

            <DragOverlay
              adjustScale={false}
              dropAnimation={{
                duration: 140,
                easing: 'cubic-bezier(0.2, 0, 0, 1)',
              }}
            >
              {activeTask ? (
                <div
                  className="w-[330px] rotate-[0.5deg] cursor-grabbing rounded-xl bg-white p-4 shadow-xl"
                  style={{ border: '1px solid #D1D5DB' }}
                >
                  <TaskCardContent
                    task={activeTask}
                    currentWorkspace={currentWorkspace}
                    tagColors={tagColors}
                    priorityColors={priorityColors}
                    assigneeColors={assigneeColors}
                    projectLabels={projectLabels}
                    projectColors={projectColors}
                  />
                </div>
              ) : null}
            </DragOverlay>
          </DndContext>
        </div>
      )}

      {/* ─── TABLE VIEW ─── */}
      {view === 'table' && (
        <div className="px-10 py-6">
          <div
            className="rounded-xl overflow-x-auto border border-gray-200 w-max bg-white shadow-sm"
          >
            <table className="border-collapse text-[13px] table-fixed w-max">
              <thead>
                <tr style={{ background: '#F3F4F6', borderBottom: '1px solid #E5E7EB' }}>
                  {[
                    { label: 'Proyecto', Icon: BriefcaseIcon, w: 180 },
                    { label: 'Nombre de la tarea', Icon: DocumentTextIcon, w: 350 },
                    { label: 'Responsable', Icon: UserGroupIcon, w: 200 },
                    { label: 'Prioridad', Icon: ClockIcon, w: 130 },
                    { label: 'Plazo', Icon: CalendarIcon, w: 180 },
                    { label: 'Estado', Icon: CheckCircleIcon, w: 160 },
                  ].map(({ label, Icon, w }) => (
                    <th
                      key={label}
                      className="px-4 py-2.5 text-left text-[11px] uppercase tracking-wider font-semibold text-gray-500 whitespace-nowrap border-r border-gray-200"
                      style={{ width: w, minWidth: w, maxWidth: w }}
                    >
                      <div className="flex items-center gap-1.5">
                        <Icon className="h-3.5 w-3.5" />
                        {label}
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filteredTasks.map((task, i) => {
                  const col    = cols.find(c => c.id === task.colId)
                  const priCfg = priorityColors[task.priority] ?? PRIORITY_COLORS.Media
                  const aCfg   = assigneeColors[task.assignee] ?? { bg: '#F3F4F6', text: '#374151', fullName: 'Desconocido' }
                  const dateLabel = formatTaskDateRange(task.startDate, task.endDate)
                  return (
                    <tr
                      key={task.id}
                      className="hover:bg-gray-50 transition-colors"
                      style={{
                        background: 'white',
                        borderBottom: i < filteredTasks.length - 1 ? '1px solid #F3F4F6' : 'none',
                      }}
                    >
                      <td className="px-4 py-3 border-r border-gray-200">
                        <ProjectPill
                          projectId={task.workspaceId}
                          projectLabels={projectLabels}
                          projectColors={projectColors}
                        />
                      </td>
                      <td 
                        className="px-4 py-3 border-r border-gray-200 font-semibold text-[13px] text-gray-900 cursor-text"
                        onClick={() => setEditingCell({ taskId: task.id, field: 'title' })}
                      >
                        {editingCell?.taskId === task.id && editingCell?.field === 'title' ? (
                          <input 
                            autoFocus
                            className="w-full bg-transparent border-none outline-none focus:ring-1 focus:ring-indigo-500 rounded px-1 -mx-1"
                            defaultValue={task.title}
                            onBlur={e => {
                              if (e.target.value.trim()) updateTaskField(task.id, 'title', e.target.value.trim())
                              setEditingCell(null)
                            }}
                            onKeyDown={e => {
                              if (e.key === 'Enter') {
                                if (e.currentTarget.value.trim()) updateTaskField(task.id, 'title', e.currentTarget.value.trim())
                                setEditingCell(null)
                              }
                              if (e.key === 'Escape') setEditingCell(null)
                            }}
                          />
                        ) : (
                          task.title
                        )}
                      </td>
                      <td 
                        className="px-4 py-3 border-r border-gray-200 cursor-pointer"
                        onClick={() => setEditingCell({ taskId: task.id, field: 'assignee' })}
                      >
                        {editingCell?.taskId === task.id && editingCell?.field === 'assignee' ? (
                          <TaskSelect
                            value={task.assignee}
                            options={Object.entries(assigneeColors).map(([key, val]) => ({
                              value: key,
                              label: val.fullName,
                            }))}
                            onChange={value => {
                              updateTaskField(task.id, 'assignee', value)
                              setEditingCell(null)
                            }}
                            triggerClassName="h-7 border-transparent bg-transparent px-1 py-0 text-[12px] shadow-none hover:bg-gray-100"
                          />
                        ) : (
                          <div className="flex items-center gap-1.5">
                            <div
                              className="h-5 w-5 rounded-full flex items-center justify-center text-[8px] font-bold shrink-0"
                              style={{ background: aCfg.bg, color: aCfg.text }}
                            >
                              {task.assignee}
                            </div>
                            <span className="text-[12px] text-gray-700">{aCfg.fullName}</span>
                          </div>
                        )}
                      </td>
                      <td 
                        className="px-4 py-3 border-r border-gray-200 cursor-pointer"
                        onClick={() => setEditingCell({ taskId: task.id, field: 'priority' })}
                      >
                        {editingCell?.taskId === task.id && editingCell?.field === 'priority' ? (
                          <TaskSelect
                            value={task.priority}
                            options={taskSettings.priorities.map(priority => ({
                              value: priority.id,
                              label: priority.label,
                            }))}
                            onChange={value => {
                              updateTaskField(task.id, 'priority', value as TaskPriority)
                              setEditingCell(null)
                            }}
                            triggerClassName="h-7 border-transparent bg-transparent px-1 py-0 text-[12px] shadow-none hover:bg-gray-100"
                          />
                        ) : (
                          <span
                            className="rounded border px-1.5 py-0.5 text-[11px] font-medium"
                            style={{
                              background: priCfg.bg,
                              borderColor: `${priCfg.text}24`,
                              color: priCfg.text,
                            }}
                          >
                            {task.priority}
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3 border-r border-gray-200 text-gray-600 text-[12px]">
                        <Popover>
                          <PopoverTrigger className="w-full text-left outline-none cursor-pointer hover:bg-gray-50 -mx-1 px-1 py-0.5 rounded transition-colors">
                            {!dateLabel
                              ? <span className="text-gray-400">Asignar fechas</span>
                              : dateLabel}
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0" align="start">
                            <Calendar
                              initialFocus
                              mode="range"
                              locale={es}
                              defaultMonth={task.startDate !== '—' ? parseISO(task.startDate) : new Date()}
                              selected={{
                                from: task.startDate !== '—' ? parseISO(task.startDate) : undefined,
                                to: task.endDate !== '—' && task.endDate !== task.startDate ? parseISO(task.endDate) : undefined,
                              }}
                              onSelect={(range) => {
                                if (range?.from) {
                                  updateTaskField(task.id, 'startDate', format(range.from, 'yyyy-MM-dd'))
                                  if (range.to) {
                                    updateTaskField(task.id, 'endDate', format(range.to, 'yyyy-MM-dd'))
                                  } else {
                                    updateTaskField(task.id, 'endDate', format(range.from, 'yyyy-MM-dd'))
                                  }
                                } else {
                                  updateTaskField(task.id, 'startDate', '—')
                                  updateTaskField(task.id, 'endDate', '—')
                                }
                              }}
                              numberOfMonths={2}
                            />
                          </PopoverContent>
                        </Popover>
                      </td>
                      <td 
                        className="px-4 py-3 border-r border-gray-200 cursor-pointer"
                        onClick={() => setEditingCell({ taskId: task.id, field: 'colId' })}
                      >
                        {editingCell?.taskId === task.id && editingCell?.field === 'colId' ? (
                          <TaskSelect
                            value={task.colId}
                            options={cols.map(c => ({
                              value: c.id,
                              label: c.label,
                            }))}
                            onChange={value => {
                              updateTaskField(task.id, 'colId', value)
                              setEditingCell(null)
                            }}
                            triggerClassName="h-7 border-transparent bg-transparent px-1 py-0 text-[12px] shadow-none hover:bg-gray-100"
                          />
                        ) : (
                          col && (
                            <span className="inline-flex items-center gap-1.5 text-[12px] font-medium text-gray-700 bg-gray-100/80 px-2 py-0.5 rounded-full border border-gray-200">
                              <span className="h-2 w-2 rounded-full inline-block" style={{ background: col.dot }} />
                              {col.label}
                            </span>
                          )
                        )}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
            {/* Create task button bottom of table */}
            <div className="border-t border-gray-200">
              <button
                onClick={createTableTask}
                className="w-full text-left px-4 py-2.5 text-[12px] font-medium text-gray-500 hover:bg-gray-50 transition-colors flex items-center gap-1.5"
              >
                <PlusIcon className="h-4 w-4" />
                Crear tarea
              </button>
            </div>
          </div>
        </div>
      )}

      {isPanelOpen && (
        <TaskDetailPanel
          task={newTaskData}
          columns={cols.map(c => ({
            value: c.id,
            label: c.label,
          }))}
          priorities={taskSettings.priorities.map(priority => ({
            value: priority.id,
            label: priority.label,
          }))}
          tags={taskSettings.labels.map(tag => ({
            value: tag.id,
            label: tag.label,
          }))}
          assignees={taskSettings.assignees.map(assignee => ({
            value: assignee.id,
            label: assignee.fullName,
          }))}
          projects={taskSettings.projects.map(project => ({
            value: project.id,
            label: (
              <span className="inline-flex items-center gap-2">
                <span
                  className="h-2 w-2 rounded-full"
                  style={{ background: project.color ?? '#64748B' }}
                />
                {project.label}
              </span>
            ),
          }))}
          showWorkspace={!currentWorkspace}
          isClosing={isPanelClosing}
          onChange={handlePanelTaskChange}
          onClose={closeTaskPanel}
          onSave={handleSaveTask}
        />
      )}
      {/* Help FAB */}
      <div className="fixed bottom-6 right-6">
        <button
          className="h-8 w-8 rounded-full bg-white flex items-center justify-center text-gray-400 hover:text-gray-600 transition-all"
          style={{ border: '1px solid #E5E7EB', boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}
          title="Ayuda"
        >
          <QuestionMarkCircleIcon className="h-4 w-4" />
        </button>
      </div>
    </div>
  )
}
