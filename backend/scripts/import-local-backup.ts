import bcrypt from 'bcryptjs'
import { PageType, PrismaClient } from '@prisma/client'
import { readFile } from 'node:fs/promises'

const prisma = new PrismaClient()

interface LocalBackup {
  localStorage?: Record<string, string | null>
  indexedDB?: Array<{
    name: string
    version?: number
    stores?: Record<string, { records?: unknown[] }>
  }>
}

interface LocalWorkspace {
  id: string
  name: string
  color?: string
}

interface LocalSpace {
  id: string
  workspaceId: string
  parentId?: string
  name: string
  icon?: string
  iconColor?: string
  description?: string
  archived?: boolean
  archivedAt?: string
  collapsed?: boolean
  createdAt?: string
  updatedAt?: string
}

interface LocalPage {
  id: string
  workspaceId: string
  spaceId: string
  title: string
  type: string
  content?: string
  createdAt?: string
  updatedAt?: string
}

interface LocalTask {
  id: string | number
  title: string
  description?: string
  colId?: string
  status?: string
  priority?: string
  tag?: string
  assignee?: string
  workspaceId?: string
  startDate?: string
  endDate?: string
  color?: string
  notes?: string
  createdAt?: string
}

interface LocalTaskSettings {
  projects?: Array<{ id: string; label: string; color?: string }>
  assignees?: unknown[]
  labels?: unknown[]
  priorities?: unknown[]
  statuses?: unknown[]
}

function parseJson<T>(value: string | null | undefined, fallback: T): T {
  if (!value) return fallback

  try {
    return JSON.parse(value) as T
  } catch {
    return fallback
  }
}

function toDate(value: string | undefined | null) {
  if (!value || value === '—') return null
  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? null : date
}

function timestamp(value: string | undefined) {
  return toDate(value) ?? new Date()
}

function toPageType(type: string) {
  const normalized = type.toLowerCase()
  if (normalized === 'blank') return PageType.BLANK
  if (normalized === 'board') return PageType.BOARD
  if (normalized === 'database') return PageType.DATABASE
  if (normalized === 'tasks') return PageType.TASKS
  return PageType.TEXT
}

function getBoardBackupContent(page: LocalPage, backup: LocalBackup) {
  if (page.type !== 'board') return page.content ?? ''

  const databaseName = `TLDRAW_DOCUMENT_v2workspace-page-${page.id}`
  const dump = backup.indexedDB?.find(database => database.name === databaseName)
  if (!dump) return page.content ?? ''

  return JSON.stringify({
    storage: 'tldraw-indexeddb-backup-v1',
    databaseName,
    dump,
  })
}

function inferWorkspaces(
  localWorkspaces: LocalWorkspace[],
  spaces: LocalSpace[],
  pages: LocalPage[],
  tasks: LocalTask[],
  settings: LocalTaskSettings,
) {
  const byId = new Map<string, LocalWorkspace>()

  localWorkspaces.forEach(workspace => byId.set(workspace.id, workspace))
  settings.projects?.forEach(project => {
    if (!byId.has(project.id)) {
      byId.set(project.id, {
        id: project.id,
        name: project.label,
        color: project.color,
      })
    }
  })

  for (const workspaceId of [
    ...spaces.map(space => space.workspaceId),
    ...pages.map(page => page.workspaceId),
    ...tasks.map(task => task.workspaceId).filter(Boolean),
  ]) {
    if (workspaceId && !byId.has(workspaceId)) {
      byId.set(workspaceId, {
        id: workspaceId,
        name: workspaceId === 'job-1' ? 'Trabajo 1' : workspaceId,
        color: '#6472EB',
      })
    }
  }

  return Array.from(byId.values())
}

async function main() {
  const backupPath = process.argv[2]
  if (!backupPath) throw new Error('Usage: npm run import:backup -- <backup-json-path>')

  const backup = parseJson<LocalBackup>(await readFile(backupPath, 'utf8'), {})
  const storage = backup.localStorage ?? {}

  const settings = parseJson<LocalTaskSettings>(storage.gt_task_settings, {})
  const spaces = parseJson<LocalSpace[]>(storage.gt_workspace_spaces, [])
  const pages = parseJson<LocalPage[]>(storage.gt_workspace_pages, [])
  const tasks = parseJson<LocalTask[]>(storage.gt_tasks, [])
  const localWorkspaces = parseJson<LocalWorkspace[]>(storage.gt_workspaces, [])
  const activeWorkspaceId = storage.gt_active_workspace ?? 'job-1'
  const workspaces = inferWorkspaces(localWorkspaces, spaces, pages, tasks, settings)

  const passwordHash = await bcrypt.hash('12345678', 12)
  const user = await prisma.user.upsert({
    where: { email: 'martin.local@gestion-tareas.dev' },
    create: {
      email: 'martin.local@gestion-tareas.dev',
      name: 'Martin Nauca Gamboa',
      passwordHash,
    },
    update: {
      name: 'Martin Nauca Gamboa',
    },
  })

  await prisma.$transaction(async tx => {
    for (const workspace of workspaces) {
      await tx.workspace.upsert({
        where: { id: workspace.id },
        create: {
          id: workspace.id,
          name: workspace.name,
          color: workspace.color ?? '#6472EB',
          members: {
            create: {
              userId: user.id,
              role: 'OWNER',
            },
          },
        },
        update: {
          name: workspace.name,
          color: workspace.color ?? '#6472EB',
        },
      })

      await tx.workspaceMember.upsert({
        where: { userId_workspaceId: { userId: user.id, workspaceId: workspace.id } },
        create: {
          userId: user.id,
          workspaceId: workspace.id,
          role: 'OWNER',
        },
        update: {
          role: 'OWNER',
        },
      })
    }

    const pendingSpaces = [...spaces]
    const insertedSpaces = new Set<string>()

    while (pendingSpaces.length) {
      const before = pendingSpaces.length

      for (let index = pendingSpaces.length - 1; index >= 0; index -= 1) {
        const space = pendingSpaces[index]
        if (space.parentId && !insertedSpaces.has(space.parentId) && spaces.some(item => item.id === space.parentId)) {
          continue
        }

        await tx.space.upsert({
          where: { id: space.id },
          create: {
            id: space.id,
            workspaceId: space.workspaceId,
            parentId: space.parentId,
            name: space.name,
            icon: space.icon ?? 'folder',
            iconColor: space.iconColor ?? '#6472EB',
            description: space.description ?? '',
            archived: Boolean(space.archived),
            archivedAt: toDate(space.archivedAt),
            collapsed: Boolean(space.collapsed),
            createdAt: timestamp(space.createdAt),
            updatedAt: timestamp(space.updatedAt),
          },
          update: {
            parentId: space.parentId,
            name: space.name,
            icon: space.icon ?? 'folder',
            iconColor: space.iconColor ?? '#6472EB',
            description: space.description ?? '',
            archived: Boolean(space.archived),
            archivedAt: toDate(space.archivedAt),
            collapsed: Boolean(space.collapsed),
            updatedAt: timestamp(space.updatedAt),
          },
        })

        insertedSpaces.add(space.id)
        pendingSpaces.splice(index, 1)
      }

      if (pendingSpaces.length === before) {
        throw new Error(`Could not resolve parent spaces: ${pendingSpaces.map(space => space.id).join(', ')}`)
      }
    }

    for (const page of pages) {
      await tx.page.upsert({
        where: { id: page.id },
        create: {
          id: page.id,
          workspaceId: page.workspaceId,
          spaceId: page.spaceId,
          title: page.title,
          type: toPageType(page.type),
          content: getBoardBackupContent(page, backup),
          createdAt: timestamp(page.createdAt),
          updatedAt: timestamp(page.updatedAt),
        },
        update: {
          spaceId: page.spaceId,
          title: page.title,
          type: toPageType(page.type),
          content: getBoardBackupContent(page, backup),
          updatedAt: timestamp(page.updatedAt),
        },
      })
    }

    for (const workspace of workspaces) {
      await tx.taskSettings.upsert({
        where: { workspaceId: workspace.id },
        create: {
          workspaceId: workspace.id,
          projects: settings.projects ?? [],
          assignees: settings.assignees ?? [],
          labels: settings.labels ?? [],
          priorities: settings.priorities ?? [],
          statuses: settings.statuses ?? [],
        },
        update: {
          projects: settings.projects ?? [],
          assignees: settings.assignees ?? [],
          labels: settings.labels ?? [],
          priorities: settings.priorities ?? [],
          statuses: settings.statuses ?? [],
        },
      })
    }

    for (const task of tasks) {
      const workspaceId = task.workspaceId ?? activeWorkspaceId

      await tx.task.upsert({
        where: { id: String(task.id) },
        create: {
          id: String(task.id),
          workspaceId,
          title: task.title,
          description: task.description ?? '',
          status: task.colId ?? task.status ?? 'pendiente',
          priority: task.priority ?? 'Media',
          tag: task.tag ?? 'General',
          startDate: toDate(task.startDate),
          endDate: toDate(task.endDate),
          color: task.color,
          notes: task.notes ?? '',
          createdById: user.id,
          createdAt: timestamp(task.createdAt),
          updatedAt: new Date(),
        },
        update: {
          workspaceId,
          title: task.title,
          description: task.description ?? '',
          status: task.colId ?? task.status ?? 'pendiente',
          priority: task.priority ?? 'Media',
          tag: task.tag ?? 'General',
          startDate: toDate(task.startDate),
          endDate: toDate(task.endDate),
          color: task.color,
          notes: task.notes ?? '',
          updatedAt: new Date(),
        },
      })
    }
  })

  console.log(`Imported ${workspaces.length} workspaces`)
  console.log(`Imported ${spaces.length} spaces`)
  console.log(`Imported ${pages.length} pages`)
  console.log(`Imported ${tasks.length} tasks`)
  console.log(`Imported tldraw backups for ${pages.filter(page => page.type === 'board').length} board pages`)
}

main()
  .catch(error => {
    console.error(error)
    process.exitCode = 1
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
