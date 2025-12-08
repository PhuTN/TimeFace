import {http} from './http';
import {ApiCommand} from './core/ApiCommand';
import type {Endpoint} from './core/ApiEndpoint';
import Toast from 'react-native-toast-message';

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
      payload ?? '(none)',
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

          cb({isError: false}, res);
        } catch (e: any) {
          console.log(
            `%c[API ERROR] ← ${method} ${path}`,
            'color:#f00; font-weight:bold;',
            '\nError:',
            e,
          );

          // ⭐ AUTO TOAST ERROR
          const msg =
            e?.data?.message ||
            e?.data?.error ||
            e?.message ||
            'Đã xảy ra lỗi từ máy chủ';

          Toast.show({
            type: 'error',
            text1: 'Lỗi API',
            text2: msg,
          });

          cb(
            {
              isError: true,
              errorMessage: msg,
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

          console.log(
            `%c[API SUCCESS] ← ${method} ${path}`,
            'color:#0a0; font-weight:bold;',
            '\nResponse:',
            res,
          );

          return {status: {isError: false}, res};
        } catch (e: any) {
          console.log(
            `%c[API ERROR] ← ${method} ${path}`,
            'color:#f00; font-weight:bold;',
            '\nError:',
            e,
          );

          // ⭐ AUTO TOAST ERROR
          const msg = e || 'Đã xảy ra lỗi từ máy chủ';

          Toast.show({
            type: 'error',
            text1: 'Lỗi API',
            text2: msg,
          });

          return {
            status: {
              isError: true,
              errorMessage: msg,
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
