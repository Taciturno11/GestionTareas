import { z } from 'zod'

export const listSpacesQuerySchema = z.object({
  workspaceId: z.string().min(1),
})

export const createSpaceSchema = z.object({
  id: z.string().min(1).optional(),
  workspaceId: z.string().min(1),
  parentId: z.string().min(1).nullable().optional(),
  name: z.string().min(1).max(120),
  icon: z.string().min(1).default('folder'),
  iconColor: z.string().min(1).default('#6472EB'),
  description: z.string().max(10000).optional(),
  archived: z.boolean().optional(),
  archivedAt: z.string().nullable().optional(),
  collapsed: z.boolean().optional(),
})

export const updateSpaceSchema = z.object({
  parentId: z.string().min(1).nullable().optional(),
  name: z.string().min(1).max(120).optional(),
  icon: z.string().min(1).optional(),
  iconColor: z.string().min(1).optional(),
  description: z.string().max(10000).optional(),
  collapsed: z.boolean().optional(),
})

export type ListSpacesQuery = z.infer<typeof listSpacesQuerySchema>
export type CreateSpaceDto = z.infer<typeof createSpaceSchema>
export type UpdateSpaceDto = z.infer<typeof updateSpaceSchema>
