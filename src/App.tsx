import { useEffect } from 'react';
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import { QueryClientProvider } from '@tanstack/react-query';
import { queryClient } from './api/queryClient';
import { ActiveGroupProvider } from './api/ActiveGroup';
import { UnauthorizedBridge, RequireAuth } from './api/AuthGuard';
import {
  DoranMain, DoranGroupHub, DoranTasks, DoranTaskPage, DoranNewTask,
  DoranRanking, DoranReport, DoranEmpty,
} from './screens/doran';
import { CalList, CalDetail, CalForm, CalEmpty } from './screens/schedule';
import { NewsFeed, NewsDetail, NewsChatList, NewsChat, NewsEmpty } from './screens/news';
import { GrpList, GrpHome, GrpMembers, GrpMemberDetail, GrpEdit, GrpRequests, GrpLeave } from './screens/group';
import { MyHome, MyProfileEdit, MyStats, MySettings, MyNotifSettings } from './screens/my';
import { AuthFlow } from './screens/auth';
import { KakaoCallback } from './screens/KakaoCallback';

/* 라우트 전환 시 스크롤 상단으로 */
function ScrollTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    document.querySelector('.scroll')?.scrollTo(0, 0);
  }, [pathname]);
  return null;
}

/* 로그인 필요한 앱 본체 — 인증/그룹 컨텍스트로 감싼다 */
function AppRoutes() {
  return (
    <RequireAuth>
      <ActiveGroupProvider>
        <Routes>
          {/* 도란도란 메인 탭 */}
          <Route path="/" element={<DoranMain />} />

          {/* 일정 탭 */}
          <Route path="/schedule" element={<CalList />} />
          <Route path="/schedule/detail" element={<CalDetail />} />
          <Route path="/schedule/new" element={<CalForm />} />
          <Route path="/schedule/empty" element={<CalEmpty />} />

          {/* 소식 탭 */}
          <Route path="/news" element={<NewsFeed />} />
          <Route path="/news/detail" element={<NewsDetail />} />
          <Route path="/news/chats" element={<NewsChatList />} />
          <Route path="/news/chat" element={<NewsChat />} />
          <Route path="/news/empty" element={<NewsEmpty />} />

          {/* 그룹관리 탭 */}
          <Route path="/group" element={<GrpList />} />
          <Route path="/group/home" element={<GrpHome />} />
          <Route path="/group/members" element={<GrpMembers />} />
          <Route path="/group/member" element={<GrpMemberDetail />} />
          <Route path="/group/edit" element={<GrpEdit />} />
          <Route path="/group/invite" element={<GrpMembers />} />
          <Route path="/group/requests" element={<GrpRequests />} />
          <Route path="/group/leave" element={<GrpLeave />} />
          {/* 그룹 건강 허브 (메인에서 이동) */}
          <Route path="/group/hub" element={<DoranGroupHub />} />
          <Route path="/group/tasks" element={<DoranTasks />} />
          <Route path="/group/task" element={<DoranTaskPage />} />
          <Route path="/group/task/new" element={<DoranNewTask />} />
          <Route path="/group/task/empty" element={<DoranEmpty />} />
          <Route path="/group/ranking" element={<DoranRanking />} />
          <Route path="/group/report" element={<DoranReport />} />

          {/* MY 탭 */}
          <Route path="/my" element={<MyHome />} />
          <Route path="/my/profile" element={<MyProfileEdit />} />
          <Route path="/my/report" element={<MyStats />} />
          <Route path="/my/settings" element={<MySettings />} />
          <Route path="/my/notif" element={<MyNotifSettings />} />

          <Route path="*" element={<DoranMain />} />
        </Routes>
      </ActiveGroupProvider>
    </RequireAuth>
  );
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <UnauthorizedBridge />
        <div className="app-shell">
          <div className="app-frame">
            <ScrollTop />
            <Routes>
              {/* 인증 (비보호) */}
              <Route path="/auth" element={<AuthFlow />} />
              <Route path="/oauth/kakao" element={<KakaoCallback />} />
              {/* 그 외 전부 보호 라우트 */}
              <Route path="/*" element={<AppRoutes />} />
            </Routes>
          </div>
        </div>
      </BrowserRouter>
    </QueryClientProvider>
  );
}
