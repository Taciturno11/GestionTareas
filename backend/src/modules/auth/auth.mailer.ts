import nodemailer from 'nodemailer'
import { env } from '../../config/env.js'
import { HttpError } from '../../shared/utils/http-error.js'
import { buildLoginOtpEmail } from './auth.templates.js'

const transporter = nodemailer.createTransport({
  host: env.SMTP_HOST,
  port: env.SMTP_PORT,
  secure: env.SMTP_SECURE,
  auth: env.SMTP_USER && env.SMTP_PASS
    ? {
        user: env.SMTP_USER,
        pass: env.SMTP_PASS,
      }
    : undefined,
})

export function isEmailOtpConfigured() {
  return Boolean(
    env.SMTP_HOST
    && env.SMTP_PORT
    && env.SMTP_USER
    && env.SMTP_PASS
    && env.SMTP_FROM_EMAIL,
  )
}

export function ensureEmailOtpConfigured() {
  if (!isEmailOtpConfigured()) {
    throw new HttpError(503, 'Email two-factor authentication is not available')
  }
}

export async function sendLoginOtpEmail(input: { to: string; name: string; code: string }) {
  ensureEmailOtpConfigured()

  const message = buildLoginOtpEmail({
    productName: env.SMTP_FROM_NAME || 'Unitek Signage',
    name: input.name,
    code: input.code,
    ttlMinutes: env.AUTH_OTP_TTL_MINUTES,
  })

  try {
    await transporter.sendMail({
      from: `"${env.SMTP_FROM_NAME}" <${env.SMTP_FROM_EMAIL}>`,
      to: input.to,
      subject: message.subject,
      text: message.text,
      html: message.html,
    })
  } catch (error) {
    console.error('OTP email delivery failed', error)
    throw new HttpError(503, 'Could not send verification code')
  }
}
