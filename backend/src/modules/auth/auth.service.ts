import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import type { SignOptions } from 'jsonwebtoken'

import { env } from '../../config/env.js'
import { HttpError } from '../../shared/utils/http-error.js'
import type { LoginDto, RegisterDto } from './auth.dto.js'
import * as authRepository from './auth.repository.js'
import type { AuthSuccessResponse, PublicAuthUser } from './auth.types.js'

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

export async function login(dto: LoginDto): Promise<AuthSuccessResponse> {
  const email = normalizeEmail(dto.email)
  const user = await assertCredentials(email, dto.password)
  return toAuthSuccess(user)
}

export async function getAuthenticatedUser(userId: string) {
  const user = await authRepository.findPublicUserById(userId)
  if (!user) throw new HttpError(404, 'User not found')
  return user
}
