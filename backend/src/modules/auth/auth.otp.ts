import bcrypt from 'bcryptjs'
import { randomInt } from 'node:crypto'
import { env } from '../../config/env.js'

function otpSecret(code: string) {
  return `${code}.${env.AUTH_OTP_PEPPER}`
}

export function generateOtpCode() {
  const max = 10 ** env.AUTH_OTP_LENGTH
  return randomInt(0, max).toString().padStart(env.AUTH_OTP_LENGTH, '0')
}

export function hashOtpCode(code: string) {
  return bcrypt.hash(otpSecret(code), 10)
}

export function compareOtpCode(code: string, codeHash: string) {
  return bcrypt.compare(otpSecret(code), codeHash)
}

export function getOtpExpiryDate(from = new Date()) {
  return new Date(from.getTime() + env.AUTH_OTP_TTL_MINUTES * 60_000)
}

export function getResendAvailableAt(from = new Date()) {
  return new Date(from.getTime() + env.AUTH_OTP_RESEND_COOLDOWN_SECONDS * 1_000)
}

export function isOtpExpired(expiresAt: Date) {
  return expiresAt.getTime() <= Date.now()
}

export function maskEmail(email: string) {
  const [localPart, domain = ''] = email.split('@')

  if (!localPart) return email

  const visibleLocal = localPart.length <= 2
    ? `${localPart[0] ?? '*'}*`
    : `${localPart.slice(0, 2)}${'*'.repeat(Math.max(localPart.length - 2, 2))}`

  const [domainName, tld = ''] = domain.split('.')
  const visibleDomain = domainName
    ? `${domainName.slice(0, 1)}${'*'.repeat(Math.max(domainName.length - 1, 2))}`
    : '***'

  return `${visibleLocal}@${visibleDomain}${tld ? `.${tld}` : ''}`
}
