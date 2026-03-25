import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import AdminSidebar from '../components/AdminSidebar';

const API = import.meta.env.VITE_API_URL ?? '';

const statusStyles = {
  published: 'text-green-400 bg-green-400/10 border-green-400/30',
  draft:     'text-on-surface-variant bg-surface-container-highest border-outline-variant/30',
};

const AdminBlog = () => {
  const navigate = useNavigate();
  const { authFetch } = useAuth();

  const [posts, setPosts]           = useState([]);
  const [loading, setLoading]       = useState(true);
  const [activeFilter, setFilter]   = useState('todos');
  const [search, setSearch]         = useState('');
  const [toast, setToast]           = useState(null);

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  const loadPosts = async () => {
    setLoading(true);
    try {
      const res = await authFetch(`${API}/api/posts/all`);
      const data = await res.json();
      setPosts(data.posts || []);
    } catch {
      showToast('Error al cargar posts', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadPosts(); }, []);

  const handleDelete = async (id) => {
    if (!confirm('¿Eliminar este post? Esta acción no se puede deshacer.')) return;
    try {
      await authFetch(`${API}/api/posts/${id}`, { method: 'DELETE' });
      showToast('Post eliminado');
      loadPosts();
    } catch {
      showToast('Error al eliminar', 'error');
    }
  };

  const handleToggleStatus = async (post) => {
    const newStatus = post.status === 'published' ? 'draft' : 'published';
    try {
      await authFetch(`${API}/api/posts/${post.id}`, {
        method: 'PUT',
        body: JSON.stringify({ status: newStatus }),
      });
      showToast(newStatus === 'published' ? 'Post publicado' : 'Movido a borradores');
      loadPosts();
    } catch {
      showToast('Error al actualizar', 'error');
    }
  };

  const filtered = posts.filter(p => {
    const matchFilter = activeFilter === 'todos' || p.status === activeFilter;
    const matchSearch = !search || p.title.toLowerCase().includes(search.toLowerCase()) ||
      (p.category || '').toLowerCase().includes(search.toLowerCase());
    return matchFilter && matchSearch;
  });

  const formatDate = (dateStr) => {
    if (!dateStr) return '—';
    return new Date(dateStr).toLocaleDateString('es-ES', { day: 'numeric', month: 'short', year: 'numeric' });
  };

  return (
    <div className="flex bg-surface min-h-screen text-on-surface">
      <AdminSidebar />

      <main className="ml-64 min-h-screen bg-surface-container-low flex flex-col w-full">
        <header className="h-20 px-10 flex items-center justify-between bg-surface/50 backdrop-blur-md sticky top-0 z-40">
          <div>
            <h2 className="font-headline font-bold text-2xl text-on-surface tracking-tight">Blog Management</h2>
            <p className="text-xs font-mono text-on-surface-variant">/root/admin/blog_v4</p>
          </div>
          <button
            onClick={() => navigate('/admin/blog/new')}
            className="flex items-center gap-2 bg-gradient-to-br from-primary to-primary-container text-on-primary px-5 py-2.5 rounded-md font-headline font-bold text-xs uppercase tracking-widest shadow-[0_0_15px_rgba(214,186,255,0.2)] hover:shadow-[0_0_25px_rgba(214,186,255,0.3)] transition-all active:scale-95"
          >
            <span className="material-symbols-outlined text-sm">add</span>
            Nuevo Post
          </button>
        </header>

        <div className="p-10 space-y-8">
          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {[
              { label: 'Total Posts',  value: posts.length, icon: 'article', color: 'text-on-surface' },
              { label: 'Publicados',   value: posts.filter(p => p.status === 'published').length, icon: 'public', color: 'text-green-400' },
              { label: 'Borradores',   value: posts.filter(p => p.status === 'draft').length, icon: 'edit_note', color: 'text-on-surface-variant' },
              { label: 'Total Vistas', value: '—', icon: 'visibility', color: 'text-primary' },
            ].map(({ label, value, icon, color }) => (
              <div key={label} className="bg-surface-container-high p-5 rounded-xl relative overflow-hidden">
                <span className={`material-symbols-outlined absolute top-3 right-3 text-3xl opacity-10 ${color}`}>{icon}</span>
                <p className="text-xs font-mono tracking-widest uppercase text-on-surface-variant mb-2">{label}</p>
                <p className={`text-3xl font-headline font-black ${color}`}>{value}</p>
              </div>
            ))}
          </div>

          {/* Table */}
          <section className="bg-surface p-8 rounded-xl shadow-2xl">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-8">
              <div className="relative flex items-center bg-surface-container-high rounded-lg overflow-hidden focus-within:ring-1 ring-primary/40 transition-all">
                <span className="material-symbols-outlined absolute left-3 text-on-surface-variant text-sm">search</span>
                <input
                  className="bg-transparent border-none py-2.5 pl-10 pr-4 text-sm text-on-surface focus:ring-0 placeholder:text-on-surface-variant/50 w-64"
                  placeholder="Buscar post o categoría..."
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                />
              </div>
              <div className="flex gap-1 p-1 bg-surface-container rounded-xl border border-outline-variant/10">
                {[
                  { key: 'todos', label: 'Todos' },
                  { key: 'published', label: 'Publicados' },
                  { key: 'draft', label: 'Borradores' },
                ].map(({ key, label }) => (
                  <button
                    key={key}
                    onClick={() => setFilter(key)}
                    className={`px-4 py-2 rounded-lg text-xs font-medium transition-all ${activeFilter === key ? 'bg-primary-container text-on-primary-container shadow' : 'text-on-surface-variant hover:text-on-surface'}`}
                  >{label}</button>
                ))}
              </div>
            </div>

            {loading ? (
              <div className="flex justify-center py-16">
                <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-outline-variant/20">
                      {['Título', 'Categoría', 'Autor', 'Fecha', 'Estado', 'Acciones'].map(h => (
                        <th key={h} className="text-left pb-4 text-[10px] font-mono tracking-widest text-on-surface-variant uppercase pr-4">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-outline-variant/10">
                    {filtered.map(post => (
                      <tr key={post.id} className="hover:bg-surface-container-low transition-colors group">
                        <td className="py-4 pr-4 max-w-xs">
                          <p className="font-headline font-bold text-sm truncate">{post.title}</p>
                          <p className="text-[10px] font-mono text-on-surface-variant truncate">{post.slug}</p>
                        </td>
                        <td className="py-4 pr-4">
                          {post.category
                            ? <span className="px-3 py-1 bg-primary/10 text-primary border border-primary/20 rounded-full text-[10px] font-mono tracking-widest">{post.category}</span>
                            : <span className="text-on-surface-variant text-xs">—</span>
                          }
                        </td>
                        <td className="py-4 pr-4">
                          <span className="text-sm text-on-surface-variant">{post.author?.name || '—'}</span>
                        </td>
                        <td className="py-4 pr-4">
                          <span className="font-mono text-xs text-on-surface-variant">
                            {formatDate(post.publishedAt || post.createdAt)}
                          </span>
                        </td>
                        <td className="py-4 pr-4">
                          <button
                            onClick={() => handleToggleStatus(post)}
                            className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest border transition-all hover:opacity-80 ${statusStyles[post.status]}`}
                          >
                            {post.status === 'published' ? 'Publicado' : 'Borrador'}
                          </button>
                        </td>
                        <td className="py-4">
                          <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button
                              onClick={() => navigate(`/admin/blog/${post.id}/edit`)}
                              className="text-on-surface-variant hover:text-primary transition-colors"
                              title="Editar"
                            >
                              <span className="material-symbols-outlined text-sm">edit</span>
                            </button>
                            <button
                              onClick={() => handleDelete(post.id)}
                              className="text-on-surface-variant hover:text-error transition-colors"
                              title="Eliminar"
                            >
                              <span className="material-symbols-outlined text-sm">delete</span>
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {filtered.length === 0 && (
                  <div className="text-center py-16 text-on-surface-variant">
                    <span className="material-symbols-outlined text-4xl mb-3 block">article</span>
                    <p className="font-mono text-sm">Sin posts para este filtro</p>
                  </div>
                )}
              </div>
            )}
          </section>
        </div>
      </main>

      {toast && (
        <div className={`fixed bottom-6 right-6 z-[200] px-6 py-3 rounded-xl shadow-2xl text-sm font-bold ${toast.type === 'error' ? 'bg-error text-on-error' : 'bg-primary-container text-on-primary-container'}`}>
          {toast.msg}
        </div>
      )}
    </div>
  );
};

export default AdminBlog;
