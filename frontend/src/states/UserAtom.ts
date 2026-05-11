// src/states/UserAtom.ts
import { atom } from 'jotai';
import type { Role } from '../types/base';
import { atomWithStorage } from 'jotai/utils';
import type { LoginUser } from '../types/loginUser';

export const loginUserAtom = atomWithStorage<LoginUser | null>('loginUser', null);

export const roleAtom = atom<Role>('USER');

export const selectedCategoryIdAtom = atom<number | null>(null);
export const selectedNoteIdAtom = atom<number | null>(null);

// 便利：全体リセット（ログアウト/ユーザー切替時に呼ぶ。TanStack QueryのクリアはuseLogoutなどで併用する）
export const resetAllUserStateAtom = atom(null, (_get, set) => {
  set(loginUserAtom, null);
  set(roleAtom, 'USER');
  set(selectedCategoryIdAtom, null);
  set(selectedNoteIdAtom, null);
});
