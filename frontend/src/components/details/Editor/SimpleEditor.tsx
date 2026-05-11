// src/components/editor/SimpleEditor.tsx
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  MDXEditor,
  headingsPlugin,
  listsPlugin,
  quotePlugin,
  linkPlugin,
  tablePlugin,
  codeBlockPlugin,
  frontmatterPlugin,
} from '@mdxeditor/editor';
import type { MDXEditorMethods } from '@mdxeditor/editor';
import '@mdxeditor/editor/style.css';

type Props = {
  initialValue: string;
  readOnly?: boolean;
  saveRequest: (markdown: string) => Promise<void>;
  onSavingChange?: (saving: boolean) => void;
  onSaved?: (value: string) => void;
  onError?: (message: string, error: unknown) => void;
};

export default function SimpleEditor({
  initialValue,
  readOnly = false,
  saveRequest,
  onSavingChange,
  onSaved,
  onError,
}: Props) {
  const editorRef = useRef<MDXEditorMethods | null>(null);
  const [saving, setSaving] = useState(false);
  const lastSavedRef = useRef(initialValue.trimEnd()); // 直近サーバ反映済みの文字列

  // コールバックを ref で保持して stale closure を防ぐ
  const saveRequestRef = useRef(saveRequest);
  useEffect(() => { saveRequestRef.current = saveRequest; }, [saveRequest]);

  const onSavedRef = useRef(onSaved);
  useEffect(() => { onSavedRef.current = onSaved; }, [onSaved]);

  const onErrorRef = useRef(onError);
  useEffect(() => { onErrorRef.current = onError; }, [onError]);

  const plugins = useMemo(
    () => [
      headingsPlugin(),
      listsPlugin(),
      quotePlugin(),
      linkPlugin(),
      tablePlugin(),
      codeBlockPlugin(),
      frontmatterPlugin(),
    ],
    []
  );

  // initialValue が変化したときエディタ内容を同期
  const prevInitialRef = useRef(initialValue);
  useEffect(() => {
    if (prevInitialRef.current !== initialValue) {
      prevInitialRef.current = initialValue;
      const trimmedInitial = initialValue.trimEnd();
      lastSavedRef.current = trimmedInitial;
      editorRef.current?.setMarkdown(trimmedInitial);
    }
  }, [initialValue]);

  useEffect(() => {
    onSavingChange?.(saving);
  }, [saving, onSavingChange]);

  // フォーカスが外れたときだけ保存（Editor.tsx と同じ方式）
  const handleBlur = useCallback(async () => {
    if (readOnly) return;
    const md = editorRef.current?.getMarkdown();
    if (typeof md !== 'string') return;

    const trimmed = md.trim();
    const prev = lastSavedRef.current.trim();
    if (trimmed === prev) return; // 変更なし → スキップ

    setSaving(true);
    try {
      const mdToSave = md.trimEnd();
      await saveRequestRef.current(mdToSave);
      lastSavedRef.current = mdToSave;
      onSavedRef.current?.(mdToSave);
    } catch (e) {
      onErrorRef.current?.('保存に失敗しました', e);
    } finally {
      setSaving(false);
    }
  }, [readOnly]);

  return (
    <div
      className={[
        'h-full min-h-0',
        'rounded-md border border-transparent',
        'focus-within:border-border focus-within:ring-1 focus-within:ring-border',
        saving ? 'ring-2 ring-ring/20' : '',
        'transition-colors',
      ].join(' ')}
    >
      <MDXEditor
        ref={editorRef}
        markdown={initialValue.trimEnd()}
        readOnly={readOnly}
        onBlur={handleBlur}
        className="h-full flex flex-col"
        contentEditableClassName={[
          'prose dark:prose-invert max-w-none rounded-md h-full min-h-0 overflow-auto !py-0 !px-2',
          'outline-none focus:outline-none',
          'dark:text-foreground',
          'dark:[&_li::marker]:text-foreground dark:[&_li]:text-foreground',
          'dark:[&_ul]:text-foreground dark:[&_ol]:text-foreground',
        ].join(' ')}
        plugins={plugins}
      />
    </div>
  );
}
