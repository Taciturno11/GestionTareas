import { z } from 'zod'

export const adminUserRoleSchema = z.enum(['admin', 'usuario'])

export const createAdminUserSchema = z.object({
  name: z.string().trim().min(2).max(120),
  email: z.string().trim().email(),
  password: z.string().min(5).max(120),
  role: adminUserRoleSchema,
})

export type CreateAdminUserDto = z.infer<typeof createAdminUserSchema>
