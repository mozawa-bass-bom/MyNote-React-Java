import { useEffect, useMemo, useState } from 'react';
import { Navigate, useParams } from 'react-router-dom';
import { useSetAtom } from 'jotai';
import { selectedNoteIdAtom, selectedCategoryIdAtom } from '../../states/UserAtom';
import { type NoteDetailResponse, type ApiNoteDetailData, toNoteDetailResponse } from '../../types/base';
import { getOk, isCanceledError, toAxiosError } from '../../helpers/CustomAxios';

import MetaCard from '../../components/details/MetaCard';
import NoteHeader from '../../components/details/NoteHeader';
import TocCard from '../../components/details/TocCard';
import PagesSection from '../../components/details/PagesSection';

async function getNoteDetailsBySeq(userSeqNo: number, signal?: AbortSignal) {
  return await getOk<ApiNoteDetailData>(`/notes/${userSeqNo}`, { signal });
}

export default function NoteDetails() {
  const { userSeqNo } = useParams<{ userSeqNo: string }>();
  const seq = userSeqNo ? Number(userSeqNo) : NaN;
  const isValid = useMemo(() => Number.isInteger(seq) && seq > 0, [seq]);

  const [detail, setDetail] = useState<NoteDetailResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const setSelectedNoteId = useSetAtom(selectedNoteIdAtom);
  const setSelectedCategoryId = useSetAtom(selectedCategoryIdAtom);

  useEffect(() => {
    if (!isValid) return;
    const ac = new AbortController();

    (async () => {
      try {
        setLoading(true);
        setError(null);
        const api = await getNoteDetailsBySeq(seq, ac.signal);
        const d = toNoteDetailResponse(api);
        setDetail(d);
        setSelectedNoteId(d.id);
        setSelectedCategoryId(d.categoryId);
      } catch (e: unknown) {
        if (isCanceledError(e)) return;
        const ax = toAxiosError(e);
        if (ax) {
          const status = ax.response?.status ?? 'no-status';
          const msg = ax.response?.data?.message ?? ax.message ?? 'unknown error';
          console.error('fetch note by userSeqNo failed:', status, msg, ax);
          setError(`読み込みに失敗しました（${status}）。${msg}`);
        } else {
          const msg = e instanceof Error ? e.message : String(e);
          console.error('unknown error:', e);
          setError(`読み込みに失敗しました。${msg}`);
        }
      } finally {
        setLoading(false);
      }
    })();

    return () => ac.abort();
  }, [isValid, seq, setSelectedNoteId, setSelectedCategoryId]);

  if (!isValid) return <Navigate to="/notes" replace />;
  if (loading) return <div className="p-4">Loading…</div>;
  if (error) return <div className="p-4 text-red-600">{error}</div>;
  if (!detail) return null;

  return (
    <div className="mx-auto px-4 py-4 font-sans">
      <NoteHeader
        title={detail.title}
        userSeqNo={detail.userSeqNo}
        id={detail.id}
        categoryId={detail.categoryId}
        description={detail.description}
      />

      <div className="mt-4 grid gap-4 md:grid-cols-3">
        <TocCard noteId={detail.id} items={detail.tocItems} />
        <MetaCard detail={detail} />
      </div>

      <div className="mt-8">
        <PagesSection pages={detail.pageItems} />
      </div>
    </div>
  );
}
