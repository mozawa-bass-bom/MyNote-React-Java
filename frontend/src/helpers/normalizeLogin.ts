// helpers/normalizeLogin.ts
import type { RawLoginResponse, LoginUser, NormalizedLoginResult } from '../types/loginUser';
import { normalizeCategory } from './normalizeCategory';

export function normalizeLoginResponse(raw: RawLoginResponse): NormalizedLoginResult {
  const { categoriesByIdMap, notesByCategoryIdMap } = normalizeCategory(raw.nav.categories, raw.nav.notesByCategory);

  // 3) 認証ミニマム
  const loginUser: LoginUser = {
    userId: Number(raw.userId),
    userName: raw.userName,
    token: raw.token,
  };
  const role = raw.role;

  return { loginUser, categoriesByIdMap, notesByCategoryIdMap, role };
}
