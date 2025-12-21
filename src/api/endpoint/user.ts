import {ep} from '../core/ApiEndpoint';

export const User = {
  /* ======================== SELF ======================== */
  GetMe: ep('GET', 'users', 'me'),
  UpdateMe: ep('PUT', 'users', 'me'),

  /* ======================== CREATE ======================== */
  Create: ep('POST', 'users'),

  /* ======================== LIST ======================== */
  GetAll: ep('GET', 'users'),
  GetByCompany: ep('GET', 'users', 'company'),

  /* ======================== ADMIN DETAIL & UPDATE ======================== */
  GetDetailByCompany: (id: string) => ep('GET', 'users/company', id),
  UpdateByCompany: (id: string) => ep('PUT', 'users/company', id),

  /* ======================== PATCH ACTIONS ======================== */
  UpdateStatus: (id: string) => ep('PATCH', 'users', `${id}/status`),
  ApproveProfile: (id: string) => ep('PATCH', 'users', `${id}/approve`),

  /* ======================== GLOBAL DETAIL ======================== */
  ById: (id: string) => ep('GET', 'users', id),
  Update: (id: string) => ep('PUT', 'users', id),
  Delete: (id: string) => ep('DELETE', 'users', id),

  /* ======================== ATTENDANCE ======================== */
  LocationCheck: ep('POST', 'users/checkin', 'location-check'),
  CheckAttendance: ep('POST', 'users/checkin'),

  /* ======================================================
     🟧 LEAVE REQUESTS
  ====================================================== */

  // USER
  CreateLeave: ep('POST', 'users/requests', 'leave'),
  GetMyLeave: ep('GET', 'users/requests', 'leave/me'),

  // ADMIN
  AdminGetAllLeave: ep('GET', 'users/admin/requests', 'leave'),
  AdminDecideLeave: (userId: string, leaveId: string) =>
    ep('PATCH', 'users/admin/requests/leave', `${userId}/${leaveId}`),

  /* ======================================================
     🟨 CHECK-IN COMPLAINTS
  ====================================================== */

  // USER
  CreateCheckinComplaint: ep('POST', 'users/requests', 'checkin-complaint'),
  GetMyCheckinComplaints: ep('GET', 'users/requests', 'checkin-complaint/me'),

  // ADMIN
  AdminGetAllCheckinComplaints: ep(
    'GET',
    'users/admin/requests',
    'checkin-complaint',
  ),
  AdminDecideCheckinComplaint: (userId: string, complaintId: string) =>
    ep(
      'PATCH',
      'users/admin/requests/checkin-complaint',
      `${userId}/${complaintId}`,
    ),

  /* ======================================================
     🟩 OVERTIME REQUESTS
  ====================================================== */

  // USER
  CreateOvertime: ep('POST', 'users/requests', 'overtime'),
  GetMyOvertime: ep('GET', 'users/requests', 'overtime/me'),

  // ADMIN
  AdminGetPendingRequests: ep('GET', 'users/admin/requests', 'pending'),
  AdminGetAllOvertime: ep('GET', 'users/admin/requests', 'overtime'),
  AdminDecideOvertime: (userId: string, otId: string) =>
    ep('PATCH', 'users/admin/requests/overtime', `${userId}/${otId}`),

  /* ======================================================
     🕓 TIMESHEET / PAYROLL
  ====================================================== */

  GetMyTimesheetMonths: ep('GET', 'users/timesheets', 'months/me'),
  GetMyMonthTimesheetDetail: ep('GET', 'users/timesheets', 'month-detail/me'),
  GetUserTimesheetMonths: (userId: string) =>
    ep('GET', 'users/timesheets/months', userId),
  GetUserMonthTimesheetDetail: (userId: string) =>
    ep('GET', 'users/timesheets/month-detail', userId),

  /* ======================================================
     💬 CHAT APIs
  ====================================================== */
  GetChatList: ep('GET', 'users/chat', 'list'),
  GetChatDetail: (peerId: string) => ep('GET', 'users/chat/detail', peerId),
  GetGroupChatDetail: (groupId: string) =>
    ep('GET', 'users/chat/group', groupId),
  SendMessage: ep('POST', 'users/chat', 'send'),
  SeenMessage: ep('POST', 'users/chat', 'seen'),
} as const;
