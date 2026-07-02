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

  // 방문지·식사·숙박·렌트카·기타 공통 (이동 제외)
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

  // 라벨 · placeholder
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
  const getLocationLabel = () => {
    if (type === "렌트카") return "대여점 위치";
    return "위치";
  };
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

  // 체크아웃/반납 날짜 자동 계산 표시용
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
    } else {
      if (!name.trim()) {
        alert("이름을 입력하세요");
        return;
      }
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
      payload = {
        ...base,
        name,
        location,
        rating,
      };
    }

    onAdd(payload);
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
  const chipStyle = (isActive) => ({
    background: isActive ? "#1E2A38" : "#EDE8DA",
    color: isActive ? "#FFFFFF" : "#3A4A5C",
    fontSize: "12px",
    fontWeight: 500,
    padding: "5px 11px",
    borderRadius: "999px",
    transition: "background-color 150ms",
  });
  const smallHintStyle = {
    color: "#7A8CA0",
    fontSize: "11px",
    marginTop: "4px",
  };

  return (
    <div
      className="rounded-xl p-4 mb-3"
      style={{
        background: "#FFFFFF",
        border: "0.5px solid #E8E4D8",
      }}
    >
      <h3
        className="font-medium mb-3"
        style={{ color: "#1E2A38", fontSize: "14px" }}
      >
        새 일정 추가
      </h3>

      <div className="space-y-3">
        {/* 타입 선택 */}
        <div>
          <label className="block mb-1.5" style={labelStyle}>
            종류
          </label>
          <div className="flex flex-wrap gap-2">
            {ACTIVITY_TYPES.map((t) => {
              const Icon = t.icon;
              const isActive = type === t.value;
              return (
                <button
                  key={t.value}
                  onClick={() => setType(t.value)}
                  className="flex items-center gap-1.5"
                  style={chipStyle(isActive)}
                >
                  <Icon size={13} />
                  {t.value}
                </button>
              );
            })}
          </div>
        </div>

        {/* ============ 이동 전용 필드 ============ */}
        {type === "이동" && (
          <>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block mb-1.5" style={labelStyle}>
                  출발지
                </label>
                <input
                  type="text"
                  value={origin}
                  onChange={(e) => setOrigin(e.target.value)}
                  placeholder="예: 서울"
                  className="w-full px-3 py-2 rounded-md focus:outline-none"
                  style={inputStyle}
                  onFocus={(e) =>
                    (e.target.style.border = "0.5px solid #3A4A5C")
                  }
                  onBlur={(e) =>
                    (e.target.style.border = "0.5px solid #E8E4D8")
                  }
                />
              </div>
              <div>
                <label className="block mb-1.5" style={labelStyle}>
                  도착지
                </label>
                <input
                  type="text"
                  value={destination}
                  onChange={(e) => setDestination(e.target.value)}
                  placeholder="예: 강릉"
                  className="w-full px-3 py-2 rounded-md focus:outline-none"
                  style={inputStyle}
                  onFocus={(e) =>
                    (e.target.style.border = "0.5px solid #3A4A5C")
                  }
                  onBlur={(e) =>
                    (e.target.style.border = "0.5px solid #E8E4D8")
                  }
                />
              </div>
            </div>

            {/* 이동 수단 */}
            <div>
              <label className="block mb-1.5" style={labelStyle}>
                이동 수단
              </label>
              <div className="flex flex-wrap gap-2">
                {TRANSPORT_OPTIONS.map((t) => {
                  const Icon = t.icon;
                  return (
                    <button
                      key={t.value}
                      onClick={() => setTransport(t.value)}
                      className="flex items-center gap-1.5"
                      style={chipStyle(transport === t.value)}
                    >
                      <Icon size={13} />
                      {t.value}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* 소요 시간 */}
            <div>
              <label className="block mb-1.5" style={labelStyle}>
                소요 시간
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  value={durationHours}
                  onChange={(e) => setDurationHours(e.target.value)}
                  placeholder="0"
                  min="0"
                  className="w-16 px-3 py-2 rounded-md focus:outline-none text-center"
                  style={inputStyle}
                  onFocus={(e) =>
                    (e.target.style.border = "0.5px solid #3A4A5C")
                  }
                  onBlur={(e) =>
                    (e.target.style.border = "0.5px solid #E8E4D8")
                  }
                />
                <span style={{ color: "#7A8CA0", fontSize: "12px" }}>시간</span>
                <input
                  type="number"
                  value={durationMinutes}
                  onChange={(e) => setDurationMinutes(e.target.value)}
                  placeholder="0"
                  min="0"
                  max="59"
                  className="w-16 px-3 py-2 rounded-md focus:outline-none text-center"
                  style={inputStyle}
                  onFocus={(e) =>
                    (e.target.style.border = "0.5px solid #3A4A5C")
                  }
                  onBlur={(e) =>
                    (e.target.style.border = "0.5px solid #E8E4D8")
                  }
                />
                <span style={{ color: "#7A8CA0", fontSize: "12px" }}>분</span>
              </div>
            </div>
          </>
        )}

        {/* ============ 이동 외 공통: 이름 · 위치 ============ */}
        {type !== "이동" && (
          <>
            <div>
              <label className="block mb-1.5" style={labelStyle}>
                {getNameLabel()}
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder={getNamePlaceholder()}
                className="w-full px-3 py-2 rounded-md focus:outline-none"
                style={inputStyle}
                onFocus={(e) => (e.target.style.border = "0.5px solid #3A4A5C")}
                onBlur={(e) => (e.target.style.border = "0.5px solid #E8E4D8")}
              />
            </div>

            <div>
              <label className="block mb-1.5" style={labelStyle}>
                {getLocationLabel()}
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="예: 강원도 강릉시 창해로 123"
                  className="flex-1 px-3 py-2 rounded-md focus:outline-none"
                  style={inputStyle}
                  onFocus={(e) =>
                    (e.target.style.border = "0.5px solid #3A4A5C")
                  }
                  onBlur={(e) =>
                    (e.target.style.border = "0.5px solid #E8E4D8")
                  }
                />
                <button
                  type="button"
                  className="rounded-md px-2 flex items-center justify-center"
                  style={{
                    background: "#EDE8DA",
                    color: "#7A8CA0",
                    border: "0.5px solid #E8E4D8",
                  }}
                  title="위치 검색 (준비 중)"
                  disabled
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
              <label className="block mb-1.5" style={labelStyle}>
                시간대
              </label>
              <div className="flex flex-wrap gap-2">
                {MEAL_TYPES.map((m) => (
                  <button
                    key={m}
                    onClick={() => setMealType(m === mealType ? "" : m)}
                    style={chipStyle(mealType === m)}
                  >
                    {m}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block mb-1.5" style={labelStyle}>
                음식 분류 (여러 개 선택 가능)
              </label>
              <div className="flex flex-wrap gap-2">
                {CUISINES.map((c) => (
                  <button
                    key={c}
                    onClick={() => toggleFromArray(cuisines, c, setCuisines)}
                    style={chipStyle(cuisines.includes(c))}
                  >
                    {c}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block mb-1.5" style={labelStyle}>
                종류
              </label>
              <div className="flex flex-wrap gap-2">
                {FOOD_TYPES.map((f) => (
                  <button
                    key={f}
                    onClick={() => toggleFromArray(foodTypes, f, setFoodTypes)}
                    style={chipStyle(foodTypes.includes(f))}
                  >
                    {f}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block mb-1.5" style={labelStyle}>
                자세한 종류
              </label>
              <input
                type="text"
                value={foodDetails}
                onChange={(e) => setFoodDetails(e.target.value)}
                placeholder="예: 칼국수, 비빔밥 (쉼표로 구분)"
                className="w-full px-3 py-2 rounded-md focus:outline-none"
                style={inputStyle}
                onFocus={(e) => (e.target.style.border = "0.5px solid #3A4A5C")}
                onBlur={(e) => (e.target.style.border = "0.5px solid #E8E4D8")}
              />
            </div>
          </>
        )}

        {/* ============ 숙박 전용: 박수 + 체크아웃 시각 ============ */}
        {type === "숙박" && (
          <>
            <div>
              <label className="block mb-1.5" style={labelStyle}>
                박 수
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  value={nights}
                  onChange={(e) => setNights(e.target.value)}
                  placeholder="1"
                  min="1"
                  className="w-20 px-3 py-2 rounded-md focus:outline-none text-center"
                  style={inputStyle}
                  onFocus={(e) =>
                    (e.target.style.border = "0.5px solid #3A4A5C")
                  }
                  onBlur={(e) =>
                    (e.target.style.border = "0.5px solid #E8E4D8")
                  }
                />
                <span style={{ color: "#7A8CA0", fontSize: "12px" }}>박</span>
                {nights && Number(nights) >= 1 && date && (
                  <span style={smallHintStyle}>
                    체크아웃: {getComputedEndDate(nights)}
                  </span>
                )}
              </div>
            </div>

            <div>
              <label className="block mb-1.5" style={labelStyle}>
                체크아웃 시각 (선택)
              </label>
              <input
                type="time"
                value={checkoutTime}
                onChange={(e) => setCheckoutTime(e.target.value)}
                className="w-full px-3 py-2 rounded-md focus:outline-none"
                style={inputStyle}
                onFocus={(e) => (e.target.style.border = "0.5px solid #3A4A5C")}
                onBlur={(e) => (e.target.style.border = "0.5px solid #E8E4D8")}
              />
            </div>
          </>
        )}

        {/* ============ 렌트카 전용 ============ */}
        {type === "렌트카" && (
          <>
            <div>
              <label className="block mb-1.5" style={labelStyle}>
                차종 (선택)
              </label>
              <input
                type="text"
                value={carModel}
                onChange={(e) => setCarModel(e.target.value)}
                placeholder="예: 쏘렌토"
                className="w-full px-3 py-2 rounded-md focus:outline-none"
                style={inputStyle}
                onFocus={(e) => (e.target.style.border = "0.5px solid #3A4A5C")}
                onBlur={(e) => (e.target.style.border = "0.5px solid #E8E4D8")}
              />
            </div>

            <div>
              <label className="block mb-1.5" style={labelStyle}>
                대여 기간
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  value={days}
                  onChange={(e) => setDays(e.target.value)}
                  placeholder="1"
                  min="1"
                  className="w-20 px-3 py-2 rounded-md focus:outline-none text-center"
                  style={inputStyle}
                  onFocus={(e) =>
                    (e.target.style.border = "0.5px solid #3A4A5C")
                  }
                  onBlur={(e) =>
                    (e.target.style.border = "0.5px solid #E8E4D8")
                  }
                />
                <span style={{ color: "#7A8CA0", fontSize: "12px" }}>일</span>
                {days && Number(days) >= 1 && date && (
                  <span style={smallHintStyle}>
                    반납: {getComputedEndDate(days)}
                  </span>
                )}
              </div>
            </div>

            <div>
              <label className="block mb-1.5" style={labelStyle}>
                반납 시각 (선택)
              </label>
              <input
                type="time"
                value={returnTime}
                onChange={(e) => setReturnTime(e.target.value)}
                className="w-full px-3 py-2 rounded-md focus:outline-none"
                style={inputStyle}
                onFocus={(e) => (e.target.style.border = "0.5px solid #3A4A5C")}
                onBlur={(e) => (e.target.style.border = "0.5px solid #E8E4D8")}
              />
            </div>
          </>
        )}

        {/* ============ 날짜 · 시간 (공통) ============ */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block mb-1.5" style={labelStyle}>
              {getDateLabel()}
            </label>
            <input
              type="date"
              value={date}
              min={tripStartDate}
              max={tripEndDate}
              onChange={(e) => setDate(e.target.value)}
              className="w-full px-3 py-2 rounded-md focus:outline-none"
              style={inputStyle}
              onFocus={(e) => (e.target.style.border = "0.5px solid #3A4A5C")}
              onBlur={(e) => (e.target.style.border = "0.5px solid #E8E4D8")}
            />
          </div>
          <div>
            <label className="block mb-1.5" style={labelStyle}>
              {getTimeLabel()}
            </label>
            <input
              type="time"
              value={time}
              onChange={(e) => setTime(e.target.value)}
              className="w-full px-3 py-2 rounded-md focus:outline-none"
              style={inputStyle}
              onFocus={(e) => (e.target.style.border = "0.5px solid #3A4A5C")}
              onBlur={(e) => (e.target.style.border = "0.5px solid #E8E4D8")}
            />
          </div>
        </div>

        {/* ============ 비용 (공통) ============ */}
        <div>
          <label className="block mb-1.5" style={labelStyle}>
            {type === "숙박" || type === "렌트카"
              ? "총 비용 (원)"
              : "비용 (원)"}
          </label>
          <input
            type="number"
            value={cost}
            onChange={(e) => setCost(e.target.value)}
            placeholder="0"
            className="w-full px-3 py-2 rounded-md focus:outline-none"
            style={inputStyle}
            onFocus={(e) => (e.target.style.border = "0.5px solid #3A4A5C")}
            onBlur={(e) => (e.target.style.border = "0.5px solid #E8E4D8")}
          />
        </div>

        {/* ============ 평점 (이동 제외) ============ */}
        {type !== "이동" && (
          <div>
            <label className="block mb-1.5" style={labelStyle}>
              평점
            </label>
            <div className="flex gap-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  onClick={() => setRating(star === rating ? 0 : star)}
                  className="text-2xl transition-opacity"
                  style={{
                    color: star <= rating ? "#B08D5C" : "#E8E4D8",
                  }}
                >
                  ◆
                </button>
              ))}
            </div>
          </div>
        )}

        {/* ============ 메모 (공통) ============ */}
        <div>
          <label className="block mb-1.5" style={labelStyle}>
            메모
          </label>
          <textarea
            value={memo}
            onChange={(e) => setMemo(e.target.value)}
            placeholder="선택 사항"
            rows={2}
            className="w-full px-3 py-2 rounded-md focus:outline-none resize-none"
            style={inputStyle}
            onFocus={(e) => (e.target.style.border = "0.5px solid #3A4A5C")}
            onBlur={(e) => (e.target.style.border = "0.5px solid #E8E4D8")}
          />
        </div>

        {/* ============ 버튼 ============ */}
        <div className="flex gap-2 pt-1">
          <button
            onClick={onCancel}
            className="flex-1 font-medium py-2.5 rounded-lg"
            style={{
              background: "#EDE8DA",
              color: "#3A4A5C",
              fontSize: "13px",
            }}
          >
            취소
          </button>
          <button
            onClick={handleSubmit}
            className="flex-1 font-medium py-2.5 rounded-lg transition-opacity"
            style={{
              background: "#1E2A38",
              color: "#FFFFFF",
              fontSize: "13px",
            }}
            onMouseEnter={(e) => (e.currentTarget.style.opacity = "0.9")}
            onMouseLeave={(e) => (e.currentTarget.style.opacity = "1")}
          >
            추가
          </button>
        </div>
      </div>
    </div>
  );
}

export default ActivityForm;
