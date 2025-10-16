//C:\Users\motoyoshi\Desktop\React\MyNote\src\states\UserAtom.ts
import { atom } from 'jotai';
import type { Category, NoteDetailResponse, NoteSummary, Role, TocItem } from '../types/base';
import { atomWithStorage } from 'jotai/utils';
import type { LoginUser } from '../types/loginUser';

export const loginUserAtom = atomWithStorage<LoginUser | null>('loginUser', null);

export const roleAtom = atom<Role>('USER');

export const categoriesByIdAtom = atom<Map<number, Category>>(new Map());
// ナビ管理の為にカテゴリーidをkeyにしたmap
export const notesByCategoryIdAtom = atom<Map<number, NoteSummary[]>>(new Map());

//ノート一覧表示の目次生成＆ノート詳細ページでの変更共有
export const tocByNoteIdAtom = atom<Map<number, TocItem[]>>(new Map());

export const selectedCategoryIdAtom = atom<number | null>(null);
export const selectedNoteIdAtom = atom<number | null>(null);

export const noteDetailByIdAtom = atom<Map<number, NoteDetailResponse>>(new Map());

// 便利：全体リセット（ログアウト/ユーザー切替時に呼ぶ）
export const resetAllUserStateAtom = atom(null, (_get, set) => {
  set(loginUserAtom, null);
  set(roleAtom, 'USER');
  set(categoriesByIdAtom, new Map());
  set(notesByCategoryIdAtom, new Map());
  set(noteDetailByIdAtom, new Map());
  set(selectedCategoryIdAtom, null);
  set(selectedNoteIdAtom, null);
});
