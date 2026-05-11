import { memo } from 'react';
import type { NoteSummary } from '../../types/base';
import { useTocForNote } from '../../hooks/queries/useToc';
import DeleteNoteButton from '../../ui/DeleteNoteButton';
import { NoteTitle } from './NoteTitle';

function fmtDate(d?: string) {
  if (!d) return '';
  const dt = new Date(d);
  if (Number.isNaN(dt.getTime())) return d;
  return dt.toISOString().slice(0, 10);
}

type Props = { note: NoteSummary };

export const NoteRow = memo(function NoteRow({ note }: Props) {
  const { tocItems: toc } = useTocForNote(note.id);

  return (
    <article
      className={[
        'rounded-xl border border-border bg-background/70 p-4 shadow-sm',
        'transition-shadow hover:shadow-md h-full',
        'flex flex-col min-h-0',
      ].join(' ')}
    >
      {/* ヘッダー行 */}
      <header className="flex items-center gap-3 justify-between">
        <NoteTitle title={note.title} categoryId={note.categoryId} userSeqNo={note.userSeqNo} />

        {/* 作成日バッジ */}
        <span className="shrink-0 rounded-md bg-foreground/5 px-2 py-0.5 text-xs text-muted-foreground">
          作成: {fmtDate(note.createdAt)}
        </span>
      </header>

      {/* 目次 */}
      <section className="mt-3 border-t border-border py-3 ">
        {toc.length === 0 ? (
          <div className="text-sm text-muted-foreground">— 目次なし —</div>
        ) : (
          <ul className="list-decimal space-y-1 pl-5 text-sm list-none">
            {toc.map((t) => (
              <li key={t.id} className="text-foreground">
                <span className="font-medium">
                  {t.indexNumber}. {t.title}
                </span>
                <span className="ml-1 text-muted-foreground">
                  （{t.startPage}–{t.endPage}）
                </span>
              </li>
            ))}
          </ul>
        )}
      </section>
      <div className="flex justify-end mt-auto">
        <DeleteNoteButton noteId={note.id} userSeqNo={note.userSeqNo} />
      </div>
    </article>
  );
});
