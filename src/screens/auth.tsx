// auth.tsx — 로그인·회원가입 플로우 (휴대폰 인증 제외, 가입 3단계)
import { useState, type ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { Icon, type IconName } from '../lib/Icon';
import { PAvatar, NavHeader } from '../lib/shared';

/* 도란도란 로고 마크 */
function Logo({ size = 72, light = false }: { size?: number; light?: boolean }) {
  const bg = light ? '#FFF8EF' : '#1F4D3A';
  const fg = light ? '#1F4D3A' : '#FFF8EF';
  return (
    <div style={{
      width: size, height: size, borderRadius: size * 0.32, background: bg,
      display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
      boxShadow: light ? 'none' : '0 16px 30px -12px rgba(31,77,58,.6)',
    }}>
      <svg width={size * 0.6} height={size * 0.6} viewBox="0 0 36 36" fill="none">
        <path d="M9 16.5c0-3 2.4-5.2 5.4-5.2 1.8 0 3 .9 3.6 1.8.6-.9 1.8-1.8 3.6-1.8 3 0 5.4 2.2 5.4 5.2 0 1.4-.6 2.7-1.5 3.8" stroke={fg} strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
        <circle cx="18" cy="9.5" r="2.4" fill={fg} />
        <path d="M11 27c0-3.4 3.1-5.6 7-5.6s7 2.2 7 5.6" stroke={fg} strokeWidth="2.4" strokeLinecap="round" />
      </svg>
    </div>
  );
}

function SocialBtn({ kind }: { kind: 'kakao' | 'apple' | 'email'; }) {
  const map = {
    kakao: { bg: '#FEE500', fg: '#3A2A0A', label: '카카오톡으로 시작하기', border: false, icon: <Icon name="chat" size={20} sw={2.1} color="#3A2A0A" /> },
    apple: { bg: '#1A1A1A', fg: '#fff', label: 'Apple로 시작하기', border: false, icon: <svg width="18" height="20" viewBox="0 0 18 20" fill="#fff"><path d="M14.7 10.6c0-2.3 1.9-3.4 2-3.5-1.1-1.6-2.8-1.8-3.4-1.8-1.4-.1-2.8.9-3.5.9s-1.8-.8-3-.8c-1.5 0-2.9.9-3.7 2.3-1.6 2.7-.4 6.8 1.1 9 .7 1.1 1.6 2.3 2.8 2.3 1.1 0 1.5-.7 2.9-.7s1.7.7 2.9.7c1.2 0 2-1.1 2.7-2.2.9-1.2 1.2-2.5 1.2-2.5s-2.3-.9-2.3-3.6c0-.1 0-.2.1-.3ZM12.4 3.6c.6-.8 1-1.8.9-2.9-.9 0-2 .6-2.6 1.4-.6.7-1.1 1.7-.9 2.7 1 .1 2-.5 2.6-1.2Z" /></svg> },
    email: { bg: '#fff', fg: '#20231F', label: '이메일로 시작하기', border: true, icon: <Icon name="mail" size={20} sw={1.9} color="#1F4D3A" /> },
  } as const;
  const s = map[kind];
  return (
    <button className="social-btn press" style={{ background: s.bg, color: s.fg, border: s.border ? '1px solid #E9E1D5' : 'none' }}>
      <span className="social-ic">{s.icon}</span>
      <span className="social-label">{s.label}</span>
    </button>
  );
}

function StepBar({ step, total = 3 }: { step: number; total?: number }) {
  return (
    <div className="auth-steps">
      {Array.from({ length: total }).map((_, i) => <span key={i} className={`astep ${i < step ? 'on' : ''}`} />)}
      <span className="astep-label">{step}/{total}</span>
    </div>
  );
}

function Field({ label, value, placeholder, icon, trailing, hint, hintOk, focus }: {
  label: string; value?: string; placeholder?: string; icon?: IconName; trailing?: ReactNode; hint?: string; hintOk?: boolean; focus?: boolean;
}) {
  return (
    <div className="afield">
      <span className="afield-label">{label}</span>
      <div className={`afield-box ${focus ? 'focus' : ''}`}>
        {icon && <Icon name={icon} size={19} sw={1.9} color={focus ? '#1F4D3A' : '#A8A296'} />}
        <span className="afield-val" style={{ color: value ? '#20231F' : '#A8A296' }}>{value || placeholder}</span>
        {trailing}
      </div>
      {hint && <span className={`afield-hint ${hintOk ? 'ok' : ''}`}><Icon name={hintOk ? 'check' : 'info'} size={13} sw={2.2} color={hintOk ? '#4F8A5B' : '#C7841A'} />{hint}</span>}
    </div>
  );
}

type AuthView = 'start' | 'login' | 'email' | 'terms' | 'info' | 'profile' | 'group' | 'welcome';

/* 인증 플로우 전체를 하나의 상태 머신으로 */
export function AuthFlow() {
  const navigate = useNavigate();
  const [view, setView] = useState<AuthView>('start');
  const [showPw, setShowPw] = useState(false);
  const [keep, setKeep] = useState(true);

  if (view === 'start') {
    return (
      <div className="screen auth-start">
        <div className="start-glow start-glow-1" />
        <div className="start-glow start-glow-2" />
        <div className="start-body">
          <Logo size={84} light />
          <h1 className="start-name">도란도란</h1>
          <p className="start-tag">온 가족의 건강을<br />함께 돌보고 응원해요</p>
          <div className="start-cluster">
            {[['엄마', 0], ['아빠', 1], ['나', 2], ['큰딸', 3], ['할머니', 4]].map(([m, i]) => (
              <div key={m as string} style={{ marginLeft: (i as number) ? -14 : 0, zIndex: 9 - (i as number) }}><PAvatar name={m as string} size={50} ring ringColor="#1F4D3A" /></div>
            ))}
          </div>
        </div>
        <div className="start-foot">
          <button className="btn-light press" onClick={() => setView('terms')}>시작하기</button>
          <button className="start-login press" onClick={() => setView('login')}>이미 계정이 있어요 <b>로그인</b></button>
        </div>
      </div>
    );
  }

  if (view === 'login') {
    return (
      <div className="screen">
        <div className="scroll auth-pad">
          <div className="auth-brand">
            <Logo size={64} />
            <h1 className="auth-brand-name">도란도란</h1>
            <p className="auth-brand-sub">가족 건강 케어를 시작해보세요</p>
          </div>
          <div className="social-stack">
            <SocialBtn kind="kakao" />
            <SocialBtn kind="apple" />
            <button className="social-btn press" style={{ background: '#fff', color: '#20231F', border: '1px solid #E9E1D5' }} onClick={() => setView('email')}>
              <span className="social-ic"><Icon name="mail" size={20} sw={1.9} color="#1F4D3A" /></span>
              <span className="social-label">이메일로 시작하기</span>
            </button>
          </div>
          <div className="auth-divider"><span>또는</span></div>
          <button className="auth-signup-row press" onClick={() => setView('terms')}>
            처음 오셨나요? <b>이메일로 회원가입</b>
          </button>
          <p className="auth-policy">가입 시 <u>이용약관</u> 및 <u>개인정보 처리방침</u>에<br />동의하게 됩니다.</p>
        </div>
      </div>
    );
  }

  if (view === 'email') {
    return (
      <div className="screen">
        <div className="scroll" style={{ paddingBottom: 0 }}>
          <NavHeader title="로그인" onBack={() => setView('login')} />
          <div className="auth-head">
            <h2 className="auth-title">다시 만나서 반가워요</h2>
            <p className="auth-desc">이메일과 비밀번호를 입력해주세요</p>
          </div>
          <div className="block afields">
            <Field label="이메일" value="doran@family.com" icon="mail" focus />
            <Field label="비밀번호" value={showPw ? 'doran1234' : '••••••••'} icon="lock"
              trailing={<button className="afield-eye press" onClick={() => setShowPw(!showPw)}><Icon name={showPw ? 'eyeoff' : 'eye'} size={19} sw={1.8} color="#9A958A" /></button>} />
            <button className="check-row press" onClick={() => setKeep(!keep)}>
              <span className={`cbox ${keep ? 'on' : ''}`}>{keep && <Icon name="check" size={13} sw={2.6} color="#fff" />}</span>
              로그인 상태 유지
            </button>
          </div>
        </div>
        <div className="auth-foot">
          <button className="btn-primary press" onClick={() => navigate('/')}>로그인</button>
          <div className="auth-links">
            <button className="press">비밀번호 찾기</button>
            <span className="al-div" />
            <button className="press" onClick={() => setView('terms')}>회원가입</button>
          </div>
        </div>
      </div>
    );
  }

  if (view === 'terms') return <TermsView onBack={() => setView('start')} onNext={() => setView('info')} />;
  if (view === 'info') return <InfoView onBack={() => setView('terms')} onNext={() => setView('profile')} showPw={showPw} setShowPw={setShowPw} />;
  if (view === 'profile') return <ProfileSetupView onBack={() => setView('info')} onNext={() => setView('group')} />;
  if (view === 'group') return <GroupStartView onNext={() => setView('welcome')} />;
  return <WelcomeView onHome={() => navigate('/')} />;
}

function TermsView({ onBack, onNext }: { onBack: () => void; onNext: () => void }) {
  const items = [
    { key: 'a', req: true, label: '서비스 이용약관 동의', link: true },
    { key: 'b', req: true, label: '개인정보 수집 및 이용 동의', link: true },
    { key: 'c', req: true, label: '만 14세 이상입니다' },
    { key: 'd', req: false, label: '마케팅 정보 수신 동의 (선택)', link: true },
  ];
  const [checked, setChecked] = useState<Record<string, boolean>>({ a: false, b: false, c: false, d: false });
  const allReq = items.filter(i => i.req).every(i => checked[i.key]);
  const all = items.every(i => checked[i.key]);
  const toggleAll = () => { const v = !all; setChecked({ a: v, b: v, c: v, d: v }); };
  const toggle = (k: string) => setChecked(c => ({ ...c, [k]: !c[k] }));
  return (
    <div className="screen">
      <div className="scroll" style={{ paddingBottom: 0 }}>
        <NavHeader title="회원가입" onBack={onBack} />
        <div style={{ padding: '4px 22px 0' }}><StepBar step={1} /></div>
        <div className="auth-head">
          <h2 className="auth-title">약관에 동의해주세요</h2>
          <p className="auth-desc">서비스 이용을 위해 동의가 필요해요</p>
        </div>
        <div className="block">
          <button className={`terms-all press ${all ? 'on' : ''}`} onClick={toggleAll}>
            <span className={`cbox lg ${all ? 'on' : ''}`}>{all && <Icon name="check" size={16} sw={2.6} color="#fff" />}</span>
            <span className="terms-all-label">약관 전체에 동의합니다</span>
          </button>
          <div className="terms-list">
            {items.map(it => (
              <div key={it.key} className="terms-row">
                <button className="terms-check press" onClick={() => toggle(it.key)}>
                  <span className={`cbox ${checked[it.key] ? 'on' : ''}`}>{checked[it.key] && <Icon name="check" size={13} sw={2.6} color="#fff" />}</span>
                  <span className="terms-label"><b className={it.req ? 'req' : 'opt'}>{it.req ? '[필수]' : '[선택]'}</b> {it.label}</span>
                </button>
                {it.link && <button className="terms-view press"><Icon name="chevron" size={16} sw={2.2} color="#C9C3B6" /></button>}
              </div>
            ))}
          </div>
        </div>
      </div>
      <div className="auth-foot">
        <button className={`btn-primary press ${allReq ? '' : 'disabled'}`} onClick={() => allReq && onNext()}>동의하고 계속하기</button>
      </div>
    </div>
  );
}

function InfoView({ onBack, onNext, showPw, setShowPw }: { onBack: () => void; onNext: () => void; showPw: boolean; setShowPw: (v: boolean) => void }) {
  return (
    <div className="screen">
      <div className="scroll" style={{ paddingBottom: 0 }}>
        <NavHeader title="회원가입" onBack={onBack} />
        <div style={{ padding: '4px 22px 0' }}><StepBar step={2} /></div>
        <div className="auth-head">
          <h2 className="auth-title">계정 정보를 입력해주세요</h2>
          <p className="auth-desc">로그인에 사용할 정보예요</p>
        </div>
        <div className="block afields">
          <Field label="이메일" value="doran@family.com" icon="mail" hint="사용 가능한 이메일이에요" hintOk />
          <Field label="비밀번호" value={showPw ? 'doran1234' : '••••••••'} icon="lock"
            trailing={<button className="afield-eye press" onClick={() => setShowPw(!showPw)}><Icon name={showPw ? 'eyeoff' : 'eye'} size={19} sw={1.8} color="#9A958A" /></button>}
            hint="영문, 숫자 포함 8자 이상" hintOk />
          <Field label="비밀번호 확인" value="••••••••" icon="key" focus />
        </div>
      </div>
      <div className="auth-foot">
        <button className="btn-primary press" onClick={onNext}>다음</button>
      </div>
    </div>
  );
}

function ProfileSetupView({ onBack, onNext }: { onBack: () => void; onNext: () => void }) {
  const colors = [
    { name: '엄마', c: '#E07A5F' }, { name: '아빠', c: '#36513B' }, { name: '나', c: '#4F8A5B' },
    { name: '큰딸', c: '#C98A40' }, { name: '할머니', c: '#A6705A' },
  ];
  const [sel, setSel] = useState('나');
  return (
    <div className="screen">
      <div className="scroll" style={{ paddingBottom: 0 }}>
        <NavHeader title="회원가입" onBack={onBack} />
        <div style={{ padding: '4px 22px 0' }}><StepBar step={3} /></div>
        <div className="auth-head">
          <h2 className="auth-title">프로필을 만들어주세요</h2>
          <p className="auth-desc">가족에게 보여질 내 모습이에요</p>
        </div>
        <div className="block" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', paddingTop: 8 }}>
          <div className="profile-pick">
            <PAvatar name={sel} size={104} />
            <button className="profile-cam press"><Icon name="camera" size={20} sw={1.9} color="#3A463C" /></button>
          </div>
          <span className="profile-cap">색상을 선택하거나 사진을 올려보세요</span>
          <div className="color-row">
            {colors.map(c => (
              <button key={c.name} className={`color-dot press ${sel === c.name ? 'on' : ''}`} style={{ background: c.c, color: c.c }} onClick={() => setSel(c.name)}>
                {sel === c.name && <Icon name="check" size={16} sw={2.8} color="#fff" />}
              </button>
            ))}
          </div>
        </div>
        <div className="block afields" style={{ paddingTop: 6 }}>
          <Field label="이름" value="김도란" icon="user" />
          <Field label="가족 호칭" value="막내딸" icon="family" hint="가족이 부르는 호칭을 적어주세요" />
        </div>
      </div>
      <div className="auth-foot">
        <button className="btn-primary press" onClick={onNext}>가입 완료</button>
      </div>
    </div>
  );
}

function GroupStartView({ onNext }: { onNext: () => void }) {
  const [sel, setSel] = useState<'create' | 'join'>('create');
  return (
    <div className="screen">
      <div className="scroll" style={{ paddingBottom: 0 }}>
        <div className="auth-head" style={{ paddingTop: 64 }}>
          <h2 className="auth-title">가족 그룹을 시작해요</h2>
          <p className="auth-desc">함께 건강을 돌볼 가족을 모아보세요</p>
        </div>
        <div className="block" style={{ display: 'flex', flexDirection: 'column', gap: 13 }}>
          <button className={`grp-opt press ${sel === 'create' ? 'on' : ''}`} onClick={() => setSel('create')}>
            <div className="grp-opt-ic" style={{ background: '#DDEBDD' }}><Icon name="plus" size={24} sw={2.1} color="#1F4D3A" /></div>
            <div className="grp-opt-body">
              <span className="grp-opt-title">새 가족 그룹 만들기</span>
              <span className="grp-opt-sub">내가 그룹을 만들고 가족을 초대해요</span>
            </div>
            <span className={`radio ${sel === 'create' ? 'on' : ''}`} />
          </button>
          <button className={`grp-opt press ${sel === 'join' ? 'on' : ''}`} onClick={() => setSel('join')}>
            <div className="grp-opt-ic" style={{ background: '#FCF1DD' }}><Icon name="link" size={22} sw={2} color="#C7841A" /></div>
            <div className="grp-opt-body">
              <span className="grp-opt-title">초대 코드로 참여하기</span>
              <span className="grp-opt-sub">가족에게 받은 코드를 입력해요</span>
            </div>
            <span className={`radio ${sel === 'join' ? 'on' : ''}`} />
          </button>

          {sel === 'create' && (
            <div className="grp-detail">
              <Field label="그룹 이름" value="우리집" icon="family" focus />
            </div>
          )}
          {sel === 'join' && (
            <div className="grp-detail">
              <span className="afield-label" style={{ paddingLeft: 2 }}>초대 코드</span>
              <div className="code-row" style={{ marginTop: 9 }}>
                {['D', 'O', 'R', 'A', 'N', ''].map((c, i) => (
                  <div key={i} className={`code-box ${c ? 'filled' : ''} ${i === 5 ? 'active' : ''}`} style={{ fontSize: 20 }}>{c || (i === 5 ? <span className="caret" /> : '')}</div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
      <div className="auth-foot">
        <button className="btn-primary press" onClick={onNext}>{sel === 'create' ? '그룹 만들기' : '그룹 참여하기'}</button>
        <button className="auth-skip press" onClick={onNext}>나중에 할게요</button>
      </div>
    </div>
  );
}

function WelcomeView({ onHome }: { onHome: () => void }) {
  return (
    <div className="screen auth-welcome">
      <div className="welcome-body">
        <div className="welcome-ring">
          <div className="welcome-circle"><Icon name="check" size={46} sw={2.4} color="#fff" /></div>
        </div>
        <h1 className="welcome-title">환영해요, 김도란님!</h1>
        <p className="welcome-desc">«우리집» 가족 그룹이 만들어졌어요.<br />이제 가족과 함께 건강을 돌봐요.</p>
        <div className="welcome-card">
          <div className="ava-stack">
            <div><PAvatar name="나" size={40} ring ringColor="#fff" /></div>
            <div className="ava-more" style={{ marginLeft: -12, background: '#EEF4ED', color: '#1F4D3A', boxShadow: '0 0 0 2.5px #fff' }}>초대</div>
          </div>
          <div className="welcome-card-body">
            <span className="welcome-card-name">우리집</span>
            <span className="welcome-card-sub">가족을 초대해 함께 시작하세요</span>
          </div>
        </div>
      </div>
      <div className="auth-foot">
        <button className="btn-primary press" onClick={onHome}><Icon name="plus" size={18} sw={2.2} color="#FFF8EF" />가족 초대하기</button>
        <button className="auth-skip press" onClick={onHome}>홈으로 가기</button>
      </div>
    </div>
  );
}
