// doran.tsx — 도란도란 메인 탭 + 그룹 건강 허브/숙제/랭킹/리포트
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Icon, type IconName } from '../lib/Icon';
import { PAvatar, RingAvatar, SecHead, NavHeader, BottomNav, BottomSheet, EmptyState, Segmented } from '../lib/shared';
import { useActiveGroup } from '../api/ActiveGroup';
import { useTasks, useTask, useCreateTask, useCertifyTask, useDeleteTask, useMembers, useMe, useSchedules } from '../api/hooks';
import { pickImage } from '../lib/share';
import type { TaskResponse } from '../api/types';

export const DORAN_MEM = ['엄마', '아빠', '나', '큰딸', '할머니', '삼촌'];

/* 숙제 응답에서 진척도/담당자 등 안전 추출 */
function taskInfo(t: TaskResponse) {
  const total = t.goal ?? (t as Record<string, unknown>).total as number ?? 7;
  const done = t.done ?? t.progress ?? (t as Record<string, unknown>).certCount as number ?? 0;
  const who = t.assignee?.name ?? ((t as Record<string, unknown>).assigneeName as string) ?? '';
  const pct = total > 0 ? Math.round((done / total) * 100) : 0;
  const complete = done >= total;
  return { total, done, who, pct, complete };
}
const CAT_ICON: Record<string, IconName> = { 복약: 'pill', 운동: 'steps', 건강기록: 'heart', 생활습관: 'sun', 기타: 'diary' };
function taskIcon(t: TaskResponse): IconName {
  const c = (t.category as string) || '';
  return CAT_ICON[c] || 'check';
}

export function TaskMini({ task }: { task: TaskResponse }) {
  const navigate = useNavigate();
  const { done, total, who, pct, complete } = taskInfo(task);
  const tone = complete ? 'gray' : done < total / 2 ? 'amber' : 'green';
  const status = complete ? '완료' : done < total / 2 ? '인증 필요' : '진행중';
  return (
    <div className="task press" onClick={() => navigate(`/group/task?tid=${task.id}`)}>
      <div className="task-row1">
        <div className="task-ico"><Icon name={taskIcon(task)} size={20} sw={1.9} color="#1F4D3A" /></div>
        <div className="task-head">
          <span className="task-title">{task.title}</span>
          {who && <div className="task-who"><PAvatar name={who} size={20} /><span>{who}</span></div>}
        </div>
        <span className={`chip chip-${tone}`}>{status}</span>
      </div>
      <div className="task-row2">
        <div className="task-prog"><div className="bar"><div className="bar-fill" style={{ width: `${pct}%` }} /></div><span className="task-count">{done}/{total} 완료</span></div>
        <button className="btn-cert press" onClick={(e) => { e.stopPropagation(); navigate(`/group/task?tid=${task.id}`); }}>인증하기</button>
      </div>
    </div>
  );
}

/* ── 도란도란 메인 (핵심만) ─────────────────── */
export function DoranMain() {
  const navigate = useNavigate();
  const { groupId } = useActiveGroup();
  const { data: me } = useMe();
  const { data: tasks } = useTasks(groupId);
  const { data: schedules } = useSchedules(groupId);

  const today = new Date();
  const dateLabel = `${today.getMonth() + 1}월 ${today.getDate()}일 ${['일', '월', '화', '수', '목', '금', '토'][today.getDay()]}요일`;

  // 미완료 숙제만
  const pending = (tasks ?? []).filter(t => { const { complete } = taskInfo(t); return !complete; });
  // 오늘/다가오는 첫 일정
  const upcoming = (schedules ?? [])
    .map(s => ({ s, d: s.startAt ? new Date(s.startAt) : null }))
    .filter((x): x is { s: typeof x.s; d: Date } => x.d != null && x.d.getTime() >= today.setHours(0, 0, 0, 0))
    .sort((a, b) => a.d.getTime() - b.d.getTime())[0];

  const fmtT = (d: Date) => { const h = d.getHours(); return `${h < 12 ? '오전' : '오후'} ${h % 12 || 12}:${String(d.getMinutes()).padStart(2, '0')}`; };

  return (
    <div className="screen">
      <div className="scroll">
        <div className="main-greet">
          <div className="mg-row">
            <div>
              <p className="mg-date">{dateLabel}</p>
              <h1 className="mg-hello">안녕하세요, {me?.nickname || me?.name || '도란'}님</h1>
            </div>
            <button className="ic-btn press" onClick={() => navigate('/news')}><Icon name="bell" size={21} sw={1.9} color="#3A463C" /><span className="ic-dot" /></button>
          </div>
        </div>

        <section className="block">
          <SecHead title="오늘 꼭 챙길 일" />
          {upcoming ? (
            <button className="today-hero press" onClick={() => navigate(`/schedule/detail?eid=${upcoming.s.id}`)}>
              <div className="th-top"><span className="th-badge">{today.toDateString() === upcoming.d.toDateString() ? '오늘 일정' : '다가오는 일정'}</span><span className="th-time"><Icon name="clock" size={14} sw={2} color="#9DC2A4" />{fmtT(upcoming.d)}</span></div>
              <h2 className="th-title">{upcoming.s.title}</h2>
              {(upcoming.s as Record<string, unknown>).location ? <p className="th-meta">{String((upcoming.s as Record<string, unknown>).location)}</p> : null}
              <div className="th-foot">
                <div className="th-avs">{(upcoming.s.members ?? []).slice(0, 2).map((m, i) => <div key={m.userId} style={{ marginLeft: i ? -8 : 0 }}><PAvatar name={m.name} size={26} ring ringColor="#1F4D3A" /></div>)}<span className="th-with">{(upcoming.s.members ?? []).map(m => m.name).join(', ')}</span></div>
                <span className="th-link">일정 보기<Icon name="chevron" size={15} sw={2.3} color="#9DC2A4" /></span>
              </div>
            </button>
          ) : (
            <div className="nudge"><div className="nudge-ic"><Icon name="calendar" size={18} sw={1.9} color="#C7841A" /></div><span className="nudge-text">다가오는 일정이 없어요</span></div>
          )}
        </section>

        <section className="block">
          <SecHead title="오늘 해야 할 숙제" action="전체보기" onAction={() => navigate('/group/tasks')} />
          <div className="stack">
            {pending.slice(0, 4).map(t => (
              <div key={t.id} className="dtask">
                <div className="dtask-ic" style={{ background: '#DDEBDD' }}><Icon name={taskIcon(t)} size={20} sw={1.9} color="#1F4D3A" /></div>
                <div className="dtask-body"><span className="dtask-title">{t.title}</span>{taskInfo(t).who && <span className="dtask-sub">{taskInfo(t).who}</span>}</div>
                <button className="dtask-btn press" onClick={() => navigate(`/group/task?tid=${t.id}`)}><Icon name="camera" size={15} sw={2} color="#fff" />인증</button>
              </div>
            ))}
            {pending.length > 0
              ? <div className="dtask-foot"><Icon name="check" size={15} sw={2.2} color="#9A958A" />오늘 인증할 숙제 <b>{pending.length}건</b> 남았어요</div>
              : <div className="dtask-foot"><Icon name="check" size={15} sw={2.2} color="#4F8A5B" />오늘 숙제를 모두 끝냈어요!</div>}
          </div>
        </section>
        <div style={{ height: 18 }} />
      </div>
      <BottomNav active="도란도란" />
    </div>
  );
}

/* 허브 내 숙제 진행 현황 (실데이터) */
function HubTaskSection() {
  const navigate = useNavigate();
  const { groupId } = useActiveGroup();
  const { data: tasks } = useTasks(groupId);
  const top = (tasks ?? []).slice(0, 3);
  return (
    <section className="block">
      <SecHead title="숙제 진행 현황" action="전체보기" onAction={() => navigate('/group/tasks')} />
      <div className="stack">
        {top.map(t => <TaskMini key={t.id} task={t} />)}
        {top.length === 0 && <div className="nudge"><div className="nudge-ic"><Icon name="check" size={18} sw={1.9} color="#C7841A" /></div><span className="nudge-text">등록된 숙제가 없어요</span></div>}
      </div>
    </section>
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

        <HubTaskSection />

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
  const { groupId } = useActiveGroup();
  const { data: tasks, isLoading } = useTasks(groupId);
  const [tab, setTab] = useState('진행중');

  const all = tasks ?? [];
  const list = all.filter(t => { const { complete } = taskInfo(t); return tab === '진행중' ? !complete : complete; });

  if (!isLoading && all.length === 0) {
    return <DoranEmpty />;
  }
  return (
    <div className="screen">
      <div className="scroll">
        <NavHeader title="건강 숙제" trailing={<button className="icon-action press" onClick={() => navigate('/group/task/new')}><Icon name="plus" size={22} sw={2.2} color="#3A463C" /></button>} />
        <div style={{ padding: '4px 22px 0' }}><Segmented tabs={['진행중', '완료']} value={tab} onChange={setTab} /></div>
        <div className="block stack" style={{ paddingTop: 16 }}>
          {isLoading && <div className="nudge"><span className="nudge-text">불러오는 중…</span></div>}
          {list.map(t => <TaskMini key={t.id} task={t} />)}
          {!isLoading && list.length === 0 && <div className="nudge"><div className="nudge-ic"><Icon name="check" size={18} sw={1.9} color="#C7841A" /></div><span className="nudge-text">{tab} 숙제가 없어요</span></div>}
        </div>
        <div style={{ height: 18 }} />
      </div>
      <BottomNav active="그룹관리" />
    </div>
  );
}

/* ── 숙제 상세·인증 ─────────────────────────── */
export function DoranTaskDetail({ task, onCertify, onMore }: { task?: TaskResponse; onCertify?: () => void; onMore?: () => void }) {
  const info = task ? taskInfo(task) : null;
  const pct = info?.pct ?? 0;
  const tone = !info ? 'green' : info.complete ? 'gray' : info.done < info.total / 2 ? 'amber' : 'green';
  const status = !info ? '' : info.complete ? '완료' : info.done < info.total / 2 ? '인증 필요' : '진행중';
  return (
    <div className="screen">
      <div className="scroll" style={{ paddingBottom: 0 }}>
        <NavHeader title="숙제 상세" trailing={onMore ? <button className="icon-action press" onClick={onMore}><Icon name="dots" size={20} color="#3A463C" /></button> : undefined} />
        <div className="block">
          <div className="td-hero">
            <div className="td-ico"><Icon name={task ? taskIcon(task) : 'check'} size={26} sw={1.8} color="#1F4D3A" /></div>
            <h2 className="td-title">{task?.title ?? '숙제'}</h2>
            {info?.who && <div className="td-who"><PAvatar name={info.who} size={24} />{info.who}</div>}
          </div>
        </div>
        <div className="block" style={{ paddingTop: 8 }}>
          <div className="prog-card">
            <div className="prog-top"><div><span className="prog-big">{info?.done ?? 0}<i>/{info?.total ?? 7}일</i></span><span className="prog-cap">이번 주 인증 현황</span></div><span className={`chip chip-${tone}`}>{status}</span></div>
            <div className="bar" style={{ marginTop: 14 }}><div className="bar-fill" style={{ width: `${pct}%` }} /></div>
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
  const navigate = useNavigate();
  const { groupId } = useActiveGroup();
  const tid = Number(new URLSearchParams(window.location.search).get('tid')) || null;
  const { data: task } = useTask(groupId, tid);
  const certify = useCertifyTask(groupId ?? 0);
  const deleteTask = useDeleteTask(groupId ?? 0);
  const [sheet, setSheet] = useState(false);
  const [memo, setMemo] = useState('');
  const [photo, setPhoto] = useState<string | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [delOpen, setDelOpen] = useState(false);

  const addPhoto = async () => {
    const [file] = await pickImage();
    if (file) setPhoto(URL.createObjectURL(file));
  };
  const submit = async () => {
    if (!groupId || !tid) return;
    // photoUrl 은 업로드 API 연동 시 실제 URL 로 교체 (현재는 미리보기까지)
    try { await certify.mutateAsync({ taskId: tid, body: { memo: memo.trim() || null } }); setSheet(false); setPhoto(null); navigate('/group/tasks'); }
    catch { /* noop */ }
  };
  const doDelete = async () => {
    if (!groupId || !tid) return;
    try { await deleteTask.mutateAsync(tid); navigate('/group/tasks'); } catch { /* noop */ }
  };

  return (
    <>
      <DoranTaskDetail task={task} onCertify={() => setSheet(true)} onMore={() => setMenuOpen(true)} />
      <BottomSheet open={sheet} onClose={() => setSheet(false)} title="오늘 숙제 인증"
        footer={<button className="btn-primary press" onClick={submit} disabled={certify.isPending}>{certify.isPending ? '인증 중…' : '인증 완료하기'}</button>}>
        <div className="cert-target"><div className="task-ico" style={{ width: 40, height: 40 }}><Icon name={task ? taskIcon(task) : 'check'} size={19} sw={1.9} color="#1F4D3A" /></div><div><div className="ct-name">{task?.title ?? '숙제'}</div><div className="ct-sub">오늘 인증</div></div></div>
        <div className="afield">
          <span className="afield-label">인증 사진</span>
          {photo ? (
            <div className="upload-box press" onClick={addPhoto} style={{ backgroundImage: `url(${photo})`, backgroundSize: 'cover', backgroundPosition: 'center', minHeight: 160, border: 'none' }} />
          ) : (
            <div className="upload-box press" onClick={addPhoto}>
              <div className="upload-ic"><Icon name="camera" size={26} sw={1.8} color="#7FA585" /></div>
              <span className="upload-title">인증 사진을 올려주세요</span>
              <span className="upload-sub">사진을 올리면 가족 소식에 공유돼요</span>
            </div>
          )}
        </div>
        <div className="afield"><span className="afield-label">한마디 (선택)</span><div className="afield-box"><input className="afield-val" value={memo} onChange={e => setMemo(e.target.value)} placeholder="오늘 컨디션은 어땠나요?" style={{ flex: 1 }} /></div></div>
        <div className="cert-share"><Icon name="cheer" size={17} sw={1.9} color="#C7841A" /><span>인증하면 가족에게 알림이 가고 응원을 받을 수 있어요</span></div>
        {certify.error && <p style={{ color: '#C25C40', fontSize: 13, fontWeight: 600 }}>{(certify.error as Error).message}</p>}
      </BottomSheet>

      {/* 더보기 메뉴 */}
      <BottomSheet open={menuOpen} onClose={() => setMenuOpen(false)} title="숙제 관리">
        <button className="mm-opt press danger" style={{ width: '100%' }} onClick={() => { setMenuOpen(false); setDelOpen(true); }}>
          <Icon name="trash" size={18} sw={1.9} color="#C25C40" />숙제 삭제하기
        </button>
      </BottomSheet>

      {delOpen && (
        <div className="dialog-layer open">
          <div className="dialog-scrim" onClick={() => setDelOpen(false)} />
          <div className="dialog">
            <div className="dialog-ic"><Icon name="trash" size={26} sw={1.9} color="#C25C40" /></div>
            <h4 className="dialog-title">숙제를 삭제할까요?</h4>
            <p className="dialog-desc">«{task?.title ?? '숙제'}» 숙제와 인증 기록이 삭제돼요.<br />이 작업은 되돌릴 수 없어요.</p>
            <div className="dialog-actions">
              <button className="dlg-btn press" onClick={() => setDelOpen(false)}>취소</button>
              <button className="dlg-btn danger press" onClick={doDelete} disabled={deleteTask.isPending}>{deleteTask.isPending ? '삭제 중…' : '삭제'}</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

/* ── 숙제 만들기 폼 ─────────────────────────── */
export function DoranNewTask() {
  const navigate = useNavigate();
  const { groupId } = useActiveGroup();
  const { data: groupMembers } = useMembers(groupId);
  const create = useCreateTask(groupId ?? 0);
  const cats: { ic: IconName; label: string }[] = [
    { ic: 'pill', label: '복약' }, { ic: 'steps', label: '운동' }, { ic: 'heart', label: '건강기록' },
    { ic: 'sun', label: '생활습관' }, { ic: 'diary', label: '기타' },
  ];
  const [title, setTitle] = useState('');
  const [cat, setCat] = useState('복약');
  const [goal, setGoal] = useState(7);
  const [memberIds, setMemberIds] = useState<number[]>([]);
  const toggle = (id: number) => setMemberIds(p => p.includes(id) ? p.filter(x => x !== id) : [...p, id]);

  const submit = async () => {
    if (!groupId || !title.trim()) return;
    try {
      await create.mutateAsync({ title: title.trim(), category: cat, goal, assigneeIds: memberIds });
      navigate('/group/tasks');
    } catch { /* noop */ }
  };

  return (
    <div className="screen">
      <div className="scroll" style={{ paddingBottom: 0 }}>
        <NavHeader title="건강 숙제 만들기" />
        <div className="block afields" style={{ paddingTop: 8 }}>
          <div className="afield"><span className="afield-label">숙제 이름</span><div className="afield-box focus"><Icon name="diary" size={19} sw={1.9} color="#1F4D3A" /><input className="afield-val" value={title} onChange={e => setTitle(e.target.value)} placeholder="예: 감기약 복용하기" style={{ flex: 1 }} /></div></div>
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
            {(groupMembers ?? []).map(m => (
              <button key={m.userId} className={`chip-opt press ${memberIds.includes(m.userId) ? 'on' : ''}`} onClick={() => toggle(m.userId)}>
                <PAvatar name={m.name} size={22} />{m.name}
              </button>
            ))}
          </div>
        </div>
        <div className="block" style={{ paddingTop: 12 }}>
          <span className="afield-label" style={{ display: 'block', paddingLeft: 2, marginBottom: 10 }}>주간 목표 횟수</span>
          <div className="chip-select">
            {[3, 5, 7].map(n => (
              <button key={n} className={`chip-opt press ${goal === n ? 'on' : ''}`} onClick={() => setGoal(n)}>주 {n}회</button>
            ))}
          </div>
        </div>
        {create.error && <div className="block"><p style={{ color: '#C25C40', fontSize: 13, fontWeight: 600 }}>{(create.error as Error).message}</p></div>}
        <div style={{ height: 20 }} />
      </div>
      <div className="auth-foot"><button className={`btn-primary press ${create.isPending || !title.trim() ? 'disabled' : ''}`} onClick={submit} disabled={create.isPending}>{create.isPending ? '등록 중…' : '숙제 등록하기'}</button></div>
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
