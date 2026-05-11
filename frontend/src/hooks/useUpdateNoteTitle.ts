// src/hooks/useUpdateNoteTitle.ts
import { useMutation, useQueryClient } from '@tanstack/react-query';
import customAxios from '../helpers/CustomAxios';
import { useAtomValue } from 'jotai';
import { loginUserAtom } from '../states/UserAtom';
import type { Category, NoteSummary } from '../types/base';

type UpdateTitleParams = {
  categoryId: number;
  userSeqNo: number;
  newTitle: string;
};

type NavQueryData = {
  categoriesByIdMap: Map<number, Category>;
  notesByCategoryIdMap: Map<number, NoteSummary[]>;
};

export default function useUpdateNoteTitle() {
  const queryClient = useQueryClient();
  const loginUser = useAtomValue(loginUserAtom);

  const mutation = useMutation({
    mutationFn: async ({ userSeqNo, newTitle }: UpdateTitleParams) => {
      await customAxios.patch(`/notes/${userSeqNo}/title`, { title: newTitle });
    },
    onMutate: async ({ categoryId, userSeqNo, newTitle }) => {
      const title = newTitle.trim();
      if (!title || !loginUser) return;
      
      const queryKey = ['nav', loginUser.userId];
      await queryClient.cancelQueries({ queryKey });
      
      const previousNav = queryClient.getQueryData<NavQueryData>(queryKey);

      if (previousNav) {
        const nextNotes = new Map(previousNav.notesByCategoryIdMap);
        const list = nextNotes.get(categoryId) ?? [];
        const idx = list.findIndex(n => n.userSeqNo === userSeqNo);
        
        if (idx !== -1 && list[idx].title !== title) {
          const nextList = [...list];
          nextList[idx] = { ...nextList[idx], title };
          nextNotes.set(categoryId, nextList);
          
          queryClient.setQueryData<NavQueryData>(queryKey, {
            ...previousNav,
            notesByCategoryIdMap: nextNotes,
          });
        }
      }

      // NoteDetail側もキャッシュにあれば一緒にタイトル更新するとより自然（今はNavをinvalidateする運用）
      const detailKey = ['noteDetail', userSeqNo];
      const previousDetail = queryClient.getQueryData<any>(detailKey);
      if (previousDetail && previousDetail.title !== title) {
         queryClient.setQueryData(detailKey, { ...previousDetail, title });
      }

      return { previousNav };
    },
    onError: (_err, _vars, context) => {
      if (context?.previousNav && loginUser) {
        queryClient.setQueryData(['nav', loginUser.userId], context.previousNav);
      }
    },
    onSettled: (_data, _err, { userSeqNo }) => {
      if (loginUser) {
        queryClient.invalidateQueries({ queryKey: ['nav', loginUser.userId] });
        queryClient.invalidateQueries({ queryKey: ['noteDetail', userSeqNo] });
      }
    },
  });

  const updateNoteTitle = async (
    { categoryId, userSeqNo }: { categoryId: number; userSeqNo: number },
    newTitle: string
  ): Promise<boolean> => {
      const title = newTitle.trim();
      if (!title) return false;
      try {
        await mutation.mutateAsync({ categoryId, userSeqNo, newTitle });
        return true;
      } catch (e) {
        return false;
      }
  };

  return { updateNoteTitle, isPending: mutation.isPending, error: mutation.error };
}
