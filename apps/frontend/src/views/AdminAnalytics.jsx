import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';

const API = import.meta.env.VITE_API_URL ?? '';

const Bar = ({ value, max, color = 'bg-primary' }) => (
  <div className="w-full h-2 bg-surface-container-high rounded-full overflow-hidden">
    <div
      className={`h-full ${color} rounded-full transition-all duration-700`}
      style={{ width: max > 0 ? `${(value / max) * 100}%` : '0%' }}
    />
  </div>
);

const STATUS_COLORS = {
  pending: 'bg-surface-container-highest',
  processing: 'bg-tertiary',
  shipped: 'bg-blue-400',
  delivered: 'bg-green-400',
  cancelled: 'bg-error',
};

const AdminAnalytics = () => {
  const { authFetch } = useAuth();
  const [stats, setStats]     = useState(null);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod]   = useState('week');

  useEffect(() => {
    setLoading(true);
    authFetch(`${API}/api/admin/analytics?period=${period}`)
      .then(r => r.json())
      .then(d => setStats(d))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [period]);

  const maxRevenue = stats?.revenueByPeriod
    ? Math.max(...stats.revenueByPeriod.map(p => p.revenue), 1)
    : 1;

  const maxOrders = stats?.ordersByPeriod
    ? Math.max(...stats.ordersByPeriod.map(p => p.count), 1)
    : 1;

  const totalOrdersByStatus = stats?.ordersByStatus
    ? Object.values(stats.ordersByStatus).reduce((a, b) => a + b, 0)
    : 1;

  return (
    <main className="min-h-screen bg-surface-container-low flex flex-col w-full">
      <header className="h-20 px-10 flex items-center justify-between bg-surface/50 backdrop-blur-md sticky top-0 z-40 border-b border-outline-variant/10">
        <div>
          <h2 className="font-headline font-bold text-2xl tracking-tight">Analytics</h2>
          <p className="text-xs font-mono text-on-surface-variant">/root/admin/analytics</p>
        </div>
        <div className="flex gap-1 p-1 bg-surface-container rounded-xl border border-outline-variant/10">
          {['week', 'month'].map(p => (
            <button key={p} onClick={() => setPeriod(p)}
              className={`px-4 py-1.5 rounded-lg text-xs font-mono transition-all ${period === p ? 'bg-primary-container text-on-primary-container' : 'text-on-surface-variant hover:text-on-surface'}`}>
              {p === 'week' ? 'Semana' : 'Mes'}
            </button>
          ))}
        </div>
      </header>

      <div className="p-10 max-w-6xl space-y-8">
        {loading ? (
          <div className="flex justify-center py-20">
            <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          </div>
        ) : (
          <>
            {/* KPI cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {[
                { label: 'Revenue Total', value: `$${Number(stats?.totalRevenue ?? 0).toFixed(2)}`, icon: 'payments', color: 'text-primary' },
                { label: 'Pedidos', value: stats?.totalOrders ?? 0, icon: 'receipt_long', color: 'text-tertiary' },
                { label: 'Usuarios Nuevos', value: stats?.newUsers ?? 0, icon: 'person_add', color: 'text-blue-400' },
                { label: 'Tasa Conversión', value: `${stats?.conversionRate ?? 0}%`, icon: 'trending_up', color: 'text-green-400' },
              ].map(({ label, value, icon, color }) => (
                <div key={label} className="bg-surface rounded-xl shadow-2xl p-6 relative overflow-hidden">
                  <span className={`material-symbols-outlined absolute top-4 right-4 text-4xl opacity-10 ${color}`}>{icon}</span>
                  <p className="text-xs font-mono uppercase tracking-widest text-on-surface-variant mb-2">{label}</p>
                  <p className={`text-3xl font-headline font-black ${color}`}>{value}</p>
                </div>
              ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Revenue chart */}
              <section className="bg-surface rounded-xl shadow-2xl p-6 space-y-5">
                <h3 className="font-headline font-bold text-sm uppercase tracking-widest text-on-surface-variant">Ventas por Período</h3>
                {stats?.revenueByPeriod?.length > 0 ? (
                  <div className="space-y-3">
                    {stats.revenueByPeriod.map((p, i) => (
                      <div key={i} className="space-y-1.5">
                        <div className="flex items-center justify-between text-xs">
                          <span className="font-mono text-on-surface-variant">{p.label}</span>
                          <span className="font-mono font-bold text-primary">${Number(p.revenue).toFixed(2)}</span>
                        </div>
                        <Bar value={p.revenue} max={maxRevenue} />
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-on-surface-variant text-center py-8">Sin datos</p>
                )}
              </section>

              {/* Orders chart */}
              <section className="bg-surface rounded-xl shadow-2xl p-6 space-y-5">
                <h3 className="font-headline font-bold text-sm uppercase tracking-widest text-on-surface-variant">Pedidos por Período</h3>
                {stats?.ordersByPeriod?.length > 0 ? (
                  <div className="space-y-3">
                    {stats.ordersByPeriod.map((p, i) => (
                      <div key={i} className="space-y-1.5">
                        <div className="flex items-center justify-between text-xs">
                          <span className="font-mono text-on-surface-variant">{p.label}</span>
                          <span className="font-mono font-bold text-tertiary">{p.count}</span>
                        </div>
                        <Bar value={p.count} max={maxOrders} color="bg-tertiary" />
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-on-surface-variant text-center py-8">Sin datos</p>
                )}
              </section>

              {/* Orders by status (pie-like) */}
              <section className="bg-surface rounded-xl shadow-2xl p-6 space-y-5">
                <h3 className="font-headline font-bold text-sm uppercase tracking-widest text-on-surface-variant">Pedidos por Estado</h3>
                {stats?.ordersByStatus ? (
                  <div className="space-y-3">
                    {Object.entries(stats.ordersByStatus).map(([status, count]) => {
                      const pct = totalOrdersByStatus > 0 ? Math.round((count / totalOrdersByStatus) * 100) : 0;
                      const bg = STATUS_COLORS[status] || 'bg-surface-container-high';
                      return (
                        <div key={status} className="flex items-center gap-3">
                          <div className={`w-2 h-2 rounded-full ${bg} flex-shrink-0`} />
                          <span className="text-xs font-mono text-on-surface-variant capitalize flex-1">{status}</span>
                          <div className="flex-1 h-1.5 bg-surface-container-high rounded-full overflow-hidden">
                            <div className={`h-full ${bg} rounded-full transition-all duration-700`} style={{ width: `${pct}%` }} />
                          </div>
                          <span className="text-xs font-mono text-on-surface-variant w-8 text-right">{count}</span>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <p className="text-sm text-on-surface-variant text-center py-8">Sin datos</p>
                )}
              </section>

              {/* Top 5 products */}
              <section className="bg-surface rounded-xl shadow-2xl p-6 space-y-5">
                <h3 className="font-headline font-bold text-sm uppercase tracking-widest text-on-surface-variant">Top 5 Productos</h3>
                {stats?.topProducts?.length > 0 ? (
                  <div className="space-y-4">
                    {stats.topProducts.map((p, i) => (
                      <div key={p.id} className="flex items-center gap-3">
                        <span className="font-mono text-xs text-primary/40 w-4">{i + 1}</span>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-bold text-on-surface truncate">{p.name}</p>
                          <p className="text-xs text-on-surface-variant font-mono">{p.sold} vendidos · ${Number(p.revenue).toFixed(2)}</p>
                        </div>
                        <Bar value={p.sold} max={stats.topProducts[0]?.sold || 1} />
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-on-surface-variant text-center py-8">Sin datos</p>
                )}
              </section>
            </div>
          </>
        )}
      </div>
    </main>
  );
};

export default AdminAnalytics;
