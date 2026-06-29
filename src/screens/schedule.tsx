// schedule.tsx — 일정 탭: 목록, 상세, 추가/수정 폼, 날짜/시간/반복/알림 시트, 삭제, 빈 화면
import { useState, type ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { Icon, type IconName } from '../lib/Icon';
import { PAvatar, NavHeader, BottomNav, BottomSheet } from '../lib/shared';
import { useActiveGroup } from '../api/ActiveGroup';
import {
  useSchedules, useSchedule, useCreateSchedule, useUpdateSchedule, useDeleteSchedule, useMembers,
} from '../api/hooks';
import type { ScheduleResponse } from '../api/types';

const WK = ['일', '월', '화', '수', '목', '금', '토'];
const EV_COLOR: Record<string, string> = { green: '#4F8A5B', terra: '#E07A5F', amber: '#F4B860', forest: '#1F4D3A' };
const TONES = ['forest', 'green', 'terra', 'amber'];

/* 일정 응답에서 시작 시각 Date 추출 (startAt 우선, 없으면 다른 흔한 키 탐색) */
function schedAt(s: ScheduleResponse): Date | null {
  const raw = s.startAt || (s as Record<string, unknown>).startTime || (s as Record<string, unknown>).date || (s as Record<string, unknown>).startDate;
  if (!raw) return null;
  const d = new Date(raw as string);
  return isNaN(d.getTime()) ? null : d;
}
function fmtTime(d: Date) {
  const h = d.getHours();
  const ampm = h < 12 ? '오전' : '오후';
  const hh = h % 12 || 12;
  const mm = d.getMinutes();
  return { ampm, time: `${hh}:${String(mm).padStart(2, '0')}` };
}
function fmtDayLabel(d: Date) {
  return `${d.getMonth() + 1}월 ${d.getDate()}일`;
}
function isSameDay(a: Date, b: Date) {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
}

/* 월간 캘린더 (이벤트 점/도트) */
function MonthCal({ selected = 12, big = false, events = { 10: ['green'], 12: ['forest', 'terra'], 15: ['terra'], 21: ['amber'], 24: ['green'] } as Record<number, string[]> }) {
  const days = Array.from({ length: 30 }, (_, i) => i + 1);
  return (
    <div className={`cal ${big ? 'cal-big' : ''}`}>
      <div className="cal-head">
        <span className="cal-month">2025년 6월</span>
        <div className="cal-nav">
          <button className="cal-arrow press"><Icon name="chevron" size={17} sw={2.4} color="#6D6A61" style={{ transform: 'rotate(180deg)' }} /></button>
          <button className="cal-arrow press"><Icon name="chevron" size={17} sw={2.4} color="#6D6A61" /></button>
        </div>
      </div>
      <div className="cal-grid cal-wk">
        {WK.map((d, i) => <span key={d} className={`cal-wd ${i === 0 ? 'sun' : ''}`}>{d}</span>)}
      </div>
      <div className="cal-grid">
        {days.map(d => {
          const sel = d === selected, ev = events[d] || [];
          return (
            <button key={d} className={`cal-day press ${sel ? 'sel' : ''}`}>
              <span className="cal-num">{d}</span>
              {!big && ev.length > 0 && <span className="cal-dots">{ev.slice(0, 3).map((c, i) => <span key={i} className="cal-dot" style={{ background: sel ? '#A9CDAE' : EV_COLOR[c] }} />)}</span>}
            </button>
          );
        })}
      </div>
    </div>
  );
}

/* 타임라인 일정 카드 */
function SchedCard({ time, ampm, title, who, tone = 'forest', tag, last, onClick }: {
  time: string; ampm: string; title: string; who: string; tone?: string; tag?: string; last?: boolean; onClick?: () => void;
}) {
  return (
    <div className="tl-item">
      <div className="tl-rail"><span className="tl-dot" style={{ background: EV_COLOR[tone], boxShadow: `0 0 0 4px ${tone === 'terra' ? '#FBE3DB' : tone === 'amber' ? '#FCF1DD' : '#DDEBDD'}` }} />{!last && <span className="tl-line" />}</div>
      <div className="tl-card press" onClick={onClick}>
        <div className="tl-time"><span className="tl-ampm">{ampm}</span><span className="tl-hh">{time}</span></div>
        <span className="tl-bar" style={{ background: EV_COLOR[tone] }} />
        <div className="tl-body">
          <span className="tl-title">{title}</span>
          <div className="tl-meta">{who && <PAvatar name={who} size={20} />}{who}{tag && <span className="tl-chip"><Icon name="bell" size={12} sw={2.2} color="#C7841A" />{tag}</span>}</div>
        </div>
      </div>
    </div>
  );
}

/* ── 일정 목록 ──────────────────────────────── */
export function CalList() {
  const navigate = useNavigate();
  const { groupId } = useActiveGroup();
  const { data: schedules, isLoading, error } = useSchedules(groupId);

  // 시작 시각 기준 정렬 후 날짜별 그룹핑
  const sorted = (schedules ?? [])
    .map(s => ({ s, d: schedAt(s) }))
    .filter((x): x is { s: ScheduleResponse; d: Date } => x.d != null)
    .sort((a, b) => a.d.getTime() - b.d.getTime());
  const byDay = new Map<string, { s: ScheduleResponse; d: Date }[]>();
  for (const it of sorted) {
    const key = `${it.d.getFullYear()}-${it.d.getMonth()}-${it.d.getDate()}`;
    if (!byDay.has(key)) byDay.set(key, []);
    byDay.get(key)!.push(it);
  }
  const today = new Date();
  const empty = !isLoading && sorted.length === 0;

  return (
    <div className="screen">
      <div className="scroll">
        <div className="hdr" style={{ paddingBottom: 12 }}>
          <div><h1 className="hdr-title">일정</h1><p className="hdr-sub">가족과 함께할 일을 모았어요</p></div>
          <div className="hdr-icons">
            <button className="ic-btn press"><Icon name="search" size={21} sw={1.9} color="#3A463C" /></button>
            <button className="ic-btn press"><Icon name="filter" size={20} sw={1.9} color="#3A463C" /></button>
          </div>
        </div>
        <div className="block"><MonthCal /></div>
        {isLoading && <div className="block"><div className="info-banner">일정을 불러오는 중…</div></div>}
        {error && <div className="block"><div className="info-banner" style={{ background: '#FBE3DB', borderColor: '#EFC8BC', color: '#C25C40' }}><Icon name="info" size={17} sw={1.9} color="#C25C40" />{(error as Error).message}</div></div>}
        {empty && (
          <div className="block">
            <div className="info-banner"><Icon name="calendar" size={17} sw={1.9} color="#1F4D3A" />등록된 일정이 없어요. 아래 + 버튼으로 추가해보세요.</div>
          </div>
        )}
        {[...byDay.entries()].map(([key, items]) => {
          const d = items[0].d;
          const dow = WK[d.getDay()];
          return (
            <section className="block" key={key}>
              <div className="day-label"><b>{fmtDayLabel(d)}</b> {dow}요일{isSameDay(d, today) && <span className="day-tag">오늘</span>}</div>
              <div className="timeline">
                {items.map((it, i) => {
                  const { ampm, time } = fmtTime(it.d);
                  return (
                    <SchedCard key={it.s.id} ampm={ampm} time={time} title={it.s.title}
                      who={(it.s.members?.[0]?.name) || ''} tone={TONES[i % TONES.length]}
                      last={i === items.length - 1}
                      onClick={() => navigate(`/schedule/detail?eid=${it.s.id}`)} />
                  );
                })}
              </div>
            </section>
          );
        })}
        <div style={{ height: 90 }} />
      </div>
      <button className="fab press" onClick={() => navigate('/schedule/new')}><Icon name="plus" size={26} sw={2.4} color="#fff" /></button>
      <BottomNav active="일정" />
    </div>
  );
}

/* ── 일정 상세 ──────────────────────────────── */
function CalInfoRow({ ic, label, children, bg = '#EEF4ED' }: { ic: IconName; label: string; children: ReactNode; bg?: string }) {
  return (
    <div className="info-row">
      <div className="info-ico" style={{ background: bg }}><Icon name={ic} size={19} sw={1.9} color="#1F4D3A" /></div>
      <div className="info-body"><span className="info-label">{label}</span><div className="info-val">{children}</div></div>
    </div>
  );
}
export function CalDetail() {
  const navigate = useNavigate();
  const { groupId } = useActiveGroup();
  const eid = Number(new URLSearchParams(window.location.search).get('eid')) || null;
  const { data: s, isLoading } = useSchedule(groupId, eid);
  const delSchedule = useDeleteSchedule(groupId ?? 0);
  const [del, setDel] = useState(false);

  const d = s ? schedAt(s) : null;
  const when = d ? `${d.getFullYear()}년 ${fmtDayLabel(d)} (${WK[d.getDay()]}) ${fmtTime(d).ampm} ${fmtTime(d).time}` : '';
  const members = s?.members ?? [];
  const memo = (s as Record<string, unknown> | undefined)?.memo as string | undefined;
  const location = (s as Record<string, unknown> | undefined)?.location as string | undefined;

  const doDelete = async () => {
    if (!groupId || !eid) return;
    try { await delSchedule.mutateAsync(eid); navigate('/schedule'); } catch { /* noop */ }
  };

  return (
    <div className="screen">
      <div className="scroll" style={{ paddingBottom: 0 }}>
        <NavHeader title="일정 상세" trailing={<button className="icon-action press" onClick={() => navigate(`/schedule/new?eid=${eid}`)}><Icon name="edit" size={20} sw={1.9} color="#3A463C" /></button>} />
        {isLoading && <div className="block"><div className="info-banner">불러오는 중…</div></div>}
        <div className="block">
          <div className="detail-hero">
            <h2 className="detail-title">{s?.title ?? '일정'}</h2>
            {when && <div className="detail-when"><Icon name="calendar" size={15} sw={2} color="#9DC2A4" />{when}</div>}
          </div>
        </div>
        <div className="block" style={{ paddingTop: 8 }}>
          <div className="info-card">
            {when && <CalInfoRow ic="clock" label="일시">{when}</CalInfoRow>}
            {location && <CalInfoRow ic="mappin" label="장소">{location}</CalInfoRow>}
            {members.length > 0 && (
              <CalInfoRow ic="people" label="대상 멤버">
                <div className="member-avs">
                  {members.slice(0, 4).map(m => <PAvatar key={m.userId} name={m.name} size={28} ring />)}
                  <span className="member-names">{members.map(m => m.name).join(', ')}</span>
                </div>
              </CalInfoRow>
            )}
          </div>
        </div>
        {memo && (
          <div className="block" style={{ paddingTop: 10 }}>
            <span className="memo-label">메모</span>
            <div className="memo-card">{memo}</div>
          </div>
        )}
        <div style={{ height: 20 }} />
      </div>
      <div className="detail-actions">
        <button className="btn-ghost press" onClick={() => setDel(true)}><Icon name="trash" size={18} sw={1.9} color="#C25C40" />삭제</button>
        <button className="btn-primary press" style={{ flex: 2, height: 52 }} onClick={() => navigate(`/schedule/new?eid=${eid}`)}><Icon name="edit" size={18} sw={2} color="#FFF8EF" />수정하기</button>
      </div>
      {del && (
        <div className="dialog-layer open">
          <div className="dialog-scrim" onClick={() => setDel(false)} />
          <div className="dialog">
            <div className="dialog-ic"><Icon name="trash" size={26} sw={1.9} color="#C25C40" /></div>
            <h4 className="dialog-title">일정을 삭제할까요?</h4>
            <p className="dialog-desc">«{s?.title ?? '일정'}» 일정이 삭제돼요.<br />이 작업은 되돌릴 수 없어요.</p>
            <div className="dialog-actions">
              <button className="dlg-btn press" onClick={() => setDel(false)}>취소</button>
              <button className="dlg-btn danger press" onClick={doDelete} disabled={delSchedule.isPending}>{delSchedule.isPending ? '삭제 중…' : '삭제'}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* 폼 행 (탭하면 시트 열림) */
function FormRow({ ic, label, value, sub, bg = '#EEF4ED', active, onClick }: {
  ic: IconName; label: string; value: string; sub?: string; bg?: string; active?: boolean; onClick?: () => void;
}) {
  return (
    <button className={`form-row press ${active ? 'active' : ''}`} onClick={onClick}>
      <div className="form-ico" style={{ background: bg }}><Icon name={ic} size={18} sw={1.9} color="#1F4D3A" /></div>
      <span className="form-label">{label}</span>
      <span className="form-val">{value}{sub && <i>{sub}</i>}</span>
      <Icon name="chevron" size={17} sw={2.2} color="#C9C3B6" />
    </button>
  );
}

type SheetKind = null | 'date' | 'time';

/* ── 일정 추가/수정 폼 (시트 포함) ───────────── */
export function CalForm() {
  const navigate = useNavigate();
  const { groupId } = useActiveGroup();
  const eid = Number(new URLSearchParams(window.location.search).get('eid')) || null;
  const editing = eid != null;
  const { data: existing } = useSchedule(groupId, eid);
  const { data: groupMembers } = useMembers(groupId);
  const createSchedule = useCreateSchedule(groupId ?? 0);
  const updateSchedule = useUpdateSchedule(groupId ?? 0);

  const [title, setTitle] = useState('');
  const [location, setLocation] = useState('');
  const [memo, setMemo] = useState('');
  const [date, setDate] = useState<string>(() => new Date().toISOString().slice(0, 10));
  const [time, setTime] = useState('13:00');
  const [memberIds, setMemberIds] = useState<number[]>([]);
  const [sheet, setSheet] = useState<SheetKind>(null);
  const [inited, setInited] = useState(false);

  // 수정 모드: 기존 일정 1회 로드
  if (editing && existing && !inited) {
    setTitle(existing.title ?? '');
    setLocation(((existing as Record<string, unknown>).location as string) ?? '');
    setMemo(((existing as Record<string, unknown>).memo as string) ?? '');
    const d = schedAt(existing);
    if (d) { setDate(d.toISOString().slice(0, 10)); setTime(`${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`); }
    setMemberIds((existing.members ?? []).map(m => m.userId));
    setInited(true);
  }

  const toggleMember = (id: number) => setMemberIds(p => p.includes(id) ? p.filter(x => x !== id) : [...p, id]);

  const submit = async () => {
    if (!groupId || !title.trim()) return;
    const startAt = new Date(`${date}T${time}:00`).toISOString();
    const body = { title: title.trim(), startAt, location: location.trim() || null, memo: memo.trim() || null, memberIds };
    try {
      if (editing && eid) await updateSchedule.mutateAsync({ eventId: eid, body });
      else await createSchedule.mutateAsync(body);
      navigate('/schedule');
    } catch { /* noop */ }
  };

  const busy = createSchedule.isPending || updateSchedule.isPending;
  const err = (createSchedule.error || updateSchedule.error) as Error | null;
  // 표시용 날짜 라벨
  const dObj = new Date(`${date}T${time}:00`);
  const dateLabel = isNaN(dObj.getTime()) ? date : `${fmtDayLabel(dObj)} (${WK[dObj.getDay()]})`;
  const timeLabel = isNaN(dObj.getTime()) ? time : `${fmtTime(dObj).ampm} ${fmtTime(dObj).time}`;

  return (
    <div className="screen">
      <div className="scroll" style={{ paddingBottom: 0 }}>
        <NavHeader title={editing ? '일정 수정' : '일정 추가'} />
        <div className="block afields" style={{ paddingTop: 8 }}>
          <div className="afield">
            <span className="afield-label">제목</span>
            <div className="afield-box focus"><Icon name="diary" size={19} sw={1.9} color="#1F4D3A" /><input className="afield-val" value={title} onChange={e => setTitle(e.target.value)} placeholder="일정 제목" style={{ flex: 1 }} /></div>
          </div>
        </div>
        <div className="block" style={{ paddingTop: 14 }}>
          <div className="form-card">
            <FormRow ic="calendar" label="날짜" value={dateLabel} active={sheet === 'date'} onClick={() => setSheet('date')} />
            <FormRow ic="clock" label="시간" value={timeLabel} active={sheet === 'time'} onClick={() => setSheet('time')} />
            <div className="form-row" style={{ cursor: 'default' }}>
              <div className="form-ico" style={{ background: '#EEF4ED' }}><Icon name="mappin" size={18} sw={1.9} color="#1F4D3A" /></div>
              <span className="form-label">장소</span>
              <input className="form-val" value={location} onChange={e => setLocation(e.target.value)} placeholder="장소 입력" style={{ textAlign: 'right', flex: 1 }} />
            </div>
          </div>
        </div>
        <div className="block" style={{ paddingTop: 6 }}>
          <span className="afield-label" style={{ display: 'block', paddingLeft: 2, marginBottom: 10 }}>대상 멤버</span>
          <div className="chip-select">
            {(groupMembers ?? []).map(m => (
              <button key={m.userId} className={`chip-opt press ${memberIds.includes(m.userId) ? 'on' : ''}`} onClick={() => toggleMember(m.userId)}>
                <PAvatar name={m.name} size={22} />{m.name}
              </button>
            ))}
          </div>
        </div>
        <div className="block" style={{ paddingTop: 14 }}>
          <span className="afield-label" style={{ display: 'block', paddingLeft: 2, marginBottom: 10 }}>메모</span>
          <textarea className="memo-card" value={memo} onChange={e => setMemo(e.target.value)} placeholder="가족에게 공유할 메모를 적어주세요" style={{ minHeight: 84, width: '100%', resize: 'none' }} />
        </div>
        {err && <div className="block"><p style={{ color: '#C25C40', fontSize: 13, fontWeight: 600 }}>{err.message}</p></div>}
        <div style={{ height: 20 }} />
      </div>
      <div className="auth-foot">
        <button className={`btn-primary press ${busy || !title.trim() ? 'disabled' : ''}`} onClick={submit} disabled={busy}>{busy ? '저장 중…' : editing ? '수정 완료' : '등록하기'}</button>
      </div>

      {/* 날짜/시간 시트는 네이티브 input 으로 간소화 */}
      <BottomSheet open={sheet === 'date'} onClose={() => setSheet(null)} title="날짜 선택"
        footer={<button className="btn-primary press" onClick={() => setSheet(null)}>선택 완료</button>}>
        <input type="date" value={date} onChange={e => setDate(e.target.value)} className="afield-box focus" style={{ width: '100%', fontSize: 16 }} />
      </BottomSheet>
      <BottomSheet open={sheet === 'time'} onClose={() => setSheet(null)} title="시간 선택"
        footer={<button className="btn-primary press" onClick={() => setSheet(null)}>선택 완료</button>}>
        <input type="time" value={time} onChange={e => setTime(e.target.value)} className="afield-box focus" style={{ width: '100%', fontSize: 16 }} />
      </BottomSheet>
    </div>
  );
}

/* ── 빈 화면 ────────────────────────────────── */
export function CalEmpty() {
  const navigate = useNavigate();
  return (
    <div className="screen">
      <div className="scroll" style={{ display: 'flex', flexDirection: 'column' }}>
        <div className="hdr" style={{ paddingBottom: 12 }}>
          <div><h1 className="hdr-title">일정</h1><p className="hdr-sub">가족과 함께할 일을 모았어요</p></div>
          <div className="hdr-icons"><button className="ic-btn press"><Icon name="search" size={21} sw={1.9} color="#3A463C" /></button></div>
        </div>
        <div className="block"><MonthCal events={{}} /></div>
        <div className="empty">
          <div className="empty-ic"><Icon name="calendar" size={38} sw={1.7} color="#9BB89F" /></div>
          <h4 className="empty-title">등록된 일정이 없어요</h4>
          <p className="empty-desc">가족과 함께할 첫 일정을 등록하고 잊지 않게 알림을 받아보세요.</p>
          <button className="empty-cta press" onClick={() => navigate('/schedule/new')}><Icon name="plus" size={18} sw={2.3} color="#fff" />첫 일정 등록하기</button>
        </div>
      </div>
      <BottomNav active="일정" />
    </div>
  );
}
