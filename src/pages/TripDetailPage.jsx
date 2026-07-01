import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import ActivityForm from "../components/ActivityForm";
import ActivityItem from "../components/ActivityItem";

function TripDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [trip, setTrip] = useState(null);
  const [memo, setMemo] = useState("");
  const [rating, setRating] = useState(0);
  const [activities, setActivities] = useState([]);
  const [showActivityForm, setShowActivityForm] = useState(false);

  // 처음 불러오기
  useEffect(() => {
    const saved = localStorage.getItem("trips");
    if (!saved) return;

    const trips = JSON.parse(saved);
    const found = trips.find((t) => String(t.id) === id);

    if (found) {
      setTrip(found);
      setMemo(found.memo || "");
      setRating(found.rating || 0);
      setActivities(found.activities || []);
    }
  }, [id]);

  // 저장 헬퍼 (localStorage 갱신)
  const saveToStorage = (updates) => {
    const saved = localStorage.getItem("trips");
    const trips = saved ? JSON.parse(saved) : [];

    const updated = trips.map((t) =>
      String(t.id) === id ? { ...t, ...updates } : t,
    );

    localStorage.setItem("trips", JSON.stringify(updated));
  };

  // Activity 추가
  const handleAddActivity = (newActivity) => {
    const newActivities = [...activities, newActivity];
    setActivities(newActivities);
    saveToStorage({ activities: newActivities });
    setShowActivityForm(false);
  };

  // Activity 삭제
  const handleDeleteActivity = (activityId) => {
    if (!confirm("이 일정을 삭제하시겠습니까?")) return;
    const newActivities = activities.filter((a) => a.id !== activityId);
    setActivities(newActivities);
    saveToStorage({ activities: newActivities });
  };

  // 여행 정보 저장 (평점 · 메모)
  const handleSave = () => {
    saveToStorage({ memo, rating });
    alert("저장되었습니다");
  };

  // 총 지출 계산
  const totalCost = activities.reduce((sum, a) => sum + (a.cost || 0), 0);

  // 날짜별 그룹핑
  const groupedByDate = activities.reduce((acc, a) => {
    const key = a.date || "날짜 없음";
    if (!acc[key]) acc[key] = [];
    acc[key].push(a);
    return acc;
  }, {});

  // 날짜별로 정렬, 각 날짜 안에서는 시간순
  const sortedDates = Object.keys(groupedByDate).sort();
  sortedDates.forEach((date) => {
    groupedByDate[date].sort((a, b) =>
      (a.time || "").localeCompare(b.time || ""),
    );
  });

  if (!trip) {
    return (
      <div className="text-center py-12">
        <p className="text-slate-500 mb-4">여행을 찾을 수 없습니다</p>
        <Link to="/" className="text-blue-500 hover:underline">
          ← 목록으로
        </Link>
      </div>
    );
  }

  return (
    <div>
      {/* 뒤로 */}
      <Link
        to="/"
        className="inline-block text-slate-500 hover:text-slate-700 mb-4"
      >
        ← 목록으로
      </Link>

      {/* 여행 정보 */}
      <section className="bg-white rounded-2xl shadow-sm p-5 mb-6">
        <h1 className="text-2xl font-bold text-slate-800 mb-2">{trip.title}</h1>
        {(trip.startDate || trip.endDate) && (
          <p className="text-slate-500">
            📅 {trip.startDate} ~ {trip.endDate}
          </p>
        )}
        {trip.companions && (
          <p className="text-slate-500">👥 {trip.companions}</p>
        )}
        {totalCost > 0 && (
          <p className="text-slate-500 mt-2">
            💰 총 지출:{" "}
            <span className="font-semibold text-slate-700">
              {totalCost.toLocaleString()}원
            </span>
          </p>
        )}
      </section>

      {/* 일정 */}
      <section className="mb-6">
        <div className="flex justify-between items-center mb-3">
          <h2 className="text-lg font-semibold text-slate-700">
            일정 ({activities.length})
          </h2>
          {!showActivityForm && (
            <button
              onClick={() => setShowActivityForm(true)}
              className="text-sm bg-blue-500 hover:bg-blue-600 text-white px-3 py-1.5 rounded-lg transition"
            >
              + 추가
            </button>
          )}
        </div>

        {/* Activity 폼 (토글) */}
        {showActivityForm && (
          <ActivityForm
            tripStartDate={trip.startDate}
            onAdd={handleAddActivity}
            onCancel={() => setShowActivityForm(false)}
          />
        )}

        {/* 일정 없을 때 */}
        {activities.length === 0 && !showActivityForm && (
          <div className="bg-white rounded-2xl p-8 text-center text-slate-400">
            아직 일정이 없습니다
          </div>
        )}

        {/* 날짜별 그룹 */}
        {sortedDates.map((date) => (
          <div key={date} className="mb-4">
            <h3 className="text-sm font-medium text-slate-500 mb-2 px-1">
              📅 {date}
            </h3>
            <div className="space-y-2">
              {groupedByDate[date].map((activity) => (
                <ActivityItem
                  key={activity.id}
                  activity={activity}
                  onDelete={handleDeleteActivity}
                />
              ))}
            </div>
          </div>
        ))}
      </section>

      {/* 평점 */}
      <section className="bg-white rounded-2xl shadow-sm p-5 mb-6">
        <h2 className="text-lg font-semibold text-slate-700 mb-3">전체 평점</h2>
        <div className="flex gap-2">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              onClick={() => setRating(star === rating ? 0 : star)}
              className={`text-3xl transition ${
                star <= rating ? "text-yellow-400" : "text-slate-200"
              }`}
            >
              ★
            </button>
          ))}
        </div>
      </section>

      {/* 메모 */}
      <section className="bg-white rounded-2xl shadow-sm p-5 mb-6">
        <h2 className="text-lg font-semibold text-slate-700 mb-3">한줄 회고</h2>
        <textarea
          value={memo}
          onChange={(e) => setMemo(e.target.value)}
          placeholder="이 여행은 어땠나요?"
          rows={4}
          className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 resize-none"
        />
      </section>

      <button
        onClick={handleSave}
        className="w-full bg-blue-500 hover:bg-blue-600 text-white font-medium py-3 rounded-lg transition"
      >
        평점·메모 저장하기
      </button>
    </div>
  );
}

export default TripDetailPage;
