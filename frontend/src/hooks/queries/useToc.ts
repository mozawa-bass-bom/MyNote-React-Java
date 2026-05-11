import { useQuery } from '@tanstack/react-query';
import { getTocMap } from '../../helpers/TocService';
import { normalizeTocMap } from '../../helpers/normalizeToc';
import { useAtomValue } from 'jotai';
import { loginUserAtom } from '../../states/UserAtom';

export function useTocQuery() {
  const loginUser = useAtomValue(loginUserAtom);

  return useQuery({
    queryKey: ['toc'],
    queryFn: async () => {
      const raw = await getTocMap();
      return normalizeTocMap(raw);
    },
    enabled: !!loginUser?.userId, // ログインしている時のみフェッチ
  });
}

export function useTocForNote(noteId?: number | null) {
  const { data: tocByNoteIdMap, ...rest } = useTocQuery();

  const tocItems = noteId != null && tocByNoteIdMap ? tocByNoteIdMap.get(noteId) ?? [] : [];

  return { tocItems, ...rest };
}
