// social.ts — 카카오 / Apple 소셜 로그인 추상화
// 카카오: SDK·SPM 의존성 없는 웹 OAuth(REST) 방식 (kakaoOAuth.ts 위임)
// Apple : @capacitor-community/apple-sign-in (SPM 지원)
import { Capacitor } from '@capacitor/core';
import { SignInWithApple } from '@capacitor-community/apple-sign-in';
import { kakaoOAuthLogin } from './kakaoOAuth';

const APPLE_CLIENT_ID = import.meta.env.VITE_APPLE_CLIENT_ID as string | undefined;
const APPLE_REDIRECT = import.meta.env.VITE_APPLE_REDIRECT_URI as string | undefined;

const isNative = Capacitor.isNativePlatform();

/** 카카오 로그인 → access_token 반환 (백엔드 /api/auth/kakao 로 전달) */
export async function kakaoLogin(): Promise<string | null> {
  return kakaoOAuthLogin();
}

/** Apple 로그인 → identityToken 반환 (백엔드 /api/auth/apple 로 전달) */
export async function appleLogin(): Promise<{ identityToken: string; name?: string | null } | null> {
  // 네이티브 iOS: Sign in with Apple capability 필요
  if (isNative || APPLE_CLIENT_ID) {
    try {
      const opts = isNative
        ? { requestedScopes: ['name', 'email'] as string[] }
        : {
            clientId: APPLE_CLIENT_ID!,
            redirectURI: APPLE_REDIRECT || window.location.origin,
            scopes: 'name email',
            state: 'doran',
          };
      // @ts-expect-error 네이티브/웹 옵션 형태가 다름 — 플러그인이 런타임 분기 처리
      const res = await SignInWithApple.authorize(opts);
      const token = res?.response?.identityToken;
      const name = [res?.response?.givenName, res?.response?.familyName].filter(Boolean).join(' ') || null;
      return token ? { identityToken: token, name } : null;
    } catch (e) {
      console.warn('[apple] login failed', e);
      return null;
    }
  }
  // 폴백(개발용)
  const t = promptToken('Apple identityToken (개발용 — Apple 설정 미구성)');
  return t ? { identityToken: t } : null;
}

function promptToken(label: string): string | null {
  if (typeof window === 'undefined') return null;
  return window.prompt(label);
}
