// components/ui/LogoutButton.tsx
import { useNavigate } from 'react-router-dom';
import { useSetAtom } from 'jotai';
import { resetAllUserStateAtom } from '../states/UserAtom';
import { getOk } from '../helpers/CustomAxios';
// （任意）サーバにログアウト通知したい場合：import { postOk } from '../helpers/CustomAxios';

export default function LogoutButton() {
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
      className="w-full rounded-md bg-foreground px-3 py-2 text-sm font-medium text-background hover:opacity-90 disabled:opacity-60"
      onClick={handleLogout}
    >
      ログアウト
    </button>
  );
}
