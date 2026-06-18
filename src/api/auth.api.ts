import { http } from './http'

export type UserRole = 'admin' | 'usuario' | string

export interface AuthUser {
  id: string
  email: string
  name: string
  role: UserRole
  personalWorkspaceId: string | null
}

export interface AuthResponse {
  user: AuthUser
  token: string
}

export interface LoginRequest {
  email: string
  password: string
}

export const authApi = {
  login: (body: LoginRequest) => http<AuthResponse>('/auth/login', { method: 'POST', body, auth: false }),
  me: () => http<{ user: AuthUser }>('/auth/me'),
}
