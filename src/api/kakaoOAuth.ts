// kakaoOAuth.ts — 카카오 OAuth (REST) 방식 로그인
// SDK·SPM 의존성 없이 iOS/Android/웹 동일하게 동작한다.
//   1) 카카오 인가 페이지를 (네이티브)인앱 브라우저 / (웹)리다이렉트로 띄움
//   2) redirect_uri 로 돌아온 인가코드(code) 수신
//   3) code → access_token 교환 (카카오 token 엔드포인트)
//   4) access_token 을 백엔드 /api/auth/kakao 로 전달 (호출은 auth 화면에서)
import { Capacitor } from '@capacitor/core';
import { Browser } from '@capacitor/browser';
import { App } from '@capacitor/app';

const REST_KEY = import.meta.env.VITE_KAKAO_REST_KEY as string | undefined;
// 네이티브는 커스텀 스킴, 웹은 현재 오리진 기준 콜백
const REDIRECT_URI = (import.meta.env.VITE_KAKAO_REDIRECT_URI as string | undefined)
  || (Capacitor.isNativePlatform() ? 'com.dorandoran.app://oauth/kakao' : `${window.location.origin}/oauth/kakao`);

const AUTHORIZE = 'https://kauth.kakao.com/oauth/authorize';
const TOKEN = 'https://kauth.kakao.com/oauth/token';

function authorizeUrl() {
  const p = new URLSearchParams({
    client_id: REST_KEY ?? '',
    redirect_uri: REDIRECT_URI,
    response_type: 'code',
  });
  return `${AUTHORIZE}?${p.toString()}`;
}

/** 인가코드 → access_token 교환 */
async function exchangeToken(code: string): Promise<string | null> {
  const body = new URLSearchParams({
    grant_type: 'authorization_code',
    client_id: REST_KEY ?? '',
    redirect_uri: REDIRECT_URI,
    code,
  });
  const res = await fetch(TOKEN, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded;charset=utf-8' },
    body,
  });
  if (!res.ok) return null;
  const data = await res.json().catch(() => null);
  return data?.access_token ?? null;
}

/** 콜백 URL 에서 ?code= 추출 */
function codeFromUrl(url: string): string | null {
  try { return new URL(url).searchParams.get('code'); } catch { return null; }
}

/**
 * 카카오 로그인 실행 → 카카오 access_token 반환 (실패 시 null)
 * - 네이티브: 인앱 브라우저 + appUrlOpen(딥링크)로 코드 수신
 * - 웹: 같은 창 리다이렉트 (콜백 페이지에서 finishKakaoWebLogin 처리)
 */
export async function kakaoOAuthLogin(): Promise<string | null> {
  if (!REST_KEY) {
    // 키 미설정 — 개발용 폴백: access_token 직접 입력
    return window.prompt('카카오 access_token (개발용 — VITE_KAKAO_REST_KEY 미설정)');
  }

  if (Capacitor.isNativePlatform()) {
    return new Promise<string | null>((resolve) => {
      let done = false;
      const sub = App.addListener('appUrlOpen', async ({ url }) => {
        if (done || !url.startsWith('com.dorandoran.app://oauth/kakao')) return;
        done = true;
        sub.then(h => h.remove());
        await Browser.close().catch(() => {});
        const code = codeFromUrl(url);
        resolve(code ? await exchangeToken(code) : null);
      });
      Browser.open({ url: authorizeUrl(), presentationStyle: 'popover' }).catch(() => resolve(null));
    });
  }

  // 웹: 콜백 경로로 리다이렉트 → 돌아오면 finishKakaoWebLogin() 가 처리
  window.location.href = authorizeUrl();
  return null; // 리다이렉트되므로 이 줄은 사실상 도달 안 함
}

/**
 * 웹 콜백 처리 — /oauth/kakao 진입 시 호출.
 * code 가 있으면 토큰 교환 후 access_token 반환, 없으면 null.
 */
export async function finishKakaoWebLogin(): Promise<string | null> {
  const code = codeFromUrl(window.location.href);
  if (!code) return null;
  return exchangeToken(code);
}

export const kakaoConfigured = !!REST_KEY;
