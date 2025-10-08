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
};

export type NoteDetailResponse = {
  id: number;
  categoryId: number;
  userSeqNo: number;
  title: string;
  tocItems: TocItem[];
  pageItems: PageItem[];
};

export type TocItem = {
  id: number;
  indexNumber: number;
  startPage: number;
  endPage: number;
  title: string;
  body: string;
};

export type PageItem = {
  id: number;
  pageNumber: number;
  imageUrl: string;
  extractedText: string;
};
