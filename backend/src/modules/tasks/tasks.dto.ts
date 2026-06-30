import { z } from 'zod'

const optionalDateSchema = z.string().min(1).nullable().optional()
const optionalBooleanQuerySchema = z.preprocess(
  value => {
    if (value === undefined) return false
    if (value === 'true' || value === true) return true
    if (value === 'false' || value === false) return false
    return value
  },
  z.boolean(),
)

export const listTasksQuerySchema = z.object({
  workspaceId: z.string().min(1),
  pageId: z.string().min(1).optional(),
  includeArchived: optionalBooleanQuerySchema,
})

export const createTaskSchema = z.object({
  id: z.string().min(1).optional(),
  workspaceId: z.string().min(1),
  pageId: z.string().min(1).nullable().optional(),
  title: z.string().min(1).max(240),
  description: z.string().default(''),
  status: z.string().min(1),
  priority: z.string(),
  projectId: z.string().min(1).nullable().optional(),
  tag: z.string().default('General'),
  assigneeId: z.string().min(1).nullable().optional(),
  startDate: optionalDateSchema,
  endDate: optionalDateSchema,
  color: z.string().nullable().optional(),
  notes: z.string().default(''),
  position: z.number().int().min(0).default(0),
})

export const updateTaskSchema = z.object({
  pageId: z.string().min(1).nullable().optional(),
  title: z.string().min(1).max(240).optional(),
  description: z.string().optional(),
  status: z.string().min(1).optional(),
  priority: z.string().optional(),
  projectId: z.string().min(1).nullable().optional(),
  tag: z.string().optional(),
  assigneeId: z.string().min(1).nullable().optional(),
  startDate: optionalDateSchema,
  endDate: optionalDateSchema,
  color: z.string().nullable().optional(),
  notes: z.string().optional(),
  position: z.number().int().min(0).optional(),
})

export type ListTasksQuery = z.infer<typeof listTasksQuerySchema>
export type CreateTaskDto = z.infer<typeof createTaskSchema>
export type UpdateTaskDto = z.infer<typeof updateTaskSchema>
