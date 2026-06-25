// shared.tsx — 도란도란 공통 컴포넌트 (아바타, 네비, 바텀시트, 빈 화면 등)
import type { CSSProperties, ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { Icon, type IconName } from './Icon';

/* ── warm family avatars (PAvatar) ───────────────── */
export const WARM: Record<string, string> = {
  아빠: '#36513B', 엄마: '#E07A5F', 나: '#4F8A5B', 큰딸: '#C98A40',
  할머니: '#A6705A', 막내: '#5E7C63', 삼촌: '#6E8A72', 이모: '#C98A8A',
  친구A: '#5E7C63', 친구B: '#C98A40', 친구C: '#A6705A',
};

interface PAvatarProps {
  name?: string;
  size?: number;
  ring?: boolean;
  ringColor?: string;
  style?: CSSProperties;
}
export function PAvatar({ name = '나', size = 38, ring = false, ringColor = '#FFF8EF', style }: PAvatarProps) {
  const color = WARM[name] || '#6D6A61';
  return (
    <div style={{
      width: size, height: size, borderRadius: '50%', background: color, color: '#fff',
      flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontWeight: 700, fontSize: Math.round(size * 0.42), letterSpacing: '-0.02em',
      boxShadow: ring ? `0 0 0 2.5px ${ringColor}` : 'none', ...style,
    }}>{(name || '?').slice(0, 1)}</div>
  );
}

/* progress ring + avatar centered */
export function RingAvatar({ name, pct, color, size = 58 }: { name: string; pct: number; color: string; size?: number }) {
  const r = (size - 7) / 2, c = 2 * Math.PI * r, off = c * (1 - pct / 100);
  return (
    <div style={{ position: 'relative', width: size, height: size }}>
      <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
        <circle cx={size / 2} cy={size / 2} r={r} stroke="#E4ECE3" strokeWidth="3.5" fill="none" />
        <circle cx={size / 2} cy={size / 2} r={r} stroke={color} strokeWidth="3.5" fill="none"
          strokeDasharray={c} strokeDashoffset={off} strokeLinecap="round" />
      </svg>
      <div style={{ position: 'absolute', inset: 6 }}><PAvatar name={name} size={size - 12} /></div>
    </div>
  );
}

/* ── section head ────────────────────────────────── */
export function SecHead({ title, action, onAction }: { title: string; action?: string; onAction?: () => void }) {
  return (
    <div className="sec-head">
      <h3 className="sec-title">{title}</h3>
      {action && <button className="sec-link press" onClick={onAction}>{action}</button>}
    </div>
  );
}

/* ── status bar (ivory, charcoal glyphs) ─────────── */
export function StatusBar() {
  return (
    <div className="statusbar">
      <span className="sb-time">9:41</span>
      <div className="sb-icons">
        <svg width="18" height="11" viewBox="0 0 18 11"><rect x="0" y="7" width="3" height="4" rx="0.6" fill="#20231F" /><rect x="4.5" y="4.6" width="3" height="6.4" rx="0.6" fill="#20231F" /><rect x="9" y="2.3" width="3" height="8.7" rx="0.6" fill="#20231F" /><rect x="13.5" y="0" width="3" height="11" rx="0.6" fill="#20231F" /></svg>
        <svg width="16" height="11" viewBox="0 0 16 11"><path d="M8 2.9c2.1 0 4 .8 5.4 2.2l1-1C12.7 2.4 10.5 1.4 8 1.4S3.3 2.4 1.6 4.1l1 1C4 3.7 5.9 2.9 8 2.9Z" fill="#20231F" /><path d="M8 6.2c1.2 0 2.3.5 3.1 1.3l1-1C11 5.4 9.6 4.7 8 4.7s-3 .7-4.1 1.8l1 1C5.7 6.7 6.8 6.2 8 6.2Z" fill="#20231F" /><circle cx="8" cy="9.6" r="1.3" fill="#20231F" /></svg>
        <svg width="25" height="12" viewBox="0 0 25 12"><rect x="0.5" y="0.5" width="21" height="11" rx="3.2" stroke="#20231F" strokeOpacity="0.35" fill="none" /><rect x="2" y="2" width="18" height="8" rx="1.8" fill="#20231F" /><path d="M23 4v4c.8-.3 1.4-1.1 1.4-2S23.8 4.3 23 4Z" fill="#20231F" fillOpacity="0.4" /></svg>
      </div>
    </div>
  );
}

/* ── sub-page nav header (back + title + trailing) ─ */
export function NavHeader({ title, trailing, onBack }: { title: string; trailing?: ReactNode; onBack?: () => void }) {
  const navigate = useNavigate();
  const back = onBack || (() => navigate(-1));
  return (
    <div className="nav-hdr">
      <button className="nav-back press" onClick={back} aria-label="뒤로">
        <Icon name="chevron" size={22} sw={2.3} color="#20231F" style={{ transform: 'rotate(180deg)' }} />
      </button>
      <span className="nav-title">{title}</span>
      <div className="nav-trail">{trailing}</div>
    </div>
  );
}

/* ── bottom nav (active prop) ────────────────────── */
export const NAV_ITEMS: { ic: IconName; label: string; path: string }[] = [
  { ic: 'cheer', label: '소식', path: '/news' },
  { ic: 'calendar', label: '일정', path: '/schedule' },
  { ic: 'family', label: '도란도란', path: '/' },
  { ic: 'people', label: '그룹관리', path: '/group' },
  { ic: 'user', label: 'MY', path: '/my' },
];
export function BottomNav({ active = '도란도란' }: { active?: string }) {
  const navigate = useNavigate();
  return (
    <nav className="bnav">
      {NAV_ITEMS.map(it => {
        const on = active === it.label;
        return (
          <button key={it.label} className={`bn ${on ? 'on' : ''} press`} onClick={() => navigate(it.path)}>
            <Icon name={it.ic} size={24} sw={on ? 2.1 : 1.85} color={on ? '#1F4D3A' : '#A8A296'} />
            <span>{it.label}</span>
          </button>
        );
      })}
    </nav>
  );
}

/* ── bottom sheet (in-frame overlay, toggleable) ─── */
export function BottomSheet({ open, onClose, title, children, footer }: {
  open: boolean; onClose: () => void; title?: string; children: ReactNode; footer?: ReactNode;
}) {
  return (
    <div className={`sheet-layer ${open ? 'open' : ''}`}>
      <div className="sheet-scrim" onClick={onClose} />
      <div className="sheet">
        <div className="sheet-handle" />
        {title && (
          <div className="sheet-head">
            <h4 className="sheet-title">{title}</h4>
            <button className="sheet-x press" onClick={onClose} aria-label="닫기"><Icon name="close" size={20} sw={2.2} color="#6D6A61" /></button>
          </div>
        )}
        <div className="sheet-body">{children}</div>
        {footer && <div className="sheet-footer">{footer}</div>}
      </div>
    </div>
  );
}

/* ── empty state ─────────────────────────────────── */
export function EmptyState({ icon, title, desc, cta, onCta }: {
  icon: IconName; title: string; desc: string; cta?: string; onCta?: () => void;
}) {
  return (
    <div className="empty">
      <div className="empty-ic"><Icon name={icon} size={38} sw={1.7} color="#9BB89F" /></div>
      <h4 className="empty-title">{title}</h4>
      <p className="empty-desc">{desc}</p>
      {cta && <button className="empty-cta press" onClick={onCta}><Icon name="plus" size={18} sw={2.3} color="#fff" />{cta}</button>}
    </div>
  );
}

/* ── toggle switch ───────────────────────────────── */
export function Toggle({ on, onChange }: { on: boolean; onChange?: (v: boolean) => void }) {
  return (
    <button className={`toggle press ${on ? 'on' : ''}`} onClick={() => onChange && onChange(!on)} aria-label="토글">
      <span className="toggle-knob" />
    </button>
  );
}

/* ── segmented tabs ──────────────────────────────── */
export function Segmented({ tabs, value, onChange }: { tabs: string[]; value: string; onChange: (t: string) => void }) {
  return (
    <div className="seg">
      {tabs.map(t => (
        <button key={t} className={`seg-btn press ${value === t ? 'on' : ''}`} onClick={() => onChange(t)}>{t}</button>
      ))}
    </div>
  );
}
