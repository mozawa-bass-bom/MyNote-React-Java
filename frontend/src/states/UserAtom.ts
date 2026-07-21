// src/states/UserAtom.ts
import { atom } from 'jotai';
import type { Role } from '../types/base';
import { atomWithStorage } from 'jotai/utils';
import type { LoginUser } from '../types/loginUser';

function getInitialStorage<T>(key: string, fallback: T): T {
  if (typeof window === 'undefined') return fallback;
  try {
    const item = localStorage.getItem(key);
    return item ? (JSON.parse(item) as T) : fallback;
  } catch {
    return fallback;
  }
}

export const loginUserAtom = atomWithStorage<LoginUser | null>(
  'loginUser',
  getInitialStorage('loginUser', null)
);

export const roleAtom = atomWithStorage<Role>(
  'role',
  getInitialStorage('role', 'USER')
);

export const selectedCategoryIdAtom = atom<number | null>(null);
export const selectedNoteIdAtom = atom<number | null>(null);

// 便利：全体リセット（ログアウト/ユーザー切替時に呼ぶ。TanStack QueryのクリアはuseLogoutなどで併用する）
export const resetAllUserStateAtom = atom(null, (_get, set) => {
  set(loginUserAtom, null);
  set(roleAtom, 'USER');
  set(selectedCategoryIdAtom, null);
  set(selectedNoteIdAtom, null);
});

