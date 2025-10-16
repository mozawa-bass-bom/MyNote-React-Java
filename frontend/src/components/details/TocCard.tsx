import { memo } from 'react';
import type { NoteDetailResponse } from '../../types/base';

type Props = { items: NoteDetailResponse['tocItems'] };

const TocCard = memo(function TocCard({ items }: Props) {
  return (
    <div className="rounded-lg border border-gray-200 p-3 md:col-span-2">
      <h2 className="mt-0 text-base font-semibold">目次</h2>
      {items.length === 0 ? (
        <div className="text-gray-500">— 目次なし —</div>
      ) : (
        <ul className="m-0 space-y-2 pl-5 leading-7">
          {items.map((t) => (
            <li key={t.id}>
              <p className="m-0">
                {t.indexNumber}. {t.title}（{t.startPage}–{t.endPage}）
              </p>
              {t.body && <p className="m-0 indent-3">{t.body}</p>}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
});

export default TocCard;
