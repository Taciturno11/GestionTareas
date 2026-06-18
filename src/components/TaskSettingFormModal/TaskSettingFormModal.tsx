import { XMarkIcon } from '@heroicons/react/24/outline'
import { useState } from 'react'

type TaskSettingFormType = 'projects' | 'assignees' | 'labels' | 'priorities' | 'statuses'

const TASK_SETTING_COLORS = [
  '#6366f1',
  '#0ea5e9',
  '#10b981',
  '#22c55e',
  '#f59e0b',
  '#f87171',
  '#ec4899',
  '#a855f7',
  '#14b8a6',
  '#94a3b8',
]

const SOFT_COLORS = [
  '#EEF2FF',
  '#E0F2FE',
  '#D1FAE5',
  '#DCFCE7',
  '#FEF3C7',
  '#FEE2E2',
  '#FCE7F3',
  '#F5F3FF',
  '#CCFBF1',
  '#F1F5F9',
]

function taskSettingSoftColor(color: string) {
  if (color === '#ef4444') return '#FEE2E2'
  if (color === '#f59e0b') return '#FEF3C7'
  if (color === '#64748b') return '#F1F5F9'
  const index = TASK_SETTING_COLORS.indexOf(color)
  return SOFT_COLORS[index >= 0 ? index : 0]
}

function getInitials(name: string) {
  return name
    .trim()
    .split(/\s+/)
    .map(word => word[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)
}

function priorityColor(name: string, fallback: string) {
  const normalized = name.trim().toLowerCase()
  if (normalized === 'alta') return '#ef4444'
  if (normalized === 'media') return '#f59e0b'
  if (normalized === 'baja') return '#64748b'
  return fallback
}

function Preview({ type, name, color }: { type: TaskSettingFormType; name: string; color: string }) {
  const label = name || 'Nuevo'

  if (type === 'labels') {
    return (
      <span
        className="inline-flex max-w-[120px] items-center rounded-md border px-2 py-1 text-[13px] font-medium shadow-sm"
        style={{ background: taskSettingSoftColor(color), borderColor: `${color}33`, color }}
      >
        <span className="truncate">{label}</span>
      </span>
    )
  }

  if (type === 'priorities') {
    return (
      <span
        className="inline-flex items-center gap-1.5 rounded-md border px-2 py-1 text-[13px] font-semibold shadow-sm"
        style={{ background: taskSettingSoftColor(color), borderColor: `${color}33`, color }}
      >
        <span className="h-1.5 w-1.5 rounded-full" style={{ background: color }} />
        {label}
      </span>
    )
  }

  if (type === 'statuses') {
    return (
      <span className="inline-flex items-center gap-2 rounded-md border border-gray-200 bg-gray-100 px-2 py-1 text-[13px] font-medium text-gray-700 shadow-sm">
        <span className="h-2 w-2 rounded-full" style={{ background: color }} />
        {label}
      </span>
    )
  }

  return (
    <div
      className="flex h-[38px] w-[38px] shrink-0 items-center justify-center rounded-full text-[11px] font-semibold tracking-[0.02em] text-white"
      style={{ background: color }}
    >
      {name ? getInitials(name) : '?'}
    </div>
  )
}

export default function TaskSettingFormModal({
  type,
  initialName = '',
  initialColor = TASK_SETTING_COLORS[0],
  submitLabel = 'Agregar',
  onSubmit,
  onCancel,
}: {
  type: TaskSettingFormType
  initialName?: string
  initialColor?: string
  submitLabel?: string
  onSubmit: (name: string, color: string) => void
  onCancel: () => void
}) {
  const [name, setName] = useState(initialName)
  const [color, setColor] = useState(initialColor)
  const isEditing = submitLabel === 'Guardar'
  const itemLabel = type === 'assignees'
    ? 'responsable'
    : type === 'projects'
      ? 'proyecto'
      : type === 'labels'
        ? 'etiqueta'
        : type === 'priorities'
          ? 'prioridad'
          : 'estado'
  const placeholder = type === 'assignees'
    ? 'Nombre del responsable'
    : type === 'projects'
      ? 'Nombre del proyecto'
      : 'Nombre'

  function submit() {
    const value = name.trim()
    if (!value) return
    onSubmit(value, type === 'priorities' ? priorityColor(value, color) : color)
  }

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/20 px-4"
      onMouseDown={event => {
        if (event.target === event.currentTarget) onCancel()
      }}
    >
      <form
        className="w-full max-w-[520px] rounded-xl border border-gray-200 bg-white p-5 shadow-xl"
        onSubmit={event => {
          event.preventDefault()
          submit()
        }}
      >
        <div className="mb-5 flex items-start justify-between gap-4">
          <div>
            <h3 className="text-[15px] font-semibold text-gray-900">
              {isEditing ? `Editar ${itemLabel}` : `Agregar ${itemLabel}`}
            </h3>
            <p className="mt-1 text-[12px] text-gray-500">
              Define el nombre y color que se usara en las tareas.
            </p>
          </div>
          <button
            type="button"
            onClick={onCancel}
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-700"
            title="Cerrar"
          >
            <XMarkIcon className="h-4 w-4" />
          </button>
        </div>

        <div className="rounded-xl border border-gray-200 bg-slate-50 p-4">
          <div className="mb-4 flex items-center gap-3">
            <Preview type={type} name={name} color={color} />
            <div className="min-w-0 flex-1">
              <label className="mb-1.5 block text-[11px] font-semibold uppercase tracking-wide text-gray-400">
                Nombre
              </label>
              <input
                autoFocus
                value={name}
                onChange={event => setName(event.target.value)}
                onKeyDown={event => {
                  if (event.key === 'Escape') onCancel()
                }}
                placeholder={placeholder}
                className="cursor-text-dark h-10 w-full rounded-lg border border-gray-200 bg-white px-3 text-[13px] text-gray-900 caret-gray-900 outline-none transition-colors placeholder:text-gray-400 focus:border-gray-300 focus:ring-2 focus:ring-gray-200/60"
              />
            </div>
          </div>

          <span className="mb-2 block text-[11px] font-semibold uppercase tracking-wide text-gray-400">Color</span>
          <div className="flex flex-wrap items-center gap-2">
            {TASK_SETTING_COLORS.map(itemColor => (
              <button
                key={itemColor}
                type="button"
                onClick={() => setColor(itemColor)}
                className="h-6 w-6 rounded-full transition-transform hover:scale-105"
                style={{
                  background: itemColor,
                  outline: color === itemColor ? '1px solid #1c1917' : '1px solid rgba(17, 24, 39, 0.12)',
                  outlineOffset: 2,
                }}
                title="Elegir color"
              />
            ))}
          </div>
        </div>

        <div className="mt-5 flex justify-end gap-2">
          <button
            type="button"
            onClick={onCancel}
            className="h-10 rounded-lg border border-gray-200 bg-white px-4 text-[13px] font-medium text-gray-600 transition-colors hover:bg-gray-50 hover:text-gray-800"
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={!name.trim()}
            className="h-10 rounded-lg bg-[#6472EB] px-4 text-[13px] font-semibold text-white transition-colors hover:bg-[#5360D8] disabled:cursor-not-allowed disabled:opacity-50"
          >
            {submitLabel}
          </button>
        </div>
      </form>
    </div>
  )
}
