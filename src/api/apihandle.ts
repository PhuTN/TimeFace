// src/api/apihandle.ts
import { http } from './http';
import { ApiCommand } from './core/ApiCommand';
import type { Endpoint } from './core/ApiEndpoint';

type CallStatus = {
  isError: boolean;
  errorMessage?: string;
  errorCode?: string | number;
  httpStatus?: number;
};

class ApiHandle {
  callApi(endpoint: Endpoint, payload?: any) {
    const [method, path] = endpoint;

    console.log(
      `%c[API CALL] → ${method} ${path}`,
      'color:#0af; font-weight:bold;',
      '\nPayload:',
      payload ?? '(none)'
    );

    return {
      response: async (cb: (status: CallStatus, res?: any) => void) => {
        try {
          const res = await ApiCommand.run(http, method, path, payload);

          console.log(
            `%c[API SUCCESS] ← ${method} ${path}`,
            'color:#0a0; font-weight:bold;',
            '\nResponse:',
            res,
          );

          cb({ isError: false }, res);
        } catch (e: any) {
          console.log(
            `%c[API ERROR] ← ${method} ${path}`,
            'color:#f00; font-weight:bold;',
            '\nError:',
            e,
          );

          cb(
            {
              isError: true,
              errorMessage: e?.message,
              errorCode: e?.code,
              httpStatus: e?.status,
            },
            e?.data,
          );
        }
      },

      asPromise: async (): Promise<{ status: CallStatus; res?: any }> => {
        try {
          const res = await ApiCommand.run(http, method, path, payload);

          console.log(
            `%c[API SUCCESS] ← ${method} ${path}`,
            'color:#0a0; font-weight:bold;',
            '\nResponse:',
            res,
          );

          return { status: { isError: false }, res };
        } catch (e: any) {
          console.log(
            `%c[API ERROR] ← ${method} ${path}`,
            'color:#f00; font-weight:bold;',
            '\nError:',
            e,
          );

          return {
            status: {
              isError: true,
              errorMessage: e?.message,
              errorCode: e?.code,
              httpStatus: e?.status,
            },
            res: e?.data,
          };
        }
      },
    };
  }
}

export const apiHandle = new ApiHandle();
