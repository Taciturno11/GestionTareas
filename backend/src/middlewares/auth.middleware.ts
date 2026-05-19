import type { NextFunction, Request, Response } from 'express'
import jwt from 'jsonwebtoken'
import { env } from '../config/env.js'
import { HttpError } from '../shared/utils/http-error.js'

export interface AuthUser {
  id: string
  email: string
}

export function authMiddleware(req: Request, _res: Response, next: NextFunction) {
  const authHeader = req.header('authorization')
  const token = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : null

  if (!token) {
    next(new HttpError(401, 'Missing authorization token'))
    return
  }

  try {
    req.user = jwt.verify(token, env.JWT_SECRET) as AuthUser
    next()
  } catch {
    next(new HttpError(401, 'Invalid authorization token'))
  }
}
