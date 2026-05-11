import { useQuery } from '@tanstack/react-query';
import { getOk } from '../../helpers/CustomAxios';
import { type ApiNoteDetailData, toNoteDetailResponse } from '../../types/base';
import { useAtomValue } from 'jotai';
import { loginUserAtom } from '../../states/UserAtom';

async function fetchNoteDetail(userSeqNo: number, signal?: AbortSignal) {
  const apiData = await getOk<ApiNoteDetailData>(`/notes/${userSeqNo}`, { signal });
  return toNoteDetailResponse(apiData);
}

export function useNoteDetailQuery(userSeqNo?: number) {
  const loginUser = useAtomValue(loginUserAtom);
  const isValidSeq = typeof userSeqNo === 'number' && !Number.isNaN(userSeqNo) && userSeqNo > 0;

  return useQuery({
    queryKey: ['noteDetail', userSeqNo],
    queryFn: ({ signal }) => {
      if (!isValidSeq) throw new Error('Invalid userSeqNo');
      return fetchNoteDetail(userSeqNo, signal);
    },
    enabled: isValidSeq && !!loginUser?.userId, // ログイン状態でかつ有効なIDの時のみフェッチ
  });
}
