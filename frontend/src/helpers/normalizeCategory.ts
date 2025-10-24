import type { Category, NoteSummary } from '../types/base';
import type { CategoriesMap, NotesByCategoryMap } from '../types/loginUser';

/**
 * カテゴリ配列の並びをここで確定させ、Notesのキーは数値に正規化。
 * ゆくゆくはカテゴリーの順番をDBにも反映させたい。
 * - NaNキーを除外
 */
// helpers/normalizeCategory.ts
export function normalizeCategory(
  categories: CategoriesMap,
  notes: NotesByCategoryMap
): {
  categoriesByIdMap: Map<number, Category>;
  notesByCategoryIdMap: Map<number, NoteSummary[]>;
} {
  const sortedCategories = Object.values(categories)
    .filter((c): c is Category => !!c && typeof c.id === 'number')
    .sort((a, b) => a.id - b.id);

  const categoriesByIdMap = new Map<number, Category>(sortedCategories.map((c) => [c.id, c]));

  const notesByCategoryIdMap = new Map<number, NoteSummary[]>();
  for (const [k, arr] of Object.entries(notes)) {
    const id = Number(k);
    if (!Number.isFinite(id)) continue;
    notesByCategoryIdMap.set(id, [...(arr ?? [])]);
  }

  return { categoriesByIdMap, notesByCategoryIdMap };
}
