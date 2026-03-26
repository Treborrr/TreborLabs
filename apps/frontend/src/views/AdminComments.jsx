import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';

const API = import.meta.env.VITE_API_URL ?? '';

const AdminComments = () => {
  const { authFetch } = useAuth();
  const [comments, setComments] = useState([]);
  const [loading, setLoading]   = useState(true);
  const [search, setSearch]     = useState('');
  const [toast, setToast]       = useState('');

  const showToast = (msg) => { setToast(msg); setTimeout(() => setToast(''), 3000); };

  const load = () => {
    setLoading(true);
    authFetch(`${API}/api/admin/comments`)
      .then(r => r.json())
      .then(data => setComments(data.comments || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const handleDelete = async (id) => {
    if (!window.confirm('¿Eliminar este comentario?')) return;
    const res = await authFetch(`${API}/api/admin/comments/${id}`, { method: 'PATCH', body: JSON.stringify({ deleted: true }) });
    if (res.ok) {
      setComments(prev => prev.filter(c => c.id !== id));
      showToast('Comentario eliminado');
    }
  };

  const filtered = search
    ? comments.filter(c => {
        const q = search.toLowerCase();
        return c.content?.toLowerCase().includes(q)
          || c.user?.name?.toLowerCase().includes(q)
          || c.post?.title?.toLowerCase().includes(q);
      })
    : comments;

  return (
    <>
      <main className="min-h-screen bg-surface-container-low flex flex-col w-full">
        <header className="h-20 px-10 flex items-center justify-between bg-surface/50 backdrop-blur-md sticky top-0 z-40 border-b border-outline-variant/10">
          <div>
            <h2 className="font-headline font-bold text-2xl tracking-tight">Comentarios</h2>
            <p className="text-xs font-mono text-on-surface-variant">/root/admin/comments</p>
          </div>
          <div className="relative flex items-center bg-surface-container-high rounded-lg overflow-hidden focus-within:ring-1 ring-primary/40">
            <span className="material-symbols-outlined absolute left-3 text-on-surface-variant text-sm">search</span>
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Buscar por usuario, post o contenido..."
              className="bg-transparent border-none py-2.5 pl-10 pr-4 text-sm text-on-surface focus:ring-0 focus:outline-none w-72 placeholder:text-on-surface-variant/50"
            />
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
                <span className="material-symbols-outlined text-4xl mb-3 block opacity-30">comment</span>
                <p className="text-sm">{search ? 'Sin resultados' : 'No hay comentarios.'}</p>
              </div>
            ) : (
              <div className="divide-y divide-outline-variant/10">
                {filtered.map(c => (
                  <div key={c.id} className="p-6 hover:bg-surface-container-low transition-colors">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex items-start gap-4 flex-1 min-w-0">
                        <div className="w-9 h-9 rounded-full bg-primary-container/30 flex items-center justify-center flex-shrink-0">
                          <span className="font-bold text-xs text-primary">{(c.user?.name || 'U')[0].toUpperCase()}</span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-3 mb-1 flex-wrap">
                            <span className="font-bold text-sm text-on-surface">{c.user?.name || 'Usuario'}</span>
                            {c.post?.title && (
                              <span className="text-xs text-on-surface-variant font-mono truncate max-w-[200px]">
                                en: {c.post.title}
                              </span>
                            )}
                            {c.parentId && (
                              <span className="px-2 py-0.5 bg-surface-container-high text-on-surface-variant text-[10px] font-mono rounded">reply</span>
                            )}
                            <span className="text-xs text-on-surface-variant/50 font-mono">
                              {new Date(c.createdAt).toLocaleDateString('es-PE', { day: 'numeric', month: 'short', year: 'numeric' })}
                            </span>
                          </div>
                          <p className="text-sm text-on-surface-variant leading-relaxed">{c.content}</p>
                        </div>
                      </div>
                      <button
                        onClick={() => handleDelete(c.id)}
                        className="p-1.5 rounded-lg text-on-surface-variant hover:bg-error/10 hover:text-error transition-all flex-shrink-0"
                        title="Eliminar"
                      >
                        <span className="material-symbols-outlined text-sm">delete</span>
                      </button>
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

export default AdminComments;
