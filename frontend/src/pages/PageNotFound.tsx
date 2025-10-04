import { Link } from "react-router-dom";

export default function PageNotFound() {
  return (
    <div>
      <h1>ページが見つかりません</h1>
      <Link to="/" replace className="btn btn-primary">
        ホームに戻る
      </Link>
    </div>
  );
}
