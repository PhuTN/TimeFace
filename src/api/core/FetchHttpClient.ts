// src/api/core/FetchHttpClient.ts
import type { IHttpClient } from './IHttpClient';

export class FetchHttpClient implements IHttpClient {
  private async request<T = any>(
    method: string,
    url: string,
    options: { params?: any; body?: any } = {},
  ): Promise<T> {
    let finalUrl = url;

    // xử lý query string cho GET nếu cần
    if (options.params && method === 'GET') {
      const qs = new URLSearchParams(options.params).toString();
      finalUrl = qs ? `${url}?${qs}` : url;
    }

    const res = await fetch(finalUrl, {
      method,
      headers: {
        'Content-Type': 'application/json',
        // nếu bạn có token từ AppConfig hoặc nơi khác thì gắn ở đây
        // Authorization: `Bearer ${token}`,
      },
      body: method === 'GET' || method === 'DELETE'
        ? undefined
        : JSON.stringify(options.body),
    });

    if (!res.ok) {
      // tuỳ ý: ném Error hoặc build object error giống AxiosHttpClient + AppConfig.errorMapper
      const errBody = await res.json().catch(() => undefined);
      const err: any = new Error(errBody?.message || `HTTP error ${res.status}`);
      err.status = res.status;
      err.data = errBody;
      throw err;
    }

    // giả sử API luôn trả JSON
    return (await res.json()) as T;
  }

  async get<T = any>(url: string, params?: any): Promise<T> {
    return this.request<T>('GET', url, { params });
  }

  async post<T = any>(url: string, body?: any): Promise<T> {
    return this.request<T>('POST', url, { body });
  }

  async put<T = any>(url: string, body?: any): Promise<T> {
    return this.request<T>('PUT', url, { body });
  }

  async delete<T = any>(url: string): Promise<T> {
    return this.request<T>('DELETE', url);
  }
}
