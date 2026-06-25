import type { PublicUser } from '@/api/users.api'

export type WorkspacePageType = 'blank' | 'text' | 'board' | 'database' | 'tasks' | 'time-report'

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
  accessRole?: 'OWNER' | 'EDITOR' | 'VIEWER'
}

export interface SharedSpace {
  id: string
  role: 'VIEWER' | 'EDITOR'
  rootSpaceId: string
  workspace: Workspace
  createdBy: PublicUser
  spaces: WorkspaceSpace[]
  pages: WorkspacePageSummary[]
  createdAt: string
  updatedAt: string
}
