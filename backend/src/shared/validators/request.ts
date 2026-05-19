import type { Request } from 'express'
import type { ZodType } from 'zod'
import { HttpError } from '../utils/http-error.js'

export function validateBody<T>(req: Request, schema: ZodType<T>) {
  return schema.parse(req.body)
}

export function validateQuery<T>(req: Request, schema: ZodType<T>) {
  return schema.parse(req.query)
}

export function getParam(req: Request, key: string) {
  const value = req.params[key]
  if (!value || Array.isArray(value)) throw new HttpError(400, `Invalid route param: ${key}`)
  return value
}
