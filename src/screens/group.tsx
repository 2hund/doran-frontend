// group.tsx — 그룹관리 탭: 그룹 목록/홈/멤버/멤버상세/호칭/초대/수정/요청/나가기
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Icon, type IconName } from '../lib/Icon';
import { PAvatar, NavHeader, BottomNav, BottomSheet, SecHead } from '../lib/shared';

const GRP = [
  { name: '나', role: 'admin', desc: '막내딸 · 그룹 관리자', me: true },
  { name: '엄마', role: 'member', desc: '어머니' },
  { name: '아빠', role: 'member', desc: '아버지' },
  { name: '큰딸', role: 'member', desc: '첫째딸' },
  { name: '할머니', role: 'member', desc: '조모' },
  { name: '삼촌', role: 'member', desc: '외삼촌' },
];

interface Group {
  id: string; emoji: IconName; name: string; desc: string; code: string;
  members: string[]; count: number; role: 'admin' | 'member'; days: number; pending: number; active?: boolean;
}
const GROUPS: Group[] = [
  { id: 'home', emoji: 'family', name: '우리집', desc: '건강을 함께 챙기는 우리 가족 공간', code: 'DORAN-4827', members: ['엄마', '아빠', '나', '큰딸', '할머니', '삼촌'], count: 6, role: 'admin', days: 128, pending: 2, active: true },
  { id: 'grand', emoji: 'heart', name: '할머니댁', desc: '조부모님 건강을 함께 살펴요', code: 'DORAN-7710', members: ['할머니', '엄마', '나', '삼촌'], count: 4, role: 'admin', days: 64, pending: 0 },
  { id: 'sis', emoji: 'cheer', name: '언니네 가족', desc: '언니 가족과 걷기 챌린지', code: 'DORAN-3925', members: ['큰딸', '나', '아빠'], count: 3, role: 'member', days: 21, pending: 0 },
];

/* 그룹 멤버 미리보기 아바타 스택 */
function GroupAvs({ members, size = 30, max = 4, dark = false }: { members: string[]; size?: number; max?: number; dark?: boolean }) {
  const shown = members.slice(0, max);
  const rest = members.length - shown.length;
  return (
    <div className="ava-stack">
      {shown.map((m, i) => <div key={m} style={{ marginLeft: i ? -10 : 0, zIndex: 9 - i }}><PAvatar name={m} size={size} ring ringColor={dark ? '#1F4D3A' : '#fff'} /></div>)}
      {rest > 0 && <div className="ava-more" style={{ marginLeft: -10, width: size, height: size, fontSize: size * 0.34, background: dark ? '#2F6047' : '#EEF4ED', color: dark ? '#C7E0CB' : '#1F4D3A', boxShadow: `0 0 0 2.5px ${dark ? '#1F4D3A' : '#fff'}` }}>+{rest}</div>}
    </div>
  );
}

/* ── 내 그룹 목록 ───────────────────────────── */
export function GrpList() {
  const navigate = useNavigate();
  const [sel, setSel] = useState('home');
  return (
    <div className="screen">
      <div className="scroll">
        <div className="hdr" style={{ paddingBottom: 8 }}>
          <div><h1 className="hdr-title">그룹관리</h1><p className="hdr-sub">{GROUPS.length}개의 그룹에 함께하고 있어요</p></div>
          <div className="hdr-icons"><button className="ic-btn press"><Icon name="bell" size={21} sw={1.9} color="#3A463C" /></button></div>
        </div>
        <div className="block stack" style={{ paddingTop: 8 }}>
          {GROUPS.map(g => (
            <button key={g.id} className={`group-card press ${sel === g.id ? 'on' : ''}`} onClick={() => { setSel(g.id); navigate('/group/home'); }}>
              <div className="gc-emblem" style={{ background: g.role === 'admin' ? '#1F4D3A' : '#EEF4ED' }}><Icon name={g.emoji} size={24} sw={1.9} color={g.role === 'admin' ? '#FFF8EF' : '#1F4D3A'} /></div>
              <div className="gc-body">
                <div className="gc-top">
                  <span className="gc-name">{g.name}</span>
                  {g.active && <span className="gc-current">현재</span>}
                  {g.role === 'admin' ? <span className="role-chip">관리자</span> : <span className="role-chip-gray">멤버</span>}
                </div>
                <span className="gc-desc">{g.desc}</span>
                <div className="gc-foot">
                  <GroupAvs members={g.members} size={24} max={4} />
                  <span className="gc-count">멤버 {g.count}명 · {g.days}일째</span>
                  {g.pending > 0 && <span className="gc-pending"><Icon name="bell" size={11} sw={2.3} color="#C7841A" />{g.pending}</span>}
                </div>
              </div>
            </button>
          ))}
          <button className="group-add press">
            <div className="ga-ic"><Icon name="plus" size={22} sw={2.2} color="#1F4D3A" /></div>
            <div className="ga-body"><span className="ga-title">새 그룹 만들기</span><span className="ga-sub">또는 초대 코드로 참여하기</span></div>
            <Icon name="chevron" size={18} sw={2.2} color="#C9C3B6" />
          </button>
        </div>
        <div style={{ height: 18 }} />
      </div>
      <BottomNav active="그룹관리" />
    </div>
  );
}

/* ── 그룹관리 홈 ────────────────────────────── */
export function GrpHome() {
  const navigate = useNavigate();
  const [gid, setGid] = useState('home');
  const g = GROUPS.find(x => x.id === gid)!;
  const menus: { ic: IconName; label: string; sub: string; bg: string; c: string; badge?: number; to?: string }[] = [
    { ic: 'people', label: '멤버 관리', sub: `${g.count}명`, bg: '#DDEBDD', c: '#1F4D3A', to: '/group/members' },
    { ic: 'plus', label: '멤버 초대', sub: '코드 · 링크 공유', bg: '#DDEBDD', c: '#1F4D3A', to: '/group/invite' },
    { ic: 'bell', label: '가입 요청', sub: g.pending > 0 ? `${g.pending}건 대기 중` : '요청 없음', bg: '#FCF1DD', c: '#C7841A', badge: g.pending || undefined, to: '/group/requests' },
    { ic: 'edit', label: '그룹 정보 수정', sub: '이름 · 사진 · 소개', bg: '#EEF4ED', c: '#1F4D3A', to: '/group/edit' },
  ];
  return (
    <div className="screen">
      <div className="scroll">
        <div className="hdr" style={{ paddingBottom: 8 }}>
          <div><h1 className="hdr-title">그룹관리</h1><p className="hdr-sub">그룹을 선택해 관리해요</p></div>
          <div className="hdr-icons"><button className="ic-btn press"><Icon name="bell" size={21} sw={1.9} color="#3A463C" /></button></div>
        </div>

        <div className="grp-switch">
          {GROUPS.map(x => (
            <button key={x.id} className={`gswitch press ${gid === x.id ? 'on' : ''}`} onClick={() => setGid(x.id)}>
              <div className="gsw-ic" style={{ background: gid === x.id ? '#1F4D3A' : '#fff' }}><Icon name={x.emoji} size={18} sw={1.9} color={gid === x.id ? '#FFF8EF' : '#1F4D3A'} /></div>
              <span className="gsw-name">{x.name}</span>
            </button>
          ))}
          <button className="gswitch add press"><Icon name="plus" size={20} sw={2.2} color="#6D6A61" /></button>
        </div>

        <div className="block">
          <div className="grp-hero">
            <div className="grp-hero-glow" />
            <div className="grp-hero-top">
              <div className="grp-emblem"><Icon name={g.emoji} size={26} sw={1.9} color="#FFF8EF" /></div>
              <button className="grp-code press"><Icon name="copy" size={15} sw={2} color="#C7E0CB" />{g.code}</button>
            </div>
            <h2 className="grp-hero-name">{g.name}</h2>
            <p className="grp-hero-desc">{g.desc}</p>
            <div className="grp-hero-stats">
              <div className="ghs"><span className="ghs-num">{g.count}</span><span className="ghs-label">멤버</span></div>
              <span className="ghs-div" />
              <div className="ghs"><span className="ghs-num">{g.role === 'admin' ? '관리자' : '멤버'}</span><span className="ghs-label">내 역할</span></div>
              <span className="ghs-div" />
              <div className="ghs"><span className="ghs-num">{g.days}<i>일</i></span><span className="ghs-label">함께한 날</span></div>
            </div>
          </div>
        </div>

        <div className="block">
          <div className="menu-grid">
            {menus.map(m => (
              <button key={m.label} className="menu-tile press" onClick={() => m.to && navigate(m.to)}>
                <div className="menu-ic" style={{ background: m.bg }}><Icon name={m.ic} size={21} sw={1.9} color={m.c} />{m.badge && <span className="menu-badge">{m.badge}</span>}</div>
                <div className="menu-body"><span className="menu-label">{m.label}</span><span className="menu-sub">{m.sub}</span></div>
              </button>
            ))}
          </div>
        </div>

        <section className="block">
          <SecHead title="멤버" action="전체 관리" onAction={() => navigate('/group/members')} />
          <div className="member-grid">
            {g.members.map(name => {
              const m = GRP.find(x => x.name === name) || { name, role: 'member' };
              return (
                <button key={name} className="member-tile press" onClick={() => navigate('/group/member')}>
                  <PAvatar name={name} size={52} />
                  <span className="mt-name">{name}</span>
                  <span className={`mt-role ${m.role === 'admin' ? 'admin' : ''}`}>{m.role === 'admin' ? '관리자' : '멤버'}</span>
                </button>
              );
            })}
          </div>
        </section>

        <section className="block">
          <button className="report-link press" onClick={() => navigate('/group/hub')}>
            <div className="rl-ic"><Icon name="heart" size={20} sw={1.9} color="#1F4D3A" /></div>
            <div className="rl-body"><span className="rl-title">그룹 건강 허브</span><span className="rl-sub">건강 점수 · 숙제 · 랭킹 · 리포트</span></div>
            <Icon name="chevron" size={18} sw={2.2} color="#C9C3B6" />
          </button>
        </section>
        <div style={{ height: 18 }} />
      </div>
      <BottomNav active="그룹관리" />
    </div>
  );
}

/* ── 멤버 목록 (+ 초대 시트) ────────────────── */
export function GrpMembers() {
  const navigate = useNavigate();
  const [menu, setMenu] = useState<string | null>('아빠');
  const [invite, setInvite] = useState(false);
  return (
    <div className="screen">
      <div className="scroll" style={{ paddingBottom: 0 }}>
        <NavHeader title="멤버 관리" trailing={<button className="icon-action press" onClick={() => setInvite(true)}><Icon name="plus" size={22} sw={2.2} color="#3A463C" /></button>} />
        <div className="block-t" style={{ padding: '6px 22px 0' }}>
          <div className="member-summary"><Icon name="family" size={18} sw={1.9} color="#1F4D3A" /><b>6명</b>이 우리집에 함께하고 있어요</div>
        </div>
        <div className="block" style={{ paddingTop: 12 }}>
          <div className="set-card">
            {GRP.map((m, i) => (
              <div key={m.name} className="mrow-wrap">
                <div className={`set-row ${i === GRP.length - 1 && menu !== m.name ? 'last' : ''}`} style={{ paddingRight: 12 }} onClick={() => navigate('/group/member')}>
                  <PAvatar name={m.name} size={42} />
                  <div className="mrow-body">
                    <span className="mrow-name">{m.name}{m.me && <span className="me-tag">나</span>}</span>
                    <span className="mrow-sub">{m.desc}</span>
                  </div>
                  {m.role === 'admin' && <span className="role-chip">관리자</span>}
                  {!m.me && (
                    <button className="mrow-more press" onClick={(e) => { e.stopPropagation(); setMenu(menu === m.name ? null : m.name); }}><Icon name="dots" size={20} color="#9A958A" /></button>
                  )}
                </div>
                {!m.me && menu === m.name && (
                  <div className="mrow-menu">
                    <button className="mm-opt press"><Icon name="shield" size={17} sw={1.9} color="#3A463C" />관리자 위임</button>
                    <button className="mm-opt press"><Icon name="edit" size={17} sw={1.9} color="#3A463C" />호칭 수정</button>
                    <button className="mm-opt press danger"><Icon name="logout" size={17} sw={1.9} color="#C25C40" />내보내기</button>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
        <div className="block" style={{ paddingTop: 4 }}>
          <div className="info-banner"><Icon name="shield" size={17} sw={1.9} color="#1F4D3A" />관리자만 멤버를 초대하거나 내보낼 수 있어요.</div>
        </div>
        <div style={{ height: 20 }} />
      </div>
      <div className="auth-foot"><button className="btn-primary press" onClick={() => setInvite(true)}><Icon name="plus" size={19} sw={2.2} color="#FFF8EF" />멤버 초대하기</button></div>

      <BottomSheet open={invite} onClose={() => setInvite(false)} title="가족 초대하기">
        <p className="sheet-lead">초대 링크나 코드를 공유하면 가족이 «우리집»에 함께할 수 있어요.</p>
        <div className="invite-code">
          <span className="ic-label">초대 코드</span>
          <div className="ic-row"><span className="ic-value">DORAN-4827</span><button className="ic-copy press"><Icon name="copy" size={16} sw={2} color="#1F4D3A" />복사</button></div>
        </div>
        <div className="invite-qr">
          <div className="qr-box"><Icon name="qr" size={88} sw={1.6} color="#1F4D3A" /></div>
          <span className="qr-cap">QR 코드를 스캔해 바로 입장</span>
        </div>
        <div className="share-row">
          <button className="share-btn press"><span className="sb-ico" style={{ background: '#FCE45A' }}><Icon name="chat" size={20} sw={2} color="#3A2A0A" /></span>카카오톡</button>
          <button className="share-btn press"><span className="sb-ico" style={{ background: '#EEF4ED' }}><Icon name="link" size={20} sw={2} color="#1F4D3A" /></span>링크 복사</button>
          <button className="share-btn press"><span className="sb-ico" style={{ background: '#EEF4ED' }}><Icon name="share" size={20} sw={2} color="#1F4D3A" /></span>더보기</button>
        </div>
      </BottomSheet>
    </div>
  );
}

/* ── 멤버 상세 (+ 호칭 시트 / 내보내기 다이얼로그) ─ */
export function GrpMemberDetail() {
  const [nick, setNick] = useState(false);
  const [remove, setRemove] = useState(false);
  const navigate = useNavigate();
  return (
    <div className="screen">
      <div className="scroll" style={{ paddingBottom: 0 }}>
        <NavHeader title="멤버 정보" trailing={<button className="icon-action press"><Icon name="dots" size={20} color="#3A463C" /></button>} />
        <div className="block" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', paddingTop: 10 }}>
          <PAvatar name="아빠" size={88} />
          <h2 className="md-name">아빠</h2>
          <div className="md-sub"><span className="role-chip-gray">멤버</span>박정호 · 아버지</div>
        </div>
        <div className="block" style={{ paddingTop: 6 }}>
          <div className="md-stats">
            <div className="md-stat"><span className="md-stat-num">8,240</span><span className="md-stat-label">오늘 걸음</span></div>
            <span className="ghs-div" style={{ background: '#ECE5D6' }} />
            <div className="md-stat"><span className="md-stat-num">10회</span><span className="md-stat-label">이번 달 숙제</span></div>
            <span className="ghs-div" style={{ background: '#ECE5D6' }} />
            <div className="md-stat"><span className="md-stat-num">3위</span><span className="md-stat-label">걸음 랭킹</span></div>
          </div>
        </div>
        <div className="block" style={{ paddingTop: 8 }}>
          <span className="memo-label">내가 부르는 호칭</span>
          <button className="nick-row press" onClick={() => setNick(true)}>
            <div className="set-ic" style={{ background: '#EEF4ED' }}><Icon name="edit" size={18} sw={1.9} color="#1F4D3A" /></div>
            <div className="nick-row-body"><span className="nick-row-val">아빠</span><span className="nick-row-sub">나에게만 보여요 · 탭해서 변경</span></div>
            <Icon name="chevron" size={17} sw={2.2} color="#C9C3B6" />
          </button>
        </div>
        <div className="block" style={{ paddingTop: 8 }}>
          <span className="memo-label">멤버 정보</span>
          <div className="set-card">
            <div className="set-row"><div className="set-ic" style={{ background: '#EEF4ED' }}><Icon name="family" size={18} sw={1.9} color="#1F4D3A" /></div><span className="set-title">그룹 호칭</span><span className="set-val">아버지</span></div>
            <div className="set-row"><div className="set-ic" style={{ background: '#EEF4ED' }}><Icon name="calendar" size={18} sw={1.9} color="#1F4D3A" /></div><span className="set-title">함께한 기간</span><span className="set-val">90일째</span></div>
            <div className="set-row last"><div className="set-ic" style={{ background: '#F0EBE1' }}><Icon name="shield" size={18} sw={1.9} color="#8A8578" /></div><span className="set-title">역할</span><span className="set-val">멤버</span></div>
          </div>
        </div>
        <div style={{ height: 20 }} />
      </div>
      <div className="detail-actions">
        <button className="btn-ghost press" style={{ flex: 1 }} onClick={() => setRemove(true)}><Icon name="logout" size={18} sw={1.9} color="#C25C40" />그룹에서 내보내기</button>
      </div>

      <BottomSheet open={nick} onClose={() => setNick(false)} title="호칭 수정"
        footer={<button className="btn-primary press" onClick={() => setNick(false)}>호칭 저장</button>}>
        <div className="nick-head">
          <PAvatar name="할머니" size={48} />
          <div><div className="nick-real">박순자 님</div><div className="nick-meta">우리집 멤버 · 어머니의 어머니</div></div>
        </div>
        <div className="afield">
          <span className="afield-label">내가 부르는 호칭</span>
          <div className="afield-box focus"><Icon name="edit" size={18} sw={1.9} color="#1F4D3A" /><span className="afield-val">할머니</span><span className="nick-count">3/10</span></div>
        </div>
        <div className="nick-suggest">
          <button className="nick-chip press on">할머니</button>
          <button className="nick-chip press">외할머니</button>
          <button className="nick-chip press">왕할머니</button>
          <button className="nick-chip press">순자 여사님</button>
        </div>
        <div className="nick-banner">
          <Icon name="info" size={17} sw={1.9} color="#1F4D3A" />
          <span>호칭은 <b>나에게만</b> 보여요. 같은 사람도 가족마다 다르게 부를 수 있어요. (예: 나에겐 «할머니», 엄마에겐 «어머니»)</span>
        </div>
      </BottomSheet>

      {remove && (
        <div className="dialog-layer open">
          <div className="dialog-scrim" onClick={() => setRemove(false)} />
          <div className="dialog">
            <div className="dialog-ic"><Icon name="logout" size={26} sw={1.9} color="#C25C40" /></div>
            <h4 className="dialog-title">아빠님을 내보낼까요?</h4>
            <p className="dialog-desc">우리집에서 아빠님이 제외돼요.<br />함께 쌓은 기록은 그대로 보관돼요.</p>
            <div className="dialog-actions">
              <button className="dlg-btn press" onClick={() => setRemove(false)}>취소</button>
              <button className="dlg-btn danger press" onClick={() => navigate('/group/members')}>내보내기</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* ── 그룹 정보 수정 ─────────────────────────── */
export function GrpEdit() {
  return (
    <div className="screen">
      <div className="scroll" style={{ paddingBottom: 0 }}>
        <NavHeader title="그룹 정보 수정" trailing={<button className="txt-action press">저장</button>} />
        <div className="block" style={{ display: 'flex', justifyContent: 'center', paddingTop: 12 }}>
          <div className="grp-pick">
            <div className="grp-pick-img"><Icon name="family" size={36} sw={1.8} color="#1F4D3A" /></div>
            <button className="profile-cam press"><Icon name="camera" size={19} sw={1.9} color="#3A463C" /></button>
          </div>
        </div>
        <div className="block afields" style={{ paddingTop: 14 }}>
          <div className="afield"><span className="afield-label">그룹 이름</span><div className="afield-box focus"><Icon name="family" size={19} sw={1.9} color="#1F4D3A" /><span className="afield-val">우리집</span></div></div>
          <div className="afield"><span className="afield-label">그룹 소개</span><div className="afield-box" style={{ height: 'auto', minHeight: 80, alignItems: 'flex-start', paddingTop: 15 }}><span className="afield-val">건강을 함께 챙기는 우리 가족 공간</span></div></div>
          <div className="afield">
            <span className="afield-label">그룹 코드</span>
            <div className="afield-box" style={{ background: '#F6F1E8' }}><Icon name="lock" size={19} sw={1.9} color="#A8A296" /><span className="afield-val" style={{ color: '#6D6A61' }}>DORAN-4827</span><button className="code-reset press">재발급</button></div>
          </div>
        </div>
        <div style={{ height: 20 }} />
      </div>
      <div className="auth-foot"><button className="btn-primary press">변경사항 저장</button></div>
    </div>
  );
}

/* ── 가입 요청 관리 ─────────────────────────── */
export function GrpRequests() {
  const reqs = [
    { name: '이모', sub: '어머니의 동생 · 방금 요청' },
    { name: '사촌', sub: '큰집 사촌 · 1시간 전 요청' },
  ];
  return (
    <div className="screen">
      <div className="scroll">
        <NavHeader title="가입 요청" />
        <div className="block-t" style={{ padding: '6px 22px 0' }}>
          <div className="member-summary" style={{ background: '#FCF1DD', borderColor: '#EFD9AE' }}><Icon name="bell" size={18} sw={1.9} color="#C7841A" /><b style={{ color: '#C7841A' }}>2건</b>의 가입 요청이 대기 중이에요</div>
        </div>
        <div className="block stack" style={{ paddingTop: 14 }}>
          {reqs.map((r, i) => (
            <div key={i} className="req-card">
              <div className="req-top">
                <PAvatar name={r.name} size={46} />
                <div className="req-body"><span className="req-name">{r.name}</span><span className="req-sub">{r.sub}</span></div>
              </div>
              <div className="req-actions">
                <button className="req-deny press">거절</button>
                <button className="req-accept press"><Icon name="check" size={17} sw={2.4} color="#fff" />수락</button>
              </div>
            </div>
          ))}
        </div>
        <div className="block" style={{ paddingTop: 4 }}>
          <div className="info-banner"><Icon name="info" size={17} sw={1.9} color="#1F4D3A" />수락하면 멤버로 추가되고, 기본 보기 권한이 부여돼요.</div>
        </div>
        <div style={{ height: 18 }} />
      </div>
      <BottomNav active="그룹관리" />
    </div>
  );
}

/* ── 그룹 나가기 / 삭제 ─────────────────────── */
export function GrpLeave() {
  return (
    <div className="screen">
      <div className="scroll">
        <NavHeader title="그룹 설정" />
        <div className="block" style={{ paddingTop: 8 }}>
          <div className="set-card">
            <div className="set-row"><div className="set-ic" style={{ background: '#EEF4ED' }}><Icon name="family" size={18} sw={1.9} color="#1F4D3A" /></div><span className="set-title">그룹 이름</span><span className="set-val">우리집</span></div>
            <div className="set-row"><div className="set-ic" style={{ background: '#EEF4ED' }}><Icon name="people" size={18} sw={1.9} color="#1F4D3A" /></div><span className="set-title">멤버</span><span className="set-val">6명</span></div>
            <div className="set-row last"><div className="set-ic" style={{ background: '#EEF4ED' }}><Icon name="calendar" size={18} sw={1.9} color="#1F4D3A" /></div><span className="set-title">함께한 날</span><span className="set-val">128일</span></div>
          </div>
        </div>
        <div className="block" style={{ paddingTop: 16 }}>
          <span className="danger-label">위험 영역</span>
          <div className="set-card danger-card">
            <button className="set-row press"><div className="set-ic" style={{ background: '#FBE3DB' }}><Icon name="logout" size={18} sw={1.9} color="#C25C40" /></div><span className="set-title" style={{ color: '#C25C40' }}>그룹 나가기</span><Icon name="chevron" size={17} sw={2.2} color="#E0A491" /></button>
            <button className="set-row last press"><div className="set-ic" style={{ background: '#FBE3DB' }}><Icon name="trash" size={18} sw={1.9} color="#C25C40" /></div><span className="set-title" style={{ color: '#C25C40' }}>그룹 삭제하기</span><Icon name="chevron" size={17} sw={2.2} color="#E0A491" /></button>
          </div>
          <p className="notif-note">그룹을 삭제하면 모든 일정·숙제·소식 기록이 영구히 사라져요. 이 작업은 되돌릴 수 없어요.</p>
        </div>
        <div style={{ height: 18 }} />
      </div>
      <BottomNav active="그룹관리" />
    </div>
  );
}
