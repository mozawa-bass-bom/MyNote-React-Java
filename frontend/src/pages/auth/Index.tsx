import { Link } from 'react-router-dom';
import LoginForm from '../../components/auths/LoginForm';

export default function Index() {
  return (
    <div
      className="min-h-dvh bg-white text-gray-900"
      style={{
        // ダークモード / カスタムモード問わず、常にライトモードの色を強制
        colorScheme: 'light',
        ['--background' as string]: '0 0% 100%',
        ['--foreground' as string]: '222.2 84% 4.9%',
        ['--input-bg' as string]: '0 0% 100%',
      }}
    >
      <div className="flex flex-col justify-center items-center gap-2 w-full max-w-md mx-auto min-h-dvh">
        <LoginForm />

        <div className="flex w-full mt-4 gap-4">
          <Link to="/Register" className="flex-1 px-3 py-1.5 rounded bg-black text-white text-center">
            新規登録
          </Link>
          <Link to="/resetPass" className="flex-1 px-3 py-1.5 rounded border text-sm text-center">
            パスワードリセット
          </Link>
        </div>
      </div>
    </div>
  );
}
