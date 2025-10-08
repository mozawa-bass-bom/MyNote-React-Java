import { useAtom } from 'jotai';
import { useEffect } from 'react';
import { Navigate, useParams } from 'react-router-dom';
import { notesByCategoryIdAtom } from '../../states/UserAtom';

export default function NoteDetails() {
  const params = useParams<{ userSeqNo: string }>();
  const { noteDetailsMap, setNoteDetailsMap } = useAtom(notesByCategoryIdAtom);

  const noteDetails = useMemo(() => {
    const arr = Array.from(noteDetailsMap.values());
    arr.sort((a, b) => a.id - b.id);
    return arr;
  }, [categoriesMap]);

  useEffect(() => {}, []);
  if (!params.userSeqNo) {
    return <Navigate to="/notes" replace />;
  }

  const regex = /^\d+$/;
  if (!regex.test(params.userSeqNo)) {
    return <Navigate to="/notes" replace />;
  }

  return (
    <div>
      <h1>ノート詳細ページ</h1>
      <ul>
        <li>{params.userSeqNo}でアクセス</li>
        <li></li>
      </ul>
    </div>
  );
}
