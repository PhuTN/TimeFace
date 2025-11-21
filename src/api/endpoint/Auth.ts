import { ep } from '../core/ApiEndpoint';

export const Auth = {
  Register:         ep('POST', 'auth', 'register'),
  RegisterNoVerify: ep('POST', 'auth', 'register-no-verify'),
  ResendCode:       ep('POST', 'auth', 'resend-code'),
  Verify:           ep('POST', 'auth', 'verify'),
  Login:            ep('POST', 'auth', 'login'),
  ChangePassword:   ep('POST', 'auth', 'change-password'),
  ForgotPassword:   ep('POST', 'auth', 'forgot-password'),
  ResetPassword:    ep('POST', 'auth', 'reset-password'),
} as const;
