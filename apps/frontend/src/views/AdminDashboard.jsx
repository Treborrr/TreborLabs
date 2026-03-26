import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const API = import.meta.env.VITE_API_URL ?? '';

const statusColors = {
  pending:    'text-on-surface-variant bg-surface-container-highest',
  processing: 'text-tertiary bg-tertiary/10',
  shipped:    'text-green-400 bg-green-400/10',
  delivered:  'text-green-400 bg-green-400/10',
  cancelled:  'text-error bg-error/10',
};

const AdminDashboard = () => {
  const { authFetch } = useAuth();
  const [stats, setStats]   = useState(null);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const [statsRes, ordersRes] = await Promise.all([
          authFetch(`${API}/api/admin/stats`),
          authFetch(`${API}/api/admin/orders?limit=5`),
        ]);
        const statsData  = await statsRes.json();
        const ordersData = await ordersRes.json();
        setStats(statsData);
        setOrders(ordersData.orders || []);
      } catch {
        // continue with null stats
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const formatCurrency = (n) =>
    n != null ? `$${Number(n).toLocaleString('en-US', { minimumFractionDigits: 2 })}` : '—';

  return (
    <main className="min-h-screen bg-surface-container-low flex flex-col w-full">
        {/* Top Bar */}
        <header className="h-20 px-4 md:px-10 flex items-center justify-between bg-surface/50 backdrop-blur-md sticky top-0 z-40">
          <div>
            <h2 className="font-headline font-bold text-2xl text-on-surface tracking-tight">Dashboard Overview</h2>
            <p className="text-xs font-mono text-on-surface-variant">/root/admin/dashboard</p>
          </div>
          <div className="flex items-center gap-6">
            <div className="relative">
              <span className="material-symbols-outlined text-on-surface-variant hover:text-primary cursor-pointer transition-colors">notifications</span>
              {stats?.pendingOrders > 0 && (
                <span className="absolute -top-1 -right-1 w-2 h-2 bg-primary rounded-full"></span>
              )}
            </div>
            <div className="h-8 w-[1px] bg-outline-variant/30"></div>
            <span className="material-symbols-outlined text-on-surface-variant hover:text-primary cursor-pointer transition-colors">search</span>
          </div>
        </header>

        <div className="p-4 md:p-10 space-y-8 overflow-y-auto">
          {loading ? (
            <div className="flex justify-center py-24">
              <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
            </div>
          ) : (
            <>
              {/* Stats Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div className="bg-surface-container-high p-6 rounded-xl relative overflow-hidden">
                  <div className="absolute top-0 right-0 p-4 opacity-10">
                    <span className="material-symbols-outlined text-6xl">payments</span>
                  </div>
                  <p className="text-xs font-mono tracking-widest uppercase mb-2 text-on-surface-variant">Total Revenue</p>
                  <h3 className="text-3xl font-headline font-black text-primary">{formatCurrency(stats?.totalRevenue)}</h3>
                  <div className="mt-4 flex items-center gap-2 text-[10px] font-mono text-tertiary">
                    <span className="material-symbols-outlined text-xs">payments</span>
                    <span>{stats?.totalOrders ?? 0} PEDIDOS EN TOTAL</span>
                  </div>
                </div>

                <div className="bg-surface-container-high p-6 rounded-xl relative overflow-hidden">
                  <div className="absolute top-0 right-0 p-4 opacity-10">
                    <span className="material-symbols-outlined text-6xl">shopping_cart</span>
                  </div>
                  <p className="text-xs font-mono tracking-widest uppercase mb-2 text-on-surface-variant">Pedidos Pendientes</p>
                  <h3 className="text-3xl font-headline font-black text-on-surface">{stats?.pendingOrders ?? 0}</h3>
                  <div className="mt-4 flex items-center gap-2 text-[10px] font-mono text-on-surface-variant">
                    <span className="material-symbols-outlined text-xs">schedule</span>
                    <span>{stats?.totalProducts ?? 0} PRODUCTOS EN CATÁLOGO</span>
                  </div>
                </div>

                <div className={`bg-surface-container-high p-6 rounded-xl relative overflow-hidden ${stats?.stockAlerts?.length > 0 ? 'border border-error/20' : ''}`}>
                  <div className="absolute top-0 right-0 p-4 opacity-10">
                    <span className={`material-symbols-outlined text-6xl ${stats?.stockAlerts?.length > 0 ? 'text-error' : ''}`}>warning</span>
                  </div>
                  <p className={`text-xs font-mono tracking-widest uppercase mb-2 ${stats?.stockAlerts?.length > 0 ? 'text-error/80' : 'text-on-surface-variant'}`}>Stock Alerts</p>
                  <h3 className="text-3xl font-headline font-black text-on-surface">
                    {String(stats?.stockAlerts?.length ?? 0).padStart(2, '0')}
                  </h3>
                  <div className={`mt-4 flex items-center gap-2 text-[10px] font-mono ${stats?.stockAlerts?.length > 0 ? 'text-error' : 'text-on-surface-variant'}`}>
                    <span className="material-symbols-outlined text-xs">error</span>
                    <span>{stats?.stockAlerts?.length > 0 ? 'PRODUCTOS CON STOCK BAJO' : 'TODO EN ORDEN'}</span>
                  </div>
                </div>
              </div>

              {/* Stock Alerts */}
              {stats?.stockAlerts?.length > 0 && (
                <section className="bg-surface p-8 rounded-xl shadow-2xl border border-error/10">
                  <div className="flex justify-between items-center mb-6">
                    <div>
                      <h3 className="font-headline font-bold text-xl tracking-tight text-error">Stock Alerts</h3>
                      <p className="text-xs font-mono text-on-surface-variant mt-1">Productos con menos de 5 unidades</p>
                    </div>
                    <Link to="/admin/products" className="text-primary font-mono text-xs tracking-widest hover:underline flex items-center gap-1 no-underline">
                      GESTIONAR <span className="material-symbols-outlined text-sm">arrow_forward</span>
                    </Link>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-outline-variant/20">
                          {['Producto', 'Stock'].map(h => (
                            <th key={h} className="text-left pb-3 text-[10px] font-mono tracking-widest text-on-surface-variant uppercase">{h}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-outline-variant/10">
                        {stats.stockAlerts.map(item => (
                          <tr key={item.id} className="hover:bg-surface-container-low transition-colors">
                            <td className="py-3 font-headline font-bold text-sm">{item.name}</td>
                            <td className="py-3">
                              <span className="font-mono text-sm text-error">{item.stock}</span>
                              <span className="text-on-surface-variant text-xs ml-1">units</span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </section>
              )}

              {/* Recent Orders */}
              <section className="bg-surface p-8 rounded-xl shadow-2xl">
                <div className="flex justify-between items-center mb-8">
                  <h3 className="font-headline font-bold text-xl tracking-tight">Recent Orders</h3>
                  <Link to="/admin/orders" className="text-primary font-mono text-xs tracking-widest hover:underline flex items-center gap-1 no-underline">
                    VIEW ALL <span className="material-symbols-outlined text-sm">arrow_forward</span>
                  </Link>
                </div>
                {orders.length > 0 ? (
                  <div className="space-y-4">
                    {orders.map(order => (
                      <div key={order.id} className="flex flex-col md:flex-row md:items-center justify-between p-4 bg-surface-container-low rounded-lg hover:bg-surface-container-high transition-colors gap-4">
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 bg-primary-container/20 rounded-lg flex items-center justify-center shrink-0">
                            <span className="material-symbols-outlined text-primary text-sm">receipt</span>
                          </div>
                          <div>
                            <p className="font-mono text-sm font-bold text-primary">#{order.id.slice(-6).toUpperCase()}</p>
                            <p className="text-xs text-on-surface-variant">{order.user?.name || order.user?.email || 'Guest'}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-6">
                          <span className="font-mono font-bold">{formatCurrency(order.total)}</span>
                          <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest ${statusColors[order.status] || ''}`}>
                            {order.status}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12 text-on-surface-variant">
                    <span className="material-symbols-outlined text-4xl mb-3 block">receipt_long</span>
                    <p className="font-mono text-sm">Sin pedidos aún</p>
                  </div>
                )}
              </section>
            </>
          )}
        </div>
    </main>
  );
};

export default AdminDashboard;
