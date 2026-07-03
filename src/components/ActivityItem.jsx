import {
  IconCar,
  IconMapPin,
  IconToolsKitchen2,
  IconBuilding,
  IconBookmark,
  IconX,
  IconSteeringWheel,
  IconTrain,
  IconPlane,
  IconBus,
  IconWalk,
  IconRoute,
  IconCoin,
} from "@tabler/icons-react";
import { Rating } from "./ui";

const TYPE_ICONS = {
  이동: IconCar,
  방문지: IconMapPin,
  식사: IconToolsKitchen2,
  숙박: IconBuilding,
  렌트카: IconSteeringWheel,
  기타: IconBookmark,
};

const TRANSPORT_ICONS = {
  자동차: IconCar,
  기차: IconTrain,
  비행기: IconPlane,
  버스: IconBus,
  도보: IconWalk,
  기타: IconRoute,
};

const formatDuration = (hours, minutes) => {
  const h = Number(hours) || 0;
  const m = Number(minutes) || 0;
  if (h === 0 && m === 0) return null;
  if (h > 0 && m > 0) return `${h}시간 ${m}분`;
  if (h > 0) return `${h}시간`;
  return `${m}분`;
};

/**
 * 작은 텍스트 뱃지 (활동 카드 내 타입/이동수단/박수 표시용).
 * Chip 은 폼 선택용이라 오버스펙, 별도 서브컴포넌트로 유지.
 */
function MiniBadge({ variant = "default", children }) {
  const variantMap = {
    default: "bg-surface-alt text-text-muted",
    accent: "bg-accent/10 text-accent",
  };
  return (
    <span
      className={`px-2 py-0.5 rounded-full text-[10px] ${variantMap[variant]}`}
    >
      {children}
    </span>
  );
}

function ActivityItem({ activity, onDelete }) {
  // 좌측 아이콘 결정 (이동은 이동수단별)
  const Icon =
    activity.type === "이동"
      ? TRANSPORT_ICONS[activity.transport] || IconCar
      : TYPE_ICONS[activity.type] || IconBookmark;

  const title =
    activity.type === "이동"
      ? `${activity.origin || "?"} → ${activity.destination || "?"}`
      : activity.name;

  const duration =
    activity.type === "이동"
      ? formatDuration(activity.durationHours, activity.durationMinutes)
      : null;

  // 식사 태그 모음
  const mealTags = [];
  if (activity.type === "식사") {
    if (activity.mealType) mealTags.push(activity.mealType);
    if (activity.cuisines?.length) mealTags.push(...activity.cuisines);
    if (activity.foodTypes?.length) mealTags.push(...activity.foodTypes);
  }

  const nightsDisplay =
    activity.type === "숙박" && activity.nights ? `${activity.nights}박` : null;

  const rentalDaysDisplay =
    activity.type === "렌트카" && activity.days ? `${activity.days}일` : null;

  return (
    <div className="bg-surface border border-border rounded-lg p-3 mb-2 relative">
      <div className="flex gap-3">
        {/* ─── 좌측: 시간 · 아이콘 ─────────────────────── */}
        <div className="flex flex-col items-center gap-1 min-w-[42px]">
          {activity.time && (
            <span className="text-[11px] text-text-muted">{activity.time}</span>
          )}
          <div className="w-7 h-7 rounded-md flex items-center justify-center bg-surface-alt text-text-muted">
            <Icon size={16} />
          </div>
        </div>

        {/* ─── 중앙: 내용 ──────────────────────────────── */}
        <div className="flex-1 min-w-0">
          {/* 타입 · 부가 뱃지 · 별점 */}
          <div className="flex items-center gap-2 mb-1 flex-wrap">
            <MiniBadge>{activity.type}</MiniBadge>

            {activity.type === "이동" && activity.transport && (
              <MiniBadge variant="accent">{activity.transport}</MiniBadge>
            )}

            {nightsDisplay && (
              <MiniBadge variant="accent">{nightsDisplay}</MiniBadge>
            )}

            {rentalDaysDisplay && (
              <MiniBadge variant="accent">{rentalDaysDisplay}</MiniBadge>
            )}

            {activity.rating > 0 && (
              <Rating value={activity.rating} readonly size="sm" />
            )}
          </div>

          {/* 제목 */}
          <h4 className="text-sm font-medium text-text">{title}</h4>

          {/* 차종 (렌트카) */}
          {activity.type === "렌트카" && activity.carModel && (
            <p className="inline-flex items-center gap-1 text-[11px] text-text-muted mt-0.5">
              <IconCar size={11} />
              {activity.carModel}
            </p>
          )}

          {/* 소요 시간 (이동) */}
          {duration && (
            <p className="text-[11px] text-text-muted mt-0.5">
              소요 {duration}
            </p>
          )}

          {/* 식사 태그 */}
          {mealTags.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-1.5">
              {mealTags.map((tag, i) => (
                <span
                  key={i}
                  className="px-1.5 py-0.5 rounded-full text-[10px] bg-accent/10 text-accent"
                >
                  {tag}
                </span>
              ))}
            </div>
          )}

          {/* 식사 세부 */}
          {activity.type === "식사" && activity.foodDetails && (
            <p className="inline-flex items-center gap-1 text-[11px] text-text mt-1">
              <IconToolsKitchen2 size={11} />
              {activity.foodDetails}
            </p>
          )}

          {/* 위치 */}
          {activity.location && (
            <p className="inline-flex items-center gap-1 text-[11px] text-text-muted mt-0.5">
              <IconMapPin size={11} />
              {activity.location}
            </p>
          )}

          {/* 체크아웃 (숙박) */}
          {activity.type === "숙박" && activity.checkoutTime && (
            <p className="text-[11px] text-text-muted mt-0.5">
              체크아웃 {activity.checkoutTime}
            </p>
          )}

          {/* 반납 시각 (렌트카) */}
          {activity.type === "렌트카" && activity.returnTime && (
            <p className="text-[11px] text-text-muted mt-0.5">
              반납 {activity.returnTime}
            </p>
          )}

          {/* 비용 */}
          {activity.cost > 0 && (
            <p className="inline-flex items-center gap-1 text-[11px] text-text-muted mt-0.5">
              <IconCoin size={11} />
              {activity.cost.toLocaleString()}원
            </p>
          )}

          {/* 메모 */}
          {activity.memo && (
            <p className="text-xs text-text mt-1">{activity.memo}</p>
          )}
        </div>

        {/* ─── 우측: 삭제 ─────────────────────────────── */}
        <button
          type="button"
          onClick={() => onDelete(activity.id)}
          aria-label="일정 삭제"
          className="shrink-0 self-start p-1 rounded-full text-text-subtle hover:text-text hover:bg-surface-alt transition-colors"
        >
          <IconX size={14} />
        </button>
      </div>
    </div>
  );
}

export default ActivityItem;
