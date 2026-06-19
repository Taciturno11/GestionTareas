export type WorkspacePageType = 'blank' | 'text' | 'board' | 'database' | 'tasks'

export interface Workspace {
  id: string
  name: string
  color: string
}

export interface WorkspaceSpace {
  id: string
  workspaceId: string
  parentId?: string
  name: string
  icon?: string
  iconColor?: string
  description?: string
  archived?: boolean
  archivedAt?: string
  collapsed: boolean
  createdAt: string
  updatedAt: string
}

export interface WorkspacePageSummary {
  id: string
  workspaceId: string
  spaceId: string
  title: string
  type: WorkspacePageType
  createdAt: string
  updatedAt: string
}

export interface WorkspacePage extends WorkspacePageSummary {
  content: string
}
