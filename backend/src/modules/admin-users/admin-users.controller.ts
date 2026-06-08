import type { Request, Response } from 'express'
import { validateBody } from '../../shared/validators/request.js'
import { createAdminUserSchema } from './admin-users.dto.js'
import * as adminUsersService from './admin-users.service.js'

export async function list(_req: Request, res: Response) {
  res.json(await adminUsersService.list())
}

export async function create(req: Request, res: Response) {
  const dto = validateBody(req, createAdminUserSchema)
  res.status(201).json(await adminUsersService.create(dto))
}
