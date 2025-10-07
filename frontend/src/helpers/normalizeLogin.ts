import type { LoginUser, RawLoginResponse } from '../types/loginUser';

export function normalizeLoginResponse(raw: RawLoginResponse): LoginUser {
  const categories = Object.values(raw.nav.categories).sort((a, b) => a.id - b.id);

  const notesByCategory = Object.fromEntries(Object.entries(raw.nav.notesByCategory).map(([k, v]) => [Number(k), v]));

  return {
    userId: Number(raw.userId),
    userName: raw.userName,
    token: raw.token,
    categories,
    notesByCategory,
  };
}
