import { useMemo, useState, useCallback } from 'react';
import { useCategories } from '../../hooks/queries/useNav';
import { useNavQuery } from '../../hooks/queries/useNav';
import { CategorySection } from '../../components/notes/CategorySection';

export default function Index() {
  const { categoriesArray, isPending, isError } = useCategories();
  const { data: navData } = useNavQuery();

  // 開閉状態（カテゴリIDのSet）
  const [expanded, setExpanded] = useState<Set<number>>(new Set());

  // 一覧用にカテゴリを配列化＆ソート
  const categoryList = useMemo(
    () => [...categoriesArray].sort((a, b) => a.name.localeCompare(b.name, 'ja')),
    [categoriesArray]
  );

  const toggle = useCallback((cid: number) => {
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(cid)) next.delete(cid);
      else next.add(cid);
      return next;
    });
  }, []);

  if (isPending) return <div className="p-4">読み込み中…</div>;
  if (isError) return <div className="p-4 text-destructive">データの取得に失敗しました</div>;

  return (
    <div className="p-4 space-y-3">
      <h1 className="text-xl font-semibold">ノート一覧ページ</h1>

      <ul className="space-y-3">
        {categoryList.map((cat) => (
          <li key={cat.id} className="rounded-lg">
            <CategorySection
              category={cat}
              notes={navData?.notesByCategoryIdMap.get(cat.id) ?? []}
              isOpen={expanded.has(cat.id)}
              onToggle={() => toggle(cat.id)}
            />
          </li>
        ))}
      </ul>
    </div>
  );
}
