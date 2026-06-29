// ActiveGroup.tsx — 현재 활성(선택된) 그룹 ID 컨텍스트
// 대부분의 엔드포인트가 groupId 를 받으므로 앱 전역에서 "지금 보는 그룹"을 추적한다.
import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { useGroups } from './hooks';

const STORE_KEY = 'doran.activeGroupId';

interface ActiveGroupCtx {
  groupId: number | null;
  setGroupId: (id: number) => void;
}
const Ctx = createContext<ActiveGroupCtx>({ groupId: null, setGroupId: () => {} });

export function ActiveGroupProvider({ children }: { children: ReactNode }) {
  const [groupId, setGroupIdState] = useState<number | null>(() => {
    const v = localStorage.getItem(STORE_KEY);
    return v ? Number(v) : null;
  });
  const { data: groups } = useGroups();

  // 활성 그룹이 없거나 더 이상 목록에 없으면 첫 그룹으로 보정
  useEffect(() => {
    if (!groups || groups.length === 0) return;
    const exists = groupId != null && groups.some(g => g.id === groupId);
    if (!exists) setGroupIdState(groups[0].id);
  }, [groups, groupId]);

  const setGroupId = (id: number) => {
    setGroupIdState(id);
    localStorage.setItem(STORE_KEY, String(id));
  };

  const value = useMemo(() => ({ groupId, setGroupId }), [groupId]);
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useActiveGroup() {
  return useContext(Ctx);
}

/** groupId 가 보장되어야 하는 화면용 — null 이면 0 반환(쿼리는 enabled 로 제어) */
export function useActiveGroupId(): { groupId: number; ready: boolean } {
  const { groupId } = useActiveGroup();
  return { groupId: groupId ?? 0, ready: groupId != null };
}
