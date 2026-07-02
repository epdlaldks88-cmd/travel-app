import { createContext, useCallback, useEffect, useMemo, useState } from 'react';
import {
  themes,
  allThemes,
  lightThemes,
  darkThemes,
  defaultTheme,
  defaultDarkTheme,
  getTheme,
} from './themes';

/**
 * ThemeContext
 *
 * 제공 값:
 *   theme        - 현재 테마 객체 { key, label, mode, colors }
 *   themeKey     - 현재 테마 key (문자열)
 *   mode         - 'light' | 'dark'
 *   autoDetect   - 시스템 자동 감지 여부
 *   setTheme(k)  - 테마 변경 (수동 선택 시 autoDetect 자동 OFF)
 *   setAutoDetect(bool) - 자동 감지 ON/OFF
 *   allThemes / lightThemes / darkThemes - UI 리스트용
 *
 * localStorage:
 *   key: 'travel-app:theme'
 *   value: { key: string, autoDetect: boolean }
 */

const STORAGE_KEY = 'travel-app:theme';

export const ThemeContext = createContext(null);

/* ─── Storage helpers ─────────────────────────────────────── */

function readStored() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== 'object') return null;
    return parsed;
  } catch {
    return null;
  }
}

function saveStored(state) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    /* quota / private mode 무시 */
  }
}

/* ─── System detection ────────────────────────────────────── */

function getSystemPreferredKey() {
  if (typeof window === 'undefined' || !window.matchMedia) return defaultTheme;
  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  return prefersDark ? defaultDarkTheme : defaultTheme;
}

/* ─── CSS variable injection ──────────────────────────────── */

function toKebab(str) {
  return str.replace(/([A-Z])/g, '-$1').toLowerCase();
}

function applyTheme(theme) {
  if (typeof document === 'undefined') return;
  const root = document.documentElement;

  // colors → --color-* 변수 주입 (camelCase → kebab-case)
  Object.entries(theme.colors).forEach(([key, value]) => {
    root.style.setProperty(`--color-${toKebab(key)}`, value);
  });

  // 데이터 속성 (CSS 셀렉터에서 활용 가능)
  root.dataset.theme = theme.key;
  root.dataset.mode = theme.mode;

  // 스크롤바, 시스템 UI 다크모드 대응
  root.style.colorScheme = theme.mode;
}

/* ─── Initial state ───────────────────────────────────────── */

function getInitialState() {
  const stored = readStored();
  if (stored?.key && themes[stored.key]) {
    return {
      key: stored.key,
      autoDetect: Boolean(stored.autoDetect),
    };
  }
  // 처음 방문 → 시스템 감지 ON, 시스템 mode 에 맞는 기본 테마
  return {
    key: getSystemPreferredKey(),
    autoDetect: true,
  };
}

/* ─── Provider ────────────────────────────────────────────── */

export function ThemeProvider({ children }) {
  const [state, setState] = useState(getInitialState);
  const theme = getTheme(state.key);

  // 테마 변경 시 CSS 변수 주입
  useEffect(() => {
    applyTheme(theme);
  }, [theme]);

  // 상태 저장
  useEffect(() => {
    saveStored(state);
  }, [state]);

  // autoDetect ON 일 때만 시스템 변경 감지
  useEffect(() => {
    if (!state.autoDetect) return;
    if (typeof window === 'undefined' || !window.matchMedia) return;

    const mq = window.matchMedia('(prefers-color-scheme: dark)');
    const handler = (e) => {
      const newKey = e.matches ? defaultDarkTheme : defaultTheme;
      setState((prev) => ({ ...prev, key: newKey }));
    };

    // 구형 사파리 대응
    if (mq.addEventListener) {
      mq.addEventListener('change', handler);
      return () => mq.removeEventListener('change', handler);
    } else {
      mq.addListener(handler);
      return () => mq.removeListener(handler);
    }
  }, [state.autoDetect]);

  const setTheme = useCallback((key) => {
    if (!themes[key]) return;
    // 수동 선택 → autoDetect OFF
    setState({ key, autoDetect: false });
  }, []);

  const setAutoDetect = useCallback((enabled) => {
    setState((prev) => {
      if (!enabled) return { ...prev, autoDetect: false };
      // ON 으로 켜지는 순간 시스템 mode 기본 테마로 즉시 전환
      return { key: getSystemPreferredKey(), autoDetect: true };
    });
  }, []);

  const value = useMemo(
    () => ({
      theme,
      themeKey: state.key,
      mode: theme.mode,
      autoDetect: state.autoDetect,
      setTheme,
      setAutoDetect,
      allThemes,
      lightThemes,
      darkThemes,
    }),
    [theme, state.key, state.autoDetect, setTheme, setAutoDetect]
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}
