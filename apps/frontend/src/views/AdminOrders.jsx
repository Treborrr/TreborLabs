import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import InfoTooltip from '../components/InfoTooltip';
import { ORDER_TOOLTIPS } from '../constants/adminTooltips';

const API = import.meta.env.VITE_API_URL ?? '';

const STATUS_STYLES = {
  pending:    'text-on-surface-variant bg-surface-container-highest border-outline-variant/30',
  processing: 'text-tertiary bg-tertiary/10 border-tertiary/30',
  shipped:    'text-blue-400 bg-blue-400/10 border-blue-400/30',
  delivered:  'text-green-400 bg-green-400/10 border-green-400/30',
  cancelled:  'text-error bg-error/10 border-error/30',
};

const STATUS_LIST = ['pending', 'processing', 'shipped', 'delivered', 'cancelled'];
const TABS = ['Todos', ...STATUS_LIST.map(s => s.charAt(0).toUpperCase() + s.slice(1))];

const formatDate = (iso) =>
  new Date(iso).toLocaleDateString('es-PE', { day: 'numeric', month: 'short', year: 'numeric' });

const formatAmount = (n) =>
  `$${Number(n).toFixed(2)}`;

const API_URL = import.meta.env.VITE_API_URL ?? '';

const ManualOrderModal = ({ onCreated, authFetch }) => {
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    userEmail: '', notes: '',
    address: { fullName: '', line1: '', district: '', city: '', region: '', phone: '' },
    items: [{ productId: '', productName: '', price: '', quantity: 1 }],
  });
  const [error, setError] = useState('');

  const addItem = () => setForm(f => ({ ...f, items: [...f.items, { productId: '', productName: '', price: '', quantity: 1 }] }));
  const setItem = (i, k, v) => setForm(f => {
    const items = [...f.items];
    items[i] = { ...items[i], [k]: v };
    return { ...f, items };
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSaving(true);
    try {
      const res = await authFetch(`${API_URL}/api/admin/orders`, {
        method: 'POST',
        body: JSON.stringify({
          ...form,
          items: form.items.map(i => ({ ...i, price: parseFloat(i.price), quantity: parseInt(i.quantity) })),
        }),
      });
      const d = await res.json();
      if (!res.ok) { setError(d.error || 'Error al crear'); return; }
      onCreated(d.order);
      setOpen(false);
    } catch { setError('Error de conexión'); }
    finally { setSaving(false); }
  };

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="flex items-center gap-2 bg-primary-container text-on-primary-container px-4 py-2.5 rounded-lg text-xs font-headline font-bold uppercase tracking-widest hover:bg-primary hover:text-on-primary transition-all"
      >
        <span className="material-symbols-outlined text-sm">add</span>
        Orden Manual
      </button>

      {open && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-surface rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto p-8 space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="font-headline font-bold text-lg">Crear Orden Manual</h3>
              <button onClick={() => setOpen(false)} className="text-on-surface-variant hover:text-primary">
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            {error && <div className="bg-error/10 border border-error/30 rounded-lg px-4 py-3 text-sm text-error">{error}</div>}
            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block text-xs font-mono uppercase tracking-widest text-on-surface-variant mb-2">Email del cliente<InfoTooltip text={ORDER_TOOLTIPS.manualEmail} /></label>
                <input type="email" value={form.userEmail} onChange={e => setForm(f => ({ ...f, userEmail: e.target.value }))}
                  placeholder="cliente@email.com"
                  className="w-full bg-surface-container-highest border-none rounded-md px-4 py-3 text-sm focus:ring-1 focus:ring-primary/40 focus:outline-none" />
              </div>

              <div>
                <p className="text-xs font-mono uppercase tracking-widest text-on-surface-variant mb-3">Dirección de Envío</p>
                <div className="grid grid-cols-2 gap-3">
                  {[
                    ['fullName','Nombre completo', ORDER_TOOLTIPS.manualName],
                    ['line1','Dirección', ORDER_TOOLTIPS.manualAddress],
                    ['district','Distrito', ORDER_TOOLTIPS.manualDistrict],
                    ['city','Ciudad', ORDER_TOOLTIPS.manualCity],
                    ['region','Región', ORDER_TOOLTIPS.manualRegion],
                    ['phone','Teléfono', ORDER_TOOLTIPS.manualPhone],
                  ].map(([k, label, tip]) => (
                    <div key={k}>
                      <label className="block text-[10px] font-mono uppercase tracking-widest text-on-surface-variant mb-1">{label}{tip && <InfoTooltip text={tip} />}</label>
                      <input placeholder={label} value={form.address[k] || ''} onChange={e => setForm(f => ({ ...f, address: { ...f.address, [k]: e.target.value } }))}
                        className="w-full bg-surface-container-highest border-none rounded-md px-3 py-2.5 text-sm focus:ring-1 focus:ring-primary/40 focus:outline-none" />
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-3">
                  <p className="text-xs font-mono uppercase tracking-widest text-on-surface-variant">Productos<InfoTooltip text={ORDER_TOOLTIPS.manualProductName} /></p>
                  <button type="button" onClick={addItem} className="text-xs text-primary font-mono hover:underline flex items-center gap-1">
                    <span className="material-symbols-outlined text-xs">add</span> Agregar
                  </button>
                </div>
                <div className="space-y-2">
                  {form.items.map((item, i) => (
                    <div key={i} className="grid grid-cols-[1fr_auto_auto] gap-2">
                      <input placeholder="Nombre del producto" value={item.productName} onChange={e => setItem(i, 'productName', e.target.value)}
                        className="bg-surface-container-highest border-none rounded-md px-3 py-2 text-sm focus:ring-1 focus:ring-primary/40 focus:outline-none" />
                      <input type="number" placeholder="Precio" min="0" step="0.01" value={item.price} onChange={e => setItem(i, 'price', e.target.value)}
                        className="bg-surface-container-highest border-none rounded-md px-3 py-2 text-sm w-24 focus:ring-1 focus:ring-primary/40 focus:outline-none" />
                      <input type="number" min="1" value={item.quantity} onChange={e => setItem(i, 'quantity', e.target.value)}
                        className="bg-surface-container-highest border-none rounded-md px-3 py-2 text-sm w-16 focus:ring-1 focus:ring-primary/40 focus:outline-none" />
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-mono uppercase tracking-widest text-on-surface-variant mb-2">Notas<InfoTooltip text={ORDER_TOOLTIPS.manualNotes} /></label>
                <textarea value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} rows={2}
                  className="w-full bg-surface-container-highest border-none rounded-md px-4 py-3 text-sm focus:ring-1 focus:ring-primary/40 focus:outline-none resize-none" />
              </div>

              <div className="flex gap-3 pt-2">
                <button type="submit" disabled={saving}
                  className="flex-1 bg-primary-container text-on-primary-container py-3 rounded-lg font-headline font-bold text-xs uppercase tracking-widest hover:bg-primary hover:text-on-primary transition-all disabled:opacity-50">
                  {saving ? 'Creando…' : 'Crear Orden'}
                </button>
                <button type="button" onClick={() => setOpen(false)}
                  className="px-5 py-3 rounded-lg font-mono text-xs text-on-surface-variant hover:bg-surface-container-highest transition-all">
                  Cancelar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
};

const AdminOrders = () => {
  const { authFetch } = useAuth();
  const [orders, setOrders]     = useState([]);
  const [total, setTotal]       = useState(0);
  const [loading, setLoading]   = useState(true);
  const [activeTab, setActiveTab] = useState('Todos');
  const [search, setSearch]     = useState('');
  const [updatingId, setUpdatingId] = useState(null);

  const statusFilter = activeTab === 'Todos' ? null : activeTab.toLowerCase();

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ limit: '50' });
      if (statusFilter) params.set('status', statusFilter);
      const res  = await authFetch(`${API}/api/admin/orders?${params}`);
      const data = await res.json();
      setOrders(data.orders || []);
      setTotal(data.total || 0);
    } catch {
      // silencioso
    } finally {
      setLoading(false);
    }
  }, [statusFilter]);

  useEffect(() => { load(); }, [load]);

  // B7.1 — Export CSV
  const exportCsv = () => {
    if (!orders.length) return;
    const rows = [
      ['ID', 'Cliente', 'Email', 'Productos', 'Total', 'Estado', 'Fecha'],
      ...orders.map(o => [
        `#${o.id.slice(-6).toUpperCase()}`,
        o.user?.name || o.address?.fullName || 'Guest',
        o.user?.email || o.address?.email || '',
        (o.items || []).map(i => i.name).join('; '),
        Number(o.total).toFixed(2),
        o.status,
        new Date(o.createdAt).toLocaleDateString('es-PE'),
      ]),
    ];
    const csv = rows.map(r => r.map(c => `"${String(c).replace(/"/g, '""')}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `trebor-orders-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };


  const handleStatusChange = async (orderId, newStatus) => {
    setUpdatingId(orderId);
    try {
      const res = await authFetch(`${API}/api/admin/orders/${orderId}`, {
        method: 'PATCH',
        body: JSON.stringify({ status: newStatus }),
      });
      if (res.ok) {
        setOrders(prev =>
          prev.map(o => o.id === orderId ? { ...o, status: newStatus } : o)
        );
      }
    } catch {
      // silencioso
    } finally {
      setUpdatingId(null);
    }
  };

  const filtered = search
    ? orders.filter(o => {
        const q = search.toLowerCase();
        const id = o.id.slice(-6).toLowerCase();
        const customer = (o.user?.name || o.address?.fullName || '').toLowerCase();
        const email    = (o.user?.email || o.address?.email || '').toLowerCase();
        const product  = (o.items?.[0]?.name || '').toLowerCase();
        return id.includes(q) || customer.includes(q) || email.includes(q) || product.includes(q);
      })
    : orders;

  const counts = TABS.reduce((acc, t) => {
    acc[t] = t === 'Todos' ? total : orders.filter(o => o.status === t.toLowerCase()).length;
    return acc;
  }, {});

  const statCards = [
    { label: 'Total Pedidos', value: total, icon: 'receipt_long', color: 'text-on-surface' },
    { label: 'Enviados',  value: orders.filter(o => o.status === 'shipped').length,    icon: 'local_shipping', color: 'text-blue-400' },
    { label: 'Pendientes', value: orders.filter(o => o.status === 'pending').length,   icon: 'schedule',       color: 'text-on-surface-variant' },
    { label: 'Entregados', value: orders.filter(o => o.status === 'delivered').length, icon: 'check_circle',   color: 'text-green-400' },
  ];

  return (
    <main className="min-h-screen bg-surface-container-low flex flex-col w-full">
      <header className="h-20 px-10 flex items-center justify-between bg-surface/50 backdrop-blur-md sticky top-0 z-40">
        <div>
          <h2 className="font-headline font-bold text-2xl text-on-surface tracking-tight">Order Management</h2>
          <p className="text-xs font-mono text-on-surface-variant">/root/admin/orders_v4</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={load}
            className="flex items-center gap-2 bg-surface-container-high px-4 py-2.5 rounded-lg text-xs font-mono hover:bg-surface-container-highest transition-colors"
          >
            <span className="material-symbols-outlined text-sm">refresh</span>
            Actualizar
          </button>
          <button
            onClick={exportCsv}
            disabled={!orders.length}
            className="flex items-center gap-2 bg-surface-container-high px-4 py-2.5 rounded-lg text-xs font-mono hover:bg-surface-container-highest transition-colors disabled:opacity-40"
          >
            <span className="material-symbols-outlined text-sm">download</span>
            Exportar CSV
          </button>
          <ManualOrderModal onCreated={(order) => { setOrders(prev => [order, ...prev]); setTotal(t => t + 1); }} authFetch={authFetch} />
        </div>
      </header>

      <div className="p-10 space-y-8">
        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {statCards.map(({ label, value, icon, color }) => (
            <div key={label} className="bg-surface-container-high p-5 rounded-xl relative overflow-hidden">
              <span className={`material-symbols-outlined absolute top-3 right-3 text-3xl opacity-10 ${color}`}>{icon}</span>
              <p className="text-xs font-mono tracking-widest uppercase text-on-surface-variant mb-2">{label}</p>
              <p className={`text-3xl font-headline font-black ${color}`}>{loading ? '—' : value}</p>
            </div>
          ))}
        </div>

        {/* Table section */}
        <section className="bg-surface p-8 rounded-xl shadow-2xl">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-8">
            <div className="relative flex items-center gap-1">
              <div className="relative flex items-center bg-surface-container-high rounded-lg overflow-hidden focus-within:ring-1 ring-primary/40 transition-all">
                <span className="material-symbols-outlined absolute left-3 text-on-surface-variant text-sm">search</span>
                <input
                  className="bg-transparent border-none py-2.5 pl-10 pr-4 text-sm text-on-surface focus:ring-0 placeholder:text-on-surface-variant/50 w-64 focus:outline-none"
                  placeholder="Buscar pedido o cliente..."
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                />
              </div>
              <InfoTooltip text={ORDER_TOOLTIPS.search} />
            </div>
            <div className="flex gap-1 p-1 bg-surface-container rounded-xl border border-outline-variant/10 overflow-x-auto no-scrollbar">
              {TABS.map(tab => (
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

          {loading ? (
            <div className="flex justify-center py-20">
              <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-outline-variant/20">
                    {['Pedido', 'Cliente', 'Producto', 'Monto', 'Fecha', 'Estado'].map(h => (
                      <th key={h} className="text-left pb-4 text-[10px] font-mono tracking-widest text-on-surface-variant uppercase pr-4">{h}</th>
                    ))}
                    <th className="text-left pb-4 text-[10px] font-mono tracking-widest text-on-surface-variant uppercase pr-4">Acciones<InfoTooltip text={ORDER_TOOLTIPS.statusSelect} /></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-outline-variant/10">
                  {filtered.map(order => {
                    const shortId    = order.id.slice(-6).toUpperCase();
                    const customer   = order.user?.name || order.address?.fullName || 'Guest';
                    const email      = order.user?.email || order.address?.email || '—';
                    const firstItem  = order.items?.[0]?.name || '—';
                    const extraItems = (order.items?.length || 0) - 1;
                    const productStr = extraItems > 0 ? `${firstItem} +${extraItems}` : firstItem;
                    const isUpdating = updatingId === order.id;

                    return (
                      <tr key={order.id} className="hover:bg-surface-container-low transition-colors group">
                        <td className="py-4 pr-4">
                          <span className="font-mono text-sm font-bold text-primary">#{shortId}</span>
                        </td>
                        <td className="py-4 pr-4">
                          <p className="font-headline font-bold text-sm">{customer}</p>
                          <p className="text-xs text-on-surface-variant">{email}</p>
                        </td>
                        <td className="py-4 pr-4">
                          <span className="text-sm text-on-surface-variant">{productStr}</span>
                        </td>
                        <td className="py-4 pr-4">
                          <span className="font-mono font-bold text-sm text-on-surface">{formatAmount(order.total)}</span>
                        </td>
                        <td className="py-4 pr-4">
                          <span className="font-mono text-xs text-on-surface-variant">{formatDate(order.createdAt)}</span>
                        </td>
                        <td className="py-4 pr-4">
                          <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest border ${STATUS_STYLES[order.status] || ''}`}>
                            {order.status}
                          </span>
                        </td>
                        <td className="py-4">
                          <div className="flex items-center gap-2">
                            <select
                              value={order.status}
                              disabled={isUpdating}
                              onChange={e => handleStatusChange(order.id, e.target.value)}
                              className="bg-surface-container-high border-none rounded-md px-2 py-1.5 text-xs font-mono text-on-surface focus:ring-1 focus:ring-primary/40 focus:outline-none cursor-pointer disabled:opacity-50"
                            >
                              {STATUS_LIST.map(s => (
                                <option key={s} value={s}>{s}</option>
                              ))}
                            </select>
                            {isUpdating && (
                              <div className="w-3 h-3 border border-primary border-t-transparent rounded-full animate-spin" />
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>

              {filtered.length === 0 && (
                <div className="text-center py-16 text-on-surface-variant">
                  <span className="material-symbols-outlined text-4xl mb-3 block">search_off</span>
                  <p className="font-mono text-sm">Sin pedidos para este filtro</p>
                </div>
              )}
            </div>
          )}
        </section>
      </div>
    </main>
  );
};

export default AdminOrders;
