// src/components/contact/ContactForm.tsx
import { useAtomValue } from 'jotai';
import { useEffect, useRef } from 'react';
import { loginUserAtom } from '../../states/UserAtom';

type Props = {
  onConfirm: (next: { name: string; email: string; message: string }) => void;
  isPending?: boolean;
  error?: string | null;
};

export default function ContactForm({ onConfirm, isPending, error }: Props) {
  const loginUser = useAtomValue(loginUserAtom);

  const nameRef = useRef<HTMLInputElement>(null);
  const emailRef = useRef<HTMLInputElement>(null);
  const messageRef = useRef<HTMLTextAreaElement>(null);

  // ログイン時：名前欄が空なら userName を自動入力（上書きはしない）
  useEffect(() => {
    if (!loginUser) return;
    const el = nameRef.current;
    if (el && !el.value) el.value = loginUser.userName || '';
  }, [loginUser]);

  const handleSubmit: React.FormEventHandler<HTMLFormElement> = (e) => {
    e.preventDefault();

    // HTML5バリデーションに任せる（invalidなら return）
    const form = e.currentTarget;
    if (!form.checkValidity()) {
      // ブラウザのバリデーションUIを出す
      form.reportValidity?.();
      return;
    }

    const name = nameRef.current?.value.trim() ?? '';
    const email = emailRef.current?.value.trim() ?? '';
    const message = messageRef.current?.value.trim() ?? '';

    onConfirm({ name, email, message });
  };

  return (
    <form onSubmit={handleSubmit} className="grid gap-3 max-w-2xl" noValidate>
      <div>
        <label className="block text-sm font-medium">お名前</label>
        <input
          ref={nameRef}
          className="mt-1 w-full rounded border px-2 py-1"
          required
          disabled={isPending}
          aria-label="お名前"
        />
      </div>

      <div>
        <label className="block text-sm font-medium">メールアドレス</label>
        <input
          ref={emailRef}
          type="email"
          className="mt-1 w-full rounded border px-2 py-1"
          required
          disabled={isPending}
          aria-label="メールアドレス"
        />
      </div>

      <div>
        <label className="block text-sm font-medium">お問い合わせ内容</label>
        <textarea
          ref={messageRef}
          className="mt-1 w-full rounded border px-2 py-2 min-h-32"
          placeholder="できれば再現手順や状況、時刻、ファイル名など詳しくお願いします。"
          required
          minLength={5}
          disabled={isPending}
          aria-label="お問い合わせ内容"
        />
      </div>

      {error && <div className="text-sm text-red-700">{error}</div>}

      <div className="pt-2">
        <button
          type="submit"
          disabled={isPending}
          className="rounded bg-black/80 text-white px-4 py-1.5 disabled:opacity-50"
        >
          確認
        </button>
      </div>
    </form>
  );
}
