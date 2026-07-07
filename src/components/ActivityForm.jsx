import { useState } from "react";
import {
  IconMapPin,
  IconToolsKitchen2,
  IconBuilding,
  IconSteeringWheel,
  IconBookmark,
  IconLocationSearch,
  IconCar,
  IconTrain,
  IconPlane,
  IconBus,
  IconWalk,
  IconRoute,
  IconCoffee,
  IconShoppingBag,
} from "@tabler/icons-react";
import { CUISINES, FOOD_TYPES, MEAL_TYPES } from "../data/foods";
import { Button, Card, Chip, Input, Textarea, Label, Rating } from "./ui";

/**
 * 부모 활동 카테고리 5개
 */
const ACTIVITY_TYPES = [
  { value: "관광지", icon: IconMapPin },
  { value: "식당", icon: IconToolsKitchen2 },
  { value: "숙소", icon: IconBuilding },
  { value: "렌트카", icon: IconSteeringWheel },
  { value: "기타", icon: IconBookmark },
];

/**
 * 자식 활동 카테고리 5개 (렌트카/숙소 제외, 카페/쇼핑 추가)
 */
const SUB_ACTIVITY_TYPES_OPTIONS = [
  { value: "관광", icon: IconMapPin },
  { value: "식당", icon: IconToolsKitchen2 },
  { value: "카페", icon: IconCoffee },
  { value: "쇼핑", icon: IconShoppingBag },
  { value: "기타", icon: IconBookmark },
];

const TRANSPORT_OPTIONS = [
  { value: "도보", icon: IconWalk },
  { value: "자차", icon: IconCar },
  { value: "택시", icon: IconCar },
  { value: "버스", icon: IconBus },
  { value: "지하철", icon: IconTrain },
  { value: "기차", icon: IconTrain },
  { value: "비행기", icon: IconPlane },
  { value: "렌트카", icon: IconSteeringWheel },
  { value: "기타", icon: IconRoute },
];

function ActivityForm({
  isSubActivity = false,
  parentActivity = null,
  initialData = null,
  tripStartDate,
  tripEndDate,
  previousActivityName,
  onSubmit,
  onCancel,
}) {
  const isEditing = !!initialData;
  const typeOptions = isSubActivity
    ? SUB_ACTIVITY_TYPES_OPTIONS
    : ACTIVITY_TYPES;
  const defaultType = isSubActivity ? "관광" : "관광지";

  const [type, setType] = useState(initialData?.type ?? defaultType);

  // 공통
  const [date, setDate] = useState(
    initialData?.date ??
      (isSubActivity ? (parentActivity?.date ?? "") : (tripStartDate ?? "")),
  );
  const [time, setTime] = useState(initialData?.time ?? "");
  const [cost, setCost] = useState(
    initialData?.cost != null ? String(initialData.cost) : "",
  );
  const [memo, setMemo] = useState(initialData?.memo ?? "");
  const [rating, setRating] = useState(initialData?.rating ?? 0);

  // 장소 (공통)
  const [name, setName] = useState(initialData?.name ?? "");
  const [location, setLocation] = useState(initialData?.location ?? "");

  // 이동 정보 — origin은 신규 추가 시 이전 활동명 자동 채움
  const isNewParentWithPrev =
    !isEditing && !isSubActivity && !!previousActivityName;
  const [origin, setOrigin] = useState(
    initialData?.origin ?? (isNewParentWithPrev ? previousActivityName : ""),
  );
  const [originTouched, setOriginTouched] = useState(!isNewParentWithPrev);

  const [transport, setTransport] = useState(initialData?.transport ?? "");
  const [durationHours, setDurationHours] = useState(
    initialData?.durationHours ? String(initialData.durationHours) : "",
  );
  const [durationMinutes, setDurationMinutes] = useState(
    initialData?.durationMinutes ? String(initialData.durationMinutes) : "",
  );
  const [distanceKm, setDistanceKm] = useState(
    initialData?.distanceKm != null ? String(initialData.distanceKm) : "",
  );

  // 식당 전용
  const [mealType, setMealType] = useState(initialData?.mealType ?? "");
  const [cuisines, setCuisines] = useState(initialData?.cuisines ?? []);
  const [foodTypes, setFoodTypes] = useState(initialData?.foodTypes ?? []);
  const [foodDetails, setFoodDetails] = useState(
    initialData?.foodDetails ?? "",
  );

  // 숙소 전용
  const [nights, setNights] = useState(
    initialData?.nights ? String(initialData.nights) : "",
  );
  const [checkoutTime, setCheckoutTime] = useState(
    initialData?.checkoutTime ?? "",
  );

  // 렌트카 전용
  const [days, setDays] = useState(
    initialData?.days ? String(initialData.days) : "",
  );
  const [returnTime, setReturnTime] = useState(initialData?.returnTime ?? "");
  const [carModel, setCarModel] = useState(initialData?.carModel ?? "");

  /* ─── type별 라벨/placeholder ─────────────────────────── */
  const getNameLabel = () => {
    if (isSubActivity) return "이름";
    if (type === "식당") return "식당명";
    if (type === "숙소") return "숙소명";
    if (type === "관광지") return "장소명";
    if (type === "렌트카") return "업체명";
    return "이름";
  };
  const getNamePlaceholder = () => {
    if (isSubActivity) return "예: OO카페";
    if (type === "식당") return "예: 옛맛 칼국수";
    if (type === "숙소") return "예: 강릉 오션뷰 호텔";
    if (type === "관광지") return "예: 안목해변";
    if (type === "렌트카") return "예: SK렌터카 강릉점";
    return "예: 서핑 강습";
  };
  const getLocationLabel = () => (type === "렌트카" ? "대여점 위치" : "위치");
  const getTimeLabel = () => {
    if (type === "숙소") return "체크인 시각";
    if (type === "렌트카") return "대여 시각";
    return "시간";
  };
  const getDateLabel = () => {
    if (type === "숙소") return "체크인 날짜";
    if (type === "렌트카") return "대여 날짜";
    return "날짜";
  };

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

  const handleOriginChange = (e) => {
    setOrigin(e.target.value);
    setOriginTouched(true);
  };

  const handleOriginFocus = (e) => {
    // 자동 채움된 상태에서 포커스 시 전체 선택 → 그대로 쓸지, 다시 쓸지 선택하기 편함
    if (!originTouched) {
      e.target.select();
    }
  };

  const handleSubmit = () => {
    if (!name.trim()) {
      alert("이름을 입력하세요");
      return;
    }

    // 자식 모드: 축소 payload
    if (isSubActivity) {
      const subPayload = {
        type,
        name,
        time,
        cost: cost ? Number(cost) : 0,
        memo,
        rating,
      };
      onSubmit(subPayload);
      return;
    }

    // 부모 모드
    const base = {
      type,
      date,
      time,
      cost: cost ? Number(cost) : 0,
      memo,
      rating,
      name,
      location,
      origin,
      transport,
      durationHours: durationHours ? Number(durationHours) : 0,
      durationMinutes: durationMinutes ? Number(durationMinutes) : 0,
      distanceKm: distanceKm ? Number(distanceKm) : null,
    };

    let payload = base;
    if (type === "식당") {
      payload = { ...base, mealType, cuisines, foodTypes, foodDetails };
    } else if (type === "숙소") {
      payload = { ...base, nights: nights ? Number(nights) : 1, checkoutTime };
    } else if (type === "렌트카") {
      payload = {
        ...base,
        days: days ? Number(days) : 1,
        returnTime,
        carModel,
      };
    }

    onSubmit(payload);
  };

  const headerText = isEditing
    ? isSubActivity
      ? "세부 일정 편집"
      : "일정 편집"
    : isSubActivity
      ? "새 세부 일정"
      : "새 일정 추가";

  return (
    <Card padding="md" className="mb-3">
      <h3 className="text-sm font-medium text-text mb-3">{headerText}</h3>

      <div className="space-y-3">
        {/* ============ 타입 선택 ============ */}
        <div>
          <Label>종류</Label>
          <div className="flex flex-wrap gap-2">
            {typeOptions.map((t) => {
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

        {/* ============ 날짜 · 시간 (부모만 상단 배치) ============ */}
        {!isSubActivity && (
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
        )}

        {/* ============ 이름 (공통) ============ */}
        <div>
          <Label>{getNameLabel()}</Label>
          <Input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder={getNamePlaceholder()}
          />
        </div>

        {/* ============ 위치 (부모만) ============ */}
        {!isSubActivity && (
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
        )}

        {/* ============ 이동 정보 (부모만) ============ */}
        {!isSubActivity && (
          <div className="pt-2 border-t border-border">
            <p className="text-xs text-text-muted mb-2 tracking-wide">
              이동 정보 (선택)
            </p>

            <div className="space-y-3">
              <div>
                <Label>출발지</Label>
                <Input
                  value={origin}
                  onChange={handleOriginChange}
                  onFocus={handleOriginFocus}
                  placeholder="예: 집, 서울역"
                  className={!originTouched ? "text-text-muted" : ""}
                />
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
                        onClick={() =>
                          setTransport(t.value === transport ? "" : t.value)
                        }
                        icon={<Icon size={14} />}
                      >
                        {t.value}
                      </Chip>
                    );
                  })}
                </div>
              </div>

              <div>
                <Label>소요 시간 · 거리</Label>
                <div className="flex items-center gap-2 flex-wrap">
                  <Input
                    type="number"
                    value={durationHours}
                    onChange={(e) => setDurationHours(e.target.value)}
                    placeholder="0"
                    min="0"
                    size="sm"
                    className="w-14 text-center"
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
                    className="w-14 text-center"
                  />
                  <span className="text-xs text-text-muted">분</span>
                  <Input
                    type="number"
                    value={distanceKm}
                    onChange={(e) => setDistanceKm(e.target.value)}
                    placeholder="0"
                    min="0"
                    step="0.1"
                    size="sm"
                    className="w-16 text-center ml-1"
                  />
                  <span className="text-xs text-text-muted">km</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ============ 식당 전용 (부모만) ============ */}
        {!isSubActivity && type === "식당" && (
          <div className="pt-2 border-t border-border space-y-3">
            <p className="text-xs text-text-muted tracking-wide">식당 정보</p>

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
          </div>
        )}

        {/* ============ 숙소 전용 (부모만) ============ */}
        {!isSubActivity && type === "숙소" && (
          <div className="pt-2 border-t border-border space-y-3">
            <p className="text-xs text-text-muted tracking-wide">숙소 정보</p>

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
          </div>
        )}

        {/* ============ 렌트카 전용 (부모만) ============ */}
        {!isSubActivity && type === "렌트카" && (
          <div className="pt-2 border-t border-border space-y-3">
            <p className="text-xs text-text-muted tracking-wide">렌트카 정보</p>

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
          </div>
        )}

        {/* ============ 시간 (자식 모드 단독) ============ */}
        {isSubActivity && (
          <div className="pt-2 border-t border-border">
            <Label>시간</Label>
            <Input
              type="time"
              value={time}
              onChange={(e) => setTime(e.target.value)}
            />
          </div>
        )}

        {/* ============ 비용 · 평점 (공통) ============ */}
        <div>
          <Label>
            {!isSubActivity && (type === "숙소" || type === "렌트카")
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

        <div>
          <Label>평점</Label>
          <Rating value={rating} onChange={setRating} size="lg" />
        </div>

        {/* ============ 메모 ============ */}
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
            {isEditing ? "저장" : "추가"}
          </Button>
        </div>
      </div>
    </Card>
  );
}

export default ActivityForm;
