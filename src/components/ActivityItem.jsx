// 타입별 아이콘
const typeIcons = {
  방문지: "📍",
  식사: "🍽️",
  이동: "🚗",
  숙박: "🏨",
  기타: "📌",
};

function ActivityItem({ activity, onDelete }) {
  const icon = typeIcons[activity.type] || "📌";

  return (
    <div className="bg-white rounded-xl shadow-sm p-3 flex gap-3">
      {/* 시간 */}
      <div className="text-center min-w-[50px]">
        <div className="text-2xl">{icon}</div>
        {activity.time && (
          <div className="text-xs text-slate-500 mt-1">{activity.time}</div>
        )}
      </div>

      {/* 내용 */}
      <div className="flex-1 min-w-0">
        <div className="flex justify-between items-start gap-2">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs text-blue-500 bg-blue-50 px-2 py-0.5 rounded-full">
                {activity.type}
              </span>
              {activity.rating > 0 && (
                <span className="text-xs text-yellow-500">
                  {"★".repeat(activity.rating)}
                </span>
              )}
            </div>
            <h4 className="font-medium text-slate-800 mt-1">{activity.name}</h4>
            {activity.cost > 0 && (
              <p className="text-sm text-slate-500 mt-0.5">
                💰 {activity.cost.toLocaleString()}원
              </p>
            )}
            {activity.memo && (
              <p className="text-sm text-slate-600 mt-1">{activity.memo}</p>
            )}
          </div>
          <button
            onClick={() => onDelete(activity.id)}
            className="text-slate-300 hover:text-red-500 transition text-sm"
            title="삭제"
          >
            ✕
          </button>
        </div>
      </div>
    </div>
  );
}

export default ActivityItem;
