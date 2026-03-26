import { useState, useEffect, useMemo } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const API = import.meta.env.VITE_API_URL ?? '';

const STATUSES = ['pending', 'processing', 'shipped', 'delivered'];

const ReturnForm = ({ orderId }) => {
  const { authFetch } = useAuth();
  const [open, setOpen]     = useState(false);
  const [form, setForm]     = useState({ reason: '', contactPhone: '' });
  const [saving, setSaving] = useState(false);
  const [done, setDone]     = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await authFetch(`${import.meta.env.VITE_API_URL ?? ''}/api/orders/${orderId}/return`, {
        method: 'POST',
        body: JSON.stringify(form),
      });
      if (res.ok) setDone(true);
    } catch { } finally { setSaving(false); }
  };

  if (done) return (
    <div className="bg-green-500/5 border border-green-500/20 rounded-xl p-4 flex items-center gap-3">
      <span className="material-symbols-outlined text-green-400 text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
      <p className="text-sm text-green-400">Solicitud de devolución enviada. Te contactaremos en 24h.</p>
    </div>
  );

  return (
    <div className="bg-surface-container-low rounded-xl border border-outline-variant/15 overflow-hidden">
      <button onClick={() => setOpen(o => !o)}
        className="w-full flex items-center justify-between px-5 py-4 text-left hover:bg-surface-container transition-colors">
        <span className="text-sm font-bold text-on-surface-variant flex items-center gap-2">
          <span className="material-symbols-outlined text-sm">assignment_return</span>
          Solicitar devolución
        </span>
        <span className={`material-symbols-outlined text-sm text-on-surface-variant transition-transform ${open ? 'rotate-180' : ''}`}>expand_more</span>
      </button>
      {open && (
        <form onSubmit={handleSubmit} className="px-5 pb-5 space-y-4 border-t border-outline-variant/10">
          <div className="pt-4">
            <label className="block text-xs font-mono uppercase tracking-widest text-on-surface-variant mb-2">Motivo de devolución *</label>
            <textarea required value={form.reason} onChange={e => setForm(f => ({ ...f, reason: e.target.value }))} rows={3}
              placeholder="Describe el motivo de tu devolución..."
              className="w-full bg-surface-container-highest border-none rounded-md px-4 py-3 text-sm focus:ring-1 focus:ring-primary/40 focus:outline-none resize-none" />
          </div>
          <div>
            <label className="block text-xs font-mono uppercase tracking-widest text-on-surface-variant mb-2">Teléfono de contacto *</label>
            <input required type="tel" value={form.contactPhone} onChange={e => setForm(f => ({ ...f, contactPhone: e.target.value }))}
              placeholder="+51 999 999 999"
              className="w-full bg-surface-container-highest border-none rounded-md px-4 py-3 text-sm focus:ring-1 focus:ring-primary/40 focus:outline-none" />
          </div>
          <button type="submit" disabled={saving}
            className="flex items-center gap-2 bg-primary-container text-on-primary-container px-5 py-2.5 rounded-lg font-headline font-bold text-xs uppercase tracking-widest hover:bg-primary hover:text-on-primary transition-all disabled:opacity-50">
            <span className="material-symbols-outlined text-sm">send</span>
            {saving ? 'Enviando…' : 'Enviar solicitud'}
          </button>
        </form>
      )}
    </div>
  );
};

const statusMeta = {
  pending:    { label: 'Pendiente',   icon: 'schedule',          color: 'text-on-surface-variant', bg: 'bg-surface-container-highest border-outline-variant/20' },
  processing: { label: 'En proceso',  icon: 'autorenew',         color: 'text-tertiary',            bg: 'bg-tertiary/10 border-tertiary/20' },
  shipped:    { label: 'Enviado',     icon: 'local_shipping',    color: 'text-blue-400',            bg: 'bg-blue-400/10 border-blue-400/20' },
  delivered:  { label: 'Entregado',   icon: 'check_circle',      color: 'text-green-400',           bg: 'bg-green-400/10 border-green-400/20' },
  cancelled:  { label: 'Cancelado',   icon: 'cancel',            color: 'text-error',               bg: 'bg-error/10 border-error/20' },
};

const fmtDate = (iso) =>
  iso ? new Date(iso).toLocaleDateString('es-PE', { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : '';

const OrderDetail = () => {
  const { id } = useParams();
  const { authFetch } = useAuth();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    authFetch(`${API}/api/users/me/orders`)
      .then(r => r.json())
      .then(data => {
        const found = (data.orders || []).find(o => o.id === id);
        if (!found) setNotFound(true);
        else setOrder(found);
      })
      .catch(() => setNotFound(true))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <main className="pt-32 min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </main>
    );
  }

  if (notFound || !order) {
    return (
      <main className="pt-32 pb-20 px-6 max-w-2xl mx-auto text-center">
        <span className="material-symbols-outlined text-5xl text-on-surface-variant/20 block mb-4">receipt_long</span>
        <h1 className="font-headline font-bold text-2xl mb-3">Pedido no encontrado</h1>
        <Link to="/profile" className="text-primary font-mono text-sm no-underline hover:underline">← Mis pedidos</Link>
      </main>
    );
  }

  const meta = statusMeta[order.status] || statusMeta.pending;
  const isCancelled = order.status === 'cancelled';
  const activeIdx = isCancelled ? -1 : STATUSES.indexOf(order.status);

  const addr = order.shippingAddress;
  const items = Array.isArray(order.items) ? order.items : [];

  // Return eligibility: delivered + ≤5 business days
  const canReturn = useMemo(() => {
    if (order.status !== 'delivered' || !order.updatedAt) return false;
    const delivered = new Date(order.updatedAt);
    const now = new Date();
    let businessDays = 0;
    let cur = new Date(delivered);
    while (cur < now) {
      cur.setDate(cur.getDate() + 1);
      const day = cur.getDay();
      if (day !== 0 && day !== 6) businessDays++;
    }
    return businessDays <= 5;
  }, [order]);

  return (
    <main className="pt-32 pb-20 px-6 max-w-4xl mx-auto">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-xs font-mono text-on-surface-variant mb-8">
        <Link to="/profile" className="hover:text-primary transition-colors no-underline">Mi cuenta</Link>
        <span className="material-symbols-outlined text-sm">chevron_right</span>
        <span className="text-primary">Pedido #{order.id.slice(-8).toUpperCase()}</span>
      </nav>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left column */}
        <div className="lg:col-span-8 space-y-6">

          {/* Header */}
          <div className="bg-surface-container-low rounded-xl border border-outline-variant/15 p-6">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <p className="text-xs font-mono text-on-surface-variant uppercase tracking-widest mb-1">Pedido</p>
                <h1 className="font-headline font-black text-2xl tracking-tight text-primary">
                  #{order.id.slice(-8).toUpperCase()}
                </h1>
                <p className="text-xs text-on-surface-variant font-mono mt-1">{fmtDate(order.createdAt)}</p>
              </div>
              <span className={`px-3 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest border flex items-center gap-1.5 ${meta.bg} ${meta.color}`}>
                <span className="material-symbols-outlined text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>{meta.icon}</span>
                {meta.label}
              </span>
            </div>
          </div>

          {/* Timeline */}
          {!isCancelled && (
            <div className="bg-surface-container-low rounded-xl border border-outline-variant/15 p-6">
              <h3 className="font-headline font-bold text-sm uppercase tracking-widest text-on-surface-variant mb-6">Estado del Envío</h3>
              <div className="relative">
                {/* Track line */}
                <div className="absolute top-4 left-4 w-[calc(100%-2rem)] h-0.5 bg-surface-container-high" />
                <div
                  className="absolute top-4 left-4 h-0.5 bg-primary transition-all duration-700"
                  style={{ width: activeIdx >= 0 ? `${(activeIdx / (STATUSES.length - 1)) * 100}%` : '0%' }}
                />
                <div className="relative flex justify-between">
                  {STATUSES.map((s, i) => {
                    const done = i <= activeIdx;
                    const current = i === activeIdx;
                    const sm = statusMeta[s];
                    return (
                      <div key={s} className="flex flex-col items-center gap-2 z-10">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 transition-all ${
                          done ? 'bg-primary border-primary' : 'bg-surface-container-high border-outline-variant/30'
                        } ${current ? 'ring-4 ring-primary/20' : ''}`}>
                          <span className={`material-symbols-outlined text-sm ${done ? 'text-on-primary' : 'text-on-surface-variant/40'}`}
                            style={{ fontVariationSettings: done ? "'FILL' 1" : "'FILL' 0" }}>
                            {sm.icon}
                          </span>
                        </div>
                        <span className={`text-[10px] font-mono uppercase tracking-wider text-center ${done ? 'text-primary' : 'text-on-surface-variant/40'}`}>
                          {sm.label}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* Items */}
          <div className="bg-surface-container-low rounded-xl border border-outline-variant/15 overflow-hidden">
            <div className="px-6 py-4 border-b border-outline-variant/10">
              <h3 className="font-headline font-bold text-sm uppercase tracking-widest text-on-surface-variant">
                Productos · {items.length} {items.length === 1 ? 'item' : 'items'}
              </h3>
            </div>
            <div className="divide-y divide-outline-variant/10">
              {items.length > 0 ? items.map((item, i) => {
                const name = item.productName || item.name || 'Producto';
                const qty = item.quantity ?? item.qty ?? 1;
                const price = Number(item.price ?? 0);
                return (
                  <div key={i} className="flex items-center gap-4 px-6 py-4">
                    <div className="w-12 h-12 bg-surface-container-high rounded-lg flex items-center justify-center flex-shrink-0">
                      <span className="material-symbols-outlined text-on-surface-variant/30">inventory_2</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-sm text-on-surface">{name}</p>
                      <p className="text-xs text-on-surface-variant font-mono mt-0.5">
                        {qty} × ${price.toFixed(2)}
                      </p>
                    </div>
                    <p className="font-mono font-bold text-sm text-primary flex-shrink-0">
                      ${(price * qty).toFixed(2)}
                    </p>
                  </div>
                );
              }) : (
                <div className="px-6 py-8 text-center text-xs text-on-surface-variant font-mono">Sin detalle de items</div>
              )}
            </div>

            {/* Totals */}
            <div className="px-6 py-4 bg-surface border-t border-outline-variant/10 space-y-2">
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
                  <span>Descuento aplicado</span>
                  <span className="font-mono">−${Number(order.discount).toFixed(2)}</span>
                </div>
              )}
              <div className="flex justify-between font-bold text-base pt-2 border-t border-outline-variant/10">
                <span className="font-headline">Total</span>
                <span className="font-mono text-primary">${Number(order.total).toFixed(2)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right column */}
        <div className="lg:col-span-4 space-y-6">
          {/* Shipping address */}
          {addr && (
            <div className="bg-surface-container-low rounded-xl border border-outline-variant/15 p-6">
              <h3 className="font-headline font-bold text-xs uppercase tracking-widest text-primary mb-4">Dirección de Envío</h3>
              <div className="space-y-1 text-sm text-on-surface-variant">
                <p className="font-bold text-on-surface">{addr.fullName}</p>
                <p>{addr.line1}{addr.line2 ? `, ${addr.line2}` : ''}</p>
                <p>{addr.district}, {addr.city}</p>
                <p>{addr.region}</p>
                {addr.phone && <p className="font-mono">{addr.phone}</p>}
              </div>
            </div>
          )}

          {/* Payment */}
          <div className="bg-surface-container-low rounded-xl border border-outline-variant/15 p-6">
            <h3 className="font-headline font-bold text-xs uppercase tracking-widest text-primary mb-4">Pago</h3>
            <div className="flex items-center gap-3">
              <span className="material-symbols-outlined text-on-surface-variant">account_balance_wallet</span>
              <div>
                <p className="text-sm text-on-surface">MercadoPago</p>
                {order.paymentStatus && (
                  <p className={`text-xs font-mono mt-0.5 ${
                    order.paymentStatus === 'approved' ? 'text-green-400' :
                    order.paymentStatus === 'rejected' ? 'text-error' : 'text-on-surface-variant'
                  }`}>
                    {order.paymentStatus === 'approved' ? 'Aprobado' :
                     order.paymentStatus === 'rejected' ? 'Rechazado' : 'Pendiente'}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Notes */}
          {order.notes && (
            <div className="bg-surface-container-low rounded-xl border border-outline-variant/15 p-6">
              <h3 className="font-headline font-bold text-xs uppercase tracking-widest text-primary mb-3">Notas</h3>
              <p className="text-sm text-on-surface-variant">{order.notes}</p>
            </div>
          )}

          <Link
            to="/profile"
            className="flex items-center gap-2 text-primary font-mono text-sm no-underline hover:underline"
          >
            <span className="material-symbols-outlined text-sm">arrow_back</span>
            Mis pedidos
          </Link>

          {/* Return request */}
          {canReturn && (
            <ReturnForm orderId={order.id} />
          )}
        </div>
      </div>
    </main>
  );
};

export default OrderDetail;
