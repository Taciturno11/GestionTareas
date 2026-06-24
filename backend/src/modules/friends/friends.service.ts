import { HttpError } from '../../shared/utils/http-error.js'
import type { CreateFriendRequestDto } from './friends.dto.js'
import * as repository from './friends.repository.js'

function toFriendshipResponse(userId: string, friendship: Awaited<ReturnType<typeof repository.listFriends>>[number]) {
  const friend = friendship.userAId === userId ? friendship.userB : friendship.userA
  return {
    id: friendship.id,
    friend,
    createdAt: friendship.createdAt,
  }
}

export function listFriends(userId: string, query = '') {
  return repository.listFriends(userId, query).then(friendships =>
    friendships.map(friendship => toFriendshipResponse(userId, friendship))
  )
}

export async function createRequest(userId: string, dto: CreateFriendRequestDto) {
  const targetUser = await repository.findUserByEmail(dto.email)
  if (!targetUser) throw new HttpError(404, 'No existe un usuario con ese correo')
  if (targetUser.id === userId) throw new HttpError(400, 'No puedes enviarte una solicitud a ti mismo')

  const friendship = await repository.findFriendship(userId, targetUser.id)
  if (friendship) throw new HttpError(409, 'Ya son amigos')

  const pendingRequest = await repository.findPendingRequestBetween(userId, targetUser.id)
  if (pendingRequest) throw new HttpError(409, 'Ya existe una solicitud pendiente entre ustedes')

  return repository.createRequest(userId, targetUser.id)
}

export function listIncomingRequests(userId: string) {
  return repository.listIncomingRequests(userId)
}

export function listOutgoingRequests(userId: string) {
  return repository.listOutgoingRequests(userId)
}

export async function acceptRequest(userId: string, requestId: string) {
  const request = await repository.findRequestById(requestId)
  if (!request) throw new HttpError(404, 'Solicitud no encontrada')
  if (request.recipientId !== userId) throw new HttpError(403, 'No puedes responder esta solicitud')
  if (request.status !== 'PENDING') throw new HttpError(400, 'La solicitud ya fue respondida')

  return repository.acceptRequest(request.id, request.requesterId, request.recipientId)
}

export async function rejectRequest(userId: string, requestId: string) {
  const request = await repository.findRequestById(requestId)
  if (!request) throw new HttpError(404, 'Solicitud no encontrada')
  if (request.recipientId !== userId) throw new HttpError(403, 'No puedes responder esta solicitud')
  if (request.status !== 'PENDING') throw new HttpError(400, 'La solicitud ya fue respondida')

  return repository.rejectRequest(request.id)
}

export async function cancelRequest(userId: string, requestId: string) {
  const request = await repository.findRequestById(requestId)
  if (!request) throw new HttpError(404, 'Solicitud no encontrada')
  if (request.requesterId !== userId) throw new HttpError(403, 'No puedes cancelar esta solicitud')
  if (request.status !== 'PENDING') throw new HttpError(400, 'La solicitud ya fue respondida')

  return repository.cancelRequest(request.id)
}

export async function removeFriend(userId: string, friendId: string) {
  const friendship = await repository.findFriendship(userId, friendId)
  if (!friendship) throw new HttpError(404, 'Amistad no encontrada')
  return repository.removeFriendship(userId, friendId)
}

export function areFriends(userId: string, friendId: string) {
  return repository.areFriends(userId, friendId)
}
