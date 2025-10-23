import { Link } from 'react-router-dom';
import { useAtomValue } from 'jotai';
import { selectAtom } from 'jotai/utils';
import { notesByCategoryIdAtom } from '../../states/UserAtom';
import { useMemo } from 'react';

export default function CategoryItem({ categoryId, isOpen }: { categoryId: number; isOpen: boolean }) {
  const notesAtom = useMemo(
    () =>
      selectAtom(
        notesByCategoryIdAtom,
        (m) => m.get(categoryId) ?? [],
        (a, b) => a === b
      ),
    [categoryId]
  );
  const notes = useAtomValue(notesAtom);
  if (isOpen) {
    if (notes.length === 0)
      return (
        <ul className="mt-1 pl-3 border-l">
          <li>ノート未登録</li>
        </ul>
      );

    return (
      <ul className="mt-1 pl-3 border-l">
        {notes.map((n) => (
          <li key={n.id} className="py-0.5">
            <Link to={`/notes/${n.userSeqNo}`} className="hover:underline">
              {n.title}
            </Link>
          </li>
        ))}
      </ul>
    );
  } else {
    return null;
  }
}
