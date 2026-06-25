// news.tsx — 소식 탭: 피드, 소식 상세·댓글, 응원/작성 시트, 대화방 목록·채팅, 빈 화면
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Icon, type IconName } from '../lib/Icon';
import { PAvatar, NavHeader, BottomNav, BottomSheet } from '../lib/shared';

const NEWS_TONE: Record<string, { bg: string; ic: IconName; c: string }> = {
  steps: { bg: '#DDEBDD', ic: 'steps', c: '#1F4D3A' },
  check: { bg: '#DDEBDD', ic: 'check', c: '#1F4D3A' },
  calendar: { bg: '#EEF4ED', ic: 'calendar', c: '#1F4D3A' },
  gift: { bg: '#FBE3DB', ic: 'gift', c: '#C25C40' },
  cheer: { bg: '#FCF1DD', ic: 'cheer', c: '#C7841A' },
  heart: { bg: '#FBE3DB', ic: 'heart', c: '#C25C40' },
  trophy: { bg: '#FCF1DD', ic: 'trophy', c: '#C7841A' },
};

interface NewsCardData {
  who: string; type: string; msg: string; time: string; cheer?: number; comments?: number; liked?: boolean; photo?: boolean;
}
function NewsCard({ who, type, msg, time, cheer, comments, liked, photo, onClick }: NewsCardData & { onClick?: () => void }) {
  const t = NEWS_TONE[type] || NEWS_TONE.check;
  return (
    <div className="act-card press" onClick={onClick}>
      <div className="act-top">
        <PAvatar name={who} size={42} />
        <div className="act-head">
          <p className="act-msg" dangerouslySetInnerHTML={{ __html: msg }} />
          <span className="act-time">{time}</span>
        </div>
        <div className="act-badge" style={{ background: t.bg }}><Icon name={t.ic} size={18} sw={1.95} color={t.c} /></div>
      </div>
      {photo && <div className="act-photo"><Icon name="image" size={30} sw={1.6} color="#C9B79E" /></div>}
      {cheer !== undefined && (
        <div className="act-react">
          <button className={`react-btn press ${liked ? 'on' : ''}`}><Icon name="cheer" size={16} sw={2} color={liked ? '#E07A5F' : '#9A958A'} />응원 {cheer}</button>
          <button className="react-btn press"><Icon name="chat" size={16} sw={2} color="#9A958A" />댓글 {comments || 0}</button>
        </div>
      )}
    </div>
  );
}

/* ── 소식 피드 (+ 작성 시트) ────────────────── */
export function NewsFeed() {
  const navigate = useNavigate();
  const [write, setWrite] = useState(false);
  const today: NewsCardData[] = [
    { who: '아빠', type: 'steps', msg: '<b>아빠</b>가 오늘 걷기 목표 8,000보를 달성했어요', time: '방금 전', cheer: 12, comments: 3, liked: true },
    { who: '엄마', type: 'check', msg: '<b>엄마</b>가 «감기약 복용» 숙제를 인증했어요', time: '32분 전', cheer: 5, comments: 1, photo: true },
    { who: '큰딸', type: 'cheer', msg: '<b>큰딸</b>이 아빠에게 응원을 보냈어요', time: '1시간 전', cheer: 2, comments: 0 },
  ];
  const yest: NewsCardData[] = [
    { who: '엄마', type: 'gift', msg: '<b>엄마</b>의 위시리스트에 «무릎 보호대»가 추가됐어요', time: '어제 · 오후 8:12', cheer: 3, comments: 2 },
    { who: '할머니', type: 'trophy', msg: '<b>할머니</b>가 «아침 스트레칭» 7일 연속 달성을 기록했어요', time: '어제 · 오전 7:40', cheer: 9, comments: 4 },
  ];
  return (
    <div className="screen">
      <div className="scroll">
        <div className="hdr" style={{ paddingBottom: 8 }}>
          <div><h1 className="hdr-title">소식</h1><p className="hdr-sub">우리 가족의 오늘을 모았어요</p></div>
          <div className="hdr-icons">
            <button className="ic-btn press" onClick={() => setWrite(true)}><Icon name="edit" size={20} sw={1.9} color="#3A463C" /></button>
            <button className="ic-btn press" onClick={() => navigate('/news/chats')}><Icon name="chat" size={21} sw={1.9} color="#3A463C" /></button>
          </div>
        </div>
        <div className="block">
          <div className="noti-label">오늘</div>
          <div className="stack">{today.map((a, i) => <NewsCard key={i} {...a} onClick={() => navigate('/news/detail')} />)}</div>
        </div>
        <div className="block">
          <div className="noti-label">어제</div>
          <div className="stack">{yest.map((a, i) => <NewsCard key={i} {...a} onClick={() => navigate('/news/detail')} />)}</div>
        </div>
        <div style={{ height: 18 }} />
      </div>
      <BottomNav active="소식" />

      <BottomSheet open={write} onClose={() => setWrite(false)} title="소식 남기기"
        footer={<button className="btn-primary press" onClick={() => setWrite(false)}>가족에게 공유하기</button>}>
        <div className="write-head"><PAvatar name="나" size={38} /><div><div className="wh-name">김도란</div><div className="wh-to"><Icon name="family" size={13} sw={2} color="#6D6A61" />우리집 전체에게</div></div></div>
        <div className="afield-box" style={{ height: 'auto', minHeight: 110, alignItems: 'flex-start', paddingTop: 15 }}><span className="afield-val" style={{ color: '#A8A296' }}>가족과 나누고 싶은 소식을 적어보세요</span></div>
        <div className="write-photos">
          <button className="photo-add press"><Icon name="camera" size={22} sw={1.8} color="#7FA585" /><span>사진</span></button>
          <div className="photo-thumb"><Icon name="image" size={24} sw={1.6} color="#C9B79E" /><button className="photo-x"><Icon name="close" size={12} sw={2.6} color="#fff" /></button></div>
        </div>
        <div className="write-opts">
          <button className="wopt press"><Icon name="calendar" size={18} sw={1.9} color="#1F4D3A" />일정 공유</button>
          <button className="wopt press"><Icon name="check" size={18} sw={1.9} color="#1F4D3A" />숙제 인증</button>
        </div>
      </BottomSheet>
    </div>
  );
}

/* ── 소식 상세 · 댓글 (+ 응원 시트) ──────────── */
export function NewsDetail() {
  const [cheer, setCheer] = useState(false);
  const comments = [
    { who: '엄마', text: '우리 아들 최고! 오늘도 수고했어요', time: '20분 전' },
    { who: '큰딸', text: '아빠 대단해요. 저도 같이 걸을래요', time: '12분 전' },
    { who: '할머니', text: '건강이 최고지~', time: '5분 전' },
  ];
  const reacts: { ic: IconName; label: string; c: string; bg: string }[] = [
    { ic: 'cheer', label: '응원해요', c: '#E07A5F', bg: '#FBE3DB' },
    { ic: 'heart', label: '사랑해요', c: '#C25C40', bg: '#FBE3DB' },
    { ic: 'trophy', label: '대단해요', c: '#C7841A', bg: '#FCF1DD' },
    { ic: 'flame', label: '화이팅', c: '#C7841A', bg: '#FCF1DD' },
    { ic: 'check', label: '최고예요', c: '#2F6B45', bg: '#DDEBDD' },
    { ic: 'leaf', label: '건강하세요', c: '#2F6B45', bg: '#DDEBDD' },
  ];
  return (
    <div className="screen">
      <div className="scroll" style={{ paddingBottom: 0 }}>
        <NavHeader title="소식" trailing={<button className="icon-action press"><Icon name="dots" size={20} color="#3A463C" /></button>} />
        <div className="block" style={{ paddingTop: 6 }}>
          <div className="act-card" style={{ boxShadow: 'none' }}>
            <div className="act-top">
              <PAvatar name="아빠" size={44} />
              <div className="act-head">
                <p className="act-msg"><b>아빠</b>가 오늘 걷기 목표 8,000보를 달성했어요</p>
                <span className="act-time">오늘 · 오후 2:14</span>
              </div>
              <div className="act-badge" style={{ background: '#DDEBDD' }}><Icon name="steps" size={18} sw={1.95} color="#1F4D3A" /></div>
            </div>
            <div className="detail-metric">
              <div className="dm-num">8,240<i>보</i></div>
              <div className="dm-bar"><div className="bar"><div className="bar-fill" style={{ width: '100%' }} /></div><span className="dm-cap">목표 8,000보 · 103% 달성</span></div>
            </div>
          </div>
        </div>
        <div className="block" style={{ paddingTop: 4 }}>
          <div className="cheer-summary">
            <div className="cheer-avs">{['엄마', '큰딸', '할머니'].map((m, i) => <div key={m} style={{ marginLeft: i ? -8 : 0, zIndex: 3 - i }}><PAvatar name={m} size={26} ring ringColor="#FFF8EF" /></div>)}</div>
            <span className="cheer-text"><b>엄마</b> 외 11명이 응원했어요</span>
          </div>
        </div>
        <div className="block" style={{ paddingTop: 8 }}>
          <span className="memo-label">댓글 {comments.length}</span>
          <div className="comment-list">
            {comments.map((c, i) => (
              <div key={i} className="comment">
                <PAvatar name={c.who} size={34} />
                <div className="comment-body">
                  <div className="comment-bubble"><span className="comment-who">{c.who}</span>{c.text}</div>
                  <div className="comment-meta"><span>{c.time}</span><button className="press">답글</button><button className="press">응원</button></div>
                </div>
              </div>
            ))}
          </div>
        </div>
        <div style={{ height: 16 }} />
      </div>
      <div className="comment-input">
        <button className="ci-cheer press" onClick={() => setCheer(true)}><Icon name="cheer" size={20} sw={2} color="#E07A5F" /></button>
        <div className="ci-field">따뜻한 댓글을 남겨보세요</div>
        <button className="ci-send press"><Icon name="send" size={19} sw={1.9} color="#fff" /></button>
      </div>

      <BottomSheet open={cheer} onClose={() => setCheer(false)} title="응원 보내기"
        footer={<button className="btn-primary terra press" onClick={() => setCheer(false)}>응원 보내기</button>}>
        <div className="cheer-target"><PAvatar name="아빠" size={40} /><div><div className="ct-name">아빠에게</div><div className="ct-sub">걷기 목표 달성을 응원해요</div></div></div>
        <div className="react-grid">
          {reacts.map((r, i) => (
            <button key={r.label} className={`react-tile press ${i === 0 ? 'on' : ''}`}>
              <span className="rt-ic" style={{ background: r.bg }}><Icon name={r.ic} size={24} sw={1.9} color={r.c} /></span>
              <span className="rt-label">{r.label}</span>
            </button>
          ))}
        </div>
        <div className="afield"><span className="afield-label">메시지 (선택)</span><div className="afield-box"><span className="afield-val" style={{ color: '#A8A296' }}>한마디 응원을 적어보세요</span></div></div>
      </BottomSheet>
    </div>
  );
}

/* ── 대화방 목록 ────────────────────────────── */
export function NewsChatList() {
  const navigate = useNavigate();
  const rooms = [
    { name: '우리집', members: ['엄마', '아빠', '나'], last: '아빠: 오 좋다. 걷기 끝나고 갈게', time: '오후 2:40', unread: 2, group: true },
    { name: '엄마', members: ['엄마'], last: '약은 꼭 챙겨 드세요!', time: '오후 1:10', unread: 0 },
    { name: '큰딸', members: ['큰딸'], last: '언니 주말에 같이 산책 가요', time: '어제', unread: 1 },
    { name: '할머니', members: ['할머니'], last: '사진 잘 받았다 고맙구나', time: '어제', unread: 0 },
  ];
  return (
    <div className="screen">
      <div className="scroll">
        <div className="hdr" style={{ paddingBottom: 8 }}>
          <div><h1 className="hdr-title">대화</h1><p className="hdr-sub">가족과 마음을 나눠요</p></div>
          <div className="hdr-icons"><button className="ic-btn press"><Icon name="search" size={21} sw={1.9} color="#3A463C" /></button><button className="ic-btn press"><Icon name="edit" size={20} sw={1.9} color="#3A463C" /></button></div>
        </div>
        <div className="block" style={{ paddingTop: 8 }}>
          <div className="set-card">
            {rooms.map((r, i) => (
              <button key={r.name} className={`chat-row ${i === rooms.length - 1 ? 'last' : ''} press`} onClick={() => navigate('/news/chat')}>
                {r.group
                  ? <div className="chat-grp-av">{r.members.slice(0, 3).map((m, j) => <div key={m} className={`cga cga-${j}`}><PAvatar name={m} size={22} /></div>)}</div>
                  : <PAvatar name={r.name} size={48} />}
                <div className="chat-row-body">
                  <div className="chat-row-top"><span className="chat-row-name">{r.name}{r.group && <span className="chat-grp-count">6</span>}</span><span className="chat-row-time">{r.time}</span></div>
                  <div className="chat-row-bottom"><span className="chat-row-last">{r.last}</span>{r.unread > 0 && <span className="chat-unread">{r.unread}</span>}</div>
                </div>
              </button>
            ))}
          </div>
        </div>
        <div style={{ height: 18 }} />
      </div>
      <BottomNav active="소식" />
    </div>
  );
}

/* ── 대화방 · 채팅 ──────────────────────────── */
export function NewsChat() {
  const navigate = useNavigate();
  const msgs: { in?: boolean; out?: boolean; who?: string; text: string }[] = [
    { in: true, who: '엄마', text: '오늘 검진 결과 잘 나왔어요. 다들 걱정 말아요' },
    { in: true, who: '엄마', text: '큰딸 응원 고마워~' },
    { out: true, text: '엄마 다행이에요! 약은 꼭 챙겨 드세요' },
    { out: true, text: '오늘 저녁은 제가 준비할게요' },
    { in: true, who: '아빠', text: '오 좋다. 나도 걷기 끝나고 바로 갈게' },
  ];
  return (
    <div className="screen">
      <div className="chat-hdr">
        <button className="nav-back press" onClick={() => navigate(-1)}><Icon name="chevron" size={22} sw={2.3} color="#20231F" style={{ transform: 'rotate(180deg)' }} /></button>
        <div className="chat-hdr-mid">
          <div className="ava-stack">{['엄마', '아빠', '나'].map((m, i) => <div key={m} style={{ marginLeft: i ? -9 : 0, zIndex: 5 - i }}><PAvatar name={m} size={26} ring ringColor="#FFF8EF" /></div>)}</div>
          <div><div className="chat-title">우리집</div><div className="chat-sub">6명</div></div>
        </div>
        <button className="icon-action press"><Icon name="dots" size={20} color="#3A463C" /></button>
      </div>
      <div className="chat-scroll">
        <div className="chat-date"><span>2025년 6월 12일</span></div>
        <div className="chat-sys"><Icon name="calendar" size={14} sw={2} color="#7FA585" />엄마 정기 검진 일정이 등록됐어요</div>
        {msgs.map((m, i) => {
          const prev = msgs[i - 1];
          const sameWho = m.in && prev && prev.in && prev.who === m.who;
          if (m.in) return (
            <div className="msg in" key={i}>
              <div className="msg-av">{!sameWho ? <PAvatar name={m.who!} size={32} /> : <span style={{ width: 32, display: 'inline-block' }} />}</div>
              <div className="msg-col">{!sameWho && <span className="msg-name">{m.who}</span>}<div className="bubble in">{m.text}</div></div>
            </div>
          );
          return <div className="msg out" key={i}><div className="bubble out">{m.text}</div></div>;
        })}
        <div className="chat-sys" style={{ background: '#FBE3DB', borderColor: '#F2D6CB', color: '#C25C40' }}><Icon name="gift" size={14} sw={2} color="#C25C40" />큰딸이 엄마에게 선물을 보냈어요</div>
      </div>
      <div className="chat-input">
        <button className="ci-plus press"><Icon name="plus" size={22} sw={2.2} color="#6D6A61" /></button>
        <div className="ci-field2">메시지 보내기</div>
        <button className="ci-send press"><Icon name="send" size={20} sw={1.9} color="#fff" /></button>
      </div>
    </div>
  );
}

/* ── 소식 없음 · 빈 화면 ────────────────────── */
export function NewsEmpty() {
  return (
    <div className="screen">
      <div className="scroll" style={{ display: 'flex', flexDirection: 'column' }}>
        <div className="hdr" style={{ paddingBottom: 8 }}>
          <div><h1 className="hdr-title">소식</h1><p className="hdr-sub">우리 가족의 오늘을 모았어요</p></div>
          <div className="hdr-icons"><button className="ic-btn press"><Icon name="chat" size={21} sw={1.9} color="#3A463C" /></button></div>
        </div>
        <div className="empty">
          <div className="empty-ic"><Icon name="cheer" size={38} sw={1.7} color="#9BB89F" /></div>
          <h4 className="empty-title">아직 소식이 없어요</h4>
          <p className="empty-desc">가족이 숙제를 인증하거나 목표를 달성하면 이곳에 소식이 쌓여요.</p>
          <button className="empty-cta press"><Icon name="plus" size={18} sw={2.3} color="#fff" />첫 소식 남기기</button>
        </div>
      </div>
      <BottomNav active="소식" />
    </div>
  );
}
