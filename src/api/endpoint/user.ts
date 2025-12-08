import { ep } from '../core/ApiEndpoint';

export const User = {
  // ⭐ Lấy user hiện tại theo token
  GetMe: ep('GET', 'users', 'me'),

  // ⭐ User tự update profile
  UpdateMe: ep('PUT', 'users', 'me'),

  // ⭐ Admin: lấy danh sách tất cả user
  GetAll: ep('GET', 'users'),

  // ⭐ Admin: lấy danh sách user theo company (KHÔNG NHẬN companyId)
  GetByCompany: ep('GET', 'users', 'company'),

  // ⭐ GET /users/:id
  ById: (id: string) => ep('GET', 'users', id),

  // ⭐ PUT /users/:id
  Update: (id: string) => ep('PUT', 'users', id),

  // ⭐ DELETE /users/:id
  Delete: (id: string) => ep('DELETE', 'users', id),

  // ⭐ POST /users (Admin tạo user mới)
  Create: ep('POST', 'users'),
} as const;
