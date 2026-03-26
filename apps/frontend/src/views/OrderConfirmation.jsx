import { useState, useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const API = import.meta.env.VITE_API_URL ?? '';

const statusColors = {
  pending:    'text-on-surface-variant bg-surface-container-highest border-outline-variant/20',
  processing: 'text-tertiary bg-tertiary/10 border-tertiary/20',
  shipped:    'text-blue-400 bg-blue-400/10 border-blue-400/20',
  delivered:  'text-green-400 bg-green-400/10 border-green-400/20',
  cancelled:  'text-error bg-error/10 border-error/20',
};

const statusLabel = { pending: 'Pendiente', processing: 'En proceso', shipped: 'Enviado', delivered: 'Entregado', cancelled: 'Cancelado' };

const OrderConfirmation = () => {
  const { id } = useParams();
  const { authFetch, user } = useAuth();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    authFetch(`${API}/api/users/me/orders`)
      .then(r => r.json())
      .then(data => {
        const found = (data.orders || []).find(o => o.id === id);
        setOrder(found || null);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-surface flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-surface text-on-surface flex flex-col">
      {/* Minimal header */}
      <header className="h-20 px-8 flex items-center border-b border-primary/10">
        <Link to="/" className="text-primary font-headline font-bold text-xl tracking-tight no-underline">Trebor Labs</Link>
      </header>

      <main className="flex-1 flex items-center justify-center px-6 py-20">
        <div className="w-full max-w-lg space-y-8">
          {/* Success icon */}
          <div className="text-center space-y-4">
            <div className="w-20 h-20 bg-primary/10 border border-primary/20 rounded-2xl flex items-center justify-center mx-auto">
              <span className="material-symbols-outlined text-primary text-4xl" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
            </div>
            <div>
              <h1 className="font-headline font-black text-3xl tracking-tight">¡Pedido confirmado!</h1>
              <p className="text-on-surface-variant text-sm mt-2">
                Recibirás un email de confirmación pronto.
              </p>
            </div>
          </div>

          {/* Order card */}
          {order ? (
            <div className="bg-surface-container-low rounded-xl border border-outline-variant/15 overflow-hidden">
              <div className="px-6 py-4 border-b border-outline-variant/10 flex items-center justify-between">
                <div>
                  <p className="font-mono text-xs text-on-surface-variant uppercase tracking-widest">Pedido</p>
                  <p className="font-mono font-bold text-primary text-sm mt-0.5">#{order.id.slice(-8).toUpperCase()}</p>
                </div>
                <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest border ${statusColors[order.status] || ''}`}>
                  {statusLabel[order.status] || order.status}
                </span>
              </div>

              {/* Items */}
              {Array.isArray(order.items) && order.items.length > 0 && (
                <div className="divide-y divide-outline-variant/10">
                  {order.items.map((item, i) => {
                    const name = item.productName || item.name || 'Producto';
                    const qty = item.quantity ?? item.qty ?? 1;
                    const price = item.price ?? 0;
                    return (
                      <div key={i} className="flex items-center justify-between px-6 py-3">
                        <div className="flex items-center gap-3">
                          <span className="w-5 h-5 bg-primary/10 rounded text-primary font-mono text-[10px] flex items-center justify-center">{qty}</span>
                          <span className="text-sm text-on-surface">{name}</span>
                        </div>
                        <span className="font-mono text-sm text-on-surface-variant">${(price * qty).toFixed(2)}</span>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Totals */}
              <div className="px-6 py-4 bg-surface border-t border-outline-variant/10 space-y-2">
                {order.shippingCost > 0 && (
                  <div className="flex justify-between text-sm text-on-surface-variant">
                    <span>Envío</span>
                    <span className="font-mono">${Number(order.shippingCost).toFixed(2)}</span>
                  </div>
                )}
                {order.discount > 0 && (
                  <div className="flex justify-between text-sm text-green-400">
                    <span>Descuento</span>
                    <span className="font-mono">−${Number(order.discount).toFixed(2)}</span>
                  </div>
                )}
                <div className="flex justify-between font-bold pt-1 border-t border-outline-variant/10">
                  <span className="font-headline">Total</span>
                  <span className="font-mono text-primary">${Number(order.total).toFixed(2)}</span>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-surface-container-low rounded-xl border border-outline-variant/15 px-6 py-8 text-center text-on-surface-variant text-sm">
              <p className="font-mono text-primary font-bold text-sm mb-2">#{id?.slice(-8).toUpperCase()}</p>
              <p>Tu pedido ha sido registrado correctamente.</p>
            </div>
          )}

          {/* CTA */}
          <div className="flex flex-col sm:flex-row gap-3">
            <Link
              to="/products"
              className="flex-1 text-center bg-primary-container text-on-primary-container font-headline font-bold px-6 py-3 rounded-lg text-xs uppercase tracking-widest hover:bg-primary hover:text-on-primary transition-all no-underline"
            >
              Seguir comprando
            </Link>
            {user && (
              <Link
                to={`/orders/${id}`}
                className="flex-1 text-center border border-outline-variant/30 text-on-surface-variant font-headline font-bold px-6 py-3 rounded-lg text-xs uppercase tracking-widest hover:bg-surface-container-high transition-all no-underline"
              >
                Ver pedido
              </Link>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default OrderConfirmation;
