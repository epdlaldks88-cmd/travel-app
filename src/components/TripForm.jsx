import { useState } from "react";
import { IconPlus } from "@tabler/icons-react";
import { DOMESTIC_REGIONS, COUNTRIES } from "../data/regions";
import { Button, Card, Chip, Input, Select, Label } from "./ui";

const CATEGORY_OPTIONS = ["바다", "산", "도시", "맛집", "문화"];

/**
 * 여행 신규/편집 폼.
 *
 * initialData 없으면 신규 (onAdd 콜백 사용).
 * initialData 있으면 편집 (onSubmit 콜백 사용).
 */
function TripForm({ initialData = null, onAdd, onSubmit, onCancel }) {
  const isEditing = !!initialData;

  // 편집 모드 초기값 계산 (국내/해외 구분)
  const initialCountryType =
    initialData?.countryType ||
    (initialData?.countryName ? "international" : "domestic");

  const [title, setTitle] = useState(initialData?.title ?? "");
  const [startDate, setStartDate] = useState(initialData?.startDate ?? "");
  const [endDate, setEndDate] = useState(initialData?.endDate ?? "");
  const [companions, setCompanions] = useState(initialData?.companions ?? "");

  const [countryType, setCountryType] = useState(initialCountryType);
  const [countryName, setCountryName] = useState(
    initialData?.countryName ?? "",
  );
  const [regionMajor, setRegionMajor] = useState(
    initialData?.regionMajor ?? "",
  );
  const [regionMinor, setRegionMinor] = useState(
    initialData?.regionMinor ?? "",
  );
  const [categories, setCategories] = useState(initialData?.categories ?? []);

  const selectedMajor = DOMESTIC_REGIONS.find((r) => r.major === regionMajor);
  const availableMinors = selectedMajor ? selectedMajor.minors : [];

  const handleMajorChange = (value) => {
    setRegionMajor(value);
    setRegionMinor("");
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

  const resetForm = () => {
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

  const handleSubmit = () => {
    if (!title.trim()) {
      alert("여행 제목을 입력하세요");
      return;
    }

    const payload = {
      title,
      startDate,
      endDate,
      companions,
      countryType,
      countryName: countryType === "international" ? countryName : "",
      regionMajor: countryType === "domestic" ? regionMajor : "",
      regionMinor: countryType === "domestic" ? regionMinor : "",
      categories,
    };

    if (isEditing) {
      onSubmit?.(payload);
      // 편집 모드는 폼 초기화 안 함 (모달이 닫힘)
    } else {
      onAdd?.(payload);
      resetForm();
    }
  };

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
      <h2 className="text-base font-medium text-text mb-4">
        {isEditing ? "여행 편집" : "새 여행 추가"}
      </h2>

      <div className="space-y-3">
        <div>
          <Label>여행 제목</Label>
          <Input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="예: 강릉 1박2일"
          />
        </div>

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

          {countryType === "international" && (
            <Select
              value={countryName}
              onChange={(e) => setCountryName(e.target.value)}
              options={countryOptions}
            />
          )}
        </div>

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

        <div>
          <Label>동행자</Label>
          <Input
            value={companions}
            onChange={(e) => setCompanions(e.target.value)}
            placeholder="예: 가족, 친구"
          />
        </div>

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

        {/* 취소 · 저장/추가 버튼 */}
        <div className="flex gap-2 pt-1">
          {onCancel && (
            <Button variant="secondary" onClick={onCancel} fullWidth>
              취소
            </Button>
          )}
          <Button
            variant="primary"
            onClick={handleSubmit}
            fullWidth
            leftIcon={!isEditing ? <IconPlus size={18} /> : undefined}
          >
            {isEditing ? "저장" : "여행 추가"}
          </Button>
        </div>
      </div>
    </Card>
  );
}

export default TripForm;
