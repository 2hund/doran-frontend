// KakaoCallback.tsx — 웹 카카오 OAuth 리다이렉트 콜백 (/oauth/kakao)
// 카카오가 ?code= 를 붙여 돌려보내면, 토큰 교환 후 백엔드 로그인까지 진행한다.
import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { finishKakaoWebLogin } from '../api/kakaoOAuth';
import { authApi } from '../api/endpoints';

export function KakaoCallback() {
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);
  const ran = useRef(false);

  useEffect(() => {
    if (ran.current) return;
    ran.current = true;
    (async () => {
      try {
        const accessToken = await finishKakaoWebLogin();
        if (!accessToken) { setError('카카오 인증 코드를 받지 못했어요.'); return; }
        await authApi.kakao({ accessToken });
        navigate('/', { replace: true });
      } catch (e) {
        setError((e as Error).message || '로그인에 실패했어요.');
      }
    })();
  }, [navigate]);

  return (
    <div className="screen auth-start" style={{ alignItems: 'center', justifyContent: 'center' }}>
      <div className="start-body" style={{ gap: 16 }}>
        {error ? (
          <>
            <p className="start-tag" style={{ color: '#FFD9CC' }}>{error}</p>
            <button className="btn-light press" onClick={() => navigate('/auth', { replace: true })}>로그인으로 돌아가기</button>
          </>
        ) : (
          <p className="start-tag">카카오 로그인 중…</p>
        )}
      </div>
    </div>
  );
}
