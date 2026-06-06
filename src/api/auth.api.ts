import { http } from './http'

export type UserRole = 'admin_unitek' | 'cliente' | string

export interface AuthUser {
  id: string
  email: string
  name: string
  role: UserRole
  twoFactorEnabled: boolean
  twoFactorMethod: string | null
}

export interface AuthResponse {
  user: AuthUser
  token: string
}

export interface OtpRequiredResponse {
  requiresTwoFactor: true
  challengeId: string
  method: 'email'
  emailHint: string
  expiresAt: string
  resendAvailableAt: string
}

export interface LoginRequest {
  email: string
  password: string
}

export interface VerifyOtpRequest {
  challengeId: string
  code: string
}

export interface ResendOtpRequest {
  challengeId: string
}

export interface RegisterRequest extends LoginRequest {
  name: string
}

export interface UpdateTwoFactorRequest {
  enabled: boolean
}

export type LoginResponse = AuthResponse | OtpRequiredResponse

export const authApi = {
  register: (body: RegisterRequest) => http<AuthResponse>('/auth/register', { method: 'POST', body, auth: false }),
  login: (body: LoginRequest) => http<LoginResponse>('/auth/login', { method: 'POST', body, auth: false }),
  verifyOtp: (body: VerifyOtpRequest) => http<AuthResponse>('/auth/login/verify-otp', { method: 'POST', body, auth: false }),
  resendOtp: (body: ResendOtpRequest) => http<OtpRequiredResponse>('/auth/login/resend-otp', { method: 'POST', body, auth: false }),
  me: () => http<{ user: AuthUser }>('/auth/me'),
  updateTwoFactor: (body: UpdateTwoFactorRequest) => http<{ user: AuthUser }>('/auth/me/2fa', { method: 'PATCH', body }),
}
