// src/api/apihandle.ts
import {http} from './http';
import {ApiCommand} from './core/ApiCommand';
import type {Endpoint} from './core/ApiEndpoint';

type CallStatus = {
  isError: boolean;
  errorMessage?: string;
  errorCode?: string | number;
  httpStatus?: number;
};

class ApiHandle {
  // ⬇️ đổi kiểu tham số sang Endpoint (readonly tuple)
  callApi(endpoint: Endpoint, payload?: any) {
    const [method, path] = endpoint; // OK với readonly

    return {
      response: async (cb: (status: CallStatus, res?: any) => void) => {
        try {
          const res = await ApiCommand.run(http, method, path, payload);
          cb({isError: false}, res);
        } catch (e: any) {
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

      asPromise: async (): Promise<{status: CallStatus; res?: any}> => {
        try {
          const res = await ApiCommand.run(http, method, path, payload);
          return {status: {isError: false}, res};
        } catch (e: any) {
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
