import { Link } from 'react-router-dom';
import LoginForm from '../../components/auths/LoginForm';

export default function Index() {
  return (
    <div className="h-screen flex justify-center items-center">
      <LoginForm />
      <Link to="/Register">
        <button>新規登録</button>
      </Link>
    </div>
  );
}
