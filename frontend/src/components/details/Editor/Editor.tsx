import { useEffect, useMemo, useRef, useState, useCallback } from 'react';
import {
  MDXEditor,
  headingsPlugin,
  listsPlugin,
  quotePlugin,
  frontmatterPlugin,
  linkPlugin,
  tablePlugin,
  codeBlockPlugin,
  toolbarPlugin,
  BoldItalicUnderlineToggles,
  CreateLink,
  ListsToggle,
  Separator,
  UndoRedo,
  InsertTable,
} from '@mdxeditor/editor';
import type { MDXEditorMethods } from '@mdxeditor/editor';
import '@mdxeditor/editor/style.css';
import { patchOk } from '../../../helpers/CustomAxios';
import axios, { AxiosError } from 'axios';
import { useSetAtom } from 'jotai';
import { addToastAtom } from '../../../states/ToastAtom';

type Props = {
  pageId: number; // APIアクセスのため必須
  markdown: string; // 初期内容（サーバから取得した extractedText）
  readOnly?: boolean;
};

type ApiResponse<T> = { ok: boolean; message?: string; data?: T; errors?: unknown };

export default function Editor({ pageId, markdown, readOnly = false }: Props) {
  const addToast = useSetAtom(addToastAtom);
  const editorRef = useRef<MDXEditorMethods | null>(null);
  const lastSavedRef = useRef(markdown); // 直近サーバ反映済みの文字列
  const [saving, setSaving] = useState(false);

  // pageId や markdown が変わったらエディタとRefを同期
  useEffect(() => {
    lastSavedRef.current = markdown;
    if (editorRef.current) {
      const currentMd = editorRef.current.getMarkdown();
      if (currentMd !== markdown) {
        editorRef.current.setMarkdown(markdown);
      }
    }
  }, [pageId, markdown]);

  const saveContent = useCallback(
    async (mdToSave: string) => {
      const trimmedToSave = mdToSave.trimEnd();
      if (trimmedToSave === lastSavedRef.current.trimEnd()) return;

      try {
        setSaving(true);
        await patchOk<ApiResponse<void>>(`notes/pages/${pageId}/text`, { extractedText: trimmedToSave });
        lastSavedRef.current = trimmedToSave;
        addToast({ type: 'success', message: '保存しました' });
      } catch (e: unknown) {
        if (axios.isCancel?.(e)) return;
        const ax = axios.isAxiosError?.(e) ? (e as AxiosError<ApiResponse<void>>) : null;
        const status = ax?.response?.status ?? 'no-status';
        const msg = ax?.response?.data?.message ?? ax?.message ?? 'unknown error';
        console.error('updatePageText failed:', status, msg, e);
        addToast({ type: 'error', message: `保存に失敗しました（${status}）` });
      } finally {
        setSaving(false);
      }
    },
    [pageId, addToast]
  );

  // onBlur 時の保存
  const handleBlur = useCallback(() => {
    const md = editorRef.current?.getMarkdown();
    if (typeof md === 'string') {
      saveContent(md);
    }
  }, [saveContent]);

  // キーボードショートカット (Ctrl+S / Cmd+S) でも保存可能
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault();
        const md = editorRef.current?.getMarkdown();
        if (typeof md === 'string') {
          saveContent(md);
        }
      }
    },
    [saveContent]
  );

  const plugins = useMemo(
    () => [
      headingsPlugin(),
      listsPlugin(),
      quotePlugin(),
      frontmatterPlugin(),
      linkPlugin(),
      tablePlugin(),
      codeBlockPlugin(),
      toolbarPlugin({
        toolbarContents: () => (
          <>
            <UndoRedo />
            <Separator />
            <BoldItalicUnderlineToggles />
            <Separator />
            <ListsToggle />
            <Separator />
            <CreateLink />
            <Separator />
            <InsertTable />
          </>
        ),
      }),
    ],
    []
  );

  return (
    <div className="h-full min-h-0" onKeyDown={handleKeyDown}>
      <MDXEditor
        ref={editorRef}
        markdown={markdown}
        readOnly={readOnly}
        onBlur={handleBlur}
        className={[
          'h-full flex flex-col',
          '[&_.mdxeditor-root-contenteditable]:grid',
          '[&_.mdxeditor-root-contenteditable]:flex-1',
          '[&_.mdxeditor-root-contenteditable]:min-h-0',
        ].join(' ')}
        contentEditableClassName={[
          'prose dark:prose-invert max-w-none p-3 rounded-md h-full min-h-0 overflow-auto',
          'border',
          saving ? 'border-ring ring-2 ring-ring/20' : 'border-border',
          'dark:text-foreground',
          // 通常の段落(<p>)の余白と左インデントのリセット
          'prose-p:my-1.5 prose-p:leading-relaxed [&_p]:ml-0 [&_p]:pl-0',
          // リストの余白とパディングの最適化
          'prose-ul:my-1.5 prose-ul:pl-6 prose-ol:my-1.5 prose-ol:pl-6 prose-li:my-0.5',
          // リスト内部の<p>タグによる二重インデント・変な改行間隔を防止
          '[&_li_p]:my-0 [&_li_p]:inline',
          'dark:[&_li::marker]:text-foreground dark:[&_li]:text-foreground',
          'dark:[&_ul]:text-foreground dark:[&_ol]:text-foreground',
        ].join(' ')}
        plugins={plugins}
      />
    </div>
  );
}

