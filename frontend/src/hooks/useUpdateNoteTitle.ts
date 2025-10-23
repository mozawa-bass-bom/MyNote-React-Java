import { useCallback, useState } from 'react';
import customAxios from '../helpers/CustomAxios';
import { useSetAtom } from 'jotai';
import { notesByCategoryIdAtom } from '../states/UserAtom';
import type { NoteSummary } from '../types/base';

export default function useUpdateNoteTitle() {
  const setNotesByCategoryId = useSetAtom(notesByCategoryIdAtom); // 値は読まないので useSetAtom に
  const [isPending, setIsPending] = useState(false);
  const [error, setError] = useState<unknown>(null);

  // AtomがカテゴリーIDをKEYにしてるのでpropsで渡す
  const updateNoteTitle = useCallback(
    async (
      { categoryId, userSeqNo }: { categoryId: number; userSeqNo: number },
      newTitle: string
    ): Promise<boolean> => {
      const title = newTitle.trim();
      if (!title) return false; // 空は無視

      setIsPending(true);
      setError(null);

      let rollback: Map<number, NoteSummary[]> | null = null;
      let updated = false;

      // 楽観更新＋スナップショット
      setNotesByCategoryId((prev) => {
        // スナップショット（配列は浅いコピー）
        rollback = new Map(Array.from(prev.entries()).map(([k, v]) => [k, v.slice()]));

        const list = prev.get(categoryId) ?? [];
        const idx = list.findIndex((n) => n.userSeqNo === userSeqNo);
        if (idx === -1) return prev;

        // 変更なしなら早期return（APIも叩かない）
        if (list[idx].title === title) {
          updated = false;
          return prev;
        }

        const next = new Map(prev);
        const nextList = list.slice();
        nextList[idx] = { ...nextList[idx], title };
        next.set(categoryId, nextList);

        updated = true;
        return next;
      });

      if (!updated) {
        setIsPending(false);
        return false;
      }

      try {
        await customAxios.patch(`/notes/${userSeqNo}/title`, { title });
        return true;
      } catch (e) {
        // ロールバック
        if (rollback) setNotesByCategoryId(rollback);
        setError(e);
        return false; // ここは throw でもOK。用途に合わせて。
      } finally {
        setIsPending(false);
      }
    },
    [setNotesByCategoryId]
  );

  return { updateNoteTitle, isPending, error };
}
