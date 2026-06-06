export type UserRole = 'admin_unitek' | 'cliente'
export type TwoFactorMethod = 'email'

export interface PublicAuthUser {
  id: string
  email: string
  name: string
  role: UserRole | string
  twoFactorEnabled: boolean
  twoFactorMethod: string | null
}

export interface AuthRequestContext {
  ipAddress?: string | null
  userAgent?: string | null
}

export interface AuthSuccessResponse {
  user: PublicAuthUser
  token: string
}

export interface LoginOtpRequiredResponse {
  requiresTwoFactor: true
  challengeId: string
  method: TwoFactorMethod
  emailHint: string
  expiresAt: string
  resendAvailableAt: string
}

export type LoginResponse = AuthSuccessResponse | LoginOtpRequiredResponse
