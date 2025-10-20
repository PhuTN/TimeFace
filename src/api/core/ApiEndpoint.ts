// src/api/core/ApiEndpoint.ts
export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'DELETE';

// Endpoint kiểu readonly tuple (bất biến) + đảm bảo luôn có dấu '/'
export type Endpoint = readonly [HttpMethod, `/${string}`];

export function makeDefaultApi(base: string) {
  const b = base.replace(/^\/+|\/+$/g, '');
  return {
    Ins: ['POST', `/${b}`] as const satisfies Endpoint,
    Upd: ['PUT', `/${b}`] as const satisfies Endpoint,
    Del: ['DELETE', `/${b}`] as const satisfies Endpoint,
    GetAll: ['GET', `/${b}/getAll`] as const satisfies Endpoint,
    ById: ['GET', `/${b}/byId`] as const satisfies Endpoint,
    Search: ['POST', `/${b}/search`] as const satisfies Endpoint,
  };
}

export function ep(method: HttpMethod, base: string, suffix = ''): Endpoint {
  const b = base.replace(/^\/+|\/+$/g, '');
  const s = suffix.replace(/^\/+/, '');
  return [method, s ? `/${b}/${s}` : `/${b}`] as const;
}
