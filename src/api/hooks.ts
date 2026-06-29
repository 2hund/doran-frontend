// hooks.ts — 도메인별 React Query 훅 (쿼리 + 뮤테이션)
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { qk } from './queryClient';
import {
  authApi, userApi, groupApi, scheduleApi, taskApi, newsApi, chatApi, notificationApi,
} from './endpoints';
import type {
  KakaoLoginRequest, AppleLoginRequest, UpdateUserRequest,
  CreateGroupRequest, UpdateGroupRequest, JoinByCodeRequest, RoleRequest,
  NicknameRequest, GroupNicknameRequest,
  CreateScheduleRequest, CreateTaskRequest, UpdateTaskRequest, CertifyRequest,
  CreatePostRequest, CommentRequest, CheerRequest,
  CreateRoomRequest, SendMessageRequest, NotificationSettings,
} from './types';

/* ── 인증 ── */
export function useKakaoLogin() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: KakaoLoginRequest) => authApi.kakao(body),
    onSuccess: () => qc.invalidateQueries(),
  });
}
export function useAppleLogin() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: AppleLoginRequest) => authApi.apple(body),
    onSuccess: () => qc.invalidateQueries(),
  });
}
export function useLogout() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: () => authApi.logout(),
    onSuccess: () => qc.clear(),
  });
}

/* ── 사용자 ── */
export function useMe(enabled = true) {
  return useQuery({ queryKey: qk.me, queryFn: userApi.me, enabled });
}
export function useUpdateMe() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: UpdateUserRequest) => userApi.update(body),
    onSuccess: () => qc.invalidateQueries({ queryKey: qk.me }),
  });
}
export function useWithdraw() {
  const qc = useQueryClient();
  return useMutation({ mutationFn: () => userApi.withdraw(), onSuccess: () => qc.clear() });
}

/* ── 그룹 ── */
export function useGroups() {
  return useQuery({ queryKey: qk.groups, queryFn: groupApi.list });
}
export function useGroup(groupId: number | null) {
  return useQuery({
    queryKey: qk.group(groupId ?? 0),
    queryFn: () => groupApi.detail(groupId!),
    enabled: groupId != null,
  });
}
export function useCreateGroup() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: CreateGroupRequest) => groupApi.create(body),
    onSuccess: () => qc.invalidateQueries({ queryKey: qk.groups }),
  });
}
export function useUpdateGroup(groupId: number) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: UpdateGroupRequest) => groupApi.update(groupId, body),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: qk.group(groupId) });
      qc.invalidateQueries({ queryKey: qk.groups });
    },
  });
}
export function useDeleteGroup() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (groupId: number) => groupApi.remove(groupId),
    onSuccess: () => qc.invalidateQueries({ queryKey: qk.groups }),
  });
}
export function useJoinGroup() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: JoinByCodeRequest) => groupApi.join(body),
    onSuccess: () => qc.invalidateQueries({ queryKey: qk.groups }),
  });
}
export function useLeaveGroup() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (groupId: number) => groupApi.leave(groupId),
    onSuccess: () => qc.invalidateQueries({ queryKey: qk.groups }),
  });
}
export function useRegenerateCode(groupId: number) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: () => groupApi.regenerateCode(groupId),
    onSuccess: () => qc.invalidateQueries({ queryKey: qk.group(groupId) }),
  });
}

/* ── 멤버 ── */
export function useMembers(groupId: number | null) {
  return useQuery({
    queryKey: qk.members(groupId ?? 0),
    queryFn: () => groupApi.members(groupId!),
    enabled: groupId != null,
  });
}
export function useMember(groupId: number | null, userId: number | null) {
  return useQuery({
    queryKey: qk.member(groupId ?? 0, userId ?? 0),
    queryFn: () => groupApi.member(groupId!, userId!),
    enabled: groupId != null && userId != null,
  });
}
export function useKickMember(groupId: number) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (userId: number) => groupApi.kickMember(groupId, userId),
    onSuccess: () => qc.invalidateQueries({ queryKey: qk.members(groupId) }),
  });
}
export function useSetRole(groupId: number) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ userId, body }: { userId: number; body: RoleRequest }) => groupApi.setRole(groupId, userId, body),
    onSuccess: () => qc.invalidateQueries({ queryKey: qk.members(groupId) }),
  });
}
export function useSetNickname(groupId: number) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ userId, body }: { userId: number; body: NicknameRequest }) => groupApi.setNickname(groupId, userId, body),
    onSuccess: () => qc.invalidateQueries({ queryKey: qk.members(groupId) }),
  });
}
export function useSetGroupNickname(groupId: number) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ userId, body }: { userId: number; body: GroupNicknameRequest }) =>
      groupApi.setGroupNickname(groupId, userId, body),
    onSuccess: () => qc.invalidateQueries({ queryKey: qk.members(groupId) }),
  });
}

/* ── 가입 요청 ── */
export function useJoinRequests(groupId: number | null) {
  return useQuery({
    queryKey: qk.requests(groupId ?? 0),
    queryFn: () => groupApi.requests(groupId!),
    enabled: groupId != null,
  });
}
export function useAcceptRequest(groupId: number) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (requestId: number) => groupApi.acceptRequest(groupId, requestId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: qk.requests(groupId) });
      qc.invalidateQueries({ queryKey: qk.members(groupId) });
    },
  });
}
export function useDenyRequest(groupId: number) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (requestId: number) => groupApi.denyRequest(groupId, requestId),
    onSuccess: () => qc.invalidateQueries({ queryKey: qk.requests(groupId) }),
  });
}

/* ── 일정 ── */
export function useSchedules(groupId: number | null) {
  return useQuery({
    queryKey: qk.schedules(groupId ?? 0),
    queryFn: () => scheduleApi.list(groupId!),
    enabled: groupId != null,
  });
}
export function useSchedule(groupId: number | null, eventId: number | null) {
  return useQuery({
    queryKey: qk.schedule(groupId ?? 0, eventId ?? 0),
    queryFn: () => scheduleApi.detail(groupId!, eventId!),
    enabled: groupId != null && eventId != null,
  });
}
export function useCreateSchedule(groupId: number) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: CreateScheduleRequest) => scheduleApi.create(groupId, body),
    onSuccess: () => qc.invalidateQueries({ queryKey: qk.schedules(groupId) }),
  });
}
export function useUpdateSchedule(groupId: number) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ eventId, body }: { eventId: number; body: Partial<CreateScheduleRequest> }) =>
      scheduleApi.update(groupId, eventId, body),
    onSuccess: () => qc.invalidateQueries({ queryKey: qk.schedules(groupId) }),
  });
}
export function useDeleteSchedule(groupId: number) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (eventId: number) => scheduleApi.remove(groupId, eventId),
    onSuccess: () => qc.invalidateQueries({ queryKey: qk.schedules(groupId) }),
  });
}

/* ── 숙제 ── */
export function useTasks(groupId: number | null) {
  return useQuery({
    queryKey: qk.tasks(groupId ?? 0),
    queryFn: () => taskApi.list(groupId!),
    enabled: groupId != null,
  });
}
export function useTask(groupId: number | null, taskId: number | null) {
  return useQuery({
    queryKey: qk.task(groupId ?? 0, taskId ?? 0),
    queryFn: () => taskApi.detail(groupId!, taskId!),
    enabled: groupId != null && taskId != null,
  });
}
export function useCreateTask(groupId: number) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: CreateTaskRequest) => taskApi.create(groupId, body),
    onSuccess: () => qc.invalidateQueries({ queryKey: qk.tasks(groupId) }),
  });
}
export function useUpdateTask(groupId: number) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ taskId, body }: { taskId: number; body: UpdateTaskRequest }) => taskApi.update(groupId, taskId, body),
    onSuccess: () => qc.invalidateQueries({ queryKey: qk.tasks(groupId) }),
  });
}
export function useDeleteTask(groupId: number) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (taskId: number) => taskApi.remove(groupId, taskId),
    onSuccess: () => qc.invalidateQueries({ queryKey: qk.tasks(groupId) }),
  });
}
export function useCertifyTask(groupId: number) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ taskId, body }: { taskId: number; body: CertifyRequest }) => taskApi.certify(groupId, taskId, body),
    onSuccess: (_d, v) => {
      qc.invalidateQueries({ queryKey: qk.tasks(groupId) });
      qc.invalidateQueries({ queryKey: qk.task(groupId, v.taskId) });
    },
  });
}

/* ── 소식 ── */
export function useNewsFeed(groupId: number | null) {
  return useQuery({
    queryKey: qk.news(groupId ?? 0),
    queryFn: () => newsApi.feed(groupId!),
    enabled: groupId != null,
  });
}
export function usePost(groupId: number | null, postId: number | null) {
  return useQuery({
    queryKey: qk.post(groupId ?? 0, postId ?? 0),
    queryFn: () => newsApi.detail(groupId!, postId!),
    enabled: groupId != null && postId != null,
  });
}
export function useCreatePost(groupId: number) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: CreatePostRequest) => newsApi.create(groupId, body),
    onSuccess: () => qc.invalidateQueries({ queryKey: qk.news(groupId) }),
  });
}
export function useDeletePost(groupId: number) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (postId: number) => newsApi.remove(groupId, postId),
    onSuccess: () => qc.invalidateQueries({ queryKey: qk.news(groupId) }),
  });
}
export function useAddComment(groupId: number) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ postId, body }: { postId: number; body: CommentRequest }) => newsApi.comment(groupId, postId, body),
    onSuccess: (_d, v) => {
      qc.invalidateQueries({ queryKey: qk.post(groupId, v.postId) });
      qc.invalidateQueries({ queryKey: qk.news(groupId) });
    },
  });
}
export function useDeleteComment(groupId: number) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ postId, commentId }: { postId: number; commentId: number }) =>
      newsApi.deleteComment(groupId, postId, commentId),
    onSuccess: (_d, v) => qc.invalidateQueries({ queryKey: qk.post(groupId, v.postId) }),
  });
}
export function useSendCheer(groupId: number) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ postId, body }: { postId: number; body: CheerRequest }) => newsApi.cheer(groupId, postId, body),
    onSuccess: (_d, v) => {
      qc.invalidateQueries({ queryKey: qk.post(groupId, v.postId) });
      qc.invalidateQueries({ queryKey: qk.news(groupId) });
    },
  });
}
export function useCancelCheer(groupId: number) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (postId: number) => newsApi.cancelCheer(groupId, postId),
    onSuccess: (_d, postId) => {
      qc.invalidateQueries({ queryKey: qk.post(groupId, postId) });
      qc.invalidateQueries({ queryKey: qk.news(groupId) });
    },
  });
}

/* ── 대화 ── */
export function useRooms(groupId: number | null) {
  return useQuery({
    queryKey: qk.rooms(groupId ?? 0),
    queryFn: () => chatApi.rooms(groupId!),
    enabled: groupId != null,
  });
}
export function useMessages(groupId: number | null, roomId: number | null) {
  return useQuery({
    queryKey: qk.messages(groupId ?? 0, roomId ?? 0),
    queryFn: () => chatApi.messages(groupId!, roomId!),
    enabled: groupId != null && roomId != null,
    refetchInterval: 5000, // 폴링으로 신규 메시지 반영
  });
}
export function useOpenRoom(groupId: number) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: CreateRoomRequest) => chatApi.openRoom(groupId, body),
    onSuccess: () => qc.invalidateQueries({ queryKey: qk.rooms(groupId) }),
  });
}
export function useSendMessage(groupId: number, roomId: number) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: SendMessageRequest) => chatApi.send(groupId, roomId, body),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: qk.messages(groupId, roomId) });
      qc.invalidateQueries({ queryKey: qk.rooms(groupId) });
    },
  });
}
export function useMarkRead(groupId: number) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (roomId: number) => chatApi.markRead(groupId, roomId),
    onSuccess: () => qc.invalidateQueries({ queryKey: qk.rooms(groupId) }),
  });
}

/* ── 알림 설정 ── */
export function useNotifSettings(enabled = true) {
  return useQuery({ queryKey: qk.notifSettings, queryFn: notificationApi.get, enabled });
}
export function useUpdateNotifSettings() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: NotificationSettings) => notificationApi.update(body),
    onSuccess: () => qc.invalidateQueries({ queryKey: qk.notifSettings }),
  });
}
