import { useRef, useState } from "react";
import {
  IconPhotoPlus,
  IconTrash,
  IconLoader2,
  IconStar,
  IconStarFilled,
} from "@tabler/icons-react";
import { Button } from "./ui";
import {
  useActivityPhotos,
  useAddActivityPhoto,
  useDeleteActivityPhoto,
  useUpdateActivityPhotoOrder,
  usePhotoUrls,
} from "../data/hooks";
import { useToast } from "./Toast";

const MAX_PHOTOS = 50;

/**
 * 액티비티 편집 시 사진 업로드/삭제/대표 지정 섹션.
 */
function PhotoUploader({ activityId, onOpenGallery }) {
  const photos = useActivityPhotos(activityId);
  const addPhoto = useAddActivityPhoto();
  const deletePhoto = useDeleteActivityPhoto();
  const updateOrder = useUpdateActivityPhotoOrder();
  const toast = useToast();

  const fileInputRef = useRef(null);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState({ done: 0, total: 0 });

  const urlMap = usePhotoUrls(photos);

  const currentCount = photos?.length ?? 0;
  const remaining = MAX_PHOTOS - currentCount;

  // 첫 번째 사진 = 대표 (sortOrder 오름차순 정렬 기준)
  const coverId = photos?.[0]?.id;

  const handleFileChange = async (e) => {
    const files = Array.from(e.target.files || []);
    e.target.value = "";

    if (files.length === 0) return;

    if (files.length > remaining) {
      toast.error(
        `최대 ${MAX_PHOTOS}장까지 등록 가능합니다 (남은 자리: ${remaining}장)`,
      );
      return;
    }

    setUploading(true);
    setProgress({ done: 0, total: files.length });

    let successCount = 0;
    const failedFiles = [];

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      try {
        await addPhoto(activityId, file, currentCount + i);
        successCount++;
      } catch (err) {
        console.error(`[photo] 업로드 실패 (${file.name}):`, err);
        failedFiles.push(file.name);
      }
      setProgress({ done: i + 1, total: files.length });
    }

    setUploading(false);
    setProgress({ done: 0, total: 0 });

    if (successCount > 0) {
      toast.success(`사진 ${successCount}장 업로드 완료`);
    }
    if (failedFiles.length > 0) {
      toast.error(`${failedFiles.length}장 업로드 실패`);
    }
  };

  const handleDelete = async (photo) => {
    if (!confirm("이 사진을 삭제하시겠습니까?")) return;
    try {
      await deletePhoto(photo.id);
      toast.success("사진이 삭제되었습니다");
    } catch (err) {
      console.error("[photo] 삭제 실패:", err);
      toast.error("삭제 실패");
    }
  };

  /**
   * 대표로 지정: 이 사진의 sortOrder를 (최소값 - 1)로 만들어 맨 앞으로.
   * 다른 사진들은 그대로 유지 (상대 순서 보존).
   */
  const handleSetCover = async (photo) => {
    if (photo.id === coverId) return; // 이미 대표
    try {
      const minSort = Math.min(...photos.map((p) => p.sortOrder ?? 0));
      await updateOrder(photo.id, minSort - 1);
      toast.success("대표 사진이 변경되었습니다");
    } catch (err) {
      console.error("[photo] 대표 지정 실패:", err);
      toast.error("변경 실패");
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs text-text-muted tracking-wide">
          사진 ({currentCount}/{MAX_PHOTOS})
        </span>
        <Button
          variant="secondary"
          size="sm"
          onClick={() => fileInputRef.current?.click()}
          disabled={uploading || remaining <= 0}
          leftIcon={
            uploading ? (
              <IconLoader2 size={14} className="animate-spin" />
            ) : (
              <IconPhotoPlus size={14} />
            )
          }
        >
          {uploading
            ? `${progress.done}/${progress.total}`
            : remaining <= 0
              ? "가득 참"
              : "추가"}
        </Button>
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        multiple
        onChange={handleFileChange}
        className="hidden"
      />

      {currentCount === 0 && !uploading && (
        <p className="text-xs text-text-subtle py-6 text-center">
          아직 사진이 없습니다
        </p>
      )}

      {currentCount > 0 && (
        <>
          <p className="text-[10px] text-text-subtle mb-1.5">
            별표 아이콘을 눌러 대표 사진(카드 썸네일)을 변경할 수 있습니다
          </p>
          <div className="grid grid-cols-3 gap-1.5">
            {photos.map((photo, idx) => {
              const url = urlMap[photo.storagePath];
              const isCover = photo.id === coverId;
              return (
                <div
                  key={photo.id}
                  className="relative aspect-square rounded-lg overflow-hidden bg-surface-alt group"
                >
                  {url ? (
                    <button
                      type="button"
                      onClick={() => onOpenGallery?.(idx)}
                      className="w-full h-full block"
                      aria-label="사진 크게 보기"
                    >
                      <img
                        src={url}
                        alt=""
                        className="w-full h-full object-cover"
                        loading="lazy"
                      />
                    </button>
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <IconLoader2
                        size={16}
                        className="animate-spin text-text-subtle"
                      />
                    </div>
                  )}

                  {/* 대표 지정 버튼 (좌상단) */}
                  <button
                    type="button"
                    onClick={() => handleSetCover(photo)}
                    aria-label={isCover ? "현재 대표 사진" : "대표로 지정"}
                    title={isCover ? "현재 대표 사진" : "대표로 지정"}
                    className={`
                      absolute top-1 left-1 p-1 rounded-full transition-colors
                      ${
                        isCover
                          ? "bg-accent text-white"
                          : "bg-black/50 text-white/70 hover:text-white hover:bg-black/70 opacity-0 group-hover:opacity-100"
                      }
                    `}
                  >
                    {isCover ? (
                      <IconStarFilled size={12} />
                    ) : (
                      <IconStar size={12} />
                    )}
                  </button>

                  {/* 삭제 버튼 (우상단) */}
                  <button
                    type="button"
                    onClick={() => handleDelete(photo)}
                    aria-label="사진 삭제"
                    className="absolute top-1 right-1 p-1 rounded-full bg-black/50 text-white hover:bg-black/70 transition-colors opacity-0 group-hover:opacity-100"
                  >
                    <IconTrash size={12} />
                  </button>
                </div>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}

export default PhotoUploader;
