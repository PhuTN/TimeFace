import { ep } from "../core/ApiEndpoint";

export const CompanyEP = {
  // --------------------------
  // COMPANY CRUD (nếu cần)
  // --------------------------
  Create: ep("POST", "company"),
  GetAll: ep("GET", "company"),
  ById: (id: string) => ep("GET", "company", id),
  Update: (id: string) => ep("PUT", "company", id),
  Delete: (id: string) => ep("DELETE", "company", id),

  // --------------------------
  // ⭐ CHECK-IN CONFIG
  // --------------------------

  // GET /company/checkin-config
  GetCheckinConfig: ep("GET", "company/checkin-config"),

  // PUT /company/checkin-config
  UpdateCheckinConfig: ep("PUT", "company/checkin-config"),
} as const;
