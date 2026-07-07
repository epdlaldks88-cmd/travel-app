import { useState, useEffect, useRef } from "react";
import {
  IconX,
  IconSearch,
  IconMapPin,
  IconLoader2,
} from "@tabler/icons-react";
import { Button, Input } from "./ui";
import { searchPlacesByKeyword } from "../lib/kakaoMaps";

/**
 * 카카오 지도 장소 검색 모달.
 *
 * @param {Function} onSelect - (place) => void, 선택 시 호출
 *   place = { name, address, roadAddress, lat, lng, categoryName, placeUrl }
 * @param {Function} onClose - 모달 닫기
 * @param {string} initialKeyword - 초기 검색어 (선택)
 */
function PlaceSearchModal({ onSelect, onClose, initialKeyword = "" }) {
  const [keyword, setKeyword] = useState(initialKeyword);
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [searched, setSearched] = useState(false);
  const inputRef = useRef(null);

  useEffect(() => {
    // 모달 열리자마자 인풋에 포커스
    inputRef.current?.focus();
  }, []);

  useEffect(() => {
    // ESC로 닫기
    const handleKeyDown = (e) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  const handleSearch = async () => {
    const trimmed = keyword.trim();
    if (!trimmed) return;

    setLoading(true);
    setError(null);
    setSearched(true);

    try {
      const data = await searchPlacesByKeyword(trimmed);
      setResults(data);
    } catch (err) {
      console.error("[PlaceSearch]", err);
      setError(err.message || "검색 실패");
      setResults([]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleSearch();
    }
  };

  const handleSelect = (place) => {
    onSelect({
      name: place.place_name,
      address: place.road_address_name || place.address_name,
      roadAddress: place.road_address_name || "",
      lat: parseFloat(place.y),
      lng: parseFloat(place.x),
      categoryName: place.category_name || "",
      placeUrl: place.place_url || "",
    });
    onClose();
  };

  // 배경 클릭 시 닫기 (모달 내부 클릭은 이벤트 stop)
  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4"
      onClick={handleBackdropClick}
    >
      <div className="bg-surface rounded-xl w-full max-w-md max-h-[80vh] flex flex-col shadow-xl">
        {/* 헤더 */}
        <div className="flex items-center justify-between p-4 border-b border-border">
          <h3 className="text-sm font-medium text-text">장소 검색</h3>
          <button
            type="button"
            onClick={onClose}
            aria-label="닫기"
            className="p-1 rounded-full text-text-subtle hover:text-text hover:bg-surface-alt transition-colors"
          >
            <IconX size={18} />
          </button>
        </div>

        {/* 검색 입력 */}
        <div className="p-4 border-b border-border">
          <div className="flex gap-2">
            <div className="flex-1">
              <Input
                ref={inputRef}
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
                onKeyDown={handleKeyPress}
                placeholder="장소명, 주소로 검색 (예: 안목해변)"
              />
            </div>
            <Button
              variant="primary"
              onClick={handleSearch}
              disabled={!keyword.trim() || loading}
              leftIcon={<IconSearch size={16} />}
            >
              검색
            </Button>
          </div>
        </div>

        {/* 결과 리스트 */}
        <div className="flex-1 overflow-y-auto">
          {loading && (
            <div className="flex items-center justify-center py-8 text-text-muted">
              <IconLoader2 size={20} className="animate-spin" />
            </div>
          )}

          {!loading && error && (
            <div className="text-center py-8 text-danger text-sm">{error}</div>
          )}

          {!loading && !error && searched && results.length === 0 && (
            <div className="text-center py-8 text-text-muted text-sm">
              검색 결과가 없습니다
            </div>
          )}

          {!loading && !error && !searched && (
            <div className="text-center py-8 text-text-subtle text-sm">
              장소명이나 주소를 입력해 검색하세요
            </div>
          )}

          {!loading && results.length > 0 && (
            <ul className="divide-y divide-border">
              {results.map((place) => (
                <li key={place.id}>
                  <button
                    type="button"
                    onClick={() => handleSelect(place)}
                    className="w-full text-left p-3 hover:bg-surface-alt transition-colors"
                  >
                    <div className="flex items-start gap-2">
                      <IconMapPin
                        size={14}
                        className="text-text-muted mt-0.5 shrink-0"
                      />
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-text text-sm truncate">
                          {place.place_name}
                        </p>
                        {place.category_name && (
                          <p className="text-[11px] text-text-subtle truncate mt-0.5">
                            {place.category_name}
                          </p>
                        )}
                        <p className="text-xs text-text-muted mt-1 truncate">
                          {place.road_address_name || place.address_name}
                        </p>
                      </div>
                    </div>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}

export default PlaceSearchModal;
