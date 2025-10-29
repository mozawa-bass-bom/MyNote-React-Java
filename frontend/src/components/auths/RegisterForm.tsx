// src/pages/auth/Register.tsx
import { useRef, useState, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import customAxios, { getOk } from '../../helpers/CustomAxios';

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
      <div>
        <label className="block text-m mb-1">
          ユーザー名
          <input
            type="text"
            value={f.userName}
            onChange={onChange('userName')}
            onBlur={checkUserNameOnBlur}
            className="mt-1 w-full border rounded px-2 py-1"
            autoComplete="username"
            disabled={isPending}
          />
        </label>
        {checking.userName && <p className="text-sm text-gray-500">ユーザー名を確認中…</p>}
        {userNameAvailable === true && <p className="text-sm text-green-700">このユーザー名は利用できます。</p>}
        {userNameAvailable === false && <p className="text-sm text-red-600">このユーザー名は既に使われています。</p>}
      </div>

      <div>
        <label className="block text-m mb-1">
          メールアドレス
          <input
            type="email"
            value={f.email}
            onChange={onChange('email')}
            onBlur={checkEmailOnBlur}
            className="mt-1 w-full border rounded px-2 py-1"
            autoComplete="email"
            disabled={isPending}
          />
        </label>
        {checking.email && <p className="text-sm text-gray-500">メールアドレスを確認中…</p>}
        {emailAvailable === true && <p className="text-sm text-green-700">このメールは利用できます。</p>}
        {emailAvailable === false && <p className="text-sm text-red-600">このメールは既に使われています。</p>}
      </div>

      <div>
        <label className="block text-m mb-1">
          パスワード
          <input
            type="password"
            value={f.password}
            onChange={onChange('password')}
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
            value={f.password2}
            onChange={onChange('password2')}
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

      <div className="flex w-full mt-4 gap-4">
        <button
          type="submit"
          className="flex-1 px-3 py-1.5 rounded bg-black text-white text-center disabled:opacity-50"
          disabled={isPending}
        >
          {isPending ? '登録中…' : '登録する'}
        </button>
        <Link to="/" className="flex-1 px-3 py-1.5 rounded border text-sm text-center">
          ログインへ戻る
        </Link>
      </div>
    </form>
  );
}
