import { memo } from 'react';
import type { NoteDetailResponse } from '../../types/base';
import NoteTitleEditor from './Editor/NoteTitleEditor';
import NoteDiscriptionEditor from './Editor/NoteDiscriptionEditor';

type Props = Pick<NoteDetailResponse, 'title' | 'description' | 'userSeqNo' | 'id' | 'categoryId'>;

const NoteHeader = memo(function NoteHeader({ title, description, userSeqNo, id, categoryId }: Props) {
  return (
    <>
      <h1 className="mb-4 text-2xl font-semibold">
        <NoteTitleEditor categoryId={categoryId} noteId={id} userSeqNo={userSeqNo} initialTitle={title} />
      </h1>
      <div className="rounded-lg border border-gray-200 p-3">
        <p className="mt-0 text-base font-semibold">概要</p>
        <div className="m-0 space-y-2 pl-5 leading-7">
          <NoteDiscriptionEditor userSeqNo={userSeqNo} initialDiscription={description} />
        </div>
      </div>
    </>
  );
});

export default NoteHeader;
