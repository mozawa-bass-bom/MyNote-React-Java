// src/hooks/useUpdateCategoryName.ts
import { useMutation, useQueryClient } from '@tanstack/react-query';
import customAxios from '../helpers/CustomAxios';
import { useAtomValue } from 'jotai';
import { loginUserAtom } from '../states/UserAtom';
import type { Category, NoteSummary } from '../types/base';

type UpdateCategoryPrams = {
  categoryId: number;
  newName: string;
};

type NavQueryData = {
  categoriesByIdMap: Map<number, Category>;
  notesByCategoryIdMap: Map<number, NoteSummary[]>;
};

export default function useUpdateCategoryName() {
  const queryClient = useQueryClient();
  const loginUser = useAtomValue(loginUserAtom);

  const mutation = useMutation({
    mutationFn: async ({ categoryId, newName }: UpdateCategoryPrams) => {
      await customAxios.patch(`notes/categories/${categoryId}`, { name: newName });
    },
    // 楽観的更新
    onMutate: async ({ categoryId, newName }) => {
      if (!loginUser) return;
      const queryKey = ['nav', loginUser.userId];

      await queryClient.cancelQueries({ queryKey });

      const previousNav = queryClient.getQueryData<NavQueryData>(queryKey);

      if (previousNav) {
        // Map の中身を安全にコピーして新状態を作る
        const nextCategories = new Map(previousNav.categoriesByIdMap);
        const prevCat = nextCategories.get(categoryId);
        if (prevCat) {
          nextCategories.set(categoryId, { ...prevCat, name: newName });
        }

        queryClient.setQueryData<NavQueryData>(queryKey, {
          ...previousNav,
          categoriesByIdMap: nextCategories,
        });
      }

      return { previousNav };
    },
    onError: (_err, _newVal, context) => {
      if (context?.previousNav && loginUser) {
        queryClient.setQueryData(['nav', loginUser.userId], context.previousNav);
      }
    },
    onSettled: () => {
      if (loginUser) {
        queryClient.invalidateQueries({ queryKey: ['nav', loginUser.userId] });
      }
    },
  });

  // 既存インターフェースに合わせる
  const update = async (categoryId: number, newName: string) => {
    return mutation.mutateAsync({ categoryId, newName });
  };

  return { update, isPending: mutation.isPending, error: mutation.error };
}
