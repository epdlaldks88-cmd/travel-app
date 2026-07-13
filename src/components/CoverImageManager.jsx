import { useRef, useState } from "react";
import {
  IconX,
  IconUpload,
  IconTrash,
  IconLoader2,
  IconPhoto,
} from "@tabler/icons-react";
import { Button } from "./ui";
import { useUpdateTripCover, useDeleteTripCover } from "../data/hooks";
import { useToast } from "./Toast";

/**
 * 여행 커버 이미지 관리 모달.
 * 업로드/변경/제거 옵션.
 */
function CoverImageManager({ tripId, hasCover, onClose }) {
  const updateCover = useUpdateTripCover();
  const deleteCover = useDeleteTripCover();
  const toast = useToast();

  const fileInputRef = useRef(null);
  const [uploading, setUploading] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const handlePickFile = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;

    setUploading(true);
    try {
      await updateCover(tripId, file);
      toast.success("커버 이미지가 저장되었습니다");
      onClose();
    } catch (err) {
      console.error("[cover] 업로드 실패:", err);
      toast.error("업로드 실패: " + (err.message || "알 수 없는 오류"));
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm("커버 이미지를 제거하시겠습니까?")) return;
    setDeleting(true);
    try {
      await deleteCover(tripId);
      toast.success("커버 이미지가 제거되었습니다");
      onClose();
    } catch (err) {
      console.error("[cover] 제거 실패:", err);
      toast.error("제거 실패");
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-black/60 flex items-end sm:items-center justify-center"
      onClick={(e) => {
        if (e.target === e.currentTarget && !uploading && !deleting) onClose();
      }}
    >
      <div className="bg-bg w-full sm:max-w-sm sm:rounded-2xl rounded-t-2xl">
        <div className="px-4 py-3 border-b border-border flex items-center justify-between">
          <div className="flex items-center gap-2">
            <IconPhoto size={18} className="text-accent" />
            <h2 className="font-heading text-base font-medium text-text">
              커버 이미지
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={uploading || deleting}
            aria-label="닫기"
            className="p-1 rounded-full text-text-muted hover:text-text hover:bg-surface-alt transition-colors disabled:opacity-50"
          >
            <IconX size={18} />
          </button>
        </div>

        <div className="p-4 space-y-2">
          <Button
            variant="primary"
            onClick={handlePickFile}
            fullWidth
            size="lg"
            disabled={uploading || deleting}
            leftIcon={
              uploading ? (
                <IconLoader2 size={18} className="animate-spin" />
              ) : (
                <IconUpload size={18} />
              )
            }
          >
            {uploading
              ? "업로드 중..."
              : hasCover
                ? "이미지 변경"
                : "이미지 업로드"}
          </Button>

          {hasCover && (
            <Button
              variant="secondary"
              onClick={handleDelete}
              fullWidth
              size="lg"
              disabled={uploading || deleting}
              leftIcon={
                deleting ? (
                  <IconLoader2 size={18} className="animate-spin" />
                ) : (
                  <IconTrash size={18} />
                )
              }
            >
              {deleting ? "제거 중..." : "커버 제거"}
            </Button>
          )}

          <p className="text-[10px] text-text-subtle text-center pt-2">
            AI로 만든 여행 요약 이미지를 업로드하세요
          </p>
        </div>

        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileChange}
          className="hidden"
        />
      </div>
    </div>
  );
}

export default CoverImageManager;
