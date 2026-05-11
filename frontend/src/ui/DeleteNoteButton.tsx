import { delOk } from '../helpers/CustomAxios';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useAtomValue, useSetAtom } from 'jotai';
import { loginUserAtom } from '../states/UserAtom';
import { addToastAtom } from '../states/ToastAtom';
import type { Category, NoteSummary, TocItem } from '../types/base';

type Props = {
  userSeqNo: number;
  noteId?: number;
};

export default function DeleteNoteButton({ userSeqNo, noteId }: Props) {
  const queryClient = useQueryClient();
  const loginUser = useAtomValue(loginUserAtom);
  const addToast = useSetAtom(addToastAtom);

  const mutation = useMutation({
    mutationFn: async () => {
      await delOk(`/notes/${userSeqNo}`);
    },
    onMutate: async () => {
      if (!loginUser) return;
      const navKey = ['nav', loginUser.userId];
      
      await queryClient.cancelQueries({ queryKey: navKey });
      
      const previousNav = queryClient.getQueryData<{
        categoriesByIdMap: Map<number, Category>;
        notesByCategoryIdMap: Map<number, NoteSummary[]>;
      }>(navKey);

      if (previousNav) {
        const nextNotes = new Map(previousNav.notesByCategoryIdMap);
        for (const [catId, list] of nextNotes) {
          const filtered = list.filter((n) => n.userSeqNo !== userSeqNo);
          if (filtered.length !== list.length) {
             nextNotes.set(catId, filtered);
          }
        }
        
        queryClient.setQueryData(navKey, {
          ...previousNav,
          notesByCategoryIdMap: nextNotes,
        });
      }

      let previousToc: Map<number, TocItem[]> | undefined;
      if (noteId != null) {
        previousToc = queryClient.getQueryData(['toc']);
        if (previousToc) {
          const nextToc = new Map(previousToc);
          nextToc.delete(noteId);
          queryClient.setQueryData(['toc'], nextToc);
        }
      }

      return { previousNav, previousToc };
    },
    onSuccess: () => {
      addToast({ type: 'success', message: 'ノートを削除しました' });
    },
    onError: (_err, _vars, context) => {
      if (loginUser && context?.previousNav) {
        queryClient.setQueryData(['nav', loginUser.userId], context.previousNav);
      }
      if (context?.previousToc) {
        queryClient.setQueryData(['toc'], context.previousToc);
      }
    },
    onSettled: () => {
       if (loginUser) {
           queryClient.invalidateQueries({ queryKey: ['nav', loginUser.userId] });
       }
       if (noteId != null) {
           queryClient.invalidateQueries({ queryKey: ['toc'] });
           queryClient.invalidateQueries({ queryKey: ['noteDetail', userSeqNo] });
       }
    }
  });

  return (
    <button onClick={() => mutation.mutate()} disabled={mutation.isPending} className="btn btn-danger">
      {mutation.isPending ? '削除中...' : '削除'}
    </button>
  );
}
