import { z } from 'zod'

export const spaceShareRoleSchema = z.enum(['VIEWER', 'EDITOR'])

export const createSpaceShareSchema = z.object({
  userId: z.string().min(1),
  role: spaceShareRoleSchema,
})

export const updateSpaceShareSchema = z.object({
  role: spaceShareRoleSchema,
})

export type SpaceShareRoleDto = z.infer<typeof spaceShareRoleSchema>
export type CreateSpaceShareDto = z.infer<typeof createSpaceShareSchema>
export type UpdateSpaceShareDto = z.infer<typeof updateSpaceShareSchema>

