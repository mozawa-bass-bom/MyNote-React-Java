// src/pages/contact/Index.tsx
import { useCallback, useMemo, useState } from 'react';
import customAxios from '../../helpers/CustomAxios';
import ContactForm from '../../components/contact/ContactForm';
import ConfirmTable from '../../components/contact/ConfirmTable';

type Mode = 'edit' | 'confirm' | 'done';
type FormData = { name: string; email: string; message: string };

export default function ContactIndex() {
  const [mode, setMode] = useState<Mode>('edit');
  const [isPending, setIsPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [form, setForm] = useState<FormData>({ name: '', email: '', message: '' });

  const isEmail = (v: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim());
  const isValid = useMemo(
    () => form.name.trim().length >= 1 && isEmail(form.email) && form.message.trim().length >= 5,
    [form]
  );

  const toConfirm = useCallback(
    (next: FormData) => {
      setForm(next);
      if (!isValid) return; // ここで再チェックするなら next ベースで判定してもOK
      setError(null);
      setMode('confirm');
    },
    [isValid]
  );

  const backToEdit = useCallback(() => setMode('edit'), []);
  const submit = useCallback(async () => {
    if (!isValid) return;
    setIsPending(true);
    setError(null);
    try {
      await customAxios.post('/api/contacts', {
        name: form.name.trim(),
        email: form.email.trim(),
        message: form.message.trim(),
      });
      setMode('done');
    } catch (e) {
      console.error(e);
      setError('送信に失敗しました。時間をおいて再度お試しください。');
      setMode('edit');
    } finally {
      setIsPending(false);
    }
  }, [form, isValid]);

  return (
    <div className="p-4 space-y-4">
      <h1 className="text-xl font-semibold">お問い合わせ</h1>

      {mode === 'edit' && <ContactForm defaultValue={form} onConfirm={toConfirm} isPending={isPending} error={error} />}

      {mode === 'confirm' && (
        <ConfirmTable
          name={form.name}
          email={form.email}
          message={form.message}
          isPending={isPending}
          onBack={backToEdit}
          onSubmit={submit}
        />
      )}

      {mode === 'done' && (
        <div className="rounded border bg-green-50 p-4">
          <div className="font-medium">送信しました。ご連絡ありがとうございます！</div>
          <div className="text-sm text-gray-600 mt-1">内容を確認のうえ、必要に応じてご返信します。</div>
        </div>
      )}

      {error && mode !== 'done' && <div className="text-sm text-red-700">{error}</div>}
    </div>
  );
}
