// src/components/editor/TocBodyEditor.tsx
import { useCallback } from 'react';
import SimpleEditor from './SimpleEditor';
import { patchOk } from '../../../helpers/CustomAxios';

type Props = {
  tocId: number;
  initialBody: string;
};

export default function TocBodyEditor({ tocId, initialBody }: Props) {
  const saveRequest = useCallback(
    async (body: string) => {
      await patchOk(`/notes/toc/${tocId}/rebody`, { body });
    },
    [tocId]
  );

  return <SimpleEditor initialValue={initialBody} saveRequest={saveRequest} />;
}
