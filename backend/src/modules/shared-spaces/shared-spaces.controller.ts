import type { Request, Response } from 'express'
import { HttpError } from '../../shared/utils/http-error.js'
import { getParam, validateBody } from '../../shared/validators/request.js'
import { createSpaceShareSchema, updateSpaceShareSchema } from './shared-spaces.dto.js'
import * as service from './shared-spaces.service.js'

function requireUserId(req: Request) {
  if (!req.user) throw new HttpError(401, 'Unauthorized')
  return req.user.id
}

export async function listReceived(req: Request, res: Response) {
  res.json(await service.listReceived(requireUserId(req)))
}

export async function listForSpace(req: Request, res: Response) {
  res.json(await service.listForSpace(requireUserId(req), getParam(req, 'spaceId')))
}

export async function create(req: Request, res: Response) {
  const dto = validateBody(req, createSpaceShareSchema)
  res.status(201).json(await service.create(requireUserId(req), getParam(req, 'spaceId'), dto))
}

export async function update(req: Request, res: Response) {
  const dto = validateBody(req, updateSpaceShareSchema)
  res.json(await service.update(
    requireUserId(req),
    getParam(req, 'spaceId'),
    getParam(req, 'shareId'),
    dto,
  ))
}

export async function remove(req: Request, res: Response) {
  await service.remove(requireUserId(req), getParam(req, 'spaceId'), getParam(req, 'shareId'))
  res.status(204).send()
}

