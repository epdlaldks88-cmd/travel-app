import { useState } from 'react';
import { IconDiamond, IconDiamondFilled } from '@tabler/icons-react';
import { tokens } from '../../theme/tokens';

/**
 * Rating (◆ 다이아몬드 평점)
 *
 * 0.5 단위 지원. 정수 값도 물론 처리.
 *
 * Props:
 *   value      - 현재 값 (0 ~ max, 0.5 단위)
 *   max        - 최대 개수 (기본 5)
 *   readonly   - true 면 표시만. 기본 false
 *   onChange   - (newValue) => void. readonly=false 일 때 필수
 *   size       - 'sm' | 'md' (기본) | 'lg'
 *   showValue  - true 면 우측에 숫자 표시 (예: "3.5")
 *
 * 색상: 골드 고정 (tokens.rating.color).
 * 편집 모드에서는 각 다이아몬드를 좌/우 두 클릭 영역으로 나눔.
 */

const sizeMap = {
  sm: 16,
  md: 20,
  lg: 26,
};

/**
 * i 번째 다이아몬드의 채움 정도 계산.
 * @returns 0 | 0.5 | 1
 */
function getFill(value, i) {
  if (value >= i + 1) return 1;
  if (value >= i + 0.5) return 0.5;
  return 0;
}

/**
 * 다이아몬드 하나 렌더 (표시용).
 * 빈 다이아몬드 위에 채운 다이아몬드를 clipPath 대신 overflow 로 겹쳐 반쪽 표현.
 */
function DiamondCell({ fill, size, color, emptyOpacity }) {
  return (
    <span
      className="relative inline-block leading-none"
      style={{ width: size, height: size }}
    >
      {/* 빈 다이아몬드 (배경, 흐리게) */}
      <IconDiamond
        size={size}
        color={color}
        style={{ opacity: emptyOpacity, position: 'absolute', top: 0, left: 0 }}
      />
      {/* 채운 다이아몬드 (앞, fill 비율만큼 보임) */}
      {fill > 0 && (
        <span
          className="absolute top-0 left-0 overflow-hidden"
          style={{
            width: fill === 1 ? '100%' : '50%',
            height: '100%',
          }}
        >
          <IconDiamondFilled size={size} color={color} />
        </span>
      )}
    </span>
  );
}

export default function Rating({
  value = 0,
  max = 5,
  readonly = false,
  onChange,
  size = 'md',
  showValue = false,
  className = '',
}) {
  const pxSize = sizeMap[size];
  const color = tokens.rating.color;
  const emptyOpacity = tokens.rating.emptyOpacity;

  // hover 미리보기 (편집 모드 전용)
  const [hover, setHover] = useState(null);
  const displayValue = hover ?? value;

  const stars = Array.from({ length: max }, (_, i) => i);

  return (
    <div
      className={['inline-flex items-center gap-1', className]
        .filter(Boolean)
        .join(' ')}
    >
      {stars.map((i) => {
        const fill = getFill(displayValue, i);

        if (readonly) {
          return (
            <DiamondCell
              key={i}
              fill={fill}
              size={pxSize}
              color={color}
              emptyOpacity={emptyOpacity}
            />
          );
        }

        // 편집 모드: 좌/우 두 클릭 영역
        const handleClick = (half) => {
          const newValue = i + (half === 'left' ? 0.5 : 1);
          onChange?.(newValue === value ? 0 : newValue); // 같은 값 재클릭 시 0 (해제)
        };

        return (
          <span
            key={i}
            className="relative inline-block"
            style={{ width: pxSize, height: pxSize }}
            onMouseLeave={() => setHover(null)}
          >
            <DiamondCell
              fill={fill}
              size={pxSize}
              color={color}
              emptyOpacity={emptyOpacity}
            />
            {/* 왼쪽 반: 0.5 */}
            <button
              type="button"
              aria-label={`${i + 0.5}점`}
              onClick={() => handleClick('left')}
              onMouseEnter={() => setHover(i + 0.5)}
              className="absolute top-0 left-0 h-full cursor-pointer"
              style={{ width: '50%', background: 'transparent', border: 'none', padding: 0 }}
            />
            {/* 오른쪽 반: 1.0 */}
            <button
              type="button"
              aria-label={`${i + 1}점`}
              onClick={() => handleClick('right')}
              onMouseEnter={() => setHover(i + 1)}
              className="absolute top-0 right-0 h-full cursor-pointer"
              style={{ width: '50%', background: 'transparent', border: 'none', padding: 0 }}
            />
          </span>
        );
      })}
      {showValue && (
        <span className="ml-1 text-sm text-text-muted tabular-nums">
          {value.toFixed(1)}
        </span>
      )}
    </div>
  );
}
