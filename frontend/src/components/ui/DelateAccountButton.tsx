// src/components/account/DeleteAccountButton.tsx
import { useCallback } from 'react';
import { useSetAtom } from 'jotai';
import { resetAllUserStateAtom } from '../../states/UserAtom';
import customAxios from '../../helpers/CustomAxios';
import { useNavigate } from 'react-router-dom';

export default function DeleteAccountButton() {
  const navigate = useNavigate();
  const resetAllUserState = useSetAtom(resetAllUserStateAtom);

  const handleDeleteUser = useCallback(async () => {
    if (!confirm('本当にアカウントを削除しますか？この操作は元に戻せません。')) return;
    await customAxios.delete('/auth/deleteUser');
    resetAllUserState();
    localStorage.removeItem('loginUser');
    navigate('/', { replace: true });
  }, [navigate, resetAllUserState]);

  return (
    <button className="btn btn-danger" onClick={handleDeleteUser}>
      アカウント削除
    </button>
  );
}
