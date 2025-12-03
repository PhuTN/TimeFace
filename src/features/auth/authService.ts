// src/features/auth/authService.ts
import { ApiCommand } from '../../api/core/ApiCommand';
import { http } from '../../api/http';
import { authStorage } from '../../services/authStorage';
import type { ApiResponse, AuthUser, LoginData } from '../../types/api';
import AppConfig from '../../appconfig/AppConfig';
import { navigationRef } from '../../navigation/NavigationService';

export async function login(email: string, password: string) {
  console.log('[authService] 🔑 Login called with:', { email });

  const res = await ApiCommand.run<ApiResponse<LoginData>>(
    http,
    'POST',
    '/auth/login',
    { email, password }
  );

  console.log('[authService] 📡 API response:', res);

  if (!res.success || !res.data) {
    console.error('[authService] ❌ Login failed:', res.error || 'Unknown error');
    throw new Error(res.error || 'Login failed');
  }

  const { user, token } = res.data;
  if ((user as any)?.password) {
    console.warn('[authService] ⚠️ Backend returned password field — removing for safety');
    // @ts-ignore
    delete (user as any).password;
  }

  console.log('[authService] 💾 Saving auth data to storage...');
  await authStorage.save({ token, user });

  console.log('[authService] 🔄 Setting token in AppConfig...');
  AppConfig.getInstance().setAuthToken(token, { rebuildAxios: true });

  console.log('[authService] ✅ Login successful:', { token, user });
  return { token, user };
}

export async function logout() {
  console.log('[authService] 🚪 Logging out...');

  await authStorage.clear();
  AppConfig.getInstance().setAuthToken(null, { rebuildAxios: true });

  console.log('[authService] ⛔ Redirecting to Login...');

  // Điều hướng cứng về màn Login (reset stack)
  if (navigationRef.isReady()) {
    navigationRef.reset({
      index: 0,
      routes: [{ name: 'Login' }],
    });
  }
}


export async function getSession() {
  console.log('[authService] 🔍 Loading session from storage...');
  const session = await authStorage.load();
  console.log('[authService] 📦 Session loaded:', session);
  return session;
}

export async function fetchMe(): Promise<AuthUser> {
  console.log('[authService] 🌐 Fetching /sys-test/me...');
  const res = await ApiCommand.run<ApiResponse<AuthUser>>(http, 'GET', '/sys-test/me');

  console.log('[authService] 📡 API response (fetchMe):', res);

  if (!res.success || !res.data) {
    console.error('[authService] ❌ FetchMe failed:', res.error || 'Unknown error');
    throw new Error(res.error || 'Fetch me failed');
  }

  const user = res.data;
  const token = await authStorage.getToken();
  console.log('[authService] 💾 Saving refreshed user to storage:', user);

  await authStorage.save({ token, user });

  console.log('[authService] ✅ User refreshed:', user);
  return user;
}
