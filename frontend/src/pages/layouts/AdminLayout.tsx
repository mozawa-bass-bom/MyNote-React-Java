import { Outlet, Navigate, useLocation } from 'react-router-dom';
import AdminNavi from '../../components/header/AdminNavi';
import { useAtomValue } from 'jotai';
import { loginUserAtom } from '../../states/UserAtom';

export default function AdminLayout() {
  const loginUser = useAtomValue(loginUserAtom);
  const location = useLocation();

  if (!loginUser) {
    return <Navigate to="/" state={{ from: location }} replace />;
  }

  return (
    <div>
      <AdminNavi />
      <Outlet />
    </div>
  );
}
