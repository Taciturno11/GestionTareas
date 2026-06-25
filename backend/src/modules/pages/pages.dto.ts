import { z } from 'zod'

export const pageTypeSchema = z.enum(['blank', 'text', 'board', 'database', 'tasks', 'time-report'])

export const listPagesQuerySchema = z.object({
  workspaceId: z.string().min(1),
  spaceId: z.string().min(1).optional(),
  includeContent: z.enum(['true', 'false'])
    .transform(value => value === 'true')
    .default(true),
})

export const createPageSchema = z.object({
  id: z.string().min(1).optional(),
  workspaceId: z.string().min(1),
  spaceId: z.string().min(1),
  title: z.string().min(1).max(200),
  type: pageTypeSchema.default('text'),
  content: z.string().default(''),
})

export const updatePageSchema = z.object({
  spaceId: z.string().min(1).optional(),
  title: z.string().max(200).optional(),
  type: pageTypeSchema.optional(),
  content: z.string().optional(),
})

export type PageTypeDto = z.infer<typeof pageTypeSchema>
export type ListPagesQuery = z.infer<typeof listPagesQuerySchema>
export type CreatePageDto = z.infer<typeof createPageSchema>
export type UpdatePageDto = z.infer<typeof updatePageSchema>
