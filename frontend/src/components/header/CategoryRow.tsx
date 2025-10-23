// src/pages/categories/CategoryRow.tsx
import { useState, useCallback, memo } from 'react';
import CategoryItem from './CategoryItem';

function MinusIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true" focusable="false">
      <path d="M3 12h18" stroke="currentColor" strokeWidth="1" strokeLinecap="round" />
    </svg>
  );
}

function PlusIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true" focusable="false">
      <path d="M12 5v14M5 12h14" stroke="currentColor" strokeWidth="1" strokeLinecap="round" />
    </svg>
  );
}

type Props = {
  id: number;
  name: string;
  noteCount: number;
};

function CategoryRowImpl({ id, name, noteCount }: Props) {
  const [isOpen, setIsOpen] = useState(false);

  const handleOpen = useCallback(() => {
    setIsOpen((v) => !v);
  }, []);

  return (
    <li className="space-y-1">
      <div
        className="flex items-center gap-1"
        role="button"
        aria-expanded={isOpen}
        tabIndex={0}
        onClick={handleOpen}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') handleOpen();
        }}
      >
        <h2 className="bg-gray-100 rounded w-full flex flex-1 cursor-pointer select-none items-center gap-1 py-1 px-1.5">
          <span className="inline-flex h-5 w-5 items-center justify-center">
            {isOpen ? <MinusIcon /> : <PlusIcon />}
          </span>

          <span className="font-semibold leading-none">{name}</span>

          <span className="ml-1 inline-flex items-center rounded bg-white px-1.5 py-0.5 text-xs leading-none">
            {noteCount}
          </span>
        </h2>
      </div>

      {/* 子はノート一覧 */}
      <CategoryItem categoryId={id} isOpen={isOpen} />
    </li>
  );
}

const CategoryRow = memo(CategoryRowImpl);
export default CategoryRow;
