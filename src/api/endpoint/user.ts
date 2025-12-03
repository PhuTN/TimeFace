import { ep } from '../core/ApiEndpoint';

export const User = {
  // ⭐ Lấy user hiện tại theo token
  GetMe: ep('GET', 'users', 'me'),

  // ⭐ User tự update profile
  UpdateMe: ep('PUT', 'users', 'me'),

  // ⭐ Lấy danh sách user (admin)
  GetAll: ep('GET', 'users'),

  // ⭐ GET /users/:id (dynamic param)
  ById: (id: string) => ep('GET', 'users', id),

  // ⭐ PUT /users/:id (admin update user bất kỳ)
  Update: (id: string) => ep('PUT', 'users', id),

  // ⭐ DELETE /users/:id
  Delete: (id: string) => ep('DELETE', 'users', id),
} as const;
