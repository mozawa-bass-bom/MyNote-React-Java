import { useState } from 'react';
import { delOk } from '../../helpers/CustomAxios';
import { notesByCategoryIdAtom, tocByNoteIdAtom } from '../../states/UserAtom';
import { useSetAtom } from 'jotai';
import type { NoteSummary, TocItem } from '../../types/base';

type Props = {
  userSeqNo: number;
  noteId?: number;
};

async function deleteNote(userSeqNo: number) {
  return delOk(`/notes/${userSeqNo}`);
}

export default function DeleteNoteButton({ userSeqNo, noteId }: Props) {
  const setNotesByCategoryId = useSetAtom(notesByCategoryIdAtom);
  const setTocByNoteId = useSetAtom(tocByNoteIdAtom);
  const [pending, setPending] = useState(false);

  const handleDeleteNote = async () => {
    setPending(true);

    let prevNotesMap: Map<number, NoteSummary[]> | null = null;
    let prevTocMap: Map<number, TocItem[]> | null = null;

    setNotesByCategoryId((prev) => {
      prevNotesMap = prev; // ロールバック用
      const next = new Map(prev);
      // 全カテゴリを走査して対象ノートを除外
      for (const [catId, list] of next) {
        const filtered = list.filter((n) => n.userSeqNo !== userSeqNo);
        if (filtered.length !== list.length) next.set(catId, filtered);
      }
      return next;
    });

    if (noteId != null) {
      setTocByNoteId((prev) => {
        prevTocMap = prev; // ロールバック用
        const next = new Map(prev);
        next.delete(noteId);
        return next;
      });
    }

    try {
      await deleteNote(userSeqNo); // API実行
    } catch (e) {
      console.error('delete failed:', e);
      // --- 失敗: ロールバック ---
      if (prevNotesMap) setNotesByCategoryId(new Map(prevNotesMap));
      if (prevTocMap) setTocByNoteId(new Map(prevTocMap));
      // エラートースト等
    } finally {
      setPending(false);
    }
  };

  return (
    <button
      onClick={handleDeleteNote}
      disabled={pending}
      className="
    inline-flex items-center gap-1
    rounded-md border border-2 border-red-200
    px-2 py-1 text-sm font-medium text-gray-700
    hover:bg-red-100 hover:border-red-400 hover:text-red-800
    active:bg-red-200
    focus:outline-none focus-visible:ring-2 focus-visible:ring-red-300
    disabled:opacity-50 disabled:cursor-not-allowed
    transition-colors
  "
    >
      削除
    </button>
  );
}
