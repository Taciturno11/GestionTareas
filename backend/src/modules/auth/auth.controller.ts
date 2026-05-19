import type { Request, Response } from 'express'
import { validateBody } from '../../shared/validators/request.js'
import { loginSchema, registerSchema } from './auth.dto.js'
import * as authService from './auth.service.js'

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
  res.json({ user: req.user })
}
