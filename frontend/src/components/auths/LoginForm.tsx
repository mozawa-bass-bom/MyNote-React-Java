// src/pages/auth/LoginForm.tsx
import { useRef, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import useLogin from '../../hooks/useLogin';

export default function LoginForm() {
  const loginIdRef = useRef<HTMLInputElement>(null);
  const loginPassRef = useRef<HTMLInputElement>(null);
  const { login, isPending, isError } = useLogin();
  const navigate = useNavigate();

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (isPending) return;

    const loginId = loginIdRef.current?.value?.trim() ?? '';
    const loginPass = loginPassRef.current?.value ?? '';
    if (!loginId || !loginPass) return;

    const ok = await login(loginId, loginPass);
    if (ok) {
      navigate('/notes');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="w-full">
      <div>
        <label className="block text-m mb-2">
          ログイン ID
          <input
            type="text"
            ref={loginIdRef}
            className="mt-1 w-full border rounded px-2 py-1"
            autoComplete="username"
            disabled={isPending}
          />
        </label>
      </div>
      <div className=" mb-4">
        <label className="block text-m">
          パスワード
          <input
            type="password"
            ref={loginPassRef}
            className="mt-1 w-full border rounded px-2 py-1"
            autoComplete="current-password"
            disabled={isPending}
          />
        </label>
      </div>

      {isError && (
        <p role="alert" className="text-sm text-red-600">
          ログインに失敗しました。
        </p>
      )}

      <div className="w-full">
        <button
          type="submit"
          className="px-3 flex w-full items-center justify-center py-1.5 rounded bg-black text-white disabled:opacity-50"
          disabled={isPending}
        >
          {isPending ? 'ログイン中…' : 'ログイン'}
        </button>
      </div>
    </form>
  );
}
