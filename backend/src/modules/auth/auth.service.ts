import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import type { SignOptions } from 'jsonwebtoken'

import { env } from '../../config/env.js'
import { prisma } from '../../database/prisma.js'
import { HttpError } from '../../shared/utils/http-error.js'
import type { LoginDto, RegisterDto } from './auth.dto.js'

function publicUser(user: { id: string; email: string; name: string }) {
  return {
    id: user.id,
    email: user.email,
    name: user.name,
  }
}

function signToken(user: { id: string; email: string }) {
  return jwt.sign({ id: user.id, email: user.email }, env.JWT_SECRET, {
    expiresIn: env.JWT_EXPIRES_IN as SignOptions['expiresIn'],
  })
}

export async function register(dto: RegisterDto) {
  const existingUser = await prisma.user.findUnique({ where: { email: dto.email } })
  if (existingUser) throw new HttpError(409, 'Email already registered')

  const passwordHash = await bcrypt.hash(dto.password, 12)
  const user = await prisma.user.create({
    data: {
      email: dto.email,
      name: dto.name,
      passwordHash,
    },
  })

  return {
    user: publicUser(user),
    token: signToken(user),
  }
}

export async function login(dto: LoginDto) {
  const user = await prisma.user.findUnique({ where: { email: dto.email } })
  if (!user) throw new HttpError(401, 'Invalid credentials')

  const passwordMatches = await bcrypt.compare(dto.password, user.passwordHash)
  if (!passwordMatches) throw new HttpError(401, 'Invalid credentials')

  return {
    user: publicUser(user),
    token: signToken(user),
  }
}
