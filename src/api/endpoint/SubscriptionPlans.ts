// src/api/endpoint/SubscriptionPlans.ts
import { ep } from '../core/ApiEndpoint';

export const SubscriptionPlans = {
  // lấy danh sách gói – chỉ cần đăng nhập (backend đã check auth)
  GetAll: ep('GET', 'plans'),

  // tạo gói mới – sys_admin (backend rbac MANAGE_SUBSCRIPTION_PLANS)
  Create: ep('POST', 'plans'),

  // search gói – sys_admin
  Search: ep('POST', 'plans', 'search'),

  // các endpoint có id dùng dạng hàm để truyền id động
  GetById: (id: string) => ep('GET', `plans/${id}`),
  Update: (id: string) => ep('PUT', `plans/${id}`),
  Delete: (id: string) => ep('DELETE', `plans/${id}`),
} as const;
