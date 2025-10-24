import { useMemo } from 'react';
import { useAtomValue } from 'jotai';
import { categoriesByIdAtom } from '../../states/UserAtom';
import CategoryRow from './CategoryRow';

export default function Categories() {
  const categoriesMap = useAtomValue(categoriesByIdAtom);

  const categories = useMemo(() => {
    const arr = Array.from(categoriesMap.values());
    arr.sort((a, b) => a.id - b.id);
    return arr;
  }, [categoriesMap]);

  if (categoriesMap.size === 0) {
    return (
      <div role="status" aria-live="polite">
        ナビを読み込み中…
      </div>
    );
  }
  if (categories.length === 0) {
    return <div className="text-sm text-gray-500">カテゴリがありません</div>;
  }

  return (
    <nav className="space-y-3" aria-label="カテゴリ ナビゲーション">
      <ul className="space-y-3">
        {categories.map((c) => (
          <CategoryRow key={c.id} id={c.id} name={c.name} />
        ))}
      </ul>
    </nav>
  );
}
