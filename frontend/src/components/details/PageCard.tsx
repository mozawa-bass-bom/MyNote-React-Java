import { memo } from 'react';
import type { NoteDetailResponse } from '../../types/base';
import Editor from './Editor/Editor';

type PageItem = NoteDetailResponse['pageItems'][number];
type Props = {
  p: PageItem;
  imageWidthPct: number;
  onDividerMouseDown: (e: React.MouseEvent) => void;
};

const PageCard = memo(function PageCard({ p, imageWidthPct, onDividerMouseDown }: Props) {
  const editorWidthPct = 100 - imageWidthPct;

  return (
    <div className="overflow-hidden rounded-lg border border-border">
      {/* ヘッダー */}
      <div className="border-b border-border bg-muted p-2 text-sm font-medium">
        Page.{p.pageNumber}
      </div>

      {/* 本体: flex で画像 | ハンドル | エディター */}
      <div className="flex min-h-0" style={{ minHeight: '240px' }}>
        {/* 画像エリア: 幅100%を基本に、80vh超えたら縦スクロール */}
        <div
          className="flex-shrink-0 p-3 overflow-y-auto overflow-x-hidden scrollbar-page-image"
          style={{ width: `${imageWidthPct}%`, maxHeight: '80vh' }}
        >
          <img
            src={p.imageUrl}
            alt={`page ${p.pageNumber}`}
            className="rounded-md outline outline-2 outline-border w-full h-auto block"
            draggable={false}
          />
        </div>

        {/* ドラッグハンドル */}
        <div
          onMouseDown={onDividerMouseDown}
          className="flex-shrink-0 w-4 cursor-col-resize flex items-center justify-center select-none group"
          title="ドラッグして幅を調整"
        >
          {/* ドラッグドット */}
          <div className="flex flex-col gap-0.5">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="w-1 h-1 rounded-full bg-muted-foreground/40 group-hover:bg-primary transition-colors" />
            ))}
          </div>
        </div>

        {/* エディターエリア */}
        <div
          className="flex flex-col min-h-0 p-3"
          style={{ width: `${editorWidthPct}%` }}
        >
          <Editor pageId={p.id} markdown={p.extractedText?.trimEnd() ?? ' '} />
        </div>
      </div>
    </div>
  );
});

export default PageCard;
