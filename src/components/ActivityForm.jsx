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
  IconHome,
  IconHistory,
  IconCompass,
  IconLoader2,
} from "@tabler/icons-react";
import { CUISINES, FOOD_TYPES, MEAL_TYPES } from "../data/foods";
import { Button, Card, Chip, Input, Textarea, Label, Rating } from "./ui";
import PlaceSearchModal from "./PlaceSearchModal";
import { useProfile, useAccommodations } from "../data/hooks";
import { useToast } from "./Toast";
import {
  getDirections,
  getPriorityForTransport,
  secondsToHM,
  metersToKm,
} from "../lib/kakaoDirections";
import PhotoUploader from "./PhotoUploader";
import PhotoGallery from "./PhotoGallery";
import {
  useProfile,
  useAccommodations,
  useActivityPhotos,
  usePhotoUrls,
} from "../data/hooks";

const ACTIVITY_TYPES = [
  { value: "관광지", icon: IconMapPin },
  { value: "식당", icon: IconToolsKitchen2 },
  { value: "숙소", icon: IconBuilding },
  { value: "렌트카", icon: IconSteeringWheel },
  { value: "기타", icon: IconBookmark },
];

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
  tripId,
  tripStartDate,
  tripEndDate,
  previousActivity,
  previousActivityName,
  onSubmit,
  onCancel,
}) {
  const isEditing = !!initialData;
  const typeOptions = isSubActivity
    ? SUB_ACTIVITY_TYPES_OPTIONS
    : ACTIVITY_TYPES;
  const defaultType = isSubActivity ? "관광" : "관광지";

  const profile = useProfile();
  const hasHome = !!profile?.homeAddress || !!profile?.homeName;
  const accommodations = useAccommodations(tripId) || [];
  const toast = useToast();

  const photos = useActivityPhotos(isEditing ? initialData?.id : null) || [];
  const urlMap = usePhotoUrls(photos);
  const [galleryOpenAt, setGalleryOpenAt] = useState(null);

  const [type, setType] = useState(initialData?.type ?? defaultType);

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

  const [name, setName] = useState(initialData?.name ?? "");
  const [location, setLocation] = useState(initialData?.location ?? "");

  // 출발지 + GPS (프리셋으로 채워지면 함께 저장)
  const [origin, setOrigin] = useState(initialData?.origin ?? "");
  const [originGpsLat, setOriginGpsLat] = useState(
    initialData?.originGpsLat ?? null,
  );
  const [originGpsLng, setOriginGpsLng] = useState(
    initialData?.originGpsLng ?? null,
  );
  const [presetSource, setPresetSource] = useState(null);

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

  // 자동 계산 중 상태
  const [calculating, setCalculating] = useState(false);

  const [mealType, setMealType] = useState(initialData?.mealType ?? "");
  const [cuisines, setCuisines] = useState(initialData?.cuisines ?? []);
  const [foodTypes, setFoodTypes] = useState(initialData?.foodTypes ?? []);
  const [foodDetails, setFoodDetails] = useState(
    initialData?.foodDetails ?? "",
  );

  const [accommodationId, setAccommodationId] = useState(
    initialData?.accommodationId ?? null,
  );

  const [days, setDays] = useState(
    initialData?.days ? String(initialData.days) : "",
  );
  const [returnTime, setReturnTime] = useState(initialData?.returnTime ?? "");
  const [carModel, setCarModel] = useState(initialData?.carModel ?? "");

  const [showPlaceSearch, setShowPlaceSearch] = useState(false);
  const [gpsLat, setGpsLat] = useState(initialData?.gpsLat ?? null);
  const [gpsLng, setGpsLng] = useState(initialData?.gpsLng ?? null);

  /* ─── type별 라벨/placeholder ─── */
  const getNameLabel = () => {
    if (isSubActivity) return "이름";
    if (type === "식당") return "식당명";
    if (type === "숙소") return "숙소";
    if (type === "관광지") return "장소명";
    if (type === "렌트카") return "업체명";
    return "이름";
  };
  const getNamePlaceholder = () => {
    if (isSubActivity) return "예: OO카페";
    if (type === "식당") return "예: 옛맛 칼국수";
    if (type === "숙소") return "위 목록에서 선택";
    if (type === "관광지") return "예: 안목해변";
    if (type === "렌트카") return "예: SK렌터카 강릉점";
    return "예: 서핑 강습";
  };
  const getLocationLabel = () => (type === "렌트카" ? "대여점 위치" : "위치");
  const getTimeLabel = () => (type === "렌트카" ? "대여 시각" : "시간");
  const getDateLabel = () => (type === "렌트카" ? "대여 날짜" : "날짜");

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

  /* ─── 프리셋 핸들러 (GPS 함께 세팅) ─── */

  const clearOriginGps = () => {
    setOriginGpsLat(null);
    setOriginGpsLng(null);
  };

  const handleOriginChange = (e) => {
    setOrigin(e.target.value);
    setPresetSource(null);
    clearOriginGps(); // 직접 입력하면 GPS 무효화
  };

  const handlePickHome = () => {
    if (presetSource === "home") {
      setOrigin("");
      setPresetSource(null);
      clearOriginGps();
      return;
    }
    setOrigin(profile?.homeName || "우리집");
    setOriginGpsLat(profile?.homeGpsLat ?? null);
    setOriginGpsLng(profile?.homeGpsLng ?? null);
    setPresetSource("home");
  };

  const handlePickPrevious = () => {
    if (presetSource === "previous") {
      setOrigin("");
      setPresetSource(null);
      clearOriginGps();
      return;
    }
    setOrigin(previousActivityName);
    setOriginGpsLat(previousActivity?.gpsLat ?? null);
    setOriginGpsLng(previousActivity?.gpsLng ?? null);
    setPresetSource("previous");
  };

  const handlePickAccommodationAsOrigin = (acc) => {
    if (
      presetSource &&
      typeof presetSource === "object" &&
      presetSource.kind === "accommodation" &&
      presetSource.id === acc.id
    ) {
      setOrigin("");
      setPresetSource(null);
      clearOriginGps();
      return;
    }
    setOrigin(acc.name);
    setOriginGpsLat(acc.gpsLat ?? null);
    setOriginGpsLng(acc.gpsLng ?? null);
    setPresetSource({ kind: "accommodation", id: acc.id });
  };

  const handleFillHomeAsDestination = () => {
    if (!profile) return;
    setName(profile.homeName || "우리집");
    setLocation(profile.homeAddress || "");
    setGpsLat(profile.homeGpsLat ?? null);
    setGpsLng(profile.homeGpsLng ?? null);
  };

  const handlePickAccommodation = (acc) => {
    if (accommodationId === acc.id) {
      setAccommodationId(null);
      setName("");
      setLocation("");
      setGpsLat(null);
      setGpsLng(null);
      return;
    }
    setAccommodationId(acc.id);
    setName(acc.name);
    setLocation(acc.location || "");
    setGpsLat(acc.gpsLat ?? null);
    setGpsLng(acc.gpsLng ?? null);
  };

  const isAccommodationPreset = (accId) =>
    presetSource &&
    typeof presetSource === "object" &&
    presetSource.kind === "accommodation" &&
    presetSource.id === accId;

  /* ─── 자동 계산 ─── */

  const canAutoCalculate =
    originGpsLat != null &&
    originGpsLng != null &&
    gpsLat != null &&
    gpsLng != null &&
    getPriorityForTransport(transport) !== null;

  const autoCalculateReason = () => {
    if (originGpsLat == null || originGpsLng == null)
      return "출발지를 프리셋에서 선택해 주세요";
    if (gpsLat == null || gpsLng == null)
      return "목적지를 장소 검색 또는 우리집으로 지정해 주세요";
    if (getPriorityForTransport(transport) === null)
      return "자차/택시/렌트카일 때만 지원됩니다";
    return "";
  };

  const handleAutoCalculate = async () => {
    if (!canAutoCalculate) return;
    setCalculating(true);
    try {
      const result = await getDirections({
        originLat: originGpsLat,
        originLng: originGpsLng,
        destLat: gpsLat,
        destLng: gpsLng,
        priority: getPriorityForTransport(transport),
      });
      const { hours, minutes } = secondsToHM(result.durationSec);
      const km = metersToKm(result.distanceMeters);
      setDurationHours(String(hours));
      setDurationMinutes(String(minutes));
      setDistanceKm(String(km));
      toast.success(`자동 계산 완료: ${km}km · 약 ${hours}시간 ${minutes}분`);
    } catch (err) {
      console.error("[directions] 자동 계산 실패:", err);
      toast.error("자동 계산 실패: " + (err.message || "네트워크 오류"));
    } finally {
      setCalculating(false);
    }
  };

  const handleSubmit = () => {
    if (!name.trim()) {
      alert("이름을 입력하세요");
      return;
    }

    if (isSubActivity) {
      let subPayload = {
        type,
        name,
        time,
        cost: cost ? Number(cost) : 0,
        memo,
        rating,
      };
      if (type === "식당") {
        subPayload = {
          ...subPayload,
          mealType,
          cuisines,
          foodTypes,
          foodDetails,
        };
      }
      onSubmit(subPayload);
      return;
    }

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
      originGpsLat,
      originGpsLng,
      transport,
      durationHours: durationHours ? Number(durationHours) : 0,
      durationMinutes: durationMinutes ? Number(durationMinutes) : 0,
      distanceKm: distanceKm ? Number(distanceKm) : null,
      gpsLat,
      gpsLng,
      accommodationId: type === "숙소" ? accommodationId : null,
    };

    let payload = base;
    if (type === "식당") {
      payload = { ...base, mealType, cuisines, foodTypes, foodDetails };
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

  const handlePlaceSelect = (place) => {
    setName(place.name);
    setLocation(place.address);
    setGpsLat(place.lat);
    setGpsLng(place.lng);
  };

  const headerText = isEditing
    ? isSubActivity
      ? "세부 일정 편집"
      : "일정 편집"
    : isSubActivity
      ? "새 세부 일정"
      : "새 일정 추가";

  const isAccommodationEvent = !isSubActivity && type === "숙소";

  return (
    <>
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

          {/* ============ 날짜 · 시간 (부모만) ============ */}
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

          {/* ============ 숙소 이벤트 참조 ============ */}
          {isAccommodationEvent && (
            <div>
              <Label>숙소 선택</Label>
              {accommodations.length === 0 ? (
                <div className="text-xs text-text-muted p-3 rounded-lg bg-surface-alt border border-border">
                  등록된 숙소가 없습니다. 먼저 상단 "숙소" 섹션에서 숙소를
                  추가해 주세요.
                </div>
              ) : (
                <div className="flex flex-wrap gap-2">
                  {accommodations.map((acc) => (
                    <Chip
                      key={acc.id}
                      variant={
                        accommodationId === acc.id ? "selected" : "default"
                      }
                      onClick={() => handlePickAccommodation(acc)}
                      icon={<IconBuilding size={14} />}
                    >
                      {acc.name}
                    </Chip>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ============ 이름 ============ */}
          <div>
            <Label>{getNameLabel()}</Label>
            {!isSubActivity ? (
              <div className="flex gap-2">
                <div className="flex-1">
                  <Input
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder={getNamePlaceholder()}
                    disabled={isAccommodationEvent}
                  />
                </div>
                {!isAccommodationEvent && hasHome && (
                  <button
                    type="button"
                    onClick={handleFillHomeAsDestination}
                    aria-label="우리집으로 채우기"
                    title="우리집 정보로 채우기"
                    className="w-11 h-11 shrink-0 rounded-xl flex items-center justify-center bg-surface-alt text-text-muted hover:text-text hover:bg-surface border border-border transition-colors"
                  >
                    <IconHome size={18} />
                  </button>
                )}
                {!isAccommodationEvent && (
                  <button
                    type="button"
                    onClick={() => setShowPlaceSearch(true)}
                    aria-label="장소 검색"
                    title="카카오 지도에서 검색"
                    className="w-11 h-11 shrink-0 rounded-xl flex items-center justify-center bg-surface-alt text-text-muted hover:text-text hover:bg-surface border border-border transition-colors"
                  >
                    <IconLocationSearch size={18} />
                  </button>
                )}
              </div>
            ) : (
              <Input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder={getNamePlaceholder()}
              />
            )}
          </div>

          {/* ============ 위치 ============ */}
          {!isSubActivity && (
            <div>
              <Label>{getLocationLabel()}</Label>
              <Input
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="예: 강원도 강릉시 창해로 123"
                disabled={isAccommodationEvent}
              />
            </div>
          )}

          {/* ============ 이동 정보 ============ */}
          {!isSubActivity && (
            <div className="pt-2 border-t border-border">
              <p className="text-xs text-text-muted mb-2 tracking-wide">
                이동 정보 (선택)
              </p>

              <div className="space-y-3">
                <div>
                  <Label>출발지</Label>

                  {(hasHome ||
                    previousActivityName ||
                    accommodations.length > 0) && (
                    <div className="flex flex-wrap gap-2 mb-2">
                      {hasHome && (
                        <Chip
                          variant={
                            presetSource === "home" ? "selected" : "default"
                          }
                          onClick={handlePickHome}
                          icon={<IconHome size={14} />}
                        >
                          {profile?.homeName || "우리집"}
                        </Chip>
                      )}
                      {previousActivityName && (
                        <Chip
                          variant={
                            presetSource === "previous" ? "selected" : "default"
                          }
                          onClick={handlePickPrevious}
                          icon={<IconHistory size={14} />}
                        >
                          이전: {previousActivityName}
                        </Chip>
                      )}
                      {accommodations.map((acc) => (
                        <Chip
                          key={acc.id}
                          variant={
                            isAccommodationPreset(acc.id)
                              ? "selected"
                              : "default"
                          }
                          onClick={() => handlePickAccommodationAsOrigin(acc)}
                          icon={<IconBuilding size={14} />}
                        >
                          {acc.name}
                        </Chip>
                      ))}
                    </div>
                  )}

                  <Input
                    value={origin}
                    onChange={handleOriginChange}
                    placeholder="예: 집, 서울역"
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
                          variant={
                            transport === t.value ? "selected" : "default"
                          }
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
                  <div className="flex items-center justify-between mb-1">
                    <Label className="mb-0">소요 시간 · 거리</Label>
                    <button
                      type="button"
                      onClick={handleAutoCalculate}
                      disabled={!canAutoCalculate || calculating}
                      title={
                        canAutoCalculate
                          ? "카카오 지도 기반 자동 계산"
                          : autoCalculateReason()
                      }
                      className="inline-flex items-center gap-1 px-2 py-1 rounded-md text-[11px] text-accent bg-accent/10 hover:bg-accent/20 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                    >
                      {calculating ? (
                        <IconLoader2 size={12} className="animate-spin" />
                      ) : (
                        <IconCompass size={12} />
                      )}
                      자동 계산
                    </button>
                  </div>
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
                  {!canAutoCalculate && (
                    <p className="text-[10px] text-text-subtle mt-1">
                      자동 계산 조건: {autoCalculateReason()}
                    </p>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* ============ 시간 (자식) ============ */}
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

          {/* ============ 식당 정보 ============ */}
          {type === "식당" && (
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
                <Label>음식 종류 (여러 개 선택 가능)</Label>
                <div className="flex flex-wrap gap-2">
                  {FOOD_TYPES.map((f) => (
                    <Chip
                      key={f}
                      variant={foodTypes.includes(f) ? "selected" : "default"}
                      onClick={() =>
                        toggleFromArray(foodTypes, f, setFoodTypes)
                      }
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

          {/* ============ 렌트카 정보 ============ */}
          {!isSubActivity && type === "렌트카" && (
            <div className="pt-2 border-t border-border space-y-3">
              <p className="text-xs text-text-muted tracking-wide">
                렌트카 정보
              </p>

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

          {/* ============ 비용 · 평점 ============ */}
          <div>
            <Label>
              {!isSubActivity && type === "렌트카"
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

          {/* ============ 사진 (편집 모드 · 부모만) ============ */}
          {isEditing && !isSubActivity && initialData?.id && (
            <div className="pt-2 border-t border-border">
              <PhotoUploader
                activityId={initialData.id}
                onOpenGallery={(idx) => setGalleryOpenAt(idx)}
              />
            </div>
          )}

          {/* ============ 메모 ============ */}
          <div>
            <Label>메모</Label>
            <Textarea
              value={memo}
              onChange={(e) => setMemo(e.target.value)}
              placeholder={
                isAccommodationEvent
                  ? "예: 체크인, 사우나 이용, 밤 복귀"
                  : "선택 사항"
              }
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
      {showPlaceSearch && (
        <PlaceSearchModal
          initialKeyword={name}
          onSelect={handlePlaceSelect}
          onClose={() => setShowPlaceSearch(false)}
        />
      )}
      {galleryOpenAt !== null && photos.length > 0 && (
        <PhotoGallery
          photos={photos}
          urlMap={urlMap}
          startIndex={galleryOpenAt}
          onClose={() => setGalleryOpenAt(null)}
        />
      )}
    </>
  );
}

export default ActivityForm;
