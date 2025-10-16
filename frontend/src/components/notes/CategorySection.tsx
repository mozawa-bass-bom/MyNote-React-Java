import { memo } from 'react';
import type { Category, NoteSummary } from '../../types/base';
import { NoteRow } from './NoteRow';

type Props = {
  category: Category;
  notes: NoteSummary[];
  isOpen: boolean;
  onToggle: () => void;
};

export const CategorySection = memo(function CategorySection({ category, notes, isOpen, onToggle }: Props) {
  return (
    <>
      {/* ヘッダ */}
      <div className="flex items-center justify-between p-3 rounded bg-gray-200" onClick={onToggle}>
        <div className="flex items-center gap-2">
          <button className="w-6 h-6 border rounded text-xs" aria-label={isOpen ? '閉じる' : '開く'}>
            {isOpen ? '−' : '+'}
          </button>
          <div className="font-medium">
            {category.name}
            <span className="ml-2 text-xs text-gray-500">({category.noteCount ?? notes.length})</span>
          </div>
        </div>
      </div>

      {/* ノート一覧 */}
      {isOpen && (
        <div className="py-3">
          {notes.length === 0 ? (
            <div className="text-sm text-gray-500">— ノートなし —</div>
          ) : (
            <ul className="grid auto-rows-fr [grid-template-columns:repeat(auto-fit,minmax(260px,33%))]">
              {notes.map((n) => (
                <li key={n.id} className="rounded  p-3 h-full">
                  <NoteRow note={n} />
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </>
  );
});
