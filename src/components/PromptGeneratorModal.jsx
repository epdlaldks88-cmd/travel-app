import { useMemo, useState } from "react";
import { IconX, IconCopy, IconCheck, IconSparkles } from "@tabler/icons-react";
import { Button, Card } from "./ui";
import { buildPrompt } from "../lib/generatePrompt";
import { useProfile } from "../data/hooks";
import { useToast } from "./Toast";

/**
 * AI 이미지 생성용 프롬프트 생성 모달.
 * 여행 데이터 기반 한국어 인포그래픽 프롬프트 → 복사 → Gemini/ChatGPT에 붙여넣기.
 */
function PromptGeneratorModal({ trip, activities, onClose }) {
  const profile = useProfile();
  const [copied, setCopied] = useState(false);
  const toast = useToast();

  const flatActivities = useMemo(() => {
    const result = [];
    for (const a of activities || []) {
      result.push(a);
      if (a.children?.length) {
        for (const c of a.children) result.push(c);
      }
    }
    return result;
  }, [activities]);

  const prompt = useMemo(
    () => buildPrompt({ trip, activities: flatActivities, profile }),
    [trip, flatActivities, profile],
  );

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(prompt);
      setCopied(true);
      toast.success("프롬프트가 복사되었습니다");
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("복사 실패:", err);
      toast.error("복사 실패");
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-black/60 flex items-end sm:items-center justify-center"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="bg-bg w-full sm:max-w-lg sm:rounded-2xl rounded-t-2xl max-h-[85vh] overflow-y-auto">
        {/* 헤더 */}
        <div className="sticky top-0 bg-bg px-4 py-3 border-b border-border flex items-center justify-between z-10">
          <div className="flex items-center gap-2">
            <IconSparkles size={18} className="text-accent" />
            <h2 className="font-heading text-base font-medium text-text">
              AI 인포그래픽 프롬프트
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="닫기"
            className="p-1 rounded-full text-text-muted hover:text-text hover:bg-surface-alt transition-colors"
          >
            <IconX size={18} />
          </button>
        </div>

        <div className="p-4 space-y-4">
          {/* 안내 */}
          <p className="text-xs text-text-muted">
            프롬프트를 복사한 뒤 <b>Gemini</b>나 <b>ChatGPT</b>에 붙여넣어 여행
            요약 이미지를 생성하세요
          </p>

          {/* 프롬프트 미리보기 */}
          <div>
            <p className="text-[11px] text-text-subtle mb-2 tracking-wide">
              프롬프트
            </p>
            <Card padding="md">
              <p className="text-xs text-text leading-relaxed break-words whitespace-pre-wrap">
                {prompt}
              </p>
            </Card>
          </div>

          {/* 복사 버튼 */}
          <Button
            variant="primary"
            onClick={handleCopy}
            fullWidth
            size="lg"
            leftIcon={copied ? <IconCheck size={18} /> : <IconCopy size={18} />}
          >
            {copied ? "복사됨" : "프롬프트 복사"}
          </Button>

          {/* 팁 */}
          <div className="text-[10px] text-text-subtle space-y-1 pt-2 border-t border-border">
            <p>· Gemini · ChatGPT: 그대로 붙여넣으면 이미지 생성</p>
            <p>· 결과가 아쉬우면 "다시 만들어줘" 또는 세부 지시 추가</p>
            <p>· 생성된 이미지를 다운로드해 여행 커버로 업로드하세요</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default PromptGeneratorModal;
