import { useState, useMemo } from 'react';
import { Outlet, Navigate, useLocation } from 'react-router-dom';
import UserNavi from '../../components/header/UserNavi';
import { useAtomValue } from 'jotai';
import { loginUserAtom } from '../../states/UserAtom';
import type { LoginUser } from '../../types/loginUser';

export default function UserLayout() {
  const loginUser = useAtomValue(loginUserAtom);
  const location = useLocation();

  // サイドバーの最小化状態（localStorageに状態を保存）
  const [isCollapsed, setIsCollapsed] = useState(() => {
    return localStorage.getItem('sidebar_collapsed') === 'true';
  });

  const toggleSidebar = () => {
    setIsCollapsed((prev) => {
      const next = !prev;
      localStorage.setItem('sidebar_collapsed', String(next));
      return next;
    });
  };

  const storedUser = useMemo(() => {
    if (loginUser) return loginUser;
    try {
      const item = localStorage.getItem('loginUser');
      return item ? (JSON.parse(item) as LoginUser) : null;
    } catch {
      return null;
    }
  }, [loginUser]);

  if (!storedUser) {
    return <Navigate to="/" state={{ from: location }} replace />;
  }

  return (
    <div className="min-h-screen flex">
      {/* 左ナビ（幅 w-16 / w-64 をアニメーション付きで切り替え） */}
      <aside
        className={`shrink-0 transition-all duration-300 ${
          isCollapsed ? 'w-16' : 'w-64'
        }`}
      >
        <UserNavi isCollapsed={isCollapsed} onToggle={toggleSidebar} />
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

