import { assertWorkspaceMember } from '../../shared/utils/access.js'
import { HttpError } from '../../shared/utils/http-error.js'
import type { CreateTaskDto, UpdateTaskDto } from './tasks.dto.js'
import * as tasksRepository from './tasks.repository.js'

export async function list(userId: string, workspaceId: string, pageId?: string) {
  await assertWorkspaceMember(userId, workspaceId)
  return tasksRepository.findMany(workspaceId, pageId)
}

export async function create(userId: string, dto: CreateTaskDto) {
  await assertWorkspaceMember(userId, dto.workspaceId)
  return tasksRepository.create(userId, dto)
}

export async function update(userId: string, taskId: string, dto: UpdateTaskDto) {
  const task = await tasksRepository.findById(taskId)
  if (!task) throw new HttpError(404, 'Task not found')
  await assertWorkspaceMember(userId, task.workspaceId)
  return tasksRepository.update(taskId, dto)
}

export async function remove(userId: string, taskId: string) {
  const task = await tasksRepository.findById(taskId)
  if (!task) throw new HttpError(404, 'Task not found')
  await assertWorkspaceMember(userId, task.workspaceId)
  return tasksRepository.remove(taskId)
}
