// my.tsx — MY 탭: 홈, 프로필 수정, 건강 리포트, 설정, 알림 상세 설정
// (선물하기·위시리스트는 최종 기획에서 제거됨)
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Icon, type IconName } from '../lib/Icon';
import { PAvatar, NavHeader, BottomNav, Toggle, Segmented } from '../lib/shared';
import { pickImage } from '../lib/share';
import { useActiveGroup } from '../api/ActiveGroup';
import { useMe, useUpdateMe, useGroup, useNotifSettings, useUpdateNotifSettings, useLogout } from '../api/hooks';
import type { NotificationSettings } from '../api/types';

/* 설정 행 */
function SetRow({ ic, bg, title, value, toggle, on, onToggle, last, danger, onClick }: {
  ic: IconName; bg: string; title: string; value?: string; toggle?: boolean; on?: boolean;
  onToggle?: (v: boolean) => void; last?: boolean; danger?: boolean; onClick?: () => void;
}) {
  return (
    <div className={`set-row ${last ? 'last' : ''}`} onClick={onClick}>
      <div className="set-ic" style={{ background: bg }}><Icon name={ic} size={18} sw={1.9} color={danger ? '#C25C40' : '#1F4D3A'} /></div>
      <span className="set-title" style={danger ? { color: '#C25C40' } : undefined}>{title}</span>
      {toggle ? <Toggle on={!!on} onChange={onToggle} />
        : <>{value && <span className="set-val">{value}</span>}<Icon name="chevron" size={17} sw={2.2} color="#C9C3B6" /></>}
    </div>
  );
}

/* ── 마이페이지 홈 ──────────────────────────── */
export function MyHome() {
  const navigate = useNavigate();
  const { groupId } = useActiveGroup();
  const { data: me } = useMe();
  const { data: g } = useGroup(groupId);
  const myName = me?.nickname || me?.name || '나';
  const stats: { ic: IconName; n: string; u: string; label: string }[] = [
    { ic: 'steps', n: '6,910', u: '보', label: '오늘 걸음' },
    { ic: 'check', n: '9', u: '회', label: '이번 주 숙제' },
    { ic: 'cheer', n: '24', u: '번', label: '받은 응원' },
  ];
  const menus: { ic: IconName; label: string; sub: string; bg: string; c: string; to?: string }[] = [
    { ic: 'chart', label: '건강 리포트', sub: '이번 주 +12%', bg: '#DDEBDD', c: '#1F4D3A', to: '/my/report' },
    { ic: 'check', label: '내 숙제', sub: '이번 주 9회', bg: '#DDEBDD', c: '#1F4D3A', to: '/group/tasks' },
    { ic: 'calendar', label: '내 일정', sub: '다가오는 1건', bg: '#EEF4ED', c: '#1F4D3A', to: '/schedule' },
    { ic: 'bell', label: '알림 설정', sub: '푸시 · 소식', bg: '#FCF1DD', c: '#C7841A', to: '/my/notif' },
  ];
  return (
    <div className="screen">
      <div className="scroll">
        <div className="hdr" style={{ paddingBottom: 8 }}>
          <div><h1 className="hdr-title">MY</h1></div>
          <div className="hdr-icons"><button className="ic-btn press"><Icon name="bell" size={21} sw={1.9} color="#3A463C" /></button><button className="ic-btn press" onClick={() => navigate('/my/settings')}><Icon name="info" size={21} sw={1.9} color="#3A463C" /></button></div>
        </div>
        <div className="block">
          <button className="me-card press" onClick={() => navigate('/my/profile')}>
            <PAvatar name={myName} size={60} />
            <div className="me-body">
              <div className="me-name">{me?.name ?? '…'} {g?.role === 'ADMIN' && <span className="role-chip">관리자</span>}</div>
              <div className="me-sub">{[g?.name, me?.nickname].filter(Boolean).join(' · ') || '프로필을 완성해보세요'}</div>
            </div>
            <Icon name="chevron" size={19} sw={2.2} color="#C9C3B6" />
          </button>
        </div>
        <div className="block">
          <div className="stat-grid">
            {stats.map(s => (
              <div className="stat-tile" key={s.label}>
                <div className="stat-ic"><Icon name={s.ic} size={19} sw={1.95} color="#1F4D3A" /></div>
                <span className="stat-num">{s.n}<i>{s.u}</i></span>
                <span className="stat-label">{s.label}</span>
              </div>
            ))}
          </div>
        </div>
        <div className="block">
          <div className="menu-grid">
            {menus.map(m => (
              <button key={m.label} className="menu-tile press" onClick={() => m.to && navigate(m.to)}>
                <div className="menu-ic" style={{ background: m.bg }}><Icon name={m.ic} size={21} sw={1.9} color={m.c} /></div>
                <div className="menu-body"><span className="menu-label">{m.label}</span><span className="menu-sub">{m.sub}</span></div>
              </button>
            ))}
          </div>
        </div>
        <div className="block">
          <div className="set-card">
            <button className="set-row press"><div className="set-ic" style={{ background: '#F0EBE1' }}><Icon name="diary" size={18} sw={1.9} color="#1F4D3A" /></div><span className="set-title">공지사항</span><Icon name="chevron" size={17} sw={2.2} color="#C9C3B6" /></button>
            <button className="set-row press"><div className="set-ic" style={{ background: '#F0EBE1' }}><Icon name="chat" size={18} sw={1.9} color="#1F4D3A" /></div><span className="set-title">고객센터</span><Icon name="chevron" size={17} sw={2.2} color="#C9C3B6" /></button>
            <button className="set-row last press" onClick={() => navigate('/my/settings')}><div className="set-ic" style={{ background: '#F0EBE1' }}><Icon name="user" size={18} sw={1.9} color="#1F4D3A" /></div><span className="set-title">설정</span><Icon name="chevron" size={17} sw={2.2} color="#C9C3B6" /></button>
          </div>
        </div>
        <div style={{ height: 18 }} />
      </div>
      <BottomNav active="MY" />
    </div>
  );
}

/* ── 프로필 수정 ────────────────────────────── */
export function MyProfileEdit() {
  const navigate = useNavigate();
  const { data: me } = useMe();
  const update = useUpdateMe();
  const [gender, setGender] = useState('여성');
  const [name, setName] = useState('');
  const [nickname, setNickname] = useState('');
  const [photo, setPhoto] = useState<string | null>(null);
  const [inited, setInited] = useState(false);

  if (me && !inited) { setName(me.name ?? ''); setNickname(me.nickname ?? ''); setInited(true); }

  const pickPhoto = async () => { const [f] = await pickImage(); if (f) setPhoto(URL.createObjectURL(f)); };
  const save = async () => {
    try { await update.mutateAsync({ name: name.trim(), nickname: nickname.trim() || null }); navigate(-1); }
    catch { /* noop */ }
  };

  return (
    <div className="screen">
      <div className="scroll" style={{ paddingBottom: 0 }}>
        <NavHeader title="프로필 수정" trailing={<button className="txt-action press" onClick={save}>저장</button>} />
        <div className="block" style={{ display: 'flex', justifyContent: 'center', paddingTop: 10 }}>
          <div className="profile-pick">
            {photo
              ? <div style={{ width: 96, height: 96, borderRadius: '50%', backgroundImage: `url(${photo})`, backgroundSize: 'cover', backgroundPosition: 'center' }} />
              : <PAvatar name={nickname || name || '나'} size={96} />}
            <button className="profile-cam press" onClick={pickPhoto}><Icon name="camera" size={19} sw={1.9} color="#3A463C" /></button>
          </div>
        </div>
        <div className="block afields" style={{ paddingTop: 14 }}>
          <div className="afield"><span className="afield-label">이름</span><div className="afield-box"><Icon name="user" size={19} sw={1.9} color="#A8A296" /><input className="afield-val" value={name} onChange={e => setName(e.target.value)} placeholder="이름" style={{ flex: 1 }} /></div></div>
          <div className="afield"><span className="afield-label">가족 호칭</span><div className="afield-box"><Icon name="family" size={19} sw={1.9} color="#A8A296" /><input className="afield-val" value={nickname} onChange={e => setNickname(e.target.value)} placeholder="가족이 부르는 호칭" style={{ flex: 1 }} /></div></div>
          <div className="afield">
            <span className="afield-label">성별</span>
            <Segmented tabs={['여성', '남성', '비공개']} value={gender} onChange={setGender} />
          </div>
        </div>
        {update.error && <div className="block"><p style={{ color: '#C25C40', fontSize: 13, fontWeight: 600 }}>{(update.error as Error).message}</p></div>}
        <div style={{ height: 20 }} />
      </div>
      <div className="auth-foot"><button className={`btn-primary press ${update.isPending ? 'disabled' : ''}`} onClick={save} disabled={update.isPending}>{update.isPending ? '저장 중…' : '변경사항 저장'}</button></div>
    </div>
  );
}

/* ── 건강 리포트 (주간 막대 차트) ───────────── */
export function MyStats() {
  const [period, setPeriod] = useState('주간');
  const bars = [
    { d: '월', v: 62 }, { d: '화', v: 78 }, { d: '수', v: 45 },
    { d: '목', v: 90 }, { d: '금', v: 69 }, { d: '토', v: 100, today: true }, { d: '일', v: 34 },
  ];
  return (
    <div className="screen">
      <div className="scroll">
        <NavHeader title="건강 리포트" trailing={<button className="icon-action press"><Icon name="share" size={19} sw={1.9} color="#3A463C" /></button>} />
        <div style={{ padding: '4px 22px 0' }}><Segmented tabs={['주간', '월간', '연간']} value={period} onChange={setPeriod} /></div>
        <div className="block" style={{ paddingTop: 16 }}>
          <div className="report-card">
            <div className="report-top">
              <div><span className="report-cap">이번 주 평균 걸음</span><div className="report-big">6,840<i>보</i></div></div>
              <span className="report-trend up"><Icon name="arrow" size={14} sw={2.4} color="#2F6B45" style={{ transform: 'rotate(-90deg)' }} />12%</span>
            </div>
            <div className="chart">
              {bars.map(b => (
                <div key={b.d} className="cbar-col">
                  <div className="cbar"><div className={`cbar-fill ${b.today ? 'today' : ''}`} style={{ height: `${b.v}%` }} /></div>
                  <span className={`cbar-label ${b.today ? 'on' : ''}`}>{b.d}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
        <div className="block">
          <div className="report-row">
            <div className="rr-tile"><div className="stat-ic" style={{ background: '#FBE3DB' }}><Icon name="heart" size={18} sw={1.9} color="#C25C40" /></div><div><span className="rr-num">120/80</span><span className="rr-label">최근 혈압</span></div></div>
            <div className="rr-tile"><div className="stat-ic" style={{ background: '#EEF4ED' }}><Icon name="chart" size={18} sw={1.9} color="#1F4D3A" /></div><div><span className="rr-num">58.2kg</span><span className="rr-label">체중 변화</span></div></div>
          </div>
        </div>
        <div className="block">
          <div className="set-card">
            <button className="set-row press"><div className="set-ic" style={{ background: '#DDEBDD' }}><Icon name="steps" size={18} sw={1.9} color="#1F4D3A" /></div><span className="set-title">걸음 수 기록</span><span className="set-val">자세히</span><Icon name="chevron" size={17} sw={2.2} color="#C9C3B6" /></button>
            <button className="set-row last press"><div className="set-ic" style={{ background: '#DDEBDD' }}><Icon name="check" size={18} sw={1.9} color="#1F4D3A" /></div><span className="set-title">숙제 달성 기록</span><span className="set-val">자세히</span><Icon name="chevron" size={17} sw={2.2} color="#C9C3B6" /></button>
          </div>
        </div>
        <div style={{ height: 18 }} />
      </div>
      <BottomNav active="MY" />
    </div>
  );
}

/* ── 설정 ───────────────────────────────────── */
export function MySettings() {
  const navigate = useNavigate();
  const { data: me } = useMe();
  const { data: notif } = useNotifSettings();
  const updateNotif = useUpdateNotifSettings();
  const logout = useLogout();
  const myName = me?.nickname || me?.name || '나';

  const togglePush = (v: boolean) => { if (notif) updateNotif.mutate({ ...notif, push: v }); };
  const doLogout = async () => { try { await logout.mutateAsync(); } finally { navigate('/auth'); } };

  return (
    <div className="screen">
      <div className="scroll">
        <NavHeader title="설정" />
        <button className="set-profile press" onClick={() => navigate('/my/profile')}>
          <PAvatar name={myName} size={52} />
          <div className="set-prof-body"><span className="set-prof-name">{me?.name ?? '…'}</span><span className="set-prof-sub">{me?.email ?? ''}</span></div>
          <Icon name="chevron" size={18} sw={2.2} color="#C9C3B6" />
        </button>
        <div className="set-group">
          <span className="set-label">계정</span>
          <div className="set-card">
            <SetRow ic="user" bg="#EEF4ED" title="프로필 수정" onClick={() => navigate('/my/profile')} />
            <SetRow ic="lock" bg="#EEF4ED" title="비밀번호 변경" />
            <SetRow ic="link" bg="#EEF4ED" title="연결된 계정" value="카카오" last />
          </div>
        </div>
        <div className="set-group">
          <span className="set-label">알림</span>
          <div className="set-card">
            <SetRow ic="bell" bg="#FCF1DD" title="푸시 알림" toggle on={notif?.push ?? false} onToggle={togglePush} />
            <SetRow ic="cheer" bg="#FCF1DD" title="알림 상세 설정" last onClick={() => navigate('/my/notif')} />
          </div>
        </div>
        <div className="set-group">
          <span className="set-label">개인정보 및 지원</span>
          <div className="set-card">
            <SetRow ic="shield" bg="#F0EBE1" title="개인정보 처리방침" />
            <SetRow ic="info" bg="#F0EBE1" title="서비스 이용약관" />
            <SetRow ic="logout" bg="#FBE3DB" title="로그아웃" danger last onClick={doLogout} />
          </div>
        </div>
        <div className="set-version">도란도란 버전 2.4.0</div>
        <div style={{ height: 18 }} />
      </div>
      <BottomNav active="MY" />
    </div>
  );
}

/* ── 알림 상세 설정 ─────────────────────────── */
export function MyNotifSettings() {
  const { data: notif, isLoading } = useNotifSettings();
  const update = useUpdateNotifSettings();

  // 낙관적 토글: 현재 값 기준으로 한 키만 뒤집어 서버에 PUT
  const toggle = (k: keyof NotificationSettings) => {
    if (!notif) return;
    update.mutate({ ...notif, [k]: !notif[k] });
  };
  const v = (k: keyof NotificationSettings) => notif?.[k] ?? false;

  return (
    <div className="screen">
      <div className="scroll">
        <NavHeader title="알림 설정" />
        {isLoading && <div className="block"><div className="info-banner">불러오는 중…</div></div>}
        <div className="set-group" style={{ marginTop: 8 }}>
          <span className="set-label">활동 알림</span>
          <div className="set-card">
            <SetRow ic="calendar" bg="#EEF4ED" title="일정 리마인더" toggle on={v('schedule')} onToggle={() => toggle('schedule')} />
            <SetRow ic="check" bg="#EEF4ED" title="숙제 인증 요청" toggle on={v('task')} onToggle={() => toggle('task')} />
            <SetRow ic="cheer" bg="#FCF1DD" title="응원 · 좋아요" toggle on={v('cheer')} onToggle={() => toggle('cheer')} last />
          </div>
        </div>
        <div className="set-group">
          <span className="set-label">소식 알림</span>
          <div className="set-card">
            <SetRow ic="gift" bg="#FBE3DB" title="선물 알림" toggle on={v('gift')} onToggle={() => toggle('gift')} />
            <SetRow ic="chat" bg="#EEF4ED" title="가족 소식 · 대화" toggle on={v('news')} onToggle={() => toggle('news')} last />
          </div>
        </div>
        <div className="set-group">
          <span className="set-label">기타</span>
          <div className="set-card">
            <SetRow ic="bell" bg="#F0EBE1" title="마케팅 정보 수신" toggle on={v('marketing')} onToggle={() => toggle('marketing')} last />
          </div>
        </div>
        <p className="notif-note">방해 금지 시간(오후 10시~오전 8시)에는 긴급 알림만 전달돼요.</p>
        <div style={{ height: 18 }} />
      </div>
      <BottomNav active="MY" />
    </div>
  );
}
