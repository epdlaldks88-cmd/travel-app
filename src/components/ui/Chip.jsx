/**
 * Chip
 *
 * 카테고리 태그, 필터, 선택 상태 표시용.
 * onClick 유무로 인터랙션 여부 결정.
 *
 * Props:
 *   variant - 'default' (기본) | 'selected' | 'outline'
 *   icon    - JSX (좌측 아이콘)
 *   onClick - 클릭 핸들러 (있으면 button 으로 렌더)
 */

const variantMap = {
  default: 'bg-surface-alt text-text border border-transparent',
  selected: 'bg-accent text-accent-fg border border-transparent',
  outline: 'bg-transparent text-text border border-border',
};

const hoverMap = {
  default: 'hover:bg-border/60',
  selected: 'hover:opacity-90',
  outline: 'hover:bg-surface-alt',
};

export default function Chip({
  variant = 'default',
  icon,
  onClick,
  className = '',
  children,
  ...rest
}) {
  const clickable = typeof onClick === 'function';
  const Tag = clickable ? 'button' : 'span';

  return (
    <Tag
      type={clickable ? 'button' : undefined}
      onClick={onClick}
      className={[
        'inline-flex items-center gap-1.5',
        'h-7 px-3 text-sm font-medium rounded-full',
        'transition-colors select-none',
        variantMap[variant],
        clickable ? `cursor-pointer ${hoverMap[variant]}` : '',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
      {...rest}
    >
      {icon}
      {children}
    </Tag>
  );
}
