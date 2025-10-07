import { Outlet } from 'react-router-dom';
import AdminNavi from '../../components/header/AdminNavi';

export default function AdminLayout() {
  return (
    <div>
      <AdminNavi />
      <Outlet />
    </div>
  );
}
