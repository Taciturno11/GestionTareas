import type { Workspace, WorkspacePage, WorkspacePageType, WorkspaceSpace } from '@/types/workspace'
import { pagesApi } from '@/api/pages.api'
import { spacesApi } from '@/api/spaces.api'
import { getAuthToken } from '@/services/auth-token'

const WORKSPACES_KEY = 'gt_workspaces'
const WORKSPACE_SPACES_KEY = 'gt_workspace_spaces'
const WORKSPACE_PAGES_KEY = 'gt_workspace_pages'
const ACTIVE_WORKSPACE_KEY = 'gt_active_workspace'

export const WORKSPACE_DATA_CHANGE_EVENT = 'gt-workspace-data-change'

export const defaultWorkspaces: Workspace[] = [
  { id: 'job-1', name: 'Trabajo 1', color: '#6472EB' },
  { id: 'personal', name: 'Personal', color: '#10B981' },
]

export const defaultWorkspaceSpaces: WorkspaceSpace[] = [
  {
    id: 'space-general-job-1',
    workspaceId: 'job-1',
    name: 'General',
    icon: 'folder',
    collapsed: false,
    createdAt: '2026-05-05T00:00:00.000Z',
    updatedAt: '2026-05-05T00:00:00.000Z',
  },
  {
    id: 'space-general-personal',
    workspaceId: 'personal',
    name: 'General',
    icon: 'folder',
    collapsed: false,
    createdAt: '2026-05-05T00:00:00.000Z',
    updatedAt: '2026-05-05T00:00:00.000Z',
  },
]

export const defaultWorkspacePages: WorkspacePage[] = [
  {
    id: 'roadmap',
    workspaceId: 'job-1',
    spaceId: 'space-general-job-1',
    title: 'Roadmap',
    type: 'text',
    content: '',
    createdAt: '2026-05-05T00:00:00.000Z',
    updatedAt: '2026-05-05T00:00:00.000Z',
  },
  {
    id: 'sprint-actual',
    workspaceId: 'job-1',
    spaceId: 'space-general-job-1',
    title: 'Sprint actual',
    type: 'tasks',
    content: '',
    createdAt: '2026-05-05T00:00:00.000Z',
    updatedAt: '2026-05-05T00:00:00.000Z',
  },
]

function createId(prefix: string) {
  const random = typeof crypto !== 'undefined' && 'randomUUID' in crypto
    ? crypto.randomUUID().slice(0, 8)
    : Math.random().toString(36).slice(2, 10)

  return `${prefix}-${random}`
}

function emitWorkspaceDataChange() {
  window.dispatchEvent(new CustomEvent(WORKSPACE_DATA_CHANGE_EVENT))
}

function mirrorToBackend(operation: Promise<unknown>) {
  if (!getAuthToken()) return

  operation.catch(error => {
    console.warn('No se pudo sincronizar workspace con backend.', error)
  })
}

function readJson<T>(key: string, fallback: T): T {
  const saved = localStorage.getItem(key)
  if (!saved) return fallback

  try {
    return JSON.parse(saved) as T
  } catch {
    return fallback
  }
}

export function loadWorkspaces() {
  const workspaces = readJson<Workspace[]>(WORKSPACES_KEY, defaultWorkspaces)
  return workspaces.length ? workspaces : defaultWorkspaces
}

export function saveWorkspaces(workspaces: Workspace[]) {
  localStorage.setItem(WORKSPACES_KEY, JSON.stringify(workspaces))
  emitWorkspaceDataChange()
}

export function loadWorkspacePages() {
  const pages = readJson<Array<WorkspacePage & { spaceId?: string }>>(WORKSPACE_PAGES_KEY, defaultWorkspacePages)
  return pages.map(page => ({
    ...page,
    spaceId: page.spaceId ?? getDefaultSpaceId(page.workspaceId),
  }))
}

export function saveWorkspacePages(pages: WorkspacePage[]) {
  localStorage.setItem(WORKSPACE_PAGES_KEY, JSON.stringify(pages))
  emitWorkspaceDataChange()
}

export function loadWorkspaceSpaces() {
  const spaces = readJson<WorkspaceSpace[]>(WORKSPACE_SPACES_KEY, defaultWorkspaceSpaces)
  return spaces.length
    ? spaces.map(space => ({
        ...space,
        parentId: space.parentId || undefined,
        iconColor: space.iconColor || '#6472EB',
        description: space.description ?? '',
        archived: Boolean(space.archived),
        archivedAt: space.archivedAt,
      }))
    : defaultWorkspaceSpaces
}

export function saveWorkspaceSpaces(spaces: WorkspaceSpace[]) {
  localStorage.setItem(WORKSPACE_SPACES_KEY, JSON.stringify(spaces))
  emitWorkspaceDataChange()
}

export function getDefaultSpaceId(workspaceId: string) {
  const spaces = loadWorkspaceSpaces()
  const existingSpace = spaces.find(space => space.workspaceId === workspaceId && space.name === 'General')
  if (existingSpace) return existingSpace.id

  const now = new Date().toISOString()
  const newSpace: WorkspaceSpace = {
    id: createId('space'),
    workspaceId,
    name: 'General',
    collapsed: false,
    createdAt: now,
    updatedAt: now,
  }

  saveWorkspaceSpaces([...spaces, newSpace])
  return newSpace.id
}

export function loadActiveWorkspaceId() {
  return localStorage.getItem(ACTIVE_WORKSPACE_KEY) || loadWorkspaces()[0]?.id || 'job-1'
}

export function saveActiveWorkspaceId(workspaceId: string) {
  localStorage.setItem(ACTIVE_WORKSPACE_KEY, workspaceId)
  emitWorkspaceDataChange()
}

export function createWorkspacePage(workspaceId: string, type: WorkspacePageType, spaceId = getDefaultSpaceId(workspaceId)) {
  const now = new Date().toISOString()
  const normalizedType = type === 'blank' ? 'text' : type
  const titleByType: Record<Exclude<WorkspacePageType, 'blank'>, string> = {
    text: 'Nueva hoja de texto',
    board: 'Nueva pizarra',
    database: 'Nuevo diagrama BD',
    tasks: 'Nueva hoja de tareas',
  }
  const page: WorkspacePage = {
    id: createId('page'),
    workspaceId,
    spaceId,
    title: titleByType[normalizedType],
    type: normalizedType,
    content: '',
    createdAt: now,
    updatedAt: now,
  }

  saveWorkspacePages([...loadWorkspacePages(), page])
  mirrorToBackend(pagesApi.create(page))
  return page
}

export function updateWorkspacePage(pageId: string, patch: Partial<Omit<WorkspacePage, 'id'>>) {
  const pages = loadWorkspacePages()
  const nextPages = pages.map(page =>
    page.id === pageId
      ? { ...page, ...patch, updatedAt: new Date().toISOString() }
      : page
  )

  saveWorkspacePages(nextPages)
  const updatedPage = nextPages.find(page => page.id === pageId)
  if (updatedPage) mirrorToBackend(pagesApi.update(pageId, patch))
}

export function deleteWorkspacePage(pageId: string) {
  saveWorkspacePages(loadWorkspacePages().filter(page => page.id !== pageId))
  mirrorToBackend(pagesApi.remove(pageId))
}

export function createWorkspaceSpace(
  workspaceId: string,
  name: string,
  icon = 'folder',
  parentId?: string,
  iconColor = '#6472EB',
) {
  const now = new Date().toISOString()
  const space: WorkspaceSpace = {
    id: createId('space'),
    workspaceId,
    parentId,
    name,
    icon,
    iconColor,
    collapsed: false,
    createdAt: now,
    updatedAt: now,
  }

  saveWorkspaceSpaces([...loadWorkspaceSpaces(), space])
  mirrorToBackend(spacesApi.create(space))
  return space
}

export function updateWorkspaceSpace(spaceId: string, patch: Partial<Omit<WorkspaceSpace, 'id'>>) {
  saveWorkspaceSpaces(loadWorkspaceSpaces().map(space =>
    space.id === spaceId
      ? { ...space, ...patch, updatedAt: new Date().toISOString() }
      : space
  ))
  mirrorToBackend(spacesApi.update(spaceId, patch))
}

export function deleteWorkspaceSpace(spaceId: string) {
  const spaces = loadWorkspaceSpaces()
  const deletedSpaceIds = new Set([spaceId])
  spaces.forEach(space => {
    if (space.parentId === spaceId) deletedSpaceIds.add(space.id)
  })

  saveWorkspacePages(loadWorkspacePages().filter(page => !deletedSpaceIds.has(page.spaceId)))
  saveWorkspaceSpaces(spaces.filter(space => !deletedSpaceIds.has(space.id)))
  mirrorToBackend(spacesApi.remove(spaceId))
}

export function findWorkspacePage(pageId: string) {
  return loadWorkspacePages().find(page => page.id === pageId) ?? null
}

export function findWorkspaceSpace(spaceId: string) {
  return loadWorkspaceSpaces().find(space => space.id === spaceId) ?? null
}
