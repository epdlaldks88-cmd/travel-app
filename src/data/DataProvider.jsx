import { useEffect } from 'react';
import { useAuth } from '../lib/useAuth';
import { syncWorker } from './sync';
import { clearLocalData } from './db';

/**
 * DataProvider
 *
 * 로그인 상태에 따라 SyncWorker 시작/정지 담당.
 * - 로그인 → worker 시작 (pull + periodic flush)
 * - 로그아웃 → worker 정지 + 로컬 캐시 삭제 (다른 계정 데이터 안 남게)
 *
 * ProtectedLayout 내부에 두면 로그인 상태에서만 활성.
 * children 만 렌더 (별도 UI 없음).
 */
export function DataProvider({ children }) {
  const { user } = useAuth();
  const userId = user?.id;

  useEffect(() => {
    if (userId) {
      syncWorker.start(userId);
      return () => {
        syncWorker.stop();
        // 로그아웃 (다음 렌더에서 user=null)이면 로컬 데이터 초기화
        clearLocalData().catch((err) =>
          console.error('로컬 데이터 초기화 실패:', err)
        );
      };
    }
  }, [userId]);

  return children;
}
