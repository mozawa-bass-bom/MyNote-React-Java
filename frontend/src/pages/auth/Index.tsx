import { Link } from 'react-router-dom';
import LoginForm from '../../components/auths/LoginForm';

export default function Index() {
  return (
    <div className="min-h-dvh flex flex-col justify-center items-center gap-2 w-full max-w-md mx-auto">
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
  );
}
