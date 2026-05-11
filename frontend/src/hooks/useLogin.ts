// hooks/useLogin.ts
import { useState, useRef } from 'react';
import customAxios from '../helpers/CustomAxios';
import { useSetAtom } from 'jotai';
import { loginUserAtom, roleAtom } from '../states/UserAtom';
import type { RawLoginResponse } from '../types/loginUser';
import { useNavigate } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';

async function apiLogin(userName: string, password: string) {
  const { data } = await customAxios.post<RawLoginResponse>('/auth/login', { userName, password });
  return data;
}

export default function useLogin() {
  const navigate = useNavigate();
  const [isPending, setIsPending] = useState(false);
  const [isError, setIsError] = useState(false);
  const runningRef = useRef(false);

  const setRole = useSetAtom(roleAtom);
  const setLoginUser = useSetAtom(loginUserAtom);
  const queryClient = useQueryClient();

  const resetAll = () => {
    setLoginUser(null);
    setRole('USER');
    queryClient.clear(); // 全キャッシュクリア
  };

  const login = async (loginId: string, loginPass: string): Promise<boolean> => {
    if (runningRef.current) return false;
    runningRef.current = true;
    setIsPending(true);
    setIsError(false);

    try {
      const raw = await apiLogin(loginId, loginPass);
      // loginUser, role だけ Jotai(LocalStorage含む)にセット
      setRole(raw.role);
      setLoginUser({
        userId: Number(raw.userId),
        userName: raw.userName,
        token: raw.token,
      });

      // 注: categoriesByIdMap などは useNavQuery 等が自動的に取得してくれるため
      // 前回のJotai状態(`categoriesByIdAtom`等へのセット)は不要になります。
      // もし初回表示速度を上げるため prefetch するなら以下のようにする手もあります。
      /*
      await queryClient.prefetchQuery({
        queryKey: ['nav', Number(raw.userId)],
        queryFn: () => normalizeNav(raw.nav) // prefill
      });
      */

      return true;
    } catch (e) {
      console.error('login failed:', e);
      setIsError(true);
      resetAll();
      navigate('/', { replace: true });
      return false;
    } finally {
      setIsPending(false);
      runningRef.current = false;
    }
  };

  return { login, isPending, isError };
}
