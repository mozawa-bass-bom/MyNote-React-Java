import { memo, useMemo } from 'react';
import { useAtomValue } from 'jotai';
import type { NoteSummary } from '../../types/base';
import { tocByNoteIdAtom } from '../../states/UserAtom';
import { Link } from 'react-router-dom';

function fmtDate(d?: string) {
  if (!d) return '';
  const dt = new Date(d);
  if (Number.isNaN(dt.getTime())) return d;
  return dt.toISOString().slice(0, 10);
}

type Props = { note: NoteSummary };

export const NoteRow = memo(function NoteRow({ note }: Props) {
  const tocByNoteId = useAtomValue(tocByNoteIdAtom);
  const toc = useMemo(() => tocByNoteId.get(note.id) ?? [], [tocByNoteId, note.id]);

  return (
    <article
      className={[
        'rounded-xl border border-gray-200 bg-white/70 p-4 shadow-sm',
        'transition-shadow hover:shadow-md h-full',
      ].join(' ')}
    >
      {/* ヘッダー行 */}
      <header className="flex items-center gap-3">
        <h3 className="min-w-0 flex-1 text-base font-semibold leading-snug">
          <Link to={`/notes/${note.userSeqNo}`} className="block truncate hover:underline" title={note.title}>
            {note.title}
          </Link>
        </h3>

        {/* 作成日バッジ */}
        <span className="shrink-0 rounded-md bg-black/5 px-2 py-0.5 text-xs text-gray-600">
          作成: {fmtDate(note.createdAt)}
        </span>
      </header>

      {/* 目次 */}
      <section className="mt-3 border-t border-gray-100 pt-3 ">
        {toc.length === 0 ? (
          <div className="text-sm text-gray-500">— 目次なし —</div>
        ) : (
          <ul className="list-decimal space-y-1 pl-5 text-sm list-none">
            {toc.map((t) => (
              <li key={t.id} className="text-gray-800">
                <span className="font-medium">
                  {t.indexNumber}. {t.title}
                </span>
                <span className="ml-1 text-gray-500">
                  （{t.startPage}–{t.endPage}）
                </span>
              </li>
            ))}
          </ul>
        )}
      </section>
    </article>
  );
});
