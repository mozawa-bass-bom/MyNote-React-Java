import { Link } from 'react-router-dom';
import { useNotes } from '../../hooks/queries/useNav';

export default function CategoryItem({ categoryId, isOpen }: { categoryId: number; isOpen: boolean }) {
  const { notesArray: notes } = useNotes(categoryId);

  if (!isOpen) return null;

  if (notes.length === 0) {
    return (
      <ul className="mt-1 pl-3 border-l">
        <li>ノート未登録</li>
      </ul>
    );
  }

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
}
