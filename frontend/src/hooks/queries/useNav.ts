import { useQuery } from '@tanstack/react-query';
import { getNavById } from '../../helpers/RefreshNavService';
import { useAtomValue } from 'jotai';
import { loginUserAtom } from '../../states/UserAtom';
import { useMemo } from 'react';
import type { Category, NoteSummary } from '../../types/base';
import type { Nav } from '../../types/loginUser';

// サーバーはRecord<string, ...>を返すので、Mapに変換するヘルパー
function normalizeNav(nav: Nav) {
  const categoriesByIdMap = new Map<number, Category>();
  for (const [idStr, cat] of Object.entries(nav.categories)) {
    categoriesByIdMap.set(Number(idStr), cat);
  }

  const notesByCategoryIdMap = new Map<number, NoteSummary[]>();
  for (const [catIdStr, notes] of Object.entries(nav.notesByCategory)) {
    notesByCategoryIdMap.set(Number(catIdStr), notes);
  }

  return { categoriesByIdMap, notesByCategoryIdMap };
}

export function useNavQuery() {
  const loginUser = useAtomValue(loginUserAtom);

  return useQuery({
    queryKey: ['nav', loginUser?.userId],
    queryFn: async () => {
      if (!loginUser) throw new Error('Not logged in');
      const rawNav = await getNavById(loginUser.userId);
      return normalizeNav(rawNav);
    },
    enabled: !!loginUser?.userId, // ログインしている時のみフェッチ
  });
}

// カテゴリ一覧を取得するための派生フック
export function useCategories() {
  const { data, ...rest } = useNavQuery();
  const categoriesArray = useMemo(() => {
    if (!data) return [];
    return Array.from(data.categoriesByIdMap.values());
  }, [data]);

  return { categoriesArray, categoriesByIdMap: data?.categoriesByIdMap, ...rest };
}

// 特定のカテゴリのノート一覧を取得するための派生フック
export function useNotes(categoryId?: number | null) {
  const { data, ...rest } = useNavQuery();
  const notesArray = useMemo(() => {
    if (!data || categoryId == null) return [];
    return data.notesByCategoryIdMap.get(categoryId) ?? [];
  }, [data, categoryId]);

  return { notesArray, ...rest };
}
