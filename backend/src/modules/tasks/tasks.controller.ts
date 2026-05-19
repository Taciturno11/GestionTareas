import type { Request, Response } from 'express'
import { HttpError } from '../../shared/utils/http-error.js'
import { getParam, validateBody, validateQuery } from '../../shared/validators/request.js'
import { createTaskSchema, listTasksQuerySchema, updateTaskSchema } from './tasks.dto.js'
import * as tasksService from './tasks.service.js'

function requireUserId(req: Request) {
  if (!req.user) throw new HttpError(401, 'Unauthorized')
  return req.user.id
}


//Funciones Asincronas que hace el controlador de tareas, cada una de ellas se encarga de validar la entrada, 
// llamar al servicio correspondiente y enviar la respuesta adecuada.
export async function list(req: Request, res: Response) {
  const query = validateQuery(req, listTasksQuerySchema)
  res.json(await tasksService.list(requireUserId(req), query.workspaceId, query.pageId))
}

export async function create(req: Request, res: Response) {
  const dto = validateBody(req, createTaskSchema)
  res.status(201).json(await tasksService.create(requireUserId(req), dto))
}

export async function update(req: Request, res: Response) {
  const dto = validateBody(req, updateTaskSchema)
  res.json(await tasksService.update(requireUserId(req), getParam(req, 'id'), dto))
}

export async function remove(req: Request, res: Response) {
  await tasksService.remove(requireUserId(req), getParam(req, 'id'))
  res.status(204).send()
}
