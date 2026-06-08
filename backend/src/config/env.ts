import dotenv from 'dotenv'
import { z } from 'zod'

dotenv.config()

const booleanFromString = z.preprocess((value) => {
  if (typeof value === 'boolean') return value
  if (typeof value === 'string') {
    const normalized = value.trim().toLowerCase()
    if (normalized === 'true') return true
    if (normalized === 'false') return false
  }

  return value
}, z.boolean())

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  DATABASE_URL: z.string().min(1, 'DATABASE_URL is required'),
  PORT: z.coerce.number().int().positive().default(4000),
  JWT_SECRET: z.string().min(16, 'JWT_SECRET must be at least 16 characters'),
  JWT_EXPIRES_IN: z.string().default('7d'),
  SMTP_HOST: z.string().default('smtp.gmail.com'),
  SMTP_PORT: z.coerce.number().int().positive().default(465),
  SMTP_SECURE: booleanFromString.default(true),
  SMTP_USER: z.string().default(''),
  SMTP_PASS: z.string().default(''),
  SMTP_FROM_EMAIL: z.string().default(''),
  SMTP_FROM_NAME: z.string().default('Unitek Signage'),
  AUTH_OTP_TTL_MINUTES: z.coerce.number().int().min(1).max(30).default(10),
  AUTH_OTP_LENGTH: z.coerce.number().int().min(4).max(8).default(6),
  AUTH_OTP_MAX_ATTEMPTS: z.coerce.number().int().min(1).max(10).default(5),
  AUTH_OTP_RESEND_COOLDOWN_SECONDS: z.coerce.number().int().min(0).max(600).default(60),
  AUTH_OTP_PEPPER: z.string().default(''),
})

export const env = envSchema.parse(process.env)
