// src/api/endpoint/User.ts
import { ep } from '../core/ApiEndpoint';

export const User = {
  // lấy thông tin user hiện tại (dùng token)
  GetMe:  ep('GET', 'users', 'me'),
  
  // nếu backend của bạn có list user / update / delete thì có thể khai báo thêm:
  // GetAll: ep('GET', 'users'),           // => GET /users
  // ById:   ep('GET', 'users', ':id'),    // => GET /users/:id (tự xử lý thay :id ở chỗ callApi)
  // Update: ep('PUT', 'users', ':id'),    // => PUT /users/:id
  // Delete: ep('DELETE', 'users', ':id'), // => DELETE /users/:id
} as const;
