import { assertWorkspaceMember, assertWorkspaceOwner } from '../../shared/utils/access.js'
import { HttpError } from '../../shared/utils/http-error.js'
import type { CreateProjectDto, UpdateProjectDto } from './projects.dto.js'
import * as projectsRepository from './projects.repository.js'

async function requireProject(id: string) {
  const project = await projectsRepository.findById(id)
  if (!project) throw new HttpError(404, 'Project not found')
  return project
}

async function assertUniqueName(workspaceId: string, name: string, currentId?: string) {
  const existing = await projectsRepository.findByWorkspaceAndName(workspaceId, name)
  if (existing && existing.id !== currentId) {
    throw new HttpError(409, 'A project with this name already exists')
  }
}

export async function list(userId: string, workspaceId: string, includeArchived: boolean) {
  await assertWorkspaceMember(userId, workspaceId)
  return projectsRepository.findMany(workspaceId, includeArchived)
}

export async function create(userId: string, dto: CreateProjectDto) {
  await assertWorkspaceOwner(userId, dto.workspaceId)
  await assertUniqueName(dto.workspaceId, dto.name)
  return projectsRepository.create(dto)
}

export async function update(userId: string, id: string, dto: UpdateProjectDto) {
  const project = await requireProject(id)
  await assertWorkspaceOwner(userId, project.workspaceId)
  if (dto.name) await assertUniqueName(project.workspaceId, dto.name, project.id)
  return projectsRepository.update(id, dto)
}

export async function archive(userId: string, id: string) {
  const project = await requireProject(id)
  await assertWorkspaceOwner(userId, project.workspaceId)
  return projectsRepository.archive(id)
}

export async function restore(userId: string, id: string) {
  const project = await requireProject(id)
  await assertWorkspaceOwner(userId, project.workspaceId)
  return projectsRepository.restore(id)
}
