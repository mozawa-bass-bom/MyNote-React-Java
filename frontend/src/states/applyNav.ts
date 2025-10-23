// state/applyNav.ts
import { useSetAtom } from 'jotai';
import {
  categoriesByIdAtom,
  notesByCategoryIdAtom,
  tocByNoteIdAtom,
  loginUserAtom,
  roleAtom,
} from '../states/UserAtom';
import { normalizeTocMap } from '../helpers/nomalizeToc';
import type { ApiTocMapResponse, Category, NoteSummary } from '../types/base';

export function useApplyNav() {
  const setCategories = useSetAtom(categoriesByIdAtom);
  const setNotesByCat = useSetAtom(notesByCategoryIdAtom);
  const setToc = useSetAtom(tocByNoteIdAtom);
  const setRole = useSetAtom(roleAtom);
  const setLoginUser = useSetAtom(loginUserAtom);

  const applyNav = (p: { categories: Category[]; notes: NoteSummary[] }) => {
    // 好きなMap化ロジックに置換
    const catMap = new Map(p.categories.map((c) => [c.id, c]));
    const notesMap = new Map<number, NoteSummary[]>();
    for (const n of p.notes) {
      const arr = notesMap.get(n.categoryId) ?? [];
      arr.push(n);
      notesMap.set(n.categoryId, arr);
    }
    setCategories(catMap);
    setNotesByCat(notesMap);
  };

  const applyToc = (tocResp: ApiTocMapResponse) => setToc(normalizeTocMap(tocResp));

  const resetAll = () => {
    setRole('USER');
    setLoginUser(null);
    setCategories(new Map());
    setNotesByCat(new Map());
    setToc(new Map());
  };

  return { applyNav, applyToc, resetAll };
}
