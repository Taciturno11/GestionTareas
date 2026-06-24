import { prisma } from '../../database/prisma.js'

const selectPublicUser = {
  id: true,
  email: true,
  name: true,
  role: true,
  avatarUrl: true,
}

function friendshipPair(userId: string, friendId: string) {
  return userId < friendId
    ? { userAId: userId, userBId: friendId }
    : { userAId: friendId, userBId: userId }
}

export function normalizeFriendshipPair(userId: string, friendId: string) {
  return friendshipPair(userId, friendId)
}

export function findUserByEmail(email: string) {
  return prisma.user.findUnique({
    where: { email },
    select: selectPublicUser,
  })
}

export function findFriendship(userId: string, friendId: string) {
  return prisma.friendship.findUnique({
    where: { userAId_userBId: friendshipPair(userId, friendId) },
  })
}

export async function areFriends(userId: string, friendId: string) {
  return Boolean(await findFriendship(userId, friendId))
}

export function findPendingRequestBetween(userId: string, friendId: string) {
  return prisma.friendRequest.findFirst({
    where: {
      status: 'PENDING',
      OR: [
        { requesterId: userId, recipientId: friendId },
        { requesterId: friendId, recipientId: userId },
      ],
    },
  })
}

export function createRequest(requesterId: string, recipientId: string) {
  return prisma.friendRequest.create({
    data: { requesterId, recipientId },
    include: {
      requester: { select: selectPublicUser },
      recipient: { select: selectPublicUser },
    },
  })
}

export function listIncomingRequests(userId: string) {
  return prisma.friendRequest.findMany({
    where: { recipientId: userId, status: 'PENDING' },
    orderBy: { createdAt: 'desc' },
    include: {
      requester: { select: selectPublicUser },
      recipient: { select: selectPublicUser },
    },
  })
}

export function listOutgoingRequests(userId: string) {
  return prisma.friendRequest.findMany({
    where: { requesterId: userId, status: 'PENDING' },
    orderBy: { createdAt: 'desc' },
    include: {
      requester: { select: selectPublicUser },
      recipient: { select: selectPublicUser },
    },
  })
}

export function findRequestById(id: string) {
  return prisma.friendRequest.findUnique({
    where: { id },
    include: {
      requester: { select: selectPublicUser },
      recipient: { select: selectPublicUser },
    },
  })
}

export function acceptRequest(id: string, requesterId: string, recipientId: string) {
  const pair = friendshipPair(requesterId, recipientId)

  return prisma.$transaction(async tx => {
    const friendship = await tx.friendship.upsert({
      where: { userAId_userBId: pair },
      update: {},
      create: pair,
    })

    const request = await tx.friendRequest.update({
      where: { id },
      data: {
        status: 'ACCEPTED',
        respondedAt: new Date(),
      },
      include: {
        requester: { select: selectPublicUser },
        recipient: { select: selectPublicUser },
      },
    })

    await tx.friendRequest.updateMany({
      where: {
        id: { not: id },
        status: 'PENDING',
        OR: [
          { requesterId, recipientId },
          { requesterId: recipientId, recipientId: requesterId },
        ],
      },
      data: {
        status: 'CANCELED',
        respondedAt: new Date(),
      },
    })

    return { request, friendship }
  })
}

export function rejectRequest(id: string) {
  return prisma.friendRequest.update({
    where: { id },
    data: {
      status: 'REJECTED',
      respondedAt: new Date(),
    },
    include: {
      requester: { select: selectPublicUser },
      recipient: { select: selectPublicUser },
    },
  })
}

export function cancelRequest(id: string) {
  return prisma.friendRequest.update({
    where: { id },
    data: {
      status: 'CANCELED',
      respondedAt: new Date(),
    },
    include: {
      requester: { select: selectPublicUser },
      recipient: { select: selectPublicUser },
    },
  })
}

export function listFriends(userId: string, query = '') {
  const normalized = query.trim()

  return prisma.friendship.findMany({
    where: {
      OR: [
        {
          userAId: userId,
          ...(normalized
            ? {
                userB: {
                  OR: [
                    { name: { contains: normalized, mode: 'insensitive' } },
                    { email: { contains: normalized, mode: 'insensitive' } },
                  ],
                },
              }
            : {}),
        },
        {
          userBId: userId,
          ...(normalized
            ? {
                userA: {
                  OR: [
                    { name: { contains: normalized, mode: 'insensitive' } },
                    { email: { contains: normalized, mode: 'insensitive' } },
                  ],
                },
              }
            : {}),
        },
      ],
    },
    orderBy: { createdAt: 'desc' },
    include: {
      userA: { select: selectPublicUser },
      userB: { select: selectPublicUser },
    },
  })
}

export function removeFriendship(userId: string, friendId: string) {
  return prisma.friendship.delete({
    where: { userAId_userBId: friendshipPair(userId, friendId) },
  })
}
