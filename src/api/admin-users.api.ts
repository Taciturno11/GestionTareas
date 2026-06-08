import { http } from './http'

export type AdminUserRole = 'admin' | 'usuario'

export interface AdminUser {
  id: string
  name: string
  email: string
  role: AdminUserRole | string
  createdAt: string
}

export interface CreateAdminUserRequest {
  name: string
  email: string
  password: string
  role: AdminUserRole
}

export const adminUsersApi = {
  list: () => http<AdminUser[]>('/admin/users'),
  create: (body: CreateAdminUserRequest) => http<AdminUser>('/admin/users', { method: 'POST', body }),
}
