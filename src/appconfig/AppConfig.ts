// src/appconfig/AppConfig.ts
import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';
import { authStorage } from '../services/authStorage';


export type AppConfigOptions = {
  apiUrl: string;
  appName: string;
  version: string;

  // logging & debug
  debug?: boolean;
  requestLogger?: (req: any) => void; // override logger
  responseLogger?: (resOrErr: any) => void; // override logger

  // HTTP
  /** Nếu set, sẽ ưu tiên token này; nếu không, interceptor sẽ lấy từ AsyncStorage */
  authToken?: string | null;
  httpTimeout?: number; // mặc định 15000ms
  defaultHeaders?: Record<string, string>; // header mặc định cho mọi request
  axiosConfig?: Partial<AxiosRequestConfig>; // tuỳ biến thêm

  // Interceptors hook (nâng cao)
  interceptors?: {
    request?: Array<(req: any) => any | Promise<any>>;
    responseSuccess?: Array<
      (res: AxiosResponse) => AxiosResponse | Promise<AxiosResponse>
    >;
    responseError?: Array<(error: any) => any>;
  };

  // Chuẩn hoá lỗi trả ra
  errorMapper?: (
    error: any,
  ) => Error & { status?: number; code?: string; data?: any };
};

function normalizeBaseUrl(url: string) {
  return url.replace(/\/+$/, '');
}

class AppConfig {
  private static instance: AppConfig;
  private cfg: AppConfigOptions;
  private axiosInst: AxiosInstance | null = null;

  private constructor() {
    this.cfg = {
      apiUrl: 'https://photel.io.vn/api/', // đổi theo env của bạn
      appName: 'GOKUUNE',
      version: '1.0.0',
      debug: true,
      authToken: null,
      httpTimeout: 15000,
      defaultHeaders: { 'Content-Type': 'application/json' },
      axiosConfig: {},
      interceptors: {},
      errorMapper: (err: any) => {
        // mapping mặc định: giữ nguyên data/status/code để FE dùng
        const e = new Error(
          err?.response?.data?.message ||
            err?.response?.data?.error ||
            err?.message ||
            'Request failed',
        ) as any;
        e.status = err?.response?.status;
        e.data = err?.response?.data;
        e.code = err?.code;
        return e;
      },
      requestLogger: req => {
        if (!this.cfg.debug) return;
        const full = (req.baseURL || '') + (req.url || '');
        const payload = req.data ?? req.params ?? undefined;
        console.log('[API] =>', req.method?.toUpperCase(), full, payload || '');
      },
      responseLogger: resOrErr => {
        if (!this.cfg.debug) return;
        if (resOrErr?.config) {
          console.log('[API] <=', resOrErr.status, resOrErr.config?.url);
        } else {
          console.log('[API]', resOrErr);
        }
      },
    };
  }

  static getInstance(): AppConfig {
    if (!AppConfig.instance) AppConfig.instance = new AppConfig();
    return AppConfig.instance;
  }

  getConfig(): AppConfigOptions {
    return this.cfg;
  }

  setConfig(
    newConfig: Partial<AppConfigOptions>,
    opts?: { rebuildAxios?: boolean },
  ) {
    this.cfg = { ...this.cfg, ...newConfig };
    // mặc định: nếu đổi config quan trọng, rebuild axios để nhận cấu hình mới
    if (opts?.rebuildAxios ?? true) {
      this.rebuildAxios();
    }
  }

  /** set nhanh token runtime (ưu tiên hơn AsyncStorage nếu có) */
  setAuthToken(token: string | null, opts?: { rebuildAxios?: boolean }) {
    this.cfg.authToken = token;
    if (opts?.rebuildAxios) this.rebuildAxios();
  }

  get<T extends keyof AppConfigOptions>(k: T): AppConfigOptions[T] {
    return this.cfg[k];
  }

  /** Endpoint factory – tạo tuple [method, fullPath] */
  ep(method: 'GET' | 'POST' | 'PUT' | 'DELETE', base: string, suffix = '') {
    const b = base.replace(/^\/+|\/+$/g, ''); // "users"
    const s = suffix.replace(/^\/+/, ''); // "getAll"
    const path = s ? `/${b}/${s}` : `/${b}`;
    return [method, path] as const;
  }

  /** Curry base: makeEp("users") → (method, suffix?) => [method, "/users[/suffix]"] */
  makeEp(base: string) {
    return (method: 'GET' | 'POST' | 'PUT' | 'DELETE', suffix = '') =>
      this.ep(method, base, suffix);
  }

  /** Cấp sẵn AxiosInstance theo config hiện tại */
  getAxios(): AxiosInstance {
    if (!this.axiosInst) {
      this.axiosInst = this.buildAxios();
    }
    return this.axiosInst;
  }

  /** Buộc rebuild AxiosInstance (khi đổi apiUrl / token / header...) */
  rebuildAxios() {
    this.axiosInst = null;
  }

  private buildAxios(): AxiosInstance {
    const baseURL = normalizeBaseUrl(this.cfg.apiUrl || '');
    const inst = axios.create({
      baseURL,
      timeout: this.cfg.httpTimeout ?? 15000,
      headers: this.cfg.defaultHeaders,
      ...(this.cfg.axiosConfig || {}),
    });

    // ===== Request interceptor (attach token + logger + custom hooks)
    inst.interceptors.request.use(
      async req => {
        // Ưu tiên token cấu hình tay; nếu không có thì lấy từ AsyncStorage (React Native)
        let token = this.cfg.authToken ?? null;
        if (!token) {
          try {
            token = await authStorage.getToken();
          } catch {
            token = null;
          }
        }

        if (token) {
          req.headers = req.headers || {};
          (req.headers as any).Authorization = `Bearer ${token}`;
        }

        // logger mặc định
        this.cfg.requestLogger?.({ ...req, baseURL });

        // custom request interceptors
        for (const fn of this.cfg.interceptors?.request || []) {
          req = await fn(req);
        }
        return req;
      },
      error => Promise.reject(error),
    );

    // ===== Response interceptors (success + error)
    inst.interceptors.response.use(
      async res => {
        this.cfg.responseLogger?.(res);
        // custom success interceptors
        for (const fn of this.cfg.interceptors?.responseSuccess || []) {
          res = await fn(res);
        }
        return res;
      },
      async err => {
        // custom error interceptors
        for (const fn of this.cfg.interceptors?.responseError || []) {
          try {
            await fn(err);
          } catch {
            /* ignore */
          }
        }
        const mapped = this.cfg.errorMapper ? this.cfg.errorMapper(err) : err;
        return Promise.reject(mapped);
      },
    );

    return inst;
  }
}

export default AppConfig;
