import {
  BellIcon,
  AcademicCapIcon,
  BookOpenIcon,
  BriefcaseIcon,
  CalendarDaysIcon,
  ChartBarIcon,
  ChevronDownIcon,
  ChevronRightIcon,
  ClipboardDocumentListIcon,
  CircleStackIcon,
  Cog6ToothIcon,
  CodeBracketIcon,
  CpuChipIcon,
  DocumentTextIcon,
  FireIcon,
  FlagIcon,
  FolderIcon,
  HeartIcon,
  HomeIcon,
  LightBulbIcon,
  MapIcon,
  MagnifyingGlassIcon,
  PaintBrushIcon,
  PencilSquareIcon,
  PlusIcon,
  RocketLaunchIcon,
  SparklesIcon,
  StarIcon,
  TrashIcon,
  UserGroupIcon,
} from '@heroicons/react/24/outline'
import { useEffect, useState } from 'react'
import { NavLink, useLocation, useNavigate } from 'react-router-dom'

import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import {
  createWorkspaceSpace,
  createWorkspacePage,
  deleteWorkspacePage,
  deleteWorkspaceSpace,
  loadActiveWorkspaceId,
  loadWorkspacePages,
  loadWorkspaceSpaces,
  loadWorkspaces,
  updateWorkspacePage,
  updateWorkspaceSpace,
  WORKSPACE_DATA_CHANGE_EVENT,
} from '@/data/workspaces'
import type { Workspace, WorkspacePage, WorkspacePageType, WorkspaceSpace } from '@/types/workspace'

const NAVIGATION = [
  { label: 'Inicio', icon: HomeIcon, to: '/' },
  { label: 'Mis tareas', icon: ClipboardDocumentListIcon, to: '/tareas' },
  { label: 'Calendario', icon: CalendarDaysIcon, to: '/calendario' },
  { label: 'Ajustes', icon: Cog6ToothIcon, to: '/ajustes' },
]

const SPACE_ICON_OPTIONS = [
  { id: 'folder', label: 'Carpeta', icon: FolderIcon },
  { id: 'book', label: 'Libro', icon: BookOpenIcon },
  { id: 'study', label: 'Estudios', icon: AcademicCapIcon },
  { id: 'code', label: 'Codigo', icon: CodeBracketIcon },
  { id: 'work', label: 'Trabajo', icon: BriefcaseIcon },
  { id: 'tasks', label: 'Tareas', icon: ClipboardDocumentListIcon },
  { id: 'calendar', label: 'Calendario', icon: CalendarDaysIcon },
  { id: 'doc', label: 'Documento', icon: DocumentTextIcon },
  { id: 'chart', label: 'Metricas', icon: ChartBarIcon },
  { id: 'idea', label: 'Ideas', icon: LightBulbIcon },
  { id: 'cpu', label: 'Tecnologia', icon: CpuChipIcon },
  { id: 'design', label: 'Diseno', icon: PaintBrushIcon },
  { id: 'team', label: 'Equipo', icon: UserGroupIcon },
  { id: 'map', label: 'Mapa', icon: MapIcon },
  { id: 'flag', label: 'Meta', icon: FlagIcon },
  { id: 'star', label: 'Favorito', icon: StarIcon },
  { id: 'heart', label: 'Personal', icon: HeartIcon },
  { id: 'rocket', label: 'Lanzamiento', icon: RocketLaunchIcon },
  { id: 'fire', label: 'Urgente', icon: FireIcon },
  { id: 'sparkles', label: 'Creativo', icon: SparklesIcon },
]

const SPACE_ICON_COLORS = [
  '#6472EB',
  '#0EA5E9',
  '#14B8A6',
  '#22C55E',
  '#F59E0B',
  '#EF4444',
  '#EC4899',
  '#8B5CF6',
  '#64748B',
]

function getSpaceIconOption(icon?: string) {
  return SPACE_ICON_OPTIONS.find(option => option.id === icon) ?? SPACE_ICON_OPTIONS[0]
}

function getPageIcon(page: WorkspacePage) {
  if (page.type === 'board') return PaintBrushIcon
  if (page.type === 'database') return CircleStackIcon
  return DocumentTextIcon
}

interface SidebarProps {
  collapsed: boolean
}

export default function Sidebar({ collapsed }: SidebarProps) {
  const navigate = useNavigate()
  const { pathname } = useLocation()
  const [workspaces, setWorkspaces] = useState<Workspace[]>(() => loadWorkspaces())
  const [spaces, setSpaces] = useState<WorkspaceSpace[]>(() => loadWorkspaceSpaces())
  const [pages, setPages] = useState<WorkspacePage[]>(() => loadWorkspacePages())
  const [activeWorkspaceId, setActiveWorkspaceId] = useState(() => loadActiveWorkspaceId())
  const [isCreateSpaceOpen, setIsCreateSpaceOpen] = useState(false)
  const [creatingSpaceParentId, setCreatingSpaceParentId] = useState<string | null>(null)
  const [editingSpace, setEditingSpace] = useState<WorkspaceSpace | null>(null)
  const [deletingSpace, setDeletingSpace] = useState<WorkspaceSpace | null>(null)
  const [newSpaceName, setNewSpaceName] = useState('')
  const [newSpaceIcon, setNewSpaceIcon] = useState('folder')
  const [newSpaceIconColor, setNewSpaceIconColor] = useState('#6472EB')
  const [spaceDraftName, setSpaceDraftName] = useState('')
  const [spaceDraftIcon, setSpaceDraftIcon] = useState('')
  const [spaceDraftIconColor, setSpaceDraftIconColor] = useState('#6472EB')
  const [spaceMenu, setSpaceMenu] = useState<{
    space: WorkspaceSpace
    x: number
    y: number
  } | null>(null)
  const [subspaceMenu, setSubspaceMenu] = useState<{
    space: WorkspaceSpace
    x: number
    y: number
  } | null>(null)
  const [pageMenu, setPageMenu] = useState<{
    page: WorkspacePage
    x: number
    y: number
  } | null>(null)
  const [editingPage, setEditingPage] = useState<WorkspacePage | null>(null)
  const [pageDraftTitle, setPageDraftTitle] = useState('')

  useEffect(() => {
    const syncWorkspaceData = () => {
      setWorkspaces(loadWorkspaces())
      setSpaces(loadWorkspaceSpaces())
      setPages(loadWorkspacePages())
      setActiveWorkspaceId(loadActiveWorkspaceId())
    }

    window.addEventListener(WORKSPACE_DATA_CHANGE_EVENT, syncWorkspaceData)
    return () => window.removeEventListener(WORKSPACE_DATA_CHANGE_EVENT, syncWorkspaceData)
  }, [])

  useEffect(() => {
    if (!spaceMenu && !subspaceMenu && !pageMenu) return

    const closeMenu = () => {
      setSpaceMenu(null)
      setSubspaceMenu(null)
      setPageMenu(null)
    }
    const closeWithEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') closeMenu()
    }

    window.addEventListener('click', closeMenu)
    window.addEventListener('keydown', closeWithEscape)

    return () => {
      window.removeEventListener('click', closeMenu)
      window.removeEventListener('keydown', closeWithEscape)
    }
  }, [spaceMenu, subspaceMenu, pageMenu])

  const activeWorkspace = workspaces.find(workspace => workspace.id === activeWorkspaceId) ?? workspaces[0]
  const activePages = pages.filter(page => page.workspaceId === activeWorkspace?.id)
  const activeSpaces = spaces.filter(space => space.workspaceId === activeWorkspace?.id)
  const rootSpaces = activeSpaces.filter(space => !space.parentId)
  const generalSpaceId = rootSpaces.find(space => space.name === 'General')?.id
  const generalPages = generalSpaceId ? activePages.filter(page => page.spaceId === generalSpaceId) : []

  function handleCreatePage(type: WorkspacePageType, spaceId?: string) {
    if (!activeWorkspace) return
    const page = createWorkspacePage(activeWorkspace.id, type, spaceId)
    setPages(loadWorkspacePages())
    navigate(`/p/${page.id}`)
  }

  function handleCreateSpace() {
    if (!activeWorkspace) return
    if (!newSpaceName.trim()) return

    const space = createWorkspaceSpace(
      activeWorkspace.id,
      newSpaceName.trim(),
      newSpaceIcon,
      creatingSpaceParentId ?? undefined,
      newSpaceIconColor,
    )
    setSpaces(loadWorkspaceSpaces())
    setNewSpaceName('')
    setNewSpaceIcon('folder')
    setNewSpaceIconColor('#6472EB')
    setCreatingSpaceParentId(null)
    setIsCreateSpaceOpen(false)
    handleCreatePage('text', space.id)
  }

  function handleDeletePage(pageId: string) {
    const deletedPage = pages.find(page => page.id === pageId)
    const deletedPageSpace = deletedPage
      ? spaces.find(space => space.id === deletedPage.spaceId)
      : null
    const fallbackPath = deletedPageSpace
      ? deletedPageSpace.parentId
        ? `/s/${deletedPageSpace.id}`
        : `/e/${deletedPageSpace.id}`
      : '/'

    deleteWorkspacePage(pageId)
    setPages(loadWorkspacePages())
    if (pathname === `/p/${pageId}`) navigate(fallbackPath)
  }

  function handleDeleteSpace(spaceId: string) {
    const childSpaceIds = spaces.filter(space => space.parentId === spaceId).map(space => space.id)
    const deletedSpaceIds = new Set([spaceId, ...childSpaceIds])
    const spacePages = pages.filter(page => deletedSpaceIds.has(page.spaceId))

    deleteWorkspaceSpace(spaceId)
    setSpaces(loadWorkspaceSpaces())
    setPages(loadWorkspacePages())
    if (spacePages.some(page => pathname === `/p/${page.id}`)) navigate('/')
  }

  function handleToggleSpace(space: WorkspaceSpace) {
    updateWorkspaceSpace(space.id, { collapsed: !space.collapsed })
    setSpaces(loadWorkspaceSpaces())
  }

  function openCreateSpace(parentId: string | null = null) {
    setCreatingSpaceParentId(parentId)
    setNewSpaceName('')
    setNewSpaceIcon('folder')
    setNewSpaceIconColor('#6472EB')
    setIsCreateSpaceOpen(true)
  }

  function openEditSpace(space: WorkspaceSpace) {
    setEditingSpace(space)
    setSpaceDraftName(space.name)
    setSpaceDraftIcon(space.icon ?? '')
    setSpaceDraftIconColor(space.iconColor ?? '#6472EB')
  }

  function openEditPage(page: WorkspacePage) {
    setEditingPage(page)
    setPageDraftTitle(page.title)
  }

  function savePageEdit() {
    if (!editingPage) return
    if (!pageDraftTitle.trim()) {
      setEditingPage(null)
      return
    }

    updateWorkspacePage(editingPage.id, { title: pageDraftTitle.trim() })
    setPages(loadWorkspacePages())
    setEditingPage(null)
  }

  function saveSpaceEdit() {
    if (!editingSpace || !spaceDraftName.trim()) return

    updateWorkspaceSpace(editingSpace.id, {
      name: spaceDraftName.trim(),
      icon: spaceDraftIcon.trim() || 'folder',
      iconColor: spaceDraftIconColor,
    })
    setSpaces(loadWorkspaceSpaces())
    setEditingSpace(null)
  }

  return (
    <aside
      className="flex shrink-0 flex-col overflow-hidden border-r transition-all duration-300 [&_a]:cursor-pointer [&_button]:cursor-pointer"
      style={{
        width: collapsed ? 0 : 240,
        opacity: collapsed ? 0 : 1,
        background: 'var(--color-bg-sidebar)',
        borderColor: 'var(--color-border)',
      }}
    >
      <div
        className="flex items-center gap-2.5 px-4 py-3.5"
        style={{ borderBottom: '1px solid var(--color-border)' }}
      >
        <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-[#6472EB] text-[10px] font-bold text-white">
          GT
        </div>
        <span className="truncate text-[13px] font-semibold" style={{ color: 'var(--color-text-primary)' }}>
          Gestion de Tareas
        </span>
      </div>

      <div className="space-y-0.5 px-3 pt-3">
        {[
          { icon: MagnifyingGlassIcon, label: 'Buscar' },
          { icon: BellIcon, label: 'Notificaciones' },
        ].map(({ icon: Icon, label }) => (
          <button
            key={label}
            className="flex w-full items-center gap-2.5 rounded-md px-3 py-1.5 text-[13px] transition-colors hover:bg-gray-100"
            style={{ color: 'var(--color-text-secondary)' }}
          >
            <Icon className="h-4 w-4 shrink-0" />
            {label}
          </button>
        ))}
      </div>

      <nav className="flex-1 overflow-y-auto px-3 pt-4">
        <p
          className="px-3 pb-1.5 text-[11px] font-semibold uppercase tracking-widest"
          style={{ color: 'var(--color-text-muted)' }}
        >
          Paginas
        </p>

        {NAVIGATION.map(({ label, icon: Icon, to }) => (
          <NavLink
            key={to}
            to={to}
            end={to === '/'}
            className={({ isActive }) => {
              return `mb-0.5 flex w-full items-center gap-2.5 rounded-md px-3 py-1.5 text-[13px] transition-colors ${
                isActive ? 'nav-active' : 'hover:bg-gray-100'
              }`
            }}
            style={({ isActive }) => {
              return {
                color: isActive ? 'var(--color-accent)' : 'var(--color-text-secondary)',
              }
            }}
          >
            <Icon className="h-4 w-4 shrink-0" />
            {label}
          </NavLink>
        ))}

        <div className="mt-5">
          <div className="mb-1 flex items-center justify-between px-3">
            <p
              className="text-[11px] font-semibold uppercase tracking-widest"
              style={{ color: 'var(--color-text-muted)' }}
            >
              Espacios
            </p>
            <button
              type="button"
              onClick={() => openCreateSpace()}
              className="rounded p-0.5 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-700"
              title="Nuevo espacio"
            >
              <PlusIcon className="h-3.5 w-3.5" />
            </button>
          </div>

          {rootSpaces.map(space => {
            const spacePages = activePages.filter(page => page.spaceId === space.id && page.spaceId !== generalSpaceId)
            const subspaces = activeSpaces.filter(child => child.parentId === space.id)
            const SpaceIcon = getSpaceIconOption(space.icon).icon

            return (
              <div key={space.id} className="mb-2">
                <div className="group/space relative flex items-center">
                  <button
                    type="button"
                    onClick={() => handleToggleSpace(space)}
                    onContextMenu={event => {
                      event.preventDefault()
                      setSpaceMenu({
                        space,
                        x: event.clientX,
                        y: event.clientY,
                      })
                    }}
                    className="flex min-w-0 flex-1 items-center gap-1.5 rounded-md px-3 py-1.5 text-left text-[13px] font-medium text-gray-600 transition-colors hover:bg-gray-100 hover:text-gray-800"
                  >
                    <span className="relative h-3.5 w-3.5 shrink-0">
                      <SpaceIcon
                        className="absolute inset-0 h-3.5 w-3.5 transition-opacity group-hover/space:opacity-0"
                        style={{ color: space.iconColor ?? '#6472EB' }}
                      />
                      {space.collapsed ? (
                        <ChevronRightIcon className="absolute inset-0 h-3.5 w-3.5 text-gray-400 opacity-0 transition-opacity group-hover/space:opacity-100" />
                      ) : (
                        <ChevronDownIcon className="absolute inset-0 h-3.5 w-3.5 text-gray-400 opacity-0 transition-opacity group-hover/space:opacity-100" />
                      )}
                    </span>
                    <span className="truncate">{space.name}</span>
                  </button>

                </div>

                {!space.collapsed && (
                  <div className="mt-0.5 pl-4">
                    {subspaces.map(subspace => {
                      const subspacePages = activePages.filter(page => page.spaceId === subspace.id)
                      const SubspaceIcon = getSpaceIconOption(subspace.icon).icon

                      return (
                        <div key={subspace.id} className="mb-1">
                          <div className="group/subspace relative flex items-center">
                            <NavLink
                              to={`/s/${subspace.id}`}
                              onContextMenu={event => {
                                event.preventDefault()
                                setSubspaceMenu({
                                  space: subspace,
                                  x: event.clientX,
                                  y: event.clientY,
                                })
                              }}
                              className={({ isActive }) => {
                                return `flex min-w-0 flex-1 items-center gap-1.5 rounded-md px-2 py-1.5 text-left text-[13px] transition-colors ${
                                  isActive ? 'nav-active' : 'hover:bg-gray-100'
                                }`
                              }}
                              style={({ isActive }) => {
                                return {
                                  color: isActive ? 'var(--color-accent)' : 'var(--color-text-secondary)',
                                }
                              }}
                            >
                              <span
                                className="relative h-3.5 w-3.5 shrink-0"
                                onClick={event => {
                                  event.preventDefault()
                                  event.stopPropagation()
                                  handleToggleSpace(subspace)
                                }}
                                title={subspace.collapsed ? 'Expandir subespacio' : 'Colapsar subespacio'}
                              >
                                <SubspaceIcon
                                  className="absolute inset-0 h-3.5 w-3.5 transition-opacity group-hover/subspace:opacity-0"
                                  style={{ color: subspace.iconColor ?? '#6472EB' }}
                                />
                                {subspace.collapsed ? (
                                  <ChevronRightIcon className="absolute inset-0 h-3.5 w-3.5 text-gray-400 opacity-0 transition-opacity group-hover/subspace:opacity-100" />
                                ) : (
                                  <ChevronDownIcon className="absolute inset-0 h-3.5 w-3.5 text-gray-400 opacity-0 transition-opacity group-hover/subspace:opacity-100" />
                                )}
                              </span>
                              <span className="truncate">{subspace.name}</span>
                            </NavLink>
                          </div>

                          {!subspace.collapsed && (
                            <div className="mt-0.5 pl-4">
                              {subspacePages.map(page => {
                                const PageIcon = getPageIcon(page)

                                return (
                                  <div key={page.id} className="group/page relative mb-0.5 flex items-center">
                                  <NavLink
                                    to={`/p/${page.id}`}
                                    onContextMenu={event => {
                                      event.preventDefault()
                                      setPageMenu({
                                        page,
                                        x: event.clientX,
                                        y: event.clientY,
                                      })
                                    }}
                                    className={({ isActive }) => {
                                      return `flex min-w-0 flex-1 items-center gap-2 rounded-md px-3 py-1.5 pr-8 text-[13px] transition-colors ${
                                        isActive ? 'nav-active' : 'hover:bg-gray-100'
                                      }`
                                    }}
                                    style={({ isActive }) => {
                                      return {
                                        color: isActive ? 'var(--color-accent)' : 'var(--color-text-secondary)',
                                      }
                                    }}
                                  >
                                    <PageIcon className="h-4 w-4 shrink-0" />
                                    {editingPage?.id === page.id ? (
                                      <input
                                        autoFocus
                                        value={pageDraftTitle}
                                        onClick={event => event.preventDefault()}
                                        onFocus={event => event.currentTarget.select()}
                                        onChange={event => setPageDraftTitle(event.target.value)}
                                        onBlur={savePageEdit}
                                        onKeyDown={event => {
                                          if (event.key === 'Enter') {
                                            event.preventDefault()
                                            savePageEdit()
                                          }
                                          if (event.key === 'Escape') {
                                            event.preventDefault()
                                            setEditingPage(null)
                                          }
                                        }}
                                        className="cursor-text-dark min-w-0 flex-1 rounded border border-gray-200 bg-white px-1.5 py-0.5 text-[13px] text-gray-800 caret-gray-900 outline-none"
                                      />
                                    ) : (
                                      <span className="truncate">{page.title}</span>
                                    )}
                                  </NavLink>

                                </div>
                                )
                              })}

                            </div>
                          )}
                        </div>
                      )
                    })}

                    {spacePages.map(page => {
                      const PageIcon = getPageIcon(page)

                      return (
                        <div key={page.id} className="group/page relative mb-0.5 flex items-center">
                        <NavLink
                          to={`/p/${page.id}`}
                          onContextMenu={event => {
                            event.preventDefault()
                            setPageMenu({
                              page,
                              x: event.clientX,
                              y: event.clientY,
                            })
                          }}
                          className={({ isActive }) => {
                            return `flex min-w-0 flex-1 items-center gap-2 rounded-md px-3 py-1.5 pr-8 text-[13px] transition-colors ${
                              isActive ? 'nav-active' : 'hover:bg-gray-100'
                            }`
                          }}
                          style={({ isActive }) => {
                            return {
                              color: isActive ? 'var(--color-accent)' : 'var(--color-text-secondary)',
                            }
                          }}
                        >
                          <PageIcon className="h-4 w-4 shrink-0" />
                          {editingPage?.id === page.id ? (
                            <input
                              autoFocus
                              value={pageDraftTitle}
                              onClick={event => event.preventDefault()}
                              onFocus={event => event.currentTarget.select()}
                              onChange={event => setPageDraftTitle(event.target.value)}
                              onBlur={savePageEdit}
                              onKeyDown={event => {
                                if (event.key === 'Enter') {
                                  event.preventDefault()
                                  savePageEdit()
                                }
                                if (event.key === 'Escape') {
                                  event.preventDefault()
                                  setEditingPage(null)
                                }
                              }}
                              className="cursor-text-dark min-w-0 flex-1 rounded border border-gray-200 bg-white px-1.5 py-0.5 text-[13px] text-gray-800 caret-gray-900 outline-none"
                            />
                          ) : (
                            <span className="truncate">{page.title}</span>
                          )}
                        </NavLink>

                      </div>
                      )
                    })}
                  </div>
                )}
              </div>
            )
          })}

          <div className="mt-5">
            <p
              className="px-3 pb-1.5 text-[11px] font-semibold uppercase tracking-widest"
              style={{ color: 'var(--color-text-muted)' }}
            >
              Hojas
            </p>
            {generalPages.map(page => {
              const PageIcon = getPageIcon(page)

              return (
                <div key={page.id} className="group/page relative mb-0.5 flex items-center">
                <NavLink
                  to={`/p/${page.id}`}
                  onContextMenu={event => {
                    event.preventDefault()
                    setPageMenu({
                      page,
                      x: event.clientX,
                      y: event.clientY,
                    })
                  }}
                  className={({ isActive }) => {
                    return `flex min-w-0 flex-1 items-center gap-2 rounded-md px-3 py-1.5 pr-8 text-[13px] transition-colors ${
                      isActive ? 'nav-active' : 'hover:bg-gray-100'
                    }`
                  }}
                  style={({ isActive }) => {
                    return {
                      color: isActive ? 'var(--color-accent)' : 'var(--color-text-secondary)',
                    }
                  }}
                >
                  <PageIcon className="h-4 w-4 shrink-0" />
                  {editingPage?.id === page.id ? (
                    <input
                      autoFocus
                      value={pageDraftTitle}
                      onClick={event => event.preventDefault()}
                      onFocus={event => event.currentTarget.select()}
                      onChange={event => setPageDraftTitle(event.target.value)}
                      onBlur={savePageEdit}
                      onKeyDown={event => {
                        if (event.key === 'Enter') {
                          event.preventDefault()
                          savePageEdit()
                        }
                        if (event.key === 'Escape') {
                          event.preventDefault()
                          setEditingPage(null)
                        }
                      }}
                      className="cursor-text-dark min-w-0 flex-1 rounded border border-gray-200 bg-white px-1.5 py-0.5 text-[13px] text-gray-800 caret-gray-900 outline-none"
                    />
                  ) : (
                    <span className="truncate">{page.title}</span>
                  )}
                </NavLink>

              </div>
              )
            })}
            <Popover>
              <PopoverTrigger className="flex w-full items-center gap-2.5 rounded-md px-3 py-1.5 text-[13px] text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-700">
                <PlusIcon className="h-4 w-4" />
                Nueva hoja
              </PopoverTrigger>
              <PopoverContent className="w-36 gap-1 p-1.5" align="start" sideOffset={4}>
                <button
                  type="button"
                  onClick={() => handleCreatePage('text')}
                  className="flex h-8 w-full items-center gap-2 rounded-md px-2 text-left text-[13px] text-gray-600 transition-colors hover:bg-gray-100 hover:text-gray-900"
                >
                  <DocumentTextIcon className="h-4 w-4" />
                  Texto
                </button>
                <button
                  type="button"
                  onClick={() => handleCreatePage('board')}
                  className="flex h-8 w-full items-center gap-2 rounded-md px-2 text-left text-[13px] text-gray-600 transition-colors hover:bg-gray-100 hover:text-gray-900"
                >
                  <PaintBrushIcon className="h-4 w-4" />
                  Pizarra
                </button>
                <button
                  type="button"
                  onClick={() => handleCreatePage('database')}
                  className="flex h-8 w-full items-center gap-2 rounded-md px-2 text-left text-[13px] text-gray-600 transition-colors hover:bg-gray-100 hover:text-gray-900"
                >
                  <CircleStackIcon className="h-4 w-4" />
                  Diagrama BD
                </button>
              </PopoverContent>
            </Popover>
          </div>
        </div>
      </nav>

      {spaceMenu && (
        <div
          className="fixed z-[95] w-44 rounded-lg border border-gray-200 bg-white p-1.5 shadow-xl"
          style={{
            left: Math.min(spaceMenu.x, window.innerWidth - 188),
            top: Math.min(spaceMenu.y, window.innerHeight - 202),
          }}
          onClick={event => event.stopPropagation()}
          onContextMenu={event => event.preventDefault()}
        >
          <button
            type="button"
            onClick={() => {
              openCreateSpace(spaceMenu.space.id)
              setSpaceMenu(null)
            }}
            className="flex h-8 w-full items-center gap-2 rounded-md px-2 text-left text-[13px] text-gray-600 transition-colors hover:bg-gray-100 hover:text-gray-900"
          >
            <FolderIcon className="h-4 w-4" />
            Agregar subespacio
          </button>
          <button
            type="button"
            onClick={() => {
              handleCreatePage('text', spaceMenu.space.id)
              setSpaceMenu(null)
            }}
            className="flex h-8 w-full items-center gap-2 rounded-md px-2 text-left text-[13px] text-gray-600 transition-colors hover:bg-gray-100 hover:text-gray-900"
          >
            <DocumentTextIcon className="h-4 w-4" />
            Agregar texto
          </button>
          <button
            type="button"
            onClick={() => {
              handleCreatePage('board', spaceMenu.space.id)
              setSpaceMenu(null)
            }}
            className="flex h-8 w-full items-center gap-2 rounded-md px-2 text-left text-[13px] text-gray-600 transition-colors hover:bg-gray-100 hover:text-gray-900"
          >
            <PaintBrushIcon className="h-4 w-4" />
            Agregar pizarra
          </button>
          <button
            type="button"
            onClick={() => {
              handleCreatePage('database', spaceMenu.space.id)
              setSpaceMenu(null)
            }}
            className="flex h-8 w-full items-center gap-2 rounded-md px-2 text-left text-[13px] text-gray-600 transition-colors hover:bg-gray-100 hover:text-gray-900"
          >
            <CircleStackIcon className="h-4 w-4" />
            Agregar diagrama BD
          </button>
          <div className="my-1 h-px bg-gray-100" />
          <button
            type="button"
            onClick={() => {
              openEditSpace(spaceMenu.space)
              setSpaceMenu(null)
            }}
            className="flex h-8 w-full items-center gap-2 rounded-md px-2 text-left text-[13px] text-gray-600 transition-colors hover:bg-gray-100 hover:text-gray-900"
          >
            <PencilSquareIcon className="h-4 w-4" />
            Editar
          </button>
          <button
            type="button"
            onClick={() => {
              setDeletingSpace(spaceMenu.space)
              setSpaceMenu(null)
            }}
            className="flex h-8 w-full items-center gap-2 rounded-md px-2 text-left text-[13px] text-red-600 transition-colors hover:bg-red-50"
          >
            <TrashIcon className="h-4 w-4" />
            Borrar
          </button>
        </div>
      )}

      {subspaceMenu && (
        <div
          className="fixed z-[95] w-44 rounded-lg border border-gray-200 bg-white p-1.5 shadow-xl"
          style={{
            left: Math.min(subspaceMenu.x, window.innerWidth - 188),
            top: Math.min(subspaceMenu.y, window.innerHeight - 170),
          }}
          onClick={event => event.stopPropagation()}
          onContextMenu={event => event.preventDefault()}
        >
          <button
            type="button"
            onClick={() => {
              handleCreatePage('text', subspaceMenu.space.id)
              setSubspaceMenu(null)
            }}
            className="flex h-8 w-full items-center gap-2 rounded-md px-2 text-left text-[13px] text-gray-600 transition-colors hover:bg-gray-100 hover:text-gray-900"
          >
            <DocumentTextIcon className="h-4 w-4" />
            Agregar texto
          </button>
          <button
            type="button"
            onClick={() => {
              handleCreatePage('board', subspaceMenu.space.id)
              setSubspaceMenu(null)
            }}
            className="flex h-8 w-full items-center gap-2 rounded-md px-2 text-left text-[13px] text-gray-600 transition-colors hover:bg-gray-100 hover:text-gray-900"
          >
            <PaintBrushIcon className="h-4 w-4" />
            Agregar pizarra
          </button>
          <button
            type="button"
            onClick={() => {
              handleCreatePage('database', subspaceMenu.space.id)
              setSubspaceMenu(null)
            }}
            className="flex h-8 w-full items-center gap-2 rounded-md px-2 text-left text-[13px] text-gray-600 transition-colors hover:bg-gray-100 hover:text-gray-900"
          >
            <CircleStackIcon className="h-4 w-4" />
            Agregar diagrama BD
          </button>
          <div className="my-1 h-px bg-gray-100" />
          <button
            type="button"
            onClick={() => {
              openEditSpace(subspaceMenu.space)
              setSubspaceMenu(null)
            }}
            className="flex h-8 w-full items-center gap-2 rounded-md px-2 text-left text-[13px] text-gray-600 transition-colors hover:bg-gray-100 hover:text-gray-900"
          >
            <PencilSquareIcon className="h-4 w-4" />
            Editar
          </button>
          <button
            type="button"
            onClick={() => {
              setDeletingSpace(subspaceMenu.space)
              setSubspaceMenu(null)
            }}
            className="flex h-8 w-full items-center gap-2 rounded-md px-2 text-left text-[13px] text-red-600 transition-colors hover:bg-red-50"
          >
            <TrashIcon className="h-4 w-4" />
            Borrar
          </button>
        </div>
      )}

      {pageMenu && (
        <div
          className="fixed z-[95] w-40 rounded-lg border border-gray-200 bg-white p-1.5 shadow-xl"
          style={{
            left: Math.min(pageMenu.x, window.innerWidth - 172),
            top: Math.min(pageMenu.y, window.innerHeight - 88),
          }}
          onClick={event => event.stopPropagation()}
          onContextMenu={event => event.preventDefault()}
        >
          <button
            type="button"
            onClick={() => {
              openEditPage(pageMenu.page)
              setPageMenu(null)
            }}
            className="flex h-8 w-full items-center gap-2 rounded-md px-2 text-left text-[13px] text-gray-600 transition-colors hover:bg-gray-100 hover:text-gray-900"
          >
            <PencilSquareIcon className="h-4 w-4" />
            Editar nombre
          </button>
          <button
            type="button"
            onClick={() => {
              handleDeletePage(pageMenu.page.id)
              setPageMenu(null)
            }}
            className="flex h-8 w-full items-center gap-2 rounded-md px-2 text-left text-[13px] text-red-600 transition-colors hover:bg-red-50"
          >
            <TrashIcon className="h-4 w-4" />
            Borrar
          </button>
        </div>
      )}

      {isCreateSpaceOpen && (
        <div className="fixed inset-0 z-[80] flex items-center justify-center bg-black/20 px-4">
          <div className="w-full max-w-[340px] rounded-xl border border-gray-200 bg-white p-4 shadow-xl">
            <h3 className="text-[14px] font-semibold text-gray-900">
              {creatingSpaceParentId ? 'Nuevo subespacio' : 'Nuevo espacio'}
            </h3>
            <div className="mt-4">
              <label className="mb-1.5 block text-[11px] font-semibold uppercase tracking-wide text-gray-400">
                {creatingSpaceParentId ? 'Subespacio' : 'Espacio'}
              </label>
              <div className="flex items-center gap-2">
                <Popover>
                  <PopoverTrigger
                    className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-gray-200 transition-colors hover:bg-gray-50"
                    style={{ color: newSpaceIconColor }}
                  >
                    {(() => {
                      const Icon = getSpaceIconOption(newSpaceIcon).icon
                      return <Icon className="h-4 w-4" />
                    })()}
                  </PopoverTrigger>
                  <PopoverContent className="grid w-60 grid-cols-6 gap-1 p-1.5" align="start" sideOffset={6}>
                    {SPACE_ICON_OPTIONS.map(option => {
                      const Icon = option.icon
                      const isSelected = newSpaceIcon === option.id

                      return (
                        <button
                          key={option.id}
                          type="button"
                          onClick={() => setNewSpaceIcon(option.id)}
                          className={`flex h-9 w-9 items-center justify-center rounded-md transition-colors ${
                            isSelected
                              ? 'bg-[#6472EB]/10'
                              : 'text-gray-500 hover:bg-gray-50 hover:text-gray-800'
                          }`}
                          style={{ color: isSelected ? newSpaceIconColor : undefined }}
                          title={option.label}
                        >
                          <Icon className="h-4 w-4" />
                        </button>
                      )
                    })}
                  </PopoverContent>
                </Popover>
                <input
                  autoFocus
                  value={newSpaceName}
                  onChange={event => setNewSpaceName(event.target.value)}
                  onKeyDown={event => {
                    if (event.key === 'Enter') handleCreateSpace()
                    if (event.key === 'Escape') {
                      setIsCreateSpaceOpen(false)
                      setCreatingSpaceParentId(null)
                    }
                  }}
                  placeholder={creatingSpaceParentId ? 'Nombre del subespacio' : 'Nombre del espacio'}
                  className="cursor-text-dark h-9 min-w-0 flex-1 rounded-lg border border-gray-200 px-3 text-[13px] text-gray-800 caret-gray-900 outline-none focus:border-gray-300 focus:ring-2 focus:ring-gray-200/60"
                />
              </div>
              <div className="mt-3 flex flex-wrap gap-1.5">
                {SPACE_ICON_COLORS.map(color => (
                  <button
                    key={color}
                    type="button"
                    onClick={() => setNewSpaceIconColor(color)}
                    className="h-5 w-5 rounded-full border transition-transform hover:scale-105"
                    style={{
                      background: color,
                      borderColor: newSpaceIconColor === color ? '#111827' : 'rgba(17, 24, 39, 0.12)',
                      boxShadow: newSpaceIconColor === color ? '0 0 0 2px rgba(17, 24, 39, 0.08)' : 'none',
                    }}
                    title={color}
                  />
                ))}
              </div>
            </div>
            <div className="mt-5 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => {
                  setIsCreateSpaceOpen(false)
                  setCreatingSpaceParentId(null)
                  setNewSpaceName('')
                  setNewSpaceIcon('folder')
                  setNewSpaceIconColor('#6472EB')
                }}
                className="rounded-md px-3 py-1.5 text-[13px] font-medium text-gray-500 hover:bg-gray-100"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleCreateSpace}
                className="rounded-md bg-[#6472EB] px-3 py-1.5 text-[13px] font-semibold text-white hover:bg-[#5360D8]"
              >
                Crear
              </button>
            </div>
          </div>
        </div>
      )}

      {editingSpace && (
        <div className="fixed inset-0 z-[80] flex items-center justify-center bg-black/20 px-4">
          <div className="w-full max-w-[340px] rounded-xl border border-gray-200 bg-white p-4 shadow-xl">
            <h3 className="text-[14px] font-semibold text-gray-900">Editar espacio</h3>
            <div className="mt-4">
              <label className="mb-1.5 block text-[11px] font-semibold uppercase tracking-wide text-gray-400">
                Espacio
              </label>
              <div className="flex items-center gap-2">
                <Popover>
                  <PopoverTrigger
                    className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-gray-200 transition-colors hover:bg-gray-50"
                    style={{ color: spaceDraftIconColor }}
                  >
                    {(() => {
                      const Icon = getSpaceIconOption(spaceDraftIcon).icon
                      return <Icon className="h-4 w-4" />
                    })()}
                  </PopoverTrigger>
                  <PopoverContent className="grid w-60 grid-cols-6 gap-1 p-1.5" align="start" sideOffset={6}>
                    {SPACE_ICON_OPTIONS.map(option => {
                      const Icon = option.icon
                      const isSelected = spaceDraftIcon === option.id || (!spaceDraftIcon && option.id === 'folder')

                      return (
                        <button
                          key={option.id}
                          type="button"
                          onClick={() => setSpaceDraftIcon(option.id)}
                          className={`flex h-9 w-9 items-center justify-center rounded-md transition-colors ${
                            isSelected
                              ? 'bg-[#6472EB]/10'
                              : 'text-gray-500 hover:bg-gray-50 hover:text-gray-800'
                          }`}
                          style={{ color: isSelected ? spaceDraftIconColor : undefined }}
                          title={option.label}
                        >
                          <Icon className="h-4 w-4" />
                        </button>
                      )
                    })}
                  </PopoverContent>
                </Popover>
                <input
                  autoFocus
                  value={spaceDraftName}
                  onChange={event => setSpaceDraftName(event.target.value)}
                  className="cursor-text-dark h-9 min-w-0 flex-1 rounded-lg border border-gray-200 px-3 text-[13px] text-gray-800 caret-gray-900 outline-none focus:border-gray-300 focus:ring-2 focus:ring-gray-200/60"
                />
              </div>
              <div className="mt-3 flex flex-wrap gap-1.5">
                {SPACE_ICON_COLORS.map(color => (
                  <button
                    key={color}
                    type="button"
                    onClick={() => setSpaceDraftIconColor(color)}
                    className="h-5 w-5 rounded-full border transition-transform hover:scale-105"
                    style={{
                      background: color,
                      borderColor: spaceDraftIconColor === color ? '#111827' : 'rgba(17, 24, 39, 0.12)',
                      boxShadow: spaceDraftIconColor === color ? '0 0 0 2px rgba(17, 24, 39, 0.08)' : 'none',
                    }}
                    title={color}
                  />
                ))}
              </div>
            </div>
            <div className="mt-5 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setEditingSpace(null)}
                className="rounded-md px-3 py-1.5 text-[13px] font-medium text-gray-500 hover:bg-gray-100"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={saveSpaceEdit}
                className="rounded-md bg-[#6472EB] px-3 py-1.5 text-[13px] font-semibold text-white hover:bg-[#5360D8]"
              >
                Guardar
              </button>
            </div>
          </div>
        </div>
      )}

      {deletingSpace && (
        <div className="fixed inset-0 z-[80] flex items-center justify-center bg-black/20 px-4">
          <div className="w-full max-w-[340px] rounded-xl border border-gray-200 bg-white p-4 shadow-xl">
            <h3 className="text-[14px] font-semibold text-gray-900">
              Borrar {deletingSpace.parentId ? 'subespacio' : 'espacio'}
            </h3>
            <p className="mt-2 text-[13px] leading-5 text-gray-500">
              Esto borrara "{deletingSpace.name}", sus subespacios y sus hojas. Esta accion no se puede deshacer.
            </p>
            <div className="mt-5 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setDeletingSpace(null)}
                className="rounded-md px-3 py-1.5 text-[13px] font-medium text-gray-500 hover:bg-gray-100"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={() => {
                  handleDeleteSpace(deletingSpace.id)
                  setDeletingSpace(null)
                }}
                className="rounded-md bg-red-600 px-3 py-1.5 text-[13px] font-semibold text-white hover:bg-red-700"
              >
                Borrar
              </button>
            </div>
          </div>
        </div>
      )}
    </aside>
  )
}
