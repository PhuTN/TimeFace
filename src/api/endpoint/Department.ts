import {ep} from '../core/ApiEndpoint';

export const DepartmentEP = {
  // ⭐ POST /departments  — tạo phòng ban
  Create: ep('POST', 'departments'),

  // ⭐ GET /departments — lấy tất cả phòng ban (theo công ty)
  GetAll: ep('GET', 'departments'),

  // ⭐ GET /departments/:id — lấy chi tiết 1 phòng ban
  ById: (id: string) => ep('GET', 'departments', id),

  // ⭐ PUT /departments/:id — cập nhật phòng ban
  Update: (id: string) => ep('PUT', 'departments', id),

  // ⭐ DELETE /departments/:id — xoá mềm phòng ban
  Delete: (id: string) => ep('DELETE', 'departments', id),

  GetById: (id: string) => ep('GET', 'departments', id),
} as const;
