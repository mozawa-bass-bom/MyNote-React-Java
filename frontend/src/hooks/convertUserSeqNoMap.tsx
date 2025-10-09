import { useAtom } from 'jotai';
import { useParams } from 'react-router-dom';
import { notesByCategoryIdAtom } from '../states/UserAtom';

export default function convertUserSeqNoMap() {
  const params = useParams();
  const id = params.id;
  const { noteDetailsMap, setNoteDetailsMap } = useAtom(notesByCategoryIdAtom);
  return <div>convertUserSeqNoMap</div>;
}
