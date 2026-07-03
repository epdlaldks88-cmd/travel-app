/**
 * Badge
 *
 * 숫자/상태 표시용 작은 뱃지.
 *
 * Props:
 *   variant - 'default' (기본) | 'accent' | 'danger' | 'success' | 'muted'
 *   size    - 'sm' (기본) | 'md'
 *   dot     - true 면 텍스트 없이 점만
 */

const variantMap = {
  default: 'bg-surface-alt text-text',
  accent: 'bg-accent text-accent-fg',
  danger: 'bg-danger text-white',
  success: 'bg-success text-white',
  muted: 'bg-border text-text-muted',
};

const sizeMap = {
  sm: 'h-5 min-w-5 px-1.5 text-xs',
  md: 'h-6 min-w-6 px-2 text-sm',
};

const dotSizeMap = {
  sm: 'w-2 h-2',
  md: 'w-2.5 h-2.5',
};

export default function Badge({
  variant = 'default',
  size = 'sm',
  dot = false,
  className = '',
  children,
  ...rest
}) {
  if (dot) {
    return (
      <span
        className={[
          'inline-block rounded-full',
          variantMap[variant].split(' ')[0], // bg-* 만 가져오기
          dotSizeMap[size],
          className,
        ]
          .filter(Boolean)
          .join(' ')}
        {...rest}
      />
    );
  }

  return (
    <span
      className={[
        'inline-flex items-center justify-center',
        'rounded-full font-semibold leading-none',
        variantMap[variant],
        sizeMap[size],
        className,
      ]
        .filter(Boolean)
        .join(' ')}
      {...rest}
    >
      {children}
    </span>
  );
}
