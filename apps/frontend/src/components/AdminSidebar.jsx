import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const sidebarLinks = [
  // ── Overview ──────────────────────────────
  { path: '/admin',           label: 'Dashboard',  icon: 'dashboard',         exact: true },
  { path: '/admin/analytics', label: 'Analytics',  icon: 'bar_chart' },
  // ── Ventas ────────────────────────────────
  { path: '/admin/orders',    label: 'Orders',     icon: 'shopping_bag' },
  { path: '/admin/returns',   label: 'Returns',    icon: 'assignment_return' },
  { path: '/admin/coupons',   label: 'Coupons',    icon: 'local_offer' },
  { path: '/admin/shipping',  label: 'Shipping',   icon: 'local_shipping' },
  // ── Catálogo ──────────────────────────────
  { path: '/admin/products',  label: 'Productos',  icon: 'inventory_2' },
  // ── Comunidad ─────────────────────────────
  { path: '/admin/blog',      label: 'Blog',       icon: 'article' },
  { path: '/admin/comments',  label: 'Comments',   icon: 'comment' },
  { path: '/admin/users',     label: 'Users',      icon: 'group' },
  // ── Sistema ───────────────────────────────
  { path: '/admin/logs',      label: 'Logs',       icon: 'history' },
  { path: '/admin/settings',  label: 'Settings',   icon: 'settings' },
];

const AdminSidebar = () => {
  const location = useLocation();
  const { user } = useAuth();

  return (
    <aside className="h-screen w-64 fixed left-0 top-0 bg-[#131315] flex flex-col border-r border-primary/15 z-50">
      <div className="p-6 pb-4">
        <Link to="/" className="flex items-center gap-3 no-underline group mb-1">
          <div className="relative w-8 h-8 group-hover:scale-110 transition-transform duration-300 flex-shrink-0">
            <img src="/logo.png" alt="Trebor Labs" className="w-full h-full object-contain relative z-10" />
            <div className="logo-ring-base" aria-hidden="true" />
            <div className="logo-tracer-ring" aria-hidden="true" />
          </div>
          <span className="text-primary font-bold text-base font-headline tracking-tight">Trebor Labs</span>
        </Link>
        <p className="font-mono text-[10px] tracking-widest text-on-surface-variant/60 uppercase pl-11">Admin Panel</p>
      </div>
      <nav className="flex-1 mt-4">
        {sidebarLinks.map((link) => {
          const isActive = link.exact
            ? location.pathname === link.path
            : location.pathname.startsWith(link.path);
          return (
            <Link
              key={link.path}
              to={link.path}
              className={`flex items-center gap-3 px-6 py-4 transition-all no-underline ${
                isActive
                  ? 'bg-primary-container/20 text-primary border-r-4 border-primary'
                  : 'text-gray-500 hover:bg-surface-container-high hover:text-white'
              }`}
            >
              <span className="material-symbols-outlined">{link.icon}</span>
              <span className="font-mono text-xs tracking-widest">{link.label}</span>
            </Link>
          );
        })}
      </nav>
      <div className="p-6 mt-auto">
        <div className="flex items-center gap-3 mb-6 px-2">
          <div className="w-8 h-8 rounded-full bg-primary-container flex items-center justify-center overflow-hidden">
            {user?.avatar
              ? <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" />
              : <span className="text-white font-bold text-sm">{user?.name?.[0]?.toUpperCase() || 'A'}</span>
            }
          </div>
          <div>
            <p className="text-xs font-bold text-on-surface truncate max-w-[100px]">{user?.name || 'Admin'}</p>
            <p className="text-[10px] text-on-surface-variant">System Lead</p>
          </div>
        </div>
      </div>
    </aside>
  );
};

export default AdminSidebar;
