export type UserRole = 'admin' | 'usuario'

export interface PublicAuthUser {
  id: string
  email: string
  name: string
  role: UserRole | string
  personalWorkspaceId: string | null
}

export interface AuthSuccessResponse {
  user: PublicAuthUser
  token: string
}
