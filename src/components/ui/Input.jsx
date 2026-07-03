import { forwardRef } from 'react';

/**
 * Input
 *
 * Props:
 *   error - boolean 또는 문자열. true/문자열이면 border-danger + 에러 메시지 표시
 *   size  - 'sm' | 'md' (기본)
 *   기타 <input> 표준 props 모두 전달
 */

const sizeMap = {
  sm: 'h-9 px-3 text-sm rounded-lg',
  md: 'h-11 px-3.5 text-base rounded-xl',
};

const Input = forwardRef(function Input(
  {
    error = false,
    size = 'md',
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
      <input
        ref={ref}
        disabled={disabled}
        className={[
          'w-full bg-surface-alt text-text placeholder:text-text-subtle',
          'border transition-colors outline-none',
          'focus:border-border-strong focus:bg-surface',
          'disabled:opacity-50 disabled:cursor-not-allowed',
          hasError ? 'border-danger' : 'border-border',
          sizeMap[size],
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

export default Input;
