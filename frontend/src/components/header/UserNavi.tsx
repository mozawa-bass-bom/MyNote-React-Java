import { NavLink } from "react-router-dom";
import Categories from "./Categories";
import LogoutButton from "../../ui/LogoutButton";
import { useAtomValue } from "jotai";
import { loginUserAtom } from "../../states/UserAtom";
import {
  PanelLeftClose,
  PanelLeftOpen,
  Upload,
  BookOpen,
  Settings,
  Folder,
} from "lucide-react";

type UserNaviProps = {
  isCollapsed: boolean;
  onToggle: () => void;
};

export default function UserNavi({ isCollapsed, onToggle }: UserNaviProps) {
  const loginUser = useAtomValue(loginUserAtom);

  return (
    <aside
      className={`fixed left-0 top-0 z-40 h-screen border-r border-border bg-background/90 backdrop-blur-sm transition-all duration-300 ${
        isCollapsed ? "w-16" : "w-64"
      }`}
    >
      {/* 全体を縦レイアウト */}
      <div className="flex h-full flex-col">
        {/* ヘッダー */}
        <div className="flex items-center justify-between px-3 py-3">
          {!isCollapsed ? (
            <div className="flex items-center gap-2 overflow-hidden">
              <div className="flex flex-col truncate">
                <span className="text-2xl font-semibold tracking-wide mb-1">
                  MyNote
                </span>
                {loginUser?.userName && (
                  <span className="text-xs text-muted-foreground truncate">
                    ID:{loginUser.userName}
                  </span>
                )}
              </div>
            </div>
          ) : (
            <> </>
          )}

          {/* 最小化 / 展開 トグルボタン */}
          <button
            type="button"
            onClick={onToggle}
            className="rounded-lg p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground transition ml-auto"
            title={isCollapsed ? "メニューを展開" : "メニューを折りたたむ"}
            aria-label={isCollapsed ? "メニューを展開" : "メニューを折りたたむ"}
          >
            {isCollapsed ? (
              <PanelLeftOpen className="h-5 w-5" />
            ) : (
              <PanelLeftClose className="h-5 w-5" />
            )}
          </button>
        </div>

        {/* 区切り */}
        <div className="my-2 mx-3 border-t border-border" />

        {/* メインナビ */}
        <nav className="px-2">
          <ul className="space-y-1">
            <li>
              <NavItem
                to="/notes/upload"
                label="アップロード"
                icon={<Upload className="h-4 w-4 shrink-0" />}
                isCollapsed={isCollapsed}
              />
            </li>
            <li>
              <NavItem
                to="/notes"
                label="ノート一覧"
                icon={<BookOpen className="h-4 w-4 shrink-0" />}
                isCollapsed={isCollapsed}
              />
            </li>
            <li>
              <NavItem
                to="/notes/setting"
                label="設定"
                icon={<Settings className="h-4 w-4 shrink-0" />}
                isCollapsed={isCollapsed}
              />
            </li>
          </ul>
        </nav>

        {/* 区切り */}
        <div className="my-3 mx-3 border-t border-border" />

        {/* カテゴリ（スクロール領域） */}
        {!isCollapsed ? (
          <>
            <div className="px-3 pb-2">
              <h2 className="px-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                カテゴリ
              </h2>
            </div>
            <div className="mx-2 mb-3 flex-1 overflow-y-auto rounded-lg">
              <Categories />
            </div>
          </>
        ) : (
          <div className="flex flex-col items-center py-2" title="カテゴリ">
            <Folder className="h-5 w-5 text-muted-foreground" />
          </div>
        )}

        {/* フッター（下に固定） */}
        <div className="mt-auto border-t border-border px-2 py-3">
          <LogoutButton isCollapsed={isCollapsed} />
        </div>
      </div>
    </aside>
  );
}

/** NavLink 用の小コンポーネント */
function NavItem({
  to,
  label,
  icon,
  isCollapsed,
}: {
  to: string;
  label: string;
  icon: React.ReactNode;
  isCollapsed: boolean;
}) {
  return (
    <NavLink
      to={to}
      title={isCollapsed ? label : undefined}
      className={({ isActive }) =>
        [
          "group flex items-center gap-3 rounded-lg py-2 transition",
          isCollapsed ? "justify-center px-2" : "px-3",
          isActive
            ? "bg-primary text-primary-foreground shadow-sm"
            : "text-foreground hover:bg-muted hover:text-foreground",
        ].join(" ")
      }
      end
    >
      {icon}
      {!isCollapsed && <span className="text-sm truncate">{label}</span>}
    </NavLink>
  );
}
