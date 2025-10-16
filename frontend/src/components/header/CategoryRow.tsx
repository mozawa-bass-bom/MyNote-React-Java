// src/pages/categories/CategoryRow.tsx
import { useEffect, useRef, useState, useCallback, memo } from 'react';
import CategoryItem from './CategoryItem';
import useUpdateCategoryName from '../../hooks/useUpdateCategoryName';

function EditIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true" focusable="false">
      <path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25z" fill="currentColor" />
      <path
        d="M20.71 7.04a1 1 0 0 0 0-1.41L18.37 3.29a1 1 0 0 0-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z"
        fill="currentColor"
      />
    </svg>
  );
}
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
  const [isEdit, setIsEdit] = useState(false);
  const [draft, setDraft] = useState(name);
  const [isOpen, setIsOpen] = useState(false);
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

  const handleOpen = useCallback(() => {
    setIsOpen(!isOpen);
  }, [isOpen]);

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
      {isEdit ? (
        <>
          <div className="flex gap-1">
            <input
              ref={inputRef}
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              onKeyDown={onKeyDown}
              className="flex-1 min-w-0 px-2 py-1 rounded border text-sm"
              aria-label="カテゴリ名を編集"
              disabled={isPending}
            />
            <button
              type="button"
              onClick={handleConfirm}
              disabled={isPending}
              className="w-20 whitespace-nowrap px-2 py-1 rounded bg-black/80 text-white text-sm disabled:opacity-50"
            >
              {isPending ? '保存中…' : '確定'}
            </button>
          </div>
        </>
      ) : (
        <>
          <div className="flex justify-between items-center gap-1  ">
            <h2
              onClick={handleOpen}
              className="bg-gray-100 rounded w-100 flex flex-1 cursor-pointer select-none items-center gap-1 py-1"
            >
              <span className="inline-flex h-5 w-5 items-center justify-center">
                {isOpen ? <MinusIcon /> : <PlusIcon />}
              </span>

              {/* 名前（折り返し抑制したいなら truncate 追加可） */}
              <span className="font-semibold leading-none">{name}</span>

              {/* バッジ */}
              <span className="ml-1 inline-flex items-center rounded bg-white px-1.5 py-0.5 text-xs leading-none">
                {noteCount}
              </span>
            </h2>

            <button type="button" onClick={handleStart} className="p-1 rounded hover:bg-black/5" aria-label="編集">
              <EditIcon />
            </button>
          </div>
        </>
      )}

      {/* 子はノート一覧 */}
      <CategoryItem categoryId={id} isOpen={isOpen} />
    </li>
  );
}

const CategoryRow = memo(CategoryRowImpl);
export default CategoryRow;
