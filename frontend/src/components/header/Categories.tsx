import { useMemo } from 'react';
import { useCategories } from '../../hooks/queries/useNav';
import CategoryRow from './CategoryRow';

export default function Categories() {
  const { categoriesArray, isPending } = useCategories();

  const categories = useMemo(() => {
    const arr = [...categoriesArray];
    arr.sort((a, b) => a.id - b.id);
    return arr;
  }, [categoriesArray]);

  if (isPending) {
    return (
      <div role="status" aria-live="polite">
        ナビを読み込み中…
      </div>
    );
  }
  if (categories.length === 0) {
    return <div className="text-sm text-muted-foreground">カテゴリがありません</div>;
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
