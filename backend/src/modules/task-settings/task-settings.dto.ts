import { z } from 'zod'

const optionSchema = z.record(z.string(), z.unknown())

export const getTaskSettingsQuerySchema = z.object({
  workspaceId: z.string().min(1),
})

export const upsertTaskSettingsSchema = z.object({
  workspaceId: z.string().min(1),
  projects: z.array(optionSchema),
  assignees: z.array(optionSchema),
  labels: z.array(optionSchema),
  priorities: z.array(optionSchema),
  statuses: z.array(optionSchema),
})

export type GetTaskSettingsQuery = z.infer<typeof getTaskSettingsQuerySchema>
export type UpsertTaskSettingsDto = z.infer<typeof upsertTaskSettingsSchema>
