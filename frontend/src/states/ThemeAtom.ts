// src/states/ThemeAtom.ts
import { atom } from 'jotai';
import { atomWithStorage } from 'jotai/utils';
import { updateThemeSetting } from '../helpers/SettingsApi';

export type Theme = 'light' | 'dark' | 'custom';

export const themeAtom = atomWithStorage<Theme>('mynote-theme', 'light');
export const customBgColorAtom = atomWithStorage<string>('mynote-custom-bg', '#1e1e1e');
export const customBorderColorAtom = atomWithStorage<string>('mynote-custom-border', '#333333');
export const customFontColorAtom = atomWithStorage<string>('mynote-custom-font', '#e0e0e0');
export const customInputBgColorAtom = atomWithStorage<string>('mynote-custom-input-bg', '#2a2a2a');

export const updateThemeAtom = atom(
  null,
  async (get, set, newTheme: Theme) => {
    set(themeAtom, newTheme);
    const bg = get(customBgColorAtom);
    const border = get(customBorderColorAtom);
    const font = get(customFontColorAtom);
    const inputBg = get(customInputBgColorAtom);
    await updateThemeSetting({ theme: newTheme, customBgColor: bg, customBorderColor: border, customFontColor: font, customInputBgColor: inputBg });
  }
);

export const updateCustomColorsAtom = atom(
  null,
  async (get, set, colors: { bg?: string; border?: string; font?: string; inputBg?: string }) => {
    if (colors.bg) set(customBgColorAtom, colors.bg);
    if (colors.border) set(customBorderColorAtom, colors.border);
    if (colors.font) set(customFontColorAtom, colors.font);
    if (colors.inputBg) set(customInputBgColorAtom, colors.inputBg);

    const theme = get(themeAtom);
    const bg = get(customBgColorAtom);
    const border = get(customBorderColorAtom);
    const font = get(customFontColorAtom);
    const inputBg = get(customInputBgColorAtom);

    await updateThemeSetting({ theme, customBgColor: bg, customBorderColor: border, customFontColor: font, customInputBgColor: inputBg });
  }
);
