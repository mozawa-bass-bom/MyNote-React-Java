// src/helpers/normalizeToc.ts
import type { ApiTocMapResponse } from '../types/base';
import type { TocItem } from '../types/base';

export function normalizeTocMap(resp: ApiTocMapResponse): Map<number, TocItem[]> {
  const out = new Map<number, TocItem[]>();
  for (const key of Object.keys(resp)) {
    const noteId = Number(key);
    const items = (resp[key] ?? []).map((t) => ({
      id: t.id,
      indexNumber: t.indexNumber,
      startPage: t.startIndex,
      endPage: t.endIndex,
      title: t.title,
      body: t.body,
    }));
    // 表示安定のため indexNumber で整列
    items.sort((a, b) => a.indexNumber - b.indexNumber);
    out.set(noteId, items);
  }
  return out;
}
