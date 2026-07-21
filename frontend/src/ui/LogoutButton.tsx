import { useNavigate } from 'react-router-dom';
import { useSetAtom } from 'jotai';
import { resetAllUserStateAtom } from '../states/UserAtom';
import { getOk } from '../helpers/CustomAxios';
import { LogOut } from 'lucide-react';

type Props = {
  isCollapsed?: boolean;
};

export default function LogoutButton({ isCollapsed = false }: Props) {
  const navigate = useNavigate();
  const resetAll = useSetAtom(resetAllUserStateAtom);

  const handleLogout = async () => {
    await getOk('auth/logout').catch(() => {});
    resetAll();

    navigate('/', { replace: true });
  };

  return (
    <button
      type="button"
      title={isCollapsed ? 'ログアウト' : undefined}
      className={`rounded-md bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-60 transition ${
        isCollapsed
          ? 'flex h-9 w-9 items-center justify-center p-0 mx-auto'
          : 'w-full px-3 py-2 text-sm font-medium flex items-center justify-center gap-2'
      }`}
      onClick={handleLogout}
    >
      <LogOut className="h-4 w-4 shrink-0" />
      {!isCollapsed && <span>ログアウト</span>}
    </button>
  );
}

