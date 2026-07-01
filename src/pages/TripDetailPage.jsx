import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { IconArrowLeft, IconCameraPlus } from "@tabler/icons-react";

function TripDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [trip, setTrip] = useState(null);
  const [memo, setMemo] = useState("");
  const [rating, setRating] = useState(0);

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

  const handleSave = () => {
    const saved = localStorage.getItem("trips");
    const trips = saved ? JSON.parse(saved) : [];

    const updated = trips.map((t) =>
      String(t.id) === id ? { ...t, memo, rating } : t,
    );

    localStorage.setItem("trips", JSON.stringify(updated));
    alert("저장되었습니다");
  };

  // 날짜 포맷 함수 (2026-06-28 → 2026.06.28)
  const formatFull = (dateStr) => {
    if (!dateStr) return "";
    return dateStr.replaceAll("-", ".");
  };

  // 없는 여행
  if (!trip) {
    return (
      <div className="text-center py-12">
        <p className="mb-4" style={{ color: "#7A8CA0" }}>
          여행을 찾을 수 없습니다
        </p>
        <Link to="/" className="text-sm" style={{ color: "#3A4A5C" }}>
          ← 목록으로
        </Link>
      </div>
    );
  }

  // 상세 페이지는 커버가 상단을 덮으니, 페이지의 상하 패딩을 뺍니다.
  // App.jsx의 컨테이너에 이미 p-4가 있어서 그것도 고려해야 함.
  return (
    <div style={{ margin: "-16px -16px 0 -16px" }}>
      {/* 히어로 커버 */}
      <div
        className="relative"
        style={{
          height: "180px",
          background: "linear-gradient(135deg, #6B8AA8 0%, #3A4A5C 100%)",
          padding: "12px 16px",
        }}
      >
        {/* 상단 아이콘 */}
        <div className="flex justify-between">
          <button
            onClick={() => navigate("/")}
            className="rounded-full p-1.5"
            style={{ background: "rgba(0,0,0,0.15)", color: "#FFFFFF" }}
          >
            <IconArrowLeft size={18} />
          </button>
          <button
            className="rounded-full p-1.5"
            style={{ background: "rgba(0,0,0,0.15)", color: "#FFFFFF" }}
            title="사진 추가 (준비 중)"
          >
            <IconCameraPlus size={18} />
          </button>
        </div>

        {/* 하단 오버레이 */}
        <div className="absolute bottom-4 left-4 right-4">
          <h1
            className="font-medium"
            style={{
              color: "#FFFFFF",
              fontSize: "20px",
              letterSpacing: "-0.3px",
            }}
          >
            {trip.title}
          </h1>
          <p
            className="mt-1"
            style={{
              color: "rgba(255,255,255,0.85)",
              fontSize: "12px",
            }}
          >
            {trip.startDate && trip.endDate && (
              <>
                {formatFull(trip.startDate)} –{" "}
                {formatFull(trip.endDate).slice(5)}
              </>
            )}
            {trip.companions && ` · ${trip.companions}`}
          </p>
        </div>
      </div>

      {/* 통계 로우 */}
      <div
        className="flex justify-between px-4 py-3"
        style={{
          background: "#FAF9F5",
          borderBottom: "0.5px solid #E8E4D8",
        }}
      >
        <div className="text-center flex-1">
          <div
            className="font-medium"
            style={{ color: "#1E2A38", fontSize: "18px" }}
          >
            0
          </div>
          <div
            className="mt-0.5"
            style={{
              color: "#7A8CA0",
              fontSize: "10px",
              letterSpacing: "0.5px",
            }}
          >
            일정
          </div>
        </div>
        <div className="text-center flex-1">
          <div
            className="font-medium"
            style={{ color: "#1E2A38", fontSize: "18px" }}
          >
            0원
          </div>
          <div
            className="mt-0.5"
            style={{
              color: "#7A8CA0",
              fontSize: "10px",
              letterSpacing: "0.5px",
            }}
          >
            지출
          </div>
        </div>
        <div className="text-center flex-1">
          <div
            className="font-medium"
            style={{
              color: rating > 0 ? "#B08D5C" : "#A8B4C4",
              fontSize: "18px",
            }}
          >
            {rating > 0 ? `◆${rating}.0` : "–"}
          </div>
          <div
            className="mt-0.5"
            style={{
              color: "#7A8CA0",
              fontSize: "10px",
              letterSpacing: "0.5px",
            }}
          >
            평점
          </div>
        </div>
      </div>

      {/* 본문 영역 (일정 · 평점 · 메모) */}
      <div className="p-4">
        {/* 일정 (Step 2에서 추가 예정 안내) */}
        <section
          className="rounded-xl p-4 mb-4 text-center"
          style={{
            background: "#FFFFFF",
            border: "0.5px solid #E8E4D8",
            color: "#A8B4C4",
          }}
        >
          <p style={{ fontSize: "13px" }}>
            일정 기능은 다음 단계에서 추가됩니다
          </p>
        </section>

        {/* 평점 */}
        <section
          className="rounded-xl p-4 mb-4"
          style={{
            background: "#FFFFFF",
            border: "0.5px solid #E8E4D8",
          }}
        >
          <h2
            className="font-medium mb-3"
            style={{ color: "#1E2A38", fontSize: "14px" }}
          >
            전체 평점
          </h2>
          <div className="flex gap-2">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                onClick={() => setRating(star === rating ? 0 : star)}
                className="text-3xl transition-opacity"
                style={{
                  color: star <= rating ? "#B08D5C" : "#E8E4D8",
                }}
              >
                ◆
              </button>
            ))}
          </div>
        </section>

        {/* 메모 */}
        <section
          className="rounded-xl p-4 mb-4"
          style={{
            background: "#FFFFFF",
            border: "0.5px solid #E8E4D8",
          }}
        >
          <h2
            className="font-medium mb-3"
            style={{ color: "#1E2A38", fontSize: "14px" }}
          >
            한줄 회고
          </h2>
          <textarea
            value={memo}
            onChange={(e) => setMemo(e.target.value)}
            placeholder="이 여행은 어땠나요?"
            rows={4}
            className="w-full px-3 py-2 rounded-md focus:outline-none resize-none"
            style={{
              background: "#FFFFFF",
              border: "0.5px solid #E8E4D8",
              color: "#1E2A38",
              fontSize: "14px",
            }}
            onFocus={(e) => (e.target.style.border = "0.5px solid #3A4A5C")}
            onBlur={(e) => (e.target.style.border = "0.5px solid #E8E4D8")}
          />
        </section>

        {/* 저장 버튼 */}
        <button
          onClick={handleSave}
          className="w-full font-medium py-3 rounded-lg transition-opacity"
          style={{
            background: "#1E2A38",
            color: "#FFFFFF",
            fontSize: "14px",
          }}
          onMouseEnter={(e) => (e.currentTarget.style.opacity = "0.9")}
          onMouseLeave={(e) => (e.currentTarget.style.opacity = "1")}
        >
          평점 · 메모 저장하기
        </button>
      </div>
    </div>
  );
}

export default TripDetailPage;
