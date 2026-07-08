import { useCallback, useEffect, useState } from "react";
import { IconX, IconChevronLeft, IconChevronRight } from "@tabler/icons-react";

/**
 * 전체 화면 사진 뷰어.
 * - 좌우 화살표 / 스와이프 / 키보드로 이동
 * - ESC / 뒤로가기 / 배경 클릭으로 닫기
 *
 * @param photos - [{ id, storagePath, ... }]
 * @param urlMap - { [storagePath]: signedUrl }
 * @param startIndex - 시작 인덱스
 * @param onClose - 닫기 콜백
 */
function PhotoGallery({ photos, urlMap, startIndex = 0, onClose }) {
  const [index, setIndex] = useState(startIndex);
  const [touchStart, setTouchStart] = useState(null);

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
    // pushState 한 것 되돌리기
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

  return (
    <div
      className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center"
      onClick={(e) => {
        // 배경 클릭 시 닫기 (사진 자체 클릭은 제외)
        if (e.target === e.currentTarget) handleClose();
      }}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      {/* 닫기 버튼 */}
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

      {/* 이전 버튼 */}
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

      {/* 이미지 */}
      {currentUrl ? (
        <img
          src={currentUrl}
          alt=""
          className="max-w-full max-h-full object-contain select-none"
          draggable={false}
        />
      ) : (
        <div className="text-white text-sm">불러오는 중...</div>
      )}

      {/* 다음 버튼 */}
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
