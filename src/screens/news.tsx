// news.tsx — 소식 탭: 피드, 소식 상세·댓글, 응원/작성 시트, 대화방 목록·채팅, 빈 화면
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Icon, type IconName } from '../lib/Icon';
import { PAvatar, NavHeader, BottomNav, BottomSheet } from '../lib/shared';
import { useActiveGroup } from '../api/ActiveGroup';
import {
  useNewsFeed, usePost, useCreatePost, useDeletePost, useAddComment, useSendCheer,
  useRooms, useMessages, useSendMessage, useMe,
} from '../api/hooks';
import type { PostResponse, Reaction } from '../api/types';
import { pickImage } from '../lib/share';

const POST_TONE: Record<string, { bg: string; ic: IconName; c: string }> = {
  STEPS: { bg: '#DDEBDD', ic: 'steps', c: '#1F4D3A' },
  TASK_CERT: { bg: '#DDEBDD', ic: 'check', c: '#1F4D3A' },
  SCHEDULE: { bg: '#EEF4ED', ic: 'calendar', c: '#1F4D3A' },
  GIFT: { bg: '#FBE3DB', ic: 'gift', c: '#C25C40' },
  CHEER: { bg: '#FCF1DD', ic: 'cheer', c: '#C7841A' },
  MILESTONE: { bg: '#FCF1DD', ic: 'trophy', c: '#C7841A' },
  FREE: { bg: '#EEF4ED', ic: 'chat', c: '#1F4D3A' },
};
const REACTIONS: { key: Reaction; ic: IconName; label: string; c: string; bg: string }[] = [
  { key: 'CHEER', ic: 'cheer', label: '응원해요', c: '#E07A5F', bg: '#FBE3DB' },
  { key: 'LOVE', ic: 'heart', label: '사랑해요', c: '#C25C40', bg: '#FBE3DB' },
  { key: 'AMAZING', ic: 'trophy', label: '대단해요', c: '#C7841A', bg: '#FCF1DD' },
  { key: 'FIGHTING', ic: 'flame', label: '화이팅', c: '#C7841A', bg: '#FCF1DD' },
  { key: 'BEST', ic: 'check', label: '최고예요', c: '#2F6B45', bg: '#DDEBDD' },
  { key: 'HEALTHY', ic: 'leaf', label: '건강하세요', c: '#2F6B45', bg: '#DDEBDD' },
];

/* 상대 시각 표기 */
function fromNow(iso?: string) {
  if (!iso) return '';
  const d = new Date(iso); const diff = (Date.now() - d.getTime()) / 1000;
  if (diff < 60) return '방금 전';
  if (diff < 3600) return `${Math.floor(diff / 60)}분 전`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}시간 전`;
  return d.toLocaleDateString('ko-KR', { month: 'long', day: 'numeric' });
}

function NewsCard({ post, onClick, onCheer }: { post: PostResponse; onClick?: () => void; onCheer?: () => void }) {
  const t = POST_TONE[post.type] || POST_TONE.FREE;
  const who = post.author?.name ?? '가족';
  return (
    <div className="act-card press" onClick={onClick}>
      <div className="act-top">
        <PAvatar name={who} size={42} />
        <div className="act-head">
          <p className="act-msg"><b>{who}</b> {post.content}</p>
          <span className="act-time">{fromNow(post.createdAt)}</span>
        </div>
        <div className="act-badge" style={{ background: t.bg }}><Icon name={t.ic} size={18} sw={1.95} color={t.c} /></div>
      </div>
      {(post.photoUrls?.length ?? 0) > 0 && <div className="act-photo"><Icon name="image" size={30} sw={1.6} color="#C9B79E" /></div>}
      <div className="act-react">
        <button className={`react-btn press ${post.myReaction ? 'on' : ''}`} onClick={(e) => { e.stopPropagation(); onCheer?.(); }}><Icon name="cheer" size={16} sw={2} color={post.myReaction ? '#E07A5F' : '#9A958A'} />응원 {post.cheerCount ?? 0}</button>
        <button className="react-btn press"><Icon name="chat" size={16} sw={2} color="#9A958A" />댓글 {post.commentCount ?? 0}</button>
      </div>
    </div>
  );
}

/* ── 소식 피드 (+ 작성 시트) ────────────────── */
export function NewsFeed() {
  const navigate = useNavigate();
  const { groupId } = useActiveGroup();
  const { data: me } = useMe();
  const { data: posts, isLoading } = useNewsFeed(groupId);
  const createPost = useCreatePost(groupId ?? 0);
  const cheer = useSendCheer(groupId ?? 0);
  const [write, setWrite] = useState(false);
  const [text, setText] = useState('');

  const submit = async () => {
    if (!groupId || !text.trim()) return;
    try { await createPost.mutateAsync({ type: 'FREE', content: text.trim() }); setText(''); setWrite(false); }
    catch { /* noop */ }
  };

  const list = posts ?? [];
  if (!isLoading && list.length === 0) return <NewsEmpty onWrite={() => setWrite(true)} sheet={write} onClose={() => setWrite(false)} text={text} setText={setText} onSubmit={submit} me={me?.name} busy={createPost.isPending} />;

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
          {isLoading && <div className="info-banner">소식을 불러오는 중…</div>}
          <div className="stack">
            {list.map(p => (
              <NewsCard key={p.id} post={p}
                onClick={() => navigate(`/news/detail?pid=${p.id}`)}
                onCheer={() => groupId && cheer.mutate({ postId: p.id, body: { reaction: 'CHEER' } })} />
            ))}
          </div>
        </div>
        <div style={{ height: 18 }} />
      </div>
      <BottomNav active="소식" />

      <WriteSheet open={write} onClose={() => setWrite(false)} text={text} setText={setText} onSubmit={submit} me={me?.name} busy={createPost.isPending} />
    </div>
  );
}

/* 소식 작성 시트 (공통) */
function WriteSheet({ open, onClose, text, setText, onSubmit, me, busy }: {
  open: boolean; onClose: () => void; text: string; setText: (v: string) => void; onSubmit: () => void; me?: string; busy?: boolean;
}) {
  const [photos, setPhotos] = useState<{ url: string }[]>([]);
  const addPhotos = async () => {
    const files = await pickImage({ multiple: true });
    // 미리보기용 objectURL 생성 (실제 업로드는 업로드 API 연동 시 처리)
    setPhotos(p => [...p, ...files.map(f => ({ url: URL.createObjectURL(f) }))]);
  };
  const removePhoto = (i: number) => setPhotos(p => { URL.revokeObjectURL(p[i].url); return p.filter((_, j) => j !== i); });
  return (
    <BottomSheet open={open} onClose={onClose} title="소식 남기기"
      footer={<button className={`btn-primary press ${busy || !text.trim() ? 'disabled' : ''}`} onClick={onSubmit} disabled={busy}>{busy ? '공유 중…' : '가족에게 공유하기'}</button>}>
      <div className="write-head"><PAvatar name={me || '나'} size={38} /><div><div className="wh-name">{me || '나'}</div><div className="wh-to"><Icon name="family" size={13} sw={2} color="#6D6A61" />우리집 전체에게</div></div></div>
      <textarea className="afield-box" value={text} onChange={e => setText(e.target.value)} placeholder="가족과 나누고 싶은 소식을 적어보세요" style={{ height: 'auto', minHeight: 110, alignItems: 'flex-start', paddingTop: 15, width: '100%', resize: 'none' }} />
      <div className="write-photos">
        <button className="photo-add press" onClick={addPhotos}><Icon name="camera" size={22} sw={1.8} color="#7FA585" /><span>사진</span></button>
        {photos.map((p, i) => (
          <div key={i} className="photo-thumb" style={{ backgroundImage: `url(${p.url})`, backgroundSize: 'cover', backgroundPosition: 'center' }}>
            <button className="photo-x" onClick={() => removePhoto(i)}><Icon name="close" size={12} sw={2.6} color="#fff" /></button>
          </div>
        ))}
      </div>
    </BottomSheet>
  );
}

/* ── 소식 상세 · 댓글 (+ 응원 시트) ──────────── */
export function NewsDetail() {
  const navigate = useNavigate();
  const { groupId } = useActiveGroup();
  const pid = Number(new URLSearchParams(window.location.search).get('pid')) || null;
  const { data: post } = usePost(groupId, pid);
  const addComment = useAddComment(groupId ?? 0);
  const sendCheer = useSendCheer(groupId ?? 0);
  const deletePost = useDeletePost(groupId ?? 0);
  const { data: me } = useMe();

  const [cheerOpen, setCheerOpen] = useState(false);
  const [reaction, setReaction] = useState<Reaction>('CHEER');
  const [cheerMsg, setCheerMsg] = useState('');
  const [comment, setComment] = useState('');
  const [menuOpen, setMenuOpen] = useState(false);
  const [delOpen, setDelOpen] = useState(false);

  const comments = post?.comments ?? [];
  const cheerers = post?.cheerers ?? [];
  const who = post?.author?.name ?? '가족';
  const t = post ? (POST_TONE[post.type] || POST_TONE.FREE) : POST_TONE.FREE;
  const mine = !!post && me?.id === post.author?.userId;

  const doDelete = async () => {
    if (!groupId || !pid) return;
    try { await deletePost.mutateAsync(pid); navigate('/news'); } catch { /* noop */ }
  };

  const submitComment = async () => {
    if (!groupId || !pid || !comment.trim()) return;
    try { await addComment.mutateAsync({ postId: pid, body: { content: comment.trim() } }); setComment(''); }
    catch { /* noop */ }
  };
  const submitCheer = async () => {
    if (!groupId || !pid) return;
    try { await sendCheer.mutateAsync({ postId: pid, body: { reaction, message: cheerMsg.trim() || null } }); setCheerOpen(false); setCheerMsg(''); }
    catch { /* noop */ }
  };

  return (
    <div className="screen">
      <div className="scroll" style={{ paddingBottom: 0 }}>
        <NavHeader title="소식" trailing={mine ? <button className="icon-action press" onClick={() => setMenuOpen(true)}><Icon name="dots" size={20} color="#3A463C" /></button> : undefined} />
        <div className="block" style={{ paddingTop: 6 }}>
          <div className="act-card" style={{ boxShadow: 'none' }}>
            <div className="act-top">
              <PAvatar name={who} size={44} />
              <div className="act-head">
                <p className="act-msg"><b>{who}</b> {post?.content ?? ''}</p>
                <span className="act-time">{fromNow(post?.createdAt)}</span>
              </div>
              <div className="act-badge" style={{ background: t.bg }}><Icon name={t.ic} size={18} sw={1.95} color={t.c} /></div>
            </div>
            {post?.metricValue != null && (
              <div className="detail-metric">
                <div className="dm-num">{post.metricValue.toLocaleString()}<i>{post.metricUnit}</i></div>
                <div className="dm-bar"><div className="bar"><div className="bar-fill" style={{ width: `${post.metricGoal ? Math.min(100, Math.round((post.metricValue / post.metricGoal) * 100)) : 100}%` }} /></div>{post.metricGoal != null && <span className="dm-cap">목표 {post.metricGoal.toLocaleString()}{post.metricUnit}</span>}</div>
              </div>
            )}
          </div>
        </div>
        {cheerers.length > 0 && (
          <div className="block" style={{ paddingTop: 4 }}>
            <div className="cheer-summary">
              <div className="cheer-avs">{cheerers.slice(0, 3).map((m, i) => <div key={m.userId} style={{ marginLeft: i ? -8 : 0, zIndex: 3 - i }}><PAvatar name={m.name} size={26} ring ringColor="#FFF8EF" /></div>)}</div>
              <span className="cheer-text"><b>{cheerers[0].name}</b>{cheerers.length > 1 ? ` 외 ${cheerers.length - 1}명이` : '님이'} 응원했어요</span>
            </div>
          </div>
        )}
        <div className="block" style={{ paddingTop: 8 }}>
          <span className="memo-label">댓글 {comments.length}</span>
          <div className="comment-list">
            {comments.map(c => (
              <div key={c.id} className="comment">
                <PAvatar name={c.author?.name ?? '가족'} size={34} />
                <div className="comment-body">
                  <div className="comment-bubble"><span className="comment-who">{c.author?.name}</span>{c.content}</div>
                  <div className="comment-meta"><span>{fromNow(c.createdAt)}</span></div>
                </div>
              </div>
            ))}
            {comments.length === 0 && <p style={{ color: '#A8A296', fontSize: 14, padding: '6px 2px' }}>첫 댓글을 남겨보세요.</p>}
          </div>
        </div>
        <div style={{ height: 16 }} />
      </div>
      <div className="comment-input">
        <button className="ci-cheer press" onClick={() => setCheerOpen(true)}><Icon name="cheer" size={20} sw={2} color="#E07A5F" /></button>
        <input className="ci-field" value={comment} onChange={e => setComment(e.target.value)} placeholder="따뜻한 댓글을 남겨보세요" onKeyDown={e => { if (e.key === 'Enter') submitComment(); }} style={{ border: 'none', background: '#fff' }} />
        <button className="ci-send press" onClick={submitComment} disabled={addComment.isPending}><Icon name="send" size={19} sw={1.9} color="#fff" /></button>
      </div>

      <BottomSheet open={cheerOpen} onClose={() => setCheerOpen(false)} title="응원 보내기"
        footer={<button className="btn-primary terra press" onClick={submitCheer} disabled={sendCheer.isPending}>{sendCheer.isPending ? '보내는 중…' : '응원 보내기'}</button>}>
        <div className="cheer-target"><PAvatar name={who} size={40} /><div><div className="ct-name">{who}에게</div><div className="ct-sub">마음을 담아 응원해요</div></div></div>
        <div className="react-grid">
          {REACTIONS.map(r => (
            <button key={r.key} className={`react-tile press ${reaction === r.key ? 'on' : ''}`} onClick={() => setReaction(r.key)}>
              <span className="rt-ic" style={{ background: r.bg }}><Icon name={r.ic} size={24} sw={1.9} color={r.c} /></span>
              <span className="rt-label">{r.label}</span>
            </button>
          ))}
        </div>
        <div className="afield"><span className="afield-label">메시지 (선택)</span><div className="afield-box"><input className="afield-val" value={cheerMsg} onChange={e => setCheerMsg(e.target.value)} placeholder="한마디 응원을 적어보세요" style={{ flex: 1 }} /></div></div>
      </BottomSheet>

      {/* 더보기 메뉴 (본인 글) */}
      <BottomSheet open={menuOpen} onClose={() => setMenuOpen(false)} title="소식 관리">
        <button className="mm-opt press danger" style={{ width: '100%' }} onClick={() => { setMenuOpen(false); setDelOpen(true); }}>
          <Icon name="trash" size={18} sw={1.9} color="#C25C40" />소식 삭제하기
        </button>
      </BottomSheet>

      {delOpen && (
        <div className="dialog-layer open">
          <div className="dialog-scrim" onClick={() => setDelOpen(false)} />
          <div className="dialog">
            <div className="dialog-ic"><Icon name="trash" size={26} sw={1.9} color="#C25C40" /></div>
            <h4 className="dialog-title">소식을 삭제할까요?</h4>
            <p className="dialog-desc">이 소식과 댓글·응원이 모두 삭제돼요.<br />이 작업은 되돌릴 수 없어요.</p>
            <div className="dialog-actions">
              <button className="dlg-btn press" onClick={() => setDelOpen(false)}>취소</button>
              <button className="dlg-btn danger press" onClick={doDelete} disabled={deletePost.isPending}>{deletePost.isPending ? '삭제 중…' : '삭제'}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* ── 대화방 목록 ────────────────────────────── */
export function NewsChatList() {
  const navigate = useNavigate();
  const { groupId } = useActiveGroup();
  const { data: rooms, isLoading } = useRooms(groupId);
  const list = rooms ?? [];
  return (
    <div className="screen">
      <div className="scroll">
        <div className="hdr" style={{ paddingBottom: 8 }}>
          <div><h1 className="hdr-title">대화</h1><p className="hdr-sub">가족과 마음을 나눠요</p></div>
          <div className="hdr-icons"><button className="ic-btn press"><Icon name="search" size={21} sw={1.9} color="#3A463C" /></button><button className="ic-btn press"><Icon name="edit" size={20} sw={1.9} color="#3A463C" /></button></div>
        </div>
        <div className="block" style={{ paddingTop: 8 }}>
          {isLoading && <div className="info-banner">대화방을 불러오는 중…</div>}
          <div className="set-card">
            {list.map((r, i) => {
              const grp = r.type === 'GROUP';
              return (
                <button key={r.id} className={`chat-row ${i === list.length - 1 ? 'last' : ''} press`} onClick={() => navigate(`/news/chat?rid=${r.id}`)}>
                  {grp
                    ? <div className="chat-grp-av">{r.members.slice(0, 3).map((m, j) => <div key={m.userId} className={`cga cga-${j}`}><PAvatar name={m.name} size={22} /></div>)}</div>
                    : <PAvatar name={r.title || r.members[0]?.name || '?'} size={48} />}
                  <div className="chat-row-body">
                    <div className="chat-row-top"><span className="chat-row-name">{r.title || r.members.map(m => m.name).join(', ')}{grp && <span className="chat-grp-count">{r.members.length}</span>}</span><span className="chat-row-time">{fromNow(r.lastMessage?.createdAt)}</span></div>
                    <div className="chat-row-bottom"><span className="chat-row-last">{r.lastMessage?.content ?? ''}</span>{r.unreadCount > 0 && <span className="chat-unread">{r.unreadCount}</span>}</div>
                  </div>
                </button>
              );
            })}
            {!isLoading && list.length === 0 && <div className="chat-row last" style={{ color: '#A8A296' }}>아직 대화방이 없어요.</div>}
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
  const { groupId } = useActiveGroup();
  const rid = Number(new URLSearchParams(window.location.search).get('rid')) || null;
  const { data: rooms } = useRooms(groupId);
  const { data: messages } = useMessages(groupId, rid);
  const send = useSendMessage(groupId ?? 0, rid ?? 0);
  const [text, setText] = useState('');

  const room = rooms?.find(r => r.id === rid);
  const msgs = messages ?? [];

  const submit = async () => {
    if (!groupId || !rid || !text.trim()) return;
    try { await send.mutateAsync({ content: text.trim() }); setText(''); } catch { /* noop */ }
  };

  return (
    <div className="screen">
      <div className="chat-hdr">
        <button className="nav-back press" onClick={() => navigate(-1)}><Icon name="chevron" size={22} sw={2.3} color="#20231F" style={{ transform: 'rotate(180deg)' }} /></button>
        <div className="chat-hdr-mid">
          <div className="ava-stack">{(room?.members ?? []).slice(0, 3).map((m, i) => <div key={m.userId} style={{ marginLeft: i ? -9 : 0, zIndex: 5 - i }}><PAvatar name={m.name} size={26} ring ringColor="#FFF8EF" /></div>)}</div>
          <div><div className="chat-title">{room?.title || (room?.members ?? []).map(m => m.name).join(', ') || '대화'}</div><div className="chat-sub">{room?.members.length ?? 0}명</div></div>
        </div>
        <button className="icon-action press"><Icon name="dots" size={20} color="#3A463C" /></button>
      </div>
      <div className="chat-scroll">
        {msgs.map((m, i) => {
          if (m.type === 'SYSTEM') return <div className="chat-sys" key={m.id}><Icon name="info" size={14} sw={2} color="#7FA585" />{m.content}</div>;
          const prev = msgs[i - 1];
          const sameWho = !m.mine && prev && !prev.mine && prev.sender?.userId === m.sender?.userId;
          if (!m.mine) return (
            <div className="msg in" key={m.id}>
              <div className="msg-av">{!sameWho ? <PAvatar name={m.sender?.name ?? '?'} size={32} /> : <span style={{ width: 32, display: 'inline-block' }} />}</div>
              <div className="msg-col">{!sameWho && <span className="msg-name">{m.sender?.name}</span>}<div className="bubble in">{m.content}</div></div>
            </div>
          );
          return <div className="msg out" key={m.id}><div className="bubble out">{m.content}</div></div>;
        })}
        {msgs.length === 0 && <div className="chat-sys"><Icon name="chat" size={14} sw={2} color="#7FA585" />첫 메시지를 보내보세요</div>}
      </div>
      <div className="chat-input">
        <button className="ci-plus press" onClick={async () => { const [f] = await pickImage(); if (f) alert('사진 전송은 업로드 기능 연동 후 지원됩니다.'); }}><Icon name="plus" size={22} sw={2.2} color="#6D6A61" /></button>
        <input className="ci-field2" value={text} onChange={e => setText(e.target.value)} placeholder="메시지 보내기" onKeyDown={e => { if (e.key === 'Enter') submit(); }} style={{ border: 'none', background: '#fff' }} />
        <button className="ci-send press" onClick={submit} disabled={send.isPending}><Icon name="send" size={20} sw={1.9} color="#fff" /></button>
      </div>
    </div>
  );
}

/* ── 소식 없음 · 빈 화면 ────────────────────── */
export function NewsEmpty({ onWrite, sheet, onClose, text, setText, onSubmit, me, busy }: {
  onWrite?: () => void; sheet?: boolean; onClose?: () => void;
  text?: string; setText?: (v: string) => void; onSubmit?: () => void; me?: string; busy?: boolean;
} = {}) {
  return (
    <div className="screen">
      <div className="scroll" style={{ display: 'flex', flexDirection: 'column' }}>
        <div className="hdr" style={{ paddingBottom: 8 }}>
          <div><h1 className="hdr-title">소식</h1><p className="hdr-sub">우리 가족의 오늘을 모았어요</p></div>
          <div className="hdr-icons"><button className="ic-btn press" onClick={onWrite}><Icon name="edit" size={20} sw={1.9} color="#3A463C" /></button></div>
        </div>
        <div className="empty">
          <div className="empty-ic"><Icon name="cheer" size={38} sw={1.7} color="#9BB89F" /></div>
          <h4 className="empty-title">아직 소식이 없어요</h4>
          <p className="empty-desc">가족이 숙제를 인증하거나 목표를 달성하면 이곳에 소식이 쌓여요.</p>
          <button className="empty-cta press" onClick={onWrite}><Icon name="plus" size={18} sw={2.3} color="#fff" />첫 소식 남기기</button>
        </div>
      </div>
      <BottomNav active="소식" />
      {setText && onSubmit && onClose && (
        <WriteSheet open={!!sheet} onClose={onClose} text={text ?? ''} setText={setText} onSubmit={onSubmit} me={me} busy={busy} />
      )}
    </div>
  );
}
