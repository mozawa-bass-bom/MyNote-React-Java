// state/useApplyNav.ts
import { useSetAtom } from 'jotai';
import { categoriesByIdAtom, notesByCategoryIdAtom, tocByNoteIdAtom } from '../states/UserAtom';
import { normalizeTocMap } from '../helpers/normalizeToc';
import type { ApiTocMapResponse } from '../types/base';
import { normalizeCategory } from '../helpers/normalizeCategory';
import type { Nav } from '../types/loginUser';

export function useApplyNav() {
  const setCategories = useSetAtom(categoriesByIdAtom);
  const setNotesByCat = useSetAtom(notesByCategoryIdAtom);
  const setToc = useSetAtom(tocByNoteIdAtom);

  const applyNav = (snapshot: Nav) => {
    const { categoriesByIdMap, notesByCategoryIdMap } = normalizeCategory(
      snapshot.categories,
      snapshot.notesByCategory
    );

    setCategories(categoriesByIdMap);
    setNotesByCat(notesByCategoryIdMap);
  };

  const applyToc = (tocResp: ApiTocMapResponse) => setToc(normalizeTocMap(tocResp));

  return { applyNav, applyToc };
}
