import { Link } from "react-router-dom";
import { IconX, IconMapPin } from "@tabler/icons-react";
import { Rating } from "./ui";

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

// 지역 표시 헬퍼
const getRegionLabel = (trip) => {
  if (trip.countryType === "international") {
    return trip.countryName || "";
  }
  const major = trip.regionMajor || "";
  const minor = trip.regionMinor || "";
  if (major && minor) {
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

  const countryBadge =
    trip.countryType === "international" && trip.countryName
      ? trip.countryName
      : trip.countryType === "international"
        ? "해외"
        : "국내";

  const displayCategories = (trip.categories || []).slice(0, 2);
  const regionLabel = getRegionLabel(trip);

  return (
    <div className="relative bg-surface border border-border rounded-xl overflow-hidden">
      <Link to={`/trips/${trip.id}`} className="block">
        {/* 상단 썸네일 영역 (임시 그라디언트, 향후 실제 이미지로 교체 예정) */}
        <div className="relative h-[90px] bg-gradient-to-br from-[#A8C0D6] to-[#6B8AA8]">
          {/* 카테고리 (좌상단) */}
          {displayCategories.length > 0 && (
            <div className="absolute top-2 left-2 flex gap-1">
              {displayCategories.map((cat) => (
                <span
                  key={cat}
                  className="text-[10px] px-2 py-0.5 rounded-full bg-white/90 text-[#3A4A5C]"
                >
                  {cat}
                </span>
              ))}
            </div>
          )}

          {/* 여행 기간 (좌하단) */}
          {days && (
            <div className="absolute bottom-2 left-2">
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-white/90 text-[#3A4A5C]">
                {days}
              </span>
            </div>
          )}

          {/* 나라 뱃지 (우하단) */}
          <div className="absolute bottom-2 right-2">
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-black/30 text-white">
              {countryBadge}
            </span>
          </div>
        </div>

        {/* 정보 영역 */}
        <div className="p-3">
          <h3 className="text-base font-medium text-text">{trip.title}</h3>

          {regionLabel && (
            <p className="inline-flex items-center gap-0.5 text-xs mt-1 text-text-muted">
              <IconMapPin size={12} />
              {regionLabel}
            </p>
          )}

          <div className="flex justify-between items-center mt-1.5">
            <span className="text-xs text-text-muted tracking-wide">
              {dateDisplay}
              {trip.companions && ` · ${trip.companions}`}
            </span>
            {trip.rating > 0 && (
              <Rating value={trip.rating} readonly size="sm" />
            )}
          </div>
        </div>
      </Link>

      {/* 삭제 버튼 (썸네일 우상단에 겹침) */}
      <button
        type="button"
        onClick={(e) => {
          e.preventDefault();
          onDelete(trip.id);
        }}
        aria-label="여행 삭제"
        className="absolute top-1.5 right-1.5 w-6 h-6 rounded-full flex items-center justify-center text-white/70 hover:text-white hover:bg-black/20 transition-colors"
      >
        <IconX size={16} />
      </button>
    </div>
  );
}

export default TripCard;
