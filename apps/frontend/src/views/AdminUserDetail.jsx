import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const API = import.meta.env.VITE_API_URL ?? '';

const AdminUserDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { authFetch } = useAuth();
  const [userData, setUserData] = useState(null);
  const [orders, setOrders]     = useState([]);
  const [loading, setLoading]   = useState(true);
  const [saving, setSaving]     = useState(false);
  const [form, setForm]         = useState(null);
  const [toast, setToast]       = useState('');

  const showToast = (msg) => { setToast(msg); setTimeout(() => setToast(''), 3000); };

  useEffect(() => {
    Promise.all([
      authFetch(`${API}/api/admin/users/${id}`).then(r => r.json()),
    ]).then(([data]) => {
      setUserData(data.user || null);
      setOrders(data.orders || []);
      if (data.user) setForm({ name: data.user.name, email: data.user.email, role: data.user.role });
    }).catch(() => {}).finally(() => setLoading(false));
  }, [id]);

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await authFetch(`${API}/api/admin/users/${id}`, {
        method: 'PATCH',
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (res.ok) { setUserData(data.user); showToast('Usuario actualizado'); }
      else showToast(data.error || 'Error al guardar');
    } catch { showToast('Error de conexión'); }
    finally { setSaving(false); }
  };

  const handleSuspend = async () => {
    const suspended = !userData.suspended;
    const res = await authFetch(`${API}/api/admin/users/${id}`, {
      method: 'PATCH',
      body: JSON.stringify({ suspended }),
    });
    if (res.ok) {
      setUserData(u => ({ ...u, suspended }));
      showToast(suspended ? 'Usuario suspendido' : 'Usuario reactivado');
    }
  };

  if (loading) return (
    <main className="flex-1 flex items-center justify-center">
      <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
    </main>
  );

  if (!userData) return (
    <main className="flex-1 flex flex-col items-center justify-center gap-4">
      <p className="text-on-surface-variant">Usuario no encontrado</p>
      <Link to="/admin/users" className="text-primary text-sm font-mono hover:underline no-underline">← Volver</Link>
    </main>
  );

  const STATUS_COLORS = {
    pending: 'text-on-surface-variant bg-surface-container-highest',
    processing: 'text-tertiary bg-tertiary/10',
    shipped: 'text-blue-400 bg-blue-400/10',
    delivered: 'text-green-400 bg-green-400/10',
    cancelled: 'text-error bg-error/10',
  };

  return (
    <>
      <main className="min-h-screen bg-surface-container-low flex flex-col w-full">
        <header className="h-20 px-10 flex items-center justify-between bg-surface/50 backdrop-blur-md sticky top-0 z-40 border-b border-outline-variant/10">
          <div className="flex items-center gap-4">
            <button onClick={() => navigate('/admin/users')} className="text-on-surface-variant hover:text-primary transition-colors">
              <span className="material-symbols-outlined">arrow_back</span>
            </button>
            <div>
              <h2 className="font-headline font-bold text-xl tracking-tight">{userData.name || userData.email}</h2>
              <p className="text-xs font-mono text-on-surface-variant">/root/admin/users/{id.slice(-8)}</p>
            </div>
          </div>
          <button
            onClick={handleSuspend}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-lg font-mono text-xs uppercase tracking-widest transition-all ${userData.suspended ? 'bg-green-500/10 text-green-400 hover:bg-green-500/20' : 'bg-error/10 text-error hover:bg-error/20'}`}
          >
            <span className="material-symbols-outlined text-sm">{userData.suspended ? 'person_add' : 'person_off'}</span>
            {userData.suspended ? 'Reactivar' : 'Suspender'}
          </button>
        </header>

        <div className="p-10 max-w-4xl space-y-8">
          {/* Edit form */}
          <section className="bg-surface rounded-xl shadow-2xl p-8 space-y-6">
            <h3 className="font-headline font-bold text-lg">Datos del Usuario</h3>
            <form onSubmit={handleSave} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-mono uppercase tracking-widest text-on-surface-variant mb-2">Nombre</label>
                  <input type="text" value={form.name || ''} onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                    className="w-full bg-surface-container-highest border-none rounded-md px-4 py-3 text-sm focus:ring-1 focus:ring-primary/40 focus:outline-none" />
                </div>
                <div>
                  <label className="block text-xs font-mono uppercase tracking-widest text-on-surface-variant mb-2">Email</label>
                  <input type="email" value={form.email || ''} onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                    className="w-full bg-surface-container-highest border-none rounded-md px-4 py-3 text-sm focus:ring-1 focus:ring-primary/40 focus:outline-none" />
                </div>
                <div>
                  <label className="block text-xs font-mono uppercase tracking-widest text-on-surface-variant mb-2">Rol</label>
                  <select value={form.role} onChange={e => setForm(f => ({ ...f, role: e.target.value }))}
                    className="w-full bg-surface-container-highest border-none rounded-md px-4 py-3 text-sm focus:ring-1 focus:ring-primary/40 focus:outline-none">
                    <option value="USER">USER</option>
                    <option value="ADMIN">ADMIN</option>
                  </select>
                </div>
                <div className="flex items-end">
                  <div className={`flex items-center gap-2 px-4 py-3 rounded-lg text-sm font-mono ${userData.suspended ? 'bg-error/10 text-error' : 'bg-green-500/10 text-green-400'}`}>
                    <span className="material-symbols-outlined text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>{userData.suspended ? 'block' : 'check_circle'}</span>
                    {userData.suspended ? 'Cuenta suspendida' : 'Cuenta activa'}
                  </div>
                </div>
              </div>
              <button type="submit" disabled={saving}
                className="flex items-center gap-2 bg-primary-container text-on-primary-container px-5 py-2.5 rounded-lg font-headline font-bold text-xs uppercase tracking-widest hover:bg-primary hover:text-on-primary transition-all disabled:opacity-50">
                <span className="material-symbols-outlined text-sm">save</span>
                {saving ? 'Guardando…' : 'Guardar cambios'}
              </button>
            </form>
          </section>

          {/* Orders */}
          <section className="bg-surface rounded-xl shadow-2xl overflow-hidden">
            <div className="px-8 py-5 border-b border-outline-variant/10">
              <h3 className="font-headline font-bold text-lg">Historial de Pedidos ({orders.length})</h3>
            </div>
            {orders.length === 0 ? (
              <div className="text-center py-12 text-on-surface-variant">
                <span className="material-symbols-outlined text-4xl mb-2 block opacity-30">receipt_long</span>
                <p className="text-sm">Sin pedidos.</p>
              </div>
            ) : (
              <div className="divide-y divide-outline-variant/10">
                {orders.map(order => (
                  <div key={order.id} className="flex items-center justify-between px-8 py-4 hover:bg-surface-container-low transition-colors">
                    <div>
                      <p className="font-mono text-sm font-bold text-primary">#{order.id.slice(-8).toUpperCase()}</p>
                      <p className="text-xs text-on-surface-variant font-mono mt-0.5">
                        {new Date(order.createdAt).toLocaleDateString('es-PE', { day: 'numeric', month: 'short', year: 'numeric' })}
                      </p>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className="font-mono font-bold text-sm">${Number(order.total).toFixed(2)}</span>
                      <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest ${STATUS_COLORS[order.status] || ''}`}>
                        {order.status}
                      </span>
                      <Link to={`/admin/orders/${order.id}`} className="p-1.5 rounded-lg text-on-surface-variant hover:text-primary hover:bg-primary/10 transition-all no-underline">
                        <span className="material-symbols-outlined text-sm">open_in_new</span>
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>
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

export default AdminUserDetail;
