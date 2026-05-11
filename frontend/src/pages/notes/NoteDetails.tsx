import { useEffect, useMemo } from 'react';
import { Navigate, useParams } from 'react-router-dom';
import { useSetAtom } from 'jotai';
import { selectedNoteIdAtom, selectedCategoryIdAtom } from '../../states/UserAtom';
import { useNoteDetailQuery } from '../../hooks/queries/useNoteDetail';

import MetaCard from '../../components/details/MetaCard';
import NoteHeader from '../../components/details/NoteHeader';
import TocCard from '../../components/details/TocCard';
import PagesSection from '../../components/details/PagesSection';

export default function NoteDetails() {
  const { userSeqNo } = useParams<{ userSeqNo: string }>();
  const seq = userSeqNo ? Number(userSeqNo) : NaN;
  const isValid = useMemo(() => Number.isInteger(seq) && seq > 0, [seq]);

  const { data: detail, isPending: loading, isError, error } = useNoteDetailQuery(isValid ? seq : undefined);

  const setSelectedNoteId = useSetAtom(selectedNoteIdAtom);
  const setSelectedCategoryId = useSetAtom(selectedCategoryIdAtom);

  useEffect(() => {
    if (detail) {
      setSelectedNoteId(detail.id);
      setSelectedCategoryId(detail.categoryId);
    }
  }, [detail, setSelectedNoteId, setSelectedCategoryId]);

  if (!isValid) return <Navigate to="/notes" replace />;
  if (loading) return <div className="p-4">Loading…</div>;
  if (isError) return <div className="p-4 text-destructive">読み込みに失敗しました。{error?.message}</div>;
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
