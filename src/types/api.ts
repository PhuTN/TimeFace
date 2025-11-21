// src/types/api.ts
export type ApiResponse<T = any> = {
  success: boolean;
  error: string | null;
  message?: string;
  data?: T;
};

export type SubscriptionPlan = {
  _id: string;
  code: string;
  name: string;
  price_per_month: number;
  max_employees: number | null;
  description?: string;
};

export type CompanyInfo = {
  _id: string;
  name: string;
  code: string;
  subscription_plan?: SubscriptionPlan | null;
  subscription_status: 'active' | 'expired' | 'canceled' | 'unactive';
};

export type AuthUser = {
  _id: string;
  email: string;
  full_name: string;
  role: 'sys_admin' | 'admin' | 'user';

  // quan hệ
  company_id?: CompanyInfo | null;
  department_id?: string | null;
  manager_id?: string | null;

  // backend trả avatar
  avatar?: string;

  // backend login append thêm cho dễ đọc FE
  subscription_plan?: SubscriptionPlan | null;  
  subscription_status: 'active' | 'expired' | 'canceled' | 'unactive';
};


export type LoginData = {
  token: string;
  user: AuthUser;
};
