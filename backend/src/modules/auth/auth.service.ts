import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import type { SignOptions } from 'jsonwebtoken'

import { env } from '../../config/env.js'
import { HttpError } from '../../shared/utils/http-error.js'
import type {
  LoginDto,
  RegisterDto,
  ResendLoginOtpDto,
  UpdateTwoFactorDto,
  VerifyLoginOtpDto,
} from './auth.dto.js'
import { ensureEmailOtpConfigured, sendLoginOtpEmail } from './auth.mailer.js'
import {
  compareOtpCode,
  generateOtpCode,
  getOtpExpiryDate,
  getResendAvailableAt,
  hashOtpCode,
  isOtpExpired,
  maskEmail,
} from './auth.otp.js'
import * as authRepository from './auth.repository.js'
import type {
  AuthRequestContext,
  AuthSuccessResponse,
  LoginOtpRequiredResponse,
  LoginResponse,
  PublicAuthUser,
} from './auth.types.js'

function signToken(user: { id: string; email: string }) {
  return jwt.sign({ id: user.id, email: user.email }, env.JWT_SECRET, {
    expiresIn: env.JWT_EXPIRES_IN as SignOptions['expiresIn'],
  })
}

function normalizeEmail(email: string) {
  return email.trim().toLowerCase()
}

function invalidCredentialsError() {
  return new HttpError(401, 'Invalid credentials')
}

function toAuthSuccess(user: PublicAuthUser): AuthSuccessResponse {
  const publicUser = { ...user } as PublicAuthUser & { passwordHash?: string }
  delete publicUser.passwordHash

  return {
    user: publicUser,
    token: signToken(publicUser),
  }
}

function toOtpPendingResponse(challenge: {
  id: string
  expiresAt: Date
  lastSentAt: Date
}, user: Pick<PublicAuthUser, 'email'>): LoginOtpRequiredResponse {
  return {
    requiresTwoFactor: true,
    challengeId: challenge.id,
    method: 'email',
    emailHint: maskEmail(user.email),
    expiresAt: challenge.expiresAt.toISOString(),
    resendAvailableAt: getResendAvailableAt(challenge.lastSentAt).toISOString(),
  }
}

async function createLoginOtpChallenge(user: PublicAuthUser, context: AuthRequestContext) {
  ensureEmailOtpConfigured()

  await authRepository.invalidateActiveOtpChallenges(user.id)

  const issuedAt = new Date()
  const code = generateOtpCode()
  const codeHash = await hashOtpCode(code)
  const challenge = await authRepository.createOtpChallenge({
    userId: user.id,
    email: user.email,
    codeHash,
    expiresAt: getOtpExpiryDate(issuedAt),
    lastSentAt: issuedAt,
    ipAddress: context.ipAddress ?? null,
    userAgent: context.userAgent ?? null,
  })

  try {
    await sendLoginOtpEmail({
      to: user.email,
      name: user.name,
      code,
    })
  } catch (error) {
    await authRepository.deleteOtpChallenge(challenge.id).catch(() => undefined)
    throw error
  }

  return challenge
}

async function assertCredentials(email: string, password: string) {
  const user = await authRepository.findUserForAuthentication(email)
  if (!user) throw invalidCredentialsError()

  const passwordMatches = await bcrypt.compare(password, user.passwordHash)
  if (!passwordMatches) throw invalidCredentialsError()

  return user
}

export async function register(dto: RegisterDto) {
  const email = normalizeEmail(dto.email)
  const existingUser = await authRepository.findUserForAuthentication(email)
  if (existingUser) throw new HttpError(409, 'Email already registered')

  const passwordHash = await bcrypt.hash(dto.password, 12)
  const user = await authRepository.createUser({
    email,
    name: dto.name,
    passwordHash,
  })

  return toAuthSuccess(user)
}

export async function login(dto: LoginDto, context: AuthRequestContext): Promise<LoginResponse> {
  const email = normalizeEmail(dto.email)
  const user = await assertCredentials(email, dto.password)

  if (!user.twoFactorEnabled || user.twoFactorMethod !== 'email') {
    return toAuthSuccess(user)
  }

  const challenge = await createLoginOtpChallenge(user, context)
  return toOtpPendingResponse(challenge, user)
}

export async function verifyLoginOtp(dto: VerifyLoginOtpDto): Promise<AuthSuccessResponse> {
  const challenge = await authRepository.findOtpChallengeById(dto.challengeId)
  if (!challenge || !challenge.user) {
    throw new HttpError(401, 'Invalid verification code')
  }

  if (challenge.consumedAt) {
    throw new HttpError(400, 'This verification code is no longer valid')
  }

  if (isOtpExpired(challenge.expiresAt)) {
    throw new HttpError(400, 'This verification code has expired')
  }

  if (challenge.attemptsCount >= env.AUTH_OTP_MAX_ATTEMPTS) {
    throw new HttpError(429, 'Maximum verification attempts reached')
  }

  const codeMatches = await compareOtpCode(dto.code.trim(), challenge.codeHash)
  if (!codeMatches) {
    const attemptsCount = challenge.attemptsCount + 1
    const lockChallenge = attemptsCount >= env.AUTH_OTP_MAX_ATTEMPTS
    await authRepository.recordFailedOtpAttempt(challenge.id, attemptsCount, lockChallenge)
    throw new HttpError(lockChallenge ? 429 : 401, lockChallenge
      ? 'Maximum verification attempts reached'
      : 'Invalid verification code')
  }

  await authRepository.consumeOtpChallenge(challenge.id)
  return toAuthSuccess(challenge.user)
}

export async function resendLoginOtp(dto: ResendLoginOtpDto): Promise<LoginOtpRequiredResponse> {
  const challenge = await authRepository.findOtpChallengeById(dto.challengeId)
  if (!challenge || !challenge.user) {
    throw new HttpError(400, 'This verification request is no longer valid')
  }

  if (challenge.consumedAt) {
    throw new HttpError(400, 'This verification request is no longer valid')
  }

  if (isOtpExpired(challenge.expiresAt)) {
    throw new HttpError(400, 'This verification code has expired')
  }

  if (challenge.attemptsCount >= env.AUTH_OTP_MAX_ATTEMPTS) {
    throw new HttpError(429, 'Maximum verification attempts reached')
  }

  const resendAvailableAt = getResendAvailableAt(challenge.lastSentAt)
  if (resendAvailableAt.getTime() > Date.now()) {
    throw new HttpError(429, 'Please wait before requesting another code')
  }

  ensureEmailOtpConfigured()

  const issuedAt = new Date()
  const code = generateOtpCode()
  const refreshedChallenge = await authRepository.refreshOtpChallenge(challenge.id, {
    codeHash: await hashOtpCode(code),
    expiresAt: getOtpExpiryDate(issuedAt),
    lastSentAt: issuedAt,
  })

  try {
    await sendLoginOtpEmail({
      to: refreshedChallenge.user.email,
      name: refreshedChallenge.user.name,
      code,
    })
  } catch (error) {
    await authRepository.consumeOtpChallenge(refreshedChallenge.id).catch(() => undefined)
    throw error
  }

  return toOtpPendingResponse(refreshedChallenge, refreshedChallenge.user)
}

export async function getAuthenticatedUser(userId: string) {
  const user = await authRepository.findPublicUserById(userId)
  if (!user) throw new HttpError(404, 'User not found')
  return user
}

export async function updateTwoFactor(userId: string, dto: UpdateTwoFactorDto) {
  const user = await authRepository.findPublicUserById(userId)
  if (!user) throw new HttpError(404, 'User not found')

  if (dto.enabled) ensureEmailOtpConfigured()
  if (!dto.enabled) await authRepository.invalidateActiveOtpChallenges(userId)

  return authRepository.updateTwoFactor(userId, dto.enabled)
}
