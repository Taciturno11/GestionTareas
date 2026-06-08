import type { Prisma } from '@prisma/client'
import { WorkspaceRole } from '@prisma/client'
import { prisma } from '../../database/prisma.js'
import type { CreateAdminUserDto } from './admin-users.dto.js'

export const adminUserSelect = {
  id: true,
  name: true,
  email: true,
  role: true,
  createdAt: true,
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
  return prisma.user.create({
    data: {
      name: data.name,
      email: data.email,
      role: data.role,
      passwordHash: data.passwordHash,
      memberships: {
        create: {
          role: WorkspaceRole.OWNER,
          workspace: {
            create: {
              name: 'Mi workspace',
              color: '#6472EB',
              spaces: {
                create: {
                  name: 'General',
                  icon: 'folder',
                  iconColor: '#6472EB',
                },
              },
            },
          },
        },
      },
    },
    select: adminUserSelect,
  })
}
