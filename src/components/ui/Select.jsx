import { forwardRef } from 'react';
import { IconChevronDown } from '@tabler/icons-react';

/**
 * Select
 *
 * 네이티브 <select> 사용 (모바일에서 시스템 UI 활용).
 *
 * Props:
 *   options     - [{ value, label }] 또는 [{ value, label, disabled }]
 *   value       - 현재 값
 *   onChange    - (e) => void
 *   placeholder - value 가 '' 일 때 보여줄 첫 옵션 텍스트
 *   error       - boolean 또는 문자열
 *   size        - 'sm' | 'md' (기본)
 */

const sizeMap = {
  sm: 'h-9 pl-3 pr-9 text-sm rounded-lg',
  md: 'h-11 pl-3.5 pr-10 text-base rounded-xl',
};

const Select = forwardRef(function Select(
  {
    options = [],
    value,
    onChange,
    placeholder,
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
      <div className="relative">
        <select
          ref={ref}
          value={value}
          onChange={onChange}
          disabled={disabled}
          className={[
            'w-full appearance-none bg-surface-alt text-text',
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
        >
          {placeholder && (
            <option value="" disabled hidden>
              {placeholder}
            </option>
          )}
          {options.map((opt) => (
            <option
              key={opt.value}
              value={opt.value}
              disabled={opt.disabled}
            >
              {opt.label}
            </option>
          ))}
        </select>
        <IconChevronDown
          size={size === 'sm' ? 16 : 18}
          className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-text-muted"
        />
      </div>
      {errorMsg && (
        <p className="mt-1.5 text-sm text-danger">{errorMsg}</p>
      )}
    </div>
  );
});

export default Select;
