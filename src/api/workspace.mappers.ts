import type { Workspace, WorkspacePage, WorkspacePageType, WorkspaceSpace } from '@/types/workspace'

type ApiWorkspace = Partial<Workspace> & Record<string, unknown>
type ApiWorkspaceSpace = Partial<Omit<WorkspaceSpace, 'parentId'>> & {
  parentId?: string | null
} & Record<string, unknown>
type ApiWorkspacePage = Partial<Omit<WorkspacePage, 'type' | 'content'>> & {
  type?: string
  content?: unknown
} & Record<string, unknown>

function asRecord(value: unknown): Record<string, unknown> {
  return value && typeof value === 'object' ? value as Record<string, unknown> : {}
}

function fallbackDate(value: unknown) {
  return typeof value === 'string' && value ? value : new Date().toISOString()
}

export function normalizeWorkspace(value: unknown): Workspace {
  const workspace = asRecord(value) as ApiWorkspace

  return {
    id: String(workspace.id ?? ''),
    name: String(workspace.name ?? 'Workspace sin nombre'),
    color: String(workspace.color ?? '#6472EB'),
  }
}

export function normalizeSpace(value: unknown): WorkspaceSpace {
  const space = asRecord(value) as ApiWorkspaceSpace
  const parentId = typeof space.parentId === 'string' && space.parentId
    ? space.parentId
    : undefined

  return {
    id: String(space.id ?? ''),
    workspaceId: String(space.workspaceId ?? ''),
    parentId,
    name: String(space.name ?? 'Espacio sin nombre'),
    icon: typeof space.icon === 'string' && space.icon ? space.icon : 'folder',
    iconColor: typeof space.iconColor === 'string' && space.iconColor ? space.iconColor : '#6472EB',
    description: typeof space.description === 'string' ? space.description : '',
    archived: Boolean(space.archived),
    archivedAt: typeof space.archivedAt === 'string' ? space.archivedAt : undefined,
    collapsed: Boolean(space.collapsed),
    createdAt: fallbackDate(space.createdAt),
    updatedAt: fallbackDate(space.updatedAt),
  }
}

export function normalizePageType(type: unknown): WorkspacePageType {
  const normalized = typeof type === 'string' ? type.toLowerCase() : ''
  if (normalized === 'blank') return 'blank'
  if (normalized === 'board') return 'board'
  if (normalized === 'database') return 'database'
  if (normalized === 'tasks') return 'tasks'
  return 'text'
}

export function normalizePage(value: unknown): WorkspacePage {
  const page = asRecord(value) as ApiWorkspacePage
  const content = typeof page.content === 'string'
    ? page.content
    : page.content == null
      ? ''
      : JSON.stringify(page.content)

  return {
    id: String(page.id ?? ''),
    workspaceId: String(page.workspaceId ?? ''),
    spaceId: String(page.spaceId ?? ''),
    title: String(page.title ?? 'Pagina sin titulo'),
    type: normalizePageType(page.type),
    content,
    createdAt: fallbackDate(page.createdAt),
    updatedAt: fallbackDate(page.updatedAt),
  }
}
