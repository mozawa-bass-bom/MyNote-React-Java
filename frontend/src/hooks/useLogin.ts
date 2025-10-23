// hooks/useLogin.ts
import { useState, useRef } from 'react';
import customAxios, { getOk } from '../helpers/CustomAxios';
import { useSetAtom } from 'jotai';
import {
  categoriesByIdAtom,
  loginUserAtom,
  notesByCategoryIdAtom,
  roleAtom,
  tocByNoteIdAtom,
} from '../states/UserAtom';
import type { RawLoginResponse } from '../types/loginUser';
import { normalizeLoginResponse } from '../helpers/normalizeLogin';
import { normalizeTocMap } from '../helpers/nomalizeToc';
import type { ApiTocMapResponse } from '../types/base';
import { useNavigate } from 'react-router-dom';

async function apiLogin(userName: string, password: string) {
  const { data } = await customAxios.post<RawLoginResponse>('/auth/login', { userName, password });
  return data;
}

async function apiFetchTocMap() {
  return getOk<ApiTocMapResponse>('/notes/toc');
}

export default function useLogin() {
  const navigate = useNavigate();
  const [isPending, setIsPending] = useState(false);
  const [isError, setIsError] = useState(false);
  const runningRef = useRef(false); // 二重実行ガード

  const setRole = useSetAtom(roleAtom);
  const setLoginUser = useSetAtom(loginUserAtom);
  const setCategoriesById = useSetAtom(categoriesByIdAtom);
  const setNotesByCategoryId = useSetAtom(notesByCategoryIdAtom);
  const setTocByNoteId = useSetAtom(tocByNoteIdAtom);

  const resetAll = () => {
    setLoginUser(null);
    setRole('USER');
    setCategoriesById(new Map());
    setNotesByCategoryId(new Map());
    setTocByNoteId(new Map());
  };

  const login = async (loginId: string, loginPass: string): Promise<boolean> => {
    if (runningRef.current) return false;
    runningRef.current = true;
    setIsPending(true);
    setIsError(false);

    try {
      const raw = await apiLogin(loginId, loginPass);
      const { loginUser, categoriesById, notesByCategoryId, role } = normalizeLoginResponse(raw);

      setRole(role);
      setCategoriesById(new Map(categoriesById)); // Map<number, Category>
      setNotesByCategoryId(new Map(notesByCategoryId)); // Map<number, NoteSummary[]>
      setLoginUser(loginUser);

      // 2) 目次マップのプリロード（失敗しても致命ではない）
      try {
        const tocResp = await apiFetchTocMap();
        setTocByNoteId(normalizeTocMap(tocResp)); // Map<number, Toc[]>
      } catch (e) {
        console.warn('preload /notes/toc failed:', e);
      }

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
