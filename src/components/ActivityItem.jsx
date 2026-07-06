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
  IconArrowNarrowRight,
} from "@tabler/icons-react";
import { Rating } from "./ui";

const TYPE_ICONS = {
  관광지: IconMapPin,
  식당: IconToolsKitchen2,
  숙소: IconBuilding,
  렌트카: IconSteeringWheel,
  기타: IconBookmark,
};

const TRANSPORT_ICONS = {
  도보: IconWalk,
  자차: IconCar,
  택시: IconCar,
  버스: IconBus,
  지하철: IconTrain,
  기차: IconTrain,
  비행기: IconPlane,
  렌트카: IconSteeringWheel,
  기타: IconRoute,
};

/**
 * 소요 시간 포맷: "3시간 20분" / "3시간" / "20분" / null
 */
function formatDuration(hours, minutes) {
  const h = Number(hours) || 0;
  const m = Number(minutes) || 0;
  if (h === 0 && m === 0) return null;
  if (h > 0 && m > 0) return `${h}시간 ${m}분`;
  if (h > 0) return `${h}시간`;
  return `${m}분`;
}

/**
 * 이동 정보가 하나라도 있는지
 */
function hasMovementInfo(a) {
  return (
    a.origin ||
    a.transport ||
    (a.durationHours && Number(a.durationHours) > 0) ||
    (a.durationMinutes && Number(a.durationMinutes) > 0) ||
    (a.distanceKm && Number(a.distanceKm) > 0)
  );
}

/**
 * 파일 내 서브컴포넌트: 작은 텍스트 뱃지
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
  const Icon = TYPE_ICONS[activity.type] || IconBookmark;
  const TransportIcon = activity.transport
    ? TRANSPORT_ICONS[activity.transport]
    : null;

  const duration = formatDuration(
    activity.durationHours,
    activity.durationMinutes,
  );
  const hasMovement = hasMovementInfo(activity);

  // 식당 태그
  const mealTags = [];
  if (activity.type === "식당") {
    if (activity.mealType) mealTags.push(activity.mealType);
    if (activity.cuisines?.length) mealTags.push(...activity.cuisines);
    if (activity.foodTypes?.length) mealTags.push(...activity.foodTypes);
  }

  const nightsDisplay =
    activity.type === "숙소" && activity.nights ? `${activity.nights}박` : null;

  const rentalDaysDisplay =
    activity.type === "렌트카" && activity.days ? `${activity.days}일` : null;

  return (
    <div className="bg-surface border border-border rounded-lg p-3 mb-2 relative">
      <div className="flex gap-3">
        {/* ─── 좌측: 시간 · 타입 아이콘 ────────────────── */}
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

          {/* 제목 (장소 이름) */}
          <h4 className="font-heading text-sm font-medium text-text">
            {activity.name}
          </h4>

          {/* ─── 이동 정보 (한 블록) ─────────────────── */}
          {hasMovement && (
            <div className="mt-1.5 flex items-center gap-1.5 flex-wrap text-[11px] text-text-muted">
              {activity.origin && (
                <>
                  <span className="text-text">{activity.origin}</span>
                  <IconArrowNarrowRight
                    size={12}
                    className="text-text-subtle"
                  />
                </>
              )}
              {TransportIcon && <TransportIcon size={12} />}
              {activity.transport && <span>{activity.transport}</span>}
              {duration && (
                <>
                  {activity.transport && (
                    <span className="text-text-subtle">·</span>
                  )}
                  <span>{duration}</span>
                </>
              )}
              {activity.distanceKm > 0 && (
                <>
                  <span className="text-text-subtle">·</span>
                  <span>{activity.distanceKm}km</span>
                </>
              )}
            </div>
          )}

          {/* 차종 (렌트카) */}
          {activity.type === "렌트카" && activity.carModel && (
            <p className="inline-flex items-center gap-1 text-[11px] text-text-muted mt-1">
              <IconCar size={11} />
              {activity.carModel}
            </p>
          )}

          {/* 식당 태그 */}
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

          {/* 식당 세부 */}
          {activity.type === "식당" && activity.foodDetails && (
            <p className="inline-flex items-center gap-1 text-[11px] text-text mt-1">
              <IconToolsKitchen2 size={11} />
              {activity.foodDetails}
            </p>
          )}

          {/* 위치 */}
          {activity.location && (
            <p className="inline-flex items-center gap-1 text-[11px] text-text-muted mt-1">
              <IconMapPin size={11} />
              {activity.location}
            </p>
          )}

          {/* 체크아웃 (숙소) */}
          {activity.type === "숙소" && activity.checkoutTime && (
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
