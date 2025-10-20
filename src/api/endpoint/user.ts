import {makeDefaultApi, ep} from '../core/ApiEndpoint';

// 6 method mặc định
export const User = {
  ...makeDefaultApi('users'),

  // thêm endpoint đặc biệt nếu cần
  CheckInGetAll: ep('GET', 'users', 'checkin/getall'),
};
