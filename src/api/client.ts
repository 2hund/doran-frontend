// client.ts — 도란 API fetch 래퍼
// - Bearer 토큰 자동 주입
// - 401 발생 시 refresh 토큰으로 1회 자동 재발급 후 재시도
// - 에러는 { message } 형태를 ApiError 로 변환
import { tokenStore } from './token';

const BASE = import.meta.env.VITE_API_BASE ?? 'https://vacation-api.2hund.com/doran';

export class ApiError extends Error {
  status: number;
  body: unknown;
  constructor(status: number, message: string, body?: unknown) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.body = body;
  }
}

type Options = Omit<RequestInit, 'body'> & { body?: unknown; auth?: boolean };

/** 401 핸들링용: 인증 만료 시 호출자에게 알림 (App 에서 로그인 화면으로 보냄) */
let onUnauthorized: (() => void) | null = null;
export function setUnauthorizedHandler(fn: () => void) {
  onUnauthorized = fn;
}

let refreshing: Promise<boolean> | null = null;

async function doRefresh(): Promise<boolean> {
  const refreshToken = tokenStore.refresh;
  if (!refreshToken) return false;
  // 동시 다발 401 시 refresh 는 한 번만
  if (!refreshing) {
    refreshing = (async () => {
      try {
        const res = await fetch(`${BASE}/api/auth/refresh`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ refreshToken }),
        });
        if (!res.ok) return false;
        const data = await res.json().catch(() => null);
        if (data?.accessToken) {
          tokenStore.set({ accessToken: data.accessToken, refreshToken: data.refreshToken ?? refreshToken });
          return true;
        }
        return false;
      } catch {
        return false;
      } finally {
        // 다음 사이클을 위해 초기화는 호출 끝난 뒤
        setTimeout(() => { refreshing = null; }, 0);
      }
    })();
  }
  return refreshing;
}

async function request<T>(path: string, opts: Options = {}, retry = true): Promise<T> {
  const { body, auth = true, headers, ...rest } = opts;
  const h = new Headers(headers);
  if (body !== undefined && !(body instanceof FormData)) h.set('Content-Type', 'application/json');
  if (auth && tokenStore.access) h.set('Authorization', `Bearer ${tokenStore.access}`);

  const res = await fetch(`${BASE}${path}`, {
    ...rest,
    headers: h,
    body: body === undefined ? undefined : body instanceof FormData ? body : JSON.stringify(body),
  });

  if (res.status === 401 && auth && retry) {
    const ok = await doRefresh();
    if (ok) return request<T>(path, opts, false);
    tokenStore.clear();
    onUnauthorized?.();
    throw new ApiError(401, 'Unauthorized');
  }

  if (!res.ok) {
    const errBody = await res.json().catch(() => null);
    const msg = (errBody && (errBody.message || errBody.error)) || `HTTP ${res.status}`;
    throw new ApiError(res.status, msg, errBody);
  }

  if (res.status === 204) return undefined as T;
  const text = await res.text();
  if (!text) return undefined as T;
  return JSON.parse(text) as T;
}

export const api = {
  get: <T>(path: string, opts?: Options) => request<T>(path, { ...opts, method: 'GET' }),
  post: <T>(path: string, body?: unknown, opts?: Options) => request<T>(path, { ...opts, method: 'POST', body }),
  put: <T>(path: string, body?: unknown, opts?: Options) => request<T>(path, { ...opts, method: 'PUT', body }),
  patch: <T>(path: string, body?: unknown, opts?: Options) => request<T>(path, { ...opts, method: 'PATCH', body }),
  del: <T>(path: string, opts?: Options) => request<T>(path, { ...opts, method: 'DELETE' }),
};
