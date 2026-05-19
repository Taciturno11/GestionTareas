import type { Request, Response } from 'express'
import { HttpError } from '../../shared/utils/http-error.js'
import { getParam, validateBody, validateQuery } from '../../shared/validators/request.js'
import { createSpaceSchema, listSpacesQuerySchema, updateSpaceSchema } from './spaces.dto.js'
import * as spacesService from './spaces.service.js'

function requireUserId(req: Request) {
  if (!req.user) throw new HttpError(401, 'Unauthorized')
  return req.user.id
}

export async function list(req: Request, res: Response) {
  const query = validateQuery(req, listSpacesQuerySchema)
  res.json(await spacesService.list(requireUserId(req), query.workspaceId))
}

export async function create(req: Request, res: Response) {
  const dto = validateBody(req, createSpaceSchema)
  res.status(201).json(await spacesService.create(requireUserId(req), dto))
}

export async function update(req: Request, res: Response) {
  const dto = validateBody(req, updateSpaceSchema)
  res.json(await spacesService.update(requireUserId(req), getParam(req, 'id'), dto))
}

export async function archive(req: Request, res: Response) {
  res.json(await spacesService.archive(requireUserId(req), getParam(req, 'id')))
}

export async function restore(req: Request, res: Response) {
  res.json(await spacesService.restore(requireUserId(req), getParam(req, 'id')))
}

export async function remove(req: Request, res: Response) {
  await spacesService.remove(requireUserId(req), getParam(req, 'id'))
  res.status(204).send()
}
