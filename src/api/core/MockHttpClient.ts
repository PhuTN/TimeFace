// src/api/core/MockHttpClient.ts
import type { IHttpClient } from './IHttpClient';

type HttpMethod = 'get' | 'post' | 'put' | 'delete' | 'patch';

type MockHandler = (url: string, payload?: any) => Promise<any> | any;

type MockConfig = {
  get?: MockHandler;
  post?: MockHandler;
  put?: MockHandler;
  delete?: MockHandler;
  patch?: MockHandler;
};

export class MockHttpClient implements IHttpClient {
  constructor(private handlers: MockConfig = {}) {}

  async get<T = any>(url: string, params?: any): Promise<T> {
    if (this.handlers.get) {
      return (await this.handlers.get(url, params)) as T;
    }
    return {} as T;
  }

  async post<T = any>(url: string, body?: any): Promise<T> {
    if (this.handlers.post) {
      return (await this.handlers.post(url, body)) as T;
    }
    return {} as T;
  }

  async put<T = any>(url: string, body?: any): Promise<T> {
    if (this.handlers.put) {
      return (await this.handlers.put(url, body)) as T;
    }
    return {} as T;
  }

  async delete<T = any>(url: string): Promise<T> {
    if (this.handlers.delete) {
      return (await this.handlers.delete(url)) as T;
    }
    return {} as T;
  }

  // ⭐⭐ PATCH (mới thêm giống Fetch & Axios)
  async patch<T = any>(url: string, body?: any): Promise<T> {
    if (this.handlers.patch) {
      return (await this.handlers.patch(url, body)) as T;
    }
    return {} as T;
  }
}
