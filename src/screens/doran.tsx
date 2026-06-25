// doran.tsx — 도란도란 메인 탭 + 그룹 건강 허브/숙제/랭킹/리포트
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Icon, type IconName } from '../lib/Icon';
import { PAvatar, RingAvatar, SecHead, NavHeader, BottomNav, BottomSheet, EmptyState, Segmented } from '../lib/shared';

export const DORAN_MEM = ['엄마', '아빠', '나', '큰딸', '할머니', '삼촌'];

interface TaskMiniProps {
  icon: IconName; title: string; who: string; done: number; total: number; status: string; tone: 'amber' | 'green' | 'gray';
}
export function TaskMini({ icon, title, who, done, total, status, tone }: TaskMiniProps) {
  const navigate = useNavigate();
  const pct = Math.round((done / total) * 100);
  return (
    <div className="task press" onClick={() => navigate('/group/task')}>
      <div className="task-row1">
        <div className="task-ico"><Icon name={icon} size={20} sw={1.9} color="#1F4D3A" /></div>
        <div className="task-head">
          <span className="task-title">{title}</span>
          <div className="task-who"><PAvatar name={who} size={20} /><span>{who}</span></div>
        </div>
        <span className={`chip chip-${tone}`}>{status}</span>
      </div>
      <div className="task-row2">
        <div className="task-prog"><div className="bar"><div className="bar-fill" style={{ width: `${pct}%` }} /></div><span className="task-count">{done}/{total} 완료</span></div>
        <button className="btn-cert press" onClick={(e) => { e.stopPropagation(); navigate('/group/task'); }}>인증하기</button>
      </div>
    </div>
  );
}

/* ── 도란도란 메인 (핵심만) ─────────────────── */
export function DoranMain() {
  const navigate = useNavigate();
  const todos = [
    { ic: 'pill' as IconName, title: '감기약 복용하기', sub: '우리집 · 매일 오전 9시', tone: '#DDEBDD' },
    { ic: 'steps' as IconName, title: '하루 30분 걷기', sub: '우리집 · 오늘 목표', tone: '#DDEBDD' },
  ];
  return (
    <div className="screen">
      <div className="scroll">
        <div className="main-greet">
          <div className="mg-row">
            <div>
              <p className="mg-date">6월 17일 화요일</p>
              <h1 className="mg-hello">안녕하세요, 도란님</h1>
            </div>
            <button className="ic-btn press" onClick={() => navigate('/news')}><Icon name="bell" size={21} sw={1.9} color="#3A463C" /><span className="ic-dot" /></button>
          </div>
        </div>

        <section className="block">
          <SecHead title="오늘 꼭 챙길 일" />
          <button className="today-hero press" onClick={() => navigate('/schedule/detail')}>
            <div className="th-top"><span className="th-badge">오늘 일정</span><span className="th-time"><Icon name="clock" size={14} sw={2} color="#9DC2A4" />오후 1:00</span></div>
            <h2 className="th-title">엄마 정기 검진</h2>
            <p className="th-meta">행복내과의원 · 공복 검사 있어요</p>
            <div className="th-foot">
              <div className="th-avs"><PAvatar name="엄마" size={26} ring ringColor="#1F4D3A" /><div style={{ marginLeft: -8 }}><PAvatar name="나" size={26} ring ringColor="#1F4D3A" /></div><span className="th-with">엄마, 나</span></div>
              <span className="th-link">일정 보기<Icon name="chevron" size={15} sw={2.3} color="#9DC2A4" /></span>
            </div>
          </button>
        </section>

        <section className="block">
          <SecHead title="오늘 해야 할 숙제" action="전체보기" onAction={() => navigate('/group/tasks')} />
          <div className="stack">
            {todos.map((t, i) => (
              <div key={i} className="dtask">
                <div className="dtask-ic" style={{ background: t.tone }}><Icon name={t.ic} size={20} sw={1.9} color="#1F4D3A" /></div>
                <div className="dtask-body"><span className="dtask-title">{t.title}</span><span className="dtask-sub">{t.sub}</span></div>
                <button className="dtask-btn press" onClick={() => navigate('/group/task')}><Icon name="camera" size={15} sw={2} color="#fff" />인증</button>
              </div>
            ))}
            <div className="dtask-foot"><Icon name="check" size={15} sw={2.2} color="#9A958A" />오늘 인증할 숙제 <b>2건</b> 남았어요</div>
          </div>
        </section>
        <div style={{ height: 18 }} />
      </div>
      <BottomNav active="도란도란" />
    </div>
  );
}

/* ── 그룹 상세 · 건강 허브 ── */
export function DoranGroupHub() {
  const navigate = useNavigate();
  const ranks = [
    { label: '걸음수', who: '아빠', metric: '8,240보', pct: 82, color: '#4F8A5B', rank: '1위' },
    { label: '숙제 완료', who: '엄마', metric: '12회', pct: 71, color: '#E07A5F', rank: '1위' },
    { label: '응원왕', who: '큰딸', metric: '32번', pct: 95, color: '#F4B860', rank: '1위' },
  ];
  return (
    <div className="screen">
      <div className="scroll">
        <NavHeader title="우리집" trailing={<button className="icon-action press" onClick={() => navigate('/group/members')}><Icon name="people" size={21} sw={1.9} color="#3A463C" /></button>} />

        <div className="block">
          <div className="health-hero">
            <div className="grp-hero-glow" />
            <div className="hh-top">
              <div><span className="hh-cap">오늘 우리 가족</span><div className="hh-title">건강 점수 84점</div></div>
              <RingAvatar name="나" pct={84} color="#9DDDB0" size={60} />
            </div>
            <div className="hh-stats">
              <div className="hh-stat"><span className="hh-num">38<i>천보</i></span><span className="hh-label">걸음 합계</span></div>
              <span className="ghs-div" />
              <div className="hh-stat"><span className="hh-num">5<i>/6</i></span><span className="hh-label">숙제 인증</span></div>
              <span className="ghs-div" />
              <div className="hh-stat"><span className="hh-num">86</span><span className="hh-label">주고받은 응원</span></div>
            </div>
          </div>
        </div>

        <section className="block">
          <SecHead title="오늘의 가족" action="모두 보기" />
          <div className="today-strip">
            {DORAN_MEM.map((m, i) => (
              <div key={m} className="today-mem">
                <RingAvatar name={m} pct={[100, 82, 70, 45, 90, 30][i]} color="#4F8A5B" size={54} />
                <span className="tm-name">{m}</span>
                <span className="tm-done">{[100, 82, 70, 45, 90, 30][i]}%</span>
              </div>
            ))}
          </div>
        </section>

        <section className="block">
          <SecHead title="숙제 진행 현황" action="전체보기" onAction={() => navigate('/group/tasks')} />
          <div className="stack">
            <TaskMini icon="pill" title="감기약 복용하기" who="엄마" done={3} total={7} status="인증 필요" tone="amber" />
            <TaskMini icon="steps" title="하루 30분 걷기" who="아빠" done={5} total={7} status="진행중" tone="green" />
          </div>
        </section>

        <section className="block">
          <SecHead title="이번 달 랭킹" action="전체보기" onAction={() => navigate('/group/ranking')} />
          <div className="rank-scroll">
            {ranks.map(it => (
              <div className="rank-chip press" key={it.label}>
                <div className="rank-ring"><RingAvatar name={it.who} pct={it.pct} color={it.color} size={56} /><span className="rank-medal" style={{ background: it.color }}>{it.rank}</span></div>
                <span className="rank-label">{it.label}</span>
                <span className="rank-who">{it.who}</span>
                <span className="rank-metric">{it.metric}</span>
              </div>
            ))}
          </div>
        </section>

        <section className="block">
          <button className="report-link press" onClick={() => navigate('/group/report')}>
            <div className="rl-ic"><Icon name="chart" size={20} sw={1.9} color="#1F4D3A" /></div>
            <div className="rl-body"><span className="rl-title">가족 건강 리포트</span><span className="rl-sub">이번 주 평균 달성률 78%</span></div>
            <Icon name="chevron" size={18} sw={2.2} color="#C9C3B6" />
          </button>
        </section>
        <div style={{ height: 24 }} />
      </div>
    </div>
  );
}

/* ── 숙제 전체보기 ──────────────────────────── */
export function DoranTasks() {
  const navigate = useNavigate();
  const [tab, setTab] = useState('진행중');
  const ongoing: TaskMiniProps[] = [
    { icon: 'pill', title: '감기약 복용하기', who: '엄마', done: 3, total: 7, status: '인증 필요', tone: 'amber' },
    { icon: 'steps', title: '하루 30분 걷기', who: '아빠', done: 5, total: 7, status: '진행중', tone: 'green' },
    { icon: 'sun', title: '아침 스트레칭', who: '할머니', done: 2, total: 7, status: '진행중', tone: 'green' },
    { icon: 'heart', title: '혈압 기록하기', who: '아빠', done: 4, total: 7, status: '인증 필요', tone: 'amber' },
  ];
  const done: TaskMiniProps[] = [
    { icon: 'pill', title: '영양제 챙기기', who: '엄마', done: 7, total: 7, status: '완료', tone: 'gray' },
    { icon: 'chart', title: '체중 기록하기', who: '나', done: 7, total: 7, status: '완료', tone: 'gray' },
  ];
  const list = tab === '진행중' ? ongoing : done;
  return (
    <div className="screen">
      <div className="scroll">
        <NavHeader title="건강 숙제" trailing={<button className="icon-action press" onClick={() => navigate('/group/task/new')}><Icon name="plus" size={22} sw={2.2} color="#3A463C" /></button>} />
        <div style={{ padding: '4px 22px 0' }}><Segmented tabs={['진행중', '완료']} value={tab} onChange={setTab} /></div>
        <div className="block stack" style={{ paddingTop: 16 }}>
          {list.map((t, i) => <TaskMini key={i} {...t} />)}
        </div>
        <div style={{ height: 18 }} />
      </div>
      <BottomNav active="그룹관리" />
    </div>
  );
}

/* ── 숙제 상세·인증 ─────────────────────────── */
export function DoranTaskDetail({ onCertify }: { onCertify?: () => void }) {
  const days = [
    { d: '월', on: true }, { d: '화', on: true }, { d: '수', on: true },
    { d: '목', on: false, today: true }, { d: '금', on: false }, { d: '토', on: false }, { d: '일', on: false },
  ];
  return (
    <div className="screen">
      <div className="scroll" style={{ paddingBottom: 0 }}>
        <NavHeader title="숙제 상세" trailing={<button className="icon-action press"><Icon name="dots" size={20} color="#3A463C" /></button>} />
        <div className="block">
          <div className="td-hero">
            <div className="td-ico"><Icon name="pill" size={26} sw={1.8} color="#1F4D3A" /></div>
            <h2 className="td-title">감기약 복용하기</h2>
            <div className="td-who"><PAvatar name="엄마" size={24} />엄마 · 매일 오전 9시</div>
          </div>
        </div>
        <div className="block" style={{ paddingTop: 8 }}>
          <div className="prog-card">
            <div className="prog-top"><div><span className="prog-big">3<i>/7일</i></span><span className="prog-cap">이번 주 인증 현황</span></div><span className="chip chip-amber">인증 필요</span></div>
            <div className="bar" style={{ marginTop: 14 }}><div className="bar-fill" style={{ width: '43%' }} /></div>
            <div className="day-check">
              {days.map((x, i) => (
                <div key={i} className={`dc ${x.on ? 'on' : ''} ${x.today ? 'today' : ''}`}>
                  <span className="dc-day">{x.d}</span>
                  <span className="dc-mark">{x.on ? <Icon name="check" size={16} sw={2.6} color="#fff" /> : x.today ? <span className="dc-now" /> : <span className="dc-empty" />}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
        <div className="block" style={{ paddingTop: 10 }}>
          <span className="memo-label">인증 기록</span>
          <div className="cert-list">
            {[['수', '어제 오전 9:12'], ['화', '2일 전 오전 8:50'], ['월', '3일 전 오전 9:05']].map(([d, t], i) => (
              <div key={i} className="cert-row">
                <div className="cert-thumb"><Icon name="image" size={20} sw={1.6} color="#C9B79E" /></div>
                <div className="cert-body"><span className="cert-day">{d}요일 인증 완료</span><span className="cert-time">{t}</span></div>
                <Icon name="check" size={20} sw={2.4} color="#4F8A5B" />
              </div>
            ))}
          </div>
        </div>
        <div style={{ height: 20 }} />
      </div>
      <div className="auth-foot"><button className="btn-primary press" onClick={onCertify}><Icon name="camera" size={19} sw={1.9} color="#FFF8EF" />오늘 인증하기</button></div>
    </div>
  );
}

/* ── 숙제 인증 시트 (상세 + 시트) ───────────── */
export function DoranTaskPage() {
  const [sheet, setSheet] = useState(false);
  return (
    <>
      <DoranTaskDetail onCertify={() => setSheet(true)} />
      <BottomSheet open={sheet} onClose={() => setSheet(false)} title="오늘 숙제 인증"
        footer={<button className="btn-primary press" onClick={() => setSheet(false)}>인증 완료하기</button>}>
        <div className="cert-target"><div className="task-ico" style={{ width: 40, height: 40 }}><Icon name="pill" size={19} sw={1.9} color="#1F4D3A" /></div><div><div className="ct-name">감기약 복용하기</div><div className="ct-sub">목요일 · 오늘 인증</div></div></div>
        <div className="afield">
          <span className="afield-label">인증 사진</span>
          <div className="upload-box press">
            <div className="upload-ic"><Icon name="camera" size={26} sw={1.8} color="#7FA585" /></div>
            <span className="upload-title">복용 사진을 올려주세요</span>
            <span className="upload-sub">사진을 올리면 가족 소식에 공유돼요</span>
          </div>
        </div>
        <div className="afield"><span className="afield-label">한마디 (선택)</span><div className="afield-box"><span className="afield-val" style={{ color: '#A8A296' }}>오늘 컨디션은 어땠나요?</span></div></div>
        <div className="cert-share"><Icon name="cheer" size={17} sw={1.9} color="#C7841A" /><span>인증하면 가족에게 알림이 가고 응원을 받을 수 있어요</span></div>
      </BottomSheet>
    </>
  );
}

/* ── 숙제 만들기 폼 ─────────────────────────── */
export function DoranNewTask() {
  const [members, setMembers] = useState<string[]>(['엄마']);
  const cats: { ic: IconName; label: string }[] = [
    { ic: 'pill', label: '복약' }, { ic: 'steps', label: '운동' }, { ic: 'heart', label: '건강기록' },
    { ic: 'sun', label: '생활습관' }, { ic: 'diary', label: '기타' },
  ];
  const [cat, setCat] = useState('복약');
  const toggle = (m: string) => setMembers(p => p.includes(m) ? p.filter(x => x !== m) : [...p, m]);
  return (
    <div className="screen">
      <div className="scroll" style={{ paddingBottom: 0 }}>
        <NavHeader title="건강 숙제 만들기" />
        <div className="block afields" style={{ paddingTop: 8 }}>
          <div className="afield"><span className="afield-label">숙제 이름</span><div className="afield-box focus"><Icon name="diary" size={19} sw={1.9} color="#1F4D3A" /><span className="afield-val">감기약 복용하기</span></div></div>
        </div>
        <div className="block" style={{ paddingTop: 8 }}>
          <span className="afield-label" style={{ display: 'block', paddingLeft: 2, marginBottom: 10 }}>분류</span>
          <div className="cat-row">
            {cats.map(c => (
              <button key={c.label} className={`cat-chip press ${cat === c.label ? 'on' : ''}`} onClick={() => setCat(c.label)}>
                <Icon name={c.ic} size={19} sw={1.9} color={cat === c.label ? '#1F4D3A' : '#9A958A'} />{c.label}
              </button>
            ))}
          </div>
        </div>
        <div className="block" style={{ paddingTop: 12 }}>
          <span className="afield-label" style={{ display: 'block', paddingLeft: 2, marginBottom: 10 }}>담당 멤버</span>
          <div className="chip-select">
            {['엄마', '아빠', '나', '큰딸', '할머니', '삼촌'].map(m => (
              <button key={m} className={`chip-opt press ${members.includes(m) ? 'on' : ''}`} onClick={() => toggle(m)}>
                <PAvatar name={m} size={22} />{m}
              </button>
            ))}
          </div>
        </div>
        <div className="block" style={{ paddingTop: 12 }}>
          <div className="form-card">
            <button className="form-row press"><div className="form-ico" style={{ background: '#EEF4ED' }}><Icon name="leaf" size={18} sw={1.9} color="#1F4D3A" /></div><span className="form-label">반복</span><span className="form-val">매일</span><Icon name="chevron" size={17} sw={2.2} color="#C9C3B6" /></button>
            <button className="form-row press"><div className="form-ico" style={{ background: '#EEF4ED' }}><Icon name="calendar" size={18} sw={1.9} color="#1F4D3A" /></div><span className="form-label">기간</span><span className="form-val">7일간</span><Icon name="chevron" size={17} sw={2.2} color="#C9C3B6" /></button>
            <button className="form-row press"><div className="form-ico" style={{ background: '#FCF1DD' }}><Icon name="bell" size={18} sw={1.9} color="#1F4D3A" /></div><span className="form-label">알림</span><span className="form-val">오전 9:00</span><Icon name="chevron" size={17} sw={2.2} color="#C9C3B6" /></button>
          </div>
        </div>
        <div style={{ height: 20 }} />
      </div>
      <div className="auth-foot"><button className="btn-primary press">숙제 등록하기</button></div>
    </div>
  );
}

/* ── 랭킹 전체보기 ──────────────────────────── */
export function DoranRanking() {
  const [cat, setCat] = useState('걸음수');
  const data: Record<string, { who: string; metric: string; pct: number }[]> = {
    걸음수: [
      { who: '아빠', metric: '8,240보', pct: 100 }, { who: '나', metric: '6,910보', pct: 84 },
      { who: '엄마', metric: '5,430보', pct: 66 }, { who: '큰딸', metric: '4,120보', pct: 50 }, { who: '할머니', metric: '2,880보', pct: 35 },
    ],
    숙제: [
      { who: '엄마', metric: '12회', pct: 100 }, { who: '아빠', metric: '10회', pct: 83 },
      { who: '나', metric: '9회', pct: 75 }, { who: '할머니', metric: '6회', pct: 50 }, { who: '큰딸', metric: '4회', pct: 33 },
    ],
    응원: [
      { who: '큰딸', metric: '32번', pct: 100 }, { who: '나', metric: '24번', pct: 75 },
      { who: '엄마', metric: '18번', pct: 56 }, { who: '삼촌', metric: '11번', pct: 34 }, { who: '아빠', metric: '8번', pct: 25 },
    ],
  };
  const color = ({ 걸음수: '#4F8A5B', 숙제: '#E07A5F', 응원: '#F4B860' } as Record<string, string>)[cat];
  const medals = ['#F4B860', '#C7C2B6', '#CE9B6E'];
  const list = data[cat];
  return (
    <div className="screen">
      <div className="scroll">
        <NavHeader title="이번 달 랭킹" />
        <div style={{ padding: '4px 22px 0' }}><Segmented tabs={['걸음수', '숙제', '응원']} value={cat} onChange={setCat} /></div>
        <div className="block" style={{ paddingTop: 18 }}>
          <div className="podium">
            {[list[1], list[0], list[2]].map((m, i) => {
              const place = [2, 1, 3][i];
              return (
                <div key={m.who} className={`pod pod-${place}`}>
                  <div className="rank-ring"><RingAvatar name={m.who} pct={m.pct} color={color} size={place === 1 ? 66 : 54} /><span className="rank-medal" style={{ background: medals[place - 1] }}>{place}위</span></div>
                  <span className="pod-who">{m.who}</span>
                  <span className="pod-metric" style={{ color }}>{m.metric}</span>
                </div>
              );
            })}
          </div>
        </div>
        <div className="block" style={{ paddingTop: 6 }}>
          <div className="set-card">
            {list.map((m, i) => (
              <div key={m.who} className={`rank-row ${i === list.length - 1 ? 'last' : ''}`}>
                <span className={`rank-no ${i < 3 ? 'top' : ''}`}>{i + 1}</span>
                <PAvatar name={m.who} size={40} />
                <div className="rank-rb">
                  <span className="rank-name">{m.who}{m.who === '나' && <span className="me-tag">나</span>}</span>
                  <div className="bar" style={{ marginTop: 7 }}><div className="bar-fill" style={{ width: `${m.pct}%`, background: color }} /></div>
                </div>
                <span className="rank-val" style={{ color }}>{m.metric}</span>
              </div>
            ))}
          </div>
        </div>
        <div style={{ height: 18 }} />
      </div>
      <BottomNav active="그룹관리" />
    </div>
  );
}

/* ── 가족 건강 리포트 ───────────────────────── */
export function DoranReport() {
  const mems = [
    { who: '엄마', pct: 86, tasks: '12/14', steps: '5,430' },
    { who: '아빠', pct: 72, tasks: '10/14', steps: '8,240' },
    { who: '나', pct: 64, tasks: '9/14', steps: '6,910' },
    { who: '할머니', pct: 90, tasks: '13/14', steps: '2,880' },
  ];
  return (
    <div className="screen">
      <div className="scroll">
        <NavHeader title="가족 건강 리포트" trailing={<button className="icon-action press"><Icon name="share" size={19} sw={1.9} color="#3A463C" /></button>} />
        <div className="block" style={{ paddingTop: 8 }}>
          <div className="report-banner">
            <div className="rb-week">6월 2주차 · 우리집 리포트</div>
            <div className="rb-score">평균 달성률 <b>78%</b></div>
            <div className="rb-note">지난주보다 <span className="up">+9%</span> 올랐어요. 할머니가 이번 주 최고 달성!</div>
          </div>
        </div>
        <div className="block" style={{ paddingTop: 10 }}>
          <span className="memo-label">멤버별 달성률</span>
          <div className="set-card">
            {mems.map((m, i) => (
              <div key={m.who} className={`mem-report ${i === mems.length - 1 ? 'last' : ''}`}>
                <PAvatar name={m.who} size={42} />
                <div className="mr-body">
                  <div className="mr-top"><span className="mr-name">{m.who}</span><span className="mr-pct">{m.pct}%</span></div>
                  <div className="bar" style={{ marginTop: 8 }}><div className="bar-fill" style={{ width: `${m.pct}%` }} /></div>
                  <div className="mr-meta"><span><Icon name="check" size={12} sw={2.2} color="#9A958A" />숙제 {m.tasks}</span><span><Icon name="steps" size={12} sw={2.2} color="#9A958A" />{m.steps}보</span></div>
                </div>
              </div>
            ))}
          </div>
        </div>
        <div style={{ height: 18 }} />
      </div>
      <BottomNav active="그룹관리" />
    </div>
  );
}

/* ── 숙제 없음 · 빈 화면 ────────────────────── */
export function DoranEmpty() {
  const navigate = useNavigate();
  return (
    <div className="screen">
      <div className="scroll" style={{ display: 'flex', flexDirection: 'column' }}>
        <NavHeader title="건강 숙제" trailing={<button className="icon-action press"><Icon name="plus" size={22} sw={2.2} color="#3A463C" /></button>} />
        <div style={{ padding: '4px 22px 0' }}><Segmented tabs={['진행중', '완료']} value="진행중" onChange={() => {}} /></div>
        <EmptyState icon="check" title="진행 중인 숙제가 없어요"
          desc="가족과 함께할 건강 습관을 숙제로 만들어 매일 인증하고 응원해보세요." cta="첫 숙제 만들기" onCta={() => navigate('/group/task/new')} />
      </div>
      <BottomNav active="그룹관리" />
    </div>
  );
}
