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
    // ref から現テキスト取得
    const md = editorRef.current?.getMarkdown();
    if (typeof md !== 'string') return;

    const trimmed = md.trim();
    const prev = lastSavedRef.current.trim();

    if (trimmed === prev) return;

    if (trimmed.length === 0) {
      return;
    }

    try {
      setSaving(true);
      await patchOk<ApiResponse<void>>(`notes/pages/${pageId}/text`, { extractedText: md });
      lastSavedRef.current = md; // 保存済みに更新

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
    <div className="h-full">
      <MDXEditor
        ref={editorRef}
        markdown={markdown}
        readOnly={readOnly}
        onBlur={handleBlur}
        className="h-full"
        contentEditableClassName={[
          'prose max-w-none min-h-full p-2 rounded-md h-full',
          'border',
          saving ? 'border-blue-300 ring-2 ring-blue-100' : 'border-gray-200',
        ].join(' ')}
        plugins={plugins}
      />
    </div>
  );
}
