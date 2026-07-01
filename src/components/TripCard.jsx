import { Link } from "react-router-dom";

// 여행 일수 계산 헬퍼
const calcDays = (start, end) => {
  if (!start || !end) return null;
  const startD = new Date(start);
  const endD = new Date(end);
  const diff = Math.round((endD - startD) / (1000 * 60 * 60 * 24)) + 1;
  return diff > 0 ? `${diff}일` : null;
};

function TripCard({ trip, onDelete }) {
  const days = calcDays(trip.startDate, trip.endDate);

  return (
    <div className="bg-white rounded-2xl shadow-sm p-4 hover:shadow-md transition">
      <div className="flex justify-between items-start">
        {/* Link로 감싸서 클릭 시 상세 페이지로 */}
        <Link to={`/trips/${trip.id}`} className="flex-1 min-w-0">
          <h3 className="font-semibold text-slate-800">
            {trip.title}
            {days && (
              <span className="ml-2 text-xs font-normal text-blue-500 bg-blue-50 px-2 py-0.5 rounded-full">
                {days}
              </span>
            )}
            {trip.rating > 0 && (
              <span className="ml-2 text-xs font-normal text-yellow-500">
                {"★".repeat(trip.rating)}
              </span>
            )}
          </h3>
          {(trip.startDate || trip.endDate) && (
            <p className="text-sm text-slate-500 mt-1">
              📅 {trip.startDate} ~ {trip.endDate}
            </p>
          )}
          {trip.companions && (
            <p className="text-sm text-slate-500">👥 {trip.companions}</p>
          )}
        </Link>

        {/* 삭제 버튼은 Link 밖에 */}
        <button
          onClick={() => onDelete(trip.id)}
          className="ml-3 text-slate-300 hover:text-red-500 transition text-xl"
          title="삭제"
        >
          ✕
        </button>
      </div>
    </div>
  );
}

export default TripCard;
