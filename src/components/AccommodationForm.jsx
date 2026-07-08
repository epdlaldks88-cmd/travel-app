import { useState } from "react";
import { IconLocationSearch } from "@tabler/icons-react";
import { Button, Card, Input, Textarea, Label, Rating } from "./ui";
import PlaceSearchModal from "./PlaceSearchModal";

/**
 * 숙소 등록/편집 폼.
 *
 * 필드:
 *   - 이름 (필수)
 *   - 위치 (카카오 검색 재사용 → gpsLat/gpsLng 자동)
 *   - 체크인 날짜 (여행 범위 내)
 *   - 체크인 시간
 *   - 박 수 (기본 1) → 체크아웃 날짜 자동 계산 표시
 *   - 체크아웃 시간
 *   - 총 비용
 *   - 평점
 *   - 메모
 */
function AccommodationForm({
  initialData = null,
  tripStartDate,
  tripEndDate,
  onSubmit,
  onCancel,
}) {
  const isEditing = !!initialData;

  const [name, setName] = useState(initialData?.name ?? "");
  const [location, setLocation] = useState(initialData?.location ?? "");
  const [gpsLat, setGpsLat] = useState(initialData?.gpsLat ?? null);
  const [gpsLng, setGpsLng] = useState(initialData?.gpsLng ?? null);

  const [checkInDate, setCheckInDate] = useState(
    initialData?.checkInDate ?? tripStartDate ?? "",
  );
  const [checkInTime, setCheckInTime] = useState(
    initialData?.checkInTime ?? "",
  );
  const [nights, setNights] = useState(
    initialData?.nights ? String(initialData.nights) : "1",
  );
  const [checkOutTime, setCheckOutTime] = useState(
    initialData?.checkOutTime ?? "",
  );

  const [totalCost, setTotalCost] = useState(
    initialData?.totalCost != null ? String(initialData.totalCost) : "",
  );
  const [rating, setRating] = useState(initialData?.rating ?? 0);
  const [memo, setMemo] = useState(initialData?.memo ?? "");

  const [showPlaceSearch, setShowPlaceSearch] = useState(false);

  const getComputedCheckOutDate = () => {
    if (!checkInDate || !nights || Number(nights) < 1) return "";
    const d = new Date(checkInDate);
    d.setDate(d.getDate() + Number(nights));
    return d.toISOString().slice(0, 10);
  };

  const formatDate = (str) => (str ? str.replaceAll("-", ".") : "");

  const handlePlaceSelect = (place) => {
    setName(place.name);
    setLocation(place.address);
    setGpsLat(place.lat);
    setGpsLng(place.lng);
  };

  const handleSubmit = () => {
    if (!name.trim()) {
      alert("숙소명을 입력하세요");
      return;
    }

    const nightsNum = nights ? Number(nights) : 1;
    const checkOutDate = getComputedCheckOutDate();

    const payload = {
      name: name.trim(),
      location: location.trim(),
      gpsLat,
      gpsLng,
      checkInDate: checkInDate || null,
      checkInTime: checkInTime || null,
      checkOutDate: checkOutDate || null,
      checkOutTime: checkOutTime || null,
      nights: nightsNum,
      totalCost: totalCost ? Number(totalCost) : 0,
      rating,
      memo,
    };

    onSubmit(payload);
  };

  return (
    <>
      <Card padding="md" className="mb-3">
        <h3 className="text-sm font-medium text-text mb-3">
          {isEditing ? "숙소 편집" : "새 숙소 추가"}
        </h3>

        <div className="space-y-3">
          {/* 숙소명 + 검색 */}
          <div>
            <Label>숙소명</Label>
            <div className="flex gap-2">
              <div className="flex-1">
                <Input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="예: 체스터톤스 속초"
                />
              </div>
              <button
                type="button"
                onClick={() => setShowPlaceSearch(true)}
                aria-label="장소 검색"
                title="카카오 지도에서 검색"
                className="w-11 h-11 shrink-0 rounded-xl flex items-center justify-center bg-surface-alt text-text-muted hover:text-text hover:bg-surface border border-border transition-colors"
              >
                <IconLocationSearch size={18} />
              </button>
            </div>
          </div>

          {/* 위치 */}
          <div>
            <Label>위치</Label>
            <Input
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="예: 강원도 속초시 대포항길 12"
            />
          </div>

          {/* 체크인 날짜 · 시간 */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label>체크인 날짜</Label>
              <Input
                type="date"
                value={checkInDate}
                min={tripStartDate}
                max={tripEndDate}
                onChange={(e) => setCheckInDate(e.target.value)}
              />
            </div>
            <div>
              <Label>체크인 시각</Label>
              <Input
                type="time"
                value={checkInTime}
                onChange={(e) => setCheckInTime(e.target.value)}
              />
            </div>
          </div>

          {/* 박 수 · 체크아웃 날짜 자동 */}
          <div>
            <Label>박 수</Label>
            <div className="flex items-center gap-2 flex-wrap">
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
              {nights && Number(nights) >= 1 && checkInDate && (
                <span className="text-xs text-text-muted">
                  체크아웃: {formatDate(getComputedCheckOutDate())}
                </span>
              )}
            </div>
          </div>

          {/* 체크아웃 시각 */}
          <div>
            <Label>체크아웃 시각 (선택)</Label>
            <Input
              type="time"
              value={checkOutTime}
              onChange={(e) => setCheckOutTime(e.target.value)}
            />
          </div>

          {/* 총 비용 */}
          <div>
            <Label>총 숙박비 (원)</Label>
            <Input
              type="number"
              value={totalCost}
              onChange={(e) => setTotalCost(e.target.value)}
              placeholder="0"
            />
          </div>

          {/* 평점 */}
          <div>
            <Label>평점</Label>
            <Rating value={rating} onChange={setRating} size="lg" />
          </div>

          {/* 메모 */}
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

          {/* 버튼 */}
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
    </>
  );
}

export default AccommodationForm;
