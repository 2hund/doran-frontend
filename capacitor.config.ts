import type { CapacitorConfig } from '@capacitor/cli';

// Capacitor 설정 — iOS/Android 네이티브 앱으로 패키징할 때 사용.
// 네이티브 플랫폼 추가:  npx cap add ios   /   npx cap add android
// 웹 빌드 후 동기화:      npm run build && npx cap sync
const config: CapacitorConfig = {
  appId: 'com.dorandoran.app',
  appName: '도란도란',
  webDir: 'dist',
  backgroundColor: '#FFF8EF',
};

export default config;
