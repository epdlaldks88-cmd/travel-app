import { Navigate, Outlet } from "react-router-dom";
import { IconLoader2 } from "@tabler/icons-react";
import { useAuth } from "../lib/useAuth";
import { DataProvider } from "../data/DataProvider";
import BottomTabBar from "./BottomTabBar";
import SyncStatusBar from "./SyncStatusBar";

/**
 * ProtectedLayout
 *
 * 로그인 필수 라우트를 감쌈. 세 가지 상태 처리:
 *   1. 세션 확인 중 → 로딩 화면
 *   2. 미로그인 → /login 리다이렉트
 *   3. 로그인 완료 → DataProvider(동기화 워커) + 페이지 + SyncStatusBar + 탭바
 */
export default function ProtectedLayout() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-bg flex items-center justify-center">
        <IconLoader2 size={32} className="animate-spin text-text-muted" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return (
    <DataProvider>
      <div className="min-h-screen bg-bg pb-[calc(56px+env(safe-area-inset-bottom))]">
        <div className="max-w-2xl mx-auto p-4">
          <Outlet />
        </div>
        <SyncStatusBar />
        <BottomTabBar />
      </div>
    </DataProvider>
  );
}
