// src/services/authStorage.ts
import AsyncStorage from '@react-native-async-storage/async-storage';
import { AuthUser } from '../types/api';


const TOKEN_KEY = 'auth.token';
const USER_KEY  = 'auth.user';

export type AuthState = {
  token: string;
  user: AuthUser;
};

export const authStorage = {
  async save(state: AuthState) {
    try {
      await AsyncStorage.setItem(TOKEN_KEY, state.token);
      await AsyncStorage.setItem(USER_KEY, JSON.stringify(state.user));
    } catch (err) {
      console.error('authStorage.save error:', err);
    }
  },

  async load(): Promise<AuthState | null> {
    try {
      const token = await AsyncStorage.getItem(TOKEN_KEY);
      const raw = await AsyncStorage.getItem(USER_KEY);
      if (!token || !raw) return null;
      const user = JSON.parse(raw) as AuthUser;
      return { token, user };
    } catch (err) {
      console.error('authStorage.load error:', err);
      return null;
    }
  },

  async clear() {
    try {
      await AsyncStorage.removeItem(TOKEN_KEY);
      await AsyncStorage.removeItem(USER_KEY);
    } catch (err) {
      console.error('authStorage.clear error:', err);
    }
  },

  async getToken(): Promise<string> {
    try {
      return (await AsyncStorage.getItem(TOKEN_KEY)) || '';
    } catch {
      return '';
    }
  },

  async getUser(): Promise<AuthUser | null> {
    try {
      const raw = await AsyncStorage.getItem(USER_KEY);
      return raw ? (JSON.parse(raw) as AuthUser) : null;
    } catch {
      return null;
    }
  },
};
