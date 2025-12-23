export interface IHttpClient {
  get<T = any>(url: string, params?: any): Promise<T>;
  post<T = any>(url: string, body?: any): Promise<T>;
  put<T = any>(url: string, body?: any): Promise<T>;
  delete<T = any>(url: string): Promise<T>;
  patch<T = any>(url: string, body?: any): Promise<T>; // ⭐ thêm
}
