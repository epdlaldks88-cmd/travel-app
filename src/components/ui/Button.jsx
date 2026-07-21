import { IconLoader2 } from '@tabler/icons-react';

/**
 * Button
 *
 * Props:
 *   variant   - 'primary' (기본) | 'secondary' | 'ghost' | 'danger'
 *   size      - 'sm' | 'md' (기본) | 'lg'
 *   leftIcon  - JSX (아이콘 요소)
 *   rightIcon - JSX
 *   loading   - true 면 스피너 + disabled
 *   disabled  - true 면 클릭 불가
 *   fullWidth - true 면 w-full
 *   type      - 'button' (기본) | 'submit' | 'reset'
 */

const variantMap = {
  primary:
    'bg-accent text-accent-fg hover:opacity-90 active:opacity-80 disabled:opacity-40',
  secondary:
    'bg-surface text-text border border-border hover:bg-surface-alt active:bg-surface-alt disabled:opacity-40',
  ghost:
    'bg-transparent text-text hover:bg-surface-alt active:bg-surface-alt disabled:opacity-40',
  danger:
    'bg-danger text-white hover:opacity-90 active:opacity-80 disabled:opacity-40',
};

const sizeMap = {
  sm: 'h-8 px-3 text-sm gap-1.5 rounded-lg',
  md: 'h-10 px-4 text-base gap-2 rounded-xl',
  lg: 'h-12 px-5 text-lg gap-2 rounded-xl',
};

const iconSizeMap = {
  sm: 16,
  md: 18,
  lg: 20,
};

export default function Button({
  variant = 'primary',
  size = 'md',
  leftIcon,
  rightIcon,
  loading = false,
  disabled = false,
  fullWidth = false,
  type = 'button',
  className = '',
  onClick,
  children,
  ...rest
}) {
  const isDisabled = disabled || loading;
  const iconSize = iconSizeMap[size];

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={isDisabled}
      className={[
        'inline-flex items-center justify-center font-medium',
        'transition-all duration-200 ease-out',
        'hover:scale-[1.015] active:scale-[0.985] hover:shadow-sm disabled:hover:scale-100 disabled:active:scale-100 disabled:shadow-none',
        'disabled:cursor-not-allowed select-none',
        variantMap[variant],
        sizeMap[size],
        fullWidth ? 'w-full' : '',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
      {...rest}
    >
      {loading ? (
        <IconLoader2 size={iconSize} className="animate-spin" />
      ) : (
        leftIcon
      )}
      {children}
      {!loading && rightIcon}
    </button>
  );
}
