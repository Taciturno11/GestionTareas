import type { Request, Response } from 'express'
import { HttpError } from '../../shared/utils/http-error.js'
import { validateBody } from '../../shared/validators/request.js'
import { loginSchema, registerSchema } from './auth.dto.js'
import * as authService from './auth.service.js'

function requireUserId(req: Request) {
  if (!req.user) throw new HttpError(401, 'Unauthorized')
  return req.user.id
}

export async function register(req: Request, res: Response) {
  const dto = validateBody(req, registerSchema)
  const result = await authService.register(dto)
  res.status(201).json(result)
}

export async function login(req: Request, res: Response) {
  const dto = validateBody(req, loginSchema)
  const result = await authService.login(dto)
  res.json(result)
}

export async function me(req: Request, res: Response) {
  const user = await authService.getAuthenticatedUser(requireUserId(req))
  res.json({ user })
}
