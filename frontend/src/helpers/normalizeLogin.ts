// helpers/normalizeLogin.ts
import type { Category, NoteSummary } from '../types/base';
import type { RawLoginResponse, LoginUser, NormalizedLoginResult } from '../types/loginUser';

export function normalizeLoginResponse(raw: RawLoginResponse): NormalizedLoginResult {
  // 1) Category: 並び順はここで吸収
  const categories = Object.values(raw.nav.categories).sort((a, b) => a.id - b.id);
  const categoriesById = new Map<number, Category>(categories.map((c) => [c.id, c]));

  // 2) Notes: 文字列キー → 数値キー
  const notesByCategoryId = new Map<number, NoteSummary[]>(
    Object.entries(raw.nav.notesByCategory).map(([k, v]) => [Number(k), v])
  );

  // 3) 認証ミニマム
  const loginUser: LoginUser = {
    userId: Number(raw.userId),
    userName: raw.userName,
    token: raw.token,
  };
  const role = raw.role;

  return { loginUser, categoriesById, notesByCategoryId, role };
}
