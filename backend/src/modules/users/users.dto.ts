import { z } from 'zod'

export const updateUserSchema = z.object({
  name: z.string().min(2).max(120).optional(),
})

export type UpdateUserDto = z.infer<typeof updateUserSchema>
