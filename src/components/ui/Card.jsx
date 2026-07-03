/**
 * Card
 *
 * surface 배경 + border + rounded 컨테이너.
 * onClick 있으면 hover / active 인터랙션 적용.
 *
 * Props:
 *   padding  - 'none' | 'sm' | 'md' (기본) | 'lg'
 *   onClick  - 있으면 클릭 가능한 카드 (cursor, hover)
 *   as       - 렌더링할 HTML 태그 (기본 'div')
 *   className - 추가 클래스
 */

const paddingMap = {
  none: '',
  sm: 'p-3',
  md: 'p-4',
  lg: 'p-6',
};

export default function Card({
  padding = 'md',
  onClick,
  as: Tag = 'div',
  className = '',
  children,
  ...rest
}) {
  const clickable = typeof onClick === 'function';
  const base = 'bg-surface border border-border rounded-2xl transition-colors';
  const interactive = clickable
    ? 'cursor-pointer hover:bg-surface-alt active:bg-surface-alt'
    : '';

  return (
    <Tag
      onClick={onClick}
      className={`${base} ${paddingMap[padding]} ${interactive} ${className}`.trim()}
      {...rest}
    >
      {children}
    </Tag>
  );
}
