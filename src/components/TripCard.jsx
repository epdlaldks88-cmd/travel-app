import { Link } from "react-router-dom";
import {
  IconCalendar,
  IconChevronRight,
  IconLoader2,
  IconTrash,
  IconUsers,
} from "@tabler/icons-react";
import { Badge, Card, Rating } from "./ui";
import { calcTripTotal } from "../data/calc";
import { useActivities, useCoverUrl } from "../data/hooks";

/**
 * 단일 여행 카드.
 * 커버 이미지가 있으면 상단 16:9 이미지, 없으면 텍스트만.
 */
function TripCard({ trip, onDelete }) {
  const activities = useActivities(trip.id);
  const totalCost = calcTripTotal(activities);
  const coverUrl = useCoverUrl(trip.coverStoragePath);

  return (
    <Card padding="none" className="overflow-hidden">
      {/* 커버 이미지 (있을 때만) */}
      {coverUrl && (
        <Link to={`/trips/${trip.id}`} className="block relative">
          <div className="aspect-video w-full bg-surface-alt">
            <img
              src={coverUrl}
              alt=""
              className="w-full h-full object-cover"
              loading="lazy"
            />
          </div>
        </Link>
      )}

      {/* 본문 */}
      <div className="p-3 hover:bg-surface-alt transition-colors">
        <Link to={`/trips/${trip.id}`} className="block">
          <div className="flex justify-between items-start gap-3">
            {/* 좌측: 정보 */}
            <div className="flex-1 min-w-0">
              <h3 className="font-heading text-base font-medium text-text mb-1.5 truncate">
                {trip.title}
              </h3>

              {trip.startDate && trip.endDate && (
                <div className="flex items-center gap-1.5 text-xs text-text-muted mb-1">
                  <IconCalendar size={13} />
                  <span>
                    {trip.startDate.replaceAll("-", ".")} –{" "}
                    {trip.endDate.replaceAll("-", ".").slice(5)}
                  </span>
                </div>
              )}

              {trip.companions && (
                <div className="flex items-center gap-1.5 text-xs text-text-muted mb-1">
                  <IconUsers size={13} />
                  <span className="truncate">{trip.companions}</span>
                </div>
              )}

              {/* 뱃지 · 평점 · 지출 */}
              <div className="flex items-center gap-2 flex-wrap mt-2">
                {trip.categories?.map((cat, i) => (
                  <Badge key={i} variant="default">
                    {cat}
                  </Badge>
                ))}
                {trip.rating > 0 && (
                  <Rating value={trip.rating} readonly size="sm" />
                )}
                {totalCost > 0 && (
                  <span className="text-[11px] text-text-muted tabular-nums">
                    {totalCost.toLocaleString()}원
                  </span>
                )}
                {activities === undefined ? (
                  <IconLoader2
                    size={12}
                    className="animate-spin text-text-subtle"
                  />
                ) : (
                  <span className="text-[11px] text-text-subtle">
                    · 일정 {activities.length}개
                  </span>
                )}
              </div>
            </div>

            {/* 우측: 액션 */}
            <div className="flex flex-col items-end gap-1 shrink-0">
              <button
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  onDelete(trip.id);
                }}
                aria-label="여행 삭제"
                className="p-1.5 rounded-full text-text-subtle hover:text-text hover:bg-surface transition-colors"
              >
                <IconTrash size={14} />
              </button>
              <IconChevronRight size={16} className="text-text-subtle" />
            </div>
          </div>
        </Link>
      </div>
    </Card>
  );
}

export default TripCard;
