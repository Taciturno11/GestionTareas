import { HttpError } from '../../shared/utils/http-error.js'
import type { UpdateUserDto } from './users.dto.js'
import * as usersRepository from './users.repository.js'

export async function getProfile(userId: string) {
  const user = await usersRepository.findById(userId)
  if (!user) throw new HttpError(404, 'User not found')
  return user
}

export function updateProfile(userId: string, dto: UpdateUserDto) {
  return usersRepository.update(userId, dto)
}
