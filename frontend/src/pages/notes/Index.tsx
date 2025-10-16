import { useMemo, useState, useCallback } from 'react';
import { useAtomValue } from 'jotai';
import { categoriesByIdAtom, notesByCategoryIdAtom } from '../../states/UserAtom';
import { CategorySection } from '../../components/notes/CategorySection';

export default function Index() {
  const categoriesById = useAtomValue(categoriesByIdAtom);
  const notesByCategory = useAtomValue(notesByCategoryIdAtom);

  // 開閉状態（カテゴリIDのSet）
  const [expanded, setExpanded] = useState<Set<number>>(new Set());

  // 一覧用にカテゴリを配列化＆ソート
  const categoryList = useMemo(
    () => Array.from(categoriesById.values()).sort((a, b) => a.name.localeCompare(b.name, 'ja')),
    [categoriesById]
  );

  const toggle = useCallback((cid: number) => {
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(cid)) next.delete(cid);
      else next.add(cid);
      return next;
    });
  }, []);

  return (
    <div className="p-4 space-y-3">
      <h1 className="text-xl font-semibold">ノート一覧ページ</h1>

      <ul className="space-y-3">
        {categoryList.map((cat) => (
          <li key={cat.id} className="rounded-lg">
            <CategorySection
              category={cat}
              notes={notesByCategory.get(cat.id) ?? []}
              isOpen={expanded.has(cat.id)}
              onToggle={() => toggle(cat.id)}
            />
          </li>
        ))}
      </ul>
    </div>
  );
}
