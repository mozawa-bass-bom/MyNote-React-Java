import { memo, useState, useCallback, useRef } from 'react';
import type { NoteDetailResponse } from '../../types/base';
import PageCard from './PageCard';

type Props = { pages: NoteDetailResponse['pageItems'] };

const PagesSection = memo(function PagesSection({ pages }: Props) {
  // 画像幅の割合（%）— 全 PageCard で共有
  const [imageWidthPct, setImageWidthPct] = useState(50);
  const containerRef = useRef<HTMLDivElement>(null);

  // マウスダウン時にドラッグ開始
  const handleDividerMouseDown = useCallback((e: React.MouseEvent) => {
    e.preventDefault();

    const containerEl = containerRef.current;
    if (!containerEl) return;

    const onMouseMove = (ev: MouseEvent) => {
      const rect = containerEl.getBoundingClientRect();
      const pct = ((ev.clientX - rect.left) / rect.width) * 100;
      setImageWidthPct(Math.round(Math.min(80, Math.max(20, pct))));
    };

    const onMouseUp = () => {
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
    };

    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
  }, []);

  if (pages.length === 0) return <div className="text-muted-foreground">— ページなし —</div>;
  return (
    <div ref={containerRef} className="space-y-4">
      {pages.map((p) => (
        <PageCard
          key={p.id}
          p={p}
          imageWidthPct={imageWidthPct}
          onDividerMouseDown={handleDividerMouseDown}
        />
      ))}
    </div>
  );
});

export default PagesSection;
