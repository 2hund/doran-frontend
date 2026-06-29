// token.ts — JWT 액세스/리프레시 토큰 저장소 (localStorage 기반)
const ACCESS_KEY = 'doran.accessToken';
const REFRESH_KEY = 'doran.refreshToken';

export const tokenStore = {
  get access() {
    return localStorage.getItem(ACCESS_KEY);
  },
  get refresh() {
    return localStorage.getItem(REFRESH_KEY);
  },
  set({ accessToken, refreshToken }: { accessToken?: string | null; refreshToken?: string | null }) {
    if (accessToken !== undefined) {
      if (accessToken) localStorage.setItem(ACCESS_KEY, accessToken);
      else localStorage.removeItem(ACCESS_KEY);
    }
    if (refreshToken !== undefined) {
      if (refreshToken) localStorage.setItem(REFRESH_KEY, refreshToken);
      else localStorage.removeItem(REFRESH_KEY);
    }
  },
  clear() {
    localStorage.removeItem(ACCESS_KEY);
    localStorage.removeItem(REFRESH_KEY);
  },
  get isAuthed() {
    return !!localStorage.getItem(ACCESS_KEY);
  },
};
