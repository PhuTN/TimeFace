// src/api/core/AxiosHttpClient.ts
import {AxiosInstance} from 'axios';
import AppConfig from '../../appconfig/AppConfig';
import {IHttpClient} from './IHttpClient';

export class AxiosHttpClient implements IHttpClient {
  private get client(): AxiosInstance {
    // luôn lấy instance từ AppConfig (đã memoize/rebuild khi cần)
    return AppConfig.getInstance().getAxios();
  }

  // tuỳ trường hợp bạn muốn ép rebuild
  rebuild() {
    AppConfig.getInstance().rebuildAxios();
  }

  async get<T = any>(u: string, p?: any) {
    return (await this.client.get(u, {params: p})).data as T;
  }
  async post<T = any>(u: string, b?: any) {
    return (await this.client.post(u, b)).data as T;
  }
  async put<T = any>(u: string, b?: any) {
    return (await this.client.put(u, b)).data as T;
  }
  async delete<T = any>(u: string) {
    return (await this.client.delete(u)).data as T;
  }
}
