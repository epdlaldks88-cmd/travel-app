import { useContext } from 'react';
import { ThemeContext } from './ThemeContext';

/**
 * useTheme
 *
 * ThemeProvider 내부에서 테마 상태와 조작 API 를 사용하는 훅.
 *
 * @returns {{
 *   theme: object,           // 현재 테마 { key, label, mode, colors }
 *   themeKey: string,        // 현재 테마 key
 *   mode: 'light' | 'dark',
 *   autoDetect: boolean,
 *   setTheme: (key: string) => void,
 *   setAutoDetect: (enabled: boolean) => void,
 *   allThemes: object[],
 *   lightThemes: object[],
 *   darkThemes: object[],
 * }}
 */
export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) {
    throw new Error('useTheme 는 <ThemeProvider> 내부에서만 사용할 수 있습니다.');
  }
  return ctx;
}
