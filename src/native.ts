// native.ts — Capacitor 네이티브 초기화 (웹 환경에서는 no-op)
// 상태바 색/스타일, 스플래시 숨김, Android 하드웨어 뒤로가기 처리
import { Capacitor } from '@capacitor/core';
import { StatusBar, Style } from '@capacitor/status-bar';
import { SplashScreen } from '@capacitor/splash-screen';
import { App } from '@capacitor/app';

export function isNative() {
  return Capacitor.isNativePlatform();
}

export async function initNative() {
  if (!isNative()) return;

  // 상태바: 아이보리 배경 위 어두운 글자
  try {
    await StatusBar.setStyle({ style: Style.Light }); // Light = 어두운 글자
    if (Capacitor.getPlatform() === 'android') {
      await StatusBar.setBackgroundColor({ color: '#FFF8EF' });
      // 콘텐츠가 상태바 아래로 흐르지 않게 (CSS safe-area 와 함께 동작)
      await StatusBar.setOverlaysWebView({ overlay: false });
    }
  } catch { /* 플러그인 미탑재 환경 무시 */ }

  // 첫 화면 렌더 후 스플래시 숨김
  try { await SplashScreen.hide(); } catch { /* noop */ }

  // Android 하드웨어 뒤로가기: 히스토리가 있으면 뒤로, 없으면 앱 종료
  if (Capacitor.getPlatform() === 'android') {
    App.addListener('backButton', ({ canGoBack }) => {
      if (canGoBack) window.history.back();
      else App.exitApp();
    });
  }
}
