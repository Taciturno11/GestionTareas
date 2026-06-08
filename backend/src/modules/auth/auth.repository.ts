import type { Prisma } from '@prisma/client'
import { prisma } from '../../database/prisma.js'

const publicUserSelect = {
  id: true,
  email: true,
  name: true,
  role: true,
} satisfies Prisma.UserSelect

const authUserSelect = {
  ...publicUserSelect,
  passwordHash: true,
} satisfies Prisma.UserSelect

export function findPublicUserById(id: string) {
  return prisma.user.findUnique({
    where: { id },
    select: publicUserSelect,
  })
}

export function findUserForAuthentication(email: string) {
  return prisma.user.findUnique({
    where: { email },
    select: authUserSelect,
  })
}

export function createUser(data: { email: string; name: string; passwordHash: string; role?: string }) {
  return prisma.user.create({
    data: {
      email: data.email,
      name: data.name,
      passwordHash: data.passwordHash,
      role: data.role ?? 'usuario',
    },
    select: publicUserSelect,
  })
}
