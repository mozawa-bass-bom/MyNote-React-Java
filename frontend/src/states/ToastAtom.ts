// states/ToastAtom.ts
import { atom } from 'jotai';

export type ToastType = 'success' | 'error' | 'info' | 'warning';
export type ToastItem = {
  id: number;
  type: ToastType;
  message: string;
  duration?: number; // ms
  fadingOut?: boolean;
};

export const toastsAtom = atom<ToastItem[]>([]);
let _id = 1;

const FADE_DURATION = 350; // フェードアウトアニメーション時間(ms)

export const addToastAtom = atom(null, (get, set, t: Omit<ToastItem, 'id' | 'fadingOut'>) => {
  const id = _id++;
  const duration = t.duration ?? 2500;
  const item: ToastItem = { id, duration, fadingOut: false, ...t };
  set(toastsAtom, [...get(toastsAtom), item]);

  // フェードアウト開始（消去の FADE_DURATION ms 前）
  window.setTimeout(() => {
    set(toastsAtom, get(toastsAtom).map((x) => x.id === id ? { ...x, fadingOut: true } : x));
  }, duration - FADE_DURATION);

  // 実際の削除
  window.setTimeout(() => {
    set(toastsAtom, get(toastsAtom).filter((x) => x.id !== id));
  }, duration);
});

export const removeToastAtom = atom(null, (get, set, id: number) => {
  // 即時フェードアウト → 削除
  set(toastsAtom, get(toastsAtom).map((x) => x.id === id ? { ...x, fadingOut: true } : x));
  window.setTimeout(() => {
    set(toastsAtom, get(toastsAtom).filter((t) => t.id !== id));
  }, FADE_DURATION);
});
