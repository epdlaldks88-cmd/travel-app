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
const PARALLEL_LIMIT = 3; // 동시 업로드 최대치

/**
 * 액티비티 편집 시 사진 업로드/삭제/대표 지정 섹션.
 * 병렬 업로드로 대량 사진 추가 시간 단축.
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
  const coverId = photos?.[0]?.id;

  /**
   * 여러 파일을 병렬로 업로드하되 동시 실행 개수를 PARALLEL_LIMIT으로 제한.
   * 리사이즈 + 업로드 + 메타 저장이 addPhoto 안에서 다 처리됨.
   */
  const uploadInBatches = async (files, baseSortOrder) => {
    let doneCount = 0;
    const failedFiles = [];

    // files를 PARALLEL_LIMIT 크기의 그룹으로 나눠 처리
    for (let i = 0; i < files.length; i += PARALLEL_LIMIT) {
      const batch = files.slice(i, i + PARALLEL_LIMIT);
      const results = await Promise.allSettled(
        batch.map((file, idx) =>
          addPhoto(activityId, file, baseSortOrder + i + idx),
        ),
      );

      for (let j = 0; j < results.length; j++) {
        const result = results[j];
        if (result.status === "fulfilled") {
          doneCount++;
        } else {
          console.error(
            `[photo] 업로드 실패 (${batch[j].name}):`,
            result.reason,
          );
          failedFiles.push(batch[j].name);
        }
        setProgress((prev) => ({ ...prev, done: prev.done + 1 }));
      }
    }

    return { doneCount, failedFiles };
  };

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

    const { doneCount, failedFiles } = await uploadInBatches(
      files,
      currentCount,
    );

    setUploading(false);
    setProgress({ done: 0, total: 0 });

    if (doneCount > 0) {
      toast.success(`사진 ${doneCount}장 업로드 완료`);
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

  const handleSetCover = async (photo) => {
    if (photo.id === coverId) return;
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
