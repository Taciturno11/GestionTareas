import { z } from 'zod'

export const registerSchema = z.object({
  email: z.string().email(),
  name: z.string().min(2).max(120),
  password: z.string().min(8).max(120),
})

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
})

export const verifyLoginOtpSchema = z.object({
  challengeId: z.string().min(1),
  code: z.string().trim().regex(/^\d{4,8}$/, 'OTP code must contain 4 to 8 digits'),
})

export const resendLoginOtpSchema = z.object({
  challengeId: z.string().min(1),
})

export const updateTwoFactorSchema = z.object({
  enabled: z.boolean(),
})

export type RegisterDto = z.infer<typeof registerSchema>
export type LoginDto = z.infer<typeof loginSchema>
export type VerifyLoginOtpDto = z.infer<typeof verifyLoginOtpSchema>
export type ResendLoginOtpDto = z.infer<typeof resendLoginOtpSchema>
export type UpdateTwoFactorDto = z.infer<typeof updateTwoFactorSchema>
