import type { Request, Response } from 'express'
import { HttpError } from '../../shared/utils/http-error.js'
import { getParam, validateBody } from '../../shared/validators/request.js'
import { createFriendRequestSchema } from './friends.dto.js'
import * as friendsService from './friends.service.js'

function requireUserId(req: Request) {
  if (!req.user) throw new HttpError(401, 'Unauthorized')
  return req.user.id
}

export async function listFriends(req: Request, res: Response) {
  const query = typeof req.query.query === 'string' ? req.query.query : ''
  res.json(await friendsService.listFriends(requireUserId(req), query))
}

export async function removeFriend(req: Request, res: Response) {
  await friendsService.removeFriend(requireUserId(req), getParam(req, 'friendId'))
  res.status(204).send()
}

export async function createRequest(req: Request, res: Response) {
  const dto = validateBody(req, createFriendRequestSchema)
  res.status(201).json(await friendsService.createRequest(requireUserId(req), dto))
}

export async function listIncomingRequests(req: Request, res: Response) {
  res.json(await friendsService.listIncomingRequests(requireUserId(req)))
}

export async function listOutgoingRequests(req: Request, res: Response) {
  res.json(await friendsService.listOutgoingRequests(requireUserId(req)))
}

export async function acceptRequest(req: Request, res: Response) {
  res.json(await friendsService.acceptRequest(requireUserId(req), getParam(req, 'requestId')))
}

export async function rejectRequest(req: Request, res: Response) {
  res.json(await friendsService.rejectRequest(requireUserId(req), getParam(req, 'requestId')))
}

export async function cancelRequest(req: Request, res: Response) {
  res.json(await friendsService.cancelRequest(requireUserId(req), getParam(req, 'requestId')))
}
