import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';

const sidebarLinks = [
  { path: '/admin', label: 'Products', icon: 'inventory_2' },
  { path: '/admin/orders', label: 'Orders', icon: 'shopping_bag' },
  { path: '/admin/blog', label: 'Blog', icon: 'article' },
  { path: '/admin-settings', label: 'Settings', icon: 'settings' },
];

const allOrders = [
  { id: '#TL-2941', customer: 'Alex M.', email: 'alex@mail.com', product: 'Split v1 Keyboard', amount: '$349.00', date: '25 Mar 2026', status: 'Shipped' },
  { id: '#TL-2940', customer: 'Jordan R.', email: 'jordan@mail.com', product: 'Tactician Pro Kit', amount: '$129.00', date: '25 Mar 2026', status: 'Processing' },
  { id: '#TL-2939', customer: 'Sam T.', email: 'sam@mail.com', product: 'Ghost PCB Edition', amount: '$550.00', date: '24 Mar 2026', status: 'Pending' },
  { id: '#TL-2938', customer: 'Maria L.', email: 'maria@mail.com', product: 'Pro Pi 5 Starter Kit', amount: '$124.00', date: '24 Mar 2026', status: 'Delivered' },
  { id: '#TL-2937', customer: 'Carlos V.', email: 'carlos@mail.com', product: 'Neon Tactile 65%', amount: '$189.00', date: '23 Mar 2026', status: 'Delivered' },
  { id: '#TL-2936', customer: 'Ana P.', email: 'ana@mail.com', product: 'Ortho Alpha X', amount: '$420.00', date: '23 Mar 2026', status: 'Cancelled' },
  { id: '#TL-2935', customer: 'Diego F.', email: 'diego@mail.com', product: 'Pi 5 NAS Server Kit', amount: '$189.00', date: '22 Mar 2026', status: 'Shipped' },
  { id: '#TL-2934', customer: 'Lucia M.', email: 'lucia@mail.com', product: 'Aviator Coiled Cable', amount: '$45.00', date: '22 Mar 2026', status: 'Delivered' },
];

const statusStyles = {
  Shipped:    'text-blue-400 bg-blue-400/10 border-blue-400/30',
  Processing: 'text-tertiary bg-tertiary/10 border-tertiary/30',
  Pending:    'text-on-surface-variant bg-surface-container-highest border-outline-variant/30',
  Delivered:  'text-green-400 bg-green-400/10 border-green-400/30',
  Cancelled:  'text-error bg-error/10 border-error/30',
};

const tabs = ['Todos', 'Pending', 'Processing', 'Shipped', 'Delivered', 'Cancelled'];

const AdminOrders = () => {
  const location = useLocation();
  const [activeTab, setActiveTab] = useState('Todos');
  const [search, setSearch] = useState('');

  const filtered = allOrders.filter(o => {
    const matchTab = activeTab === 'Todos' || o.status === activeTab;
    const matchSearch = o.id.toLowerCase().includes(search.toLowerCase()) ||
      o.customer.toLowerCase().includes(search.toLowerCase()) ||
      o.product.toLowerCase().includes(search.toLowerCase());
    return matchTab && matchSearch;
  });

  const counts = tabs.reduce((acc, t) => {
    acc[t] = t === 'Todos' ? allOrders.length : allOrders.filter(o => o.status === t).length;
    return acc;
  }, {});

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
            <div className="w-8 h-8 rounded-full bg-primary-container flex items-center justify-center">
              <span className="text-white font-bold text-sm">R</span>
            </div>
            <div>
              <p className="text-xs font-bold text-on-surface">Trebor Labs</p>
              <p className="text-[10px] text-on-surface-variant">System Lead</p>
            </div>
          </div>
        </div>
      </aside>

      {/* Content */}
      <main className="ml-64 min-h-screen bg-surface-container-low flex flex-col w-full">
        <header className="h-20 px-10 flex items-center justify-between bg-surface/50 backdrop-blur-md sticky top-0 z-40">
          <div>
            <h2 className="font-headline font-bold text-2xl text-on-surface tracking-tight">Order Management</h2>
            <p className="text-xs font-mono text-on-surface-variant">/root/admin/orders_v4</p>
          </div>
          <button className="flex items-center gap-2 bg-surface-container-high px-4 py-2.5 rounded-lg text-xs font-mono hover:bg-surface-container-highest transition-colors">
            <span className="material-symbols-outlined text-sm">download</span>
            Exportar CSV
          </button>
        </header>

        <div className="p-10 space-y-8">
          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {[
              { label: 'Total Pedidos', value: allOrders.length, icon: 'receipt_long', color: 'text-on-surface' },
              { label: 'Enviados', value: allOrders.filter(o => o.status === 'Shipped').length, icon: 'local_shipping', color: 'text-blue-400' },
              { label: 'Pendientes', value: allOrders.filter(o => o.status === 'Pending').length, icon: 'schedule', color: 'text-on-surface-variant' },
              { label: 'Entregados', value: allOrders.filter(o => o.status === 'Delivered').length, icon: 'check_circle', color: 'text-green-400' },
            ].map(({ label, value, icon, color }) => (
              <div key={label} className="bg-surface-container-high p-5 rounded-xl relative overflow-hidden">
                <span className={`material-symbols-outlined absolute top-3 right-3 text-3xl opacity-10 ${color}`}>{icon}</span>
                <p className="text-xs font-mono tracking-widest uppercase text-on-surface-variant mb-2">{label}</p>
                <p className={`text-3xl font-headline font-black ${color}`}>{value}</p>
              </div>
            ))}
          </div>

          {/* Table section */}
          <section className="bg-surface p-8 rounded-xl shadow-2xl">
            {/* Search + Tabs */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-8">
              <div className="relative flex items-center bg-surface-container-high rounded-lg overflow-hidden focus-within:ring-1 ring-primary/40 transition-all">
                <span className="material-symbols-outlined absolute left-3 text-on-surface-variant text-sm">search</span>
                <input
                  className="bg-transparent border-none py-2.5 pl-10 pr-4 text-sm text-on-surface focus:ring-0 placeholder:text-on-surface-variant/50 w-64"
                  placeholder="Buscar pedido o cliente..."
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                />
              </div>
              <div className="flex gap-1 p-1 bg-surface-container rounded-xl border border-outline-variant/10 overflow-x-auto no-scrollbar">
                {tabs.map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`px-4 py-2 rounded-lg text-xs font-medium whitespace-nowrap transition-all ${activeTab === tab ? 'bg-primary-container text-on-primary-container shadow' : 'text-on-surface-variant hover:text-on-surface'}`}
                  >
                    {tab} {counts[tab] > 0 && <span className="ml-1 opacity-60">({counts[tab]})</span>}
                  </button>
                ))}
              </div>
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-outline-variant/20">
                    {['Pedido', 'Cliente', 'Producto', 'Monto', 'Fecha', 'Estado', 'Acciones'].map((h) => (
                      <th key={h} className="text-left pb-4 text-[10px] font-mono tracking-widest text-on-surface-variant uppercase pr-4">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-outline-variant/10">
                  {filtered.map((order) => (
                    <tr key={order.id} className="hover:bg-surface-container-low transition-colors group">
                      <td className="py-4 pr-4">
                        <span className="font-mono text-sm font-bold text-primary">{order.id}</span>
                      </td>
                      <td className="py-4 pr-4">
                        <p className="font-headline font-bold text-sm">{order.customer}</p>
                        <p className="text-xs text-on-surface-variant">{order.email}</p>
                      </td>
                      <td className="py-4 pr-4">
                        <span className="text-sm text-on-surface-variant">{order.product}</span>
                      </td>
                      <td className="py-4 pr-4">
                        <span className="font-mono font-bold text-sm text-on-surface">{order.amount}</span>
                      </td>
                      <td className="py-4 pr-4">
                        <span className="font-mono text-xs text-on-surface-variant">{order.date}</span>
                      </td>
                      <td className="py-4 pr-4">
                        <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest border ${statusStyles[order.status]}`}>
                          {order.status}
                        </span>
                      </td>
                      <td className="py-4">
                        <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button className="text-on-surface-variant hover:text-primary transition-colors" title="Ver detalles">
                            <span className="material-symbols-outlined text-sm">visibility</span>
                          </button>
                          <button className="text-on-surface-variant hover:text-primary transition-colors" title="Editar">
                            <span className="material-symbols-outlined text-sm">edit</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {filtered.length === 0 && (
                <div className="text-center py-16 text-on-surface-variant">
                  <span className="material-symbols-outlined text-4xl mb-3 block">search_off</span>
                  <p className="font-mono text-sm">Sin pedidos para este filtro</p>
                </div>
              )}
            </div>
          </section>
        </div>
      </main>
    </div>
  );
};

export default AdminOrders;
