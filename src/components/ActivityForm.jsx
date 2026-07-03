import { useState } from "react";
import {
  IconCar,
  IconMapPin,
  IconToolsKitchen2,
  IconBuilding,
  IconBookmark,
  IconLocationSearch,
  IconSteeringWheel,
  IconTrain,
  IconPlane,
  IconBus,
  IconWalk,
  IconRoute,
} from "@tabler/icons-react";
import { CUISINES, FOOD_TYPES, MEAL_TYPES } from "../data/foods";
import { Button, Card, Chip, Input, Textarea, Label, Rating } from "./ui";

const ACTIVITY_TYPES = [
  { value: "이동", icon: IconCar },
  { value: "방문지", icon: IconMapPin },
  { value: "식사", icon: IconToolsKitchen2 },
  { value: "숙박", icon: IconBuilding },
  { value: "렌트카", icon: IconSteeringWheel },
  { value: "기타", icon: IconBookmark },
];

const TRANSPORT_OPTIONS = [
  { value: "자동차", icon: IconCar },
  { value: "기차", icon: IconTrain },
  { value: "비행기", icon: IconPlane },
  { value: "버스", icon: IconBus },
  { value: "도보", icon: IconWalk },
  { value: "기타", icon: IconRoute },
];

function ActivityForm({ tripStartDate, tripEndDate, onAdd, onCancel }) {
  const [type, setType] = useState("방문지");

  // 공통
  const [date, setDate] = useState(tripStartDate || "");
  const [time, setTime] = useState("");
  const [cost, setCost] = useState("");
  const [memo, setMemo] = useState("");
  const [rating, setRating] = useState(0);

  // 이동 전용
  const [origin, setOrigin] = useState("");
  const [destination, setDestination] = useState("");
  const [transport, setTransport] = useState("자동차");
  const [durationHours, setDurationHours] = useState("");
  const [durationMinutes, setDurationMinutes] = useState("");

  // 이동 외 공통
  const [name, setName] = useState("");
  const [location, setLocation] = useState("");

  // 식사 전용
  const [mealType, setMealType] = useState("");
  const [cuisines, setCuisines] = useState([]);
  const [foodTypes, setFoodTypes] = useState([]);
  const [foodDetails, setFoodDetails] = useState("");

  // 숙박 전용
  const [nights, setNights] = useState("");
  const [checkoutTime, setCheckoutTime] = useState("");

  // 렌트카 전용
  const [days, setDays] = useState("");
  const [returnTime, setReturnTime] = useState("");
  const [carModel, setCarModel] = useState("");

  /* ─── 라벨 · placeholder ────────────────────────────────── */
  const getNameLabel = () => {
    if (type === "식사") return "식당명";
    if (type === "숙박") return "숙소명";
    if (type === "방문지") return "장소명";
    if (type === "렌트카") return "업체명";
    return "이름";
  };
  const getNamePlaceholder = () => {
    if (type === "식사") return "예: 옛맛 칼국수";
    if (type === "숙박") return "예: 강릉 오션뷰 호텔";
    if (type === "방문지") return "예: 안목해변";
    if (type === "렌트카") return "예: SK렌터카 강릉점";
    return "예: 서핑 강습";
  };
  const getLocationLabel = () => (type === "렌트카" ? "대여점 위치" : "위치");
  const getTimeLabel = () => {
    if (type === "이동") return "출발 시각";
    if (type === "숙박") return "체크인 시각";
    if (type === "렌트카") return "대여 시각";
    return "시간";
  };
  const getDateLabel = () => {
    if (type === "숙박") return "체크인 날짜";
    if (type === "렌트카") return "대여 날짜";
    return "날짜";
  };

  /* ─── 체크아웃/반납 날짜 자동 계산 ──────────────────────── */
  const getComputedEndDate = (n) => {
    if (!date || !n || Number(n) < 1) return "";
    const d = new Date(date);
    d.setDate(d.getDate() + Number(n));
    return d.toISOString().slice(0, 10).replaceAll("-", ".");
  };

  const toggleFromArray = (arr, value, setter) => {
    setter(
      arr.includes(value) ? arr.filter((v) => v !== value) : [...arr, value],
    );
  };

  const handleSubmit = () => {
    // 타입별 검증
    if (type === "이동") {
      if (!origin.trim() || !destination.trim()) {
        alert("출발지와 도착지를 입력하세요");
        return;
      }
    } else if (!name.trim()) {
      alert("이름을 입력하세요");
      return;
    }

    const base = {
      id: Date.now(),
      type,
      date,
      time,
      cost: cost ? Number(cost) : 0,
      memo,
    };

    let payload;
    if (type === "이동") {
      payload = {
        ...base,
        origin,
        destination,
        transport,
        durationHours: durationHours ? Number(durationHours) : 0,
        durationMinutes: durationMinutes ? Number(durationMinutes) : 0,
      };
    } else if (type === "식사") {
      payload = {
        ...base,
        name,
        location,
        rating,
        mealType,
        cuisines,
        foodTypes,
        foodDetails,
      };
    } else if (type === "숙박") {
      payload = {
        ...base,
        name,
        location,
        rating,
        nights: nights ? Number(nights) : 1,
        checkoutTime,
      };
    } else if (type === "렌트카") {
      payload = {
        ...base,
        name,
        location,
        rating,
        days: days ? Number(days) : 1,
        returnTime,
        carModel,
      };
    } else {
      // 방문지, 기타
      payload = { ...base, name, location, rating };
    }

    onAdd(payload);
  };

  return (
    <Card padding="md" className="mb-3">
      <h3 className="text-sm font-medium text-text mb-3">새 일정 추가</h3>

      <div className="space-y-3">
        {/* ============ 타입 선택 ============ */}
        <div>
          <Label>종류</Label>
          <div className="flex flex-wrap gap-2">
            {ACTIVITY_TYPES.map((t) => {
              const Icon = t.icon;
              return (
                <Chip
                  key={t.value}
                  variant={type === t.value ? "selected" : "default"}
                  onClick={() => setType(t.value)}
                  icon={<Icon size={14} />}
                >
                  {t.value}
                </Chip>
              );
            })}
          </div>
        </div>

        {/* ============ 이동 전용 ============ */}
        {type === "이동" && (
          <>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>출발지</Label>
                <Input
                  value={origin}
                  onChange={(e) => setOrigin(e.target.value)}
                  placeholder="예: 서울"
                />
              </div>
              <div>
                <Label>도착지</Label>
                <Input
                  value={destination}
                  onChange={(e) => setDestination(e.target.value)}
                  placeholder="예: 강릉"
                />
              </div>
            </div>

            <div>
              <Label>이동 수단</Label>
              <div className="flex flex-wrap gap-2">
                {TRANSPORT_OPTIONS.map((t) => {
                  const Icon = t.icon;
                  return (
                    <Chip
                      key={t.value}
                      variant={transport === t.value ? "selected" : "default"}
                      onClick={() => setTransport(t.value)}
                      icon={<Icon size={14} />}
                    >
                      {t.value}
                    </Chip>
                  );
                })}
              </div>
            </div>

            <div>
              <Label>소요 시간</Label>
              <div className="flex items-center gap-2">
                <Input
                  type="number"
                  value={durationHours}
                  onChange={(e) => setDurationHours(e.target.value)}
                  placeholder="0"
                  min="0"
                  size="sm"
                  className="w-16 text-center"
                />
                <span className="text-xs text-text-muted">시간</span>
                <Input
                  type="number"
                  value={durationMinutes}
                  onChange={(e) => setDurationMinutes(e.target.value)}
                  placeholder="0"
                  min="0"
                  max="59"
                  size="sm"
                  className="w-16 text-center"
                />
                <span className="text-xs text-text-muted">분</span>
              </div>
            </div>
          </>
        )}

        {/* ============ 이동 외 공통: 이름 · 위치 ============ */}
        {type !== "이동" && (
          <>
            <div>
              <Label>{getNameLabel()}</Label>
              <Input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder={getNamePlaceholder()}
              />
            </div>

            <div>
              <Label>{getLocationLabel()}</Label>
              <div className="flex gap-2">
                <div className="flex-1">
                  <Input
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    placeholder="예: 강원도 강릉시 창해로 123"
                  />
                </div>
                <button
                  type="button"
                  disabled
                  aria-label="위치 검색 (준비 중)"
                  title="위치 검색 (준비 중)"
                  className="w-11 h-11 shrink-0 rounded-xl flex items-center justify-center bg-surface-alt text-text-muted border border-border disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <IconLocationSearch size={18} />
                </button>
              </div>
            </div>
          </>
        )}

        {/* ============ 식사 전용 ============ */}
        {type === "식사" && (
          <>
            <div>
              <Label>시간대</Label>
              <div className="flex flex-wrap gap-2">
                {MEAL_TYPES.map((m) => (
                  <Chip
                    key={m}
                    variant={mealType === m ? "selected" : "default"}
                    onClick={() => setMealType(m === mealType ? "" : m)}
                  >
                    {m}
                  </Chip>
                ))}
              </div>
            </div>

            <div>
              <Label>음식 분류 (여러 개 선택 가능)</Label>
              <div className="flex flex-wrap gap-2">
                {CUISINES.map((c) => (
                  <Chip
                    key={c}
                    variant={cuisines.includes(c) ? "selected" : "default"}
                    onClick={() => toggleFromArray(cuisines, c, setCuisines)}
                  >
                    {c}
                  </Chip>
                ))}
              </div>
            </div>

            <div>
              <Label>종류</Label>
              <div className="flex flex-wrap gap-2">
                {FOOD_TYPES.map((f) => (
                  <Chip
                    key={f}
                    variant={foodTypes.includes(f) ? "selected" : "default"}
                    onClick={() => toggleFromArray(foodTypes, f, setFoodTypes)}
                  >
                    {f}
                  </Chip>
                ))}
              </div>
            </div>

            <div>
              <Label>자세한 종류</Label>
              <Input
                value={foodDetails}
                onChange={(e) => setFoodDetails(e.target.value)}
                placeholder="예: 칼국수, 비빔밥 (쉼표로 구분)"
              />
            </div>
          </>
        )}

        {/* ============ 숙박 전용 ============ */}
        {type === "숙박" && (
          <>
            <div>
              <Label>박 수</Label>
              <div className="flex items-center gap-2">
                <Input
                  type="number"
                  value={nights}
                  onChange={(e) => setNights(e.target.value)}
                  placeholder="1"
                  min="1"
                  size="sm"
                  className="w-20 text-center"
                />
                <span className="text-xs text-text-muted">박</span>
                {nights && Number(nights) >= 1 && date && (
                  <span className="text-xs text-text-muted">
                    체크아웃: {getComputedEndDate(nights)}
                  </span>
                )}
              </div>
            </div>

            <div>
              <Label>체크아웃 시각 (선택)</Label>
              <Input
                type="time"
                value={checkoutTime}
                onChange={(e) => setCheckoutTime(e.target.value)}
              />
            </div>
          </>
        )}

        {/* ============ 렌트카 전용 ============ */}
        {type === "렌트카" && (
          <>
            <div>
              <Label>차종 (선택)</Label>
              <Input
                value={carModel}
                onChange={(e) => setCarModel(e.target.value)}
                placeholder="예: 쏘렌토"
              />
            </div>

            <div>
              <Label>대여 기간</Label>
              <div className="flex items-center gap-2">
                <Input
                  type="number"
                  value={days}
                  onChange={(e) => setDays(e.target.value)}
                  placeholder="1"
                  min="1"
                  size="sm"
                  className="w-20 text-center"
                />
                <span className="text-xs text-text-muted">일</span>
                {days && Number(days) >= 1 && date && (
                  <span className="text-xs text-text-muted">
                    반납: {getComputedEndDate(days)}
                  </span>
                )}
              </div>
            </div>

            <div>
              <Label>반납 시각 (선택)</Label>
              <Input
                type="time"
                value={returnTime}
                onChange={(e) => setReturnTime(e.target.value)}
              />
            </div>
          </>
        )}

        {/* ============ 날짜 · 시간 (공통) ============ */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <Label>{getDateLabel()}</Label>
            <Input
              type="date"
              value={date}
              min={tripStartDate}
              max={tripEndDate}
              onChange={(e) => setDate(e.target.value)}
            />
          </div>
          <div>
            <Label>{getTimeLabel()}</Label>
            <Input
              type="time"
              value={time}
              onChange={(e) => setTime(e.target.value)}
            />
          </div>
        </div>

        {/* ============ 비용 (공통) ============ */}
        <div>
          <Label>
            {type === "숙박" || type === "렌트카"
              ? "총 비용 (원)"
              : "비용 (원)"}
          </Label>
          <Input
            type="number"
            value={cost}
            onChange={(e) => setCost(e.target.value)}
            placeholder="0"
          />
        </div>

        {/* ============ 평점 (이동 제외) ============ */}
        {type !== "이동" && (
          <div>
            <Label>평점</Label>
            <Rating value={rating} onChange={setRating} size="lg" />
          </div>
        )}

        {/* ============ 메모 (공통) ============ */}
        <div>
          <Label>메모</Label>
          <Textarea
            value={memo}
            onChange={(e) => setMemo(e.target.value)}
            placeholder="선택 사항"
            rows={2}
            className="resize-none"
          />
        </div>

        {/* ============ 버튼 ============ */}
        <div className="flex gap-2 pt-1">
          <Button variant="secondary" onClick={onCancel} fullWidth>
            취소
          </Button>
          <Button variant="primary" onClick={handleSubmit} fullWidth>
            추가
          </Button>
        </div>
      </div>
    </Card>
  );
}

export default ActivityForm;
