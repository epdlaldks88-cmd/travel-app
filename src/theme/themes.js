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
      bg: "#FDFBF7",
      surface: "#FFFFFF",
      surfaceAlt: "#F6F3EB",
      text: "#1C1917",
      textMuted: "#57534E",
      textSubtle: "#A8A29E",
      border: "#EAE6DC",
      borderStrong: "#B27A50",
      accent: "#B27A50",
      accentFg: "#FFFFFF",
      danger: "#E11D48",
      success: "#16A34A",
      heroFrom: "#EADBC8",
      heroTo: "#B28C6E",
    },
  },

  ocean: {
    key: "ocean",
    label: "오션",
    mode: "light",
    colors: {
      bg: "#F3F8FC",
      surface: "#FFFFFF",
      surfaceAlt: "#E6F0FA",
      text: "#0F172A",
      textMuted: "#475569",
      textSubtle: "#94A3B8",
      border: "#D1E3F3",
      borderStrong: "#0284C7",
      accent: "#0284C7",
      accentFg: "#FFFFFF",
      danger: "#E11D48",
      success: "#0D9488",
      heroFrom: "#BBE1FA",
      heroTo: "#0F4C81",
    },
  },

  forest: {
    key: "forest",
    label: "포레스트",
    mode: "light",
    colors: {
      bg: "#F5F7F4",
      surface: "#FFFFFF",
      surfaceAlt: "#E8EDE4",
      text: "#1C2E1A",
      textMuted: "#4B5945",
      textSubtle: "#8F9E8B",
      border: "#D6E0D2",
      borderStrong: "#3B7A57",
      accent: "#3B7A57",
      accentFg: "#FFFFFF",
      danger: "#E11D48",
      success: "#16A34A",
      heroFrom: "#C2D5A8",
      heroTo: "#2D5A27",
    },
  },

  sunset: {
    key: "sunset",
    label: "선셋",
    mode: "light",
    colors: {
      bg: "#FFF8F6",
      surface: "#FFFFFF",
      surfaceAlt: "#FFEAE4",
      text: "#2D1610",
      textMuted: "#6E493F",
      textSubtle: "#A88A82",
      border: "#F4DBD4",
      borderStrong: "#E05E43",
      accent: "#E05E43",
      accentFg: "#FFFFFF",
      danger: "#E11D48",
      success: "#0D9488",
      heroFrom: "#FED2AA",
      heroTo: "#D43F29",
    },
  },

  minimal: {
    key: "minimal",
    label: "미니멀",
    mode: "light",
    colors: {
      bg: "#F8FAFC",
      surface: "#FFFFFF",
      surfaceAlt: "#F1F5F9",
      text: "#0F172A",
      textMuted: "#64748B",
      textSubtle: "#94A3B8",
      border: "#E2E8F0",
      borderStrong: "#0F172A",
      accent: "#0F172A",
      accentFg: "#FFFFFF",
      danger: "#EF4444",
      success: "#10B981",
      heroFrom: "#E2E8F0",
      heroTo: "#334155",
    },
  },

  // ─── DARK ─────────────────────────────────────────────────
  darkCream: {
    key: "darkCream",
    label: "다크크림",
    mode: "dark",
    colors: {
      bg: "#181512",
      surface: "#231F1A",
      surfaceAlt: "#2F2A24",
      text: "#F7F4EF",
      textMuted: "#C5BCAD",
      textSubtle: "#8E8270",
      border: "#3B342C",
      borderStrong: "#E5BA73",
      accent: "#E5BA73",
      accentFg: "#181512",
      danger: "#F87171",
      success: "#4ADE80",
      heroFrom: "#4E3629",
      heroTo: "#1A110B",
    },
  },

  darkOcean: {
    key: "darkOcean",
    label: "다크오션",
    mode: "dark",
    colors: {
      bg: "#0B0F19",
      surface: "#121826",
      surfaceAlt: "#1D263B",
      text: "#F1F5F9",
      textMuted: "#94A3B8",
      textSubtle: "#475569",
      border: "#1E293B",
      borderStrong: "#38BDF8",
      accent: "#38BDF8",
      accentFg: "#0B0F19",
      danger: "#FB7185",
      success: "#2DD4BF",
      heroFrom: "#1E3A8A",
      heroTo: "#0F172A",
    },
  },

  pureDark: {
    key: "pureDark",
    label: "순수다크",
    mode: "dark",
    colors: {
      bg: "#000000",
      surface: "#0F0F10",
      surfaceAlt: "#1E1E1F",
      text: "#FFFFFF",
      textMuted: "#A1A1A6",
      textSubtle: "#515154",
      border: "#222225",
      borderStrong: "#F5F5F7",
      accent: "#F5F5F7",
      accentFg: "#000000",
      danger: "#FF453A",
      success: "#30D158",
      heroFrom: "#3A3A3C",
      heroTo: "#1C1C1E",
    },
  },

  lavender: {
    key: "lavender",
    label: "라벤더",
    mode: "light",
    colors: {
      bg: "#FAF8FF",
      surface: "#FFFFFF",
      surfaceAlt: "#F0ECFC",
      text: "#211B35",
      textMuted: "#5B5377",
      textSubtle: "#9A92BB",
      border: "#E2DCF7",
      borderStrong: "#8B5CF6",
      accent: "#8B5CF6",
      accentFg: "#FFFFFF",
      danger: "#E11D48",
      success: "#10B981",
      heroFrom: "#D8B4FE",
      heroTo: "#7C3AED",
    },
  },

  midnight: {
    key: "midnight",
    label: "미드나잇",
    mode: "dark",
    colors: {
      bg: "#0B0813",
      surface: "#141024",
      surfaceAlt: "#1E1E35",
      text: "#F1EDFA",
      textMuted: "#9D96BC",
      textSubtle: "#5E577C",
      border: "#292244",
      borderStrong: "#A78BFA",
      accent: "#A78BFA",
      accentFg: "#0B0813",
      danger: "#FB7185",
      success: "#34D399",
      heroFrom: "#6D28D9",
      heroTo: "#1E1B4B",
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
