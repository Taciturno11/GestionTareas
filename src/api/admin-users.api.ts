import { expectArray, http } from './http'

export type AdminUserRole = 'admin' | 'usuario'

export interface AdminUser {
  id: string
  name: string
  email: string
  role: AdminUserRole | string
  createdAt: string
  personalWorkspace: {
    id: string
    name: string
    color: string
  } | null
}

export interface CreateAdminUserRequest {
  name: string
  email: string
  password: string
  role: AdminUserRole
}

export const adminUsersApi = {
  list: async () => expectArray<AdminUser>(await http<unknown>('/admin/users'), 'admin users'),
  create: (body: CreateAdminUserRequest) => http<AdminUser>('/admin/users', { method: 'POST', body }),
  getWorkspace: (userId: string) => http<{
    user: { id: string; name: string }
    workspace: { id: string; name: string; color: string }
  }>(`/admin/users/${userId}/workspace`),
}
