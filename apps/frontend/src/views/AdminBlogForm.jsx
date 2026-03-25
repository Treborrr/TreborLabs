import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { marked } from 'marked';
import { useAuth } from '../context/AuthContext';
import AdminSidebar from '../components/AdminSidebar';

const API = import.meta.env.VITE_API_URL ?? '';
const LS_KEY = 'trebor_blog_draft';

const generateSlug = (text) =>
  text.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '').replace(/-+/g, '-').replace(/^-|-$/g, '');

const AdminBlogForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { authFetch, user } = useAuth();
  const isEdit = Boolean(id);

  const [loading, setLoading]     = useState(isEdit);
  const [saving, setSaving]       = useState(false);
  const [uploading, setUploading] = useState(false);
  const [toast, setToast]         = useState(null);
  const [preview, setPreview]     = useState(false);
  const autoSaveRef               = useRef(null);

  const [form, setForm] = useState({
    title: '', slug: '', category: '', excerpt: '',
    coverImage: '', status: 'draft', content: '',
  });

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  };

  const set = (key, value) => setForm(f => ({ ...f, [key]: value }));

  const handleTitleChange = (e) => {
    const title = e.target.value;
    setForm(f => ({ ...f, title, slug: generateSlug(title) }));
  };

  // Pre-fill en modo edición, o cargar borrador local en modo creación
  useEffect(() => {
    if (isEdit) {
      (async () => {
        try {
          const token = localStorage.getItem('trebor_token');
          const res = await fetch(`${API}/api/posts/${id}`, {
            headers: token ? { Authorization: `Bearer ${token}` } : {},
          });
          const data = await res.json();
          if (data.post) {
            const p = data.post;
            setForm({
              title: p.title, slug: p.slug, category: p.category || '',
              excerpt: p.excerpt || '', coverImage: p.coverImage || '',
              status: p.status, content: p.content,
            });
          }
        } catch {
          showToast('Error al cargar el post', 'error');
        } finally {
          setLoading(false);
        }
      })();
    } else {
      // Restaurar borrador local si existe
      const saved = localStorage.getItem(LS_KEY);
      if (saved) {
        try { setForm(JSON.parse(saved)); } catch { /* ignore */ }
      }
      setLoading(false);
    }
  }, [id, isEdit]);

  // Auto-save draft al localStorage cada 30s (solo en create)
  useEffect(() => {
    if (isEdit) return;
    autoSaveRef.current = setInterval(() => {
      localStorage.setItem(LS_KEY, JSON.stringify(form));
    }, 30_000);
    return () => clearInterval(autoSaveRef.current);
  }, [form, isEdit]);

  const handleCoverUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const token = localStorage.getItem('trebor_token');
      const fd = new FormData();
      fd.append('file', file);
      const res = await fetch(`${API}/api/admin/upload`, {
        method: 'POST',
        headers: token ? { Authorization: `Bearer ${token}` } : {},
        body: fd,
      });
      const data = await res.json();
      if (data.url) set('coverImage', data.url);
      else showToast('Error al subir imagen', 'error');
    } catch {
      showToast('Error al subir imagen', 'error');
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.title || !form.content) {
      return showToast('Título y contenido son requeridos', 'error');
    }
    setSaving(true);
    try {
      const url = isEdit ? `${API}/api/posts/${id}` : `${API}/api/posts`;
      const method = isEdit ? 'PUT' : 'POST';
      const res = await authFetch(url, {
        method,
        body: JSON.stringify({ ...form, authorId: user?.id }),
      });
      if (res.ok) {
        if (!isEdit) localStorage.removeItem(LS_KEY);
        showToast(isEdit ? 'Post actualizado' : 'Post creado');
        setTimeout(() => navigate('/admin/blog'), 1200);
      } else {
        const data = await res.json();
        showToast(data.error || 'Error al guardar', 'error');
      }
    } catch {
      showToast('Error de conexión', 'error');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex bg-surface min-h-screen">
        <AdminSidebar />
        <main className="ml-64 flex-1 flex items-center justify-center">
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
        </main>
      </div>
    );
  }

  return (
    <div className="flex bg-surface min-h-screen text-on-surface">
      <AdminSidebar />

      <main className="ml-64 min-h-screen bg-surface-container-low flex flex-col w-full">
        <header className="h-20 px-10 flex items-center justify-between bg-surface/50 backdrop-blur-md sticky top-0 z-40">
          <div>
            <h2 className="font-headline font-bold text-2xl tracking-tight">
              {isEdit ? 'Editar Post' : 'Nuevo Post'}
            </h2>
            <p className="text-xs font-mono text-on-surface-variant">/root/admin/blog/{isEdit ? id : 'new'}</p>
          </div>
          <button
            onClick={() => navigate('/admin/blog')}
            className="text-on-surface-variant hover:text-primary transition-colors flex items-center gap-2 text-sm"
          >
            <span className="material-symbols-outlined text-sm">arrow_back</span> Volver
          </button>
        </header>

        <form onSubmit={handleSubmit} className="p-10 space-y-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main editor */}
            <div className="lg:col-span-2 space-y-6">
              {/* Title + Slug */}
              <section className="bg-surface p-8 rounded-xl shadow-2xl space-y-4">
                <div>
                  <label className="block text-xs font-mono uppercase tracking-widest text-on-surface-variant mb-2">Título *</label>
                  <input
                    type="text" value={form.title} onChange={handleTitleChange} required
                    className="w-full bg-surface-container-highest border-none rounded-md px-4 py-3 text-sm text-on-surface focus:ring-1 focus:ring-primary/40 focus:outline-none text-lg font-headline"
                    placeholder="Título del artículo..."
                  />
                </div>
                <div>
                  <label className="block text-xs font-mono uppercase tracking-widest text-on-surface-variant mb-2">Slug</label>
                  <input
                    type="text" value={form.slug} onChange={e => set('slug', e.target.value)}
                    className="w-full bg-surface-container-highest border-none rounded-md px-4 py-3 text-sm text-on-surface focus:ring-1 focus:ring-primary/40 focus:outline-none font-mono"
                    placeholder="slug-del-articulo"
                  />
                </div>
              </section>

              {/* Markdown editor + preview */}
              <section className="bg-surface p-8 rounded-xl shadow-2xl space-y-4">
                <div className="flex justify-between items-center">
                  <h3 className="font-headline font-bold text-lg">Contenido *</h3>
                  <button
                    type="button"
                    onClick={() => setPreview(v => !v)}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-mono transition-all ${preview ? 'bg-primary-container text-on-primary-container' : 'bg-surface-container-high text-on-surface-variant hover:text-on-surface'}`}
                  >
                    <span className="material-symbols-outlined text-sm">{preview ? 'edit' : 'preview'}</span>
                    {preview ? 'Editar' : 'Preview'}
                  </button>
                </div>

                {!preview ? (
                  <textarea
                    value={form.content}
                    onChange={e => set('content', e.target.value)}
                    rows={20}
                    className="w-full bg-surface-container-highest border-none rounded-md px-4 py-3 text-sm text-on-surface focus:ring-1 focus:ring-primary/40 focus:outline-none font-mono resize-y"
                    placeholder="# Título del artículo&#10;&#10;Escribe tu contenido en **Markdown**..."
                  />
                ) : (
                  <div
                    className="min-h-[480px] bg-surface-container-highest rounded-md px-6 py-4 prose prose-invert prose-sm max-w-none"
                    dangerouslySetInnerHTML={{ __html: marked.parse(form.content || '*Sin contenido aún...*') }}
                  />
                )}
              </section>

              {/* Excerpt */}
              <section className="bg-surface p-8 rounded-xl shadow-2xl">
                <label className="block text-xs font-mono uppercase tracking-widest text-on-surface-variant mb-2">Extracto (resumen)</label>
                <textarea
                  value={form.excerpt} onChange={e => set('excerpt', e.target.value)} rows={3}
                  className="w-full bg-surface-container-highest border-none rounded-md px-4 py-3 text-sm text-on-surface focus:ring-1 focus:ring-primary/40 focus:outline-none resize-none"
                  placeholder="Breve resumen para listados y SEO..."
                />
              </section>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Status + Category */}
              <section className="bg-surface p-6 rounded-xl shadow-2xl space-y-4">
                <h3 className="font-headline font-bold text-base">Publicación</h3>
                <div>
                  <label className="block text-xs font-mono uppercase tracking-widest text-on-surface-variant mb-2">Estado</label>
                  <select
                    value={form.status} onChange={e => set('status', e.target.value)}
                    className="w-full bg-surface-container-highest border-none rounded-md px-4 py-3 text-sm text-on-surface focus:ring-1 focus:ring-primary/40 focus:outline-none"
                  >
                    <option value="draft">Borrador</option>
                    <option value="published">Publicado</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-mono uppercase tracking-widest text-on-surface-variant mb-2">Categoría</label>
                  <input
                    type="text" value={form.category} onChange={e => set('category', e.target.value)}
                    className="w-full bg-surface-container-highest border-none rounded-md px-4 py-3 text-sm text-on-surface focus:ring-1 focus:ring-primary/40 focus:outline-none"
                    placeholder="Hardware, Tutorial, Review…"
                  />
                </div>
              </section>

              {/* Cover image */}
              <section className="bg-surface p-6 rounded-xl shadow-2xl space-y-4">
                <h3 className="font-headline font-bold text-base">Imagen de portada</h3>
                {form.coverImage && (
                  <div className="relative rounded-lg overflow-hidden aspect-video bg-surface-container-high">
                    <img src={form.coverImage} alt="Cover" className="w-full h-full object-cover" />
                    <button
                      type="button"
                      onClick={() => set('coverImage', '')}
                      className="absolute top-2 right-2 bg-surface/80 text-on-surface rounded-full p-1 hover:text-error transition-colors"
                    >
                      <span className="material-symbols-outlined text-sm">close</span>
                    </button>
                  </div>
                )}
                <label className={`w-full flex flex-col items-center justify-center py-8 border-2 border-dashed border-outline-variant/30 rounded-lg cursor-pointer hover:border-primary/50 transition-colors ${uploading ? 'opacity-50 pointer-events-none' : ''}`}>
                  {uploading
                    ? <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                    : <>
                      <span className="material-symbols-outlined text-on-surface-variant text-3xl">add_photo_alternate</span>
                      <span className="text-xs font-mono text-on-surface-variant mt-2">Subir portada</span>
                    </>
                  }
                  <input type="file" accept="image/*" className="hidden" onChange={handleCoverUpload} disabled={uploading} />
                </label>
              </section>

              {/* Actions */}
              <div className="space-y-3">
                <button
                  type="submit" disabled={saving}
                  className="w-full py-3 bg-gradient-to-br from-primary to-primary-container text-on-primary rounded-md font-headline font-bold text-sm uppercase tracking-widest active:scale-95 transition-all disabled:opacity-60"
                >
                  {saving ? 'Guardando...' : isEdit ? 'Guardar Cambios' : form.status === 'published' ? 'Publicar' : 'Guardar Borrador'}
                </button>
                <button
                  type="button" onClick={() => navigate('/admin/blog')}
                  className="w-full py-3 border border-outline-variant/30 rounded-md text-sm text-on-surface-variant hover:bg-surface-container-highest transition-all"
                >Cancelar</button>
              </div>

              {!isEdit && (
                <p className="text-[10px] font-mono text-on-surface-variant/60 text-center">
                  Auto-guardado cada 30s en el navegador
                </p>
              )}
            </div>
          </div>
        </form>
      </main>

      {toast && (
        <div className={`fixed bottom-6 right-6 z-[200] px-6 py-3 rounded-xl shadow-2xl text-sm font-bold ${toast.type === 'error' ? 'bg-error text-on-error' : 'bg-primary-container text-on-primary-container'}`}>
          {toast.msg}
        </div>
      )}
    </div>
  );
};

export default AdminBlogForm;
