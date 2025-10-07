//C:\Users\motoyoshi\Desktop\React\MyNote\src\states\UserAtom.ts
import { atom } from 'jotai';
import type { Category, Note, NoteDetailResponse } from '../types/base';
import { atomWithStorage } from 'jotai/utils';
import type { LoginUser } from '../types/loginUser';

export const loginUserAtom = atomWithStorage<LoginUser | null>('loginUser', null);

export const categoriesByIdAtom = atom<Map<number, Category>>(new Map());
export const notesByCategoryIdAtom = atom<Map<number, Note[]>>(new Map());

export const selectedCategoryIdAtom = atom<number | null>(null);
export const selectedNoteIdAtom = atom<number | null>(null);

export const noteDetailByIdAtom = atom<Map<number, NoteDetailResponse>>(new Map());
