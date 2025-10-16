import { memo } from 'react';
import type { NoteDetailResponse } from '../../types/base';

type Props = Pick<NoteDetailResponse, 'title' | 'description'>;

const NoteHeader = memo(function NoteHeader({ title, description }: Props) {
  return (
    <>
      <h1 className="mb-2 text-2xl font-semibold">{title}</h1>
      {description && <p className="text-gray-600">{description}</p>}
    </>
  );
});

export default NoteHeader;
