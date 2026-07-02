import { Link } from "react-router-dom";

const calcDays = (start, end) => {
  if (!start || !end) return null;
  const startD = new Date(start);
  const endD = new Date(end);
  const diff = Math.round((endD - startD) / (1000 * 60 * 60 * 24)) + 1;
  return diff > 0 ? `${diff}일` : null;
};

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

// 지역 표시 헬퍼
const getRegionLabel = (trip) => {
  if (trip.countryType === "international") {
    return trip.countryName || "";
  }
  // 국내: 광역 · 세부 (세부 있으면)
  const major = trip.regionMajor || "";
  const minor = trip.regionMinor || "";
  if (major && minor) {
    // "강원 전체" 같은 건 세부지역 표시 안 함
    if (minor.endsWith("전체")) return major;
    return `${major} · ${minor}`;
  }
  return major;
};

function TripCard({ trip, onDelete }) {
  const days = calcDays(trip.startDate, trip.endDate);

  const dateDisplay =
    trip.startDate && trip.endDate
      ? `${formatShort(trip.startDate)} – ${new Date(trip.endDate).getDate()}`
      : trip.startDate
        ? formatShort(trip.startDate)
        : "";

  // 나라 뱃지
  const countryBadge =
    trip.countryType === "international" && trip.countryName
      ? trip.countryName
      : trip.countryType === "international"
        ? "해외"
        : "국내";

  const displayCategories = (trip.categories || []).slice(0, 2);
  const regionLabel = getRegionLabel(trip);

  return (
    <div
      className="rounded-xl overflow-hidden relative"
      style={{
        background: "#FFFFFF",
        border: "0.5px solid #E8E4D8",
      }}
    >
      <Link to={`/trips/${trip.id}`} className="block">
        <div
          className="relative"
          style={{
            height: "90px",
            background: "linear-gradient(135deg, #A8C0D6 0%, #6B8AA8 100%)",
          }}
        >
          {/* 카테고리 (좌상단) */}
          {displayCategories.length > 0 && (
            <div className="absolute top-2 left-2 flex gap-1">
              {displayCategories.map((cat) => (
                <span
                  key={cat}
                  className="text-[10px] px-2 py-0.5 rounded-full"
                  style={{
                    background: "rgba(255,255,255,0.9)",
                    color: "#3A4A5C",
                  }}
                >
                  {cat}
                </span>
              ))}
            </div>
          )}

          {/* 나라 뱃지 (우하단) */}
          <div className="absolute bottom-2 right-2">
            <span
              className="text-[10px] px-2 py-0.5 rounded-full"
              style={{
                background: "rgba(0,0,0,0.3)",
                color: "#FFFFFF",
              }}
            >
              {countryBadge}
            </span>
          </div>

          {/* 여행 기간 (좌하단) */}
          {days && (
            <div className="absolute bottom-2 left-2">
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

          {/* 지역 (있으면) */}
          {regionLabel && (
            <p className="text-xs mt-1" style={{ color: "#7A8CA0" }}>
              📍 {regionLabel}
            </p>
          )}

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

      {/* 삭제 */}
      <button
        onClick={(e) => {
          e.preventDefault();
          onDelete(trip.id);
        }}
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
