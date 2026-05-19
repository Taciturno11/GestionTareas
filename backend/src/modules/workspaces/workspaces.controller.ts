import type { Request, Response } from 'express'
import { HttpError } from '../../shared/utils/http-error.js'
import { getParam, validateBody } from '../../shared/validators/request.js'
import { createWorkspaceSchema, updateWorkspaceSchema } from './workspaces.dto.js'
import * as workspacesService from './workspaces.service.js'

function requireUserId(req: Request) {
  if (!req.user) throw new HttpError(401, 'Unauthorized')
  return req.user.id
}

export async function list(req: Request, res: Response) {
  res.json(await workspacesService.list(requireUserId(req)))
}

export async function get(req: Request, res: Response) {
  res.json(await workspacesService.get(requireUserId(req), getParam(req, 'id')))
}

export async function create(req: Request, res: Response) {
  const dto = validateBody(req, createWorkspaceSchema)
  res.status(201).json(await workspacesService.create(requireUserId(req), dto))
}

export async function update(req: Request, res: Response) {
  const dto = validateBody(req, updateWorkspaceSchema)
  res.json(await workspacesService.update(requireUserId(req), getParam(req, 'id'), dto))
}

export async function remove(req: Request, res: Response) {
  await workspacesService.remove(requireUserId(req), getParam(req, 'id'))
  res.status(204).send()
}
