import { useEffect, type ReactNode } from 'react';
import { useAtomValue, useSetAtom } from 'jotai';
import { themeAtom, updateThemeAtom, customBgColorAtom, customBorderColorAtom, customFontColorAtom, customInputBgColorAtom, updateCustomColorsAtom, type Theme } from '../states/ThemeAtom';
import { loginUserAtom } from '../states/UserAtom';
import { fetchThemeSetting } from '../helpers/SettingsApi';

function hexToHslStr(hex: string) {
  hex = hex.replace(/^#/, '');
  if (hex.length === 3) hex = hex.split('').map(x => x + x).join('');
  const r = parseInt(hex.substring(0, 2), 16) / 255;
  const g = parseInt(hex.substring(2, 4), 16) / 255;
  const b = parseInt(hex.substring(4, 6), 16) / 255;
  const max = Math.max(r, g, b), min = Math.min(r, g, b);
  let h = 0, s = 0, l = (max + min) / 2;
  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r: h = (g - b) / d + (g < b ? 6 : 0); break;
      case g: h = (b - r) / d + 2; break;
      case b: h = (r - g) / d + 4; break;
    }
    h /= 6;
  }
  return `${(h * 360).toFixed(1)} ${(s * 100).toFixed(1)}% ${(l * 100).toFixed(1)}%`;
}

export function applyTheme(theme: Theme, customBg?: string, customBorder?: string, customFont?: string, customInputBg?: string) {
  const root = document.documentElement;
  root.classList.toggle('dark', theme === 'dark');
  root.classList.toggle('dark-theme', theme === 'dark'); // For MDXEditor

  if (theme === 'custom' && customBg && customBorder && customFont) {
    root.style.setProperty('--background', hexToHslStr(customBg));
    root.style.setProperty('--border', hexToHslStr(customBorder));
    root.style.setProperty('--foreground', hexToHslStr(customFont));
    root.style.setProperty('--input-bg', customInputBg ? hexToHslStr(customInputBg) : hexToHslStr(customBg));
  } else {
    root.style.removeProperty('--background');
    root.style.removeProperty('--border');
    root.style.removeProperty('--foreground');
    root.style.removeProperty('--input-bg');
  }
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const theme = useAtomValue(themeAtom);
  const setThemeRaw = useSetAtom(themeAtom);
  
  const customBg = useAtomValue(customBgColorAtom);
  const customBorder = useAtomValue(customBorderColorAtom);
  const customFont = useAtomValue(customFontColorAtom);
  const customInputBg = useAtomValue(customInputBgColorAtom);

  const setBgRaw = useSetAtom(customBgColorAtom);
  const setBorderRaw = useSetAtom(customBorderColorAtom);
  const setFontRaw = useSetAtom(customFontColorAtom);
  const setInputBgRaw = useSetAtom(customInputBgColorAtom);

  const loginUser = useAtomValue(loginUserAtom);

  useEffect(() => {
    // loginUser atom がセットされており、かつ localStorage にトークンが実際に存在する場合のみ取得
    if (!loginUser) return;
    const stored = localStorage.getItem('loginUser');
    if (!stored) return;
    try {
      const parsed = JSON.parse(stored);
      if (!parsed?.token) return;
    } catch {
      return;
    }

    fetchThemeSetting().then(data => {
      if (data) {
        const fetchedTheme = data.theme;
        if (fetchedTheme && (fetchedTheme === 'light' || fetchedTheme === 'dark' || fetchedTheme === 'custom')) {
          setThemeRaw(fetchedTheme as Theme);
        }
        if (data.customBgColor) setBgRaw(data.customBgColor);
        if (data.customBorderColor) setBorderRaw(data.customBorderColor);
        if (data.customFontColor) setFontRaw(data.customFontColor);
        if (data.customInputBgColor) setInputBgRaw(data.customInputBgColor);
      }
    });
  }, [loginUser, setThemeRaw, setBgRaw, setBorderRaw, setFontRaw, setInputBgRaw]);

  useEffect(() => {
    applyTheme(theme, customBg, customBorder, customFont, customInputBg);
  }, [theme, customBg, customBorder, customFont, customInputBg]);

  return <>{children}</>;
}

export function useTheme() {
  const theme = useAtomValue(themeAtom);
  const setTheme = useSetAtom(updateThemeAtom);
  
  const bg = useAtomValue(customBgColorAtom);
  const border = useAtomValue(customBorderColorAtom);
  const font = useAtomValue(customFontColorAtom);
  const inputBg = useAtomValue(customInputBgColorAtom);
  const updateColors = useSetAtom(updateCustomColorsAtom);

  return { 
    theme, 
    setTheme,
    customColors: { bg, border, font, inputBg },
    setCustomColors: updateColors
  };
}
