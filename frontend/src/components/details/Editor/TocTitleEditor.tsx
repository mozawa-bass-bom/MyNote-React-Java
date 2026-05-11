// src/components/editor/TocTitleEditor.tsx
import { useCallback } from 'react';
import SimpleEditor from './SimpleEditor';
import { useQueryClient } from '@tanstack/react-query';
import { patchOk } from '../../../helpers/CustomAxios';
import type { TocItem } from '../../../types/base';

type Props = {
  noteId: number;
  tocId: number;
  initialTitle: string;
};

export default function TocTitleEditor({ noteId, tocId, initialTitle }: Props) {
  const queryClient = useQueryClient();

  const saveRequest = useCallback(
    async (title: string) => {
      // 楽観更新
      const queryKey = ['toc'];
      const previousToc = queryClient.getQueryData<Map<number, TocItem[]>>(queryKey);
      
      if (previousToc) {
        const nextToc = new Map(previousToc);
        const list = nextToc.get(noteId);
        if (list) {
          const idx = list.findIndex((t) => t.id === tocId);
          if (idx >= 0) {
            nextToc.set(noteId, [...list.slice(0, idx), { ...list[idx], title }, ...list.slice(idx + 1)]);
            queryClient.setQueryData(queryKey, nextToc);
          }
        }
      }

      await patchOk(`/notes/toc/${tocId}/rename`, { title });
    },
    [noteId, tocId, queryClient]
  );

  return <SimpleEditor initialValue={initialTitle} saveRequest={saveRequest} />;
}
