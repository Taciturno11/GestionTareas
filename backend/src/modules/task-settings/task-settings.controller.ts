import type { Request, Response } from 'express'
import { HttpError } from '../../shared/utils/http-error.js'
import { validateBody, validateQuery } from '../../shared/validators/request.js'
import { getTaskSettingsQuerySchema, upsertTaskSettingsSchema } from './task-settings.dto.js'
import * as taskSettingsService from './task-settings.service.js'

function requireUserId(req: Request) {
  if (!req.user) throw new HttpError(401, 'Unauthorized')
  return req.user.id
}

export async function get(req: Request, res: Response) {
  const query = validateQuery(req, getTaskSettingsQuerySchema)
  res.json(await taskSettingsService.get(requireUserId(req), query.workspaceId))
}

export async function upsert(req: Request, res: Response) {
  const dto = validateBody(req, upsertTaskSettingsSchema)
  res.json(await taskSettingsService.upsert(requireUserId(req), dto))
}
