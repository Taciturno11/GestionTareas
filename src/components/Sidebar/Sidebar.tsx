import {
  BellIcon,
  AcademicCapIcon,
  ArchiveBoxIcon,
  BookOpenIcon,
  BriefcaseIcon,
  CalendarDaysIcon,
  ChartBarIcon,
  ChevronDownIcon,
  ChevronRightIcon,
  ClockIcon,
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
import { useQuery } from '@tanstack/react-query'
import { useEffect, useState } from 'react'
import { NavLink, useLocation, useNavigate } from 'react-router-dom'

import { pagesApi } from '@/api/pages.api'
import { friendsApi, friendsKeys } from '@/api/friends.api'
import { sharedSpacesApi, type SpaceShareRole } from '@/api/shared-spaces.api'
import { spacesApi } from '@/api/spaces.api'
import type { PublicUser } from '@/api/users.api'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import {
  createWorkspaceSpace,
  createWorkspacePage,
  deleteWorkspacePage,
  deleteWorkspaceSpace,
  loadActiveWorkspaceId,
  loadWorkspaceSpaces,
  loadWorkspaces,
  updateWorkspaceSpace,
  WORKSPACE_DATA_CHANGE_EVENT,
} from '@/data/workspaces'
import type {
  Workspace,
  WorkspacePageSummary,
  WorkspacePageType,
  WorkspaceSpace,
} from '@/types/workspace'
import { usePageCache, usePageSummaries } from '@/hooks/usePages'
import { useRefreshSharedSpaces, useSharedSpaces } from '@/hooks/useSharedSpaces'
import type { SharedSpace } from '@/types/workspace'

const NAVIGATION = [
  { label: 'Inicio', icon: HomeIcon, to: '/' },
  { label: 'Mis tareas', icon: ClipboardDocumentListIcon, to: '/tareas' },
  { label: 'Calendario', icon: CalendarDaysIcon, to: '/calendario' },
  { label: 'Amigos', icon: UserGroupIcon, to: '/amigos' },
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

function getPageIcon(page: WorkspacePageSummary) {
  if (page.type === 'board') return PaintBrushIcon
  if (page.type === 'database') return CircleStackIcon
  if (page.type === 'time-report') return ClockIcon
  return DocumentTextIcon
}

function getUserInitials(user: PublicUser) {
  const source = user.name?.trim() || user.email?.trim() || 'U'
  return source
    .split(/\s+/)
    .map(part => part[0])
    .join('')
    .slice(0, 2)
    .toUpperCase()
}

function SharedByAvatar({ user }: { user: PublicUser }) {
  if (user.avatarUrl) {
    return (
      <img
        src={user.avatarUrl}
        alt={user.name}
        title={`Compartido por ${user.name}`}
        className="h-4 w-4 shrink-0 rounded-full border border-white object-cover shadow-[0_0_0_1px_rgba(17,24,39,0.12)]"
      />
    )
  }

  return (
    <span
      title={`Compartido por ${user.name}`}
      className="flex h-4 w-4 shrink-0 items-center justify-center rounded-full border border-white bg-indigo-50 text-[7px] font-bold text-indigo-600 shadow-[0_0_0_1px_rgba(17,24,39,0.12)]"
    >
      {getUserInitials(user)}
    </span>
  )
}

type RenameTarget =
  | { type: 'space'; space: WorkspaceSpace; shared?: SharedSpace }
  | { type: 'page'; page: WorkspacePageSummary; shared?: SharedSpace }

function SharedSpaceTree({
  shared,
  space,
  spaces,
  pages,
  level = 0,
  onOpenMenu,
  onOpenPageMenu,
  onToggleSpace,
  onSelectRenameTarget,
  collapsedOverrides,
  editingPage,
  pageDraftTitle,
  onPageDraftTitleChange,
  onSavePageEdit,
  onCancelPageEdit,
}: {
  shared: SharedSpace
  space: WorkspaceSpace
  spaces: WorkspaceSpace[]
  pages: WorkspacePageSummary[]
  level?: number
  onOpenMenu: (shared: SharedSpace, space: WorkspaceSpace, x: number, y: number) => void
  onOpenPageMenu: (shared: SharedSpace, page: WorkspacePageSummary, x: number, y: number) => void
  onToggleSpace: (space: WorkspaceSpace, collapsed: boolean) => void
  onSelectRenameTarget: (target: RenameTarget) => void
  collapsedOverrides: Record<string, boolean>
  editingPage: WorkspacePageSummary | null
  pageDraftTitle: string
  onPageDraftTitleChange: (title: string) => void
  onSavePageEdit: () => void
  onCancelPageEdit: () => void
}) {
  const children = spaces.filter(child => child.parentId === space.id)
  const spacePages = pages.filter(page => page.spaceId === space.id)
  const descendantIds = new Set([space.id])
  let changed = true
  while (changed) {
    changed = false
    spaces.forEach(candidate => {
      if (candidate.parentId && descendantIds.has(candidate.parentId) && !descendantIds.has(candidate.id)) {
        descendantIds.add(candidate.id)
        changed = true
      }
    })
  }
  const firstPage = pages.find(page => descendantIds.has(page.spaceId))
  const SpaceIcon = getSpaceIconOption(space.icon).icon
  const canEdit = shared.role === 'EDITOR'
  const isCollapsed = collapsedOverrides[space.id] ?? Boolean(space.collapsed)

  return (
    <div className={level ? 'mt-0.5 pl-4' : 'mb-2'}>
      <NavLink
        to={firstPage ? `/p/${firstPage.id}` : '/'}
        onClick={event => {
          if (canEdit) onSelectRenameTarget({ type: 'space', space, shared })
          if (level !== 0) return
          event.preventDefault()
          onToggleSpace(space, isCollapsed)
        }}
        onContextMenu={event => {
          if (!canEdit) return
          event.preventDefault()
          onSelectRenameTarget({ type: 'space', space, shared })
          onOpenMenu(shared, space, event.clientX, event.clientY)
        }}
        className={({ isActive }) => {
          return `group/shared-space flex min-w-0 items-center gap-1.5 rounded-md px-3 py-1.5 text-left text-[13px] transition-colors ${
            isActive ? 'nav-active' : 'hover:bg-gray-100'
          }`
        }}
        style={({ isActive }) => ({
          color: isActive ? 'var(--color-accent)' : 'var(--color-text-secondary)',
        })}
      >
        {level === 0 && <SharedByAvatar user={shared.createdBy} />}
        <span
          className="relative h-3.5 w-3.5 shrink-0"
          onClick={event => {
            if (level === 0) return
            event.preventDefault()
            event.stopPropagation()
            if (canEdit) onSelectRenameTarget({ type: 'space', space, shared })
            onToggleSpace(space, isCollapsed)
          }}
          title={isCollapsed ? 'Expandir espacio' : 'Colapsar espacio'}
        >
          <SpaceIcon
            className="absolute inset-0 h-3.5 w-3.5 transition-opacity group-hover/shared-space:opacity-0"
            style={{ color: space.iconColor ?? '#6472EB' }}
          />
          {isCollapsed ? (
            <ChevronRightIcon className="absolute inset-0 h-3.5 w-3.5 text-gray-400 opacity-0 transition-opacity group-hover/shared-space:opacity-100" />
          ) : (
            <ChevronDownIcon className="absolute inset-0 h-3.5 w-3.5 text-gray-400 opacity-0 transition-opacity group-hover/shared-space:opacity-100" />
          )}
        </span>
        <span className="truncate">{space.name}</span>
      </NavLink>

      {!isCollapsed && (
        <div className="mt-0.5 pl-4">
          {spacePages.map(page => {
            const PageIcon = getPageIcon(page)
            return (
              <NavLink
                key={page.id}
                to={`/p/${page.id}`}
                onClick={() => {
                  if (canEdit) onSelectRenameTarget({ type: 'page', page, shared })
                }}
                onContextMenu={event => {
                  if (!canEdit) return
                  event.preventDefault()
                  onSelectRenameTarget({ type: 'page', page, shared })
                  onOpenPageMenu(shared, page, event.clientX, event.clientY)
                }}
                className={({ isActive }) => {
                  return `group/shared-page flex min-w-0 items-center gap-2 rounded-md px-3 py-1.5 text-[13px] transition-colors ${
                    isActive ? 'nav-active' : 'hover:bg-gray-100'
                  }`
                }}
                style={({ isActive }) => ({
                  color: isActive ? 'var(--color-accent)' : 'var(--color-text-secondary)',
                })}
              >
                <PageIcon className="h-3.5 w-3.5 shrink-0 text-gray-400" />
                {editingPage?.id === page.id ? (
                  <input
                    autoFocus
                    value={pageDraftTitle}
                    onClick={event => event.preventDefault()}
                    onFocus={event => event.currentTarget.select()}
                    onChange={event => onPageDraftTitleChange(event.target.value)}
                    onBlur={onSavePageEdit}
                    onKeyDown={event => {
                      if (event.key === 'Enter') {
                        event.preventDefault()
                        onSavePageEdit()
                      }
                      if (event.key === 'Escape') {
                        event.preventDefault()
                        onCancelPageEdit()
                      }
                    }}
                    className="cursor-text-dark min-w-0 flex-1 rounded border border-gray-200 bg-white px-1.5 py-0.5 text-[13px] text-gray-800 caret-gray-900 outline-none"
                  />
                ) : (
                  <span className="truncate">{page.title || 'Página sin título'}</span>
                )}
              </NavLink>
            )
          })}
          {children.map(child => (
            <SharedSpaceTree
              key={child.id}
              shared={shared}
              space={child}
              spaces={spaces}
              pages={pages}
              level={level + 1}
              onOpenMenu={onOpenMenu}
              onOpenPageMenu={onOpenPageMenu}
              onToggleSpace={onToggleSpace}
              onSelectRenameTarget={onSelectRenameTarget}
              collapsedOverrides={collapsedOverrides}
              editingPage={editingPage}
              pageDraftTitle={pageDraftTitle}
              onPageDraftTitleChange={onPageDraftTitleChange}
              onSavePageEdit={onSavePageEdit}
              onCancelPageEdit={onCancelPageEdit}
            />
          ))}
        </div>
      )}
    </div>
  )
}

interface SidebarProps {
  collapsed: boolean
  currentUserId?: string | null
}

export default function Sidebar({ collapsed, currentUserId = null }: SidebarProps) {
  const navigate = useNavigate()
  const { pathname } = useLocation()
  const [workspaces, setWorkspaces] = useState<Workspace[]>(() => loadWorkspaces())
  const [spaces, setSpaces] = useState<WorkspaceSpace[]>(() => loadWorkspaceSpaces())
  const [activeWorkspaceId, setActiveWorkspaceId] = useState(() => loadActiveWorkspaceId())
  const [sharedSpaceCollapsedOverrides, setSharedSpaceCollapsedOverrides] = useState<Record<string, boolean>>({})
  const { data: pages = [] } = usePageSummaries(activeWorkspaceId)
  const { data: sharedSpaces = [] } = useSharedSpaces(currentUserId)
  const refreshSharedSpaces = useRefreshSharedSpaces()
  const { updateSummary, removePage } = usePageCache()
  const [isCreateSpaceOpen, setIsCreateSpaceOpen] = useState(false)
  const [creatingSpaceParentId, setCreatingSpaceParentId] = useState<string | null>(null)
  const [editingSpace, setEditingSpace] = useState<WorkspaceSpace | null>(null)
  const [editingSpaceShared, setEditingSpaceShared] = useState<SharedSpace | null>(null)
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
  const [sharedSpaceMenu, setSharedSpaceMenu] = useState<{
    shared: SharedSpace
    space: WorkspaceSpace
    x: number
    y: number
  } | null>(null)
  const [pageMenu, setPageMenu] = useState<{
    page: WorkspacePageSummary
    shared?: SharedSpace
    x: number
    y: number
  } | null>(null)
  const [renameTarget, setRenameTarget] = useState<RenameTarget | null>(null)
  const [editingPage, setEditingPage] = useState<WorkspacePageSummary | null>(null)
  const [editingPageShared, setEditingPageShared] = useState<SharedSpace | null>(null)
  const [pageDraftTitle, setPageDraftTitle] = useState('')
  const [sharingSpace, setSharingSpace] = useState<WorkspaceSpace | null>(null)
  const [shareSearch, setShareSearch] = useState('')
  const [isShareFriendPickerOpen, setIsShareFriendPickerOpen] = useState(false)
  const [selectedShareUser, setSelectedShareUser] = useState<PublicUser | null>(null)
  const [shareRole, setShareRole] = useState<SpaceShareRole>('VIEWER')

  const { data: friends = [] } = useQuery({
    queryKey: friendsKeys.list(''),
    queryFn: () => friendsApi.list(),
    staleTime: 30 * 1000,
  })
  const {
    data: sharingSpaceShares = [],
    refetch: refetchSharingSpaceShares,
  } = useQuery({
    queryKey: ['space-shares', sharingSpace?.id],
    queryFn: () => sharedSpacesApi.listShares(sharingSpace!.id),
    enabled: Boolean(sharingSpace),
  })
  const shareCandidates = friends
    .map(friendship => friendship.friend)
    .filter(friend => {
      const query = shareSearch.trim().toLowerCase()
      if (!query) return true
      return friend.name.toLowerCase().includes(query) || friend.email.toLowerCase().includes(query)
    })
    .filter(friend => !sharingSpaceShares.some(share => share.user.id === friend.id))

  useEffect(() => {
    const syncWorkspaceData = () => {
      setWorkspaces(loadWorkspaces())
      setSpaces(loadWorkspaceSpaces())
      setActiveWorkspaceId(loadActiveWorkspaceId())
    }

    window.addEventListener(WORKSPACE_DATA_CHANGE_EVENT, syncWorkspaceData)
    return () => window.removeEventListener(WORKSPACE_DATA_CHANGE_EVENT, syncWorkspaceData)
  }, [])

  useEffect(() => {
    if (!spaceMenu && !subspaceMenu && !sharedSpaceMenu && !pageMenu) return

    const closeMenu = () => {
      setSpaceMenu(null)
      setSubspaceMenu(null)
      setSharedSpaceMenu(null)
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
  }, [spaceMenu, subspaceMenu, sharedSpaceMenu, pageMenu])

  const activeWorkspace = workspaces.find(workspace => workspace.id === activeWorkspaceId) ?? workspaces[0]
  const activePages = pages.filter(page => page.workspaceId === activeWorkspace?.id)
  const activeSpaces = spaces.filter(space => space.workspaceId === activeWorkspace?.id)
  const rootSpaces = activeSpaces.filter(space => !space.parentId && !space.archived)
  const archivedSpaces = activeSpaces.filter(space => !space.parentId && space.archived)
  const generalSpaceId = activeSpaces.find(space => !space.parentId && space.name === 'General' && !space.archived)?.id
  const generalPages = generalSpaceId ? activePages.filter(page => page.spaceId === generalSpaceId) : []

  function handleCreatePage(type: WorkspacePageType, spaceId?: string) {
    if (!activeWorkspace) return
    const page = createWorkspacePage(activeWorkspace.id, type, spaceId)
    updateSummary(page)
    navigate(`/p/${page.id}`)
  }

  async function handleCreateSharedPage(shared: SharedSpace, space: WorkspaceSpace, type: WorkspacePageType) {
    if (shared.role !== 'EDITOR') return
    const normalizedType = type === 'blank' ? 'text' : type
    const titleByType: Record<Exclude<WorkspacePageType, 'blank'>, string> = {
      text: 'Nueva hoja de texto',
      board: 'Nueva pizarra',
      database: 'Nuevo diagrama BD',
      tasks: 'Nueva hoja de tareas',
      'time-report': 'Nuevo reporte de horas',
    }
    const page = await pagesApi.create({
      workspaceId: space.workspaceId,
      spaceId: space.id,
      title: titleByType[normalizedType],
      type: normalizedType,
    })
    refreshSharedSpaces()
    navigate(`/p/${page.id}`)
  }

  async function handleCreateSharedSpace(shared: SharedSpace, parent: WorkspaceSpace) {
    if (shared.role !== 'EDITOR') return
    const name = window.prompt('Nombre del subespacio compartido')
    if (!name?.trim()) return
    await spacesApi.create({
      workspaceId: parent.workspaceId,
      parentId: parent.id,
      name: name.trim(),
      icon: 'folder',
      iconColor: parent.iconColor ?? '#6472EB',
    })
    refreshSharedSpaces()
  }

  async function handleDeleteSharedPage(shared: SharedSpace, page: WorkspacePageSummary) {
    if (shared.role !== 'EDITOR') return
    if (!window.confirm(`¿Borrar la hoja "${page.title || 'Página sin título'}"?`)) return
    await pagesApi.remove(page.id)
    refreshSharedSpaces()
    if (pathname === `/p/${page.id}`) navigate('/')
  }

  async function handleDeleteSharedSpace(shared: SharedSpace, space: WorkspaceSpace) {
    if (shared.role !== 'EDITOR') return
    if (!window.confirm(`¿Borrar el espacio "${space.name}" y su contenido?`)) return
    await spacesApi.remove(space.id)
    refreshSharedSpaces()
    if (pathname === `/e/${space.id}` || pathname === `/s/${space.id}`) navigate('/')
  }

  function openShareSpace(space: WorkspaceSpace) {
    setSharingSpace(space)
    setShareSearch('')
    setIsShareFriendPickerOpen(false)
    setSelectedShareUser(null)
    setShareRole('VIEWER')
  }

  async function handleCreateShare() {
    if (!sharingSpace || !selectedShareUser) return
    await sharedSpacesApi.createShare(sharingSpace.id, {
      userId: selectedShareUser.id,
      role: shareRole,
    })
    setShareSearch('')
    setIsShareFriendPickerOpen(false)
    setSelectedShareUser(null)
    await refetchSharingSpaceShares()
  }

  async function handleUpdateShare(shareId: string, role: SpaceShareRole) {
    if (!sharingSpace) return
    await sharedSpacesApi.updateShare(sharingSpace.id, shareId, { role })
    await refetchSharingSpaceShares()
  }

  async function handleRemoveShare(shareId: string) {
    if (!sharingSpace) return
    await sharedSpacesApi.removeShare(sharingSpace.id, shareId)
    await refetchSharingSpaceShares()
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
    if (deletedPage) removePage(pageId, deletedPage.workspaceId)
    if (pathname === `/p/${pageId}`) navigate(fallbackPath)
  }

  function handleDeleteSpace(spaceId: string) {
    const childSpaceIds = spaces.filter(space => space.parentId === spaceId).map(space => space.id)
    const deletedSpaceIds = new Set([spaceId, ...childSpaceIds])
    const spacePages = pages.filter(page => deletedSpaceIds.has(page.spaceId))

    deleteWorkspaceSpace(spaceId)
    setSpaces(loadWorkspaceSpaces())
    if (spacePages.some(page => pathname === `/p/${page.id}`)) navigate('/')
  }

  function handleArchiveSpace(space: WorkspaceSpace) {
    const childSpaceIds = spaces.filter(child => child.parentId === space.id).map(child => child.id)
    const archivedSpaceIds = new Set([space.id, ...childSpaceIds])
    const archivedPages = pages.filter(page => archivedSpaceIds.has(page.spaceId))
    const shouldLeaveCurrentRoute =
      pathname === `/e/${space.id}` ||
      childSpaceIds.some(childId => pathname === `/s/${childId}`) ||
      archivedPages.some(page => pathname === `/p/${page.id}`)

    updateWorkspaceSpace(space.id, {
      archived: true,
      archivedAt: new Date().toISOString(),
    })
    setSpaces(loadWorkspaceSpaces())
    setSpaceMenu(null)

    if (shouldLeaveCurrentRoute) navigate('/archivo')
  }

  function handleToggleSpace(space: WorkspaceSpace) {
    updateWorkspaceSpace(space.id, { collapsed: !space.collapsed })
    setSpaces(loadWorkspaceSpaces())
  }

  function handleToggleSharedSpace(space: WorkspaceSpace, collapsed: boolean) {
    setSharedSpaceCollapsedOverrides(previous => ({
      ...previous,
      [space.id]: !collapsed,
    }))
  }

  function openCreateSpace(parentId: string | null = null) {
    setCreatingSpaceParentId(parentId)
    setNewSpaceName('')
    setNewSpaceIcon('folder')
    setNewSpaceIconColor('#6472EB')
    setIsCreateSpaceOpen(true)
  }

  function openEditSpace(space: WorkspaceSpace, shared?: SharedSpace) {
    setEditingSpace(space)
    setEditingSpaceShared(shared ?? null)
    setSpaceDraftName(space.name)
    setSpaceDraftIcon(space.icon ?? '')
    setSpaceDraftIconColor(space.iconColor ?? '#6472EB')
  }

  function openEditPage(page: WorkspacePageSummary, shared?: SharedSpace) {
    setEditingPage(page)
    setEditingPageShared(shared ?? null)
    setPageDraftTitle(page.title)
  }

  useEffect(() => {
    function shouldIgnoreF2(event: KeyboardEvent) {
      if (event.key !== 'F2') return true
      if (collapsed || !renameTarget) return true
      if (isCreateSpaceOpen || editingSpace || deletingSpace || sharingSpace || editingPage) return true

      const target = event.target
      if (!(target instanceof HTMLElement)) return false

      const tagName = target.tagName.toLowerCase()
      return (
        tagName === 'input' ||
        tagName === 'textarea' ||
        tagName === 'select' ||
        target.isContentEditable ||
        Boolean(target.closest('[contenteditable="true"]'))
      )
    }

    function handleRenameShortcut(event: KeyboardEvent) {
      if (shouldIgnoreF2(event)) return

      event.preventDefault()
      setSpaceMenu(null)
      setSubspaceMenu(null)
      setSharedSpaceMenu(null)
      setPageMenu(null)

      if (renameTarget?.type === 'space') {
        openEditSpace(renameTarget.space, renameTarget.shared)
      }
      if (renameTarget?.type === 'page') {
        openEditPage(renameTarget.page, renameTarget.shared)
      }
    }

    window.addEventListener('keydown', handleRenameShortcut)
    return () => window.removeEventListener('keydown', handleRenameShortcut)
  }, [
    collapsed,
    deletingSpace,
    editingPage,
    editingSpace,
    isCreateSpaceOpen,
    renameTarget,
    sharingSpace,
  ])

  async function savePageEdit() {
    if (!editingPage) return
    if (!pageDraftTitle.trim()) {
      setEditingPage(null)
      setEditingPageShared(null)
      return
    }

    try {
      const summary = await pagesApi.update(editingPage.id, { title: pageDraftTitle.trim() })
      updateSummary(summary)
      if (editingPageShared) refreshSharedSpaces()
      setEditingPage(null)
      setEditingPageShared(null)
    } catch (error) {
      console.error('No se pudo actualizar el título de la página.', error)
    }
  }

  async function saveSpaceEdit() {
    if (!editingSpace || !spaceDraftName.trim()) return

    const patch = {
      name: spaceDraftName.trim(),
      icon: spaceDraftIcon.trim() || 'folder',
      iconColor: spaceDraftIconColor,
    }

    if (editingSpaceShared) {
      await spacesApi.update(editingSpace.id, patch)
      refreshSharedSpaces()
    } else {
      updateWorkspaceSpace(editingSpace.id, patch)
      setSpaces(loadWorkspaceSpaces())
    }
    setEditingSpace(null)
    setEditingSpaceShared(null)
  }

  return (
    <aside
      className="flex shrink-0 flex-col overflow-hidden border-r transition-all duration-300 [&_a]:cursor-pointer [&_button]:cursor-pointer"
      style={{
        width: collapsed ? 0 : 240,
        opacity: collapsed ? 0 : 1,
        background: 'var(--color-bg-sidebar)',
        borderColor: 'var(--sidebar-shell-border)',
        backdropFilter: 'blur(2px) saturate(1.08)',
        WebkitBackdropFilter: 'blur(2px) saturate(1.08)',
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
                    onClick={() => {
                      setRenameTarget({ type: 'space', space })
                      handleToggleSpace(space)
                    }}
                    onContextMenu={event => {
                      event.preventDefault()
                      setRenameTarget({ type: 'space', space })
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
                              onClick={() => setRenameTarget({ type: 'space', space: subspace })}
                              onContextMenu={event => {
                                event.preventDefault()
                                setRenameTarget({ type: 'space', space: subspace })
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
                                        setRenameTarget({ type: 'page', page })
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
                                      onClick={() => setRenameTarget({ type: 'page', page })}
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
                                        <span className="truncate">{page.title || 'Página sin título'}</span>
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
                            setRenameTarget({ type: 'page', page })
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
                          onClick={() => setRenameTarget({ type: 'page', page })}
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
                            <span className="truncate">{page.title || 'Página sin título'}</span>
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
          {sharedSpaces.length > 0 && (
            <div className="mt-5">
              <p
                className="px-3 pb-1.5 text-[11px] font-semibold uppercase tracking-widest"
                style={{ color: 'var(--color-text-muted)' }}
              >
                Compartido
              </p>
              {sharedSpaces.map(shared => {
                const rootSpace = shared.spaces.find(space => space.id === shared.rootSpaceId)
                if (!rootSpace) return null

                return (
                  <div key={shared.id}>
                    <SharedSpaceTree
                      shared={shared}
                      space={rootSpace}
                      spaces={shared.spaces}
                      pages={shared.pages}
                      onOpenMenu={(sharedSpace, space, x, y) => {
                        setRenameTarget({ type: 'space', space, shared: sharedSpace })
                        setSharedSpaceMenu({ shared: sharedSpace, space, x, y })
                      }}
                      onOpenPageMenu={(sharedSpace, page, x, y) => {
                        setRenameTarget({ type: 'page', page, shared: sharedSpace })
                        setPageMenu({ shared: sharedSpace, page, x, y })
                      }}
                      onToggleSpace={handleToggleSharedSpace}
                      onSelectRenameTarget={setRenameTarget}
                      collapsedOverrides={sharedSpaceCollapsedOverrides}
                      editingPage={editingPage}
                      pageDraftTitle={pageDraftTitle}
                      onPageDraftTitleChange={setPageDraftTitle}
                      onSavePageEdit={() => void savePageEdit()}
                      onCancelPageEdit={() => {
                        setEditingPage(null)
                        setEditingPageShared(null)
                      }}
                    />
                  </div>
                )
              })}
            </div>
          )}

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
                  onClick={() => setRenameTarget({ type: 'page', page })}
                  onContextMenu={event => {
                    event.preventDefault()
                    setRenameTarget({ type: 'page', page })
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
                    <span className="truncate">{page.title || 'Página sin título'}</span>
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
              <PopoverContent className="w-44 gap-1 p-1.5" align="start" sideOffset={4}>
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
                <button
                  type="button"
                  onClick={() => handleCreatePage('time-report')}
                  className="flex h-8 w-full items-center gap-2 rounded-md px-2 text-left text-[13px] text-gray-600 transition-colors hover:bg-gray-100 hover:text-gray-900"
                >
                  <ClockIcon className="h-4 w-4" />
                  Reporte de horas
                </button>
              </PopoverContent>
            </Popover>
          </div>

          <div className="mt-5">
            <p
              className="px-3 pb-1.5 text-[11px] font-semibold uppercase tracking-widest"
              style={{ color: 'var(--color-text-muted)' }}
            >
              Archivado
            </p>
            <NavLink
              to="/archivo"
              className={({ isActive }) => {
                return `mb-0.5 flex w-full min-w-0 items-center gap-2.5 rounded-md px-3 py-1.5 text-left text-[13px] transition-colors ${
                  isActive ? 'nav-active' : 'hover:bg-gray-100'
                }`
              }}
              style={({ isActive }) => {
                return {
                  color: isActive ? 'var(--color-accent)' : 'var(--color-text-secondary)',
                }
              }}
            >
              <ArchiveBoxIcon className="h-4 w-4 shrink-0 text-gray-400" />
              <span className="truncate">Archivado</span>
              {archivedSpaces.length > 0 && (
                <span className="ml-auto rounded-full bg-gray-100 px-1.5 text-[11px] text-gray-400">
                  {archivedSpaces.length}
                </span>
              )}
            </NavLink>
          </div>
        </div>
      </nav>

      {spaceMenu && (
        <div
          className="fixed z-[95] w-44 rounded-lg border border-gray-200 bg-white p-1.5 shadow-xl"
          style={{
            left: Math.min(spaceMenu.x, window.innerWidth - 188),
            top: Math.min(spaceMenu.y, window.innerHeight - 234),
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
          <button
            type="button"
            onClick={() => {
              handleCreatePage('time-report', spaceMenu.space.id)
              setSpaceMenu(null)
            }}
            className="flex h-8 w-full items-center gap-2 rounded-md px-2 text-left text-[13px] text-gray-600 transition-colors hover:bg-gray-100 hover:text-gray-900"
          >
            <ClockIcon className="h-4 w-4" />
            Agregar reporte de horas
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
              openShareSpace(spaceMenu.space)
              setSpaceMenu(null)
            }}
            className="flex h-8 w-full items-center gap-2 rounded-md px-2 text-left text-[13px] text-gray-600 transition-colors hover:bg-gray-100 hover:text-gray-900"
          >
            <UserGroupIcon className="h-4 w-4" />
            Compartir
          </button>
          {spaceMenu.space.name !== 'General' && (
            <button
              type="button"
              onClick={() => handleArchiveSpace(spaceMenu.space)}
              className="flex h-8 w-full items-center gap-2 rounded-md px-2 text-left text-[13px] text-gray-600 transition-colors hover:bg-gray-100 hover:text-gray-900"
            >
              <ArchiveBoxIcon className="h-4 w-4" />
              Archivar
            </button>
          )}
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
            top: Math.min(subspaceMenu.y, window.innerHeight - 202),
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
          <button
            type="button"
            onClick={() => {
              handleCreatePage('time-report', subspaceMenu.space.id)
              setSubspaceMenu(null)
            }}
            className="flex h-8 w-full items-center gap-2 rounded-md px-2 text-left text-[13px] text-gray-600 transition-colors hover:bg-gray-100 hover:text-gray-900"
          >
            <ClockIcon className="h-4 w-4" />
            Agregar reporte de horas
          </button>
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
              openShareSpace(subspaceMenu.space)
              setSubspaceMenu(null)
            }}
            className="flex h-8 w-full items-center gap-2 rounded-md px-2 text-left text-[13px] text-gray-600 transition-colors hover:bg-gray-100 hover:text-gray-900"
          >
            <UserGroupIcon className="h-4 w-4" />
            Compartir
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

      {sharedSpaceMenu && (
        <div
          className="fixed z-[95] w-44 rounded-lg border border-gray-200 bg-white p-1.5 shadow-xl"
          style={{
            left: Math.min(sharedSpaceMenu.x, window.innerWidth - 188),
            top: Math.min(sharedSpaceMenu.y, window.innerHeight - 282),
          }}
          onClick={event => event.stopPropagation()}
          onContextMenu={event => event.preventDefault()}
        >
          <button
            type="button"
            onClick={() => {
              void handleCreateSharedSpace(sharedSpaceMenu.shared, sharedSpaceMenu.space)
              setSharedSpaceMenu(null)
            }}
            className="flex h-8 w-full items-center gap-2 rounded-md px-2 text-left text-[13px] text-gray-600 transition-colors hover:bg-gray-100 hover:text-gray-900"
          >
            <FolderIcon className="h-4 w-4" />
            Agregar subespacio
          </button>
          <button
            type="button"
            onClick={() => {
              void handleCreateSharedPage(sharedSpaceMenu.shared, sharedSpaceMenu.space, 'text')
              setSharedSpaceMenu(null)
            }}
            className="flex h-8 w-full items-center gap-2 rounded-md px-2 text-left text-[13px] text-gray-600 transition-colors hover:bg-gray-100 hover:text-gray-900"
          >
            <DocumentTextIcon className="h-4 w-4" />
            Agregar texto
          </button>
          <button
            type="button"
            onClick={() => {
              void handleCreateSharedPage(sharedSpaceMenu.shared, sharedSpaceMenu.space, 'board')
              setSharedSpaceMenu(null)
            }}
            className="flex h-8 w-full items-center gap-2 rounded-md px-2 text-left text-[13px] text-gray-600 transition-colors hover:bg-gray-100 hover:text-gray-900"
          >
            <PaintBrushIcon className="h-4 w-4" />
            Agregar pizarra
          </button>
          <button
            type="button"
            onClick={() => {
              void handleCreateSharedPage(sharedSpaceMenu.shared, sharedSpaceMenu.space, 'database')
              setSharedSpaceMenu(null)
            }}
            className="flex h-8 w-full items-center gap-2 rounded-md px-2 text-left text-[13px] text-gray-600 transition-colors hover:bg-gray-100 hover:text-gray-900"
          >
            <CircleStackIcon className="h-4 w-4" />
            Agregar diagrama BD
          </button>
          <button
            type="button"
            onClick={() => {
              void handleCreateSharedPage(sharedSpaceMenu.shared, sharedSpaceMenu.space, 'time-report')
              setSharedSpaceMenu(null)
            }}
            className="flex h-8 w-full items-center gap-2 rounded-md px-2 text-left text-[13px] text-gray-600 transition-colors hover:bg-gray-100 hover:text-gray-900"
          >
            <ClockIcon className="h-4 w-4" />
            Agregar reporte de horas
          </button>
          <div className="my-1 h-px bg-gray-100" />
          <button
            type="button"
            onClick={() => {
              openEditSpace(sharedSpaceMenu.space, sharedSpaceMenu.shared)
              setSharedSpaceMenu(null)
            }}
            className="flex h-8 w-full items-center gap-2 rounded-md px-2 text-left text-[13px] text-gray-600 transition-colors hover:bg-gray-100 hover:text-gray-900"
          >
            <PencilSquareIcon className="h-4 w-4" />
            Editar
          </button>
          <button
            type="button"
            onClick={() => {
              void handleDeleteSharedSpace(sharedSpaceMenu.shared, sharedSpaceMenu.space)
              setSharedSpaceMenu(null)
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
              openEditPage(pageMenu.page, pageMenu.shared)
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
              if (pageMenu.shared) {
                void handleDeleteSharedPage(pageMenu.shared, pageMenu.page)
              } else {
                handleDeletePage(pageMenu.page.id)
              }
              setPageMenu(null)
            }}
            className="flex h-8 w-full items-center gap-2 rounded-md px-2 text-left text-[13px] text-red-600 transition-colors hover:bg-red-50"
          >
            <TrashIcon className="h-4 w-4" />
            Borrar
          </button>
        </div>
      )}

      {sharingSpace && (
        <div className="fixed inset-0 z-[90] flex items-center justify-center bg-black/20 px-4">
          <div className="w-full max-w-[460px] rounded-xl border border-gray-200 bg-white p-4 shadow-xl">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h3 className="text-[14px] font-semibold text-gray-900">Compartir espacio</h3>
                <p className="mt-1 text-[12px] text-gray-500">
                  {sharingSpace.name} se compartirá con sus subespacios y hojas.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setSharingSpace(null)}
                className="rounded-md px-2 py-1 text-[13px] text-gray-400 hover:bg-gray-100 hover:text-gray-700"
              >
                Cerrar
              </button>
            </div>

            <div className="mt-4 rounded-lg border border-gray-200 p-3">
              <label className="mb-1.5 block text-[11px] font-semibold uppercase tracking-wide text-gray-400">
                Buscar amigo
              </label>
              <input
                value={shareSearch}
                onMouseDown={() => setIsShareFriendPickerOpen(true)}
                onFocus={() => setIsShareFriendPickerOpen(true)}
                onClick={() => {
                  setSelectedShareUser(null)
                  setIsShareFriendPickerOpen(true)
                }}
                onBlur={() => {
                  window.setTimeout(() => setIsShareFriendPickerOpen(false), 120)
                }}
                onChange={event => {
                  setShareSearch(event.target.value)
                  setSelectedShareUser(null)
                  setIsShareFriendPickerOpen(true)
                }}
                placeholder="Nombre o correo de tu amigo"
                className="cursor-text-dark h-9 w-full rounded-lg border border-gray-200 px-3 text-[13px] text-gray-800 caret-gray-900 outline-none focus:border-gray-300 focus:ring-2 focus:ring-gray-200/60"
              />
              {isShareFriendPickerOpen && shareCandidates.length > 0 && !selectedShareUser && (
                <div className="mt-2 max-h-36 overflow-y-auto rounded-lg border border-gray-100">
                  {shareCandidates.map(user => (
                    <button
                      key={user.id}
                      type="button"
                      onMouseDown={event => {
                        event.preventDefault()
                        setSelectedShareUser(user)
                        setShareSearch(`${user.name} · ${user.email}`)
                        setIsShareFriendPickerOpen(false)
                      }}
                      className="block w-full px-3 py-2 text-left text-[12px] hover:bg-gray-50"
                    >
                      <span className="font-semibold text-gray-800">{user.name}</span>
                      <span className="ml-2 text-gray-400">{user.email}</span>
                    </button>
                  ))}
                </div>
              )}
              {isShareFriendPickerOpen && !selectedShareUser && friends.length === 0 && (
                <p className="mt-2 rounded-lg border border-dashed border-gray-200 p-3 text-[12px] text-gray-400">
                  Agrega amigos desde la sección Amigos para poder compartir espacios.
                </p>
              )}
              {isShareFriendPickerOpen && !selectedShareUser && friends.length > 0 && shareCandidates.length === 0 && (
                <p className="mt-2 rounded-lg border border-dashed border-gray-200 p-3 text-[12px] text-gray-400">
                  No encontramos amigos disponibles con ese texto.
                </p>
              )}
              <div className="mt-3 flex items-center gap-2">
                <select
                  value={shareRole}
                  onChange={event => setShareRole(event.target.value as SpaceShareRole)}
                  className="h-9 rounded-lg border border-gray-200 bg-white px-3 text-[13px] text-gray-700 outline-none"
                >
                  <option value="VIEWER">Puede ver</option>
                  <option value="EDITOR">Puede editar</option>
                </select>
                <button
                  type="button"
                  disabled={!selectedShareUser}
                  onClick={() => void handleCreateShare()}
                  className="h-9 rounded-md bg-[#6472EB] px-3 text-[13px] font-semibold text-white hover:bg-[#5360D8] disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Compartir
                </button>
              </div>
            </div>

            <div className="mt-4">
              <h4 className="mb-2 text-[12px] font-semibold uppercase tracking-wide text-gray-400">
                Personas con acceso
              </h4>
              {sharingSpaceShares.length ? (
                <div className="space-y-2">
                  {sharingSpaceShares.map(share => (
                    <div key={share.id} className="flex items-center gap-2 rounded-lg border border-gray-100 px-3 py-2">
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-[13px] font-semibold text-gray-800">{share.user.name}</p>
                        <p className="truncate text-[11px] text-gray-400">{share.user.email}</p>
                      </div>
                      <select
                        value={share.role}
                        onChange={event => void handleUpdateShare(share.id, event.target.value as SpaceShareRole)}
                        className="h-8 rounded-md border border-gray-200 bg-white px-2 text-[12px] text-gray-700 outline-none"
                      >
                        <option value="VIEWER">Puede ver</option>
                        <option value="EDITOR">Puede editar</option>
                      </select>
                      <button
                        type="button"
                        onClick={() => void handleRemoveShare(share.id)}
                        className="rounded-md px-2 py-1 text-[12px] font-medium text-red-500 hover:bg-red-50"
                      >
                        Quitar
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="rounded-lg border border-dashed border-gray-200 p-3 text-[12px] text-gray-400">
                  Este espacio todavía no está compartido.
                </p>
              )}
            </div>
          </div>
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
                onClick={() => {
                  setEditingSpace(null)
                  setEditingSpaceShared(null)
                }}
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
