import { forwardRef } from 'react';

/**
 * Textarea
 *
 * Props:
 *   error - boolean 또는 문자열
 *   rows  - 기본 4
 *   기타 <textarea> 표준 props 모두 전달
 */

const Textarea = forwardRef(function Textarea(
  {
    error = false,
    rows = 4,
    className = '',
    disabled = false,
    ...rest
  },
  ref
) {
  const hasError = Boolean(error);
  const errorMsg = typeof error === 'string' ? error : null;

  return (
    <div className="w-full">
      <textarea
        ref={ref}
        rows={rows}
        disabled={disabled}
        className={[
          'w-full bg-surface-alt text-text placeholder:text-text-subtle',
          'border transition-colors outline-none',
          'px-3.5 py-3 text-base rounded-xl resize-y',
          'focus:border-border-strong focus:bg-surface',
          'disabled:opacity-50 disabled:cursor-not-allowed',
          hasError ? 'border-danger' : 'border-border',
          className,
        ]
          .filter(Boolean)
          .join(' ')}
        {...rest}
      />
      {errorMsg && (
        <p className="mt-1.5 text-sm text-danger">{errorMsg}</p>
      )}
    </div>
  );
});

export default Textarea;
