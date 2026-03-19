import { tokenStore } from '../auth/token-store';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000';
let refreshPromise: Promise<string | null> | null = null;

const parseResponse = async <T>(res: Response): Promise<T> => {
  if (res.status === 204) {
    return undefined as T;
  }

  const contentType = res.headers.get('content-type') ?? '';
  if (contentType.includes('application/json')) {
    return (await res.json()) as T;
  }

  return (await res.text()) as T;
};

const refreshAccessToken = async (): Promise<string | null> => {
  if (!refreshPromise) {
    refreshPromise = (async () => {
      const res = await fetch(`${API_BASE_URL}/auth/refresh`, {
        method: 'POST',
        credentials: 'include'
      });

      if (!res.ok) {
        tokenStore.clear();
        return null;
      }

      const data = (await res.json()) as { accessToken: string };
      tokenStore.set(data.accessToken);
      return data.accessToken;
    })().finally(() => {
      refreshPromise = null;
    });
  }

  return refreshPromise;
};

export const apiClient = {
  async request<T>(
    path: string,
    options: RequestInit & { skipAuth?: boolean; retryOn401?: boolean } = {}
  ): Promise<T> {
    const headers = new Headers(options.headers);

    if (!options.skipAuth) {
      const token = tokenStore.get();
      if (token) {
        headers.set('Authorization', `Bearer ${token}`);
      }
    }

    if (!headers.has('Content-Type') && options.body) {
      headers.set('Content-Type', 'application/json');
    }

    const res = await fetch(`${API_BASE_URL}${path}`, {
      ...options,
      headers,
      credentials: 'include'
    });

    if (res.status === 401 && !options.skipAuth && options.retryOn401 !== false) {
      const newToken = await refreshAccessToken();

      if (newToken) {
        return this.request<T>(path, { ...options, retryOn401: false });
      }
    }

    if (!res.ok) {
      const data: { error?: { message?: string } } = await parseResponse<{ error?: { message?: string } }>(
        res
      ).catch(() => ({}));
      throw new Error(data.error?.message ?? `Request failed (${res.status})`);
    }

    return parseResponse<T>(res);
  }
};
