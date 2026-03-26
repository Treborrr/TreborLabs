import { Outlet } from 'react-router-dom';
import AdminSidebar from './AdminSidebar';

const AdminLayout = () => (
  <div className="flex bg-surface min-h-screen text-on-surface">
    <AdminSidebar />
    <div className="ml-64 min-h-screen bg-surface-container-low flex flex-col w-full">
      <Outlet />
    </div>
  </div>
);

export default AdminLayout;
