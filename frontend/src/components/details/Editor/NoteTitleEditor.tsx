// src/components/editor/NoteTitleEditor.tsx
import { useCallback } from 'react';
import UltraSimpleEditor from './SimpleEditor';
import useUpdateNoteTitle from '../../../hooks/useUpdateNoteTitle';

type Props = {
  categoryId: number;
  noteId: number;
  userSeqNo: number;
  initialTitle: string;
};

export default function NoteTitleEditor({ categoryId, userSeqNo, initialTitle }: Props) {
  const { updateNoteTitle } = useUpdateNoteTitle();

  const saveRequest = useCallback(
    async (title: string) => {
      await updateNoteTitle({ categoryId, userSeqNo }, title);
    },
    [categoryId, userSeqNo, updateNoteTitle]
  );

  return <UltraSimpleEditor initialValue={initialTitle} saveRequest={saveRequest} />;
}
