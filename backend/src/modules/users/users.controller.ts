import type { Request, Response } from 'express'
import { HttpError } from '../../shared/utils/http-error.js'
import { validateBody } from '../../shared/validators/request.js'
import { updateUserSchema } from './users.dto.js'
import * as usersService from './users.service.js'

function requireUserId(req: Request) {
  if (!req.user) throw new HttpError(401, 'Unauthorized')
  return req.user.id
}

export async function getProfile(req: Request, res: Response) {
  const user = await usersService.getProfile(requireUserId(req))
  res.json(user)
}

export async function updateProfile(req: Request, res: Response) {
  const dto = validateBody(req, updateUserSchema)
  const user = await usersService.updateProfile(requireUserId(req), dto)
  res.json(user)
}
