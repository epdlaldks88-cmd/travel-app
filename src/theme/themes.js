/**
 * 테마 프리셋 정의 (총 8개)
 *
 * 구조:
 *   key    - 내부 식별자 (localStorage, 코드에서 참조)
 *   label  - 사용자에게 보여지는 한글 이름 (마이페이지 UI 등)
 *   mode   - 'light' | 'dark' (시스템 모드 자동 감지에 사용)
 *   colors - 12개 semantic 색상 토큰 + 히어로 그라데이션 2개
 *
 * CSS 변수 매핑 (kebab-case):
 *   colors.bg            → --color-bg
 *   colors.surfaceAlt    → --color-surface-alt
 *   colors.textMuted     → --color-text-muted
 *   colors.borderStrong  → --color-border-strong
 *   colors.accentFg      → --color-accent-fg
 *   colors.heroFrom      → --color-hero-from
 *   colors.heroTo        → --color-hero-to
 *   ...
 *
 * 히어로 그라데이션 (heroFrom → heroTo):
 *   TripCard 상단 썸네일과 TripDetailPage 히어로 커버에서 공용.
 *   테마 정서에 맞춘 컬러 (크림=골드브라운, 오션=딥블루, 등).
 */

export const themes = {
  // ─── LIGHT ────────────────────────────────────────────────
  cream: {
    key: "cream",
    label: "크림",
    mode: "light",
    colors: {
      bg: "#FAF9F5",
      surface: "#FFFFFF",
      surfaceAlt: "#F3F1EA",
      text: "#1E2A38",
      textMuted: "#5A6472",
      textSubtle: "#9099A5",
      border: "#E5E1D6",
      borderStrong: "#B08D5C",
      accent: "#B08D5C",
      accentFg: "#FFFFFF",
      danger: "#B0533C",
      success: "#6B8E5A",
      heroFrom: "#C7B594",
      heroTo: "#8A6E45",
    },
  },

  ocean: {
    key: "ocean",
    label: "오션",
    mode: "light",
    colors: {
      bg: "#F4F7F9",
      surface: "#FFFFFF",
      surfaceAlt: "#E8EEF3",
      text: "#1B2A3A",
      textMuted: "#556676",
      textSubtle: "#8B99A8",
      border: "#D8E2EA",
      borderStrong: "#3A6B8C",
      accent: "#3A6B8C",
      accentFg: "#FFFFFF",
      danger: "#B0533C",
      success: "#5A8B7A",
      heroFrom: "#7FA8C9",
      heroTo: "#2E5570",
    },
  },

  forest: {
    key: "forest",
    label: "포레스트",
    mode: "light",
    colors: {
      bg: "#F6F5F0",
      surface: "#FFFFFF",
      surfaceAlt: "#EDECE4",
      text: "#2A2E24",
      textMuted: "#5C6152",
      textSubtle: "#8E9384",
      border: "#DDDBCE",
      borderStrong: "#4A6B3A",
      accent: "#4A6B3A",
      accentFg: "#FFFFFF",
      danger: "#A65038",
      success: "#5C8A4A",
      heroFrom: "#7A9068",
      heroTo: "#3E5A2E",
    },
  },

  sunset: {
    key: "sunset",
    label: "선셋",
    mode: "light",
    colors: {
      bg: "#FDF6F0",
      surface: "#FFFFFF",
      surfaceAlt: "#F7ECE0",
      text: "#3A2418",
      textMuted: "#6E5044",
      textSubtle: "#A08578",
      border: "#E8D5C4",
      borderStrong: "#A0522D",
      accent: "#A0522D",
      accentFg: "#FFFFFF",
      danger: "#8B2E1F",
      success: "#7A8A4A",
      heroFrom: "#E5A574",
      heroTo: "#8B3E28",
    },
  },

  minimal: {
    key: "minimal",
    label: "미니멀",
    mode: "light",
    colors: {
      bg: "#FFFFFF",
      surface: "#FFFFFF",
      surfaceAlt: "#F5F5F5",
      text: "#1A1A1A",
      textMuted: "#6B6B6B",
      textSubtle: "#A0A0A0",
      border: "#E5E5E5",
      borderStrong: "#1A1A1A",
      accent: "#1A1A1A",
      accentFg: "#FFFFFF",
      danger: "#C0392B",
      success: "#27AE60",
      heroFrom: "#B8B8B8",
      heroTo: "#4A4A4A",
    },
  },

  // ─── DARK ─────────────────────────────────────────────────
  darkCream: {
    key: "darkCream",
    label: "다크크림",
    mode: "dark",
    colors: {
      bg: "#1F1B15",
      surface: "#2A251E",
      surfaceAlt: "#35302A",
      text: "#F0EBE0",
      textMuted: "#B8B0A0",
      textSubtle: "#857D6E",
      border: "#3F3A32",
      borderStrong: "#C9A66B",
      accent: "#C9A66B",
      accentFg: "#1F1B15",
      danger: "#D46B52",
      success: "#8FAE7A",
      heroFrom: "#5C4A32",
      heroTo: "#2A1F14",
    },
  },

  darkOcean: {
    key: "darkOcean",
    label: "다크오션",
    mode: "dark",
    colors: {
      bg: "#0F1620",
      surface: "#1A2432",
      surfaceAlt: "#243040",
      text: "#E0E8F0",
      textMuted: "#A0B0C0",
      textSubtle: "#6E7A88",
      border: "#2D3B4D",
      borderStrong: "#6BA0CC",
      accent: "#6BA0CC",
      accentFg: "#0F1620",
      danger: "#D46B52",
      success: "#7BAE9A",
      heroFrom: "#3A5570",
      heroTo: "#0F1E30",
    },
  },

  pureDark: {
    key: "pureDark",
    label: "순수다크",
    mode: "dark",
    colors: {
      bg: "#0A0A0A",
      surface: "#171717",
      surfaceAlt: "#242424",
      text: "#FAFAFA",
      textMuted: "#A0A0A0",
      textSubtle: "#707070",
      border: "#2E2E2E",
      borderStrong: "#FAFAFA",
      accent: "#FAFAFA",
      accentFg: "#0A0A0A",
      danger: "#E74C3C",
      success: "#2ECC71",
      heroFrom: "#3A3A3A",
      heroTo: "#0A0A0A",
    },
  },
};

/* ─── Helpers ──────────────────────────────────────────────── */

/** 라이트 테마 목록 (마이페이지 그룹핑용) */
export const lightThemes = Object.values(themes).filter(
  (t) => t.mode === "light",
);

/** 다크 테마 목록 */
export const darkThemes = Object.values(themes).filter(
  (t) => t.mode === "dark",
);

/** 전체 테마 배열 */
export const allThemes = Object.values(themes);

/** 기본 테마 key */
export const defaultTheme = "cream";

/** 시스템 다크모드 기본 대응 테마 key */
export const defaultDarkTheme = "darkCream";

/**
 * key 로 테마 조회. 없으면 기본 테마 반환.
 */
export function getTheme(key) {
  return themes[key] || themes[defaultTheme];
}
