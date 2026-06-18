import type { Request, Response } from 'express'
import { HttpError } from '../../shared/utils/http-error.js'
import { getParam, validateBody, validateQuery } from '../../shared/validators/request.js'
import { createProjectSchema, listProjectsQuerySchema, updateProjectSchema } from './projects.dto.js'
import * as projectsService from './projects.service.js'

function requireUserId(req: Request) {
  if (!req.user) throw new HttpError(401, 'Unauthorized')
  return req.user.id
}

export async function list(req: Request, res: Response) {
  const query = validateQuery(req, listProjectsQuerySchema)
  res.json(await projectsService.list(
    requireUserId(req),
    query.workspaceId,
    query.includeArchived,
  ))
}

export async function create(req: Request, res: Response) {
  const dto = validateBody(req, createProjectSchema)
  res.status(201).json(await projectsService.create(requireUserId(req), dto))
}

export async function update(req: Request, res: Response) {
  const dto = validateBody(req, updateProjectSchema)
  res.json(await projectsService.update(requireUserId(req), getParam(req, 'id'), dto))
}

export async function archive(req: Request, res: Response) {
  res.json(await projectsService.archive(requireUserId(req), getParam(req, 'id')))
}

export async function restore(req: Request, res: Response) {
  res.json(await projectsService.restore(requireUserId(req), getParam(req, 'id')))
}
