// types/base.ts
export type Role = 'ADMIN' | 'USER';

// types/base.ts
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
  createdAt: string;
  updatedAt: string;
};
// ======================
// 1) APIワイヤー用型（サーバのJSONそのまま）
// ======================
export type ApiNote = {
  id: number;
  userId: number;
  categoryId: number;
  userSeqNo: number;
  title: string;
  description: string;
  originalFilename: string;
  createdAt: string;
  updatedAt: string;
};

export type ApiTocItem = {
  id: number;
  noteId: number;
  indexNumber: number;
  startIndex: number;
  endIndex: number;
  title: string;
  body: string;
};

export type ApiPageItem = {
  id: number;
  noteId: number;
  pageNumber: number;
  firebasePublicUrl: string;
  firebaseAdminPath: string;
  extractedText: string;
};

export type ApiNoteDetailData = {
  note: ApiNote;
  toc: ApiTocItem[];
  page: ApiPageItem[];
};

// ======================
// 2) アプリ用型（UIで扱いやすい命名）
// ======================
export type NoteDetailResponse = {
  id: number;
  userId: number;
  categoryId: number;
  userSeqNo: number;
  title: string;
  description: string;
  originalFilename: string;
  createdAt: string;
  updatedAt: string;
  tocItems: TocItem[];
  pageItems: PageItem[];
};

export type TocItem = {
  id: number;
  indexNumber: number;
  startPage: number; // startIndex を変換
  endPage: number; // endIndex を変換
  title: string;
  body: string;
};

export type PageItem = {
  id: number;
  pageNumber: number;
  imageUrl: string; // firebasePublicUrl を変換
  extractedText: string;
  adminPath?: string; // firebaseAdminPath を保持（任意）
};

// ======================
/** 3) 変換関数（API→アプリ用） */
// ======================
export function toNoteDetailResponse(api: ApiNoteDetailData): NoteDetailResponse {
  const { note, toc, page } = api;
  return {
    id: note.id,
    userId: note.userId,
    categoryId: note.categoryId,
    userSeqNo: note.userSeqNo,
    title: note.title,
    description: note.description,
    originalFilename: note.originalFilename,
    createdAt: note.createdAt,
    updatedAt: note.updatedAt,
    tocItems: toc.map(({ id, indexNumber, startIndex, endIndex, title, body }) => ({
      id,
      indexNumber,
      startPage: startIndex,
      endPage: endIndex,
      title,
      body,
    })),
    pageItems: page.map(({ id, pageNumber, firebasePublicUrl, firebaseAdminPath, extractedText }) => ({
      id,
      pageNumber,
      imageUrl: firebasePublicUrl,
      extractedText,
      adminPath: firebaseAdminPath,
    })),
  };
}
