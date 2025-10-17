import type { PdfUploadRequest, ProcessStatusEvent } from '../types/upload';

const getAuthHeader = (): HeadersInit | undefined => {
  try {
    const raw = localStorage.getItem('loginUser');
    const u = raw ? (JSON.parse(raw) as { token?: string }) : null;
    if (!u?.token) return undefined;
    return { Authorization: `Bearer ${u.token}` };
  } catch {
    return undefined;
  }
};

const toStr = (v: unknown) => (typeof v === 'boolean' || typeof v === 'number' ? String(v) : (v as string));

const toFormData = function (req: PdfUploadRequest): FormData {
  const fd = new FormData();
  fd.append('file', req.file);
  fd.append('originalFileName', req.originalFileName);
  fd.append('noteTitle', req.noteTitle);
  if (req.tocPrompt) fd.append('tocPrompt', req.tocPrompt);
  if (req.pagePrompt) fd.append('pagePrompt', req.pagePrompt);
  if (req.saveAsDefault !== undefined) fd.append('saveAsDefault', toStr(req.saveAsDefault));
  fd.append('mode', req.mode);

  fd.append('createNewCategory', toStr(req.createNewCategory));
  if (req.createNewCategory) {
    fd.append('newCategoryName', req.newCategoryName);
  } else {
    fd.append('existingCategoryId', toStr(req.existingCategoryId));
  }
  return fd;
};

// 期待前提：各イベントは data:{...} のJSONで飛んでくる
const readSSE = async function (res: Response, onEvent: (evt: ProcessStatusEvent) => void): Promise<void> {
  const reader = res.body!.getReader(); // bodyは必ずある前提
  const dec = new TextDecoder();
  let buf = '';

  while (true) {
    const { value, done } = await reader.read();
    if (done) break;

    buf += dec.decode(value, { stream: true });

    // 空行でイベント区切り
    let sep: number;
    while ((sep = buf.indexOf('\n\n')) !== -1) {
      const chunk = buf.slice(0, sep);
      buf = buf.slice(sep + 2);

      // data: 行をまとめる
      const data = chunk
        .split('\n')
        .filter((l) => l.startsWith('data:'))
        .map((l) => l.slice(5).trim())
        .join('\n');

      if (!data) continue;

      // JSON前提でそのままパース
      const evt = JSON.parse(data) as ProcessStatusEvent;
      onEvent(evt);
      if (evt.finished) return;
    }
  }
};

export { readSSE, toFormData, getAuthHeader };
