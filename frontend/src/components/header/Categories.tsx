// src/pages/categories/CategoriesPage.tsx
import { useMemo } from 'react';
import { useAtomValue, useSetAtom } from 'jotai';
import { categoriesByIdAtom, selectedCategoryIdAtom } from '../../states/UserAtom';
import CategoryItem from './CategoryItem';

function HamburgerIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true">
      <path d="M3 6h18M3 12h18M3 18h18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

export default function CategoriesPage() {
  const categoriesMap = useAtomValue(categoriesByIdAtom);
  const setSelectedCategoryId = useSetAtom(selectedCategoryIdAtom);

  const categories = useMemo(() => Array.from(categoriesMap.values()), [categoriesMap]);

  if (categories.length === 0) return <div>ナビを読み込み中…</div>;

  const onEditClick = (categoryId: number) => {
    setSelectedCategoryId(categoryId); // 編集対象をセット
  };

  return (
    <nav className="space-y-3">
      <ul className="space-y-3">
        {categories.map((cat) => (
          <li key={cat.id} className="space-y-1">
            <div className="flex items-center gap-2">
              <h2 className="font-semibold">{cat.name}</h2>
              <button
                type="button"
                onClick={() => onEditClick(cat.id)}
                className="p-1 rounded hover:bg-black/5"
                aria-label={`カテゴリ「${cat.name}」を編集`}
                title="編集"
              >
                <HamburgerIcon />
              </button>
            </div>

            {/* 子はノート一覧だけを描画（<li>は親が持つ） */}
            <CategoryItem categoryId={cat.id} />
          </li>
        ))}
      </ul>
    </nav>
  );
}
