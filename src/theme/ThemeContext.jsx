import {
  createContext,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";
import {
  themes,
  allThemes,
  lightThemes,
  darkThemes,
  defaultTheme,
  defaultDarkTheme,
  getTheme,
} from "./themes";
import { fonts, allFonts, defaultFont, getFont } from "./fonts";

/**
 * ThemeContext
 *
 * 제공 값:
 *   theme        - 현재 테마 객체 { key, label, mode, colors }
 *   themeKey     - 현재 테마 key
 *   mode         - 'light' | 'dark'
 *   autoDetect   - 시스템 자동 감지 여부
 *   setTheme(k)  - 테마 변경 (수동 선택 시 autoDetect 자동 OFF)
 *   setAutoDetect(bool) - 자동 감지 ON/OFF
 *   allThemes / lightThemes / darkThemes - UI 리스트용
 *
 *   font         - 현재 폰트 프리셋 { key, label, description, heading, body }
 *   fontKey      - 현재 폰트 key
 *   setFont(k)   - 폰트 변경
 *   allFonts     - UI 리스트용
 *
 * localStorage:
 *   travel-app:theme = { key, autoDetect }
 *   travel-app:font  = 'editorial' (문자열 key)
 */

const THEME_STORAGE_KEY = "travel-app:theme";
const FONT_STORAGE_KEY = "travel-app:font";

export const ThemeContext = createContext(null);

/* ─── Storage helpers ─────────────────────────────────────── */

function readStoredTheme() {
  try {
    const raw = localStorage.getItem(THEME_STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== "object") return null;
    return parsed;
  } catch {
    return null;
  }
}

function saveStoredTheme(state) {
  try {
    localStorage.setItem(THEME_STORAGE_KEY, JSON.stringify(state));
  } catch {
    /* quota / private mode 무시 */
  }
}

function readStoredFont() {
  try {
    const raw = localStorage.getItem(FONT_STORAGE_KEY);
    if (!raw) return null;
    return raw;
  } catch {
    return null;
  }
}

function saveStoredFont(key) {
  try {
    localStorage.setItem(FONT_STORAGE_KEY, key);
  } catch {
    /* 무시 */
  }
}

/* ─── System detection ────────────────────────────────────── */

function getSystemPreferredKey() {
  if (typeof window === "undefined" || !window.matchMedia) return defaultTheme;
  const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
  return prefersDark ? defaultDarkTheme : defaultTheme;
}

/* ─── CSS variable injection ──────────────────────────────── */

function toKebab(str) {
  return str.replace(/([A-Z])/g, "-$1").toLowerCase();
}

function applyTheme(theme) {
  if (typeof document === "undefined") return;
  const root = document.documentElement;

  Object.entries(theme.colors).forEach(([key, value]) => {
    root.style.setProperty(`--color-${toKebab(key)}`, value);
  });

  root.dataset.theme = theme.key;
  root.dataset.mode = theme.mode;
  root.style.colorScheme = theme.mode;
}

function applyFont(font) {
  if (typeof document === "undefined") return;
  const root = document.documentElement;

  root.style.setProperty("--font-heading", font.heading);
  root.style.setProperty("--font-body", font.body);
  root.dataset.font = font.key;
}

/* ─── Initial state ───────────────────────────────────────── */

function getInitialThemeState() {
  const stored = readStoredTheme();
  if (stored?.key && themes[stored.key]) {
    return { key: stored.key, autoDetect: Boolean(stored.autoDetect) };
  }
  return { key: getSystemPreferredKey(), autoDetect: true };
}

function getInitialFontKey() {
  const stored = readStoredFont();
  if (stored && fonts[stored]) return stored;
  return defaultFont;
}

/* ─── Provider ────────────────────────────────────────────── */

export function ThemeProvider({ children }) {
  const [themeState, setThemeState] = useState(getInitialThemeState);
  const [fontKey, setFontKeyState] = useState(getInitialFontKey);

  const theme = getTheme(themeState.key);
  const font = getFont(fontKey);

  // 테마 변경 → CSS 변수 주입
  useEffect(() => {
    applyTheme(theme);
  }, [theme]);

  // 테마 상태 저장
  useEffect(() => {
    saveStoredTheme(themeState);
  }, [themeState]);

  // 폰트 변경 → CSS 변수 주입
  useEffect(() => {
    applyFont(font);
  }, [font]);

  // 폰트 저장
  useEffect(() => {
    saveStoredFont(fontKey);
  }, [fontKey]);

  // autoDetect ON 일 때만 시스템 변경 감지
  useEffect(() => {
    if (!themeState.autoDetect) return;
    if (typeof window === "undefined" || !window.matchMedia) return;

    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    const handler = (e) => {
      const newKey = e.matches ? defaultDarkTheme : defaultTheme;
      setThemeState((prev) => ({ ...prev, key: newKey }));
    };

    if (mq.addEventListener) {
      mq.addEventListener("change", handler);
      return () => mq.removeEventListener("change", handler);
    } else {
      mq.addListener(handler);
      return () => mq.removeListener(handler);
    }
  }, [themeState.autoDetect]);

  const setTheme = useCallback((key) => {
    if (!themes[key]) return;
    setThemeState({ key, autoDetect: false });
  }, []);

  const setAutoDetect = useCallback((enabled) => {
    setThemeState((prev) => {
      if (!enabled) return { ...prev, autoDetect: false };
      return { key: getSystemPreferredKey(), autoDetect: true };
    });
  }, []);

  const setFont = useCallback((key) => {
    if (!fonts[key]) return;
    setFontKeyState(key);
  }, []);

  const value = useMemo(
    () => ({
      // 테마
      theme,
      themeKey: themeState.key,
      mode: theme.mode,
      autoDetect: themeState.autoDetect,
      setTheme,
      setAutoDetect,
      allThemes,
      lightThemes,
      darkThemes,
      // 폰트
      font,
      fontKey,
      setFont,
      allFonts,
    }),
    [
      theme,
      themeState.key,
      themeState.autoDetect,
      font,
      fontKey,
      setTheme,
      setAutoDetect,
      setFont,
    ],
  );

  return (
    <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
  );
}
