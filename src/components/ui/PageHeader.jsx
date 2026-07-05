import { IconArrowLeft } from "@tabler/icons-react";

/**
 * PageHeader
 *
 * 페이지 최상단 헤더.
 *
 * Props:
 *   title    - 타이틀 텍스트
 *   back     - true 면 뒤로가기 버튼 표시
 *   onBack   - 뒤로가기 커스텀 핸들러 (없으면 history.back())
 *   action   - 우측 자유 배치 (저장/편집 버튼 등)
 *   sticky   - true 면 상단 고정 (기본 false)
 */

export default function PageHeader({
  title,
  back = false,
  onBack,
  action,
  sticky = false,
  className = "",
  ...rest
}) {
  const handleBack = () => {
    if (onBack) return onBack();
    if (typeof window !== "undefined") window.history.back();
  };

  return (
    <header
      className={[
        "w-full bg-bg border-b border-border",
        "flex items-center gap-2 px-4 h-14",
        sticky ? "sticky top-0 z-10" : "",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
      {...rest}
    >
      {back && (
        <button
          type="button"
          onClick={handleBack}
          aria-label="뒤로 가기"
          className="shrink-0 -ml-2 w-10 h-10 flex items-center justify-center rounded-full text-text hover:bg-surface-alt active:bg-surface-alt transition-colors"
        >
          <IconArrowLeft size={22} />
        </button>
      )}
      <h1 className="font-heading flex-1 min-w-0 truncate text-lg font-semibold text-text">
        {title}
      </h1>
      {action && <div className="shrink-0">{action}</div>}
    </header>
  );
}
