import { Link } from 'react-router-dom';
import CategoriesPage from './Categories';

export default function UserNavi() {
  return (
    <div>
      <Link to="upload" className="">
        アップロード
      </Link>
      <div className="h-screen overflow-y-auto p-3">
        <CategoriesPage />
      </div>
      <Link to="setting">設定</Link>
    </div>
  );
}
