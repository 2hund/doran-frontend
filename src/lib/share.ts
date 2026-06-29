// share.ts — 공유 / 클립보드 / 파일 선택 유틸 (API 불필요, 클라이언트 기능)
import { Capacitor } from '@capacitor/core';
import { Share } from '@capacitor/share';

/** 텍스트(+선택적 URL) 공유. 네이티브 → Capacitor Share, 웹 → Web Share, 폴백 → 클립보드 복사 */
export async function shareText(opts: { title?: string; text: string; url?: string }) {
  try {
    if (Capacitor.isNativePlatform()) {
      await Share.share({ title: opts.title, text: opts.text, url: opts.url, dialogTitle: opts.title });
      return true;
    }
    if (typeof navigator !== 'undefined' && navigator.share) {
      await navigator.share({ title: opts.title, text: opts.text, url: opts.url });
      return true;
    }
  } catch {
    // 사용자가 공유 시트를 닫은 경우 등 — 폴백으로 넘어감
  }
  return copyToClipboard(opts.url || opts.text);
}

/** 클립보드 복사 (성공 여부 반환) */
export async function copyToClipboard(value: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(value);
    return true;
  } catch {
    return false;
  }
}

/** 카카오톡 공유 — 네이티브 SDK 없이 동작하도록 일반 공유 시트로 위임 */
export async function shareToKakao(opts: { title?: string; text: string; url?: string }) {
  // 카카오 메시지 SDK 미연동 상태 — 시스템 공유 시트로 카카오톡 선택 가능
  return shareText(opts);
}

/** 파일(이미지) 선택 — input[type=file] 을 동적으로 띄워 File 반환 */
export function pickImage(opts: { multiple?: boolean } = {}): Promise<File[]> {
  return new Promise(resolve => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    if (opts.multiple) input.multiple = true;
    input.onchange = () => resolve(input.files ? Array.from(input.files) : []);
    // 취소 감지가 표준화돼 있지 않아, 값 없으면 빈 배열로 처리됨
    input.click();
  });
}
