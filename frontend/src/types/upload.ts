// types/upload.ts
export type Mode = 'FULL' | 'SIMPLE';

export type ProcessStatusEvent =
  | {
      code: 'UPLOAD_DONE' | 'OCR_DONE' | 'OCR_SKIPPED' | 'AI_DONE' | 'COMPLETE';
      message: string;
      noteId: number | null;
      finished: boolean; // COMPLETE のとき true
      mode: 'FULL' | 'SIMPLE';
    }
  | {
      code: 'ERROR';
      message: string; // エラーメッセージ
      noteId: number | null;
      finished: boolean; // true
      mode: 'FULL' | 'SIMPLE';
    };

type BaseDto = {
  file: File;
  originalFileName: string;
  noteTitle: string;
  tocPrompt?: string;
  pagePrompt?: string;
  saveAsDefault?: boolean;
  mode: Mode;
};

// createNewCategory=true のとき
export type NewCategoryReq = BaseDto & {
  createNewCategory: true;
  newCategoryName: string;
  existingCategoryId?: never;
};

// createNewCategory=false のとき
export type ExistingCategoryReq = BaseDto & {
  createNewCategory: false;
  existingCategoryId: number;
  newCategoryName?: never;
};

export type PdfUploadRequest = NewCategoryReq | ExistingCategoryReq;
