import { useState } from "react";

function TripForm({ onAdd }) {
  const [title, setTitle] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [companions, setCompanions] = useState("");

  const handleSubmit = () => {
    if (!title.trim()) {
      alert("여행 제목을 입력하세요");
      return;
    }

    onAdd({
      id: Date.now(),
      title,
      startDate,
      endDate,
      companions,
    });

    setTitle("");
    setStartDate("");
    setEndDate("");
    setCompanions("");
  };

  // 공통 input 스타일
  const inputStyle = {
    background: "#FFFFFF",
    border: "0.5px solid #E8E4D8",
    color: "#1E2A38",
    fontSize: "14px",
  };

  // 공통 label 스타일
  const labelStyle = {
    color: "#7A8CA0",
    fontSize: "11px",
    letterSpacing: "0.5px",
  };

  return (
    <section
      className="rounded-xl p-5 mb-6"
      style={{
        background: "#FFFFFF",
        border: "0.5px solid #E8E4D8",
      }}
    >
      <h2 className="text-base font-medium mb-4" style={{ color: "#1E2A38" }}>
        새 여행 추가
      </h2>

      <div className="space-y-3">
        {/* 여행 제목 */}
        <div>
          <label className="block mb-1.5" style={labelStyle}>
            여행 제목
          </label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="예: 강릉 1박2일"
            className="w-full px-3 py-2 rounded-md focus:outline-none"
            style={inputStyle}
            onFocus={(e) => (e.target.style.border = "0.5px solid #3A4A5C")}
            onBlur={(e) => (e.target.style.border = "0.5px solid #E8E4D8")}
          />
        </div>

        {/* 시작일 · 종료일 */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block mb-1.5" style={labelStyle}>
              시작일
            </label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full px-3 py-2 rounded-md focus:outline-none"
              style={inputStyle}
              onFocus={(e) => (e.target.style.border = "0.5px solid #3A4A5C")}
              onBlur={(e) => (e.target.style.border = "0.5px solid #E8E4D8")}
            />
          </div>
          <div>
            <label className="block mb-1.5" style={labelStyle}>
              종료일
            </label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="w-full px-3 py-2 rounded-md focus:outline-none"
              style={inputStyle}
              onFocus={(e) => (e.target.style.border = "0.5px solid #3A4A5C")}
              onBlur={(e) => (e.target.style.border = "0.5px solid #E8E4D8")}
            />
          </div>
        </div>

        {/* 동행자 */}
        <div>
          <label className="block mb-1.5" style={labelStyle}>
            동행자
          </label>
          <input
            type="text"
            value={companions}
            onChange={(e) => setCompanions(e.target.value)}
            placeholder="예: 가족, 친구"
            className="w-full px-3 py-2 rounded-md focus:outline-none"
            style={inputStyle}
            onFocus={(e) => (e.target.style.border = "0.5px solid #3A4A5C")}
            onBlur={(e) => (e.target.style.border = "0.5px solid #E8E4D8")}
          />
        </div>

        {/* 추가 버튼 */}
        <button
          onClick={handleSubmit}
          className="w-full font-medium py-3 rounded-lg transition-opacity"
          style={{
            background: "#1E2A38",
            color: "#FFFFFF",
            fontSize: "14px",
          }}
          onMouseEnter={(e) => (e.currentTarget.style.opacity = "0.9")}
          onMouseLeave={(e) => (e.currentTarget.style.opacity = "1")}
        >
          + 여행 추가
        </button>
      </div>
    </section>
  );
}

export default TripForm;
