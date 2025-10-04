import { Outlet } from "react-router-dom";
import UserNavi from "../../components/UserNavi";

export default function UserLayout() {
  return (
    <div>
      <UserNavi />
      <Outlet />
    </div>
  );
}
