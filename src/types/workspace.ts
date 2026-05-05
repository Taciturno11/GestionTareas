export type WorkspacePageType = 'blank' | 'tasks'

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
  collapsed: boolean
  createdAt: string
  updatedAt: string
}

export interface WorkspacePage {
  id: string
  workspaceId: string
  spaceId: string
  title: string
  type: WorkspacePageType
  content: string
  createdAt: string
  updatedAt: string
}
