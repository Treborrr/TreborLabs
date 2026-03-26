import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';

const API = import.meta.env.VITE_API_URL ?? '';

const STATUS_STYLES = {
  pending:   'text-amber-400 bg-amber-400/10 border-amber-400/30',
  approved:  'text-green-400 bg-green-400/10 border-green-400/30',
  rejected:  'text-error bg-error/10 border-error/30',
  completed: 'text-on-surface-variant bg-surface-container-highest border-outline-variant/20',
};
const STATUS_LABELS = { pending: 'Pendiente', approved: 'Aprobada', rejected: 'Rechazada', completed: 'Completada' };
const STATUSES = Object.keys(STATUS_LABELS);

const AdminReturns = () => {
  const { authFetch } = useAuth();
  const [returns, setReturns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter]   = useState('ALL');
  const [modal, setModal]     = useState(null); // { returnId, status, note }
  const [saving, setSaving]   = useState(false);
  const [toast, setToast]     = useState('');

  const showToast = (msg) => { setToast(msg); setTimeout(() => setToast(''), 3000); };

  const load = () => {
    setLoading(true);
    authFetch(`${API}/api/admin/returns`)
      .then(r => r.json())
      .then(data => setReturns(data.returns || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const handleResolve = async () => {
    if (!modal) return;
    setSaving(true);
    try {
      const res = await authFetch(`${API}/api/admin/returns/${modal.returnId}`, {
        method: 'PATCH',
        body: JSON.stringify({ status: modal.status, adminNotes: modal.note }),
      });
      const data = await res.json();
      if (res.ok) {
        setReturns(prev => prev.map(r => r.id === modal.returnId ? data.return : r));
        setModal(null);
        showToast('Solicitud actualizada');
      } else showToast(data.error || 'Error');
    } catch { showToast('Error de conexión'); }
    finally { setSaving(false); }
  };

  const filtered = filter === 'ALL' ? returns : returns.filter(r => r.status === filter);

  return (
    <>
      <main className="min-h-screen bg-surface-container-low flex flex-col w-full">
        <header className="h-20 px-10 flex items-center justify-between bg-surface/50 backdrop-blur-md sticky top-0 z-40 border-b border-outline-variant/10">
          <div>
            <h2 className="font-headline font-bold text-2xl tracking-tight">Devoluciones</h2>
            <p className="text-xs font-mono text-on-surface-variant">/root/admin/returns</p>
          </div>
          <div className="flex gap-1 p-1 bg-surface-container rounded-xl border border-outline-variant/10">
            {['ALL', ...STATUSES].map(s => (
              <button key={s} onClick={() => setFilter(s)}
                className={`px-3 py-1.5 rounded-lg text-xs font-mono transition-all ${filter === s ? 'bg-primary-container text-on-primary-container' : 'text-on-surface-variant hover:text-on-surface'}`}>
                {s === 'ALL' ? 'Todos' : STATUS_LABELS[s]}
              </button>
            ))}
          </div>
        </header>

        <div className="p-10 max-w-5xl">
          <section className="bg-surface rounded-xl shadow-2xl overflow-hidden">
            {loading ? (
              <div className="flex justify-center py-16">
                <div className="w-7 h-7 border-2 border-primary border-t-transparent rounded-full animate-spin" />
              </div>
            ) : filtered.length === 0 ? (
              <div className="text-center py-16 text-on-surface-variant">
                <span className="material-symbols-outlined text-4xl mb-3 block opacity-30">assignment_return</span>
                <p className="text-sm">Sin solicitudes de devolución.</p>
              </div>
            ) : (
              <div className="divide-y divide-outline-variant/10">
                {filtered.map(ret => (
                  <div key={ret.id} className="p-6 hover:bg-surface-container-low transition-colors">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 min-w-0 space-y-2">
                        <div className="flex items-center gap-3 flex-wrap">
                          <span className="font-mono text-sm font-bold text-primary">Pedido #{ret.orderId?.slice(-8).toUpperCase()}</span>
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-widest border ${STATUS_STYLES[ret.status] || ''}`}>
                            {STATUS_LABELS[ret.status] || ret.status}
                          </span>
                          <span className="text-xs text-on-surface-variant font-mono">
                            {new Date(ret.requestedAt).toLocaleDateString('es-PE', { day: 'numeric', month: 'short', year: 'numeric' })}
                          </span>
                        </div>
                        <p className="text-sm text-on-surface-variant"><span className="font-bold text-on-surface">Motivo:</span> {ret.reason}</p>
                        {ret.user && (
                          <p className="text-xs text-on-surface-variant font-mono">{ret.user.name} · {ret.user.email}</p>
                        )}
                        {ret.adminNotes && (
                          <p className="text-xs text-on-surface-variant/70 italic">Nota: {ret.adminNotes}</p>
                        )}
                      </div>
                      {ret.status === 'pending' && (
                        <button
                          onClick={() => setModal({ returnId: ret.id, status: 'approved', note: '' })}
                          className="flex items-center gap-1.5 px-3 py-2 bg-primary-container text-on-primary-container rounded-lg text-xs font-bold hover:bg-primary hover:text-on-primary transition-all flex-shrink-0"
                        >
                          <span className="material-symbols-outlined text-sm">assignment</span>
                          Resolver
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>
        </div>
      </main>

      {/* Modal */}
      {modal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-surface rounded-2xl shadow-2xl w-full max-w-md p-8 space-y-5">
            <h3 className="font-headline font-bold text-lg">Resolver Solicitud</h3>
            <div>
              <label className="block text-xs font-mono uppercase tracking-widest text-on-surface-variant mb-2">Resolución</label>
              <select value={modal.status} onChange={e => setModal(m => ({ ...m, status: e.target.value }))}
                className="w-full bg-surface-container-highest border-none rounded-md px-4 py-3 text-sm focus:ring-1 focus:ring-primary/40 focus:outline-none">
                <option value="approved">Aprobada</option>
                <option value="rejected">Rechazada</option>
                <option value="completed">Completada</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-mono uppercase tracking-widest text-on-surface-variant mb-2">Nota para el cliente</label>
              <textarea value={modal.note} onChange={e => setModal(m => ({ ...m, note: e.target.value }))} rows={3}
                placeholder="Motivo de la resolución..."
                className="w-full bg-surface-container-highest border-none rounded-md px-4 py-3 text-sm focus:ring-1 focus:ring-primary/40 focus:outline-none resize-none" />
            </div>
            <div className="flex gap-3 pt-2">
              <button onClick={handleResolve} disabled={saving}
                className="flex-1 bg-primary-container text-on-primary-container py-2.5 rounded-lg font-headline font-bold text-xs uppercase tracking-widest hover:bg-primary hover:text-on-primary transition-all disabled:opacity-50">
                {saving ? 'Guardando…' : 'Confirmar'}
              </button>
              <button onClick={() => setModal(null)}
                className="px-4 py-2.5 rounded-lg font-mono text-xs text-on-surface-variant hover:bg-surface-container-highest transition-all">
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}

      {toast && (
        <div className="fixed bottom-6 right-6 z-[200] px-6 py-3 rounded-xl shadow-2xl text-sm font-bold bg-primary-container text-on-primary-container">
          {toast}
        </div>
      )}
    </>
  );
};

export default AdminReturns;
