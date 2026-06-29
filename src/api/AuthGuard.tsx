// AuthGuard.tsx — 인증 필요 라우트 보호 + 전역 401 핸들러 연결
import { useEffect, type ReactNode } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { setUnauthorizedHandler } from './client';
import { tokenStore } from './token';

/** 앱 최상단에 한 번 마운트: 401 발생 시 로그인 화면으로 보냄 */
export function UnauthorizedBridge() {
  const navigate = useNavigate();
  useEffect(() => {
    setUnauthorizedHandler(() => navigate('/auth', { replace: true }));
    return () => setUnauthorizedHandler(() => {});
  }, [navigate]);
  return null;
}

/** 로그인 필요한 화면 래퍼 */
export function RequireAuth({ children }: { children: ReactNode }) {
  if (!tokenStore.isAuthed) return <Navigate to="/auth" replace />;
  return <>{children}</>;
}
