import { http } from './http'

export interface AuthUser {
  id: string
  email: string
  name?: string
}

export interface AuthResponse {
  user: AuthUser
  token: string
}

export interface LoginRequest {
  email: string
  password: string
}

export interface RegisterRequest extends LoginRequest {
  name: string
}

export const authApi = {
  register: (body: RegisterRequest) => http<AuthResponse>('/auth/register', { method: 'POST', body, auth: false }),
  login: (body: LoginRequest) => http<AuthResponse>('/auth/login', { method: 'POST', body, auth: false }),
  me: () => http<{ user: AuthUser }>('/auth/me'),
}
