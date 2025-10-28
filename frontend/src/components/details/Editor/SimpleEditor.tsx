// src/components/editor/UltraSimpleEditor.tsx
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
  debounceMs?: number;
  saveRequest: (markdown: string) => Promise<void>;
  onSavingChange?: (saving: boolean) => void;
  onSaved?: (value: string) => void;
  onError?: (message: string, error: unknown) => void;
};

export default function UltraSimpleEditor({
  initialValue,
  readOnly = false,
  debounceMs = 800,
  saveRequest,
  onSavingChange,
  onSaved,
  onError,
}: Props) {
  const editorRef = useRef<MDXEditorMethods | null>(null);
  const [value, setValue] = useState(initialValue);
  const [saving, setSaving] = useState(false);
  const timerRef = useRef<number | null>(null);

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

  useEffect(() => {
    return () => {
      if (timerRef.current) window.clearTimeout(timerRef.current);
    };
  }, []);

  useEffect(() => {
    setValue(initialValue);
  }, [initialValue]);

  useEffect(() => {
    onSavingChange?.(saving);
  }, [saving, onSavingChange]);

  const doSave = useCallback(
    async (md: string) => {
      setSaving(true);
      try {
        await saveRequest(md);
        console.log('[UltraSimpleEditor] doSave success');
        onSaved?.(md);
      } catch (e) {
        console.log('[UltraSimpleEditor] doSave error', e);
        onError?.('保存に失敗しました', e);
      } finally {
        setSaving(false);
      }
    },
    [saveRequest, onSaved, onError]
  );

  const scheduleSave = useCallback(
    (md: string) => {
      if (readOnly) return;
      if (timerRef.current) {
        window.clearTimeout(timerRef.current);
        console.log('[UltraSimpleEditor] cleared previous timer');
      }
      timerRef.current = window.setTimeout(() => {
        console.log('[UltraSimpleEditor] timer fired -> doSave');
        doSave(md);
        timerRef.current = null;
      }, debounceMs);
    },
    [debounceMs, doSave, readOnly]
  );

  const handleChange = useCallback(
    (md: string) => {
      setValue(md);
      console.log('[UltraSimpleEditor] onChange len=', md?.length ?? 0);
      scheduleSave(md);
    },
    [scheduleSave]
  );

  return (
    <div
      className={[
        'h-full min-h-0',
        'rounded-md border border-transparent',
        'focus-within:border-gray-300 focus-within:ring-1 focus-within:ring-gray-200',
        saving ? 'ring-2 ring-blue-100' : '',
        'transition-colors',
      ].join(' ')}
    >
      <MDXEditor
        ref={editorRef}
        markdown={value}
        readOnly={readOnly}
        onChange={handleChange}
        className="h-full flex flex-col"
        contentEditableClassName={[
          'prose max-w-none rounded-md h-full min-h-0 overflow-auto !py-0 !px-2',
          'outline-none focus:outline-none',
        ].join(' ')}
        plugins={plugins}
      />
    </div>
  );
}
