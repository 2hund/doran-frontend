# 도란도란 — 가족 건강 케어 앱

가족 그룹을 만들어 건강 습관(숙제)·일정·소식을 함께 관리하는 모바일 웹앱입니다.
Claude Design 핸드오프 번들 `family-full-ui (Remix)`의 디자인을 실제 앱으로 구현했습니다.

- **스택**: Vite + React + TypeScript + React Router
- **타깃**: iOS / Android 웹앱 (Capacitor로 네이티브 패키징) + PWA
- **디자인 시스템**: 포레스트 그린 `#1F4D3A` + 웜 아이보리 `#FFF8EF`, Pretendard, 카드 radius 24/16px

## 실행

```bash
npm install
npm run dev        # http://localhost:5173
npm run build      # 프로덕션 빌드 (dist/)
```

## 모바일 앱으로 패키징 (Capacitor)

웹 코드 그대로 iOS/Android 네이티브 앱으로 빌드합니다.
**`ios/`·`android/` 네이티브 프로젝트는 이미 추가되어 저장소에 포함**되어 있습니다.

```bash
# 웹 빌드 후 동기화 & 네이티브 IDE 열기
npm run cap:ios        # Xcode 열기
npm run cap:android    # Android Studio 열기

# 빌드만 동기화하려면
npm run build && npx cap sync
```

- **설정**: `capacitor.config.ts` (appId `com.dorandoran.app`, appName `도란도란`)
- **네이티브 초기화**: `src/native.ts` — 상태바 색/스타일, 스플래시 숨김, Android 뒤로가기 처리 (웹에서는 no-op)
- **설치된 플러그인**: `@capacitor/status-bar`, `splash-screen`, `keyboard`, `app`, `preferences`
- **iOS 권한**: 카메라·사진 보관함 사용 설명을 `Info.plist`에 추가 (숙제 인증·프로필 사진)
- **iOS 빌드 전 1회**: 전체 Xcode가 활성화돼 있어야 함 — `sudo xcode-select -s /Applications/Xcode.app`
- **Android 빌드**: Android Studio(또는 Android SDK + `ANDROID_HOME`) 필요

> iOS는 Capacitor 8의 Swift Package Manager 방식이라 별도 `pod install` 없이 빌드됩니다.

## 화면 구조 (하단 5탭)

`소식 / 일정 / 도란도란(메인) / 그룹관리 / MY`

| 탭 | 라우트 | 화면 |
|---|---|---|
| **도란도란(메인)** | `/` | 오늘 꼭 챙길 일 · 오늘 해야 할 숙제 (핵심만) |
| **일정** | `/schedule`, `/schedule/detail`, `/schedule/new`, `/schedule/empty` | 월간 캘린더+타임라인, 상세(삭제 다이얼로그), 추가/수정 폼(날짜·시간·반복·알림 시트), 빈 화면 |
| **소식** | `/news`, `/news/detail`, `/news/chats`, `/news/chat`, `/news/empty` | 활동 피드(작성 시트), 소식 상세·댓글(응원 시트), 대화방 목록, 채팅, 빈 화면 |
| **그룹관리** | `/group`, `/group/home`, `/group/members`, `/group/member`, `/group/edit`, `/group/requests`, `/group/leave` | 내 그룹 목록, 그룹 홈(그룹 전환 스위처), 멤버 관리(초대 시트), 멤버 상세(호칭 시트·내보내기), 그룹 수정, 가입 요청, 위험 영역 |
| **그룹 건강 허브** | `/group/hub`, `/group/tasks`, `/group/task`, `/group/task/new`, `/group/ranking`, `/group/report` | 건강 점수·오늘의 가족·숙제·랭킹·리포트 (메인에서 그룹관리로 이동된 영역) |
| **MY** | `/my`, `/my/profile`, `/my/report`, `/my/settings`, `/my/notif` | 마이페이지 홈, 프로필 수정, 건강 리포트(주간 차트), 설정, 알림 상세 설정 |
| **인증** | `/auth` | 시작 → 로그인 → 회원가입 3단계(약관·계정·프로필) → 그룹 시작 → 환영 |

## 소스 구조

```
src/
  lib/
    Icon.tsx          # 라인 아이콘 세트 (49종, 1.9 stroke)
    shared.tsx        # PAvatar, RingAvatar, NavHeader, BottomNav,
                      # BottomSheet, EmptyState, Toggle, Segmented, StatusBar
  screens/
    doran.tsx         # 메인 + 그룹 건강 허브(숙제/랭킹/리포트)
    schedule.tsx      # 일정 탭
    news.tsx          # 소식 탭
    group.tsx         # 그룹관리 탭
    my.tsx            # MY 탭
    auth.tsx          # 로그인·회원가입 플로우
  styles/
    design-system.css # 도란도란 디자인 시스템 (번들 원본 CSS 통합)
    app-shell.css     # 모바일 셸 (데스크톱은 폰 프레임, 모바일은 풀스크린)
  App.tsx             # 라우터 + 앱 셸
  main.tsx
```

## 디자인 출처 메모

- 원본은 Claude Design HTML/JSX 프로토타입 6개 갤러리(~50화면)였고, 실제 앱처럼 **하단 5탭 네비 + 화면 전환**으로 재구성했습니다.
- 갤러리에서 "시트 위에 띄운 데모" 형태였던 화면(일정 추가·인증·초대·호칭·응원·삭제 등)은 실제 토글되는 바텀시트/다이얼로그로 연결했습니다.
- 최종 기획 결정 반영: 휴대폰 번호 인증 제거, MY에서 선물하기·위시리스트 제거, 건강점수·숙제·랭킹·리포트는 그룹관리(그룹 건강 허브)로 이동.
# doran-frontend
