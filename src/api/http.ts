// src/api/http.ts
import type { IHttpClient } from './core/IHttpClient';
import { AxiosHttpClient } from './core/AxiosHttpClient';
import { FetchHttpClient } from './core/FetchHttpClient';
import { MockHttpClient } from './core/MockHttpClient';
import AppConfig from '../appconfig/AppConfig';

type HttpImpl = 'axios' | 'fetch' | 'mock';

// Lấy cấu hình từ AppConfig
const appCfg = AppConfig.getInstance();
const impl = (appCfg.get('httpClientImpl') ?? 'axios') as HttpImpl;

let client: IHttpClient;

switch (impl) {
  case 'fetch':
    client = new FetchHttpClient();
    break;

  case 'mock':
    client = new MockHttpClient({
      // cấu hình fake data global (nếu muốn)
      post: async (url, body) => {
        console.log('[MOCK][POST]', url, body);
        if (url === '/auth/login') {
          return { token: 'fake-token', userId: 1, email: body.email };
        }
        return {};
      },
    });
    break;

  case 'axios':
  default:
    client = new AxiosHttpClient();
    break;
}

export const http: IHttpClient = client;
