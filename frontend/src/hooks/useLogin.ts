// hooks/useLogin.ts
import { useState, useEffect } from 'react';
import customAxios, { getOk } from '../helpers/CustomAxios';
import { useSetAtom } from 'jotai';
import {
  categoriesByIdAtom,
  loginUserAtom,
  notesByCategoryIdAtom,
  roleAtom,
  tocByNoteIdAtom,
} from '../states/UserAtom';
import type { LoginUser, NormalizedLoginResult, RawLoginResponse } from '../types/loginUser';
import { normalizeLoginResponse } from '../helpers/normalizeLogin';
import { normalizeTocMap } from '../helpers/nomalizeToc';
import type { ApiTocMapResponse } from '../types/base';

async function sendConfidential(loginId: string, loginPass: string) {
  const res = await customAxios.post('/auth/login', {
    userName: loginId,
    password: loginPass,
  });
  return res.data as RawLoginResponse;
}

export default function useLogin() {
  const [isPending, setIsPending] = useState(false);
  const [isError, setIsError] = useState(false);
  const setRole = useSetAtom(roleAtom);
  const setLoginUser = useSetAtom(loginUserAtom);
  const setCategoriesById = useSetAtom(categoriesByIdAtom);
  const setNotesByCategoryId = useSetAtom(notesByCategoryIdAtom);
  const setTocByNoteId = useSetAtom(tocByNoteIdAtom);

  useEffect(() => {
    const saved = localStorage.getItem('loginUser');
    if (saved) {
      const user: LoginUser = JSON.parse(saved);
      setLoginUser(user);
    }
  }, [setLoginUser]);

  // 戻り値: 成功なら true / 失敗なら false
  const login = async (loginId: string, loginPass: string): Promise<boolean> => {
    setIsPending(true);
    setIsError(false);
    try {
      const raw = await sendConfidential(loginId, loginPass);
      const { loginUser, categoriesById, notesByCategoryId, role }: NormalizedLoginResult = normalizeLoginResponse(raw);

      // ★ 成功時のみ保存（キー名は 'authToken' に統一）
      //
      localStorage.setItem('authToken', loginUser.token);
      localStorage.setItem('loginUser', JSON.stringify(loginUser));
      setRole(role);
      setCategoriesById(new Map(categoriesById));
      setNotesByCategoryId(new Map(notesByCategoryId));
      setLoginUser(loginUser);

      try {
        // インターセプタが ApiResponse を“剥がす”ので、素直に中身を受け取れる
        const resp = await getOk<ApiTocMapResponse>('/notes/toc');
        setTocByNoteId(normalizeTocMap(resp));
      } catch (e) {
        console.warn('preload /notes/toc failed:', e);
      }

      return true;
    } catch (e) {
      console.error(e);
      setIsError(true);

      // ★ 失敗時は絶対に書き込まない & 念のため削除
      localStorage.removeItem('authToken');
      localStorage.removeItem('loginUser');
      setLoginUser(null);
      setCategoriesById(new Map());
      setNotesByCategoryId(new Map());
      return false;
    } finally {
      setIsPending(false);
    }
  };

  return { login, isPending, isError };
}
