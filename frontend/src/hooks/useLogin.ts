// hooks/useLogin.ts
import { useState, useEffect } from 'react';
import customAxios from '../helpers/CustomAxios';
import { useSetAtom } from 'jotai';
import { loginUserAtom } from '../states/UserAtom';
import type { LoginUser, RawLoginResponse } from '../types/loginUser';
import { normalizeLoginResponse } from '../helpers/normalizeLogin';

async function sendConfidential(loginId: string, loginPass: string) {
  const res = await customAxios.post('/auth/login', { loginId, loginPass });
  return res.data as RawLoginResponse;
}

export default function useLogin() {
  const [isPending, setIsPending] = useState(false);
  const [isError, setIsError] = useState(false);
  const setLoginUser = useSetAtom(loginUserAtom);

  // 起動時に復元（F5でも維持）
  useEffect(() => {
    const saved = localStorage.getItem('loginUser');
    if (saved) {
      const user: LoginUser = JSON.parse(saved);
      setLoginUser(user);
      // AuthorizationヘッダはinterceptorがlocalStorageから読むので何もしなくてOK
    }
  }, [setLoginUser]);

  const login = async (loginId: string, loginPass: string) => {
    setIsPending(true);
    setIsError(false);
    try {
      const raw = await sendConfidential(loginId, loginPass);
      const user = normalizeLoginResponse(raw);

      // 永続化（開発はlocalStorageでOK。本番はHttpOnly Cookie推奨）
      localStorage.setItem('authToken', user.token);
      localStorage.setItem('loginUser', JSON.stringify(user));

      setLoginUser(user);
    } catch (e) {
      console.error(e);
      setIsError(true);
    } finally {
      setIsPending(false);
    }
  };

  return { login, isPending, isError };
}
