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
} from "@tabler/icons-react";

const TYPE_ICONS = {
  이동: IconCar,
  방문지: IconMapPin,
  식사: IconToolsKitchen2,
  숙박: IconBuilding,
  렌트카: IconSteeringWheel,
  기타: IconBookmark,
};

// 이동 수단별 아이콘 (이동 Activity 카드에서 사용)
const TRANSPORT_ICONS = {
  자동차: IconCar,
  기차: IconTrain,
  비행기: IconPlane,
  버스: IconBus,
  도보: IconWalk,
  기타: IconRoute,
};

const renderStars = (rating) => {
  if (!rating || rating < 1) return null;
  const filled = "◆".repeat(rating);
  const empty = "◇".repeat(5 - rating);
  return (
    <span style={{ fontSize: "11px" }}>
      <span style={{ color: "#B08D5C" }}>{filled}</span>
      <span style={{ color: "#E8E4D8" }}>{empty}</span>
    </span>
  );
};

const formatDuration = (hours, minutes) => {
  const h = Number(hours) || 0;
  const m = Number(minutes) || 0;
  if (h === 0 && m === 0) return null;
  if (h > 0 && m > 0) return `${h}시간 ${m}분`;
  if (h > 0) return `${h}시간`;
  return `${m}분`;
};

function ActivityItem({ activity, onDelete }) {
  // 카드 아이콘 결정 (이동은 이동수단별로)
  let Icon;
  if (activity.type === "이동") {
    Icon = TRANSPORT_ICONS[activity.transport] || IconCar;
  } else {
    Icon = TYPE_ICONS[activity.type] || IconBookmark;
  }

  // 제목
  const title =
    activity.type === "이동"
      ? `${activity.origin || "?"} → ${activity.destination || "?"}`
      : activity.name;

  // 이동 소요 시간
  const duration =
    activity.type === "이동"
      ? formatDuration(activity.durationHours, activity.durationMinutes)
      : null;

  // 식사 태그
  const mealTags = [];
  if (activity.type === "식사") {
    if (activity.mealType) mealTags.push(activity.mealType);
    if (activity.cuisines && activity.cuisines.length > 0) {
      mealTags.push(...activity.cuisines);
    }
    if (activity.foodTypes && activity.foodTypes.length > 0) {
      mealTags.push(...activity.foodTypes);
    }
  }

  // 숙박 박 수 표시
  const nightsDisplay =
    activity.type === "숙박" && activity.nights ? `${activity.nights}박` : null;

  // 렌트카 기간 표시
  const rentalDaysDisplay =
    activity.type === "렌트카" && activity.days ? `${activity.days}일` : null;

  return (
    <div
      className="rounded-lg p-3 mb-2 relative"
      style={{
        background: "#FFFFFF",
        border: "0.5px solid #E8E4D8",
      }}
    >
      <div className="flex gap-3">
        {/* 시간 · 아이콘 */}
        <div className="flex flex-col items-center gap-1 min-w-[42px]">
          {activity.time && (
            <span style={{ fontSize: "11px", color: "#7A8CA0" }}>
              {activity.time}
            </span>
          )}
          <div
            className="rounded-md flex items-center justify-center"
            style={{
              width: "28px",
              height: "28px",
              background: "#EDE8DA",
            }}
          >
            <Icon size={16} color="#3A4A5C" />
          </div>
        </div>

        {/* 내용 */}
        <div className="flex-1 min-w-0">
          {/* 타입 뱃지 + 부가 뱃지 + 별점 */}
          <div className="flex items-center gap-2 mb-1 flex-wrap">
            <span
              className="px-2 py-0.5 rounded-full text-[10px]"
              style={{ background: "#EDE8DA", color: "#3A4A5C" }}
            >
              {activity.type}
            </span>

            {/* 이동수단 뱃지 (이동일 때) */}
            {activity.type === "이동" && activity.transport && (
              <span
                className="px-2 py-0.5 rounded-full text-[10px]"
                style={{ background: "#F5EFE2", color: "#B08D5C" }}
              >
                {activity.transport}
              </span>
            )}

            {/* 박 수 (숙박) */}
            {nightsDisplay && (
              <span
                className="px-2 py-0.5 rounded-full text-[10px]"
                style={{ background: "#F5EFE2", color: "#B08D5C" }}
              >
                {nightsDisplay}
              </span>
            )}

            {/* 대여 일수 (렌트카) */}
            {rentalDaysDisplay && (
              <span
                className="px-2 py-0.5 rounded-full text-[10px]"
                style={{ background: "#F5EFE2", color: "#B08D5C" }}
              >
                {rentalDaysDisplay}
              </span>
            )}

            {activity.rating > 0 && renderStars(activity.rating)}
          </div>

          {/* 제목 */}
          <h4
            className="font-medium"
            style={{ color: "#1E2A38", fontSize: "14px" }}
          >
            {title}
          </h4>

          {/* 차종 (렌트카) */}
          {activity.type === "렌트카" && activity.carModel && (
            <p style={{ color: "#7A8CA0", fontSize: "11px", marginTop: "2px" }}>
              🚙 {activity.carModel}
            </p>
          )}

          {/* 소요 시간 (이동) */}
          {duration && (
            <p style={{ color: "#7A8CA0", fontSize: "11px", marginTop: "2px" }}>
              소요 {duration}
            </p>
          )}

          {/* 식사 태그 */}
          {mealTags.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-1.5">
              {mealTags.map((tag, i) => (
                <span
                  key={i}
                  className="px-1.5 py-0.5 rounded-full"
                  style={{
                    background: "#F5EFE2",
                    color: "#B08D5C",
                    fontSize: "10px",
                  }}
                >
                  {tag}
                </span>
              ))}
            </div>
          )}

          {/* 식사 세부 */}
          {activity.type === "식사" && activity.foodDetails && (
            <p style={{ color: "#3A4A5C", fontSize: "11px", marginTop: "4px" }}>
              🍴 {activity.foodDetails}
            </p>
          )}

          {/* 위치 */}
          {activity.location && (
            <p
              style={{
                color: "#7A8CA0",
                fontSize: "11px",
                marginTop: "3px",
                display: "flex",
                alignItems: "center",
                gap: "3px",
              }}
            >
              <IconMapPin size={11} />
              {activity.location}
            </p>
          )}

          {/* 체크아웃 (숙박) */}
          {activity.type === "숙박" && activity.checkoutTime && (
            <p style={{ color: "#7A8CA0", fontSize: "11px", marginTop: "2px" }}>
              체크아웃 {activity.checkoutTime}
            </p>
          )}

          {/* 반납 시각 (렌트카) */}
          {activity.type === "렌트카" && activity.returnTime && (
            <p style={{ color: "#7A8CA0", fontSize: "11px", marginTop: "2px" }}>
              반납 {activity.returnTime}
            </p>
          )}

          {/* 비용 */}
          {activity.cost > 0 && (
            <p style={{ color: "#7A8CA0", fontSize: "11px", marginTop: "3px" }}>
              💰 {activity.cost.toLocaleString()}원
            </p>
          )}

          {/* 메모 */}
          {activity.memo && (
            <p style={{ color: "#3A4A5C", fontSize: "12px", marginTop: "4px" }}>
              {activity.memo}
            </p>
          )}
        </div>

        {/* 삭제 */}
        <button
          onClick={() => onDelete(activity.id)}
          className="rounded-full p-1"
          style={{ color: "#A8B4C4" }}
          title="삭제"
        >
          <IconX size={14} />
        </button>
      </div>
    </div>
  );
}

export default ActivityItem;
