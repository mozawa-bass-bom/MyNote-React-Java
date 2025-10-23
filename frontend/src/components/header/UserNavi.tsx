import { NavLink } from 'react-router-dom';
import CategoriesPage from './Categories';
import LogoutButton from '../ui/LogoutButton';

export default function UserNavi() {
  return (
    <aside className="fixed left-0 top-0 z-40 h-screen w-64 border-r border-gray-200 bg-white/90 backdrop-blur-sm">
      {/* 全体を縦レイアウト */}
      <div className="flex h-full flex-col">
        {/* ヘッダー */}
        <div className="flex items-center justify-between px-4 py-3">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-xl bg-gray-900" />
            <span className="text-sm font-semibold tracking-wide">MyNote</span>
          </div>
        </div>

        {/* メインナビ */}
        <nav className="px-3">
          <ul className="space-y-1">
            <li>
              <NavItem to="/notes/upload" label="アップロード" />
            </li>
            <li>
              <NavItem to="/notes" label="ノート一覧" />
            </li>
            <li>
              <NavItem to="/notes/setting" label="設定" />
            </li>
          </ul>
        </nav>

        {/* 区切り */}
        <div className="my-3 mx-3 border-t border-gray-200" />

        {/* カテゴリ（スクロール領域） */}
        <div className="px-3 pb-3">
          <h2 className="px-2 pb-2 text-xs font-semibold uppercase tracking-wider text-gray-500">カテゴリ</h2>
        </div>
        <div className="mx-3 mb-3 flex-1 overflow-y-auto rounded-lg ">
          <CategoriesPage />
        </div>

        {/* フッター（下に固定させるために mt-auto） */}
        <div className="mt-auto border-t border-gray-200 px-3 py-3">
          <LogoutButton />
        </div>
      </div>
    </aside>
  );
}

/** NavLink 用の小コンポーネント：アクティブ時の強調・ホバー演出 */
function NavItem({ to, label }: { to: string; label: string }) {
  return (
    <NavLink
      to={to}
      className={({ isActive }) =>
        [
          'group flex items-center gap-2 rounded-lg px-3 py-2 text-sm transition',
          isActive ? 'bg-gray-900 text-white shadow-sm' : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900',
        ].join(' ')
      }
      end
    >
      {/* アイコンのプレースホルダー（必要なければ削除OK） */}
      <span className="h-2 w-2 rounded-full bg-current/50 group-hover:bg-current/70" />
      <span>{label}</span>
    </NavLink>
  );
}
