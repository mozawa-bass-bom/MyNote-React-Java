// src/pages/auth/Register.tsx
import { useRef, useState, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import customAxios, { getOk } from '../../helpers/CustomAxios';
import { Button } from '../../ui/Button';
import { Input } from '../../ui/Input';

type Availability = { userNameAvailable?: boolean; emailAvailable?: boolean };
type Form = { userName: string; email: string; password: string; password2: string };

export default function RegisterForm() {
  const [f, setF] = useState<Form>({ userName: '', email: '', password: '', password2: '' });
  const [availability, setAvailability] = useState<Availability>({});
  const [checking, setChecking] = useState<{ userName?: boolean; email?: boolean }>({});
  const [isPending, setIsPending] = useState(false);
  const [isError, setIsError] = useState<string | null>(null);
  const navigate = useNavigate();

  // レース対策: 直近の入力値を記録（古いレスを無効化）
  const latestUserName = useRef('');
  const latestEmail = useRef('');

  const onChange = (k: keyof Form) => (e: React.ChangeEvent<HTMLInputElement>) => {
    const v = e.target.value;
    setF((p) => ({ ...p, [k]: v }));
    // 入力が変わったら可用性表示をクリア（任意）
    if (k === 'userName') setAvailability((p) => ({ ...p, userNameAvailable: undefined }));
    if (k === 'email') setAvailability((p) => ({ ...p, emailAvailable: undefined }));
  };

  const checkUserNameOnBlur = async () => {
    const v = f.userName.trim();
    latestUserName.current = v;
    if (!v) {
      setAvailability((p) => ({ ...p, userNameAvailable: undefined }));
      return;
    }
    setChecking((p) => ({ ...p, userName: true }));
    try {
      const res = await getOk<{ userNameAvailable: boolean }>('/auth/availability/username', {
        params: { value: v },
      } as any);
      // 古いレスは捨てる
      if (latestUserName.current === v) setAvailability((p) => ({ ...p, userNameAvailable: res.userNameAvailable }));
    } finally {
      setChecking((p) => ({ ...p, userName: false }));
    }
  };

  const checkEmailOnBlur = async () => {
    const v = f.email.trim().toLowerCase();
    latestEmail.current = v;
    if (!v) {
      setAvailability((p) => ({ ...p, emailAvailable: undefined }));
      return;
    }
    setChecking((p) => ({ ...p, email: true }));
    try {
      const res = await getOk<{ emailAvailable: boolean }>('/auth/availability/email', { params: { value: v } } as any);
      if (latestEmail.current === v) setAvailability((p) => ({ ...p, emailAvailable: res.emailAvailable }));
    } finally {
      setChecking((p) => ({ ...p, email: false }));
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (isPending) return;
    setIsError(null);

    const userName = f.userName.trim();
    const email = f.email.trim().toLowerCase();
    const pass = f.password;
    const pass2 = f.password2;

    // 最低限のバリデーションだけ
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

    const res = await customAxios.post('/auth/register', { userName, password: pass, email });
    if (res.status === 201) navigate('/', { replace: true });
    else setIsError('登録に失敗しました。');

    setIsPending(false);
  };

  const { userNameAvailable, emailAvailable } = availability;

  return (
    <form onSubmit={handleSubmit} className="w-full">
      <div className="space-y-4">
        <div>
          <Input
            label="ユーザー名"
            type="text"
            value={f.userName}
            onChange={onChange('userName')}
            onBlur={checkUserNameOnBlur}
            autoComplete="username"
            disabled={isPending}
            fullWidth
          />
          {checking.userName && <p className="text-sm text-muted-foreground mt-1">ユーザー名を確認中…</p>}
          {userNameAvailable === true && <p className="text-sm text-success mt-1">このユーザー名は利用できます。</p>}
          {userNameAvailable === false && <p className="text-sm text-destructive mt-1">このユーザー名は既に使われています。</p>}
        </div>

        <div>
          <Input
            label="メールアドレス"
            type="email"
            value={f.email}
            onChange={onChange('email')}
            onBlur={checkEmailOnBlur}
            autoComplete="email"
            disabled={isPending}
            fullWidth
          />
          {checking.email && <p className="text-sm text-muted-foreground mt-1">メールアドレスを確認中…</p>}
          {emailAvailable === true && <p className="text-sm text-success mt-1">このメールは利用できます。</p>}
          {emailAvailable === false && <p className="text-sm text-destructive mt-1">このメールは既に使われています。</p>}
        </div>

        <div>
          <Input
            label="パスワード"
            type="password"
            value={f.password}
            onChange={onChange('password')}
            autoComplete="new-password"
            disabled={isPending}
            fullWidth
          />
        </div>

        <div>
          <Input
            label="パスワード（再入力）"
            type="password"
            value={f.password2}
            onChange={onChange('password2')}
            autoComplete="new-password"
            disabled={isPending}
            fullWidth
          />
        </div>
      </div>

      {isError && (
        <p role="alert" className="text-sm text-destructive">
          {isError}
        </p>
      )}

      <div className="flex w-full mt-4 gap-4">
        <Button
          type="submit"
          variant="primary"
          className="flex-1 text-sm py-2"
          disabled={isPending}
        >
          {isPending ? '登録中…' : '登録する'}
        </Button>
        <Link to="/" className="flex-1 px-3 py-2 rounded border border-input hover:bg-muted transition-colors text-sm text-center flex items-center justify-center font-medium">
          ログインへ戻る
        </Link>
      </div>
    </form>
  );
}
