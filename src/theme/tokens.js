/**
 * 테마 공통 디자인 토큰
 *
 * 모든 테마가 공유하는 값 (색상 제외).
 * 색상은 themes.js 에서 테마별로 정의.
 *
 * CSS 변수로 주입될 때는 kebab-case 로 변환:
 *   spacing.md          → --spacing-md
 *   typography.size.lg  → --font-size-lg
 *   radius.full         → --radius-full
 */

export const tokens = {
  spacing: {
    xs: '0.25rem',   // 4px
    sm: '0.5rem',    // 8px
    md: '1rem',      // 16px
    lg: '1.5rem',    // 24px
    xl: '2rem',      // 32px
    '2xl': '3rem',   // 48px
  },

  radius: {
    sm: '0.375rem',  // 6px
    md: '0.625rem',  // 10px
    lg: '1rem',      // 16px
    xl: '1.5rem',    // 24px
    full: '9999px',
  },

  shadow: {
    sm: '0 1px 3px rgba(0, 0, 0, 0.05), 0 1px 2px rgba(0, 0, 0, 0.02)',
    md: '0 4px 12px rgba(0, 0, 0, 0.05), 0 2px 4px rgba(0, 0, 0, 0.03)',
    lg: '0 12px 32px rgba(0, 0, 0, 0.08), 0 4px 12px rgba(0, 0, 0, 0.03)',
  },

  typography: {
    fontFamily: "'Pretendard', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
    size: {
      xs: '0.75rem',    // 12px
      sm: '0.875rem',   // 14px
      base: '1rem',     // 16px
      lg: '1.125rem',   // 18px
      xl: '1.25rem',    // 20px
      '2xl': '1.5rem',  // 24px
      '3xl': '2rem',    // 32px
    },
    weight: {
      normal: 400,
      medium: 500,
      semibold: 600,
      bold: 700,
    },
    lineHeight: {
      tight: 1.25,
      normal: 1.5,
      relaxed: 1.75,
    },
  },

  transition: {
    fast: '150ms ease',
    base: '200ms ease',
    slow: '300ms ease',
  },

  /**
   * 평점 색상 (모든 테마 공통, 골드/앰버 고정)
   * empty 상태는 별도 색이 아니라 opacity 로 처리
   */
  rating: {
    color: '#D4A017',
    emptyOpacity: 0.15,
  },
};
