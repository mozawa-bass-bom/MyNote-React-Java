// src/hooks/useUpdateCategoryName.ts
import { useCallback, useState } from 'react';
import customAxios from '../helpers/CustomAxios';
import { useSetAtom, useAtomValue } from 'jotai';
import { categoriesByIdAtom } from '../states/UserAtom';
import type { Category } from '../types/base';

export default function useUpdateCategoryName() {
  const [isPending, setIsPending] = useState(false);
  const [error, setError] = useState<unknown>(null);
  const setCategoriesById = useSetAtom(categoriesByIdAtom);
  const categoriesById = useAtomValue(categoriesByIdAtom);

  const update = useCallback(
    async (categoryId: number, newName: string) => {
      setIsPending(true);
      setError(null);

      // 現在値を保存（失敗時ロールバック用）
      const prev = categoriesById.get(categoryId);
      if (!prev) return;

      // 楽観的更新
      setCategoriesById(new Map(categoriesById.set(categoryId, { ...prev, name: newName } as Category)));

      try {
        // PATCH /categories/:id { name }
        await customAxios.patch(`notes/categories/${categoryId}`, { name: newName });
      } catch (e) {
        setError(e);
        // ロールバック
        setCategoriesById(new Map(categoriesById.set(categoryId, prev)));
        throw e;
      } finally {
        setIsPending(false);
      }
    },
    [categoriesById, setCategoriesById]
  );

  return { update, isPending, error };
}
