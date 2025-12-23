import {ep} from '../core/ApiEndpoint';

export const CompanyEP = {
  // --------------------------
  // COMPANY CRUD
  // --------------------------
  Create: ep('POST', 'company'),
  GetAll: ep('GET', 'company'),
  ById: (id: string) => ep('GET', 'company', id),
  Update: (id: string) => ep('PUT', 'company', id),
  Delete: (id: string) => ep('DELETE', 'company', id),

  // --------------------------
  // ⭐ MY COMPANY
  // --------------------------
  // GET /company/me
  GetMyCompany: ep('GET', 'company/me'),

  // --------------------------
  // ⭐ CHECK-IN CONFIG
  // --------------------------
  // GET /company/checkin-config
  GetCheckinConfig: ep('GET', 'company/checkin-config'),

  // PUT /company/checkin-config
  UpdateCheckinConfig: ep('PUT', 'company/checkin-config'),

  // --------------------------
  // ⭐ ATTENDANCE CONFIG
  // --------------------------
  // GET /company/attendance-config
  GetAttendanceConfig: ep('GET', 'company/attendance-config'),

  // PUT /company/attendance-config
  UpdateAttendanceConfig: ep('PUT', 'company/attendance-config'),

  // --------------------------
  // ⭐ PLAN HISTORY (SYS ADMIN)
  // --------------------------
  // GET /company/:id/plan-history
  GetPlanHistory: (id: string) => ep('GET', 'company', `${id}/plan-history`),

  // POST /company/:id/plan-history
  AddPlanHistory: (id: string) => ep('POST', 'company', `${id}/plan-history`),

  // --------------------------
  // ⭐ USER STATS (SYS ADMIN)
  // --------------------------
  // GET /company/:id/user-stats
  GetUserStats: (id: string) => ep('GET', 'company', `${id}/user-stats`),

  // --------------------------
  // ⭐ LOCK / UNLOCK COMPANY (SYS ADMIN)
  // --------------------------
  // PUT /company/:id/lock
  LockCompany: (id: string) => ep('PUT', 'company', `${id}/lock`),

  // PUT /company/:id/unlock
  UnlockCompany: (id: string) => ep('PUT', 'company', `${id}/unlock`),

  // --------------------------
  // ⭐ DASHBOARD (SYS ADMIN)
  // --------------------------
  // GET /company/dashboard
  GetDashboard: ep('GET', 'company/dashboard'),


  // GET /company/dashboard/revenue
  GetRevenueReport: ep('GET', 'company/dashboard/revenue'),

  // GET /company/dashboard/revenue-by-month
  // query: ?year=2025
  GetRevenueByMonth: ep('GET', 'company/dashboard/revenue-by-month'),

  // GET /company/dashboard/plan-stats
  GetPlanStats: ep('GET', 'company/dashboard/plan-stats'),
  // --------------------------
  // ⭐ CHECK-IN INFO (USER)
  // --------------------------
  // GET /company/checkin-info
  GetCheckinInfo: ep('GET', 'company/checkin-info'),
  GetAttendanceReportByDate: ep('GET', 'company/attendance-report'),
  GetAttendanceChart: ep('GET', 'company/attendance-chart'),
} as const;
