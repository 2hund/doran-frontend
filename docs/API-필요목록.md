# 백엔드 API 추가 요청 목록

이벤트 미연결 버튼 / 미구현 화면 중 **백엔드 API가 있어야 동작 가능한 항목**을 정리한 문서입니다.
기준: 현재 Swagger(`https://vacation-api.2hund.com/doran/v3/api-docs`)에 **없는** 엔드포인트만 표기.

- ✅ 이미 있음 = 프론트 연결만 하면 됨 (API 신규 불필요)
- 🔴 신규 필요 = 백엔드 엔드포인트 추가 필요

---

## 1. 인증 / 계정

| 화면·버튼 | 동작 | 상태 | 제안 엔드포인트 |
|---|---|---|---|
| `auth` · **비밀번호 찾기** | 이메일로 재설정 메일/코드 발송 | 🔴 신규 | `POST /api/auth/password/reset-request` `{ email }` |
| `auth` · 비밀번호 재설정 | 코드 검증 후 새 비밀번호 설정 | 🔴 신규 | `POST /api/auth/password/reset` `{ token, newPassword }` |
| `auth` · 이메일 회원가입/로그인 | 이메일+비밀번호 가입·로그인 | 🔴 신규 | `POST /api/auth/signup` `{ email, password, name }` · `POST /api/auth/login` `{ email, password }` → JWT |
| `my/settings` · 비밀번호 변경 | 현재→새 비밀번호 변경 | 🔴 신규 | `PATCH /api/users/me/password` `{ currentPassword, newPassword }` |
| `my/settings` · 연결된 계정 | 소셜 연동 현황·해제 | 🔴 신규 | `GET /api/users/me/connections` · `DELETE /api/users/me/connections/{provider}` |

> 참고: 현재 인증은 카카오/Apple 소셜(`/api/auth/kakao`, `/api/auth/apple`)만 존재.
> 이메일 로그인 화면이 UI에 있으나 **이메일 인증 API 자체가 없음** → 위 신규 필요.

---

## 2. 알림 (헤더 벨 아이콘)

| 화면·버튼 | 동작 | 상태 | 제안 엔드포인트 |
|---|---|---|---|
| 각 탭 헤더 · **벨 아이콘** | 알림 목록 조회 | 🔴 신규 | `GET /api/notifications` → `[{ id, type, message, link, read, createdAt }]` |
| 알림 화면 · 개별 읽음 | 읽음 처리 | 🔴 신규 | `POST /api/notifications/{id}/read` |
| 알림 화면 · 모두 읽음 | 전체 읽음 | 🔴 신규 | `POST /api/notifications/read-all` |
| 알림 뱃지 | 안 읽은 개수 | 🔴 신규 | `GET /api/notifications/unread-count` → `{ count }` |

> 알림 **설정**(`/api/notifications/settings`)은 ✅ 이미 있음. 알림 **목록/수신함**은 없음.

---

## 3. 검색 (헤더 검색 아이콘)

| 화면·버튼 | 동작 | 상태 | 제안 엔드포인트 |
|---|---|---|---|
| 일정/소식/대화 헤더 · **검색** | 통합/탭별 검색 | 🔴 신규 | `GET /api/groups/{groupId}/search?q=&type=schedule|news|member|task` |

> 또는 도메인별 목록 API에 `?q=` 쿼리 파라미터 추가로도 대응 가능.

---

## 4. MY · 건강 기록 / 리포트

| 화면·버튼 | 동작 | 상태 | 제안 엔드포인트 |
|---|---|---|---|
| `my` · 건강 리포트 (주간 차트) | 걸음/달성률 통계 | 🔴 신규 | `GET /api/users/me/stats?period=week|month|year` |
| `my/report` · **걸음 수 기록** | 걸음 상세 이력 | 🔴 신규 | `GET /api/users/me/steps?period=` |
| `my/report` · **숙제 달성 기록** | 숙제 달성 이력 | 🔴 신규 | `GET /api/users/me/task-history` |
| `my` · 통계 타일(오늘 걸음/주간 숙제/받은 응원) | 요약 수치 | 🔴 신규 | `GET /api/users/me/summary` → `{ todaySteps, weekTasks, cheersReceived }` |

> 현재 MY 화면의 걸음/혈압/체중/차트는 모두 더미. 건강 데이터 API가 전무함.

---

## 5. 그룹 건강 허브 · 랭킹 / 리포트 (그룹관리 탭)

| 화면·버튼 | 동작 | 상태 | 제안 엔드포인트 |
|---|---|---|---|
| `group/hub` · 건강 점수 / 오늘의 가족 | 그룹 건강 요약 | 🔴 신규 | `GET /api/groups/{groupId}/health-summary` |
| `group/ranking` · 이번 달 랭킹 | 걸음/숙제/응원 랭킹 | 🔴 신규 | `GET /api/groups/{groupId}/ranking?category=steps|task|cheer` |
| `group/report` · 가족 건강 리포트 | 멤버별 달성률 주간 리포트 | 🔴 신규 | `GET /api/groups/{groupId}/report?period=week` |

> 현재 허브/랭킹/리포트 화면은 전부 더미 데이터. 숙제/인증 API는 ✅ 있으나 **집계·랭킹 API는 없음**.

---

## 6. 걸음 수 (헬스 데이터 연동)

| 화면 | 동작 | 상태 | 비고 |
|---|---|---|---|
| 메인/허브/랭킹 곳곳의 "걸음" | 디바이스 걸음 수 업로드/조회 | 🔴 신규 | 디바이스(HealthKit/Google Fit) → `POST /api/users/me/steps` `{ date, count }` 업로드, 조회는 4·5번과 연계 |

---

## 7. 미디어 업로드 (사진)

| 화면·버튼 | 동작 | 상태 | 제안 엔드포인트 |
|---|---|---|---|
| 소식 작성 · **사진 첨부** | 이미지 업로드 → URL | 🔴 신규 | `POST /api/uploads` (multipart) → `{ url }` |
| 숙제 인증 · 사진 | 인증 사진 업로드 | 🔴 신규 | 동일 업로드 API 사용 후 `photoUrl` 로 인증 |
| 프로필/그룹 사진 변경 | 이미지 업로드 | 🔴 신규 | 동일 업로드 API |

> `CertifyRequest.photoUrl`, `CreatePostRequest.photoUrls`, 프로필 사진은 **URL 문자열**을 받음.
> 즉 파일을 URL로 바꿔주는 **업로드 엔드포인트가 별도로 필요**. 현재 Swagger에 없음.

---

## 8. 공지 / 고객센터 (MY)

| 화면·버튼 | 동작 | 상태 | 제안 엔드포인트 |
|---|---|---|---|
| `my` · **공지사항** | 공지 목록/상세 | 🔴 신규 | `GET /api/notices` · `GET /api/notices/{id}` |
| `my` · **고객센터** | FAQ / 1:1 문의 | 🔴 신규 | `GET /api/support/faqs` · `POST /api/support/inquiries` |

> 또는 외부 링크(웹뷰)로 대체 가능 — 그 경우 API 불필요.

---

## ✅ 이미 API가 있어 "프론트 연결만" 하면 되는 버튼 (참고)

아래는 API 신규가 필요 없고, onClick 연결만 추가하면 되는 항목:

| 화면·버튼 | 사용할 기존 API |
|---|---|
| 소식 카드 · 댓글 수 버튼 | 카드 전체가 이미 상세로 이동 (별도 불필요) |
| 멤버 상세 · 더보기(dots) | 호칭수정/내보내기 — 이미 시트·다이얼로그 존재 |
| 그룹 초대 · 카카오톡/더보기 공유 | 클라이언트 공유(Web Share / 카카오 SDK), API 불필요 |
| 캘린더 화살표·날짜 선택 | `GET /api/groups/{groupId}/schedules` (월 파라미터 추가 시 더 정확) |

---

## 우선순위 제안

1. **🔴 P0 (핵심 기능)**: 미디어 업로드(7) — 숙제 인증·소식 사진이 막혀 있음
2. **🔴 P1**: 알림 목록(2), 건강 통계/요약(4) — 메인·MY 핵심 수치
3. **🔴 P1**: 그룹 랭킹·리포트(5) — 그룹관리 탭 핵심 콘텐츠
4. **🔴 P2**: 이메일 인증(1) — 소셜 로그인으로 우선 대체 가능
5. **🔴 P2**: 검색(3), 공지/고객센터(8) — 외부 링크/후순위로 대체 가능
6. **🔴 P3**: 걸음 헬스 연동(6) — 디바이스 권한 등 별도 트랙
