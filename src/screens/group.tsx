// group.tsx — 그룹관리 탭: 그룹 목록/홈/멤버/멤버상세/호칭/초대/수정/요청/나가기
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Icon, type IconName } from '../lib/Icon';
import { PAvatar, NavHeader, BottomNav, BottomSheet, SecHead } from '../lib/shared';
import { useActiveGroup } from '../api/ActiveGroup';
import {
  useGroups, useGroup, useMembers, useMember, useJoinRequests,
  useAcceptRequest, useDenyRequest, useKickMember, useLeaveGroup, useDeleteGroup,
  useRegenerateCode, useUpdateGroup, useSetNickname, useMe,
} from '../api/hooks';
import type { GroupResponse, MemberResponse } from '../api/types';
import { shareText, shareToKakao, pickImage } from '../lib/share';

/* 멤버 표시용 이름 — 호칭 > 그룹호칭 > 이름 순 */
function memberLabel(m: MemberResponse): string {
  return m.groupNickname || m.nickname || m.name || '?';
}
/* 그룹 미리보기용 멤버 이름 배열 (members 가 없으면 빈 배열) */
function groupMemberNames(g: GroupResponse): string[] {
  const ms = (g.members as MemberResponse[] | undefined) || [];
  return ms.map(memberLabel);
}
function isAdmin(g?: GroupResponse): boolean {
  return g?.role === 'ADMIN';
}

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
  const { groupId, setGroupId } = useActiveGroup();
  const { data: groups, isLoading, error } = useGroups();

  const open = (g: GroupResponse) => { setGroupId(g.id); navigate('/group/home'); };

  return (
    <div className="screen">
      <div className="scroll">
        <div className="hdr" style={{ paddingBottom: 8 }}>
          <div><h1 className="hdr-title">그룹관리</h1><p className="hdr-sub">{groups ? `${groups.length}개의 그룹에 함께하고 있어요` : '그룹을 불러오는 중'}</p></div>
          <div className="hdr-icons"><button className="ic-btn press"><Icon name="bell" size={21} sw={1.9} color="#3A463C" /></button></div>
        </div>
        <div className="block stack" style={{ paddingTop: 8 }}>
          {isLoading && <div className="info-banner">그룹을 불러오는 중…</div>}
          {error && <div className="info-banner" style={{ background: '#FBE3DB', borderColor: '#EFC8BC', color: '#C25C40' }}><Icon name="info" size={17} sw={1.9} color="#C25C40" />{(error as Error).message}</div>}
          {groups?.map(g => {
            const admin = g.role === 'ADMIN';
            const names = groupMemberNames(g);
            const count = g.memberCount ?? names.length;
            return (
              <button key={g.id} className={`group-card press ${groupId === g.id ? 'on' : ''}`} onClick={() => open(g)}>
                <div className="gc-emblem" style={{ background: admin ? '#1F4D3A' : '#EEF4ED' }}><Icon name="family" size={24} sw={1.9} color={admin ? '#FFF8EF' : '#1F4D3A'} /></div>
                <div className="gc-body">
                  <div className="gc-top">
                    <span className="gc-name">{g.name}</span>
                    {groupId === g.id && <span className="gc-current">현재</span>}
                    {admin ? <span className="role-chip">관리자</span> : <span className="role-chip-gray">멤버</span>}
                  </div>
                  {g.description && <span className="gc-desc">{g.description}</span>}
                  <div className="gc-foot">
                    {names.length > 0 && <GroupAvs members={names} size={24} max={4} />}
                    <span className="gc-count">멤버 {count}명</span>
                  </div>
                </div>
              </button>
            );
          })}
          {groups && groups.length === 0 && !isLoading && (
            <div className="info-banner"><Icon name="info" size={17} sw={1.9} color="#1F4D3A" />아직 그룹이 없어요. 새 그룹을 만들거나 초대 코드로 참여해보세요.</div>
          )}
          <button className="group-add press" onClick={() => navigate('/auth')}>
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
  const { groupId, setGroupId } = useActiveGroup();
  const { data: groups } = useGroups();
  const { data: g } = useGroup(groupId);
  const { data: members } = useMembers(groupId);
  const { data: requests } = useJoinRequests(groupId);
  const pending = requests?.length ?? 0;
  const count = g?.memberCount ?? members?.length ?? 0;

  const menus: { ic: IconName; label: string; sub: string; bg: string; c: string; badge?: number; to?: string }[] = [
    { ic: 'people', label: '멤버 관리', sub: `${count}명`, bg: '#DDEBDD', c: '#1F4D3A', to: '/group/members' },
    { ic: 'plus', label: '멤버 초대', sub: '코드 · 링크 공유', bg: '#DDEBDD', c: '#1F4D3A', to: '/group/invite' },
    { ic: 'bell', label: '가입 요청', sub: pending > 0 ? `${pending}건 대기 중` : '요청 없음', bg: '#FCF1DD', c: '#C7841A', badge: pending || undefined, to: '/group/requests' },
    { ic: 'edit', label: '그룹 정보 수정', sub: '이름 · 사진 · 소개', bg: '#EEF4ED', c: '#1F4D3A', to: '/group/edit' },
  ];

  const copyCode = () => { if (g?.code) navigator.clipboard?.writeText(g.code); };

  return (
    <div className="screen">
      <div className="scroll">
        <div className="hdr" style={{ paddingBottom: 8 }}>
          <div><h1 className="hdr-title">그룹관리</h1><p className="hdr-sub">그룹을 선택해 관리해요</p></div>
          <div className="hdr-icons"><button className="ic-btn press"><Icon name="bell" size={21} sw={1.9} color="#3A463C" /></button></div>
        </div>

        <div className="grp-switch">
          {groups?.map(x => (
            <button key={x.id} className={`gswitch press ${groupId === x.id ? 'on' : ''}`} onClick={() => setGroupId(x.id)}>
              <div className="gsw-ic" style={{ background: groupId === x.id ? '#1F4D3A' : '#fff' }}><Icon name="family" size={18} sw={1.9} color={groupId === x.id ? '#FFF8EF' : '#1F4D3A'} /></div>
              <span className="gsw-name">{x.name}</span>
            </button>
          ))}
          <button className="gswitch add press" onClick={() => navigate('/auth')}><Icon name="plus" size={20} sw={2.2} color="#6D6A61" /></button>
        </div>

        <div className="block">
          <div className="grp-hero">
            <div className="grp-hero-glow" />
            <div className="grp-hero-top">
              <div className="grp-emblem"><Icon name="family" size={26} sw={1.9} color="#FFF8EF" /></div>
              {g?.code && <button className="grp-code press" onClick={copyCode}><Icon name="copy" size={15} sw={2} color="#C7E0CB" />{g.code}</button>}
            </div>
            <h2 className="grp-hero-name">{g?.name ?? '그룹'}</h2>
            {g?.description && <p className="grp-hero-desc">{g.description}</p>}
            <div className="grp-hero-stats">
              <div className="ghs"><span className="ghs-num">{count}</span><span className="ghs-label">멤버</span></div>
              <span className="ghs-div" />
              <div className="ghs"><span className="ghs-num">{isAdmin(g) ? '관리자' : '멤버'}</span><span className="ghs-label">내 역할</span></div>
              <span className="ghs-div" />
              <div className="ghs"><span className="ghs-num">{pending}</span><span className="ghs-label">가입 요청</span></div>
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
            {members?.map(m => (
              <button key={m.userId} className="member-tile press" onClick={() => navigate(`/group/member?uid=${m.userId}`)}>
                <PAvatar name={memberLabel(m)} size={52} />
                <span className="mt-name">{memberLabel(m)}</span>
                <span className={`mt-role ${m.role === 'ADMIN' ? 'admin' : ''}`}>{m.role === 'ADMIN' ? '관리자' : '멤버'}</span>
              </button>
            ))}
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
  const { groupId } = useActiveGroup();
  const { data: g } = useGroup(groupId);
  const { data: members } = useMembers(groupId);
  const { data: me } = useMe();
  const kick = useKickMember(groupId ?? 0);
  const [menu, setMenu] = useState<number | null>(null);
  const [invite, setInvite] = useState(false);

  const list = members ?? [];
  const copyCode = () => { if (g?.code) navigator.clipboard?.writeText(g.code); };
  const inviteMsg = () => `도란도란 «${g?.name ?? '우리 가족'}» 그룹에 초대합니다.\n초대 코드: ${g?.code ?? ''}`;
  const onShareKakao = () => shareToKakao({ title: '도란도란 그룹 초대', text: inviteMsg() });
  const onShareMore = () => shareText({ title: '도란도란 그룹 초대', text: inviteMsg() });

  return (
    <div className="screen">
      <div className="scroll" style={{ paddingBottom: 0 }}>
        <NavHeader title="멤버 관리" trailing={<button className="icon-action press" onClick={() => setInvite(true)}><Icon name="plus" size={22} sw={2.2} color="#3A463C" /></button>} />
        <div className="block-t" style={{ padding: '6px 22px 0' }}>
          <div className="member-summary"><Icon name="family" size={18} sw={1.9} color="#1F4D3A" /><b>{list.length}명</b>이 {g?.name ?? '그룹'}에 함께하고 있어요</div>
        </div>
        <div className="block" style={{ paddingTop: 12 }}>
          <div className="set-card">
            {list.map((m, i) => {
              const mine = me?.id === m.userId;
              return (
                <div key={m.userId} className="mrow-wrap">
                  <div className={`set-row ${i === list.length - 1 && menu !== m.userId ? 'last' : ''}`} style={{ paddingRight: 12 }} onClick={() => navigate(`/group/member?uid=${m.userId}`)}>
                    <PAvatar name={memberLabel(m)} size={42} />
                    <div className="mrow-body">
                      <span className="mrow-name">{memberLabel(m)}{mine && <span className="me-tag">나</span>}</span>
                      {m.nickname && <span className="mrow-sub">{m.nickname}</span>}
                    </div>
                    {m.role === 'ADMIN' && <span className="role-chip">관리자</span>}
                    {!mine && isAdmin(g) && (
                      <button className="mrow-more press" onClick={(e) => { e.stopPropagation(); setMenu(menu === m.userId ? null : m.userId); }}><Icon name="dots" size={20} color="#9A958A" /></button>
                    )}
                  </div>
                  {!mine && menu === m.userId && (
                    <div className="mrow-menu">
                      <button className="mm-opt press" onClick={() => navigate(`/group/member?uid=${m.userId}`)}><Icon name="edit" size={17} sw={1.9} color="#3A463C" />호칭 수정</button>
                      <button className="mm-opt press danger" onClick={() => { if (groupId && confirm(`${memberLabel(m)}님을 내보낼까요?`)) kick.mutate(m.userId); setMenu(null); }}><Icon name="logout" size={17} sw={1.9} color="#C25C40" />내보내기</button>
                    </div>
                  )}
                </div>
              );
            })}
            {list.length === 0 && <div className="set-row last" style={{ color: '#A8A296' }}>멤버를 불러오는 중…</div>}
          </div>
        </div>
        <div className="block" style={{ paddingTop: 4 }}>
          <div className="info-banner"><Icon name="shield" size={17} sw={1.9} color="#1F4D3A" />관리자만 멤버를 초대하거나 내보낼 수 있어요.</div>
        </div>
        <div style={{ height: 20 }} />
      </div>
      <div className="auth-foot"><button className="btn-primary press" onClick={() => setInvite(true)}><Icon name="plus" size={19} sw={2.2} color="#FFF8EF" />멤버 초대하기</button></div>

      <BottomSheet open={invite} onClose={() => setInvite(false)} title="가족 초대하기">
        <p className="sheet-lead">초대 링크나 코드를 공유하면 가족이 «{g?.name ?? '그룹'}»에 함께할 수 있어요.</p>
        <div className="invite-code">
          <span className="ic-label">초대 코드</span>
          <div className="ic-row"><span className="ic-value">{g?.code ?? '—'}</span><button className="ic-copy press" onClick={copyCode}><Icon name="copy" size={16} sw={2} color="#1F4D3A" />복사</button></div>
        </div>
        <div className="invite-qr">
          <div className="qr-box"><Icon name="qr" size={88} sw={1.6} color="#1F4D3A" /></div>
          <span className="qr-cap">QR 코드를 스캔해 바로 입장</span>
        </div>
        <div className="share-row">
          <button className="share-btn press" onClick={onShareKakao}><span className="sb-ico" style={{ background: '#FCE45A' }}><Icon name="chat" size={20} sw={2} color="#3A2A0A" /></span>카카오톡</button>
          <button className="share-btn press" onClick={copyCode}><span className="sb-ico" style={{ background: '#EEF4ED' }}><Icon name="link" size={20} sw={2} color="#1F4D3A" /></span>링크 복사</button>
          <button className="share-btn press" onClick={onShareMore}><span className="sb-ico" style={{ background: '#EEF4ED' }}><Icon name="share" size={20} sw={2} color="#1F4D3A" /></span>더보기</button>
        </div>
      </BottomSheet>
    </div>
  );
}

/* ── 멤버 상세 (+ 호칭 시트 / 내보내기 다이얼로그) ─ */
export function GrpMemberDetail() {
  const navigate = useNavigate();
  const { groupId } = useActiveGroup();
  const uid = Number(new URLSearchParams(window.location.search).get('uid')) || null;
  const { data: g } = useGroup(groupId);
  const { data: m } = useMember(groupId, uid);
  const { data: me } = useMe();
  const setNickname = useSetNickname(groupId ?? 0);
  const kick = useKickMember(groupId ?? 0);

  const [nick, setNick] = useState(false);
  const [remove, setRemove] = useState(false);
  const [nickInput, setNickInput] = useState('');
  const [nickInited, setNickInited] = useState(false);

  if (m && !nickInited) { setNickInput(m.nickname || memberLabel(m)); setNickInited(true); }
  const label = m ? memberLabel(m) : '멤버';
  const mine = me?.id === m?.userId;

  const saveNick = async () => {
    if (!groupId || !uid) return;
    try { await setNickname.mutateAsync({ userId: uid, body: { nickname: nickInput.trim() } }); setNick(false); }
    catch { /* noop */ }
  };
  const doKick = async () => {
    if (!groupId || !uid) return;
    try { await kick.mutateAsync(uid); navigate('/group/members'); } catch { /* noop */ }
  };

  return (
    <div className="screen">
      <div className="scroll" style={{ paddingBottom: 0 }}>
        <NavHeader title="멤버 정보" trailing={<button className="icon-action press"><Icon name="dots" size={20} color="#3A463C" /></button>} />
        <div className="block" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', paddingTop: 10 }}>
          <PAvatar name={label} size={88} />
          <h2 className="md-name">{label}</h2>
          <div className="md-sub"><span className={m?.role === 'ADMIN' ? 'role-chip' : 'role-chip-gray'}>{m?.role === 'ADMIN' ? '관리자' : '멤버'}</span>{m?.name}</div>
        </div>
        <div className="block" style={{ paddingTop: 8 }}>
          <span className="memo-label">내가 부르는 호칭</span>
          <button className="nick-row press" onClick={() => setNick(true)}>
            <div className="set-ic" style={{ background: '#EEF4ED' }}><Icon name="edit" size={18} sw={1.9} color="#1F4D3A" /></div>
            <div className="nick-row-body"><span className="nick-row-val">{m?.nickname || label}</span><span className="nick-row-sub">나에게만 보여요 · 탭해서 변경</span></div>
            <Icon name="chevron" size={17} sw={2.2} color="#C9C3B6" />
          </button>
        </div>
        <div className="block" style={{ paddingTop: 8 }}>
          <span className="memo-label">멤버 정보</span>
          <div className="set-card">
            <div className="set-row"><div className="set-ic" style={{ background: '#EEF4ED' }}><Icon name="family" size={18} sw={1.9} color="#1F4D3A" /></div><span className="set-title">그룹 호칭</span><span className="set-val">{m?.groupNickname || '—'}</span></div>
            <div className="set-row last"><div className="set-ic" style={{ background: '#F0EBE1' }}><Icon name="shield" size={18} sw={1.9} color="#8A8578" /></div><span className="set-title">역할</span><span className="set-val">{m?.role === 'ADMIN' ? '관리자' : '멤버'}</span></div>
          </div>
        </div>
        <div style={{ height: 20 }} />
      </div>
      {!mine && isAdmin(g) && (
        <div className="detail-actions">
          <button className="btn-ghost press" style={{ flex: 1 }} onClick={() => setRemove(true)}><Icon name="logout" size={18} sw={1.9} color="#C25C40" />그룹에서 내보내기</button>
        </div>
      )}

      <BottomSheet open={nick} onClose={() => setNick(false)} title="호칭 수정"
        footer={<button className="btn-primary press" onClick={saveNick} disabled={setNickname.isPending}>{setNickname.isPending ? '저장 중…' : '호칭 저장'}</button>}>
        <div className="nick-head">
          <PAvatar name={label} size={48} />
          <div><div className="nick-real">{m?.name} 님</div><div className="nick-meta">{g?.name ?? '그룹'} 멤버</div></div>
        </div>
        <div className="afield">
          <span className="afield-label">내가 부르는 호칭</span>
          <div className="afield-box focus"><Icon name="edit" size={18} sw={1.9} color="#1F4D3A" /><input className="afield-val" value={nickInput} onChange={e => setNickInput(e.target.value)} maxLength={10} style={{ flex: 1 }} /><span className="nick-count">{nickInput.length}/10</span></div>
        </div>
        <div className="nick-banner">
          <Icon name="info" size={17} sw={1.9} color="#1F4D3A" />
          <span>호칭은 <b>나에게만</b> 보여요. 같은 사람도 가족마다 다르게 부를 수 있어요.</span>
        </div>
      </BottomSheet>

      {remove && (
        <div className="dialog-layer open">
          <div className="dialog-scrim" onClick={() => setRemove(false)} />
          <div className="dialog">
            <div className="dialog-ic"><Icon name="logout" size={26} sw={1.9} color="#C25C40" /></div>
            <h4 className="dialog-title">{label}님을 내보낼까요?</h4>
            <p className="dialog-desc">{g?.name ?? '그룹'}에서 {label}님이 제외돼요.<br />함께 쌓은 기록은 그대로 보관돼요.</p>
            <div className="dialog-actions">
              <button className="dlg-btn press" onClick={() => setRemove(false)}>취소</button>
              <button className="dlg-btn danger press" onClick={doKick} disabled={kick.isPending}>{kick.isPending ? '처리 중…' : '내보내기'}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* ── 그룹 정보 수정 ─────────────────────────── */
export function GrpEdit() {
  const navigate = useNavigate();
  const { groupId } = useActiveGroup();
  const { data: g } = useGroup(groupId);
  const update = useUpdateGroup(groupId ?? 0);
  const regen = useRegenerateCode(groupId ?? 0);
  const [name, setName] = useState('');
  const [desc, setDesc] = useState('');
  const [photo, setPhoto] = useState<string | null>(null);
  const [inited, setInited] = useState(false);

  // 그룹 로드 시 1회 폼 초기화
  if (g && !inited) { setName(g.name ?? ''); setDesc(g.description ?? ''); setInited(true); }

  const pickPhoto = async () => { const [f] = await pickImage(); if (f) setPhoto(URL.createObjectURL(f)); };
  const save = async () => {
    if (!groupId) return;
    try { await update.mutateAsync({ name: name.trim(), description: desc.trim() || null }); navigate(-1); }
    catch { /* noop */ }
  };

  return (
    <div className="screen">
      <div className="scroll" style={{ paddingBottom: 0 }}>
        <NavHeader title="그룹 정보 수정" trailing={<button className="txt-action press" onClick={save}>저장</button>} />
        <div className="block" style={{ display: 'flex', justifyContent: 'center', paddingTop: 12 }}>
          <div className="grp-pick">
            <div className="grp-pick-img" style={photo ? { backgroundImage: `url(${photo})`, backgroundSize: 'cover', backgroundPosition: 'center' } : undefined}>
              {!photo && <Icon name="family" size={36} sw={1.8} color="#1F4D3A" />}
            </div>
            <button className="profile-cam press" onClick={pickPhoto}><Icon name="camera" size={19} sw={1.9} color="#3A463C" /></button>
          </div>
        </div>
        <div className="block afields" style={{ paddingTop: 14 }}>
          <div className="afield"><span className="afield-label">그룹 이름</span><div className="afield-box focus"><Icon name="family" size={19} sw={1.9} color="#1F4D3A" /><input className="afield-val" value={name} onChange={e => setName(e.target.value)} placeholder="그룹 이름" style={{ flex: 1 }} /></div></div>
          <div className="afield"><span className="afield-label">그룹 소개</span><div className="afield-box" style={{ height: 'auto', minHeight: 80, alignItems: 'flex-start', paddingTop: 15 }}><textarea className="afield-val" value={desc} onChange={e => setDesc(e.target.value)} placeholder="그룹 소개" style={{ flex: 1, resize: 'none', minHeight: 56, border: 'none', background: 'transparent' }} /></div></div>
          <div className="afield">
            <span className="afield-label">그룹 코드</span>
            <div className="afield-box" style={{ background: '#F6F1E8' }}><Icon name="lock" size={19} sw={1.9} color="#A8A296" /><span className="afield-val" style={{ color: '#6D6A61' }}>{g?.code ?? '—'}</span><button className="code-reset press" onClick={() => regen.mutate()} disabled={regen.isPending}>{regen.isPending ? '…' : '재발급'}</button></div>
          </div>
          {(update.error || regen.error) && <p style={{ color: '#C25C40', fontSize: 13, fontWeight: 600 }}>{((update.error || regen.error) as Error).message}</p>}
        </div>
        <div style={{ height: 20 }} />
      </div>
      <div className="auth-foot"><button className={`btn-primary press ${update.isPending ? 'disabled' : ''}`} onClick={save} disabled={update.isPending}>{update.isPending ? '저장 중…' : '변경사항 저장'}</button></div>
    </div>
  );
}

/* ── 가입 요청 관리 ─────────────────────────── */
export function GrpRequests() {
  const { groupId } = useActiveGroup();
  const { data: reqs, isLoading } = useJoinRequests(groupId);
  const accept = useAcceptRequest(groupId ?? 0);
  const deny = useDenyRequest(groupId ?? 0);
  const list = reqs ?? [];
  const busyId = accept.variables ?? deny.variables;

  return (
    <div className="screen">
      <div className="scroll">
        <NavHeader title="가입 요청" />
        <div className="block-t" style={{ padding: '6px 22px 0' }}>
          <div className="member-summary" style={{ background: '#FCF1DD', borderColor: '#EFD9AE' }}><Icon name="bell" size={18} sw={1.9} color="#C7841A" /><b style={{ color: '#C7841A' }}>{list.length}건</b>의 가입 요청이 대기 중이에요</div>
        </div>
        <div className="block stack" style={{ paddingTop: 14 }}>
          {isLoading && <div className="info-banner">가입 요청을 불러오는 중…</div>}
          {list.map(r => {
            const name = r.user?.name || r.name || '요청자';
            const busy = (accept.isPending || deny.isPending) && busyId === r.requestId;
            return (
              <div key={r.requestId} className="req-card">
                <div className="req-top">
                  <PAvatar name={name} size={46} />
                  <div className="req-body"><span className="req-name">{name}</span>{r.createdAt && <span className="req-sub">{new Date(r.createdAt).toLocaleString('ko-KR')}</span>}</div>
                </div>
                <div className="req-actions">
                  <button className="req-deny press" disabled={busy} onClick={() => deny.mutate(r.requestId)}>거절</button>
                  <button className="req-accept press" disabled={busy} onClick={() => accept.mutate(r.requestId)}><Icon name="check" size={17} sw={2.4} color="#fff" />수락</button>
                </div>
              </div>
            );
          })}
          {!isLoading && list.length === 0 && (
            <div className="info-banner"><Icon name="info" size={17} sw={1.9} color="#1F4D3A" />대기 중인 가입 요청이 없어요.</div>
          )}
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
  const navigate = useNavigate();
  const { groupId } = useActiveGroup();
  const { data: g } = useGroup(groupId);
  const { data: members } = useMembers(groupId);
  const leave = useLeaveGroup();
  const del = useDeleteGroup();
  const admin = isAdmin(g);

  const onLeave = async () => {
    if (!groupId || !confirm(`${g?.name ?? '그룹'}에서 나갈까요?`)) return;
    try { await leave.mutateAsync(groupId); navigate('/group'); } catch { /* noop */ }
  };
  const onDelete = async () => {
    if (!groupId || !confirm('정말 그룹을 삭제할까요? 모든 기록이 영구히 사라져요.')) return;
    try { await del.mutateAsync(groupId); navigate('/group'); } catch { /* noop */ }
  };

  return (
    <div className="screen">
      <div className="scroll">
        <NavHeader title="그룹 설정" />
        <div className="block" style={{ paddingTop: 8 }}>
          <div className="set-card">
            <div className="set-row"><div className="set-ic" style={{ background: '#EEF4ED' }}><Icon name="family" size={18} sw={1.9} color="#1F4D3A" /></div><span className="set-title">그룹 이름</span><span className="set-val">{g?.name ?? '—'}</span></div>
            <div className="set-row last"><div className="set-ic" style={{ background: '#EEF4ED' }}><Icon name="people" size={18} sw={1.9} color="#1F4D3A" /></div><span className="set-title">멤버</span><span className="set-val">{g?.memberCount ?? members?.length ?? 0}명</span></div>
          </div>
        </div>
        <div className="block" style={{ paddingTop: 16 }}>
          <span className="danger-label">위험 영역</span>
          <div className="set-card danger-card">
            <button className="set-row press" onClick={onLeave} disabled={leave.isPending}><div className="set-ic" style={{ background: '#FBE3DB' }}><Icon name="logout" size={18} sw={1.9} color="#C25C40" /></div><span className="set-title" style={{ color: '#C25C40' }}>{leave.isPending ? '나가는 중…' : '그룹 나가기'}</span><Icon name="chevron" size={17} sw={2.2} color="#E0A491" /></button>
            {admin && <button className="set-row last press" onClick={onDelete} disabled={del.isPending}><div className="set-ic" style={{ background: '#FBE3DB' }}><Icon name="trash" size={18} sw={1.9} color="#C25C40" /></div><span className="set-title" style={{ color: '#C25C40' }}>{del.isPending ? '삭제 중…' : '그룹 삭제하기'}</span><Icon name="chevron" size={17} sw={2.2} color="#E0A491" /></button>}
          </div>
          {admin && <p className="notif-note">그룹을 삭제하면 모든 일정·숙제·소식 기록이 영구히 사라져요. 이 작업은 되돌릴 수 없어요.</p>}
          {(leave.error || del.error) && <p style={{ color: '#C25C40', fontSize: 13, fontWeight: 600, paddingLeft: 2, marginTop: 8 }}>{((leave.error || del.error) as Error).message}</p>}
        </div>
        <div style={{ height: 18 }} />
      </div>
      <BottomNav active="그룹관리" />
    </div>
  );
}
