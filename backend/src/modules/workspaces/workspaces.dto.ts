import { z } from 'zod'

export const createWorkspaceSchema = z.object({
  id: z.string().min(1).optional(),
  name: z.string().min(2).max(120),
  color: z.string().min(1).default('#6472EB'),
})

export const updateWorkspaceSchema = createWorkspaceSchema.partial()

export type CreateWorkspaceDto = z.infer<typeof createWorkspaceSchema>
export type UpdateWorkspaceDto = z.infer<typeof updateWorkspaceSchema>
