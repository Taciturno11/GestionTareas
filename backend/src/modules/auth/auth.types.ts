export type UserRole = 'admin' | 'usuario'

export interface PublicAuthUser {
  id: string
  email: string
  name: string
  role: UserRole | string
}

export interface AuthSuccessResponse {
  user: PublicAuthUser
  token: string
}
