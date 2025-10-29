import { memo } from 'react';
import type { NoteDetailResponse } from '../../types/base';
import { useAtomValue } from 'jotai';
import { categoriesByIdAtom } from '../../states/UserAtom';

type Props = { detail: NoteDetailResponse };
const MetaCard = memo(function MetaCard({ detail }: Props) {
  const categoriesById = useAtomValue(categoriesByIdAtom);
  const { originalFilename, userSeqNo, categoryId, createdAt, updatedAt } = detail;
  return (
    <div className="rounded-lg border border-gray-200 p-3">
      <h2 className="mt-0 text-base font-semibold">ノート情報</h2>
      <ul className="m-0 list-disc space-y-1 pl-5 leading-7">
        <li>元ファイル: {originalFilename}</li>
        <li>Note No: {userSeqNo}</li>
        <li>Category: {categoriesById.get(categoryId)?.name}</li>
        <li>作成: {createdAt}</li>
        <li>更新: {updatedAt}</li>
      </ul>
    </div>
  );
});

export default MetaCard;
