// endpoints.ts — 도란 API 32개 엔드포인트 래퍼 (도메인별)
import { api } from './client';
import { tokenStore } from './token';
import type {
  KakaoLoginRequest, AppleLoginRequest, TokenResponse,
  UpdateUserRequest, UserResponse,
  CreateGroupRequest, UpdateGroupRequest, JoinByCodeRequest, RoleRequest,
  NicknameRequest, GroupNicknameRequest, GroupResponse, MemberResponse, JoinRequestResponse,
  CreateScheduleRequest, ScheduleResponse,
  CreateTaskRequest, UpdateTaskRequest, CertifyRequest, TaskResponse,
  CreatePostRequest, CommentRequest, CheerRequest, PostResponse, CommentResponse, CheerResponse,
  CreateRoomRequest, SendMessageRequest, RoomResponse, MessageResponse,
  NotificationSettings,
} from './types';

/* ── 인증 ── */
function storeTokens(t: TokenResponse) {
  tokenStore.set({ accessToken: t.accessToken, refreshToken: t.refreshToken });
  return t;
}
export const authApi = {
  kakao: (body: KakaoLoginRequest) =>
    api.post<TokenResponse>('/api/auth/kakao', body, { auth: false }).then(storeTokens),
  apple: (body: AppleLoginRequest) =>
    api.post<TokenResponse>('/api/auth/apple', body, { auth: false }).then(storeTokens),
  refresh: (refreshToken: string) =>
    api.post<TokenResponse>('/api/auth/refresh', { refreshToken }, { auth: false }).then(storeTokens),
  logout: async () => {
    try { await api.post<void>('/api/auth/logout'); } finally { tokenStore.clear(); }
  },
};

/* ── 사용자 ── */
export const userApi = {
  me: () => api.get<UserResponse>('/api/users/me'),
  update: (body: UpdateUserRequest) => api.patch<UserResponse>('/api/users/me', body),
  withdraw: () => api.del<void>('/api/users/me').finally(() => tokenStore.clear()),
};

/* ── 그룹관리 ── */
export const groupApi = {
  list: () => api.get<GroupResponse[]>('/api/groups'),
  create: (body: CreateGroupRequest) => api.post<GroupResponse>('/api/groups', body),
  detail: (groupId: number) => api.get<GroupResponse>(`/api/groups/${groupId}`),
  update: (groupId: number, body: UpdateGroupRequest) => api.patch<GroupResponse>(`/api/groups/${groupId}`, body),
  remove: (groupId: number) => api.del<void>(`/api/groups/${groupId}`),
  join: (body: JoinByCodeRequest) => api.post<GroupResponse>('/api/groups/join', body),
  leave: (groupId: number) => api.post<void>(`/api/groups/${groupId}/leave`),
  regenerateCode: (groupId: number) => api.post<GroupResponse>(`/api/groups/${groupId}/regenerate-code`),
  // 멤버
  members: (groupId: number) => api.get<MemberResponse[]>(`/api/groups/${groupId}/members`),
  member: (groupId: number, userId: number) => api.get<MemberResponse>(`/api/groups/${groupId}/members/${userId}`),
  kickMember: (groupId: number, userId: number) => api.del<void>(`/api/groups/${groupId}/members/${userId}`),
  setRole: (groupId: number, userId: number, body: RoleRequest) =>
    api.patch<MemberResponse>(`/api/groups/${groupId}/members/${userId}/role`, body),
  setNickname: (groupId: number, userId: number, body: NicknameRequest) =>
    api.put<MemberResponse>(`/api/groups/${groupId}/members/${userId}/nickname`, body),
  setGroupNickname: (groupId: number, userId: number, body: GroupNicknameRequest) =>
    api.put<MemberResponse>(`/api/groups/${groupId}/members/${userId}/group-nickname`, body),
  // 가입 요청
  requests: (groupId: number) => api.get<JoinRequestResponse[]>(`/api/groups/${groupId}/requests`),
  acceptRequest: (groupId: number, requestId: number) =>
    api.post<void>(`/api/groups/${groupId}/requests/${requestId}/accept`),
  denyRequest: (groupId: number, requestId: number) =>
    api.post<void>(`/api/groups/${groupId}/requests/${requestId}/deny`),
};

/* ── 일정 ── */
export const scheduleApi = {
  list: (groupId: number) => api.get<ScheduleResponse[]>(`/api/groups/${groupId}/schedules`),
  detail: (groupId: number, eventId: number) => api.get<ScheduleResponse>(`/api/groups/${groupId}/schedules/${eventId}`),
  create: (groupId: number, body: CreateScheduleRequest) => api.post<ScheduleResponse>(`/api/groups/${groupId}/schedules`, body),
  update: (groupId: number, eventId: number, body: Partial<CreateScheduleRequest>) =>
    api.patch<ScheduleResponse>(`/api/groups/${groupId}/schedules/${eventId}`, body),
  remove: (groupId: number, eventId: number) => api.del<void>(`/api/groups/${groupId}/schedules/${eventId}`),
};

/* ── 숙제 ── */
export const taskApi = {
  list: (groupId: number) => api.get<TaskResponse[]>(`/api/groups/${groupId}/tasks`),
  detail: (groupId: number, taskId: number) => api.get<TaskResponse>(`/api/groups/${groupId}/tasks/${taskId}`),
  create: (groupId: number, body: CreateTaskRequest) => api.post<TaskResponse>(`/api/groups/${groupId}/tasks`, body),
  update: (groupId: number, taskId: number, body: UpdateTaskRequest) =>
    api.patch<TaskResponse>(`/api/groups/${groupId}/tasks/${taskId}`, body),
  remove: (groupId: number, taskId: number) => api.del<void>(`/api/groups/${groupId}/tasks/${taskId}`),
  certify: (groupId: number, taskId: number, body: CertifyRequest) =>
    api.post<void>(`/api/groups/${groupId}/tasks/${taskId}/certifications`, body),
};

/* ── 소식 ── */
export const newsApi = {
  feed: (groupId: number) => api.get<PostResponse[]>(`/api/groups/${groupId}/news`),
  detail: (groupId: number, postId: number) => api.get<PostResponse>(`/api/groups/${groupId}/news/${postId}`),
  create: (groupId: number, body: CreatePostRequest) => api.post<PostResponse>(`/api/groups/${groupId}/news`, body),
  remove: (groupId: number, postId: number) => api.del<void>(`/api/groups/${groupId}/news/${postId}`),
  comment: (groupId: number, postId: number, body: CommentRequest) =>
    api.post<CommentResponse>(`/api/groups/${groupId}/news/${postId}/comments`, body),
  deleteComment: (groupId: number, postId: number, commentId: number) =>
    api.del<void>(`/api/groups/${groupId}/news/${postId}/comments/${commentId}`),
  cheer: (groupId: number, postId: number, body: CheerRequest) =>
    api.put<CheerResponse>(`/api/groups/${groupId}/news/${postId}/cheer`, body),
  cancelCheer: (groupId: number, postId: number) =>
    api.del<void>(`/api/groups/${groupId}/news/${postId}/cheer`),
};

/* ── 대화 ── */
export const chatApi = {
  rooms: (groupId: number) => api.get<RoomResponse[]>(`/api/groups/${groupId}/chat/rooms`),
  openRoom: (groupId: number, body: CreateRoomRequest) => api.post<RoomResponse>(`/api/groups/${groupId}/chat/rooms`, body),
  messages: (groupId: number, roomId: number) =>
    api.get<MessageResponse[]>(`/api/groups/${groupId}/chat/rooms/${roomId}/messages`),
  send: (groupId: number, roomId: number, body: SendMessageRequest) =>
    api.post<MessageResponse>(`/api/groups/${groupId}/chat/rooms/${roomId}/messages`, body),
  markRead: (groupId: number, roomId: number) => api.post<void>(`/api/groups/${groupId}/chat/rooms/${roomId}/read`),
};

/* ── 알림 설정 ── */
export const notificationApi = {
  get: () => api.get<NotificationSettings>('/api/notifications/settings'),
  update: (body: NotificationSettings) => api.put<NotificationSettings>('/api/notifications/settings', body),
};
