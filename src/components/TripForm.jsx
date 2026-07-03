import { useState } from "react";
import { IconPlus } from "@tabler/icons-react";
import { DOMESTIC_REGIONS, COUNTRIES } from "../data/regions";
import { Button, Card, Chip, Input, Select, Label } from "./ui";

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

  const handleMajorChange = (value) => {
    setRegionMajor(value);
    setRegionMinor(""); // 세부지역 리셋
  };

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

  /* ─── Select options ──────────────────────────────────────
     원본 UX 유지: 첫 옵션이 리셋 가능하도록 빈 옵션을 명시. */
  const majorOptions = [
    { value: "", label: "광역 선택" },
    ...DOMESTIC_REGIONS.map((r) => ({ value: r.major, label: r.major })),
  ];
  const minorOptions = [
    { value: "", label: "세부 지역 선택 (선택 사항)" },
    ...availableMinors.map((m) => ({ value: m, label: m })),
  ];
  const countryOptions = [
    { value: "", label: "국가 선택" },
    ...COUNTRIES.map((c) => ({ value: c, label: c })),
  ];

  return (
    <Card padding="lg" className="mb-6">
      <h2 className="text-base font-medium text-text mb-4">새 여행 추가</h2>

      <div className="space-y-3">
        {/* 여행 제목 */}
        <div>
          <Label>여행 제목</Label>
          <Input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="예: 강릉 1박2일"
          />
        </div>

        {/* 지역 (국내/해외 토글 + 드롭다운) */}
        <div>
          <Label>지역</Label>
          <div className="flex gap-2 mb-2">
            <Chip
              variant={countryType === "domestic" ? "selected" : "default"}
              onClick={() => handleCountryTypeChange("domestic")}
            >
              국내
            </Chip>
            <Chip
              variant={countryType === "international" ? "selected" : "default"}
              onClick={() => handleCountryTypeChange("international")}
            >
              해외
            </Chip>
          </div>

          {/* 국내: 광역 → 세부 순차 드롭다운 */}
          {countryType === "domestic" && (
            <div className="space-y-2">
              <Select
                value={regionMajor}
                onChange={(e) => handleMajorChange(e.target.value)}
                options={majorOptions}
              />
              {regionMajor && (
                <Select
                  value={regionMinor}
                  onChange={(e) => setRegionMinor(e.target.value)}
                  options={minorOptions}
                />
              )}
            </div>
          )}

          {/* 해외: 국가 드롭다운 */}
          {countryType === "international" && (
            <Select
              value={countryName}
              onChange={(e) => setCountryName(e.target.value)}
              options={countryOptions}
            />
          )}
        </div>

        {/* 시작일 · 종료일 */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <Label>시작일</Label>
            <Input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
            />
          </div>
          <div>
            <Label>종료일</Label>
            <Input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
            />
          </div>
        </div>

        {/* 동행자 */}
        <div>
          <Label>동행자</Label>
          <Input
            value={companions}
            onChange={(e) => setCompanions(e.target.value)}
            placeholder="예: 가족, 친구"
          />
        </div>

        {/* 카테고리 (다중 선택) */}
        <div>
          <Label>카테고리 (여러 개 선택 가능)</Label>
          <div className="flex flex-wrap gap-2">
            {CATEGORY_OPTIONS.map((cat) => (
              <Chip
                key={cat}
                variant={categories.includes(cat) ? "selected" : "default"}
                onClick={() => toggleCategory(cat)}
              >
                {cat}
              </Chip>
            ))}
          </div>
        </div>

        {/* 추가 버튼 */}
        <Button
          variant="primary"
          onClick={handleSubmit}
          fullWidth
          leftIcon={<IconPlus size={18} />}
        >
          여행 추가
        </Button>
      </div>
    </Card>
  );
}

export default TripForm;
