import { IconCloudOff, IconRefresh, IconClock } from "@tabler/icons-react";
import { useSyncStatus } from "../data/hooks";

/**
 * SyncStatusBar
 *
 * 하단 탭바 위에 얇게 표시되는 동기화 상태.
 * 온라인 + 큐 비어있으면 안 보임.
 *
 * 표시 조건:
 *   - 오프라인 → "오프라인" + 대기 개수
 *   - 온라인 & flushing → "동기화 중" (아이콘 회전) + 대기 개수
 *   - 온라인 & 대기 있음 & 아이들 → "동기화 대기" (아이콘 정지)
 */
export default function SyncStatusBar() {
  const { pending, online, isFlushing } = useSyncStatus();

  if (online && pending === 0) return null;

  return (
    <div className="fixed left-0 right-0 z-10 bottom-[calc(56px+env(safe-area-inset-bottom))] bg-surface-alt border-t border-border">
      <div className="max-w-2xl mx-auto px-4 py-2 flex items-center gap-2 text-xs">
        {!online ? (
          <>
            <IconCloudOff size={14} className="text-danger" />
            <span className="text-text-muted">오프라인</span>
            {pending > 0 && (
              <span className="text-text-subtle ml-auto">
                {pending}개 대기 중
              </span>
            )}
          </>
        ) : isFlushing ? (
          <>
            <IconRefresh size={14} className="text-text-muted animate-spin" />
            <span className="text-text-muted">동기화 중</span>
            <span className="text-text-subtle ml-auto">
              {pending}개 대기 중
            </span>
          </>
        ) : (
          <>
            <IconClock size={14} className="text-text-muted" />
            <span className="text-text-muted">동기화 대기</span>
            <span className="text-text-subtle ml-auto">
              {pending}개 대기 중
            </span>
          </>
        )}
      </div>
    </div>
  );
}
