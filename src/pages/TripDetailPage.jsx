import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";

function TripDetailPage() {
  const { id } = useParams(); // URL에서 :id 추출
  const navigate = useNavigate();

  const [trip, setTrip] = useState(null);
  const [memo, setMemo] = useState("");
  const [rating, setRating] = useState(0);

  // localStorage에서 해당 여행 불러오기
  useEffect(() => {
    const saved = localStorage.getItem("trips");
    if (!saved) return;

    const trips = JSON.parse(saved);
    const found = trips.find((t) => String(t.id) === id);

    if (found) {
      setTrip(found);
      setMemo(found.memo || "");
      setRating(found.rating || 0);
    }
  }, [id]);

  // 저장
  const handleSave = () => {
    const saved = localStorage.getItem("trips");
    const trips = saved ? JSON.parse(saved) : [];

    const updated = trips.map((t) =>
      String(t.id) === id ? { ...t, memo, rating } : t,
    );

    localStorage.setItem("trips", JSON.stringify(updated));
    alert("저장되었습니다");
    navigate("/"); // 홈으로 돌아가기
  };

  // 여행 없을 때
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
      {/* 뒤로 가기 */}
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
      </section>

      {/* 평점 */}
      <section className="bg-white rounded-2xl shadow-sm p-5 mb-6">
        <h2 className="text-lg font-semibold text-slate-700 mb-3">평점</h2>
        <div className="flex gap-2">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              onClick={() => setRating(star)}
              className={`text-3xl transition ${
                star <= rating ? "text-yellow-400" : "text-slate-200"
              }`}
            >
              ★
            </button>
          ))}
        </div>
        <p className="text-sm text-slate-500 mt-2">
          {rating > 0 ? `${rating}점` : "아직 평가 없음"}
        </p>
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

      {/* 저장 버튼 */}
      <button
        onClick={handleSave}
        className="w-full bg-blue-500 hover:bg-blue-600 text-white font-medium py-3 rounded-lg transition"
      >
        저장하기
      </button>
    </div>
  );
}

export default TripDetailPage;
