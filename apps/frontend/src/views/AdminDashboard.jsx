import { Link, useLocation } from 'react-router-dom';

const sidebarLinks = [
  { path: '/admin', label: 'Products', icon: 'inventory_2' },
  { path: '/admin/orders', label: 'Orders', icon: 'shopping_bag' },
  { path: '/admin/blog', label: 'Blog', icon: 'article' },
  { path: '/admin-settings', label: 'Settings', icon: 'settings' },
];

const stats = [
  { label: 'Total Sales', value: '$142,840.50', sub: '+12.4% FROM LAST MONTH', subIcon: 'trending_up', subColor: 'text-tertiary', bgIcon: 'payments', border: false },
  { label: 'Orders Today', value: '42', sub: '8 PENDING SHIPMENT', subIcon: 'schedule', subColor: 'text-on-surface-variant', bgIcon: 'shopping_cart', border: false },
  { label: 'Stock Alerts', value: '03', sub: 'LOW STOCK ON SPLIT V1', subIcon: 'error', subColor: 'text-error', bgIcon: 'warning', border: true },
];

const inventory = [
  { name: 'Split v1 Keyboard', stock: 12, price: '$349', status: 'Backordered', statusColor: 'text-error border-error/30 bg-error/10' },
  { name: 'Tactician Pro Kit', stock: 142, price: '$129', status: 'Active', statusColor: 'text-green-400 border-green-500/30 bg-green-500/10' },
  { name: 'Mono Switch Pack 70', stock: 45, price: '$55', status: 'Active', statusColor: 'text-green-400 border-green-500/30 bg-green-500/10' },
];

const orders = [
  { id: '#TL-2941', customer: 'Alex M.', amount: '$349.00', status: 'Shipped', statusColor: 'text-green-400 bg-green-400/10' },
  { id: '#TL-2940', customer: 'Jordan R.', amount: '$129.00', status: 'Processing', statusColor: 'text-tertiary bg-tertiary/10' },
  { id: '#TL-2939', customer: 'Sam T.', amount: '$404.00', status: 'Pending', statusColor: 'text-on-surface-variant bg-surface-container-highest' },
];

const AdminDashboard = () => {
  const location = useLocation();

  return (
    <div className="flex bg-surface min-h-screen text-on-surface">
      {/* Sidebar */}
      <aside className="h-screen w-64 fixed left-0 top-0 bg-[#131315] flex flex-col border-r border-primary/15 z-50">
        <div className="p-8">
          <h1 className="text-primary font-bold text-lg font-headline tracking-tight">Trebor Admin</h1>
          <p className="font-mono text-[10px] tracking-widest text-on-surface-variant/60 uppercase mt-1">Technical Tactician</p>
        </div>
        <nav className="flex-1 mt-4">
          {sidebarLinks.map((link) => {
            const isActive = location.pathname === link.path;
            return (
              <Link
                key={link.path}
                to={link.path}
                className={`flex items-center gap-3 px-6 py-4 transition-all no-underline ${
                  isActive
                    ? 'bg-primary-container/20 text-primary border-r-4 border-primary scale-105'
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
            <div className="w-8 h-8 rounded-full bg-primary-container flex items-center justify-center">
              <span className="text-white font-bold text-sm">R</span>
            </div>
            <div>
              <p className="text-xs font-bold text-on-surface">Trebor Labs</p>
              <p className="text-[10px] text-on-surface-variant">System Lead</p>
            </div>
          </div>
          <button className="w-full bg-gradient-to-br from-primary to-primary-container text-on-primary py-3 rounded-md font-headline font-bold text-xs uppercase tracking-widest shadow-[0_0_15px_rgba(214,186,255,0.2)] active:scale-95 transition-all">
            New Product
          </button>
        </div>
      </aside>

      {/* Content */}
      <main className="ml-64 min-h-screen bg-surface-container-low flex flex-col w-full">
        {/* Top Bar */}
        <header className="h-20 px-10 flex items-center justify-between bg-surface/50 backdrop-blur-md sticky top-0 z-40">
          <div>
            <h2 className="font-headline font-bold text-2xl text-on-surface tracking-tight">Dashboard Overview</h2>
            <p className="text-xs font-mono text-on-surface-variant">/root/admin/inventory_v4</p>
          </div>
          <div className="flex items-center gap-6">
            <div className="relative">
              <span className="material-symbols-outlined text-on-surface-variant hover:text-primary cursor-pointer transition-colors">notifications</span>
              <span className="absolute -top-1 -right-1 w-2 h-2 bg-primary rounded-full"></span>
            </div>
            <div className="h-8 w-[1px] bg-outline-variant/30"></div>
            <span className="material-symbols-outlined text-on-surface-variant hover:text-primary cursor-pointer transition-colors">search</span>
            <span className="material-symbols-outlined text-on-surface-variant hover:text-primary cursor-pointer transition-colors">language</span>
          </div>
        </header>

        <div className="p-10 space-y-8 overflow-y-auto">
          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {stats.map((stat) => (
              <div key={stat.label} className={`bg-surface-container-high p-6 rounded-xl relative overflow-hidden group ${stat.border ? 'border border-error/20' : ''}`}>
                <div className="absolute top-0 right-0 p-4 opacity-10">
                  <span className={`material-symbols-outlined text-6xl ${stat.border ? 'text-error' : ''}`}>{stat.bgIcon}</span>
                </div>
                <p className={`text-xs font-mono tracking-widest uppercase mb-2 ${stat.border ? 'text-error/80' : 'text-on-surface-variant'}`}>{stat.label}</p>
                <h3 className={`text-3xl font-headline font-black ${stat.border ? 'text-on-surface' : stat.label === 'Total Sales' ? 'text-primary' : 'text-on-surface'}`}>{stat.value}</h3>
                <div className={`mt-4 flex items-center gap-2 text-[10px] font-mono ${stat.subColor}`}>
                  <span className="material-symbols-outlined text-xs">{stat.subIcon}</span>
                  <span>{stat.sub}</span>
                </div>
              </div>
            ))}
          </div>

          {/* Inventory Table */}
          <section className="bg-surface p-8 rounded-xl shadow-2xl">
            <div className="flex justify-between items-center mb-8">
              <div>
                <h3 className="font-headline font-bold text-xl tracking-tight">Product Inventory</h3>
                <p className="text-xs font-mono text-on-surface-variant mt-1">3 active products</p>
              </div>
              <button className="flex items-center gap-2 bg-surface-container-high px-4 py-2 rounded-lg text-xs font-mono hover:bg-surface-container-highest transition-colors">
                <span className="material-symbols-outlined text-sm">filter_list</span> Filter
              </button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-outline-variant/20">
                    {['Product', 'Stock', 'Price', 'Status', 'Actions'].map((h) => (
                      <th key={h} className="text-left pb-4 text-[10px] font-mono tracking-widest text-on-surface-variant uppercase">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-outline-variant/10">
                  {inventory.map((item) => (
                    <tr key={item.name} className="hover:bg-surface-container-low transition-colors group">
                      <td className="py-5 font-headline font-bold text-sm">{item.name}</td>
                      <td className="py-5">
                        <span className={`font-mono text-sm ${item.stock < 20 ? 'text-error' : 'text-on-surface'}`}>{item.stock}</span>
                        <span className="text-on-surface-variant text-xs ml-1">units</span>
                      </td>
                      <td className="py-5 font-mono text-primary font-medium">{item.price}</td>
                      <td className="py-5">
                        <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest border ${item.statusColor}`}>{item.status}</span>
                      </td>
                      <td className="py-5">
                        <div className="flex items-center gap-3 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button className="text-on-surface-variant hover:text-primary transition-colors">
                            <span className="material-symbols-outlined text-sm">edit</span>
                          </button>
                          <button className="text-on-surface-variant hover:text-error transition-colors">
                            <span className="material-symbols-outlined text-sm">delete</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          {/* Recent Orders */}
          <section className="bg-surface p-8 rounded-xl shadow-2xl">
            <div className="flex justify-between items-center mb-8">
              <h3 className="font-headline font-bold text-xl tracking-tight">Recent Orders</h3>
              <a href="#" className="text-primary font-mono text-xs tracking-widest hover:underline flex items-center gap-1">
                VIEW ALL <span className="material-symbols-outlined text-sm">arrow_forward</span>
              </a>
            </div>
            <div className="space-y-4">
              {orders.map((order) => (
                <div key={order.id} className="flex items-center justify-between p-4 bg-surface-container-low rounded-lg hover:bg-surface-container-high transition-colors">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-primary-container/20 rounded-lg flex items-center justify-center">
                      <span className="material-symbols-outlined text-primary text-sm">receipt</span>
                    </div>
                    <div>
                      <p className="font-mono text-sm font-bold text-primary">{order.id}</p>
                      <p className="text-xs text-on-surface-variant">{order.customer}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-6">
                    <span className="font-mono font-bold">{order.amount}</span>
                    <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest ${order.statusColor}`}>{order.status}</span>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>
      </main>
    </div>
  );
};

export default AdminDashboard;
