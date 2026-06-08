import type { NextFunction, Request, Response } from 'express'
import { prisma } from '../database/prisma.js'
import { HttpError } from '../shared/utils/http-error.js'

export async function requireAdmin(req: Request, _res: Response, next: NextFunction) {
  if (!req.user) {
    next(new HttpError(401, 'Unauthorized'))
    return
  }

  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: { role: true },
    })

    if (!user || user.role !== 'admin') {
      next(new HttpError(403, 'Admin access required'))
      return
    }

    next()
  } catch (error) {
    next(error)
  }
}
