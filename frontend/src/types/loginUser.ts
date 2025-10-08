// types/loginUser.ts
import type { Category, NoteSummary, Role } from './base';

// ★ 生レスポンスそのまま
export type RawLoginResponse = {
  userName: string;
  userId: string;
  token: string;
  role: Role;
  nav: {
    categories: Record<string, Category>;
    notesByCategory: Record<string, NoteSummary[]>;
  };
};

// 認証に必要な最小セット
export type LoginUser = {
  userId: number;
  userName: string;
  token: string;
};

export type NormalizedLoginResult = {
  loginUser: LoginUser;
  role: Role;
  categoriesById: Map<number, Category>;
  notesByCategoryId: Map<number, NoteSummary[]>;
};
