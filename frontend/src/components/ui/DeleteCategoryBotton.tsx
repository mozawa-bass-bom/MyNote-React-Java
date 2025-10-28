// src/components/category/DeleteCategoryButton.tsx
import { useCallback, useState } from 'react';
import { delOk } from '../../helpers/CustomAxios';
import {
  categoriesByIdAtom,
  notesByCategoryIdAtom,
  tocByNoteIdAtom,
  selectedCategoryIdAtom,
  selectedNoteIdAtom,
  noteDetailByIdAtom,
} from '../../states/UserAtom';
import { useAtomValue, useSetAtom } from 'jotai';
import type { NoteSummary } from '../../types/base';

type Props = { categoryId: number };

async function deleteCategoryApi(categoryId: number) {
  // 必要に応じてプレフィックス（/api 等）を付けてね
  return delOk(`notes/categories/${categoryId}`);
}

export default function DeleteCategoryButton({ categoryId }: Props) {
  const [pending, setPending] = useState(false);

  // 現在値の参照
  const categoriesById = useAtomValue(categoriesByIdAtom);
  const notesByCategoryId = useAtomValue(notesByCategoryIdAtom);
  const tocByNoteId = useAtomValue(tocByNoteIdAtom);
  const selectedCategoryId = useAtomValue(selectedCategoryIdAtom);
  const selectedNoteId = useAtomValue(selectedNoteIdAtom);
  const noteDetailById = useAtomValue(noteDetailByIdAtom);

  // セッター
  const setCategoriesById = useSetAtom(categoriesByIdAtom);
  const setNotesByCategory = useSetAtom(notesByCategoryIdAtom);
  const setTocByNoteId = useSetAtom(tocByNoteIdAtom);
  const setSelectedCategoryId = useSetAtom(selectedCategoryIdAtom);
  const setSelectedNoteId = useSetAtom(selectedNoteIdAtom);
  const setNoteDetailById = useSetAtom(noteDetailByIdAtom);

  const handleDeleteCategory = useCallback(async () => {
    if (pending) return;
    setPending(true);

    // 対象カテゴリ配下のノートIDを控えておく
    const notesInCat: NoteSummary[] = notesByCategoryId.get(categoryId) ?? [];
    const removedNoteIds = new Set<number>(notesInCat.map((n) => n.id));

    // --- 楽観的更新のためのバックアップ ---
    const prev = {
      categoriesById: categoriesById,
      notesByCategoryId: notesByCategoryId,
      tocByNoteId: tocByNoteId,
      selectedCategoryId,
      selectedNoteId,
      noteDetailById,
    };

    try {
      // --- 楽観的更新 ---
      setCategoriesById((prevMap) => {
        const next = new Map(prevMap);
        next.delete(categoryId);
        return next;
      });

      // 2) カテゴリ→ノート一覧の紐付けを消す
      setNotesByCategory((prevMap) => {
        const next = new Map(prevMap);
        next.delete(categoryId);
        return next;
      });

      // 3) 消えたノートの TOC / 詳細キャッシュも掃除
      setTocByNoteId((prevMap) => {
        const next = new Map(prevMap);
        for (const noteId of removedNoteIds) next.delete(noteId);
        return next;
      });

      setNoteDetailById((prevMap) => {
        const next = new Map(prevMap);
        for (const noteId of removedNoteIds) next.delete(noteId);
        return next;
      });

      // 4) 選択中が影響受けるならリセット
      if (selectedCategoryId === categoryId) setSelectedCategoryId(null);
      if (selectedNoteId != null && removedNoteIds.has(selectedNoteId)) setSelectedNoteId(null);

      // --- API 呼び出し ---
      await deleteCategoryApi(categoryId);
    } catch (e) {
      console.error('delete failed:', e);

      // --- ロールバック ---
      setCategoriesById(prev.categoriesById);
      setNotesByCategory(prev.notesByCategoryId);
      setTocByNoteId(prev.tocByNoteId);
      setNoteDetailById(prev.noteDetailById);
      setSelectedCategoryId(prev.selectedCategoryId);
      setSelectedNoteId(prev.selectedNoteId);
      alert('カテゴリの削除に失敗しました。通信状態などをご確認ください。');
    } finally {
      setPending(false);
    }
  }, [
    pending,
    categoryId,
    categoriesById,
    notesByCategoryId,
    tocByNoteId,
    selectedCategoryId,
    selectedNoteId,
    noteDetailById,
    setCategoriesById,
    setNotesByCategory,
    setTocByNoteId,
    setNoteDetailById,
    setSelectedCategoryId,
    setSelectedNoteId,
  ]);

  return (
    <button
      type="button"
      className="btn btn-danger"
      onClick={handleDeleteCategory}
      disabled={pending}
      aria-busy={pending}
    >
      {pending ? '削除中…' : '削除'}
    </button>
  );
}
