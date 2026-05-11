// src/components/category/DeleteCategoryButton.tsx
import { useCallback } from 'react';
import { delOk } from '../helpers/CustomAxios';
import { selectedCategoryIdAtom, loginUserAtom } from '../states/UserAtom';
import { useAtom, useAtomValue, useSetAtom } from 'jotai';
import { addToastAtom } from '../states/ToastAtom';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import type { Category, NoteSummary } from '../types/base';

type Props = { categoryId: number };

export default function DeleteCategoryButton({ categoryId }: Props) {
  const loginUser = useAtomValue(loginUserAtom);
  const [selectedCategoryId, setSelectedCategoryId] = useAtom(selectedCategoryIdAtom);
  const addToast = useSetAtom(addToastAtom);
  
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: async (catId: number) => {
      await delOk(`notes/categories/${catId}`);
    },
    onMutate: async (catId) => {
      if (!loginUser) return;
      const navKey = ['nav', loginUser.userId];
      
      await queryClient.cancelQueries({ queryKey: navKey });
      const previousNav = queryClient.getQueryData<{
        categoriesByIdMap: Map<number, Category>;
        notesByCategoryIdMap: Map<number, NoteSummary[]>;
      }>(navKey);

      if (previousNav) {
        const nextCategories = new Map(previousNav.categoriesByIdMap);
        nextCategories.delete(catId);
        
        const nextNotes = new Map(previousNav.notesByCategoryIdMap);
        nextNotes.delete(catId);
        
        queryClient.setQueryData(navKey, {
          categoriesByIdMap: nextCategories,
          notesByCategoryIdMap: nextNotes,
        });
      }
      
      if (selectedCategoryId === catId) setSelectedCategoryId(null);
      // 注: 選択中ノートが所属していたかも判定できればselectedNoteIdもクリア可能
      
      return { previousNav };
    },
    onSuccess: () => {
       addToast({ type: 'success', message: 'カテゴリを削除しました' });
    },
    onError: (_err, _catId, context) => {
       if (context?.previousNav && loginUser) {
           queryClient.setQueryData(['nav', loginUser.userId], context.previousNav);
       }
       alert('カテゴリの削除に失敗しました。');
    },
    onSettled: () => {
       if (loginUser) {
           queryClient.invalidateQueries({ queryKey: ['nav', loginUser.userId] });
       }
    }
  });

  const handleDeleteCategory = useCallback(async () => {
    mutation.mutate(categoryId);
  }, [categoryId, mutation]);

  return (
    <button
      type="button"
      className="btn btn-danger"
      onClick={handleDeleteCategory}
      disabled={mutation.isPending}
      aria-busy={mutation.isPending}
    >
      {mutation.isPending ? '削除中…' : '削除'}
    </button>
  );
}
