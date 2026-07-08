import { useCallback, useEffect, useState } from "react";
import {
  IconX,
  IconChevronLeft,
  IconChevronRight,
  IconLoader2,
} from "@tabler/icons-react";

/**
 * 전체 화면 사진 뷰어.
 * - 좌우 화살표 / 스와이프 / 키보드로 이동
 * - ESC / 뒤로가기 / 배경 클릭으로 닫기
 * - 인접 사진(앞뒤 1장) 프리로드로 넘김 속도 개선
 *
 * @param photos - [{ id, storagePath, ... }]
 * @param urlMap - { [storagePath]: signedUrl }
 * @param startIndex - 시작 인덱스
 * @param onClose - 닫기 콜백
 */
function PhotoGallery({ photos, urlMap, startIndex = 0, onClose }) {
  const [index, setIndex] = useState(startIndex);
  const [touchStart, setTouchStart] = useState(null);
  const [loaded, setLoaded] = useState(new Set());

  const total = photos.length;

  const goPrev = useCallback(() => {
    setIndex((i) => (i - 1 + total) % total);
  }, [total]);

  const goNext = useCallback(() => {
    setIndex((i) => (i + 1) % total);
  }, [total]);

  // 키보드
  useEffect(() => {
    const handler = (e) => {
      if (e.key === "Escape") onClose();
      else if (e.key === "ArrowLeft") goPrev();
      else if (e.key === "ArrowRight") goNext();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [goPrev, goNext, onClose]);

  // 뒤로가기 (모바일)
  useEffect(() => {
    const state = { photoGallery: true };
    window.history.pushState(state, "");
    const handler = () => onClose();
    window.addEventListener("popstate", handler);
    return () => {
      window.removeEventListener("popstate", handler);
    };
  }, [onClose]);

  const handleClose = () => {
    if (window.history.state?.photoGallery) {
      window.history.back();
    } else {
      onClose();
    }
  };

  // 스크롤 잠금
  useEffect(() => {
    const original = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = original;
    };
  }, []);

  // ⭐ 인접 이미지 프리로드 (현재 + 앞뒤 각 1장)
  useEffect(() => {
    const targetIndices = [
      index,
      (index - 1 + total) % total,
      (index + 1) % total,
    ];
    for (const i of targetIndices) {
      const photo = photos[i];
      const url = photo && urlMap[photo.storagePath];
      if (!url || loaded.has(photo.storagePath)) continue;

      const img = new Image();
      img.onload = () => {
        setLoaded((prev) => {
          if (prev.has(photo.storagePath)) return prev;
          const next = new Set(prev);
          next.add(photo.storagePath);
          return next;
        });
      };
      img.src = url;
    }
  }, [index, photos, urlMap, total, loaded]);

  // 터치 스와이프
  const handleTouchStart = (e) => {
    setTouchStart(e.touches[0].clientX);
  };

  const handleTouchEnd = (e) => {
    if (touchStart === null) return;
    const touchEnd = e.changedTouches[0].clientX;
    const diff = touchStart - touchEnd;
    if (Math.abs(diff) > 50) {
      if (diff > 0) goNext();
      else goPrev();
    }
    setTouchStart(null);
  };

  const currentPhoto = photos[index];
  const currentUrl = urlMap[currentPhoto?.storagePath];
  const isCurrentLoaded = currentPhoto && loaded.has(currentPhoto.storagePath);

  return (
    <div
      className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center"
      onClick={(e) => {
        if (e.target === e.currentTarget) handleClose();
      }}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      {/* 닫기 */}
      <button
        type="button"
        onClick={handleClose}
        aria-label="닫기"
        className="absolute top-4 right-4 p-2 rounded-full bg-black/40 text-white hover:bg-black/60 transition-colors z-10"
      >
        <IconX size={20} />
      </button>

      {/* 카운터 */}
      {total > 1 && (
        <div className="absolute top-4 left-4 px-3 py-1 rounded-full bg-black/40 text-white text-xs z-10">
          {index + 1} / {total}
        </div>
      )}

      {/* 이전 */}
      {total > 1 && (
        <button
          type="button"
          onClick={goPrev}
          aria-label="이전"
          className="absolute left-2 md:left-6 p-3 rounded-full bg-black/40 text-white hover:bg-black/60 transition-colors z-10"
        >
          <IconChevronLeft size={24} />
        </button>
      )}

      {/* 이미지 + 로딩 스피너 */}
      <div className="relative flex items-center justify-center max-w-full max-h-full">
        {currentUrl && (
          <img
            key={currentPhoto.storagePath}
            src={currentUrl}
            alt=""
            className={`max-w-full max-h-full object-contain select-none transition-opacity duration-150 ${
              isCurrentLoaded ? "opacity-100" : "opacity-0"
            }`}
            draggable={false}
            onLoad={() =>
              setLoaded((prev) => {
                if (prev.has(currentPhoto.storagePath)) return prev;
                const next = new Set(prev);
                next.add(currentPhoto.storagePath);
                return next;
              })
            }
          />
        )}
        {(!currentUrl || !isCurrentLoaded) && (
          <div className="absolute inset-0 flex items-center justify-center">
            <IconLoader2 size={32} className="animate-spin text-white/70" />
          </div>
        )}
      </div>

      {/* 다음 */}
      {total > 1 && (
        <button
          type="button"
          onClick={goNext}
          aria-label="다음"
          className="absolute right-2 md:right-6 p-3 rounded-full bg-black/40 text-white hover:bg-black/60 transition-colors z-10"
        >
          <IconChevronRight size={24} />
        </button>
      )}
    </div>
  );
}

export default PhotoGallery;
