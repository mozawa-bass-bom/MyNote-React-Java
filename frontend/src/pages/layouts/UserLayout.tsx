// src/layouts/user/UserLayout.tsx
import { Outlet, Navigate, useLocation } from 'react-router-dom';
import UserNavi from '../../components/header/UserNavi';
import { useAtomValue } from 'jotai';
import { loginUserAtom } from '../../states/UserAtom';

export default function UserLayout() {
  const loginUser = useAtomValue(loginUserAtom);
  const location = useLocation();

  if (!loginUser) {
    return <Navigate to="/" state={{ from: location }} replace />;
  }

  return (
    <div className="min-h-screen flex">
      {/* 左ナビ（固定幅 / スクロール可） */}
      <aside className="w-64 shrink-0 border-r bg-background">
        <UserNavi />
      </aside>

      {/* 右コンテンツ（広がる / スクロール） */}
      <main className="flex-1 min-w-0">
        <div className="mx-auto p-4">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
