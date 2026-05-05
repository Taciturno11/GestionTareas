import { XMarkIcon } from '@heroicons/react/24/outline'
import type { ReactNode } from 'react'

import { DatePicker } from '@/components/ui/date-picker'
import { TaskSelect } from '@/components/ui/task-select'

type TaskPriority = string

export interface TaskDetailPanelTask {
  title: string
  colId: string
  priority: TaskPriority
  tag: string
  startDate: string
  endDate: string
  assignee: string
  workspaceId: string
}

interface TaskDetailPanelOption {
  value: string
  label: ReactNode
}

interface TaskDetailPanelProps {
  task: Partial<TaskDetailPanelTask>
  columns: TaskDetailPanelOption[]
  priorities: TaskDetailPanelOption[]
  tags: TaskDetailPanelOption[]
  assignees: TaskDetailPanelOption[]
  projects: TaskDetailPanelOption[]
  showWorkspace: boolean
  isClosing?: boolean
  onChange: (task: Partial<TaskDetailPanelTask>) => void
  onClose: () => void
  onSave: () => void
}

export default function TaskDetailPanel({
  task,
  columns,
  priorities,
  tags,
  assignees,
  projects,
  showWorkspace,
  isClosing = false,
  onChange,
  onClose,
  onSave,
}: TaskDetailPanelProps) {
  return (
    <div className="fixed inset-0 z-50">
      <button
        type="button"
        className="absolute inset-0 cursor-default"
        onClick={onClose}
        aria-label="Cerrar panel"
      />
      <aside
        className={`absolute inset-y-0 right-0 flex w-full max-w-[420px] flex-col border-l border-gray-200 bg-white shadow-[-12px_0_32px_rgba(15,23,42,0.12)] duration-200 ${
          isClosing
            ? 'animate-out slide-out-to-right'
            : 'animate-in slide-in-from-right'
        }`}
      >
        <div className="flex h-12 items-center justify-between border-b border-gray-100 px-5">
          <h3 className="text-[13px] font-semibold text-gray-800">Editar tarea</h3>
          <button
            type="button"
            onClick={onClose}
            className="rounded-md p-1 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-700"
            title="Cerrar"
          >
            <XMarkIcon className="h-4 w-4" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-5">
        <input
          autoFocus
          className="mb-6 w-full resize-none border-none bg-transparent text-[24px] font-bold leading-tight text-gray-900 outline-none placeholder:text-gray-300"
          placeholder="Tarea sin titulo"
          value={task.title ?? ''}
          onChange={event => onChange({ ...task, title: event.target.value })}
        />

        <div className="space-y-4">
          <div>
            <label className="mb-1.5 block text-[11px] font-semibold uppercase tracking-wide text-gray-400">Estado</label>
            <TaskSelect
              value={task.colId ?? 'pendiente'}
              options={columns}
              onChange={value => onChange({ ...task, colId: value })}
            />
          </div>

          <div>
            <label className="mb-1.5 block text-[11px] font-semibold uppercase tracking-wide text-gray-400">Prioridad</label>
            <TaskSelect
              value={task.priority ?? 'Media'}
              options={priorities}
              onChange={value => onChange({ ...task, priority: value as TaskPriority })}
            />
          </div>

          <div>
            <label className="mb-1.5 block text-[11px] font-semibold uppercase tracking-wide text-gray-400">Etiqueta</label>
            <TaskSelect
              value={task.tag ?? 'General'}
              options={tags}
              onChange={value => onChange({ ...task, tag: value })}
            />
          </div>

          <div>
            <label className="mb-1.5 block text-[11px] font-semibold uppercase tracking-wide text-gray-400">Responsable</label>
            <TaskSelect
              value={task.assignee ?? 'MN'}
              options={assignees}
              onChange={value => onChange({ ...task, assignee: value })}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="min-w-0">
              <label className="mb-1.5 block text-[11px] font-semibold uppercase tracking-wide text-gray-400">Inicio</label>
              <DatePicker
                value={task.startDate}
                onChange={value => onChange({ ...task, startDate: value })}
              />
            </div>
            <div className="min-w-0">
              <label className="mb-1.5 block text-[11px] font-semibold uppercase tracking-wide text-gray-400">Fin</label>
              <DatePicker
                value={task.endDate}
                onChange={value => onChange({ ...task, endDate: value })}
              />
            </div>
          </div>

          {showWorkspace && (
            <div>
              <label className="mb-1.5 block text-[11px] font-semibold uppercase tracking-wide text-gray-400">Proyecto</label>
              <TaskSelect
                value={task.workspaceId ?? 'job-1'}
                options={projects}
                onChange={value => onChange({ ...task, workspaceId: value })}
              />
            </div>
          )}
        </div>
        </div>

        <div className="flex items-center justify-end gap-2 border-t border-gray-100 bg-gray-50 px-5 py-4">
          <button
            type="button"
            onClick={onClose}
            className="rounded-md px-4 py-2 text-[12px] font-medium text-gray-600 transition-colors hover:bg-gray-100 hover:text-gray-800"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={onSave}
            className="rounded-md bg-indigo-600 px-4 py-2 text-[12px] font-semibold text-white shadow-sm transition-colors hover:bg-indigo-700"
          >
            Guardar cambios
          </button>
        </div>
      </aside>
    </div>
  )
}
