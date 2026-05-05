import { PencilSquareIcon, PlusIcon, TrashIcon } from '@heroicons/react/24/outline'
import { useEffect, useState } from 'react'

import PageContainer from '@/components/PageContainer/PageContainer'
import { loadTaskSettings, saveTaskSettings } from '@/data/taskSettings'
import type { TaskSettings } from '@/types/taskSettings'

type SettingsTab = 'projects' | 'assignees' | 'labels' | 'priorities' | 'statuses'

const COLORS = ['#6366f1', '#0ea5e9', '#10b981', '#22c55e', '#f59e0b', '#f87171', '#ec4899', '#a855f7', '#14b8a6', '#94a3b8']
const SOFT_COLORS = ['#EEF2FF', '#E0F2FE', '#D1FAE5', '#DCFCE7', '#FEF3C7', '#FEE2E2', '#FCE7F3', '#F5F3FF', '#CCFBF1', '#F1F5F9']

const TABS: Array<{ id: SettingsTab; label: string; role: string }> = [
  { id: 'projects', label: 'Proyectos', role: 'proyecto' },
  { id: 'assignees', label: 'Responsables', role: 'miembro' },
  { id: 'labels', label: 'Etiquetas', role: 'etiqueta' },
  { id: 'priorities', label: 'Prioridades', role: 'prioridad' },
  { id: 'statuses', label: 'Estados', role: 'estado' },
]

function slug(value: string) {
  return value
    .trim()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
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

function softColorFor(color: string) {
  if (color === '#ef4444') return '#FEE2E2'
  if (color === '#f59e0b') return '#FEF3C7'
  if (color === '#64748b') return '#F1F5F9'
  const index = COLORS.indexOf(color)
  return SOFT_COLORS[index >= 0 ? index : 0]
}

function priorityColorFor(name: string, fallback: string) {
  const normalized = name.trim().toLowerCase()
  if (normalized === 'alta') return '#ef4444'
  if (normalized === 'media') return '#f59e0b'
  if (normalized === 'baja') return '#64748b'
  return fallback
}

function colorForNewItem(tab: SettingsTab, name: string, selectedColor: string) {
  return tab === 'priorities' ? priorityColorFor(name, selectedColor) : selectedColor
}

interface CardItem {
  id: string
  name: string
  initials: string
  color: string
  role: string
}

function Avatar({ initials, color, size = 44 }: { initials: string; color: string; size?: number }) {
  return (
    <div
      className="flex shrink-0 items-center justify-center rounded-full font-semibold tracking-[0.02em] text-white"
      style={{
        width: size,
        height: size,
        background: color,
        fontSize: size * 0.3,
      }}
    >
      {initials}
    </div>
  )
}

function SettingsCard({
  item,
  tab,
  onEdit,
  onDelete,
}: {
  item: CardItem
  tab: SettingsTab
  onEdit: (item: CardItem) => void
  onDelete: (id: string) => void
}) {
  const [hover, setHover] = useState(false)
  const isAssignee = tab === 'assignees'
  const isProject = tab === 'projects'
  const isLabel = tab === 'labels'
  const isPriority = tab === 'priorities'
  const isStatus = tab === 'statuses'

  const actions = (
    <span className={`ml-1.5 inline-flex items-center gap-0.5 transition-opacity ${hover ? 'opacity-100' : 'opacity-0'}`}>
      <button
        type="button"
        onClick={() => onEdit(item)}
        className="flex h-5 w-5 items-center justify-center rounded text-gray-400 transition-colors hover:bg-white/70 hover:text-gray-700"
        title="Editar"
      >
        <PencilSquareIcon className="h-3.5 w-3.5" />
      </button>
      <button
        type="button"
        onClick={() => onDelete(item.id)}
        className="flex h-5 w-5 items-center justify-center rounded text-gray-400 transition-colors hover:bg-red-50 hover:text-red-600"
        title="Eliminar"
      >
        <TrashIcon className="h-3.5 w-3.5" />
      </button>
    </span>
  )

  if (isLabel || isPriority || isStatus) {
    return (
      <div
        onMouseEnter={() => setHover(true)}
        onMouseLeave={() => setHover(false)}
        className="relative flex min-h-[44px] items-center"
      >
        {isLabel && (
          <span
            className="inline-flex max-w-full items-center rounded-md border px-2.5 py-1.5 text-[13px] font-medium shadow-sm"
            style={{
              background: softColorFor(item.color),
              borderColor: `${item.color}33`,
              color: item.color,
            }}
          >
            <span className="truncate">{item.name}</span>
            {actions}
          </span>
        )}

        {isPriority && (
          <span
            className="inline-flex items-center gap-1.5 rounded-md border px-2.5 py-1.5 text-[13px] font-semibold shadow-sm"
            style={{
              background: softColorFor(item.color),
              borderColor: `${item.color}33`,
              color: item.color,
            }}
          >
            <span className="h-1.5 w-1.5 rounded-full" style={{ background: item.color }} />
            {item.name}
            {actions}
          </span>
        )}

        {isStatus && (
          <span className="inline-flex items-center gap-2 rounded-md border border-gray-200 bg-gray-100 px-2.5 py-1.5 text-[13px] font-medium text-gray-700 shadow-sm">
            <span className="h-2 w-2 rounded-full" style={{ background: item.color }} />
            <span className="truncate">{item.name}</span>
            {actions}
          </span>
        )}
      </div>
    )
  }

  return (
    <div
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      className="relative flex min-h-[76px] items-center gap-3 rounded-xl border border-gray-200 bg-white px-4 py-3.5 transition-shadow"
      style={{ boxShadow: hover ? '0 4px 16px rgba(0,0,0,0.07)' : 'none' }}
    >
      {(isAssignee || isProject) && (
        <>
          <Avatar initials={item.initials} color={item.color} />
          <div className="min-w-0 flex-1">
            <div className="truncate text-[14px] font-semibold text-gray-900">{item.name}</div>
            <div className="mt-0.5 text-[12px] text-gray-500">{item.role}</div>
          </div>
        </>
      )}

      {hover && (
        <div className="absolute right-2 top-2 flex items-center gap-1">
          <button
            type="button"
            onClick={() => onEdit(item)}
            className="flex h-6 w-6 items-center justify-center rounded-md bg-white text-gray-400 shadow-sm ring-1 ring-gray-200 transition-colors hover:bg-gray-50 hover:text-gray-700"
            title="Editar"
          >
            <PencilSquareIcon className="h-3.5 w-3.5" />
          </button>
          <button
            type="button"
            onClick={() => onDelete(item.id)}
            className="flex h-6 w-6 items-center justify-center rounded-md bg-red-50 text-red-600 transition-colors hover:bg-red-100"
            title="Eliminar"
          >
            <TrashIcon className="h-3.5 w-3.5" />
          </button>
        </div>
      )}
    </div>
  )
}

function AddPreview({ tab, input, color }: { tab: SettingsTab; input: string; color: string }) {
  const label = input || 'Nuevo'

  if (tab === 'labels') {
    return (
      <span
        className="inline-flex max-w-[120px] items-center rounded-md border px-2 py-1 text-[13px] font-medium shadow-sm"
        style={{ background: softColorFor(color), borderColor: `${color}33`, color }}
      >
        <span className="truncate">{label}</span>
      </span>
    )
  }

  if (tab === 'priorities') {
    return (
      <span
        className="inline-flex items-center gap-1.5 rounded-md border px-2 py-1 text-[13px] font-semibold shadow-sm"
        style={{ background: softColorFor(color), borderColor: `${color}33`, color }}
      >
        <span className="h-1.5 w-1.5 rounded-full" style={{ background: color }} />
        {label}
      </span>
    )
  }

  if (tab === 'statuses') {
    return (
      <span className="inline-flex items-center gap-2 rounded-md border border-gray-200 bg-gray-100 px-2 py-1 text-[13px] font-medium text-gray-700 shadow-sm">
        <span className="h-2 w-2 rounded-full" style={{ background: color }} />
        {label}
      </span>
    )
  }

  return <Avatar initials={input ? getInitials(input) : '?'} color={color} size={38} />
}

function AddForm({
  tab,
  initialName = '',
  initialColor = COLORS[0],
  submitLabel = 'Agregar',
  onSubmit,
  onCancel,
}: {
  tab: SettingsTab
  initialName?: string
  initialColor?: string
  submitLabel?: string
  onSubmit: (name: string, color: string) => void
  onCancel: () => void
}) {
  const [input, setInput] = useState(initialName)
  const [color, setColor] = useState(initialColor)
  const placeholder = tab === 'assignees'
    ? 'Nombre del responsable'
    : tab === 'projects'
      ? 'Nombre del proyecto'
      : 'Nombre'

  function submit() {
    const value = input.trim()
    if (!value) return
    onSubmit(value, colorForNewItem(tab, value, color))
    setInput('')
  }

  return (
    <div className="mb-5 max-w-[760px] rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="shrink-0">
          <AddPreview tab={tab} input={input} color={color} />
        </div>
        <input
          autoFocus
          value={input}
          onChange={event => setInput(event.target.value)}
          onKeyDown={event => {
            if (event.key === 'Enter') submit()
            if (event.key === 'Escape') onCancel()
          }}
          placeholder={placeholder}
          className="h-10 min-w-0 flex-1 rounded-lg border border-gray-200 bg-white px-3 text-[13px] text-gray-900 outline-none transition-colors placeholder:text-gray-400 focus:border-gray-400"
        />
        <div className="flex shrink-0 items-center gap-2">
          <button
            type="button"
            onClick={submit}
            className="h-10 rounded-lg bg-[#6472EB] px-4 text-[13px] font-semibold text-white transition-colors hover:bg-[#5360D8]"
          >
            {submitLabel}
          </button>
          <button
            type="button"
            onClick={onCancel}
            className="h-10 rounded-lg border border-gray-200 bg-white px-4 text-[13px] font-medium text-gray-600 transition-colors hover:bg-gray-50 hover:text-gray-800"
          >
            Cancelar
          </button>
        </div>
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-1.5">
        <span className="mr-1 text-[12px] font-medium text-gray-500">Color</span>
          {COLORS.map(itemColor => (
            <button
              key={itemColor}
              type="button"
              onClick={() => setColor(itemColor)}
              className="h-[18px] w-[18px] rounded-full"
              style={{
                background: itemColor,
                outline: color === itemColor ? '1px solid #1c1917' : '1px solid transparent',
                outlineOffset: 1,
              }}
              title="Elegir color"
            />
          ))}
      </div>
    </div>
  )
}

function AddButton({ compact, onClick }: { compact: boolean; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={
        compact
          ? 'inline-flex min-h-[44px] items-center gap-1.5 rounded-md border border-transparent bg-transparent px-2.5 py-1.5 text-[13px] font-medium text-gray-400 transition-colors hover:border-gray-200 hover:bg-gray-50 hover:text-[#6472EB]'
          : 'flex min-h-[76px] items-center justify-center gap-2 rounded-xl border border-transparent bg-transparent px-3 text-[13px] font-medium text-gray-400 transition-colors hover:border-gray-200 hover:bg-gray-50 hover:text-[#6472EB]'
      }
    >
      <PlusIcon className="h-4 w-4" />
      Agregar
    </button>
  )
}

export default function AjustesPage() {
  const [tab, setTab] = useState<SettingsTab>('assignees')
  const [adding, setAdding] = useState(false)
  const [editingItem, setEditingItem] = useState<CardItem | null>(null)
  const [settings, setSettings] = useState<TaskSettings>(() => loadTaskSettings())

  useEffect(() => {
    saveTaskSettings(settings)
  }, [settings])

  const items: Record<SettingsTab, CardItem[]> = {
    projects: settings.projects.map(project => ({
      id: project.id,
      name: project.label,
      initials: getInitials(project.label),
      color: project.color ?? COLORS[0],
      role: 'proyecto',
    })),
    assignees: settings.assignees.map(assignee => ({
      id: assignee.id,
      name: assignee.fullName,
      initials: assignee.id,
      color: assignee.text,
      role: 'miembro',
    })),
    labels: settings.labels.map(label => ({
      id: label.id,
      name: label.label,
      initials: getInitials(label.label),
      color: label.text,
      role: 'etiqueta',
    })),
    priorities: settings.priorities.map(priority => ({
      id: priority.id,
      name: priority.label,
      initials: getInitials(priority.label),
      color: priorityColorFor(priority.label, priority.text),
      role: 'prioridad',
    })),
    statuses: settings.statuses.map(status => ({
      id: status.id,
      name: status.label,
      initials: getInitials(status.label),
      color: status.dot,
      role: 'estado',
    })),
  }

  function addItem(name: string, color: string) {
    const resolvedColor = colorForNewItem(tab, name, color)

    setSettings(prev => {
      if (tab === 'projects') {
        return {
          ...prev,
          projects: [...prev.projects, { id: slug(name), label: name, color: resolvedColor }],
        }
      }

      if (tab === 'assignees') {
        const initials = getInitials(name) || slug(name).slice(0, 2).toUpperCase()
        return {
          ...prev,
          assignees: [...prev.assignees, {
            id: initials,
            fullName: name,
            bg: softColorFor(resolvedColor),
            text: resolvedColor,
          }],
        }
      }

      if (tab === 'labels') {
        return {
          ...prev,
          labels: [...prev.labels, {
            id: name,
            label: name,
            bg: softColorFor(resolvedColor),
            text: resolvedColor,
          }],
        }
      }

      if (tab === 'priorities') {
        return {
          ...prev,
          priorities: [...prev.priorities, {
            id: name,
            label: name,
            bg: softColorFor(resolvedColor),
            text: resolvedColor,
          }],
        }
      }

      return {
        ...prev,
        statuses: [...prev.statuses, {
          id: slug(name),
          label: name,
          dot: resolvedColor,
        }],
      }
    })
  }

  function updateItem(id: string, name: string, color: string) {
    const resolvedColor = colorForNewItem(tab, name, color)

    setSettings(prev => ({
      ...prev,
      projects: tab === 'projects'
        ? prev.projects.map(item => item.id === id ? { ...item, label: name, color: resolvedColor } : item)
        : prev.projects,
      assignees: tab === 'assignees'
        ? prev.assignees.map(item => item.id === id
          ? { ...item, fullName: name, bg: softColorFor(resolvedColor), text: resolvedColor }
          : item)
        : prev.assignees,
      labels: tab === 'labels'
        ? prev.labels.map(item => item.id === id
          ? { ...item, label: name, bg: softColorFor(resolvedColor), text: resolvedColor }
          : item)
        : prev.labels,
      priorities: tab === 'priorities'
        ? prev.priorities.map(item => item.id === id
          ? { ...item, label: name, bg: softColorFor(resolvedColor), text: resolvedColor }
          : item)
        : prev.priorities,
      statuses: tab === 'statuses'
        ? prev.statuses.map(item => item.id === id ? { ...item, label: name, dot: resolvedColor } : item)
        : prev.statuses,
    }))
  }

  function deleteItem(id: string) {
    setSettings(prev => ({
      ...prev,
      projects: tab === 'projects' ? prev.projects.filter(item => item.id !== id) : prev.projects,
      assignees: tab === 'assignees' ? prev.assignees.filter(item => item.id !== id) : prev.assignees,
      labels: tab === 'labels' ? prev.labels.filter(item => item.id !== id) : prev.labels,
      priorities: tab === 'priorities' ? prev.priorities.filter(item => item.id !== id) : prev.priorities,
      statuses: tab === 'statuses' ? prev.statuses.filter(item => item.id !== id) : prev.statuses,
    }))
  }

  const compactList = tab === 'labels' || tab === 'priorities' || tab === 'statuses'

  return (
    <PageContainer size="wide">
      <div className="max-w-[1080px]">
        <div className="mb-8">
          <h1 className="text-[26px] font-bold tracking-tight text-gray-900">Ajustes</h1>
          <p className="mt-1 text-[13px] text-gray-500">Configura las opciones de tus tareas.</p>
        </div>

        <div className="mb-6 flex flex-wrap gap-1.5">
          {TABS.map(item => {
            const isActive = tab === item.id
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => {
                  setTab(item.id)
                  setAdding(false)
                  setEditingItem(null)
                }}
                className={`flex items-center gap-1.5 rounded-full border px-4 py-1.5 text-[13px] transition-colors ${
                  isActive
                  ? 'border-[#6472EB] bg-[#6472EB] font-semibold text-white'
                  : 'border-gray-200 bg-white text-gray-500 hover:border-gray-300 hover:bg-gray-50 hover:text-gray-700'
                }`}
              >
                {item.label}
                <span
                  className={`rounded-full px-1.5 py-0.5 text-[11px] ${
                    isActive ? 'bg-white/25 text-white' : 'bg-gray-100 text-gray-400'
                  }`}
                >
                  {items[item.id].length}
                </span>
              </button>
            )
          })}
        </div>

        {adding && (
          <AddForm
            key={`add-${tab}`}
            tab={tab}
            submitLabel="Agregar"
            onSubmit={(name, color) => {
              addItem(name, color)
              setAdding(false)
            }}
            onCancel={() => setAdding(false)}
          />
        )}

        {editingItem && (
          <AddForm
            key={`edit-${tab}-${editingItem.id}`}
            tab={tab}
            initialName={editingItem.name}
            initialColor={editingItem.color}
            submitLabel="Guardar"
            onSubmit={(name, color) => {
              updateItem(editingItem.id, name, color)
              setEditingItem(null)
            }}
            onCancel={() => setEditingItem(null)}
          />
        )}

        <div className={compactList ? 'flex flex-wrap items-center gap-2' : 'grid grid-cols-3 gap-3'}>
          {items[tab].map(item => (
            <SettingsCard
              key={item.id}
              item={item}
              tab={tab}
              onEdit={selectedItem => {
                setAdding(false)
                setEditingItem(selectedItem)
              }}
              onDelete={deleteItem}
            />
          ))}
          <AddButton
            compact={compactList}
            onClick={() => {
              setEditingItem(null)
              setAdding(true)
            }}
          />
        </div>
      </div>
    </PageContainer>
  )
}
