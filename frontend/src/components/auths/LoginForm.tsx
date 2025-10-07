import { useRef, type FormEvent } from 'react';
import { Link } from 'react-router-dom';

export default function LoginForm() {
  const loginIdRef = useRef<HTMLInputElement>(null);
  const loginPassRef = useRef<HTMLInputElement>(null);

  const submitData = (e: FormEvent) => {
    e.preventDefault();

    const loginId = loginIdRef.current?.value;
    const loginPass = loginPassRef.current?.value;

    console.log(loginId);
    console.log(loginPass);
  };

  return (
    <form onSubmit={submitData}>
      <div className="mb-3">
        ログイン ID:
        <input type="text" className="ms-3" ref={loginIdRef} />
      </div>
      <div className="mb-3">
        パスワード:
        <input type="password" className="ms-3" ref={loginPassRef} />
      </div>
      <input type="submit" className="" value="ログイン" />
      <Link to="/resetPass">パスワードリセット</Link>
    </form>
  );
}
