import { useState } from "react";

function ActivityForm({ tripStartDate, onAdd, onCancel }) {
  const [type, setType] = useState("방문지");
  const [name, setName] = useState("");
  const [date, setDate] = useState(tripStartDate || "");
  const [time, setTime] = useState("");
  const [cost, setCost] = useState("");
  const [memo, setMemo] = useState("");
  const [rating, setRating] = useState(0);

  const handleSubmit = () => {
    if (!name.trim()) {
      alert("이름을 입력하세요");
      return;
    }

    onAdd({
      id: Date.now(),
      type,
      name,
      date,
      time,
      cost: cost ? Number(cost) : 0,
      memo,
      rating,
    });
  };

  const types = ["방문지", "식사", "이동", "숙박", "기타"];

  return (
    <div className="bg-white rounded-2xl shadow-sm p-5 mb-4 border-2 border-blue-200">
      <h3 className="text-lg font-semibold text-slate-700 mb-4">
        새 일정 추가
      </h3>

      <div className="space-y-3">
        {/* 타입 선택 (칩 형태) */}
        <div>
          <label className="block text-sm text-slate-600 mb-2">종류</label>
          <div className="flex flex-wrap gap-2">
            {types.map((t) => (
              <button
                key={t}
                onClick={() => setType(t)}
                className={`px-3 py-1.5 rounded-full text-sm transition ${
                  type === t
                    ? "bg-blue-500 text-white"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                }`}
              >
                {t}
              </button>
            ))}
          </div>
        </div>

        {/* 이름 */}
        <div>
          <label className="block text-sm text-slate-600 mb-1">
            {type === "식사" ? "식당명" : type === "숙박" ? "숙소명" : "장소명"}
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder={type === "식사" ? "예: 초당 순두부" : "예: 안목해변"}
            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
          />
        </div>

        {/* 날짜 · 시간 */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-sm text-slate-600 mb-1">날짜</label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
          </div>
          <div>
            <label className="block text-sm text-slate-600 mb-1">시간</label>
            <input
              type="time"
              value={time}
              onChange={(e) => setTime(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
          </div>
        </div>

        {/* 비용 */}
        <div>
          <label className="block text-sm text-slate-600 mb-1">비용 (원)</label>
          <input
            type="number"
            value={cost}
            onChange={(e) => setCost(e.target.value)}
            placeholder="0"
            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
          />
        </div>

        {/* 평점 */}
        <div>
          <label className="block text-sm text-slate-600 mb-2">평점</label>
          <div className="flex gap-1">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                onClick={() => setRating(star === rating ? 0 : star)}
                className={`text-2xl transition ${
                  star <= rating ? "text-yellow-400" : "text-slate-200"
                }`}
              >
                ★
              </button>
            ))}
          </div>
        </div>

        {/* 메모 */}
        <div>
          <label className="block text-sm text-slate-600 mb-1">메모</label>
          <textarea
            value={memo}
            onChange={(e) => setMemo(e.target.value)}
            placeholder="선택 사항"
            rows={2}
            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 resize-none"
          />
        </div>

        {/* 버튼 */}
        <div className="flex gap-2 pt-2">
          <button
            onClick={onCancel}
            className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium py-2.5 rounded-lg transition"
          >
            취소
          </button>
          <button
            onClick={handleSubmit}
            className="flex-1 bg-blue-500 hover:bg-blue-600 text-white font-medium py-2.5 rounded-lg transition"
          >
            추가
          </button>
        </div>
      </div>
    </div>
  );
}

export default ActivityForm;
