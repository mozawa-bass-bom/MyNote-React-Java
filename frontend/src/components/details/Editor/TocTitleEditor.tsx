// src/components/editor/TocTitleEditor.tsx
import { useCallback } from 'react';
import SimpleEditor from './SimpleEditor';
import { useSetAtom } from 'jotai';
import { tocByNoteIdAtom } from '../../../states/UserAtom';
import { patchOk } from '../../../helpers/CustomAxios';

type Props = {
  noteId: number;
  tocId: number;
  initialTitle: string;
};

export default function TocTitleEditor({ noteId, tocId, initialTitle }: Props) {
  const setTocByNoteId = useSetAtom(tocByNoteIdAtom);

  const saveRequest = useCallback(
    async (title: string) => {
      // 楽観更新（ロールバックなし）
      setTocByNoteId((prev) => {
        const next = new Map(prev);
        const list = next.get(noteId);
        if (!list) return prev;
        const idx = list.findIndex((t) => t.id === tocId);
        if (idx < 0) return prev;
        next.set(noteId, [...list.slice(0, idx), { ...list[idx], title }, ...list.slice(idx + 1)]);
        return next;
      });

      await patchOk(`/notes/toc/${tocId}/rename`, { title });
    },
    [noteId, tocId, setTocByNoteId]
  );

  return <SimpleEditor initialValue={initialTitle} saveRequest={saveRequest} />;
}
