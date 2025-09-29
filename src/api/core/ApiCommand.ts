import { IHttpClient } from "./IHttpClient";

export type HttpMethod = "GET" | "POST" | "PUT" | "DELETE";

/**
 * Command object: đóng gói một request API
 */
export class ApiCommand {
  constructor(
    private method: HttpMethod,
    private path: string,
    private payload?: any
  ) {}

  private async call(client: IHttpClient) {
    switch (this.method) {
      case "GET":    return client.get(this.path, this.payload);
      case "POST":   return client.post(this.path, this.payload);
      case "PUT":    return client.put(this.path, this.payload);
      case "DELETE": return client.delete(this.path);
      default: throw new Error("Unsupported HTTP method");
    }
  }

  async execute(client: IHttpClient): Promise<any> {
    return await this.call(client);
  }

  /** helper chạy nhanh không cần new */
  static run(client: IHttpClient, method: HttpMethod, path: string, payload?: any) {
    return new ApiCommand(method, path, payload).execute(client);
  }
}
