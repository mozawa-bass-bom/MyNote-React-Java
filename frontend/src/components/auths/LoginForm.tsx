// src/pages/auth/LoginForm.tsx
import { useRef, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import useLogin from '../../hooks/useLogin';
import { Button } from '../../ui/Button';
import { Input } from '../../ui/Input';

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
    <form onSubmit={handleSubmit} className="w-full space-y-4">
      <div>
        <Input
          label="ログイン ID"
          type="text"
          ref={loginIdRef}
          autoComplete="username"
          disabled={isPending}
          fullWidth
        />
      </div>
      <div>
        <Input
          label="パスワード"
          type="password"
          ref={loginPassRef}
          autoComplete="current-password"
          disabled={isPending}
          fullWidth
        />
      </div>

      {isError && (
        <p role="alert" className="text-sm text-destructive">
          ログインに失敗しました。
        </p>
      )}

      <div>
        <Button
          type="submit"
          variant="primary"
          fullWidth
          disabled={isPending}
        >
          {isPending ? 'ログイン中…' : 'ログイン'}
        </Button>
      </div>
    </form>
  );
}
