import { prisma } from '../../database/prisma.js'
import type { UpdateUserDto } from './users.dto.js'

const selectPublicUser = {
  id: true,
  email: true,
  name: true,
  role: true,
  createdAt: true,
  updatedAt: true,
}

export function findById(id: string) {
  return prisma.user.findUnique({ where: { id }, select: selectPublicUser })
}

export function update(id: string, data: UpdateUserDto) {
  return prisma.user.update({ where: { id }, data, select: selectPublicUser })
}

export function search(query: string, excludeUserId: string) {
  const normalized = query.trim()
  if (normalized.length < 2) return Promise.resolve([])

  return prisma.user.findMany({
    where: {
      id: { not: excludeUserId },
      OR: [
        { name: { contains: normalized, mode: 'insensitive' } },
        { email: { contains: normalized, mode: 'insensitive' } },
      ],
    },
    orderBy: { name: 'asc' },
    take: 10,
    select: selectPublicUser,
  })
}
