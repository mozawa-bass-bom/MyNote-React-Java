// types/loginUser.ts
import type { Category, NoteSummary, Role } from './base';

// 再利用用の別名
export type CategoriesMap = Record<string, Category>;
export type NotesByCategoryMap = Record<string, NoteSummary[]>;

// nav 部分を独立した型として公開
export type Nav = {
  categories: CategoriesMap;
  notesByCategory: NotesByCategoryMap;
};

// ★ 生レスポンスそのまま
export type RawLoginResponse = {
  userName: string;
  userId: string; // rawは文字列
  token: string;
  role: Role;
  nav: Nav;
};

// 認証に必要な最小セット（正規化後）
export type LoginUser = {
  userId: number; // 数値化
  userName: string;
  token: string;
};

// 正規化後の結果（Mapで統一）
export type NormalizedLoginResult = {
  loginUser: LoginUser;
  role: Role;
  categoriesByIdMap: Map<number, Category>;
  notesByCategoryIdMap: Map<number, NoteSummary[]>;
};
