// schedule.tsx — 일정 탭: 목록, 상세, 추가/수정 폼, 날짜/시간/반복/알림 시트, 삭제, 빈 화면
import { useState, type ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { Icon, type IconName } from '../lib/Icon';
import { PAvatar, NavHeader, BottomNav, BottomSheet } from '../lib/shared';

const CAL_MEMBERS = ['엄마', '아빠', '나', '큰딸', '할머니', '삼촌'];
const WK = ['일', '월', '화', '수', '목', '금', '토'];
const EV_COLOR: Record<string, string> = { green: '#4F8A5B', terra: '#E07A5F', amber: '#F4B860', forest: '#1F4D3A' };

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
          <div className="tl-meta"><PAvatar name={who} size={20} />{who}{tag && <span className="tl-chip"><Icon name="bell" size={12} sw={2.2} color="#C7841A" />{tag}</span>}</div>
        </div>
      </div>
    </div>
  );
}

/* ── 일정 목록 ──────────────────────────────── */
export function CalList() {
  const navigate = useNavigate();
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
        <section className="block">
          <div className="day-label"><b>6월 12일</b> 목요일<span className="day-tag">오늘</span></div>
          <div className="timeline">
            <SchedCard ampm="오후" time="1:00" title="엄마 정기 검진" who="엄마" tone="forest" tag="1시간 전" onClick={() => navigate('/schedule/detail')} />
            <SchedCard ampm="오후" time="6:30" title="가족 저녁 식사" who="나" tone="green" last onClick={() => navigate('/schedule/detail')} />
          </div>
        </section>
        <section className="block">
          <div className="day-label"><b>6월 15일</b> 일요일</div>
          <div className="timeline">
            <SchedCard ampm="오전" time="9:30" title="아빠 건강검진" who="아빠" tone="terra" tag="1일 전" last onClick={() => navigate('/schedule/detail')} />
          </div>
        </section>
        <section className="block">
          <div className="day-label"><b>6월 21일</b> 토요일</div>
          <div className="timeline">
            <SchedCard ampm="오후" time="6:00" title="가족 모임" who="삼촌" tone="amber" last onClick={() => navigate('/schedule/detail')} />
          </div>
        </section>
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
  const [del, setDel] = useState(false);
  return (
    <div className="screen">
      <div className="scroll" style={{ paddingBottom: 0 }}>
        <NavHeader title="일정 상세" trailing={<button className="icon-action press" onClick={() => navigate('/schedule/new')}><Icon name="edit" size={20} sw={1.9} color="#3A463C" /></button>} />
        <div className="block">
          <div className="detail-hero">
            <span className="chip chip-green" style={{ alignSelf: 'flex-start' }}>건강 검진</span>
            <h2 className="detail-title">엄마 정기 검진</h2>
            <div className="detail-when"><Icon name="calendar" size={15} sw={2} color="#9DC2A4" />6월 12일 목요일 · 오후 1:00</div>
          </div>
        </div>
        <div className="block" style={{ paddingTop: 8 }}>
          <div className="info-card">
            <CalInfoRow ic="clock" label="일시">2025년 6월 12일 (목) 오후 1:00 ~ 2:30</CalInfoRow>
            <CalInfoRow ic="mappin" label="장소">서울 행복내과의원</CalInfoRow>
            <CalInfoRow ic="people" label="대상 멤버">
              <div className="member-avs"><PAvatar name="엄마" size={28} ring /><PAvatar name="나" size={28} ring /><span className="member-names">엄마, 나</span></div>
            </CalInfoRow>
            <CalInfoRow ic="bell" label="알림" bg="#FCF1DD"><span style={{ color: '#C7841A', fontWeight: 700 }}>1시간 전 · 1일 전</span></CalInfoRow>
            <CalInfoRow ic="leaf" label="반복">반복 안 함</CalInfoRow>
          </div>
        </div>
        <div className="block" style={{ paddingTop: 10 }}>
          <span className="memo-label">메모</span>
          <div className="memo-card">공복 혈액검사가 있어 아침 식사는 거르고 오세요. 평소 드시던 약 목록을 챙겨가면 좋아요.</div>
        </div>
        <div style={{ height: 20 }} />
      </div>
      <div className="detail-actions">
        <button className="btn-ghost press" onClick={() => setDel(true)}><Icon name="trash" size={18} sw={1.9} color="#C25C40" />삭제</button>
        <button className="btn-primary press" style={{ flex: 2, height: 52 }} onClick={() => navigate('/schedule/new')}><Icon name="edit" size={18} sw={2} color="#FFF8EF" />수정하기</button>
      </div>
      {del && (
        <div className="dialog-layer open">
          <div className="dialog-scrim" onClick={() => setDel(false)} />
          <div className="dialog">
            <div className="dialog-ic"><Icon name="trash" size={26} sw={1.9} color="#C25C40" /></div>
            <h4 className="dialog-title">일정을 삭제할까요?</h4>
            <p className="dialog-desc">«엄마 정기 검진» 일정이 삭제돼요.<br />이 작업은 되돌릴 수 없어요.</p>
            <div className="dialog-actions">
              <button className="dlg-btn press" onClick={() => setDel(false)}>취소</button>
              <button className="dlg-btn danger press" onClick={() => navigate('/schedule')}>삭제</button>
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

/* 휠 컬럼 */
function Wheel({ items, active }: { items: string[]; active: number }) {
  const ROW = 40;
  const center = (items.length - 1) / 2;
  return (
    <div className="wheel" style={{ transform: `translateY(${(center - active) * ROW}px)` }}>
      {items.map((it, i) => {
        const d = Math.abs(i - active);
        return <div key={i} className={`wheel-item ${i === active ? 'on' : ''}`} style={{ opacity: i === active ? 1 : Math.max(0.2, 1 - d * 0.32) }}>{it}</div>;
      })}
    </div>
  );
}

type SheetKind = null | 'date' | 'time' | 'repeat' | 'alarm';

/* ── 일정 추가/수정 폼 (시트 포함) ───────────── */
export function CalForm() {
  const [members, setMembers] = useState<string[]>(['엄마', '나']);
  const [sheet, setSheet] = useState<SheetKind>(null);
  const toggle = (m: string) => setMembers(p => p.includes(m) ? p.filter(x => x !== m) : [...p, m]);
  return (
    <div className="screen">
      <div className="scroll" style={{ paddingBottom: 0 }}>
        <NavHeader title="일정 추가" trailing={<button className="txt-action press">임시저장</button>} />
        <div className="block afields" style={{ paddingTop: 8 }}>
          <div className="afield">
            <span className="afield-label">제목</span>
            <div className="afield-box focus"><Icon name="diary" size={19} sw={1.9} color="#1F4D3A" /><span className="afield-val">엄마 정기 검진</span></div>
          </div>
        </div>
        <div className="block" style={{ paddingTop: 14 }}>
          <div className="form-card">
            <FormRow ic="calendar" label="날짜" value="6월 12일 (목)" active={sheet === 'date'} onClick={() => setSheet('date')} />
            <FormRow ic="clock" label="시간" value="오후 1:00" sub=" ~ 2:30" active={sheet === 'time'} onClick={() => setSheet('time')} />
            <FormRow ic="mappin" label="장소" value="행복내과의원" />
            <FormRow ic="leaf" label="반복" value="반복 안 함" active={sheet === 'repeat'} onClick={() => setSheet('repeat')} />
            <FormRow ic="bell" label="알림" value="1시간 전" bg="#FCF1DD" active={sheet === 'alarm'} onClick={() => setSheet('alarm')} />
          </div>
        </div>
        <div className="block" style={{ paddingTop: 6 }}>
          <span className="afield-label" style={{ display: 'block', paddingLeft: 2, marginBottom: 10 }}>대상 멤버</span>
          <div className="chip-select">
            {CAL_MEMBERS.map(m => (
              <button key={m} className={`chip-opt press ${members.includes(m) ? 'on' : ''}`} onClick={() => toggle(m)}>
                <PAvatar name={m} size={22} />{m}
              </button>
            ))}
          </div>
        </div>
        <div className="block" style={{ paddingTop: 14 }}>
          <span className="afield-label" style={{ display: 'block', paddingLeft: 2, marginBottom: 10 }}>메모</span>
          <div className="memo-card" style={{ color: '#A8A296', minHeight: 84 }}>가족에게 공유할 메모를 적어주세요</div>
        </div>
        <div style={{ height: 20 }} />
      </div>
      <div className="auth-foot">
        <button className="btn-primary press">등록하기</button>
      </div>

      <BottomSheet open={sheet === 'date'} onClose={() => setSheet(null)} title="날짜 선택"
        footer={<button className="btn-primary press" onClick={() => setSheet(null)}>선택 완료</button>}>
        <MonthCal big selected={12} />
        <div className="quick-date">
          <button className="qd-chip press">오늘</button>
          <button className="qd-chip press on">내일</button>
          <button className="qd-chip press">이번 주말</button>
          <button className="qd-chip press">다음 주</button>
        </div>
      </BottomSheet>

      <BottomSheet open={sheet === 'time'} onClose={() => setSheet(null)} title="시간 선택"
        footer={<button className="btn-primary press" onClick={() => setSheet(null)}>선택 완료</button>}>
        <div className="time-wheel">
          <div className="wheel-sel" />
          <Wheel items={['오전', '오후']} active={1} />
          <Wheel items={['11', '12', '1', '2', '3']} active={2} />
          <span className="wheel-colon">:</span>
          <Wheel items={['00', '15', '30', '45']} active={0} />
        </div>
        <div className="time-quick">
          <button className="qd-chip press">30분</button>
          <button className="qd-chip press on">1시간</button>
          <button className="qd-chip press">1시간 30분</button>
          <button className="qd-chip press">2시간</button>
        </div>
      </BottomSheet>

      <BottomSheet open={sheet === 'repeat'} onClose={() => setSheet(null)} title="반복"
        footer={<button className="btn-primary press" onClick={() => setSheet(null)}>선택 완료</button>}>
        <div className="opt-list">
          {['반복 안 함', '매일', '매주 목요일', '매월 12일', '매년 6월 12일'].map((o, i) => (
            <button key={o} className={`opt-row press ${i === 0 ? 'first' : ''}`}>
              <span className="opt-label">{o}</span>
              <span className={`radio ${o === '반복 안 함' ? 'on' : ''}`} />
            </button>
          ))}
        </div>
      </BottomSheet>

      <BottomSheet open={sheet === 'alarm'} onClose={() => setSheet(null)} title="알림"
        footer={<button className="btn-primary press" onClick={() => setSheet(null)}>선택 완료</button>}>
        <p className="sheet-lead">여러 시점에 알림을 받을 수 있어요.</p>
        <div className="opt-list">
          {[{ label: '정시', on: false }, { label: '10분 전', on: false }, { label: '1시간 전', on: true }, { label: '1일 전', on: true }, { label: '1주일 전', on: false }].map((o, i) => (
            <button key={o.label} className={`opt-row press ${i === 0 ? 'first' : ''}`}>
              <span className="opt-label">{o.label}</span>
              <span className={`cbox ${o.on ? 'on' : ''}`}>{o.on && <Icon name="check" size={13} sw={2.6} color="#fff" />}</span>
            </button>
          ))}
        </div>
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
