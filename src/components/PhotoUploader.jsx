import { useRef, useState } from "react";
import {
  IconPhotoPlus,
  IconTrash,
  IconLoader2,
  IconAlertCircle,
} from "@tabler/icons-react";
import { Button } from "./ui";
import {
  useActivityPhotos,
  useAddActivityPhoto,
  useDeleteActivityPhoto,
  usePhotoUrls,
} from "../data/hooks";

const MAX_PHOTOS = 50;

/**
 * 액티비티 편집 시 사진 업로드/삭제 섹션.
 * 편집 모드에서만 노출 (신규 액티비티는 activityId 없어서 사용 불가).
 */
function PhotoUploader({ activityId, onOpenGallery }) {
  const photos = useActivityPhotos(activityId);
  const addPhoto = useAddActivityPhoto();
  const deletePhoto = useDeleteActivityPhoto();

  const fileInputRef = useRef(null);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState({ done: 0, total: 0 });
  const [errors, setErrors] = useState([]);

  const urlMap = usePhotoUrls(photos);

  const currentCount = photos?.length ?? 0;
  const remaining = MAX_PHOTOS - currentCount;

  const handleFileChange = async (e) => {
    const files = Array.from(e.target.files || []);
    e.target.value = ""; // 같은 파일 재선택 가능하게

    if (files.length === 0) return;

    // 갯수 제한
    if (files.length > remaining) {
      alert(
        `최대 ${MAX_PHOTOS}장까지 등록 가능합니다. (남은 자리: ${remaining}장)`,
      );
      return;
    }

    setUploading(true);
    setErrors([]);
    setProgress({ done: 0, total: files.length });

    const failedFiles = [];

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      try {
        // 새 사진의 sortOrder = 기존 개수 + 인덱스
        await addPhoto(activityId, file, currentCount + i);
      } catch (err) {
        console.error(`[photo] 업로드 실패 (${file.name}):`, err);
        failedFiles.push({ name: file.name, message: err.message });
      }
      setProgress({ done: i + 1, total: files.length });
    }

    setUploading(false);
    setProgress({ done: 0, total: 0 });

    if (failedFiles.length > 0) {
      setErrors(failedFiles);
      const summary = failedFiles.map((f) => `• ${f.name}`).join("\n");
      alert(`${failedFiles.length}장 업로드 실패:\n${summary}`);
    }
  };

  const handleDelete = async (photo) => {
    if (!confirm("이 사진을 삭제하시겠습니까?")) return;
    try {
      await deletePhoto(photo.id);
    } catch (err) {
      console.error("[photo] 삭제 실패:", err);
      alert(`삭제 실패: ${err.message}`);
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
        <div className="grid grid-cols-3 gap-1.5">
          {photos.map((photo, idx) => {
            const url = urlMap[photo.storagePath];
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
      )}

      {errors.length > 0 && (
        <div className="mt-2 p-2 rounded-lg bg-danger-bg text-xs text-danger flex items-start gap-2">
          <IconAlertCircle size={14} className="shrink-0 mt-0.5" />
          <div>
            <p className="font-medium">{errors.length}장 업로드 실패</p>
            <ul className="mt-1 text-danger/80">
              {errors.map((e, i) => (
                <li key={i}>{e.name}</li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
}

export default PhotoUploader;
