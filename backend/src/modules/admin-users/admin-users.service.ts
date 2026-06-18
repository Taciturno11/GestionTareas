import bcrypt from 'bcryptjs'
import { HttpError } from '../../shared/utils/http-error.js'
import type { CreateAdminUserDto } from './admin-users.dto.js'
import * as adminUsersRepository from './admin-users.repository.js'

function normalizeEmail(email: string) {
  return email.trim().toLowerCase()
}

export function list() {
  return adminUsersRepository.findMany()
}

export async function create(dto: CreateAdminUserDto) {
  const email = normalizeEmail(dto.email)
  const existingUser = await adminUsersRepository.findByEmail(email)

  if (existingUser) throw new HttpError(409, 'Email already registered')

  const passwordHash = await bcrypt.hash(dto.password, 12)
  return adminUsersRepository.createWithInitialWorkspace({
    ...dto,
    email,
    passwordHash,
  })
}

export async function getWorkspace(userId: string) {
  const user = await adminUsersRepository.findPersonalWorkspaceByUserId(userId)
  if (!user) throw new HttpError(404, 'User not found')
  if (!user.personalWorkspace) throw new HttpError(404, 'Personal workspace not found')

  return {
    user: {
      id: user.id,
      name: user.name,
    },
    workspace: user.personalWorkspace,
  }
}
