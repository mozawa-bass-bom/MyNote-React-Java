// src/pages/notes/NoteTitle.tsx
import { memo, useCallback, useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import useUpdateNoteTitle from '../../hooks/useUpdateNoteTitle';

type NoteTitleProps = {
  title: string;
  categoryId: number;
  userSeqNo: number;
};

export const NoteTitle = memo(function NoteTitle({ title, categoryId, userSeqNo }: NoteTitleProps) {
  const { updateNoteTitle, isPending } = useUpdateNoteTitle();
  const [isEdit, setIsEdit] = useState(false);
  const [draft, setDraft] = useState(title);
  const inputRef = useRef<HTMLInputElement>(null);

  // 外部更新に追随（親側でタイトルが変わった場合）
  useEffect(() => setDraft(title), [title]);

  const startEdit = useCallback((e?: React.MouseEvent) => {
    e?.stopPropagation();
    setIsEdit(true);
  }, []);

  const confirmEdit = useCallback(
    async (e?: React.MouseEvent) => {
      e?.stopPropagation();
      const next = draft.trim();
      if (!next || next === title) return setIsEdit(false);
      const ok = await updateNoteTitle({ categoryId, userSeqNo }, next);
      if (ok) setIsEdit(false);
      // 失敗時はhook側でロールバック済み。ここでtoastなど
    },
    [draft, title, categoryId, userSeqNo, updateNoteTitle]
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
    <div className="min-w-0 flex items-center gap-2">
      {isEdit ? (
        <>
          <input
            ref={inputRef}
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={onKeyDown}
            disabled={isPending}
            aria-label="ノートタイトルを編集"
            className="px-1.5 py-0.5 rounded border text-sm bg-white min-w-0"
          />
          <button
            type="button"
            onClick={confirmEdit}
            disabled={isPending}
            className="rounded px-2 py-0.5 text-xs bg-black/80 text-white hover:opacity-90 disabled:opacity-50"
          >
            {isPending ? '保存中…' : '確定'}
          </button>
        </>
      ) : (
        <>
          {/* タイトルは従来どおりノート詳細へのリンク */}
          <h3 className="min-w-0 flex-1 text-base font-semibold leading-snug">
            <Link
              to={`/notes/${userSeqNo}`}
              className="block truncate hover:underline"
              title={title}
              onClick={(e) => {
                // もし親行にonClickがあって誤爆するなら止める
                e.stopPropagation();
              }}
            >
              {title}
            </Link>
          </h3>
          <button
            type="button"
            onClick={startEdit}
            className="p-1 rounded bg-black/5"
            aria-label="ノートタイトルを編集"
            onMouseDown={(e) => e.stopPropagation()}
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
