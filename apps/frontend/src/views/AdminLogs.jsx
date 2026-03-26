import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';

const API = import.meta.env.VITE_API_URL ?? '';

const TYPE_ICON = {
  user: 'person', order: 'receipt_long', product: 'inventory_2', post: 'article',
};

const AdminLogs = () => {
  const { authFetch } = useAuth();
  const [logs, setLogs]       = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage]       = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const PER_PAGE = 30;

  const load = (pg = 1) => {
    setLoading(true);
    const params = new URLSearchParams({ limit: PER_PAGE, offset: (pg - 1) * PER_PAGE });
    authFetch(`${API}/api/admin/logs?${params}`)
      .then(r => r.json())
      .then(data => {
        setLogs(prev => pg === 1 ? (data.logs || []) : [...prev, ...(data.logs || [])]);
        setHasMore((data.logs || []).length === PER_PAGE);
        setPage(pg);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(1); }, []);

  return (
    <main className="min-h-screen bg-surface-container-low flex flex-col w-full">
      <header className="h-20 px-10 flex items-center justify-between bg-surface/50 backdrop-blur-md sticky top-0 z-40 border-b border-outline-variant/10">
        <div>
          <h2 className="font-headline font-bold text-2xl tracking-tight">Activity Log</h2>
          <p className="text-xs font-mono text-on-surface-variant">/root/admin/logs</p>
        </div>
        <button onClick={() => load(1)} className="flex items-center gap-2 bg-surface-container-high px-4 py-2.5 rounded-lg text-xs font-mono hover:bg-surface-container-highest transition-colors">
          <span className="material-symbols-outlined text-sm">refresh</span>
          Actualizar
        </button>
      </header>

      <div className="p-10 max-w-5xl">
        <section className="bg-surface rounded-xl shadow-2xl overflow-hidden">
          {loading && logs.length === 0 ? (
            <div className="flex justify-center py-16">
              <div className="w-7 h-7 border-2 border-primary border-t-transparent rounded-full animate-spin" />
            </div>
          ) : logs.length === 0 ? (
            <div className="text-center py-16 text-on-surface-variant">
              <span className="material-symbols-outlined text-4xl mb-3 block opacity-30">history</span>
              <p className="text-sm">Sin actividad registrada.</p>
            </div>
          ) : (
            <>
              <div className="divide-y divide-outline-variant/10">
                {logs.map(log => (
                  <div key={log.id} className="flex items-start gap-4 px-6 py-4 hover:bg-surface-container-low transition-colors">
                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <span className="material-symbols-outlined text-primary text-sm">{TYPE_ICON[log.targetType] || 'info'}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-bold text-sm text-on-surface">{log.admin?.name || 'Admin'}</span>
                        <span className="text-sm text-on-surface-variant">{log.action}</span>
                        <span className="font-mono text-xs text-primary bg-primary/10 px-2 py-0.5 rounded">{log.targetType}:{log.targetId?.slice(-6).toUpperCase()}</span>
                      </div>
                      {log.payload && Object.keys(log.payload).length > 0 && (
                        <p className="text-xs text-on-surface-variant/60 font-mono mt-1 truncate">
                          {JSON.stringify(log.payload)}
                        </p>
                      )}
                    </div>
                    <span className="text-xs text-on-surface-variant/50 font-mono flex-shrink-0">
                      {new Date(log.createdAt).toLocaleDateString('es-PE', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                ))}
              </div>
              {hasMore && (
                <div className="px-6 py-4 border-t border-outline-variant/10">
                  <button onClick={() => load(page + 1)} disabled={loading}
                    className="w-full py-2.5 border border-outline-variant/20 rounded-lg text-xs font-mono text-on-surface-variant hover:bg-surface-container-high transition-all disabled:opacity-50">
                    {loading ? 'Cargando…' : 'Cargar más'}
                  </button>
                </div>
              )}
            </>
          )}
        </section>
      </div>
    </main>
  );
};

export default AdminLogs;
