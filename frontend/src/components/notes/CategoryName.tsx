// src/pages/categories/CategoryTitleBar.tsx
import { memo, useCallback, useEffect, useRef, useState } from 'react';
import type { Category } from '../../types/base';
import useUpdateCategoryName from '../../hooks/useUpdateCategoryName';

type Props = {
  category: Category;
  noteCount: number;
};

export const CategoryName = memo(function CategoryTitleBar({ category, noteCount }: Props) {
  const { update, isPending } = useUpdateCategoryName(); // カテゴリ名の更新用
  const [isEdit, setIsEdit] = useState(false);
  const [draft, setDraft] = useState(category.name);
  const inputRef = useRef<HTMLInputElement>(null);

  // 外部更新に追随
  useEffect(() => setDraft(category.name), [category.name]);

  const startEdit = useCallback((e?: React.MouseEvent) => {
    e?.stopPropagation(); // 親のクリックと独立
    setIsEdit(true);
  }, []);

  const confirmEdit = useCallback(
    async (e?: React.MouseEvent) => {
      e?.stopPropagation();
      const name = draft.trim();
      if (!name || name === category.name) return setIsEdit(false);
      try {
        await update(category.id, name);
        setIsEdit(false);
      } catch {
        // TODO: トースト等
      }
    },
    [draft, category.id, category.name, update]
  );

  const onKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        confirmEdit();
      }
    },
    [confirmEdit]
  );

  useEffect(() => {
    if (isEdit) {
      inputRef.current?.focus();
      inputRef.current?.select();
    }
  }, [isEdit]);

  return (
    <div className="flex items-center gap-2">
      {isEdit ? (
        <>
          <input
            ref={inputRef}
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={onKeyDown}
            disabled={isPending}
            aria-label="カテゴリ名を編集"
            className="px-2 py-1 rounded border text-sm bg-white"
          />
          <button
            type="button"
            onClick={confirmEdit}
            disabled={isPending}
            className="rounded px-2 py-1 text-sm bg-black/80 text-white hover:opacity-90 disabled:opacity-50"
          >
            {isPending ? '保存中…' : '確定'}
          </button>
        </>
      ) : (
        <>
          <div className="font-medium">
            {category.name}
            <span className="ml-2 text-xs text-gray-500">({noteCount})</span>
          </div>
          <button
            type="button"
            onClick={startEdit}
            className="p-1 rounded bg-black/5"
            aria-label="編集"
            onMouseDown={(e) => e.stopPropagation()} // ダブルクリック誤爆防止
          >
            <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true" focusable="false">
              <path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25z" fill="currentColor" />
              <path
                d="M20.71 7.04a1 1 0 0 0 0-1.41L18.37 3.29a1 1 0 0 0-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z"
                fill="currentColor"
              />
            </svg>
          </button>
        </>
      )}
    </div>
  );
});
