/**
 * Section
 *
 * 페이지 내부의 그룹핑. 제목 + 설명 + 우측 액션 + 본문.
 *
 * Props:
 *   title       - 섹션 제목
 *   description - 제목 아래 보조 설명 (선택)
 *   action      - 우측 상단 자유 배치 (버튼 등)
 */

export default function Section({
  title,
  description,
  action,
  className = "",
  children,
  ...rest
}) {
  const hasHeader = title || description || action;

  return (
    <section
      className={["w-full", className].filter(Boolean).join(" ")}
      {...rest}
    >
      {hasHeader && (
        <div className="flex items-end justify-between gap-3 mb-3">
          <div className="min-w-0">
            {title && (
              <h2 className="font-heading text-lg font-semibold text-text leading-tight">
                {title}
              </h2>
            )}
            {description && (
              <p className="text-sm text-text-muted mt-1">{description}</p>
            )}
          </div>
          {action && <div className="shrink-0">{action}</div>}
        </div>
      )}
      {children}
    </section>
  );
}
