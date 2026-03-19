import { apiClient } from './client';
import { tokenStore } from '../auth/token-store';
import type { AuthResponse, User } from '../../types';

interface LoginPayload {
  email: string;
  password: string;
}

interface RegisterPayload extends LoginPayload {
  name?: string;
}

export const authApi = {
  async login(payload: LoginPayload) {
    const data = await apiClient.request<AuthResponse>('/auth/login', {
      method: 'POST',
      body: JSON.stringify(payload),
      skipAuth: true
    });

    tokenStore.set(data.accessToken);
    return data;
  },

  async register(payload: RegisterPayload) {
    const data = await apiClient.request<AuthResponse>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(payload),
      skipAuth: true
    });

    tokenStore.set(data.accessToken);
    return data;
  },

  async refresh() {
    const data = await apiClient.request<{ accessToken: string; accessTokenExpiresIn: string }>('/auth/refresh', {
      method: 'POST',
      skipAuth: true
    });

    tokenStore.set(data.accessToken);
    return data;
  },

  async logout() {
    await apiClient.request<void>('/auth/logout', {
      method: 'POST',
      skipAuth: true
    });
    tokenStore.clear();
  },

  async fetchMe(): Promise<User | null> {
    try {
      const data = await apiClient.request<{ user: User }>('/auth/me');
      return data.user;
    } catch {
      return null;
    }
  }
};
