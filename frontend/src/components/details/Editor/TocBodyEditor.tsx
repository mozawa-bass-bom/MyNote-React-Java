// src/components/editor/TocBodyEditor.tsx
import { useCallback } from 'react';
import { useSetAtom } from 'jotai';
import SimpleEditor from './SimpleEditor';
import { patchOk } from '../../../helpers/CustomAxios';
import { addToastAtom } from '../../../states/ToastAtom';

type Props = {
  tocId: number;
  initialBody: string;
};

export default function TocBodyEditor({ tocId, initialBody }: Props) {
  const addToast = useSetAtom(addToastAtom);

  const saveRequest = useCallback(
    async (body: string) => {
      await patchOk(`/notes/toc/${tocId}/rebody`, { body });
    },
    [tocId]
  );

  const onSaved = useCallback(() => {
    addToast({ type: 'success', message: '目次を保存しました' });
  }, [addToast]);

  const onError = useCallback(() => {
    addToast({ type: 'error', message: '目次の保存に失敗しました' });
  }, [addToast]);

  return (
    <SimpleEditor
      initialValue={initialBody}
      saveRequest={saveRequest}
      onSaved={onSaved}
      onError={onError}
    />
  );
}
