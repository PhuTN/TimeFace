// src/api/core/ApiCommand.ts
import type { IHttpClient } from './IHttpClient';

export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
export class ApiCommand<TRes = any> {
  constructor(
    private method: HttpMethod,
    private path: string,
    private payload?: any,
  ) {}

    private async call(client: IHttpClient) {
  switch (this.method) {
    case 'GET': return client.get(this.path, this.payload);
    case 'POST': return client.post(this.path, this.payload);
    case 'PUT': return client.put(this.path, this.payload);
    case 'DELETE': return client.delete(this.path);
    case 'PATCH': return client.patch(this.path, this.payload);
    default: throw new Error('Unsupported HTTP method');
  }
}


  async execute(client: IHttpClient): Promise<TRes> {
    return await this.call(client);
  }

  static run<TRes = any>(
    client: IHttpClient,
    method: HttpMethod,
    path: string,
    payload?: any,
  ) {
    return new ApiCommand<TRes>(method, path, payload).execute(client);
  }
}
