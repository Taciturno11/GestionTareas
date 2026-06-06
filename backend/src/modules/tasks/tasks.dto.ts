import { z } from 'zod'

const optionalDateSchema = z.string().min(1).nullable().optional()

export const listTasksQuerySchema = z.object({
  workspaceId: z.string().min(1),
  pageId: z.string().min(1).optional(),
})

export const createTaskSchema = z.object({
  id: z.string().min(1).optional(),
  workspaceId: z.string().min(1),
  pageId: z.string().min(1).nullable().optional(),
  title: z.string().min(1).max(240),
  description: z.string().default(''),
  status: z.string().min(1),
  priority: z.string().min(1),
  projectId: z.string().min(1).nullable().optional(),
  tag: z.string().default('General'),
  assigneeId: z.string().min(1).nullable().optional(),
  startDate: optionalDateSchema,
  endDate: optionalDateSchema,
  color: z.string().nullable().optional(),
  notes: z.string().default(''),
})

export const updateTaskSchema = createTaskSchema.omit({ workspaceId: true }).partial()

export type ListTasksQuery = z.infer<typeof listTasksQuerySchema>
export type CreateTaskDto = z.infer<typeof createTaskSchema>
export type UpdateTaskDto = z.infer<typeof updateTaskSchema>
