import { Outlet } from 'react-router-dom';
import UserNavi from '../../components/header/UserNavi';

export default function UserLayout() {
  return (
    <div>
      <UserNavi />
      <Outlet />
    </div>
  );
}
