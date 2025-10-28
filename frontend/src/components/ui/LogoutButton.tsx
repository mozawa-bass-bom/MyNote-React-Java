// components/ui/LogoutButton.tsx
import { useNavigate } from 'react-router-dom';
import { useSetAtom } from 'jotai';
import { resetAllUserStateAtom } from '../../states/UserAtom';
import { getOk } from '../../helpers/CustomAxios';
// （任意）サーバにログアウト通知したい場合：import { postOk } from '../../helpers/CustomAxios';

export default function LogoutButton() {
  const navigate = useNavigate();
  const resetAll = useSetAtom(resetAllUserStateAtom);

  const handleLogout = async () => {
    await getOk('auth/logout').catch(() => {});
    resetAll();

    // 必要なら他の外部状態もここでクリア（例：Service Worker キャッシュ等）
    // await caches.delete('note-pages-v1');

    navigate('/', { replace: true });
  };

  return (
    <button
      type="button"
      className="w-full rounded-md bg-gray-900 px-3 py-2 text-sm font-medium text-white hover:opacity-90 disabled:opacity-60"
      onClick={handleLogout}
    >
      ログアウト
    </button>
  );
}
