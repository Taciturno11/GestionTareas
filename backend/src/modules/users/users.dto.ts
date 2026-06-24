import { z } from 'zod'

export const updateUserSchema = z.object({
  name: z.string().min(2).max(120).optional(),
  avatarUrl: z.string()
    .max(90_000)
    .refine(value => value.startsWith('data:image/webp;base64,'), 'Avatar must be a WebP data URL')
    .nullable()
    .optional(),
})

export type UpdateUserDto = z.infer<typeof updateUserSchema>
