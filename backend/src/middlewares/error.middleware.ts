import type { ErrorRequestHandler } from 'express'
import { ZodError } from 'zod'
import { HttpError } from '../shared/utils/http-error.js'

export const errorMiddleware: ErrorRequestHandler = (error, _req, res, next) => {
  void next

  if (error instanceof ZodError) {
    res.status(400).json({
      message: 'Validation error',
      issues: error.issues,
    })
    return
  }

  if (error instanceof HttpError) {
    res.status(error.statusCode).json({ message: error.message })
    return
  }

  console.error(error)
  res.status(500).json({ message: 'Internal server error' })
}
