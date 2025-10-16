// states/ToastAtom.ts
import { atom } from 'jotai';

export type ToastType = 'success' | 'error' | 'info' | 'warning';
export type ToastItem = {
  id: number;
  type: ToastType;
  message: string;
  duration?: number; // ms
};

export const toastsAtom = atom<ToastItem[]>([]);
let _id = 1;

export const addToastAtom = atom(null, (get, set, t: Omit<ToastItem, 'id'>) => {
  const id = _id++;
  const item = { id, duration: 2500, ...t };
  set(toastsAtom, [...get(toastsAtom), item]);

  // 自動消去
  window.setTimeout(() => {
    set(
      toastsAtom,
      get(toastsAtom).filter((x) => x.id !== id)
    );
  }, item.duration);
});

export const removeToastAtom = atom(null, (get, set, id: number) => {
  set(
    toastsAtom,
    get(toastsAtom).filter((t) => t.id !== id)
  );
});
