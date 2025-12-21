import { ep } from "../core/ApiEndpoint";

export const CompanyEP = {
  // --------------------------
  // COMPANY CRUD
  // --------------------------
  Create: ep("POST", "company"),
  GetAll: ep("GET", "company"),
  ById: (id: string) => ep("GET", "company", id),
  Update: (id: string) => ep("PUT", "company", id),
  Delete: (id: string) => ep("DELETE", "company", id),

  // --------------------------
  // ⭐ MY COMPANY
  // --------------------------
  // GET /company/me
  GetMyCompany: ep("GET", "company/me"),

  // --------------------------
  // ⭐ CHECK-IN CONFIG
  // --------------------------
  // GET /company/checkin-config
  GetCheckinConfig: ep("GET", "company/checkin-config"),

  // PUT /company/checkin-config
  UpdateCheckinConfig: ep("PUT", "company/checkin-config"),

  // --------------------------
  // ⭐ ATTENDANCE CONFIG
  // --------------------------
  // GET /company/attendance-config
  GetAttendanceConfig: ep("GET", "company/attendance-config"),

  // PUT /company/attendance-config
  UpdateAttendanceConfig: ep("PUT", "company/attendance-config"),

  // --------------------------
  // ⭐ CHECK-IN INFO (USER)
  // --------------------------
  // GET /company/checkin-info
  GetCheckinInfo: ep("GET", "company/checkin-info"),
} as const;
