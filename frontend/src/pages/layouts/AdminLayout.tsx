import { Outlet } from "react-router-dom";
import AdminNavi from "../../components/AdminNavi";

export default function AdminLayout() {
  return (
    <div>
      <AdminNavi />
      <Outlet />
    </div>
  );
}
