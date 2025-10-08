// src/pages/categories/CategoryRow.tsx
import { useEffect, useRef, useState, useCallback, memo } from 'react';
import CategoryItem from './CategoryItem';
import useUpdateCategoryName from '../../hooks/useUpdateCategoryName';

function HamburgerIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true" focusable="false">
      <path d="M3 6h18M3 12h18M3 18h18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

type Props = {
  id: number;
  name: string;
  noteCount: number;
};

function CategoryRowImpl({ id, name, noteCount }: Props) {
  const [isEdit, setIsEdit] = useState(false);
  const [draft, setDraft] = useState(name);
  const inputRef = useRef<HTMLInputElement>(null);
  const { update, isPending } = useUpdateCategoryName();

  // 表示名が外側で変わった時（別場所から更新など）draftも追随
  useEffect(() => setDraft(name), [name]);

  // 編集開始 → フォーカス
  const handleStart = useCallback(() => {
    setIsEdit(true);
  }, []);

  // キャンセル
  const handleCancel = useCallback(() => {
    setDraft(name);
    setIsEdit(false);
  }, [name]);

  // 確定（API叩く）
  const handleConfirm = useCallback(async () => {
    const trimmed = draft.trim();
    if (!trimmed || trimmed === name) {
      setIsEdit(false);
      return;
    }
    try {
      await update(id, trimmed);
      setIsEdit(false);
    } catch {
      // ここでトーストなど出してもOK
    }
  }, [draft, id, name, update]);

  // Enter 確定 / Esc キャンセル
  const onKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        handleConfirm();
      } else if (e.key === 'Escape') {
        e.preventDefault();
        handleCancel();
      }
    },
    [handleConfirm, handleCancel]
  );

  useEffect(() => {
    if (isEdit) {
      inputRef.current?.focus();
      inputRef.current?.select();
    }
  }, [isEdit]);

  return (
    <li className="space-y-1">
      <div className="flex items-center gap-2">
        {isEdit ? (
          <>
            <input
              ref={inputRef}
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              onKeyDown={onKeyDown}
              className="px-2 py-1 rounded border text-sm"
              aria-label="カテゴリ名を編集"
              disabled={isPending}
            />
            <button
              type="button"
              onClick={handleConfirm}
              disabled={isPending}
              className="px-2 py-1 rounded bg-black/80 text-white text-xs disabled:opacity-50"
            >
              {isPending ? '保存中…' : '確定'}
            </button>
            <button
              type="button"
              onClick={handleCancel}
              disabled={isPending}
              className="px-2 py-1 rounded border text-xs disabled:opacity-50"
            >
              キャンセル
            </button>
          </>
        ) : (
          <>
            <h2 className="font-semibold">
              {name}{' '}
              <span className="ml-1 inline-flex items-center text-xs px-1.5 py-0.5 rounded bg-black/5">
                {noteCount}
              </span>
            </h2>
            <button
              type="button"
              onClick={handleStart}
              className="p-1 rounded hover:bg-black/5"
              aria-label={`カテゴリ「${name}」を編集`}
              title="編集"
            >
              <HamburgerIcon />
            </button>
          </>
        )}
      </div>

      {/* 子はノート一覧 */}
      <CategoryItem categoryId={id} />
    </li>
  );
}

const CategoryRow = memo(CategoryRowImpl);
export default CategoryRow;
