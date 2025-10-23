import { useMemo, useRef, useState } from 'react';
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
import { patchOk } from '../../helpers/CustomAxios';
import axios, { AxiosError } from 'axios';

type Props = {
  pageId: number; // APIアクセスのため必須
  markdown: string; // 初期内容（サーバから取得した extractedText）
  readOnly?: boolean;
};

type ApiResponse<T> = { ok: boolean; message?: string; data?: T; errors?: unknown };

export default function Editor({ pageId, markdown, readOnly = false }: Props) {
  const editorRef = useRef<MDXEditorMethods | null>(null);
  const lastSavedRef = useRef(markdown); // 直近サーバ反映済みの文字列
  const [saving, setSaving] = useState(false);

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

  async function handleBlur() {
    const md = editorRef.current?.getMarkdown();
    if (typeof md !== 'string') return;

    const trimmed = md.trim();
    const prev = lastSavedRef.current.trim();

    if (trimmed === prev) return;
    if (trimmed.length === 0) return;

    try {
      setSaving(true);
      await patchOk<ApiResponse<void>>(`notes/pages/${pageId}/text`, { extractedText: md });
      lastSavedRef.current = md;
      // toast.success('保存しました');
    } catch (e: unknown) {
      if (axios.isCancel?.(e)) return;
      const ax = axios.isAxiosError?.(e) ? (e as AxiosError<ApiResponse<void>>) : null;
      const status = ax?.response?.status ?? 'no-status';
      const msg = ax?.response?.data?.message ?? ax?.message ?? 'unknown error';
      console.error('updatePageText failed:', status, msg, e);
      // toast.error(`保存に失敗しました（${status}）`);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="h-full min-h-0">
      <MDXEditor
        ref={editorRef}
        markdown={markdown}
        readOnly={readOnly}
        onBlur={handleBlur}
        className={[
          // ルート：将来ツールバー等を入れても安定するよう縦flex化
          'h-full flex flex-col',
          // 中間ラッパー（.mdxeditor-root-contenteditable）を「親」として伸ばす
          '[&_.mdxeditor-root-contenteditable]:grid',
          '[&_.mdxeditor-root-contenteditable]:flex-1',
          '[&_.mdxeditor-root-contenteditable]:min-h-0',
        ].join(' ')}
        contentEditableClassName={[
          // 編集領域：親の残り高さを占有しつつ、内容は中スクロール
          'prose max-w-none p-2 rounded-md h-full min-h-0 overflow-auto',
          'border',
          saving ? 'border-blue-300 ring-2 ring-blue-100' : 'border-gray-200',
        ].join(' ')}
        plugins={plugins}
      />
    </div>
  );
}
