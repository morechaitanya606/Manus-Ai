import { useAuthStore } from '../stores/auth-store';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001/api/v1';

export interface RequestOptions extends Omit<RequestInit, 'body'> {
  token?: string;
  tenantId?: string;
  body?: BodyInit | Record<string, unknown> | null;
  params?: Record<string, string | number | boolean | undefined>;
}

export async function apiFetch<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const headers = new Headers(options.headers);

  const token = options.token || useAuthStore.getState().accessToken;
  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  const tenantId = options.tenantId || useAuthStore.getState().user?.tenantId;
  if (tenantId) {
    headers.set('x-tenant-id', tenantId);
  }

  let finalBody: BodyInit | null | undefined = undefined;
  if (options.body && typeof options.body === 'object' && !(options.body instanceof FormData) && !(options.body instanceof Blob)) {
    headers.set('Content-Type', 'application/json');
    finalBody = JSON.stringify(options.body);
  } else if (options.body) {
    finalBody = options.body as BodyInit;
  }

  let url = `${API_URL}${path}`;
  if (options.params) {
    const searchParams = new URLSearchParams();
    for (const [key, value] of Object.entries(options.params)) {
      if (value !== undefined) {
        searchParams.set(key, String(value));
      }
    }
    const qs = searchParams.toString();
    if (qs) url += `?${qs}`;
  }

  const response = await fetch(url, {
    ...options,
    headers,
    body: finalBody,
    cache: 'no-store',
  });

  const data = await response.json();

  if (!response.ok) {
    const message = data?.message || data?.error || `Request failed (${response.status})`;
    throw new Error(message);
  }

  return data as T;
}

export { API_URL };
