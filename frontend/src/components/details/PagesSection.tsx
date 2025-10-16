import { memo } from 'react';
import type { NoteDetailResponse } from '../../types/base';
import PageCard from './PageCard';

type Props = { pages: NoteDetailResponse['pageItems'] };

const PagesSection = memo(function PagesSection({ pages }: Props) {
  if (pages.length === 0) return <div className="text-gray-500">— ページなし —</div>;
  return (
    <div className="space-y-4">
      {pages.map((p) => (
        <PageCard key={p.id} p={p} />
      ))}
    </div>
  );
});

export default PagesSection;
