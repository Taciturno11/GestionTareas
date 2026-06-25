import {
  ArrowPathIcon,
  ArrowRightIcon,
  BellIcon,
  CalendarIcon,
  ChartBarIcon,
  CheckCircleIcon,
  ClipboardDocumentListIcon,
  ClockIcon,
} from '@heroicons/react/24/outline'
import { HandRaisedIcon } from '@heroicons/react/24/solid'
import { Bar, BarChart, Cell, LabelList, ResponsiveContainer, XAxis, YAxis } from 'recharts'
import { useMemo } from 'react'

import PageContainer from '@/components/PageContainer/PageContainer'
import { useCurrentUser } from '@/hooks/useCurrentUser'
import { useProjects } from '@/hooks/useProjects'
import { useTaskSettings } from '@/hooks/useTaskSettings'
import { useTasks } from '@/hooks/useTasks'
import { useWorkspaces } from '@/hooks/useWorkspaces'
import type { Task } from '@/types/task'

const AVATAR: Record<string, { bg: string; text: string }> = {
  MN: { bg: '#EDE9FE', text: '#5B21B6' },
  AL: { bg: '#DBEAFE', text: '#1D4ED8' },
  CR: { bg: '#FFE4E6', text: '#9F1239' },
  LT: { bg: '#D1FAE5', text: '#065F46' },
  AG: { bg: '#FEF9C3', text: '#713F12' },
}

const URGENCY_COLOR: Record<string, { bg: string; text: string; dot: string }> = {
  high: { bg: '#FEE2E2', text: '#B91C1C', dot: '#EF4444' },
  medium: { bg: '#FEF3C7', text: '#92400E', dot: '#F59E0B' },
  low: { bg: '#F1F5F9', text: '#64748B', dot: '#9CA3AF' },
}

const PRIORITY_LABEL: Record<string, { label: string; bg: string; text: string }> = {
  high: { label: 'Alta', bg: '#FEE2E2', text: '#B91C1C' },
  medium: { label: 'Media', bg: '#FEF3C7', text: '#92400E' },
  low: { label: 'Baja', bg: '#F1F5F9', text: '#64748B' },
}

const STATUS_DOT: Record<string, string> = {
  backlog: '#F59E0B',
  pendiente: '#F59E0B',
  in_progress: '#3B82F6',
  'en-progreso': '#3B82F6',
  review: '#8B5CF6',
  completed: '#10B981',
  completada: '#10B981',
}

const EMPTY_TASKS: Task[] = []

function Card({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return (
    <div
      className={`overflow-hidden rounded-xl bg-white ${className}`}
      style={{ border: '1px solid #E5E7EB', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}
    >
      {children}
    </div>
  )
}

function SectionHeader({ title, action }: { title: string; action?: string }) {
  return (
    <div className="flex items-center justify-between border-b border-gray-100 px-4 py-2.5">
      <h2 className="text-[13px] font-semibold text-gray-800">{title}</h2>
      {action && (
        <button className="flex items-center gap-1 text-[11px] font-medium text-indigo-600 transition-colors hover:text-indigo-800">
          {action} <ArrowRightIcon className="h-3 w-3" />
        </button>
      )}
    </div>
  )
}

function EmptyState({ title, description }: { title: string; description: string }) {
  return (
    <div className="px-4 py-8 text-center">
      <p className="text-[13px] font-semibold text-gray-800">{title}</p>
      <p className="mt-1 text-[12px] text-gray-500">{description}</p>
    </div>
  )
}

function normalize(value: string | null | undefined) {
  return (value ?? '')
    .trim()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
}

function isCompleted(task: Task) {
  const status = normalize(task.status)
  return ['completed', 'complete', 'completada', 'completado', 'done', 'finalizada', 'finalizado', 'hecho'].includes(status)
}

function isInProgress(task: Task) {
  const status = normalize(task.status)
  return ['in_progress', 'en progreso', 'en-progreso', 'progreso', 'review', 'revision'].includes(status)
}

function isOverdue(task: Task, today: Date) {
  if (!task.endDate || isCompleted(task)) return false
  const dueDate = new Date(`${task.endDate}T23:59:59`)
  return Number.isFinite(dueDate.getTime()) && dueDate < today
}

function formatShortDate(value: string | null | undefined) {
  if (!value) return ''
  const dateOnly = value.slice(0, 10)
  const [year, month, day] = dateOnly.split('-').map(Number)
  if (!year || !month || !day) return ''

  return new Intl.DateTimeFormat('es', {
    day: 'numeric',
    month: 'short',
    timeZone: 'UTC',
  }).format(new Date(Date.UTC(year, month - 1, day)))
}

function dueLabel(value: string | null | undefined, today: Date) {
  if (!value) return 'Sin fecha'
  const due = new Date(`${value}T00:00:00`)
  if (!Number.isFinite(due.getTime())) return 'Sin fecha'
  const start = new Date(today.getFullYear(), today.getMonth(), today.getDate())
  const diffDays = Math.round((due.getTime() - start.getTime()) / 86_400_000)
  if (diffDays < 0) return 'Vencida'
  if (diffDays === 0) return 'Hoy'
  if (diffDays === 1) return 'Mañana'
  return `En ${diffDays} dias`
}

function urgencyFor(value: string | null | undefined, today: Date) {
  if (!value) return 'low'
  const due = new Date(`${value}T00:00:00`)
  if (!Number.isFinite(due.getTime())) return 'low'
  const start = new Date(today.getFullYear(), today.getMonth(), today.getDate())
  const diffDays = Math.round((due.getTime() - start.getTime()) / 86_400_000)
  if (diffDays <= 1) return 'high'
  if (diffDays <= 3) return 'medium'
  return 'low'
}

function initials(value: string | null | undefined) {
  const source = value?.trim() || 'Usuario'
  return source
    .split(/\s+/)
    .map(part => part[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)
}

function timestamp(task: Task) {
  const date = new Date(task.updatedAt ?? task.createdAt)
  return Number.isFinite(date.getTime()) ? date.getTime() : 0
}

function formatRecentActivityDate(task: Task) {
  const date = new Date(task.updatedAt ?? task.createdAt)
  if (!Number.isFinite(date.getTime())) return 'Fecha no disponible'

  return new Intl.DateTimeFormat('es', {
    day: '2-digit',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date)
}

function priorityMeta(priority: string | null | undefined) {
  const value = normalize(priority)
  if (value === 'alta' || value === 'high') return PRIORITY_LABEL.high
  if (value === 'media' || value === 'medium') return PRIORITY_LABEL.medium
  return PRIORITY_LABEL.low
}

export default function InicioPage() {
  const { user } = useCurrentUser()
  const { activeWorkspaceId } = useWorkspaces()
  const { settings } = useTaskSettings(activeWorkspaceId)
  const { projects: workspaceProjects } = useProjects(activeWorkspaceId)
  const { tasks: workspaceTasks } = useTasks<Task[]>(EMPTY_TASKS, { workspaceId: activeWorkspaceId })
  const today = useMemo(() => new Date(), [])
  const userInitials = initials(user?.name)

  const tasks = useMemo(
    () => workspaceTasks.filter(task => !activeWorkspaceId || task.workspaceId === activeWorkspaceId),
    [activeWorkspaceId, workspaceTasks],
  )

  const recentTasks = useMemo(
    () => [...tasks].sort((a, b) => timestamp(b) - timestamp(a)).slice(0, 6),
    [tasks],
  )

  const upcomingTasks = useMemo(
    () =>
      tasks
        .filter(task => !isCompleted(task) && task.endDate)
        .sort((a, b) => new Date(`${a.endDate}T00:00:00`).getTime() - new Date(`${b.endDate}T00:00:00`).getTime())
        .slice(0, 4),
    [tasks],
  )

  const totalTasks = tasks.length
  const completedTasks = tasks.filter(isCompleted).length
  const inProgressTasks = tasks.filter(isInProgress).length
  const overdueTasks = tasks.filter(task => isOverdue(task, today)).length
  const pendingTasks = totalTasks - completedTasks
  const stats = [
    { label: 'Total Tareas', value: totalTasks, color: '#4F46E5', bgColor: '#EEF2FF', delta: totalTasks === 0 ? 'Aun no tienes tareas' : `${pendingTasks} pendientes` },
    { label: 'Completadas', value: completedTasks, color: '#10B981', bgColor: '#D1FAE5', delta: `${completedTasks} completadas` },
    { label: 'En Progreso', value: inProgressTasks, color: '#3B82F6', bgColor: '#DBEAFE', delta: `${overdueTasks} vencidas` },
    { label: 'Pendientes', value: pendingTasks, color: '#F59E0B', bgColor: '#FEF3C7', delta: pendingTasks === 0 ? 'Sin pendientes' : `${pendingTasks} por hacer` },
  ]

  const projects = useMemo(() => {
    const projectsById = new Map(workspaceProjects.map(project => [project.id, project]))
    const grouped = new Map<string, { id: string; name: string; color: string; totalTasks: number; completedTasks: number }>()
    const doneStatusIds = new Set(
      settings.statuses
        .filter(status => normalize(status.id) === 'hecho' || normalize(status.label) === 'hecho')
        .map(status => status.id),
    )

    tasks.forEach(task => {
      const projectId = task.projectId || 'sin-proyecto'
      const project = projectsById.get(projectId)
      const current = grouped.get(projectId) ?? {
        id: projectId,
        name: project?.name || 'Sin proyecto',
        color: project?.color || task.color || '#4F46E5',
        totalTasks: 0,
        completedTasks: 0,
      }
      current.totalTasks += 1
      if (doneStatusIds.has(task.status) || normalize(task.status) === 'hecho') {
        current.completedTasks += 1
      }
      grouped.set(projectId, current)
    })

    return [...grouped.values()].slice(0, 6)
  }, [workspaceProjects, settings.statuses, tasks])

  return (
    <PageContainer size="fluid" align="start" className="!px-4 md:!px-6 2xl:!px-10">
      <div className="mb-6">
        <h1 className="flex items-center gap-2 text-[22px] font-bold leading-tight text-gray-900">
          <HandRaisedIcon className="h-6 w-6 text-yellow-500" />
          Buen dia, {user?.name?.split(' ')[0] ?? 'Usuario'}
        </h1>
        <p className="mt-1 text-[13px] text-gray-500">
          {new Intl.DateTimeFormat('es', { weekday: 'long', day: '2-digit', month: 'long' }).format(today)} · resumen de hoy
        </p>
      </div>

      <div className="mb-8 grid grid-cols-4 gap-4">
        {stats.map(stat => {
          let Icon = ClipboardDocumentListIcon
          if (stat.label === 'Completadas') Icon = CheckCircleIcon
          if (stat.label === 'En Progreso') Icon = ArrowPathIcon
          if (stat.label === 'Pendientes') Icon = ClockIcon

          return (
            <div
              key={stat.label}
              className="flex items-center gap-3.5 rounded-xl bg-white px-4 py-3"
              style={{ border: '1px solid #E5E7EB', boxShadow: '0 1px 2px rgba(0,0,0,0.03)' }}
            >
              <span
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg"
                style={{ background: stat.bgColor, color: stat.color }}
              >
                <Icon className="h-5 w-5" />
              </span>

              <div className="flex min-w-0 flex-col">
                <div className="flex items-baseline gap-1.5">
                  <span className="text-[20px] font-bold leading-none text-gray-900">{stat.value}</span>
                  <span className="truncate text-[12px] font-medium leading-none text-gray-500">{stat.label}</span>
                </div>
                <p className="mt-1 truncate text-[10.5px] font-medium" style={{ color: stat.color }}>
                  {stat.delta}
                </p>
              </div>
            </div>
          )
        })}
      </div>

      <div className="grid grid-cols-[1.2fr_1fr] gap-6">
        <div className="flex flex-col gap-6">
          <Card>
            <SectionHeader title="Tareas recientes" action="Ver todas" />
            <div>
              {recentTasks.map((task, i) => {
                const statusDot = settings.statuses.find(status => status.id === task.status)?.dot
                const dot = statusDot ?? STATUS_DOT[task.status] ?? '#9CA3AF'
                const prio = priorityMeta(task.priority)
                const assignee = task.assignee ?? settings.assignees.find(item => item.id === task.assigneeId)?.fullName ?? userInitials
                const assigneeInitials = initials(assignee)
                const avatar = AVATAR[assigneeInitials] ?? { bg: '#F3F4F6', text: '#374151' }

                return (
                  <div
                    key={task.id}
                    className="flex cursor-pointer items-center gap-3 px-4 py-2.5 transition-colors hover:bg-gray-50"
                    style={{ borderBottom: i < recentTasks.length - 1 ? '1px solid #F9FAFB' : 'none' }}
                  >
                    <span className="h-1.5 w-1.5 shrink-0 rounded-full" style={{ background: dot }} />
                    <p className="flex-1 truncate text-[12.5px] font-medium text-gray-800">{task.title}</p>
                    <span className="shrink-0 rounded bg-indigo-50 px-1.5 py-0.5 text-[10px] font-semibold text-indigo-700">{task.tag || 'General'}</span>
                    <span className="shrink-0 rounded px-1.5 py-0.5 text-[10px] font-semibold" style={{ background: prio.bg, color: prio.text }}>{prio.label}</span>
                    <span className="flex shrink-0 items-center gap-0.5 text-[10px] text-gray-400">
                      <CalendarIcon className="h-2.5 w-2.5" />
                      {formatShortDate(task.endDate)}
                    </span>
                    <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-[8px] font-bold" style={{ background: avatar.bg, color: avatar.text }}>
                      {assigneeInitials}
                    </div>
                  </div>
                )
              })}
              {recentTasks.length === 0 && (
                <EmptyState title="Aun no tienes tareas" description="Crea tu primera tarea para ver actividad aqui." />
              )}
            </div>
          </Card>

          <Card>
            <div className="flex items-center gap-2 border-b border-gray-100 px-4 py-2.5">
              <ClockIcon className="h-4 w-4 text-gray-500" />
              <h2 className="text-[13px] font-semibold text-gray-800">Proximos vencimientos</h2>
            </div>
            <div>
              {upcomingTasks.map((task, i) => {
                const urgency = urgencyFor(task.endDate, today)
                const color = URGENCY_COLOR[urgency]
                const assignee = task.assignee ?? settings.assignees.find(option => option.id === task.assigneeId)?.fullName ?? userInitials
                const assigneeInitials = initials(assignee)
                const avatar = AVATAR[assigneeInitials] ?? { bg: '#F3F4F6', text: '#374151' }

                return (
                  <div
                    key={task.id}
                    className="flex cursor-pointer items-center gap-3 px-4 py-2.5 transition-colors hover:bg-gray-50"
                    style={{ borderBottom: i < upcomingTasks.length - 1 ? '1px solid #F9FAFB' : 'none' }}
                  >
                    <span className="h-1.5 w-1.5 shrink-0 rounded-full" style={{ background: color.dot }} />
                    <p className="flex-1 truncate text-[12.5px] font-medium text-gray-800">{task.title}</p>
                    <span className="shrink-0 rounded px-2 py-0.5 text-[10px] font-semibold" style={{ background: color.bg, color: color.text }}>{dueLabel(task.endDate, today)}</span>
                    <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-[8px] font-bold" style={{ background: avatar.bg, color: avatar.text }}>
                      {assigneeInitials}
                    </div>
                  </div>
                )
              })}
              {upcomingTasks.length === 0 && (
                <EmptyState title="Sin proximos vencimientos" description="Las tareas con fecha apareceran aqui." />
              )}
            </div>
          </Card>
        </div>

        <div className="flex flex-col gap-6">
          <Card>
            <div className="flex items-center gap-2 border-b border-gray-100 px-4 py-2.5">
              <ChartBarIcon className="h-4 w-4 text-gray-500" />
              <h2 className="text-[13px] font-semibold text-gray-800">Progreso de Metas</h2>
            </div>
            <div
              className="relative min-w-0 p-4 [&_.recharts-surface]:outline-none [&_.recharts-wrapper]:outline-none"
              style={{ height: 260 }}
            >
              {projects.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={0}>
                  <BarChart data={projects} margin={{ top: 28, right: 10, left: -25, bottom: 0 }}>
                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#6B7280' }} dy={10} />
                    <YAxis
                      allowDecimals={false}
                      domain={[0, (dataMax: number) => Math.max(dataMax, 1)]}
                      axisLine={false}
                      tickLine={false}
                      tick={{ fontSize: 11, fill: '#9CA3AF' }}
                    />
                    <Bar dataKey="completedTasks" name="Hecho" radius={[4, 4, 0, 0]} barSize={34}>
                      {projects.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                      <LabelList
                        dataKey="completedTasks"
                        position="top"
                        fill="#374151"
                        fontSize={12}
                        fontWeight={700}
                      />
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex h-full flex-col items-center justify-center text-center">
                  <p className="text-[13px] font-semibold text-gray-800">Aun no tienes tareas</p>
                  <p className="mt-1 text-[12px] text-gray-500">Crea tu primera tarea para ver progreso aqui.</p>
                </div>
              )}
            </div>
          </Card>

          <Card>
            <div className="flex items-center gap-2 border-b border-gray-100 px-4 py-2.5">
              <BellIcon className="h-4 w-4 text-gray-500" />
              <h2 className="text-[13px] font-semibold text-gray-800">Actividad reciente</h2>
            </div>
            <div>
              {recentTasks.slice(0, 4).map((task, i) => (
                <div
                  key={task.id}
                  className="flex items-start gap-2.5 px-4 py-2.5"
                  style={{ borderBottom: i < Math.min(recentTasks.length, 4) - 1 ? '1px solid #F9FAFB' : 'none' }}
                >
                  <div className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-[8px] font-bold" style={{ background: '#F3F4F6', color: '#374151' }}>
                    {userInitials}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-[11.5px] leading-snug text-gray-600">
                      <span className="font-semibold text-gray-800">{userInitials}</span>
                      {' '}actualizo{' '}
                      <span className="truncate text-gray-500">"{task.title}"</span>
                    </p>
                    <p className="mt-0.5 text-[10px] text-gray-400">
                      {formatRecentActivityDate(task)}
                    </p>
                  </div>
                </div>
              ))}
              {recentTasks.length === 0 && (
                <EmptyState title="Sin actividad reciente" description="Crea tu primera tarea para ver actividad aqui." />
              )}
            </div>
          </Card>
        </div>
      </div>
    </PageContainer>
  )
}
