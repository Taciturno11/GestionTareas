import { z } from 'zod'

export const listProjectsQuerySchema = z.object({
  workspaceId: z.string().min(1),
  includeArchived: z.enum(['true', 'false'])
    .transform(value => value === 'true')
    .default(false),
})

export const createProjectSchema = z.object({
  workspaceId: z.string().min(1),
  name: z.string().trim().min(1).max(120),
  color: z.string().regex(/^#[0-9a-fA-F]{6}$/).default('#6472EB'),
})

export const updateProjectSchema = z.object({
  name: z.string().trim().min(1).max(120).optional(),
  color: z.string().regex(/^#[0-9a-fA-F]{6}$/).optional(),
})

export type ListProjectsQuery = z.infer<typeof listProjectsQuerySchema>
export type CreateProjectDto = z.infer<typeof createProjectSchema>
export type UpdateProjectDto = z.infer<typeof updateProjectSchema>
