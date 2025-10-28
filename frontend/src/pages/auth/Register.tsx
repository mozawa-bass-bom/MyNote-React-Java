// src/pages/auth/Register.tsx
import { useRef, useState, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import customAxios from '../../helpers/CustomAxios';
import axios from 'axios';

type Availability = {
  userNameAvailable?: boolean;
  emailAvailable?: boolean;
};

export default function Register() {
  const userNameRef = useRef<HTMLInputElement>(null);
  const emailRef = useRef<HTMLInputElement>(null);
  const passRef = useRef<HTMLInputElement>(null);
  const pass2Ref = useRef<HTMLInputElement>(null);

  const [isPending, setIsPending] = useState(false);
  const [isError, setIsError] = useState<string | null>(null);
  const [availability, setAvailability] = useState<Availability>({});
  const [checking, setChecking] = useState<{ userName?: boolean; email?: boolean }>({});

  const navigate = useNavigate();

  // --- 重複チェック（ユーザー名） ---
  const checkUserName = async () => {
    const v = userNameRef.current?.value?.trim();
    if (!v) {
      setAvailability((p) => ({ ...p, userNameAvailable: undefined }));
      return;
    }
    setChecking((p) => ({ ...p, userName: true }));
    try {
      const res = await customAxios.post('/auth/availability', { userName: v });
      setAvailability((p) => ({ ...p, userNameAvailable: res.data?.data?.userNameAvailable }));
    } catch {
      setAvailability((p) => ({ ...p, userNameAvailable: undefined }));
    } finally {
      setChecking((p) => ({ ...p, userName: false }));
    }
  };

  // --- 重複チェック（メール） ---
  const checkEmail = async () => {
    const raw = emailRef.current?.value ?? '';
    const v = raw.trim().toLowerCase();
    if (!v) {
      setAvailability((p) => ({ ...p, emailAvailable: undefined }));
      return;
    }
    setChecking((p) => ({ ...p, email: true }));
    try {
      const res = await customAxios.post('/auth/availability', { email: v });
      setAvailability((p) => ({ ...p, emailAvailable: res.data?.data?.emailAvailable }));
    } catch {
      setAvailability((p) => ({ ...p, emailAvailable: undefined }));
    } finally {
      setChecking((p) => ({ ...p, email: false }));
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (isPending) return;

    setIsError(null);

    const userName = userNameRef.current?.value?.trim() ?? '';
    const emailRaw = emailRef.current?.value ?? '';
    const email = emailRaw.trim().toLowerCase();
    const pass = passRef.current?.value ?? '';
    const pass2 = pass2Ref.current?.value ?? '';

    // ざっくりバリデーション
    if (!userName || !email || !pass) {
      setIsError('未入力の項目があります。');
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setIsError('メールアドレスの形式が正しくありません。');
      return;
    }
    if (pass !== pass2) {
      setIsError('パスワード（再入力）が一致しません。');
      return;
    }

    setIsPending(true);
    try {
      await Promise.all([checkUserName(), checkEmail()].map((p) => p?.catch(() => {})));

      const res = await customAxios.post('/auth/register', {
        userName,
        password: pass,
        email,
      });

      if (res.status === 201) {
        navigate('/', { replace: true });
      } else {
        setIsError('登録に失敗しました。');
      }
    } catch (err: unknown) {
      if (axios.isAxiosError(err)) {
        console.log(err.response?.status, err.message);
      } else if (err instanceof Error) {
        console.log(err.message);
      } else {
        console.log(String(err));
      }
    } finally {
      setIsPending(false);
    }
  };

  const unameState = availability.userNameAvailable;
  const emailState = availability.emailAvailable;

  return (
    <form onSubmit={handleSubmit} className="space-y-3 w-m max-w-m">
      <div>
        <label className="block text-m mb-1">
          ユーザー名
          <input
            type="text"
            ref={userNameRef}
            className="mt-1 w-full border rounded px-2 py-1"
            autoComplete="username"
            disabled={isPending}
            onBlur={checkUserName}
          />
        </label>
        {checking.userName && <p className="text-sm text-gray-500">ユーザー名を確認中…</p>}
        {unameState === true && <p className="text-sm text-green-700">このユーザー名は利用できます。</p>}
        {unameState === false && <p className="text-sm text-red-600">このユーザー名は既に使われています。</p>}
      </div>

      <div>
        <label className="block text-m mb-1">
          メールアドレス
          <input
            type="email"
            ref={emailRef}
            className="mt-1 w-full border rounded px-2 py-1"
            autoComplete="email"
            disabled={isPending}
            onBlur={checkEmail}
          />
        </label>
        {checking.email && <p className="text-sm text-gray-500">メールアドレスを確認中…</p>}
        {emailState === true && <p className="text-sm text-green-700">このメールは利用できます。</p>}
        {emailState === false && <p className="text-sm text-red-600">このメールは既に使われています。</p>}
      </div>

      <div>
        <label className="block text-m mb-1">
          パスワード
          <input
            type="password"
            ref={passRef}
            className="mt-1 w-full border rounded px-2 py-1"
            autoComplete="new-password"
            disabled={isPending}
          />
        </label>
      </div>
      <div>
        <label className="block text-m mb-1">
          パスワード（再入力）
          <input
            type="password"
            ref={pass2Ref}
            className="mt-1 w-full border rounded px-2 py-1"
            autoComplete="new-password"
            disabled={isPending}
          />
        </label>
      </div>

      {isError && (
        <p role="alert" className="text-sm text-red-600">
          {isError}
        </p>
      )}

      <div className="flex items-center gap-2">
        <button
          type="submit"
          className="px-3 py-1.5 rounded bg-black text-white disabled:opacity-50"
          disabled={isPending}
        >
          {isPending ? '登録中…' : '登録する'}
        </button>
        <Link to="/login" className="px-3 py-1.5 rounded border inline-block text-sm">
          ログインへ戻る
        </Link>
      </div>
    </form>
  );
}
