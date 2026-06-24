import { z } from 'zod'

export const createFriendRequestSchema = z.object({
  email: z.string().trim().toLowerCase().email(),
})

export type CreateFriendRequestDto = z.infer<typeof createFriendRequestSchema>
