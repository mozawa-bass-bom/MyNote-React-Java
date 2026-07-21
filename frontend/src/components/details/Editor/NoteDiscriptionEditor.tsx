// src/components/editor/NoteDiscriptionEditor.tsx
import { useCallback } from 'react';
import { useSetAtom } from 'jotai';
import SimpleEditor from './SimpleEditor';
import { patchOk } from '../../../helpers/CustomAxios';
import { addToastAtom } from '../../../states/ToastAtom';

type Props = {
  userSeqNo: number;
  initialDiscription: string;
};

export default function NoteDiscriptionEditor({ userSeqNo, initialDiscription }: Props) {
  const addToast = useSetAtom(addToastAtom);

  const saveRequest = useCallback(
    async (description: string) => {
      await patchOk(`/notes/${userSeqNo}/description`, { description });
    },
    [userSeqNo]
  );

  const onSaved = useCallback(() => {
    addToast({ type: 'success', message: '概要を保存しました' });
  }, [addToast]);

  const onError = useCallback(() => {
    addToast({ type: 'error', message: '概要の保存に失敗しました' });
  }, [addToast]);

  return (
    <SimpleEditor
      initialValue={initialDiscription}
      saveRequest={saveRequest}
      onSaved={onSaved}
      onError={onError}
    />
  );
}
