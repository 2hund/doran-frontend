// queryClient.ts — React Query 클라이언트 + 쿼리 키 팩토리
import { QueryClient } from '@tanstack/react-query';
import { ApiError } from './client';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: (count, err) => {
        // 인증/권한 오류는 재시도 무의미
        if (err instanceof ApiError && [401, 403, 404].includes(err.status)) return false;
        return count < 2;
      },
      staleTime: 30_000,
      refetchOnWindowFocus: false,
    },
  },
});

/** 쿼리 키 팩토리 — 무효화 일관성 유지 */
export const qk = {
  me: ['me'] as const,
  groups: ['groups'] as const,
  group: (gid: number) => ['group', gid] as const,
  members: (gid: number) => ['group', gid, 'members'] as const,
  member: (gid: number, uid: number) => ['group', gid, 'members', uid] as const,
  requests: (gid: number) => ['group', gid, 'requests'] as const,
  schedules: (gid: number) => ['group', gid, 'schedules'] as const,
  schedule: (gid: number, eid: number) => ['group', gid, 'schedules', eid] as const,
  tasks: (gid: number) => ['group', gid, 'tasks'] as const,
  task: (gid: number, tid: number) => ['group', gid, 'tasks', tid] as const,
  news: (gid: number) => ['group', gid, 'news'] as const,
  post: (gid: number, pid: number) => ['group', gid, 'news', pid] as const,
  rooms: (gid: number) => ['group', gid, 'rooms'] as const,
  messages: (gid: number, rid: number) => ['group', gid, 'rooms', rid, 'messages'] as const,
  notifSettings: ['notifSettings'] as const,
};
