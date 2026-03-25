import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';

const sidebarLinks = [
  { path: '/admin', label: 'Products', icon: 'inventory_2' },
  { path: '/admin/orders', label: 'Orders', icon: 'shopping_bag' },
  { path: '/admin/blog', label: 'Blog', icon: 'article' },
  { path: '/admin-settings', label: 'Settings', icon: 'settings' },
];

const initialPosts = [
  { id: 1, title: 'El Arte del Teclado Mecánico: Guía Completa para Beginners', category: 'Hardware', author: 'Trebor Labs', date: '20 Mar 2026', views: 3420, status: 'Published' },
  { id: 2, title: 'Raspberry Pi 5: Un Análisis Técnico a Fondo', category: 'Tutorials', author: 'Trebor Labs', date: '15 Feb 2026', views: 2180, status: 'Published' },
  { id: 3, title: 'QMK Firmware: Configuración Avanzada de Macros', category: 'Tutorials', author: 'Trebor Labs', date: '10 Ene 2026', views: 1750, status: 'Published' },
  { id: 4, title: 'Switches Trebor Violet: Diseño y Especificaciones', category: 'Hardware', author: 'Trebor Labs', date: '05 Dic 2025', views: 980, status: 'Published' },
  { id: 5, title: 'Tres meses con el Split v1: Review completa', category: 'Hardware', author: 'Trebor Labs', date: '—', views: 0, status: 'Draft' },
  { id: 6, title: 'GPIO en Pi 5: guía práctica para makers', category: 'Tutorials', author: 'Trebor Labs', date: '—', views: 0, status: 'Draft' },
];

const statusStyles = {
  Published: 'text-green-400 bg-green-400/10 border-green-400/30',
  Draft:     'text-on-surface-variant bg-surface-container-highest border-outline-variant/30',
};

const AdminBlog = () => {
  const location = useLocation();
  const [posts, setPosts] = useState(initialPosts);
  const [activeFilter, setActiveFilter] = useState('Todos');
  const [search, setSearch] = useState('');
  const [showNewModal, setShowNewModal] = useState(false);
  const [newPost, setNewPost] = useState({ title: '', category: 'Hardware' });

  const filtered = posts.filter(p => {
    const matchFilter = activeFilter === 'Todos' || p.status === activeFilter;
    const matchSearch = p.title.toLowerCase().includes(search.toLowerCase()) ||
      p.category.toLowerCase().includes(search.toLowerCase());
    return matchFilter && matchSearch;
  });

  const handleDelete = (id) => setPosts(prev => prev.filter(p => p.id !== id));

  const handleCreate = () => {
    if (!newPost.title.trim()) return;
    setPosts(prev => [...prev, {
      id: Date.now(),
      title: newPost.title,
      category: newPost.category,
      author: 'Trebor Labs',
      date: '—',
      views: 0,
      status: 'Draft',
    }]);
    setNewPost({ title: '', category: 'Hardware' });
    setShowNewModal(false);
  };

  return (
    <div className="flex bg-surface min-h-screen text-on-surface">
      {/* Sidebar */}
      <aside className="h-screen w-64 fixed left-0 top-0 bg-[#131315] flex flex-col border-r border-primary/15 z-50">
        <div className="p-8">
          <h1 className="text-primary font-bold text-lg font-headline tracking-tight">Trebor Admin</h1>
          <p className="font-mono text-[10px] tracking-widest text-on-surface-variant/60 uppercase mt-1">Technical Tactician</p>
        </div>
        <nav className="flex-1 mt-4">
          {sidebarLinks.map((link) => {
            const isActive = location.pathname === link.path;
            return (
              <Link
                key={link.path}
                to={link.path}
                className={`flex items-center gap-3 px-6 py-4 transition-all no-underline ${
                  isActive
                    ? 'bg-primary-container/20 text-primary border-r-4 border-primary'
                    : 'text-gray-500 hover:bg-surface-container-high hover:text-white'
                }`}
              >
                <span className="material-symbols-outlined">{link.icon}</span>
                <span className="font-mono text-xs tracking-widest">{link.label}</span>
              </Link>
            );
          })}
        </nav>
        <div className="p-6 mt-auto">
          <div className="flex items-center gap-3 mb-6 px-2">
            <div className="w-8 h-8 rounded-full bg-primary-container flex items-center justify-center">
              <span className="text-white font-bold text-sm">R</span>
            </div>
            <div>
              <p className="text-xs font-bold text-on-surface">Trebor Labs</p>
              <p className="text-[10px] text-on-surface-variant">System Lead</p>
            </div>
          </div>
          <button
            onClick={() => setShowNewModal(true)}
            className="w-full bg-gradient-to-br from-primary to-primary-container text-on-primary py-3 rounded-md font-headline font-bold text-xs uppercase tracking-widest shadow-[0_0_15px_rgba(214,186,255,0.2)] active:scale-95 transition-all"
          >
            New Post
          </button>
        </div>
      </aside>

      {/* Content */}
      <main className="ml-64 min-h-screen bg-surface-container-low flex flex-col w-full">
        <header className="h-20 px-10 flex items-center justify-between bg-surface/50 backdrop-blur-md sticky top-0 z-40">
          <div>
            <h2 className="font-headline font-bold text-2xl text-on-surface tracking-tight">Blog Management</h2>
            <p className="text-xs font-mono text-on-surface-variant">/root/admin/blog_v4</p>
          </div>
          <button
            onClick={() => setShowNewModal(true)}
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
              { label: 'Total Posts', value: posts.length, icon: 'article', color: 'text-on-surface' },
              { label: 'Publicados', value: posts.filter(p => p.status === 'Published').length, icon: 'public', color: 'text-green-400' },
              { label: 'Borradores', value: posts.filter(p => p.status === 'Draft').length, icon: 'edit_note', color: 'text-on-surface-variant' },
              { label: 'Total Vistas', value: posts.reduce((s, p) => s + p.views, 0).toLocaleString(), icon: 'visibility', color: 'text-primary' },
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
                {['Todos', 'Published', 'Draft'].map((f) => (
                  <button
                    key={f}
                    onClick={() => setActiveFilter(f)}
                    className={`px-4 py-2 rounded-lg text-xs font-medium transition-all ${activeFilter === f ? 'bg-primary-container text-on-primary-container shadow' : 'text-on-surface-variant hover:text-on-surface'}`}
                  >
                    {f}
                  </button>
                ))}
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-outline-variant/20">
                    {['Título', 'Categoría', 'Autor', 'Fecha', 'Vistas', 'Estado', 'Acciones'].map((h) => (
                      <th key={h} className="text-left pb-4 text-[10px] font-mono tracking-widest text-on-surface-variant uppercase pr-4">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-outline-variant/10">
                  {filtered.map((post) => (
                    <tr key={post.id} className="hover:bg-surface-container-low transition-colors group">
                      <td className="py-4 pr-4 max-w-xs">
                        <p className="font-headline font-bold text-sm truncate">{post.title}</p>
                      </td>
                      <td className="py-4 pr-4">
                        <span className="px-3 py-1 bg-primary/10 text-primary border border-primary/20 rounded-full text-[10px] font-mono tracking-widest">{post.category}</span>
                      </td>
                      <td className="py-4 pr-4">
                        <span className="text-sm text-on-surface-variant">{post.author}</span>
                      </td>
                      <td className="py-4 pr-4">
                        <span className="font-mono text-xs text-on-surface-variant">{post.date}</span>
                      </td>
                      <td className="py-4 pr-4">
                        <span className="font-mono text-sm text-on-surface">{post.views.toLocaleString()}</span>
                      </td>
                      <td className="py-4 pr-4">
                        <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest border ${statusStyles[post.status]}`}>
                          {post.status}
                        </span>
                      </td>
                      <td className="py-4">
                        <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button className="text-on-surface-variant hover:text-primary transition-colors" title="Editar">
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
          </section>
        </div>
      </main>

      {/* New Post Modal */}
      {showNewModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-surface/80 backdrop-blur-sm">
          <div className="bg-surface-container-high rounded-xl p-8 w-full max-w-md border border-outline-variant/20 shadow-2xl">
            <div className="flex justify-between items-center mb-6">
              <h3 className="font-headline font-bold text-xl">Nuevo Post</h3>
              <button onClick={() => setShowNewModal(false)} className="text-on-surface-variant hover:text-primary transition-colors">
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            <div className="space-y-5">
              <div>
                <label className="block text-xs font-mono uppercase tracking-widest text-on-surface-variant mb-2">Título</label>
                <input
                  type="text"
                  value={newPost.title}
                  onChange={e => setNewPost(p => ({ ...p, title: e.target.value }))}
                  placeholder="Título del artículo..."
                  className="w-full bg-surface-container-highest border-none rounded-md px-4 py-3 text-sm text-on-surface focus:ring-1 focus:ring-primary/40 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-mono uppercase tracking-widest text-on-surface-variant mb-2">Categoría</label>
                <select
                  value={newPost.category}
                  onChange={e => setNewPost(p => ({ ...p, category: e.target.value }))}
                  className="w-full bg-surface-container-highest border-none rounded-md px-4 py-3 text-sm text-on-surface focus:ring-1 focus:ring-primary/40 focus:outline-none"
                >
                  {['Hardware', 'Tutorials', 'Community', 'News'].map(c => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>
            </div>
            <div className="flex gap-3 mt-8">
              <button
                onClick={() => setShowNewModal(false)}
                className="flex-1 py-3 border border-outline-variant/30 rounded-md text-sm text-on-surface-variant hover:bg-surface-container-highest transition-all"
              >
                Cancelar
              </button>
              <button
                onClick={handleCreate}
                className="flex-1 py-3 bg-gradient-to-br from-primary to-primary-container text-on-primary rounded-md font-headline font-bold text-sm uppercase tracking-widest active:scale-95 transition-all"
              >
                Crear Borrador
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminBlog;
