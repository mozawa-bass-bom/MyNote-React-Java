// types/loginUser.ts
export type Category = {
  id: number;
  userId: number;
  name: string;
  noteCount: number;
};
export type NoteSummary = {
  id: number;
  userId: number;
  categoryId: number;
  userSeqNo: number;
  title: string;
};

// アプリで使う最終形
export type LoginUser = {
  userId: number;
  userName: string;
  token: string;
  categories: Category[]; // ← Recordでなく配列の方がUI描画しやすい
  notesByCategory: Record<number, NoteSummary[]>;
};

// サーバ返却の生JSON
export type RawLoginResponse = {
  userName: string;
  userId: string | number;
  token: string;
  nav: {
    categories: Record<string, Category>;
    notesByCategory: Record<string, NoteSummary[]>;
  };
};
