import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import InfoTooltip from '../components/InfoTooltip';
import { USER_TOOLTIPS } from '../constants/adminTooltips';

const API = import.meta.env.VITE_API_URL ?? '';

const ROLES = ['ALL', 'USER', 'ADMIN'];

const AdminUsers = () => {
  const { authFetch } = useAuth();
  const [users, setUsers]     = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch]   = useState('');
  const [roleFilter, setRoleFilter] = useState('ALL');
  const [toast, setToast]     = useState('');
  const [updatingId, setUpdatingId] = useState(null);

  const showToast = (msg) => { setToast(msg); setTimeout(() => setToast(''), 3000); };

  const load = useCallback(() => {
    setLoading(true);
    authFetch(`${API}/api/admin/users?limit=100`)
      .then(r => r.json())
      .then(data => setUsers(data.users || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => { load(); }, [load]);

  const handleRoleChange = async (userId, role) => {
    setUpdatingId(userId);
    try {
      const res = await authFetch(`${API}/api/admin/users/${userId}`, {
        method: 'PATCH',
        body: JSON.stringify({ role }),
      });
      if (res.ok) {
        setUsers(prev => prev.map(u => u.id === userId ? { ...u, role } : u));
        showToast('Rol actualizado');
      }
    } catch { } finally { setUpdatingId(null); }
  };

  const handleSuspend = async (userId, suspended) => {
    setUpdatingId(userId);
    try {
      const res = await authFetch(`${API}/api/admin/users/${userId}`, {
        method: 'PATCH',
        body: JSON.stringify({ suspended }),
      });
      if (res.ok) {
        setUsers(prev => prev.map(u => u.id === userId ? { ...u, suspended } : u));
        showToast(suspended ? 'Usuario suspendido' : 'Usuario reactivado');
      }
    } catch { } finally { setUpdatingId(null); }
  };

  const filtered = users.filter(u => {
    if (roleFilter !== 'ALL' && u.role !== roleFilter) return false;
    if (search) {
      const q = search.toLowerCase();
      return u.name?.toLowerCase().includes(q) || u.email?.toLowerCase().includes(q);
    }
    return true;
  });

  return (
    <>
      <main className="min-h-screen bg-surface-container-low flex flex-col w-full">
        <header className="h-20 px-10 flex items-center justify-between bg-surface/50 backdrop-blur-md sticky top-0 z-40 border-b border-outline-variant/10">
          <div>
            <h2 className="font-headline font-bold text-2xl tracking-tight">Usuarios</h2>
            <p className="text-xs font-mono text-on-surface-variant">/root/admin/users</p>
          </div>
          <div className="flex items-center gap-3">
            <div className="relative flex items-center gap-1">
              <div className="relative flex items-center bg-surface-container-high rounded-lg overflow-hidden focus-within:ring-1 ring-primary/40">
                <span className="material-symbols-outlined absolute left-3 text-on-surface-variant text-sm">search</span>
                <input
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  placeholder="Buscar usuario..."
                  className="bg-transparent border-none py-2.5 pl-10 pr-4 text-sm focus:ring-0 focus:outline-none w-56 placeholder:text-on-surface-variant/50"
                />
              </div>
              <InfoTooltip text={USER_TOOLTIPS.search} />
            </div>
            <div className="flex gap-1 p-1 bg-surface-container rounded-xl border border-outline-variant/10">
              {ROLES.map(r => (
                <button
                  key={r}
                  onClick={() => setRoleFilter(r)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-mono transition-all ${roleFilter === r ? 'bg-primary-container text-on-primary-container' : 'text-on-surface-variant hover:text-on-surface'}`}
                >
                  {r}
                </button>
              ))}
            </div>
          </div>
        </header>

        <div className="p-10 max-w-6xl">
          <section className="bg-surface rounded-xl shadow-2xl overflow-hidden">
            {loading ? (
              <div className="flex justify-center py-16">
                <div className="w-7 h-7 border-2 border-primary border-t-transparent rounded-full animate-spin" />
              </div>
            ) : filtered.length === 0 ? (
              <div className="text-center py-16 text-on-surface-variant">
                <span className="material-symbols-outlined text-4xl mb-3 block opacity-30">group</span>
                <p className="text-sm">Sin usuarios.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full min-w-[700px]">
                  <thead>
                    <tr className="border-b border-outline-variant/10 bg-surface-container">
                      {['Usuario', 'Email', 'Rol', 'Estado', 'Acciones'].map(h => (
                        <th key={h} className="px-5 py-3 text-left text-[10px] font-mono uppercase tracking-widest text-on-surface-variant">
                          {h}
                          {h === 'Rol' && <InfoTooltip text={USER_TOOLTIPS.roleFilter} />}
                          {h === 'Estado' && <InfoTooltip text={USER_TOOLTIPS.suspend} />}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-outline-variant/10">
                    {filtered.map(u => {
                      const isUpdating = updatingId === u.id;
                      return (
                        <tr key={u.id} className="hover:bg-surface-container-low transition-colors">
                          <td className="px-5 py-4">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-full bg-primary-container/30 flex items-center justify-center overflow-hidden flex-shrink-0">
                                {u.avatar
                                  ? <img src={u.avatar} alt={u.name} className="w-full h-full object-cover" />
                                  : <span className="font-bold text-xs text-primary">{(u.name || 'U')[0].toUpperCase()}</span>
                                }
                              </div>
                              <Link to={`/admin/users/${u.id}`} className="font-bold text-sm text-on-surface hover:text-primary transition-colors no-underline">
                                {u.name || '—'}
                              </Link>
                            </div>
                          </td>
                          <td className="px-5 py-4 text-sm font-mono text-on-surface-variant">{u.email}</td>
                          <td className="px-5 py-4">
                            <select
                              value={u.role}
                              disabled={isUpdating}
                              onChange={e => handleRoleChange(u.id, e.target.value)}
                              className="bg-surface-container-high border-none rounded-md px-2 py-1.5 text-xs font-mono focus:ring-1 focus:ring-primary/40 focus:outline-none cursor-pointer disabled:opacity-50"
                            >
                              <option value="USER">USER</option>
                              <option value="ADMIN">ADMIN</option>
                            </select>
                          </td>
                          <td className="px-5 py-4">
                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-widest ${u.suspended ? 'bg-error/10 text-error' : 'bg-green-500/10 text-green-400'}`}>
                              {u.suspended ? 'Suspendido' : 'Activo'}
                            </span>
                          </td>
                          <td className="px-5 py-4">
                            <div className="flex items-center gap-1">
                              <Link to={`/admin/users/${u.id}`}
                                className="p-1.5 rounded-lg text-on-surface-variant hover:bg-surface-container-high hover:text-primary transition-all no-underline"
                                title="Ver detalle">
                                <span className="material-symbols-outlined text-sm">open_in_new</span>
                              </Link>
                              <button
                                onClick={() => handleSuspend(u.id, !u.suspended)}
                                disabled={isUpdating}
                                className={`p-1.5 rounded-lg transition-all disabled:opacity-50 ${u.suspended ? 'text-green-400 hover:bg-green-500/10' : 'text-on-surface-variant hover:bg-error/10 hover:text-error'}`}
                                title={u.suspended ? 'Reactivar' : 'Suspender'}
                              >
                                <span className="material-symbols-outlined text-sm">{u.suspended ? 'person_add' : 'person_off'}</span>
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
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

export default AdminUsers;
