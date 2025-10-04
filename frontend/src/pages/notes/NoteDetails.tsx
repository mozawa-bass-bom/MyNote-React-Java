import { Navigate, useParams } from "react-router-dom";

export default function NoteDetails() {
  const params = useParams<{ userSeqNo: string }>();

  if (!params.userSeqNo) {
    return <Navigate to="/notes" replace />;
  }

  const regex = /^\d+$/;
  if (!regex.test(params.userSeqNo)) {
    return <Navigate to="/notes" replace />;
  }

  return (
    <div>
      <h1>ノート詳細ページ</h1>
      <ul>
        <li>{params.userSeqNo}でアクセス</li>
        <li></li>
      </ul>
    </div>
  );
}
