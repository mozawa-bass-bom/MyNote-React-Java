import { memo } from 'react';
import type { NoteDetailResponse } from '../../types/base';
import Editor from './Editor';

type PageItem = NoteDetailResponse['pageItems'][number];
type Props = { p: PageItem };

const PageCard = memo(function PageCard({ p }: Props) {
  return (
    <div className="overflow-hidden rounded-lg border border-gray-200">
      <div className="border-b border-gray-200 bg-gray-100 p-2">Page.{p.pageNumber}</div>
      <div className="grid gap-4 p-4 md:grid-cols-2 items-stretch">
        <img
          src={p.imageUrl}
          alt={`page ${p.pageNumber}`}
          className="h-auto w-full rounded-md outline outline-2 outline-gray-200"
        />

        <div className="h-full flex flex-col min-h-0">
          <Editor pageId={p.id} markdown={p.extractedText ?? ' '} />
        </div>
      </div>
    </div>
  );
});

export default PageCard;
