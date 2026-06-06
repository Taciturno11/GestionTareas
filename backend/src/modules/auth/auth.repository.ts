import type { Prisma } from '@prisma/client'
import { prisma } from '../../database/prisma.js'

const publicUserSelect = {
  id: true,
  email: true,
  name: true,
  role: true,
  twoFactorEnabled: true,
  twoFactorMethod: true,
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
      role: data.role ?? 'cliente',
    },
    select: publicUserSelect,
  })
}

export function updateTwoFactor(userId: string, enabled: boolean) {
  return prisma.user.update({
    where: { id: userId },
    data: {
      twoFactorEnabled: enabled,
      twoFactorMethod: enabled ? 'email' : null,
    },
    select: publicUserSelect,
  })
}

export function invalidateActiveOtpChallenges(userId: string) {
  return prisma.loginOtpChallenge.updateMany({
    where: {
      userId,
      consumedAt: null,
      expiresAt: { gt: new Date() },
    },
    data: {
      consumedAt: new Date(),
    },
  })
}

export function createOtpChallenge(data: {
  userId: string
  email: string
  codeHash: string
  expiresAt: Date
  lastSentAt: Date
  ipAddress?: string | null
  userAgent?: string | null
}) {
  return prisma.loginOtpChallenge.create({
    data,
  })
}

export function deleteOtpChallenge(id: string) {
  return prisma.loginOtpChallenge.delete({
    where: { id },
  })
}

export function findOtpChallengeById(id: string) {
  return prisma.loginOtpChallenge.findUnique({
    where: { id },
    include: {
      user: {
        select: publicUserSelect,
      },
    },
  })
}

export function refreshOtpChallenge(id: string, data: { codeHash: string; expiresAt: Date; lastSentAt: Date }) {
  return prisma.loginOtpChallenge.update({
    where: { id },
    data: {
      codeHash: data.codeHash,
      expiresAt: data.expiresAt,
      lastSentAt: data.lastSentAt,
      resendCount: { increment: 1 },
      consumedAt: null,
    },
    include: {
      user: {
        select: publicUserSelect,
      },
    },
  })
}

export function recordFailedOtpAttempt(id: string, attemptsCount: number, lockChallenge: boolean) {
  return prisma.loginOtpChallenge.update({
    where: { id },
    data: {
      attemptsCount,
      consumedAt: lockChallenge ? new Date() : undefined,
    },
  })
}

export function consumeOtpChallenge(id: string) {
  return prisma.loginOtpChallenge.update({
    where: { id },
    data: {
      consumedAt: new Date(),
    },
  })
}
