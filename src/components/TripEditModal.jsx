import { useMemo } from "react";
import { IconX } from "@tabler/icons-react";
import TripForm from "./TripForm";
import { useActivities } from "../data/hooks";

/**
 * 여행 편집 모달.
 * TripForm을 감싸서 초기값 채우고 저장 콜백 처리.
 */
function TripEditModal({ trip, onSubmit, onClose }) {
  const activities = useActivities(trip.id);

  // 편집 시 날짜 범위 밖 액티비티/DayNote 감지 (경고용)
  const outOfRangeCheck = useMemo(() => {
    return (newStart, newEnd) => {
      if (!newStart || !newEnd || !activities) return [];
      return activities.filter((a) => {
        if (!a.date || a.parentActivityId) return false;
        return a.date < newStart || a.date > newEnd;
      });
    };
  }, [activities]);

  const handleSubmit = (payload) => {
    // 날짜 범위 밖 액티비티 경고
    const outOfRange = outOfRangeCheck(payload.startDate, payload.endDate);
    if (outOfRange.length > 0) {
      const ok = confirm(
        `${outOfRange.length}개 일정이 새 여행 기간 밖에 있습니다.\n계속 저장하시겠습니까?\n\n(범위 밖 일정: ${outOfRange
          .slice(0, 3)
          .map((a) => a.name)
          .join(", ")}${outOfRange.length > 3 ? " ..." : ""})`,
      );
      if (!ok) return;
    }

    onSubmit(payload);
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-black/60 flex items-end sm:items-center justify-center overflow-y-auto"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="bg-bg w-full sm:max-w-md sm:rounded-2xl rounded-t-2xl max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-bg px-4 py-3 border-b border-border flex items-center justify-between z-10">
          <h2 className="font-heading text-base font-medium text-text">
            여행 편집
          </h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="닫기"
            className="p-1 rounded-full text-text-muted hover:text-text hover:bg-surface-alt transition-colors"
          >
            <IconX size={18} />
          </button>
        </div>

        <div className="p-4">
          <TripForm
            initialData={trip}
            onSubmit={handleSubmit}
            onCancel={onClose}
          />
        </div>
      </div>
    </div>
  );
}

export default TripEditModal;
