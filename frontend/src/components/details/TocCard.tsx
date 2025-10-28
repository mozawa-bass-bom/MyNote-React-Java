import { memo } from 'react';
import type { NoteDetailResponse } from '../../types/base';
import TocTitleEditor from './Editor/TocTitleEditor';
import TocBodyEditor from './Editor/TocBodyEditor';

type Props = {
  noteId: number;
  items: NoteDetailResponse['tocItems'];
};

const TocCard = memo(function TocCard({ items, noteId }: Props) {
  return (
    <div className="rounded-lg border border-gray-200 p-3 md:col-span-2">
      <h2 className="mt-0 text-base font-semibold">目次</h2>
      {items.length === 0 ? (
        <div className="text-gray-500">— 目次なし —</div>
      ) : (
        <ul className="m-0 space-y-2 pl-5 leading-7">
          {items.map((t) => (
            <li key={t.id}>
              <div className="m-0 flex items-center">
                {t.indexNumber}. <TocTitleEditor noteId={noteId} tocId={t.id} initialTitle={t.title} />（{t.startPage}–
                {t.endPage}）
              </div>
              {t.body && (
                <div className="m-0 indent-3">
                  <TocBodyEditor tocId={t.id} initialBody={t.body} />
                </div>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
});

export default TocCard;
