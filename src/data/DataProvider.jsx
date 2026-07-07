import { useEffect, useRef } from "react";
import { useLiveQuery } from "dexie-react-hooks";
import { useAuth } from "../lib/useAuth";
import { syncWorker } from "./sync";
import { clearLocalData, db } from "./db";

/**
 * DataProvider
 *
 * 로그인 상태에 따라 SyncWorker 시작/정지 담당.
 * - 로그인 → worker 시작 (pull + periodic flush)
 * - 명시적 로그아웃 → worker 정지 + 로컬 캐시 삭제
 *
 * ⚠️ 새로고침/언마운트 시엔 clearLocalData 실행하지 않음 (데이터 손실 방지).
 *    이전 userId와 새 userId를 비교해서 로그아웃 감지.
 */
export function DataProvider({ children }) {
  const { user } = useAuth();
  const userId = user?.id;
  const prevUserIdRef = useRef(null);

  // 로그인/로그아웃 관리
  useEffect(() => {
    const prevUserId = prevUserIdRef.current;

    if (userId) {
      // 로그인 or 유저 전환
      syncWorker.start(userId);
    } else if (prevUserId) {
      // 명시적 로그아웃 (이전에 userId 있었는데 지금 없음)
      syncWorker.stop();
      clearLocalData().catch((err) =>
        console.error("[DataProvider] 로컬 데이터 초기화 실패:", err),
      );
    }

    prevUserIdRef.current = userId;
  }, [userId]);

  // beforeunload 경고 (pending 큐 있을 때 새로고침/탭 닫기 방지)
  const pending = useLiveQuery(() => db.sync_queue.count(), [], 0);

  useEffect(() => {
    if (pending === 0) return;

    const handler = (e) => {
      e.preventDefault();
      // Chrome은 returnValue, Firefox는 반환값 필요
      e.returnValue = "";
      return "";
    };

    window.addEventListener("beforeunload", handler);
    return () => window.removeEventListener("beforeunload", handler);
  }, [pending]);

  return children;
}
