// src/components/editor/NoteTitleEditor.tsx
import { useCallback } from 'react';
import UltraSimpleEditor from './SimpleEditor';
import { useSetAtom } from 'jotai';
import { notesByCategoryIdAtom, noteDetailByIdAtom } from '../../../states/UserAtom';
import { patchOk } from '../../../helpers/CustomAxios';

type Props = {
  categoryId: number;
  noteId: number;
  userSeqNo: number;
  initialTitle: string;
};

export default function NoteTitleEditor({ categoryId, noteId, userSeqNo, initialTitle }: Props) {
  const setNotesByCategory = useSetAtom(notesByCategoryIdAtom);
  const setNoteDetailById = useSetAtom(noteDetailByIdAtom);

  const saveRequest = useCallback(
    async (title: string) => {
      setNotesByCategory((prev) => {
        const next = new Map(prev);
        const arr = next.get(categoryId);
        if (!arr) return prev;
        const idx = arr.findIndex((n) => n.id === noteId);
        if (idx < 0) return prev;
        next.set(categoryId, [...arr.slice(0, idx), { ...arr[idx], title }, ...arr.slice(idx + 1)]);
        return next;
      });

      setNoteDetailById((prev) => {
        if (!prev.has(noteId)) return prev;
        const next = new Map(prev);
        next.set(noteId, { ...next.get(noteId)!, title });
        return next;
      });

      await patchOk(`/notes/${userSeqNo}/title`, { title });
    },
    [categoryId, noteId, userSeqNo, setNotesByCategory, setNoteDetailById]
  );

  return <UltraSimpleEditor initialValue={initialTitle} saveRequest={saveRequest} />;
}
