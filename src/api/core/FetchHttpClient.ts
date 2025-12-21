// src/api/core/FetchHttpClient.ts
import type { IHttpClient } from './IHttpClient';

export class FetchHttpClient implements IHttpClient {
  private async request<T = any>(
    method: string,
    url: string,
    options: { params?: any; body?: any } = {},
  ): Promise<T> {
    let finalUrl = url;

    // =========================
    //  XỬ LÝ QUERY STRING (GET)
    // =========================
    if (options.params && method === 'GET') {
      const qs = new URLSearchParams(options.params).toString();
      finalUrl = qs ? `${url}?${qs}` : url;
    }

    const res = await fetch(finalUrl, {
      method,
      headers: {
        'Content-Type': 'application/json',
      },
      body:
        method === 'GET' || method === 'DELETE'
          ? undefined
          : JSON.stringify(options.body),
    });

    // =========================
    //  XỬ LÝ ERROR
    // =========================
    if (!res.ok) {
      let errBody: any = null;
      try {
        errBody = await res.json();
      } catch (_) {}

      const err: any = new Error(
        errBody?.message || errBody?.error || `HTTP error ${res.status}`,
      );

      err.status = res.status;
      err.data = errBody;

      throw err;
    }

    // =========================
    //  PARSE JSON
    // =========================
    try {
      return (await res.json()) as T;
    } catch (_) {
      return {} as T;
    }
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

  // =========================
  //      ⭐ PATCH (THÊM MỚI)
  // =========================
  async patch<T = any>(url: string, body?: any): Promise<T> {
    return this.request<T>('PATCH', url, { body });
  }
}
