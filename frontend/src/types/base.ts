// types/base.ts
export type Role = "ADMIN" | "USER";

export type Category = {
  id: number;
  name: string;
};

export type Note = {
  id: number;
  categoryId: number;
  userSeqNo: number;
  title: string;
  createdAt: string;
  pageCount: number;
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
