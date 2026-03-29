import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import InfoTooltip from '../components/InfoTooltip';
import { ORDER_DETAIL_TOOLTIPS } from '../constants/adminTooltips';

const API = import.meta.env.VITE_API_URL ?? '';

const STATUSES = ['pending', 'processing', 'shipped', 'delivered', 'cancelled'];
const STATUS_META = {
  pending:    { label: 'Pendiente',   color: 'text-on-surface-variant bg-surface-container-highest border-outline-variant/30' },
  processing: { label: 'En proceso',  color: 'text-tertiary bg-tertiary/10 border-tertiary/30' },
  shipped:    { label: 'Enviado',     color: 'text-blue-400 bg-blue-400/10 border-blue-400/30' },
  delivered:  { label: 'Entregado',   color: 'text-green-400 bg-green-400/10 border-green-400/30' },
  cancelled:  { label: 'Cancelado',   color: 'text-error bg-error/10 border-error/30' },
};

const AdminOrderDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { authFetch } = useAuth();

  const [order, setOrder]   = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState('');
  const [note, setNote]     = useState('');
  const [toast, setToast]   = useState('');

  const showToast = (msg) => { setToast(msg); setTimeout(() => setToast(''), 3000); };

  useEffect(() => {
    authFetch(`${API}/api/admin/orders/${id}`)
      .then(r => r.json())
      .then(data => {
        if (data.order) { setOrder(data.order); setStatus(data.order.status); setNote(data.order.notes || ''); }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [id]);

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await authFetch(`${API}/api/admin/orders/${id}`, {
        method: 'PATCH',
        body: JSON.stringify({ status, notes: note }),
      });
      const data = await res.json();
      if (res.ok) { setOrder(data.order); showToast('Pedido actualizado'); }
      else showToast(data.error || 'Error al guardar');
    } catch { showToast('Error de conexión'); }
    finally { setSaving(false); }
  };

  if (loading) return (
    <main className="flex-1 flex items-center justify-center">
      <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
    </main>
  );

  if (!order) return (
    <main className="flex-1 flex items-center justify-center text-on-surface-variant">
      Pedido no encontrado
    </main>
  );

  const meta = STATUS_META[order.status] || STATUS_META.pending;
  const addr = order.shippingAddress;
  const items = Array.isArray(order.items) ? order.items : [];

  return (
    <>
      <main className="min-h-screen bg-surface-container-low flex flex-col w-full">
        <header className="h-20 px-10 flex items-center justify-between bg-surface/50 backdrop-blur-md sticky top-0 z-40 border-b border-outline-variant/10">
          <div className="flex items-center gap-4">
            <button onClick={() => navigate('/admin/orders')} className="text-on-surface-variant hover:text-primary transition-colors">
              <span className="material-symbols-outlined">arrow_back</span>
            </button>
            <div>
              <h2 className="font-headline font-bold text-xl tracking-tight">Pedido #{order.id.slice(-8).toUpperCase()}</h2>
              <p className="text-xs font-mono text-on-surface-variant">/root/admin/orders/{id.slice(-8)}</p>
            </div>
          </div>
          <span className={`px-3 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest border ${meta.color}`}>
            {meta.label}
          </span>
        </header>

        <div className="p-10 max-w-5xl grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left: items + totals */}
          <div className="lg:col-span-2 space-y-6">
            <section className="bg-surface rounded-xl shadow-2xl overflow-hidden">
              <div className="px-6 py-4 border-b border-outline-variant/10">
                <h3 className="font-headline font-bold text-sm uppercase tracking-widest text-on-surface-variant">
                  Productos · {items.length}
                </h3>
              </div>
              <div className="divide-y divide-outline-variant/10">
                {items.map((item, i) => (
                  <div key={i} className="flex items-center gap-4 px-6 py-4">
                    <div className="w-10 h-10 bg-surface-container-high rounded-lg flex items-center justify-center flex-shrink-0">
                      <span className="material-symbols-outlined text-on-surface-variant/30 text-sm">inventory_2</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-sm">{item.productName || item.name}</p>
                      {item.variantInfo?.label && (
                        <p className="text-xs font-mono text-on-surface-variant">{item.variantInfo.label}</p>
                      )}
                      <p className="text-xs text-on-surface-variant font-mono mt-0.5">{item.quantity ?? 1} × ${Number(item.price).toFixed(2)}</p>
                    </div>
                    <p className="font-mono font-bold text-sm text-primary">${(Number(item.price) * (item.quantity ?? 1)).toFixed(2)}</p>
                  </div>
                ))}
              </div>
              <div className="px-6 py-4 bg-surface-container-low border-t border-outline-variant/10 space-y-2">
                <div className="flex justify-between text-sm text-on-surface-variant">
                  <span>Subtotal</span>
                  <span className="font-mono">${Number(order.subtotal ?? order.total).toFixed(2)}</span>
                </div>
                {Number(order.shippingCost) > 0 && (
                  <div className="flex justify-between text-sm text-on-surface-variant">
                    <span>Envío</span>
                    <span className="font-mono">${Number(order.shippingCost).toFixed(2)}</span>
                  </div>
                )}
                {Number(order.discount) > 0 && (
                  <div className="flex justify-between text-sm text-green-400">
                    <span>Descuento</span>
                    <span className="font-mono">−${Number(order.discount).toFixed(2)}</span>
                  </div>
                )}
                <div className="flex justify-between font-bold text-base pt-2 border-t border-outline-variant/10">
                  <span className="font-headline">Total</span>
                  <span className="font-mono text-primary">${Number(order.total).toFixed(2)}</span>
                </div>
              </div>
            </section>

            {/* Status + Note editor */}
            <section className="bg-surface rounded-xl shadow-2xl p-6 space-y-4">
              <h3 className="font-headline font-bold text-sm uppercase tracking-widest text-on-surface-variant">Actualizar Pedido</h3>
              <div>
                <label className="block text-xs font-mono uppercase tracking-widest text-on-surface-variant mb-2">Estado<InfoTooltip text={ORDER_DETAIL_TOOLTIPS.statusSelect} /></label>
                <select value={status} onChange={e => setStatus(e.target.value)}
                  className="w-full bg-surface-container-highest border-none rounded-md px-4 py-3 text-sm focus:ring-1 focus:ring-primary/40 focus:outline-none">
                  {STATUSES.map(s => (
                    <option key={s} value={s}>{STATUS_META[s]?.label || s}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-mono uppercase tracking-widest text-on-surface-variant mb-2">Nota interna<InfoTooltip text={ORDER_DETAIL_TOOLTIPS.internalNotes} /></label>
                <textarea value={note} onChange={e => setNote(e.target.value)} rows={3}
                  placeholder="Número de tracking, observaciones..."
                  className="w-full bg-surface-container-highest border-none rounded-md px-4 py-3 text-sm focus:ring-1 focus:ring-primary/40 focus:outline-none resize-none" />
              </div>
              <button onClick={handleSave} disabled={saving}
                className="flex items-center gap-2 bg-primary-container text-on-primary-container px-5 py-2.5 rounded-lg font-headline font-bold text-xs uppercase tracking-widest hover:bg-primary hover:text-on-primary transition-all disabled:opacity-50">
                <span className="material-symbols-outlined text-sm">save</span>
                {saving ? 'Guardando…' : 'Guardar'}
              </button>
            </section>
          </div>

          {/* Right: info */}
          <div className="space-y-6">
            {addr && (
              <section className="bg-surface rounded-xl shadow-2xl p-6">
                <h3 className="font-headline font-bold text-xs uppercase tracking-widest text-primary mb-4">Dirección</h3>
                <div className="space-y-1 text-sm text-on-surface-variant">
                  <p className="font-bold text-on-surface">{addr.fullName}</p>
                  <p>{addr.line1}{addr.line2 ? `, ${addr.line2}` : ''}</p>
                  <p>{addr.district}, {addr.city}</p>
                  <p>{addr.region}</p>
                  {addr.phone && <p className="font-mono">{addr.phone}</p>}
                </div>
              </section>
            )}

            <section className="bg-surface rounded-xl shadow-2xl p-6">
              <h3 className="font-headline font-bold text-xs uppercase tracking-widest text-primary mb-4">Pago</h3>
              <div className="space-y-2 text-sm font-mono text-on-surface-variant">
                {order.paymentId && <p>ID: {order.paymentId}</p>}
                <p className={order.paymentStatus === 'approved' ? 'text-green-400' : order.paymentStatus === 'rejected' ? 'text-error' : ''}>
                  {order.paymentStatus || 'pending'}
                </p>
              </div>
            </section>

            <section className="bg-surface rounded-xl shadow-2xl p-6">
              <h3 className="font-headline font-bold text-xs uppercase tracking-widest text-primary mb-4">Cliente</h3>
              {order.user ? (
                <div className="space-y-1 text-sm">
                  <p className="font-bold text-on-surface">{order.user.name}</p>
                  <p className="text-on-surface-variant font-mono text-xs">{order.user.email}</p>
                </div>
              ) : (
                <p className="text-sm text-on-surface-variant">Compra sin cuenta</p>
              )}
            </section>
          </div>
        </div>
      </main>

      {toast && (
        <div className="fixed bottom-6 right-6 z-[200] px-6 py-3 rounded-xl shadow-2xl text-sm font-bold bg-primary-container text-on-primary-container">
          {toast}
        </div>
      )}
    </>
  );
};

export default AdminOrderDetail;
