import { memo } from 'react';
import type { NoteDetailResponse } from '../../types/base';
import ReactMarkdown from 'react-markdown'; // 👈 これを追加

type Props = Pick<NoteDetailResponse, 'title' | 'description'>;

const NoteHeader = memo(function NoteHeader({ title, description }: Props) {
  return (
    <>
      <h1 className="mb-2 text-2xl font-semibold">{title}</h1>
      {/* text-gray-600 のところを text-gray-700 に変更し、<ReactMarkdown>を使用 */}
      {description && <ReactMarkdown>{description}</ReactMarkdown>}
    </>
  );
});

export default NoteHeader;
