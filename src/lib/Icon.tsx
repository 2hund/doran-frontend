// Icon.tsx — 도란도란 라인 아이콘 세트 (1.9 stroke)
import type { CSSProperties, ReactNode } from 'react';

export type IconName =
  | 'search' | 'bell' | 'plus' | 'chevron' | 'steps' | 'medal' | 'cheer' | 'chat'
  | 'check' | 'calendar' | 'clock' | 'gift' | 'link' | 'home' | 'people' | 'family'
  | 'diary' | 'trophy' | 'user' | 'pill' | 'heart' | 'arrow' | 'leaf' | 'close'
  | 'camera' | 'image' | 'send' | 'edit' | 'trash' | 'share' | 'copy' | 'qr'
  | 'lock' | 'shield' | 'info' | 'logout' | 'dots' | 'filter' | 'mappin' | 'crown'
  | 'flame' | 'bookmark' | 'sun' | 'chart' | 'eye' | 'eyeoff' | 'mail' | 'phone' | 'key';

interface IconProps {
  name: IconName;
  size?: number;
  color?: string;
  sw?: number;
  fill?: string;
  style?: CSSProperties;
}

export function Icon({ name, size = 22, color = 'currentColor', sw = 1.9, fill = 'none', style }: IconProps) {
  const p = {
    fill: 'none' as const, stroke: color, strokeWidth: sw,
    strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const,
  };
  const paths: Record<IconName, ReactNode> = {
    search: <><circle cx="11" cy="11" r="7" {...p} /><path d="M20 20l-3.5-3.5" {...p} /></>,
    bell: <><path d="M18 8a6 6 0 1 0-12 0c0 6-2.5 7-2.5 7h17S18 14 18 8Z" {...p} /><path d="M10 19a2.2 2.2 0 0 0 4 0" {...p} /></>,
    plus: <><path d="M12 6v12M6 12h12" {...p} /></>,
    chevron: <><path d="M9 5l7 7-7 7" {...p} /></>,
    steps: <><path d="M8.5 14.5c-1.8 0-2.5-1.5-2.5-3.2 0-2 .4-4.3 0-6C5.7 3.6 6.7 3 7.7 3c1.2 0 1.8 1 1.9 2.4.1 1.6-.2 3.2.3 4.8.4 1.3.2 4.3-1.4 4.3Z" {...p} /><path d="M8.2 17.5c0 1.4-.5 2.5-1.9 2.5-1.2 0-1.8-.9-1.8-2 0-.8.6-1.6 1.6-1.7" {...p} /><path d="M15.5 12.5c1.8 0 2.5-1.5 2.5-3.2 0-2-.4-4.3 0-6C18.3 1.6 17.3 1 16.3 1c-1.2 0-1.8 1-1.9 2.4-.1 1.6.2 3.2-.3 4.8-.4 1.3-.2 4.3 1.4 4.3Z" {...p} transform="translate(0 3)" /></>,
    medal: <><circle cx="12" cy="14" r="6" {...p} /><path d="M9 8.5L6.5 3M15 8.5L17.5 3M10 14l1.4 1.4L14 12.8" {...p} /></>,
    cheer: <><path d="M12 20.5s-7-4.3-7-9.4C5 8.4 6.9 6.8 9 6.8c1.6 0 2.5.9 3 1.7.5-.8 1.4-1.7 3-1.7 2.1 0 4 1.6 4 4.3 0 5.1-7 9.4-7 9.4Z" {...p} /></>,
    chat: <><path d="M20 12a8 8 0 0 1-11.6 7.1L4 20l1-4.2A8 8 0 1 1 20 12Z" {...p} /></>,
    check: <><path d="M5 12.5l4.5 4.5L19 7" {...p} /></>,
    calendar: <><rect x="4" y="5" width="16" height="15" rx="3" {...p} /><path d="M4 9.5h16M8.5 3v4M15.5 3v4" {...p} /></>,
    clock: <><circle cx="12" cy="12" r="8" {...p} /><path d="M12 8v4.3l2.8 1.7" {...p} /></>,
    gift: <><path d="M5 11.5h14V19a1.5 1.5 0 0 1-1.5 1.5h-11A1.5 1.5 0 0 1 5 19v-7.5Z" {...p} /><path d="M3.5 8.5h17v3h-17zM12 8.5v12" {...p} /><path d="M12 8.5S11 4 8.7 4C7.3 4 6.8 5 6.8 5.9 6.8 7.6 9 8.5 12 8.5Zm0 0S13 4 15.3 4c1.4 0 1.9 1 1.9 1.9C17.2 7.6 15 8.5 12 8.5Z" {...p} /></>,
    link: <><path d="M14 11a4 4 0 0 0-5.6 0l-3 3a4 4 0 0 0 5.6 5.6l1-1" {...p} /><path d="M10 13a4 4 0 0 0 5.6 0l3-3A4 4 0 0 0 13 4.4l-1 1" {...p} /></>,
    home: <><path d="M4 11.5 12 4l8 7.5" {...p} /><path d="M6 10.5V19a1 1 0 0 0 1 1h10a1 1 0 0 0 1-1v-8.5" {...p} /></>,
    people: <><circle cx="9" cy="8.5" r="3.2" {...p} /><path d="M3.5 19c0-3 2.5-4.8 5.5-4.8s5.5 1.8 5.5 4.8" {...p} /><path d="M16 6.2a3 3 0 0 1 0 5.6M17.5 18.8c0-2.4-1.3-4-3.3-4.6" {...p} /></>,
    family: <><circle cx="12" cy="7" r="3" {...p} /><path d="M12 11.5c2.6 0 4.4 1.6 4.7 4M5 20c0-3.2 2-5 4.3-5.4" {...p} /><circle cx="6.5" cy="13.5" r="2" {...p} /><circle cx="17.5" cy="13.5" r="2" {...p} /></>,
    diary: <><rect x="5" y="3.5" width="14" height="17" rx="2.5" {...p} /><path d="M9 8h6M9 11.5h6M9 15h3.5" {...p} /></>,
    trophy: <><path d="M8 4h8v4a4 4 0 0 1-8 0V4Z" {...p} /><path d="M8 5.5H5.5V7A2.5 2.5 0 0 0 8 9.5M16 5.5h2.5V7A2.5 2.5 0 0 1 16 9.5M12 12.5v3M9 20h6M10 17.5h4" {...p} /></>,
    user: <><circle cx="12" cy="8" r="3.4" {...p} /><path d="M5.5 20c0-3.4 2.9-5.6 6.5-5.6s6.5 2.2 6.5 5.6" {...p} /></>,
    pill: <><rect x="3.5" y="9" width="17" height="6" rx="3" {...p} transform="rotate(-45 12 12)" /><path d="M12 7.7 16.3 12" {...p} /></>,
    heart: <><path d="M12 20s-7-4.3-7-9.4C5 8 6.9 6.4 9 6.4c1.6 0 2.5.9 3 1.7.5-.8 1.4-1.7 3-1.7 2.1 0 4 1.6 4 4.2 0 5.1-7 9.4-7 9.4Z" {...p} /></>,
    arrow: <><path d="M5 12h14M13 6l6 6-6 6" {...p} /></>,
    leaf: <><path d="M19.5 4.5C10 4.5 4.5 10.5 4.5 19.5c9 0 15-5.5 15-15Z" {...p} /><path d="M8.5 15.5c2.2-2.8 5-4.6 8.5-6" {...p} /></>,
    close: <><path d="M6 6l12 12M18 6L6 18" {...p} /></>,
    camera: <><path d="M4 8.5h3l1.5-2.2h7L17 8.5h3a1 1 0 0 1 1 1V18a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V9.5a1 1 0 0 1 1-1Z" {...p} /><circle cx="12" cy="13.2" r="3.4" {...p} /></>,
    image: <><rect x="3.5" y="5" width="17" height="14" rx="2.5" {...p} /><circle cx="8.5" cy="10" r="1.7" {...p} /><path d="M5 17l4.5-4.2 3 2.6L16 11l3 3.4" {...p} /></>,
    send: <><path d="M20 4 3.5 11.2l6.5 2M20 4l-2.2 16-3.8-5.8M20 4 10 13.2v3.8" {...p} /></>,
    edit: <><path d="M16.5 4.5l3 3L8 19l-4 1 1-4L16.5 4.5Z" {...p} /><path d="M14.5 6.5l3 3" {...p} /></>,
    trash: <><path d="M5 7h14M9.5 7V5.5a1 1 0 0 1 1-1h3a1 1 0 0 1 1 1V7M7 7l.8 11a1.5 1.5 0 0 0 1.5 1.4h5.4A1.5 1.5 0 0 0 16.2 18L17 7" {...p} /></>,
    share: <><circle cx="6" cy="12" r="2.6" {...p} /><circle cx="17" cy="6" r="2.6" {...p} /><circle cx="17" cy="18" r="2.6" {...p} /><path d="M8.3 10.9l6.4-3.6M8.3 13.1l6.4 3.6" {...p} /></>,
    copy: <><rect x="8" y="8" width="11" height="11" rx="2.5" {...p} /><path d="M5 15.5V6a1.5 1.5 0 0 1 1.5-1.5H15" {...p} /></>,
    qr: <><rect x="4" y="4" width="6" height="6" rx="1.2" {...p} /><rect x="14" y="4" width="6" height="6" rx="1.2" {...p} /><rect x="4" y="14" width="6" height="6" rx="1.2" {...p} /><path d="M14 14h2.5v2.5M20 14v.1M14 20h2.5M19.5 17.5V20H17" {...p} /></>,
    lock: <><rect x="5" y="10.5" width="14" height="9.5" rx="2.5" {...p} /><path d="M8 10.5V8a4 4 0 0 1 8 0v2.5" {...p} /></>,
    shield: <><path d="M12 3.5l7 2.5v5c0 4.5-3 7.7-7 9-4-1.3-7-4.5-7-9v-5l7-2.5Z" {...p} /><path d="M9 12l2 2 4-4" {...p} /></>,
    info: <><circle cx="12" cy="12" r="8.5" {...p} /><path d="M12 11v5.5M12 7.8v.1" {...p} /></>,
    logout: <><path d="M14 7.5V5.5A1.5 1.5 0 0 0 12.5 4h-6A1.5 1.5 0 0 0 5 5.5v13A1.5 1.5 0 0 0 6.5 20h6a1.5 1.5 0 0 0 1.5-1.5v-2M10 12h10m0 0-3-3m3 3-3 3" {...p} /></>,
    dots: <><circle cx="5" cy="12" r="1.6" fill={color} stroke="none" /><circle cx="12" cy="12" r="1.6" fill={color} stroke="none" /><circle cx="19" cy="12" r="1.6" fill={color} stroke="none" /></>,
    filter: <><path d="M4 6h16M7 12h10M10 18h4" {...p} /></>,
    mappin: <><path d="M12 21s6-5.3 6-10a6 6 0 0 0-12 0c0 4.7 6 10 6 10Z" {...p} /><circle cx="12" cy="11" r="2.3" {...p} /></>,
    crown: <><path d="M4 8l3.5 3L12 5.5 16.5 11 20 8l-1.5 9h-13L4 8Z" {...p} /></>,
    flame: <><path d="M12 3.5s5 4 5 9a5 5 0 0 1-10 0c0-1.6.7-3 1.6-4 .2 1.2 1 2 1.9 2 0-2 .5-5 1.5-7Z" {...p} /></>,
    bookmark: <><path d="M7 4.5h10a1 1 0 0 1 1 1V20l-6-3.4L6 20V5.5a1 1 0 0 1 1-1Z" {...p} /></>,
    sun: <><circle cx="12" cy="12" r="4" {...p} /><path d="M12 3v2.5M12 18.5V21M4.5 12H2M22 12h-2.5M5.6 5.6l1.8 1.8M16.6 16.6l1.8 1.8M18.4 5.6l-1.8 1.8M7.4 16.6l-1.8 1.8" {...p} /></>,
    chart: <><path d="M5 19V5M5 19h14M9 16v-4M13 16V9M17 16v-6" {...p} /></>,
    eye: <><path d="M2.5 12S6 5.5 12 5.5 21.5 12 21.5 12 18 18.5 12 18.5 2.5 12 2.5 12Z" {...p} /><circle cx="12" cy="12" r="3" {...p} /></>,
    eyeoff: <><path d="M4 4l16 16" {...p} /><path d="M9.5 9.6A3 3 0 0 0 14.4 14M6.5 6.7C3.8 8.2 2.5 12 2.5 12s3.5 6.5 9.5 6.5c1.5 0 2.8-.4 4-1M17.5 17.3c2.7-1.5 4-5.3 4-5.3s-3.5-6.5-9.5-6.5c-1 0-2 .2-2.8.4" {...p} /></>,
    mail: <><rect x="3" y="5" width="18" height="14" rx="2.5" {...p} /><path d="M4 7l8 6 8-6" {...p} /></>,
    phone: <><rect x="6.5" y="2.5" width="11" height="19" rx="3" {...p} /><path d="M10.5 18.5h3" {...p} /></>,
    key: <><circle cx="8" cy="14" r="4" {...p} /><path d="M11 11.5 20 2.5M17 5.5l2.5 2.5M14.5 8l2 2" {...p} /></>,
  };
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill={fill} style={style} aria-hidden="true">
      {paths[name]}
    </svg>
  );
}
