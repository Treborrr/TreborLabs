import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const API = import.meta.env.VITE_API_URL ?? '';

const TYPE_ICON = {
  spin_available: 'casino',
  order_status:   'local_shipping',
  return_update:  'assignment_return',
  coupon_won:     'discount',
};

const Notifications = () => {
  const { user, authFetch } = useAuth();
  const [notifs, setNotifs]   = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) { setLoading(false); return; }
    authFetch(`${API}/api/notifications`)
      .then(r => r.json())
      .then(d => setNotifs(d.notifications || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [user]);

  const markRead = async (id) => {
    setNotifs(prev => prev.map(n => n.id === id ? { ...n, readAt: new Date().toISOString() } : n));
    await authFetch(`${API}/api/notifications/${id}/read`, { method: 'PATCH' }).catch(() => {});
  };

  const markAll = async () => {
    setNotifs(prev => prev.map(n => ({ ...n, readAt: n.readAt || new Date().toISOString() })));
    await authFetch(`${API}/api/notifications/read-all`, { method: 'PATCH' }).catch(() => {});
  };

  const unreadCount = notifs.filter(n => !n.readAt).length;

  if (!user) return (
    <main className="pt-32 pb-20 px-6 max-w-3xl mx-auto text-center min-h-screen">
      <span className="material-symbols-outlined text-5xl text-on-surface-variant/20 block mb-4">notifications</span>
      <h1 className="font-headline font-bold text-2xl mb-3">Inicia sesión para ver tus notificaciones</h1>
      <Link to="/login" className="text-primary font-mono text-sm hover:underline no-underline">Iniciar sesión</Link>
    </main>
  );

  return (
    <main className="pt-32 pb-20 px-6 max-w-3xl mx-auto min-h-screen">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-headline font-black text-3xl tracking-tight">Notificaciones</h1>
          {unreadCount > 0 && (
            <p className="text-xs font-mono text-primary mt-1">{unreadCount} sin leer</p>
          )}
        </div>
        {unreadCount > 0 && (
          <button onClick={markAll}
            className="text-xs font-mono text-on-surface-variant hover:text-primary transition-colors">
            Marcar todas como leídas
          </button>
        )}
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      ) : notifs.length === 0 ? (
        <div className="text-center py-20 text-on-surface-variant">
          <span className="material-symbols-outlined text-5xl mb-4 block opacity-20">notifications_off</span>
          <p className="font-headline font-bold">Sin notificaciones</p>
          <p className="text-sm mt-1">Te avisaremos cuando haya novedades.</p>
        </div>
      ) : (
        <div className="space-y-2">
          {notifs.map(n => (
            <div
              key={n.id}
              onClick={() => !n.readAt && markRead(n.id)}
              className={`flex items-start gap-4 p-5 rounded-xl border transition-colors cursor-pointer ${n.readAt ? 'bg-surface-container-low border-outline-variant/10 opacity-70' : 'bg-surface-container-low border-primary/20 hover:border-primary/40'}`}
            >
              <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${n.readAt ? 'bg-surface-container-high' : 'bg-primary/10'}`}>
                <span className={`material-symbols-outlined text-sm ${n.readAt ? 'text-on-surface-variant' : 'text-primary'}`} style={{ fontVariationSettings: n.readAt ? "'FILL' 0" : "'FILL' 1" }}>
                  {TYPE_ICON[n.type] || 'notifications'}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <p className={`text-sm font-bold ${n.readAt ? 'text-on-surface-variant' : 'text-on-surface'}`}>{n.title}</p>
                <p className="text-xs text-on-surface-variant mt-0.5">{n.body}</p>
                <p className="text-xs text-on-surface-variant/50 font-mono mt-2">
                  {new Date(n.createdAt).toLocaleDateString('es-PE', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                </p>
              </div>
              {!n.readAt && (
                <div className="w-2 h-2 bg-primary rounded-full flex-shrink-0 mt-2" />
              )}
            </div>
          ))}
        </div>
      )}
    </main>
  );
};

export default Notifications;
