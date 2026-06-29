import type { CapacitorConfig } from '@capacitor/cli';

// Capacitor 설정 — iOS/Android 네이티브 앱으로 패키징할 때 사용.
// 네이티브 플랫폼 추가:  npx cap add ios   /   npx cap add android
// 웹 빌드 후 동기화:      npm run build && npx cap sync
const config: CapacitorConfig = {
  appId: 'com.dorandoran.app',
  appName: '도란도란',
  webDir: 'dist',
  backgroundColor: '#FFF8EF',
  ios: {
    // 콘텐츠가 노치/홈 인디케이터와 겹치지 않도록 safe-area 는 CSS(env())로 처리
    contentInset: 'never',
    backgroundColor: '#FFF8EF',
  },
  android: {
    backgroundColor: '#FFF8EF',
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 1200,
      backgroundColor: '#1F4D3A',
      androidScaleType: 'CENTER_CROP',
      showSpinner: false,
      splashImmersive: true,
    },
    StatusBar: {
      // 아이보리 배경 위 어두운 글자
      style: 'LIGHT',
      backgroundColor: '#FFF8EF',
    },
    Keyboard: {
      resize: 'native',
    },
  },
};

export default config;
