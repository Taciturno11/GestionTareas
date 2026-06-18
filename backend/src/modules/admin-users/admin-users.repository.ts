import type { Prisma } from '@prisma/client'
import { PageType, WorkspaceRole } from '@prisma/client'
import { prisma } from '../../database/prisma.js'
import type { CreateAdminUserDto } from './admin-users.dto.js'
import { createInitialTaskSettings } from '../task-settings/task-settings.defaults.js'

export const adminUserSelect = {
  id: true,
  name: true,
  email: true,
  role: true,
  createdAt: true,
  personalWorkspace: {
    select: {
      id: true,
      name: true,
      color: true,
    },
  },
} satisfies Prisma.UserSelect

export function findMany() {
  return prisma.user.findMany({
    select: adminUserSelect,
    orderBy: { createdAt: 'asc' },
  })
}

export function findByEmail(email: string) {
  return prisma.user.findUnique({
    where: { email },
    select: { id: true },
  })
}

export function createWithInitialWorkspace(data: CreateAdminUserDto & { passwordHash: string }) {
  const userId = crypto.randomUUID()
  const workspaceId = crypto.randomUUID()
  const spaceId = crypto.randomUUID()
  const initialSettings = createInitialTaskSettings({ id: userId, name: data.name })

  return prisma.$transaction(async transaction => {
    await transaction.user.create({
      data: {
        id: userId,
        name: data.name,
        email: data.email,
        role: data.role,
        passwordHash: data.passwordHash,
      },
    })
    await transaction.workspace.create({
      data: {
        id: workspaceId,
        name: 'Mi workspace',
        color: '#6472EB',
      },
    })
    await transaction.user.update({
      where: { id: userId },
      data: { personalWorkspaceId: workspaceId },
    })
    await transaction.workspaceMember.create({
      data: {
        userId,
        workspaceId,
        role: WorkspaceRole.OWNER,
      },
    })
    await transaction.space.create({
      data: {
        id: spaceId,
        workspaceId,
        name: 'Mi mundo',
        icon: 'folder',
        iconColor: '#6472EB',
      },
    })
    await transaction.page.create({
      data: {
        workspaceId,
        spaceId,
        title: `Bienvenido, ${data.name} !`,
        type: PageType.TEXT,
        content: '',
      },
    })
    await transaction.taskSettings.create({
      data: {
        workspaceId,
        ...initialSettings,
      },
    })

    return transaction.user.findUniqueOrThrow({
      where: { id: userId },
      select: adminUserSelect,
    })
  })
}

export function findPersonalWorkspaceByUserId(userId: string) {
  return prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      name: true,
      personalWorkspace: {
        include: {
          members: true,
        },
      },
    },
  })
}
