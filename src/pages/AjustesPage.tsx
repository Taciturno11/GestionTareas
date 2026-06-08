import {
  ArrowDownTrayIcon,
  PencilSquareIcon,
  PlusIcon,
  ShieldCheckIcon,
  ShieldExclamationIcon,
  TrashIcon,
  XMarkIcon,
} from '@heroicons/react/24/outline'
import { useEffect, useState } from 'react'
import { Navigate, useLocation } from 'react-router-dom'

import { authApi, type AuthUser } from '@/api/auth.api'
import PageContainer from '@/components/PageContainer/PageContainer'
import { useCurrentUser } from '@/hooks/useCurrentUser'
import { useTaskSettings } from '@/hooks/useTaskSettings'
import { useWorkspaces } from '@/hooks/useWorkspaces'
import { downloadLocalBackup } from '@/lib/localBackup'
import SettingsSidebar, { type SettingsNavGroup } from '@/pages/settings/SettingsSidebar'

type SettingsTab = 'projects' | 'assignees' | 'labels' | 'priorities' | 'statuses'
type SettingsSection = 'seguridad' | 'usuarios' | 'roles' | 'proyectos' | 'responsables' | 'etiquetas' | 'prioridades' | 'estados' | 'exportar'

const COLORS = ['#6366f1', '#0ea5e9', '#10b981', '#22c55e', '#f59e0b', '#f87171', '#ec4899', '#a855f7', '#14b8a6', '#94a3b8']
const SOFT_COLORS = ['#EEF2FF', '#E0F2FE', '#D1FAE5', '#DCFCE7', '#FEF3C7', '#FEE2E2', '#FCE7F3', '#F5F3FF', '#CCFBF1', '#F1F5F9']

const SECTION_TO_TAB: Partial<Record<SettingsSection, SettingsTab>> = {
  proyectos: 'projects',
  responsables: 'assignees',
  etiquetas: 'labels',
  prioridades: 'priorities',
  estados: 'statuses',
}

const SECTION_TITLES: Record<SettingsSection, string> = {
  seguridad: 'Seguridad',
  usuarios: 'Usuarios',
  roles: 'Roles y permisos',
  proyectos: 'Proyectos',
  responsables: 'Responsables',
  etiquetas: 'Etiquetas',
  prioridades: 'Prioridades',
  estados: 'Estados',
  exportar: 'Exportar datos',
}

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
  const isEditing = submitLabel === 'Guardar'
  const placeholder = tab === 'assignees'
    ? 'Nombre del responsable'
    : tab === 'projects'
      ? 'Nombre del proyecto'
      : 'Nombre'
  const itemLabel = tab === 'assignees'
    ? 'responsable'
    : tab === 'projects'
      ? 'proyecto'
      : tab === 'labels'
        ? 'etiqueta'
        : tab === 'priorities'
          ? 'prioridad'
          : 'estado'

  function submit() {
    const value = input.trim()
    if (!value) return
    onSubmit(value, colorForNewItem(tab, value, color))
    setInput('')
  }

  return (
    <div
      className="fixed inset-0 z-[90] flex items-center justify-center bg-black/20 px-4"
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
            <div className="shrink-0">
              <AddPreview tab={tab} input={input} color={color} />
            </div>
            <div className="min-w-0 flex-1">
              <label className="mb-1.5 block text-[11px] font-semibold uppercase tracking-wide text-gray-400">
                Nombre
              </label>
              <input
                autoFocus
                value={input}
                onChange={event => setInput(event.target.value)}
                onKeyDown={event => {
                  if (event.key === 'Escape') onCancel()
                }}
                placeholder={placeholder}
                className="cursor-text-dark h-10 w-full rounded-lg border border-gray-200 bg-white px-3 text-[13px] text-gray-900 caret-gray-900 outline-none transition-colors placeholder:text-gray-400 focus:border-gray-300 focus:ring-2 focus:ring-gray-200/60"
              />
            </div>
          </div>

          <div>
            <span className="mb-2 block text-[11px] font-semibold uppercase tracking-wide text-gray-400">Color</span>
            <div className="flex flex-wrap items-center gap-2">
              {COLORS.map(itemColor => (
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
            className="h-10 rounded-lg bg-[#6472EB] px-4 text-[13px] font-semibold text-white transition-colors hover:bg-[#5360D8]"
          >
            {submitLabel}
          </button>
        </div>
      </form>
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

function roleLabel(role: AuthUser['role']) {
  if (role === 'admin_unitek') return 'Admin Unitek'
  if (role === 'cliente') return 'Cliente'
  return role
}

export default function AjustesPage() {
  const [adding, setAdding] = useState(false)
  const [editingItem, setEditingItem] = useState<CardItem | null>(null)
  const [securityUser, setSecurityUser] = useState<AuthUser | null>(null)
  const [securityFeedback, setSecurityFeedback] = useState('')
  const [isUpdatingTwoFactor, setIsUpdatingTwoFactor] = useState(false)
  const { activeWorkspaceId } = useWorkspaces()
  const { settings, setSettings } = useTaskSettings(activeWorkspaceId)
  const { user, isLoading: isUserLoading, refreshUser } = useCurrentUser()
  const [backupStatus, setBackupStatus] = useState<'idle' | 'exporting' | 'done' | 'error'>('idle')
  const location = useLocation()
  const sectionPath = location.pathname.split('/')[2] as SettingsSection | undefined
  const validSections = Object.keys(SECTION_TITLES) as SettingsSection[]
  const section = sectionPath && validSections.includes(sectionPath) ? sectionPath : undefined
  const tab = section ? SECTION_TO_TAB[section] : undefined

  useEffect(() => {
    if (user) setSecurityUser(user)
  }, [user])

  useEffect(() => {
    setAdding(false)
    setEditingItem(null)
  }, [section])

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
    if (!tab) return
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
    if (!tab) return
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
    if (!tab) return
    setSettings(prev => ({
      ...prev,
      projects: tab === 'projects' ? prev.projects.filter(item => item.id !== id) : prev.projects,
      assignees: tab === 'assignees' ? prev.assignees.filter(item => item.id !== id) : prev.assignees,
      labels: tab === 'labels' ? prev.labels.filter(item => item.id !== id) : prev.labels,
      priorities: tab === 'priorities' ? prev.priorities.filter(item => item.id !== id) : prev.priorities,
      statuses: tab === 'statuses' ? prev.statuses.filter(item => item.id !== id) : prev.statuses,
    }))
  }

  async function exportBackup() {
    setBackupStatus('exporting')

    try {
      await downloadLocalBackup()
      setBackupStatus('done')
      window.setTimeout(() => setBackupStatus('idle'), 3000)
    } catch (error) {
      console.error(error)
      setBackupStatus('error')
    }
  }

  async function handleToggleTwoFactor(enabled: boolean) {
    setSecurityFeedback('')
    setIsUpdatingTwoFactor(true)

    try {
      const response = await authApi.updateTwoFactor({ enabled })
      setSecurityUser(response.user)
      setSecurityFeedback(enabled
        ? 'La verificacion por correo ya esta activa.'
        : 'La verificacion por correo fue desactivada.')
      refreshUser()
    } catch (error) {
      console.error(error)
      setSecurityFeedback('No se pudo actualizar la seguridad de la cuenta.')
    } finally {
      setIsUpdatingTwoFactor(false)
    }
  }

  const compactList = tab === 'labels' || tab === 'priorities' || tab === 'statuses'
  const activeUser = securityUser ?? user
  const twoFactorEnabled = Boolean(activeUser?.twoFactorEnabled)
  const navGroups: SettingsNavGroup[] = [
    {
      title: 'Cuenta',
      items: [{ label: 'Seguridad', to: '/ajustes/seguridad' }],
    },
    {
      title: 'Administracion',
      items: [
        { label: 'Usuarios', to: '/ajustes/usuarios' },
        { label: 'Roles y permisos', to: '/ajustes/roles' },
      ],
    },
    {
      title: 'Tareas',
      items: [
        { label: 'Proyectos', to: '/ajustes/proyectos', count: items.projects.length },
        { label: 'Responsables', to: '/ajustes/responsables', count: items.assignees.length },
        { label: 'Etiquetas', to: '/ajustes/etiquetas', count: items.labels.length },
        { label: 'Prioridades', to: '/ajustes/prioridades', count: items.priorities.length },
        { label: 'Estados', to: '/ajustes/estados', count: items.statuses.length },
      ],
    },
    {
      title: 'Datos',
      items: [{ label: 'Exportar datos', to: '/ajustes/exportar' }],
    },
  ]

  if (!section) return <Navigate to="/ajustes/seguridad" replace />

  return (
    <PageContainer size="wide" align="start">
      <div className="max-w-[1500px]">
        <div className="mb-8">
          <div>
            <h1 className="text-[26px] font-bold tracking-tight text-gray-900">Ajustes</h1>
            <p className="mt-1 text-[13px] text-gray-500">
              Administra la seguridad de tu cuenta, usuarios futuros y las opciones de tus tareas.
            </p>
          </div>
        </div>

        <div className="flex flex-col gap-6 lg:flex-row lg:items-start">
          <SettingsSidebar groups={navGroups} />

          <main className="min-w-0 flex-1">
            <div className="mb-5">
              <h2 className="text-[22px] font-bold tracking-tight text-slate-950">{SECTION_TITLES[section]}</h2>
            </div>

            {section === 'seguridad' && (
              <section className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm">
                <div className="flex flex-col gap-6 xl:flex-row xl:items-start xl:justify-between">
                  <div className="max-w-[620px]">
                    <div className="flex items-center gap-3">
                      <div className={`flex h-12 w-12 items-center justify-center rounded-2xl ${twoFactorEnabled ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600'}`}>
                        {twoFactorEnabled ? <ShieldCheckIcon className="h-6 w-6" /> : <ShieldExclamationIcon className="h-6 w-6" />}
                      </div>
                      <div>
                        <h3 className="text-[20px] font-semibold text-slate-950">Seguridad</h3>
                        <p className="mt-1 text-[13px] text-slate-500">
                          Activa un segundo paso por correo para proteger el acceso a tu cuenta.
                        </p>
                      </div>
                    </div>

                    <div className="mt-6 grid gap-3 sm:grid-cols-2">
                      <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4">
                        <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-400">Correo</p>
                        <p className="mt-2 text-[15px] font-semibold text-slate-900">
                          {activeUser?.email ?? (isUserLoading ? 'Cargando...' : 'No disponible')}
                        </p>
                      </div>

                      <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4">
                        <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-400">Rol</p>
                        <p className="mt-2 text-[15px] font-semibold text-slate-900">
                          {activeUser ? roleLabel(activeUser.role) : (isUserLoading ? 'Cargando...' : 'No disponible')}
                        </p>
                      </div>
                    </div>

                    <div className="mt-5 flex flex-wrap items-center gap-2">
                      <span className={`rounded-full px-3 py-1 text-[12px] font-semibold ${twoFactorEnabled ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>
                        {twoFactorEnabled ? '2FA por correo activo' : '2FA desactivado'}
                      </span>
                      {activeUser?.twoFactorMethod && (
                        <span className="rounded-full bg-slate-100 px-3 py-1 text-[12px] font-medium text-slate-500">
                          Metodo: {activeUser.twoFactorMethod}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="w-full max-w-[340px] rounded-[24px] border border-slate-200 bg-[#f8fafc] p-5">
                    <p className="text-[14px] font-semibold text-slate-900">Verificacion en dos pasos</p>
                    <p className="mt-2 text-[13px] leading-6 text-slate-500">
                      Cuando este activa, primero validaras tu correo y contrasena. Luego recibiras un codigo temporal por email antes de obtener el JWT.
                    </p>

                    <button
                      type="button"
                      onClick={() => handleToggleTwoFactor(!twoFactorEnabled)}
                      disabled={isUpdatingTwoFactor || !activeUser}
                      className={`mt-5 h-11 w-full rounded-[14px] px-4 text-[14px] font-semibold text-white transition ${
                        twoFactorEnabled
                          ? 'bg-slate-700 hover:bg-slate-800'
                          : 'bg-teal-600 hover:bg-teal-700'
                      } disabled:cursor-not-allowed disabled:opacity-60`}
                    >
                      {isUpdatingTwoFactor
                        ? 'Guardando...'
                        : twoFactorEnabled
                          ? 'Desactivar 2FA'
                          : 'Activar 2FA por correo'}
                    </button>

                    <p className="mt-3 text-[12px] text-slate-500">
                      Usa la cuenta SMTP configurada en el backend para entregar los codigos.
                    </p>

                    {securityFeedback && (
                      <p className={`mt-4 rounded-xl px-3 py-2 text-[12px] font-medium ${
                        securityFeedback.includes('No se pudo')
                          ? 'bg-red-50 text-red-600'
                          : 'bg-emerald-50 text-emerald-700'
                      }`}
                      >
                        {securityFeedback}
                      </p>
                    )}
                  </div>
                </div>
              </section>
            )}

            {section === 'usuarios' && (
              <section className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm">
                <p className="max-w-[620px] text-[14px] leading-6 text-slate-500">
                  Aqui podras crear y administrar los usuarios que tendran acceso a tu aplicacion.
                </p>
                <div className="mt-6 grid gap-3 rounded-2xl border border-slate-200 bg-slate-50 p-4 md:grid-cols-[1fr_1fr_160px_auto]">
                  <input disabled value="Nombre" className="h-10 rounded-lg border border-slate-200 bg-white px-3 text-[13px] text-slate-400" />
                  <input disabled value="correo@empresa.com" className="h-10 rounded-lg border border-slate-200 bg-white px-3 text-[13px] text-slate-400" />
                  <input disabled value="Rol" className="h-10 rounded-lg border border-slate-200 bg-white px-3 text-[13px] text-slate-400" />
                  <button disabled type="button" className="h-10 rounded-lg bg-slate-300 px-4 text-[13px] font-semibold text-white">
                    Crear usuario
                  </button>
                </div>
              </section>
            )}

            {section === 'roles' && (
              <section className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm">
                <p className="max-w-[620px] text-[14px] leading-6 text-slate-500">
                  Aqui podras definir permisos por rol en una proxima fase.
                </p>
                <div className="mt-6 grid gap-3 sm:grid-cols-2">
                  {['Administrador', 'Cliente'].map(role => (
                    <div key={role} className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                      <p className="text-[14px] font-semibold text-slate-900">{role}</p>
                      <p className="mt-1 text-[12px] text-slate-500">Permisos configurables proximamente.</p>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {section === 'exportar' && (
              <section className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm">
                <p className="max-w-[620px] text-[14px] leading-6 text-slate-500">
                  Descarga una copia local de tus workspaces, espacios, paginas, tareas, ajustes y datos de pizarra disponibles en el navegador.
                </p>
                <button
                  type="button"
                  onClick={exportBackup}
                  disabled={backupStatus === 'exporting'}
                  className="mt-6 inline-flex h-10 items-center gap-2 rounded-lg border border-gray-200 bg-white px-4 text-[13px] font-semibold text-gray-700 shadow-sm transition-colors hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  <ArrowDownTrayIcon className="h-4 w-4" />
                  {backupStatus === 'exporting' ? 'Exportando...' : 'Exportar mis datos'}
                </button>
                {backupStatus === 'done' && (
                  <span className="ml-3 text-[12px] font-medium text-emerald-600">Backup descargado.</span>
                )}
                {backupStatus === 'error' && (
                  <span className="ml-3 text-[12px] font-medium text-red-600">No se pudo exportar.</span>
                )}
              </section>
            )}

            {tab && (
              <section>
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

                <div className={compactList ? 'flex flex-wrap items-center gap-2' : 'grid gap-3 sm:grid-cols-2 xl:grid-cols-3'}>
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
              </section>
            )}
          </main>
        </div>
      </div>
    </PageContainer>
  )
}
