// src/layouts/user/UserLayout.tsx
import { Outlet } from 'react-router-dom';
import UserNavi from '../../components/header/UserNavi';

export default function UserLayout() {
  return (
    <div className="min-h-screen flex">
      {/* 左ナビ（固定幅 / スクロール可） */}
      <aside className="w-64 shrink-0 border-r bg-white">
        <UserNavi />
      </aside>

      {/* 右コンテンツ（広がる / スクロール） */}
      <main className="flex-1 min-w-0">
        <div className="max-w-5xl mx-auto p-4">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
