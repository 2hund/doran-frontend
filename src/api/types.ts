// types.ts — 도란 API DTO 타입
// 주의: 백엔드 OpenAPI 가 응답 DTO 들을 모두 'Response' 라는 이름으로 노출(이름 충돌)해
// 응답 필드가 스펙에서 구분되지 않습니다. 요청 DTO 는 스펙에 명확하므로 정확히 반영하고,
// 응답은 합리적으로 추정한 형태 + 알 수 없는 필드 허용(index signature)으로 둡니다.

/* ── 공통 ── */
export interface MemberRef {
  userId: number;
  name: string;
}

export type Role = 'ADMIN' | 'MEMBER';
export type Reaction = 'CHEER' | 'LOVE' | 'AMAZING' | 'FIGHTING' | 'BEST' | 'HEALTHY';
export type PostType = 'FREE' | 'TASK_CERT' | 'STEPS' | 'SCHEDULE' | 'MILESTONE' | 'GIFT' | 'CHEER';

/* ── 인증 ── */
export interface KakaoLoginRequest { accessToken: string }
export interface AppleLoginRequest { identityToken: string; nonce?: string | null; name?: string | null }
export interface RefreshTokenRequest { refreshToken: string }
export interface TokenResponse {
  accessToken: string;
  refreshToken: string;
  [k: string]: unknown;
}

/* ── 사용자 ── */
export interface UpdateUserRequest {
  name?: string | null;
  nickname?: string | null;
  [k: string]: unknown;
}
export interface UserResponse {
  id: number;
  name: string;
  nickname?: string;
  email?: string;
  [k: string]: unknown;
}

/* ── 그룹 ── */
export interface CreateGroupRequest { name: string; description?: string | null; emblem?: string | null }
export interface UpdateGroupRequest { name?: string; description?: string | null; emblem?: string | null; [k: string]: unknown }
export interface JoinByCodeRequest { code: string }
export interface RoleRequest { role: Role }
export interface NicknameRequest { nickname: string }
export interface GroupNicknameRequest { groupNickname?: string | null }
export interface GroupResponse {
  id: number;
  name: string;
  description?: string;
  emblem?: string;
  code?: string;
  memberCount?: number;
  role?: Role;
  [k: string]: unknown;
}
export interface MemberResponse {
  userId: number;
  name: string;
  nickname?: string;
  groupNickname?: string;
  role?: Role;
  [k: string]: unknown;
}
export interface JoinRequestResponse {
  requestId: number;
  user?: MemberRef;
  name?: string;
  createdAt?: string;
  [k: string]: unknown;
}

/* ── 일정 ── */
export interface CreateScheduleRequest {
  title: string;
  startAt?: string;
  endAt?: string;
  location?: string | null;
  memo?: string | null;
  repeat?: string | null;
  alarm?: string | null;
  [k: string]: unknown;
}
export interface ScheduleResponse {
  id: number;
  title: string;
  startAt?: string;
  endAt?: string;
  location?: string;
  memo?: string;
  members?: MemberRef[];
  [k: string]: unknown;
}

/* ── 숙제 ── */
export interface CreateTaskRequest {
  title: string;
  category?: string | null;
  assigneeIds?: number[];
  goal?: number;
  repeat?: string | null;
  alarm?: string | null;
  [k: string]: unknown;
}
export interface UpdateTaskRequest { [k: string]: unknown }
export interface CertifyRequest { photoUrl?: string | null; memo?: string | null }
export interface TaskResponse {
  id: number;
  title: string;
  category?: string;
  assignee?: MemberRef;
  progress?: number;
  goal?: number;
  done?: number;
  [k: string]: unknown;
}

/* ── 소식 ── */
export interface CreatePostRequest {
  type?: PostType;
  content: string;
  photoUrls?: string[] | null;
  metricValue?: number | null;
  metricGoal?: number | null;
  metricUnit?: string | null;
}
export interface CommentRequest { content: string }
export interface CheerRequest { reaction: Reaction; message?: string | null }
export interface CommentResponse { id: number; author: MemberRef; content: string; createdAt: string }
export interface CheerResponse { id: number; sender: MemberRef; reaction: Reaction; message: string; createdAt: string }
export interface PostResponse {
  id: number;
  author: MemberRef;
  type: PostType;
  content: string;
  photoUrls?: string[];
  metricValue?: number;
  metricGoal?: number;
  metricUnit?: string;
  cheerCount?: number;
  commentCount?: number;
  myReaction?: Reaction;
  cheerers?: MemberRef[];
  createdAt: string;
  comments?: CommentResponse[];
  cheers?: CheerResponse[];
}

/* ── 대화 ── */
export type RoomType = 'GROUP' | 'DIRECT';
export interface CreateRoomRequest { type?: RoomType; targetUserId?: number | null }
export interface SendMessageRequest { content: string }
export interface MessageResponse {
  id: number;
  sender: MemberRef;
  type: 'TEXT' | 'SYSTEM';
  content: string;
  createdAt: string;
  mine: boolean;
}
export interface RoomResponse {
  id: number;
  type: RoomType;
  title: string;
  members: MemberRef[];
  lastMessage?: MessageResponse;
  unreadCount: number;
  createdAt: string;
}

/* ── 알림 설정 ── */
export interface NotificationSettings {
  push: boolean;
  schedule: boolean;
  task: boolean;
  cheer: boolean;
  gift: boolean;
  news: boolean;
  marketing: boolean;
}
