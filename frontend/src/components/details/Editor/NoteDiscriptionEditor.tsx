// src/components/editor/TocBodyEditor.tsx
import { useCallback } from 'react';
import SimpleEditor from './SimpleEditor';
import { patchOk } from '../../../helpers/CustomAxios';

type Props = {
  userSeqNo: number;
  initialDiscription: string;
};

export default function NoteDiscriptionEditor({ userSeqNo, initialDiscription }: Props) {
  const saveRequest = useCallback(
    async (description: string) => {
      await patchOk(`/notes/${userSeqNo}/description`, { description });
    },
    [userSeqNo]
  );

  return <SimpleEditor initialValue={initialDiscription} saveRequest={saveRequest} />;
}
