// src/components/upload/UploadForm.tsx
import { useAtom } from 'jotai';
import { useCallback, useMemo, useRef, useState } from 'react';
import { categoriesByIdAtom } from '../../states/UserAtom';
import customAxios, { getOk } from '../../helpers/CustomAxios';
import { readSSE, toFormData, getAuthHeader } from '../../helpers/PdfuploadHelper';
import type { PdfUploadRequest, Mode } from '../../types/upload';

const SSE_URL = new URL('/api/notes/upload/process-stream', (customAxios.defaults.baseURL ?? '') + '/').toString();

type CategoryPromptsDto = {
  catedoryId: number;
  prompt1: string | null;
  prompt2: string | null;
};

export default function UploadForm() {
  // 入力
  const [file, setFile] = useState<File | null>(null);
  const [originalFileName, setOriginalFileName] = useState('');
  const [noteTitle, setNoteTitle] = useState('');
  const [createNewCategory, setCreateNewCategory] = useState(false);
  const [existingCategoryId, setExistingCategoryId] = useState<number | ''>('');
  const [newCategoryName, setNewCategoryName] = useState('');
  const [tocPrompt, setTocPrompt] = useState('');
  const [pagePrompt, setPagePrompt] = useState('');
  const [saveAsDefault, setSaveAsDefault] = useState(false);
  const [mode, setMode] = useState<Mode>('FULL');

  // 状態
  const [categories] = useAtom(categoriesByIdAtom);
  const [messages, setMessages] = useState<string[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const acRef = useRef<AbortController | null>(null);

  // ファイル選択時の補助
  const onPickFile = useCallback((f: File | null) => {
    setFile(f);
    if (f) {
      setOriginalFileName((prev) => prev || f.name);
      setNoteTitle(f.name.replace(/\.[^.]+$/, ''));
    }
  }, []);

  // 送信可能判定
  const canSubmit = useMemo(() => {
    if (!file) return false;
    if (!originalFileName.trim() || !noteTitle.trim()) return false;
    return createNewCategory ? !!newCategoryName.trim() : existingCategoryId !== '' && Number(existingCategoryId) > 0;
  }, [file, originalFileName, noteTitle, createNewCategory, newCategoryName, existingCategoryId]);

  const push = (s: string) => setMessages((m) => [...m, s]);

  // 送信（multipart + SSE）— シンプル
  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      if (!file || !noteTitle.trim() || !originalFileName.trim()) return;

      setSubmitting(true);
      setMessages([]);
      const ac = new AbortController();
      acRef.current = ac;

      try {
        const req: PdfUploadRequest = createNewCategory
          ? {
              createNewCategory: true,
              file,
              originalFileName,
              noteTitle,
              newCategoryName: newCategoryName.trim(),
              tocPrompt: tocPrompt || undefined,
              pagePrompt: pagePrompt || undefined,
              saveAsDefault,
              mode,
            }
          : {
              createNewCategory: false,
              file,
              originalFileName,
              noteTitle,
              existingCategoryId: Number(existingCategoryId),
              tocPrompt: tocPrompt || undefined,
              pagePrompt: pagePrompt || undefined,
              saveAsDefault,
              mode,
            };

        const fd = toFormData(req);
        const headers = new Headers(getAuthHeader());

        const res = await fetch(SSE_URL, {
          method: 'POST',
          body: fd,
          signal: ac.signal,
          credentials: 'include',
          headers,
        });

        await readSSE(res, (evt) => {
          setMessages((prev) => [...prev, `[${evt.code}] ${evt.message}`]);
          if (evt.code === 'ERROR') {
            // 必要なら即リジェクトしたい場合は throw でもOK（ただし readSSE 内ではなくここで）
            throw new Error(evt.message);
          }
        });
      } catch (err) {
        push(err instanceof Error ? err.message : String(err));
      } finally {
        setSubmitting(false);
        acRef.current = null;
      }
    },
    [
      file,
      originalFileName,
      noteTitle,
      createNewCategory,
      existingCategoryId,
      newCategoryName,
      tocPrompt,
      pagePrompt,
      saveAsDefault,
      mode,
    ]
  );

  const handleCancel = useCallback(() => acRef.current?.abort(), []);

  const handleChangeCategory = useCallback(
    async (e: React.ChangeEvent<HTMLSelectElement>) => {
      const idStr = e.target.value;
      const id = idStr ? Number(idStr) : '';
      setExistingCategoryId(id);

      if (id === '') {
        setTocPrompt('');
        setPagePrompt('');
        return;
      }
      const dto = await getOk<CategoryPromptsDto>(`/notes/categories/${id}/prompts`);

      setTocPrompt(dto.prompt1 ? dto.prompt1 : '');
      setPagePrompt(dto.prompt2 ? dto.prompt2 : '');
    },
    [setExistingCategoryId, setTocPrompt, setPagePrompt]
  );

  return (
    <form onSubmit={handleSubmit} className="mx-auto w-full  space-y-4 rounded-xl p-4">
      {/* ファイル */}
      <div className="space-y-1 ">
        <label className="block text-sm font-medium">PDF ファイル</label>
        <input
          type="file"
          accept="application/pdf,.pdf"
          onChange={(e) => onPickFile(e.currentTarget.files?.[0] ?? null)}
          disabled={submitting}
          className="block w-1/2 rounded border border-gray-300 file:mr-3 file:rounded file:border-0 file:bg-black/5 file:px-3 file:py-1.5"
        />
        {file && <p className="text-xs text-gray-500">選択: {file.name}</p>}
      </div>

      {/* 基本情報 */}
      <div className="">
        <input
          type="hidden"
          value={originalFileName}
          onChange={(e) => setOriginalFileName(e.target.value)}
          disabled={submitting}
          className=""
          placeholder="document.pdf"
        />

        <div>
          <label className="block text-sm font-medium">ノートタイトル</label>
          <input
            type="text"
            value={noteTitle}
            onChange={(e) => setNoteTitle(e.target.value)}
            disabled={submitting}
            className="mt-1 w-1/2 rounded border border-gray-300 px-3 py-2"
            placeholder="会議メモ 2025-10-16"
          />
        </div>
      </div>

      {/* カテゴリ */}
      <div>
        <label className="inline-flex items-center gap-2 text-sm font-medium">
          <input
            type="checkbox"
            checked={createNewCategory}
            onChange={(e) => setCreateNewCategory(e.target.checked)}
            disabled={submitting}
          />
          新規カテゴリを作成する
        </label>

        {createNewCategory ? (
          <div className="mt-3 grid gap-3 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <label className="block text-sm font-medium">新規カテゴリ名</label>
              <input
                type="text"
                value={newCategoryName}
                onChange={(e) => setNewCategoryName(e.target.value)}
                disabled={submitting}
                className="mt-1 w-full rounded border border-gray-300 px-3 py-2"
                placeholder="プロジェクトA / 会議"
              />
            </div>
          </div>
        ) : (
          <div className="mt-3 grid gap-3 sm:grid-cols-2">
            {categories.size > 0 ? (
              <div>
                <label className="block text-sm font-medium">既存カテゴリ</label>
                <select
                  value={existingCategoryId}
                  onChange={handleChangeCategory}
                  disabled={submitting}
                  className="mt-1 w-full rounded border border-gray-300 px-3 py-2"
                >
                  <option value="">選択してください</option>
                  {[...categories.entries()].map(([id, c]) => (
                    <option key={id} value={id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>
            ) : (
              <div>
                <label className="block text-sm font-medium">既存カテゴリ</label>
                <p>カテゴリがまだありません</p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* プロンプト */}
      <div>
        <div>
          <label className="inline-flex items-center gap-2 text-sm font-medium">
            <input
              type="checkbox"
              checked={saveAsDefault}
              onChange={(e) => setSaveAsDefault(e.target.checked)}
              disabled={submitting}
            />
            このカテゴリにプロンプトをデフォルト保存
          </label>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 mt-3">
          <div>
            <label className="block text-sm font-medium">目次生成プロンプト（任意）</label>
            <textarea
              value={tocPrompt}
              onChange={(e) => setTocPrompt(e.target.value)}
              disabled={submitting}
              className="mt-1 w-full rounded border border-gray-300 px-3 py-2"
              rows={4}
            />
          </div>
          <div>
            <label className="block text-sm font-medium">ページ注釈プロンプト（任意）</label>
            <textarea
              value={pagePrompt}
              onChange={(e) => setPagePrompt(e.target.value)}
              disabled={submitting}
              className="mt-1 w-full rounded border border-gray-300 px-3 py-2"
              rows={4}
            />
          </div>
        </div>
      </div>

      {/* モード */}
      <div className="grid gap-3 sm:grid-cols-3">
        <div>
          <label className="block text-sm font-medium">モード</label>
          <select
            value={mode}
            onChange={(e) => setMode(e.target.value as Mode)}
            disabled={submitting}
            className="mt-1 w-full rounded border border-gray-300 px-3 py-2"
          >
            <option value="FULL">FULL（OCRあり）</option>
            <option value="SIMPLE">SIMPLE（OCRなし）</option>
          </select>
        </div>
      </div>

      {/* 操作 */}
      <div className="flex items-center gap-3 pt-2">
        <button
          type="submit"
          disabled={!canSubmit || submitting}
          className="inline-flex items-center rounded-md bg-black px-4 py-2 text-white disabled:opacity-50"
        >
          {submitting ? 'アップロード中…' : 'アップロード開始'}
        </button>
        {submitting && (
          <button
            type="button"
            onClick={handleCancel}
            className="inline-flex items-center rounded-md border border-gray-300 px-4 py-2"
          >
            キャンセル
          </button>
        )}
        {!canSubmit && <span className="text-sm text-gray-500">必須項目を入力してください</span>}
      </div>

      {/* 進捗 */}
      {messages.length > 0 && (
        <div className="rounded-md border border-gray-200 p-3">
          <div className="mb-2 text-sm font-medium">進捗</div>
          <ul className="space-y-1 text-sm">
            {messages.map((m, i) => (
              <li key={i}>{m}</li>
            ))}
          </ul>
        </div>
      )}
    </form>
  );
}
