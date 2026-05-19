import type { Request, Response } from 'express'
import { HttpError } from '../../shared/utils/http-error.js'
import { getParam, validateBody, validateQuery } from '../../shared/validators/request.js'
import { createPageSchema, listPagesQuerySchema, updatePageSchema } from './pages.dto.js'
import * as pagesService from './pages.service.js'

function requireUserId(req: Request) {
  if (!req.user) throw new HttpError(401, 'Unauthorized')
  return req.user.id
}

export async function list(req: Request, res: Response) {
  const query = validateQuery(req, listPagesQuerySchema)
  res.json(await pagesService.list(requireUserId(req), query.workspaceId, query.spaceId))
}

export async function get(req: Request, res: Response) {
  res.json(await pagesService.get(requireUserId(req), getParam(req, 'id')))
}

export async function create(req: Request, res: Response) {
  const dto = validateBody(req, createPageSchema)
  res.status(201).json(await pagesService.create(requireUserId(req), dto))
}

export async function update(req: Request, res: Response) {
  const dto = validateBody(req, updatePageSchema)
  res.json(await pagesService.update(requireUserId(req), getParam(req, 'id'), dto))
}

export async function remove(req: Request, res: Response) {
  await pagesService.remove(requireUserId(req), getParam(req, 'id'))
  res.status(204).send()
}
