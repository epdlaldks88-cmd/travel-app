import { Link } from "react-router-dom";

// 여행 일수 계산 헬퍼
const calcDays = (start, end) => {
  if (!start || !end) return null;
  const startD = new Date(start);
  const endD = new Date(end);
  const diff = Math.round((endD - startD) / (1000 * 60 * 60 * 24)) + 1;
  return diff > 0 ? `${diff}일` : null;
};

// 날짜 → 영문 대문자 짧게 (예: "2026-06-28" → "JUN 28")
const formatShort = (dateStr) => {
  if (!dateStr) return "";
  const d = new Date(dateStr);
  const months = [
    "JAN",
    "FEB",
    "MAR",
    "APR",
    "MAY",
    "JUN",
    "JUL",
    "AUG",
    "SEP",
    "OCT",
    "NOV",
    "DEC",
  ];
  return `${months[d.getMonth()]} ${d.getDate()}`;
};

// 별점 렌더링 (◆ 채움 + ◆ 빈)
const renderStars = (rating) => {
  if (!rating || rating < 1) return null;
  const filled = "◆".repeat(rating);
  const empty = "◇".repeat(5 - rating);
  return (
    <span className="text-xs">
      <span style={{ color: "#B08D5C" }}>{filled}</span>
      <span style={{ color: "#E8E4D8" }}>{empty}</span>
    </span>
  );
};

function TripCard({ trip, onDelete }) {
  const days = calcDays(trip.startDate, trip.endDate);

  // 날짜 표시: JUN 28 – 30 형식
  const dateDisplay =
    trip.startDate && trip.endDate
      ? `${formatShort(trip.startDate)} – ${new Date(trip.endDate).getDate()}`
      : trip.startDate
        ? formatShort(trip.startDate)
        : "";

  return (
    <div
      className="rounded-xl overflow-hidden"
      style={{
        background: "#FFFFFF",
        border: "0.5px solid #E8E4D8",
      }}
    >
      <Link to={`/trips/${trip.id}`} className="block">
        {/* 커버 그라디언트 (사진 없을 때) */}
        <div
          className="relative"
          style={{
            height: "80px",
            background: "linear-gradient(135deg, #A8C0D6 0%, #6B8AA8 100%)",
          }}
        >
          {/* 여행 기간 뱃지 (좌상단) */}
          {days && (
            <div className="absolute top-2 left-2">
              <span
                className="text-[10px] px-2 py-0.5 rounded-full"
                style={{
                  background: "rgba(255,255,255,0.9)",
                  color: "#3A4A5C",
                }}
              >
                {days}
              </span>
            </div>
          )}
        </div>

        {/* 정보 영역 */}
        <div className="p-3">
          <h3 className="text-base font-medium" style={{ color: "#1E2A38" }}>
            {trip.title}
          </h3>

          <div className="flex justify-between items-center mt-1.5">
            <span
              className="text-xs"
              style={{ color: "#7A8CA0", letterSpacing: "0.3px" }}
            >
              {dateDisplay}
              {trip.companions && ` · ${trip.companions}`}
            </span>
            {renderStars(trip.rating)}
          </div>
        </div>
      </Link>

      {/* 삭제 버튼 (Link 밖에) */}
      <button
        onClick={() => onDelete(trip.id)}
        className="absolute top-2 right-2 text-lg"
        style={{ color: "rgba(255,255,255,0.7)" }}
        title="삭제"
      >
        ✕
      </button>
    </div>
  );
}

export default TripCard;
