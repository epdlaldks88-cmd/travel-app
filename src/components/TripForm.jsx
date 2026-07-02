import { useState } from "react";
import { DOMESTIC_REGIONS, COUNTRIES } from "../data/regions";

const CATEGORY_OPTIONS = ["바다", "산", "도시", "맛집", "문화"];

function TripForm({ onAdd }) {
  const [title, setTitle] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [companions, setCompanions] = useState("");

  const [countryType, setCountryType] = useState("domestic");
  const [countryName, setCountryName] = useState("");
  const [regionMajor, setRegionMajor] = useState("");
  const [regionMinor, setRegionMinor] = useState("");
  const [categories, setCategories] = useState([]);

  // 선택된 광역의 세부 지역 리스트
  const selectedMajor = DOMESTIC_REGIONS.find((r) => r.major === regionMajor);
  const availableMinors = selectedMajor ? selectedMajor.minors : [];

  // 국내 광역 선택 시 세부 지역 초기화
  const handleMajorChange = (value) => {
    setRegionMajor(value);
    setRegionMinor(""); // 세부지역 리셋
  };

  // 국내/해외 전환 시 관련 값 리셋
  const handleCountryTypeChange = (type) => {
    setCountryType(type);
    setCountryName("");
    setRegionMajor("");
    setRegionMinor("");
  };

  const toggleCategory = (cat) => {
    setCategories((prev) =>
      prev.includes(cat) ? prev.filter((c) => c !== cat) : [...prev, cat],
    );
  };

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
      countryType,
      countryName: countryType === "international" ? countryName : "",
      regionMajor: countryType === "domestic" ? regionMajor : "",
      regionMinor: countryType === "domestic" ? regionMinor : "",
      categories,
    });

    // 초기화
    setTitle("");
    setStartDate("");
    setEndDate("");
    setCompanions("");
    setCountryType("domestic");
    setCountryName("");
    setRegionMajor("");
    setRegionMinor("");
    setCategories([]);
  };

  // 스타일
  const inputStyle = {
    background: "#FFFFFF",
    border: "0.5px solid #E8E4D8",
    color: "#1E2A38",
    fontSize: "14px",
  };
  const labelStyle = {
    color: "#7A8CA0",
    fontSize: "11px",
    letterSpacing: "0.5px",
  };
  const selectStyle = {
    ...inputStyle,
    appearance: "none",
    backgroundImage: `url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='14' height='14' viewBox='0 0 24 24' fill='none' stroke='%237A8CA0' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'><polyline points='6 9 12 15 18 9'/></svg>")`,
    backgroundRepeat: "no-repeat",
    backgroundPosition: "right 10px center",
    paddingRight: "32px",
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

        {/* 국내/해외 선택 */}
        <div>
          <label className="block mb-1.5" style={labelStyle}>
            지역
          </label>
          <div className="flex gap-2 mb-2">
            <button
              onClick={() => handleCountryTypeChange("domestic")}
              className="px-4 py-1.5 rounded-full text-xs font-medium transition-colors"
              style={{
                background: countryType === "domestic" ? "#1E2A38" : "#EDE8DA",
                color: countryType === "domestic" ? "#FFFFFF" : "#3A4A5C",
              }}
            >
              국내
            </button>
            <button
              onClick={() => handleCountryTypeChange("international")}
              className="px-4 py-1.5 rounded-full text-xs font-medium transition-colors"
              style={{
                background:
                  countryType === "international" ? "#1E2A38" : "#EDE8DA",
                color: countryType === "international" ? "#FFFFFF" : "#3A4A5C",
              }}
            >
              해외
            </button>
          </div>

          {/* 국내: 광역 → 세부 순차 드롭다운 */}
          {countryType === "domestic" && (
            <div className="space-y-2">
              <select
                value={regionMajor}
                onChange={(e) => handleMajorChange(e.target.value)}
                className="w-full px-3 py-2 rounded-md focus:outline-none"
                style={selectStyle}
              >
                <option value="">광역 선택</option>
                {DOMESTIC_REGIONS.map((r) => (
                  <option key={r.major} value={r.major}>
                    {r.major}
                  </option>
                ))}
              </select>

              {/* 광역 선택되면 세부 드롭다운 자동 노출 */}
              {regionMajor && (
                <select
                  value={regionMinor}
                  onChange={(e) => setRegionMinor(e.target.value)}
                  className="w-full px-3 py-2 rounded-md focus:outline-none"
                  style={selectStyle}
                >
                  <option value="">세부 지역 선택 (선택 사항)</option>
                  {availableMinors.map((m) => (
                    <option key={m} value={m}>
                      {m}
                    </option>
                  ))}
                </select>
              )}
            </div>
          )}

          {/* 해외: 국가 드롭다운 */}
          {countryType === "international" && (
            <select
              value={countryName}
              onChange={(e) => setCountryName(e.target.value)}
              className="w-full px-3 py-2 rounded-md focus:outline-none"
              style={selectStyle}
            >
              <option value="">국가 선택</option>
              {COUNTRIES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          )}
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

        {/* 카테고리 (칩 다중) */}
        <div>
          <label className="block mb-1.5" style={labelStyle}>
            카테고리 (여러 개 선택 가능)
          </label>
          <div className="flex flex-wrap gap-2">
            {CATEGORY_OPTIONS.map((cat) => {
              const isActive = categories.includes(cat);
              return (
                <button
                  key={cat}
                  onClick={() => toggleCategory(cat)}
                  className="px-3 py-1 rounded-full text-xs font-medium transition-colors"
                  style={{
                    background: isActive ? "#1E2A38" : "#EDE8DA",
                    color: isActive ? "#FFFFFF" : "#3A4A5C",
                  }}
                >
                  {cat}
                </button>
              );
            })}
          </div>
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
