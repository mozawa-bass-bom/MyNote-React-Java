// src/components/upload/UploadForm.tsx
import { useAtomValue, useSetAtom } from 'jotai';
import { useCallback, useMemo, useRef, useState, useEffect } from 'react';
import { loginUserAtom } from '../../states/UserAtom';
import { addToastAtom } from '../../states/ToastAtom';
import customAxios, { getOk } from '../../helpers/CustomAxios';
import { readSSE, toFormData, getAuthHeader } from '../../helpers/PdfuploadHelper';
import type { PdfUploadRequest, Mode } from '../../types/upload';
import { useQueryClient } from '@tanstack/react-query';
import { useCategories } from '../../hooks/queries/useNav';

const SSE_URL = new URL('/api/notes/upload/process-stream', (customAxios.defaults.baseURL ?? '') + '/').toString();

type CategoryPromptsDto = {
  categoryId: number;
  prompt1: string | null;
  prompt2: string | null;
};

type StepStatus = 'processing' | 'done' | 'skipped' | 'error';
type ProcessStep = {
  id: string;
  text: string;
  status: StepStatus;
};

function AnimatedDots() {
  const [dots, setDots] = useState('');
  useEffect(() => {
    const id = setInterval(() => {
      setDots((prev) => (prev.length >= 3 ? '' : prev + '.'));
    }, 400);
    return () => clearInterval(id);
  }, []);
  return <span className="inline-block w-4 text-left">{dots}</span>;
}

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
  const { categoriesByIdMap: categories } = useCategories();
  const loginUser = useAtomValue(loginUserAtom);
  const addToast = useSetAtom(addToastAtom);
  const noCategories = !categories || categories.size === 0; // カテゴリーが空かどうかの判定

  const queryClient = useQueryClient();
  const [steps, setSteps] = useState<ProcessStep[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const acRef = useRef<AbortController | null>(null);

  // カテゴリーが存在しない場合、強制的に新規作成モードにする
  useEffect(() => {
    if (noCategories) {
      setCreateNewCategory(true);
    }
  }, [noCategories]);

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

  // 送信（multipart + SSE）
  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      if (!file || !noteTitle.trim() || !originalFileName.trim()) return;

      setSubmitting(true);
      setSteps([{ id: 'upload', text: 'アップロード・PDF解析', status: 'processing' }]);
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
          headers, // FormDataなのでContent-Typeは自動でboundary付与
        });

        if (!res.ok) {
          throw new Error(`upload failed: ${res.status} ${res.statusText}`);
        }

        await readSSE(res, async (evt) => {
          if (!(evt as any).code) return; // connection event等を無視

          setSteps((prev) => {
            const next = [...prev];
            if (evt.code === 'UPLOAD_DONE') {
              const idx = next.findIndex((s) => s.id === 'upload');
              if (idx !== -1) next[idx].status = 'done';
              next.push({ id: 'ocr', text: 'OCR処理（画像テキスト抽出）', status: 'processing' });
            } else if (evt.code === 'OCR_DONE') {
              const idx = next.findIndex((s) => s.id === 'ocr');
              if (idx !== -1) next[idx].status = 'done';
              next.push({ id: 'ai', text: 'AI解析（目次・要約生成）', status: 'processing' });
            } else if (evt.code === 'OCR_SKIPPED') {
              const idx = next.findIndex((s) => s.id === 'ocr');
              if (idx !== -1) next[idx].status = 'skipped';
              next.push({ id: 'ai', text: 'AI解析（目次・要約生成）', status: 'processing' });
            } else if (evt.code === 'AI_DONE') {
              const idx = next.findIndex((s) => s.id === 'ai');
              if (idx !== -1) next[idx].status = 'done';
            } else if (evt.code === 'ERROR') {
              let lastProc = -1;
              for (let j = 0; j < next.length; j++) {
                if (next[j].status === 'processing') lastProc = j;
              }
              if (lastProc !== -1) next[lastProc].status = 'error';
              next.push({ id: 'error', text: evt.message, status: 'error' });
            }
            return next;
          });

          if (evt.code === 'COMPLETE') {
            const userId = loginUser?.userId;
            if (userId) {
              await queryClient.invalidateQueries({ queryKey: ['nav', userId] });
              await queryClient.invalidateQueries({ queryKey: ['toc'] });
            }
            addToast({ type: 'success', message: 'ノートをアップロードしました' });
          }
        });
      } catch (err) {
        const errMsg = err instanceof Error ? err.message : String(err);
        setSteps((prev) => {
          const next = [...prev];
          let lastProc = -1;
          for (let j = 0; j < next.length; j++) {
            if (next[j].status === 'processing') lastProc = j;
          }
          if (lastProc !== -1) next[lastProc].status = 'error';
          next.push({ id: 'sys-error', text: `システムエラー: ${errMsg}`, status: 'error' });
          return next;
        });
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
      loginUser,
      queryClient,
    ]
  );

  const handleCancel = useCallback(() => acRef.current?.abort(), []);

  const handleChangeCategory = useCallback(async (e: React.ChangeEvent<HTMLSelectElement>) => {
    const idStr = e.target.value;
    const id = idStr ? Number(idStr) : '';
    setExistingCategoryId(id);

    if (id === '') {
      setTocPrompt('');
      setPagePrompt('');
      return;
    }
    const dto = await getOk<CategoryPromptsDto>(`/notes/categories/${id}/prompts`);
    setTocPrompt(dto.prompt1 ?? '');
    setPagePrompt(dto.prompt2 ?? '');
  }, []);

  return (
    <form onSubmit={handleSubmit} className="mx-auto w-full space-y-4 rounded-xl p-4">
      {/* ファイル */}
      <div className="space-y-1">
        <label className="block text-sm font-medium">PDF ファイル</label>
        <input
          type="file"
          accept="application/pdf,.pdf"
          onChange={(e) => onPickFile(e.currentTarget.files?.[0] ?? null)}
          disabled={submitting}
          className="block w-1/2 rounded border border-input bg-input-bg file:mr-3 file:rounded file:border-0 file:bg-foreground/5 file:px-3 file:py-1.5"
        />
        {file && <p className="text-xs text-muted-foreground">選択: {file.name}</p>}
      </div>

      {/* 基本情報 */}
      <div>
        <input
          type="hidden"
          value={originalFileName}
          onChange={(e) => setOriginalFileName(e.target.value)}
          disabled={submitting}
          placeholder="document.pdf"
        />

        <div>
          <label className="block text-sm font-medium">ノートタイトル</label>
          <input
            type="text"
            value={noteTitle}
            onChange={(e) => setNoteTitle(e.target.value)}
            disabled={submitting}
            className="mt-1 w-1/2 rounded border border-input bg-input-bg px-3 py-2"
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
            // 送信中、またはカテゴリーが一つもない場合は操作不能にする
            disabled={submitting || noCategories}
            className={noCategories ? "cursor-not-allowed opacity-50" : ""}
          />
          新規カテゴリを作成する
        </label>
        {noCategories && !submitting && (
          <p className="text-xs text-amber-600 mt-1">※登録されているカテゴリーがないため、新規作成が必要です。</p>
        )}
        {createNewCategory ? (
          <div className="mt-3 grid gap-3 sm:grid-cols-2">
            <div>
              <label className="block text-sm font-medium">新規カテゴリ名</label>
              <input
                type="text"
                value={newCategoryName}
                onChange={(e) => setNewCategoryName(e.target.value)}
                disabled={submitting}
                className="mt-1 w-full rounded border border-input bg-input-bg px-3 py-2"
                placeholder="プロジェクトA / 会議"
              />
            </div>
          </div>
        ) : (
          <div className="mt-3 grid gap-3 sm:grid-cols-2">
            {categories && categories.size > 0 ? (
              <div>
                <label className="block text-sm font-medium">既存カテゴリ</label>
                <select
                  value={existingCategoryId}
                  onChange={handleChangeCategory}
                  disabled={submitting}
                  className="mt-1 w-full rounded border border-input bg-input-bg px-3 py-2"
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
              className="mt-1 w-full rounded border border-input bg-input-bg px-3 py-2"
              rows={4}
            />
          </div>
          <div>
            <label className="block text-sm font-medium">ページ注釈プロンプト（任意）</label>
            <textarea
              value={pagePrompt}
              onChange={(e) => setPagePrompt(e.target.value)}
              disabled={submitting}
              className="mt-1 w-full rounded border border-input bg-input-bg px-3 py-2"
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
            className="mt-1 w-full rounded border border-input bg-input-bg px-3 py-2"
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
          className="inline-flex items-center rounded-md bg-foreground px-4 py-2 text-background disabled:opacity-50"
        >
          {submitting ? 'アップロード中…' : 'アップロード開始'}
        </button>
        {submitting && (
          <button
            type="button"
            onClick={handleCancel}
            className="inline-flex items-center rounded-md border border-input px-4 py-2"
          >
            キャンセル
          </button>
        )}
        {!canSubmit && <span className="text-sm text-muted-foreground">必須項目を入力してください</span>}
      </div>

      {/* 進捗 */}
      {steps.length > 0 && (
        <div className="rounded-md border border-border p-3">
          <div className="mb-2 text-sm font-medium">進捗</div>
          <ul className="space-y-2 text-sm">
            {steps.map((s, i) => (
              <li key={i} className="flex items-center gap-2">
                {s.status === 'processing' && (
                  <span className="text-blue-500 font-medium flex items-center">
                    <svg className="animate-spin h-4 w-4 mr-2" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    {s.text}してます<AnimatedDots />
                  </span>
                )}
                {s.status === 'done' && (
                  <span className="text-green-600 font-medium flex items-center">
                    <svg className="h-4 w-4 mr-2" viewBox="0 0 20 20" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    {s.text}が完了しました
                  </span>
                )}
                {s.status === 'skipped' && (
                  <span className="text-muted-foreground font-medium flex items-center">
                    <svg className="h-4 w-4 mr-2" viewBox="0 0 20 20" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    {s.text}をスキップしました（抽出済みテキスト適応）
                  </span>
                )}
                {s.status === 'error' && (
                  <span className="text-destructive font-medium flex items-center">
                    <svg className="h-4 w-4 mr-2" viewBox="0 0 20 20" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                      <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                    {s.text}
                  </span>
                )}
              </li>
            ))}
          </ul>
        </div>
      )}
    </form>
  );
}
