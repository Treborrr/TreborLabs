import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import AdminSidebar from '../components/AdminSidebar';

const API = import.meta.env.VITE_API_URL ?? '';

const generateSlug = (name) =>
  name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '').replace(/-+/g, '-').replace(/^-|-$/g, '');

const KEYBOARD_SPEC_FIELDS = [
  { key: 'layout',       label: 'Layout',        placeholder: '65%, 75%, TKL…' },
  { key: 'material',     label: 'Material Case', placeholder: 'CNC Aluminum, Polycarbonate…' },
  { key: 'switches',     label: 'Switches',      placeholder: 'Trebor Violet Tactile 65g…' },
  { key: 'pcb',          label: 'PCB',           placeholder: 'QMK/VIA, Hotswap…' },
  { key: 'connectivity', label: 'Conectividad',  placeholder: 'USB-C, BT 5.0, 2.4GHz…' },
  { key: 'weight',       label: 'Peso',          placeholder: '2.4 kg' },
];

const RASPI_MODELS = ['Pi 5', 'Pi 4', 'Pi Zero', 'Pi Zero 2W'];
const RASPI_SPEC_FIELDS = [
  { key: 'ram',          label: 'RAM',           placeholder: '4GB, 8GB…' },
  { key: 'storage',      label: 'Storage',       placeholder: '32GB SD, 64GB…' },
  { key: 'connectivity', label: 'Conectividad',  placeholder: 'WiFi, BT, Ethernet…' },
];

const AdminProductForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { authFetch } = useAuth();
  const isEdit = Boolean(id);

  const [loading, setLoading]     = useState(isEdit);
  const [saving, setSaving]       = useState(false);
  const [uploading, setUploading] = useState(false);
  const [toast, setToast]         = useState(null);

  const [form, setForm] = useState({
    name: '', slug: '', category: 'keyboard', price: '', stock: '',
    status: 'in_stock', featured: false, description: '', images: [],
    specs: {},
  });

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  };

  // Pre-fill en modo edición
  useEffect(() => {
    if (!isEdit) return;
    (async () => {
      try {
        const res = await fetch(`${API}/api/products/${id}`);
        const data = await res.json();
        if (data.product) {
          const p = data.product;
          setForm({
            name: p.name, slug: p.slug, category: p.category,
            price: p.price, stock: p.stock, status: p.status,
            featured: p.featured, description: p.description || '',
            images: p.images || [], specs: p.specs || {},
          });
        }
      } catch {
        showToast('Error al cargar el producto', 'error');
      } finally {
        setLoading(false);
      }
    })();
  }, [id, isEdit]);

  const set = (key, value) => setForm(f => ({ ...f, [key]: value }));
  const setSpec = (key, value) => setForm(f => ({ ...f, specs: { ...f.specs, [key]: value } }));

  const handleNameChange = (e) => {
    const name = e.target.value;
    setForm(f => ({ ...f, name, slug: generateSlug(name) }));
  };

  const handleImageUpload = async (e) => {
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
      if (data.url) {
        set('images', [...form.images, data.url]);
      } else {
        showToast('Error al subir imagen', 'error');
      }
    } catch {
      showToast('Error al subir imagen', 'error');
    } finally {
      setUploading(false);
    }
  };

  const removeImage = (idx) => set('images', form.images.filter((_, i) => i !== idx));

  const moveImage = (idx, dir) => {
    const imgs = [...form.images];
    const target = idx + dir;
    if (target < 0 || target >= imgs.length) return;
    [imgs[idx], imgs[target]] = [imgs[target], imgs[idx]];
    set('images', imgs);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name || form.price === '' || !form.category) {
      return showToast('Nombre, precio y categoría son requeridos', 'error');
    }
    setSaving(true);
    try {
      const url = isEdit ? `${API}/api/products/${id}` : `${API}/api/products`;
      const method = isEdit ? 'PUT' : 'POST';
      const res = await authFetch(url, {
        method,
        body: JSON.stringify({
          ...form,
          price: parseFloat(form.price),
          stock: parseInt(form.stock) || 0,
        }),
      });
      if (res.ok) {
        showToast(isEdit ? 'Producto actualizado' : 'Producto creado');
        setTimeout(() => navigate('/admin/products'), 1200);
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
      <div className="flex bg-surface min-h-screen text-on-surface">
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
              {isEdit ? 'Editar Producto' : 'Nuevo Producto'}
            </h2>
            <p className="text-xs font-mono text-on-surface-variant">
              {isEdit ? `/root/admin/products/${id}` : '/root/admin/products/new'}
            </p>
          </div>
          <button
            onClick={() => navigate('/admin/products')}
            className="text-on-surface-variant hover:text-primary transition-colors flex items-center gap-2 text-sm"
          >
            <span className="material-symbols-outlined text-sm">arrow_back</span> Volver
          </button>
        </header>

        <form onSubmit={handleSubmit} className="p-10 max-w-4xl space-y-8">
          {/* Campos comunes */}
          <section className="bg-surface p-8 rounded-xl shadow-2xl space-y-6">
            <h3 className="font-headline font-bold text-lg">Información General</h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-xs font-mono uppercase tracking-widest text-on-surface-variant mb-2">Nombre *</label>
                <input
                  type="text" value={form.name} onChange={handleNameChange} required
                  className="w-full bg-surface-container-highest border-none rounded-md px-4 py-3 text-sm text-on-surface focus:ring-1 focus:ring-primary/40 focus:outline-none"
                  placeholder="Trebor Split v2"
                />
              </div>
              <div>
                <label className="block text-xs font-mono uppercase tracking-widest text-on-surface-variant mb-2">Slug</label>
                <input
                  type="text" value={form.slug} onChange={e => set('slug', e.target.value)}
                  className="w-full bg-surface-container-highest border-none rounded-md px-4 py-3 text-sm text-on-surface focus:ring-1 focus:ring-primary/40 focus:outline-none font-mono"
                  placeholder="trebor-split-v2"
                />
              </div>
              <div>
                <label className="block text-xs font-mono uppercase tracking-widest text-on-surface-variant mb-2">Categoría *</label>
                <select
                  value={form.category} onChange={e => set('category', e.target.value)} required
                  className="w-full bg-surface-container-highest border-none rounded-md px-4 py-3 text-sm text-on-surface focus:ring-1 focus:ring-primary/40 focus:outline-none"
                >
                  <option value="keyboard">Teclado Custom</option>
                  <option value="raspi">Raspberry Pi</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-mono uppercase tracking-widest text-on-surface-variant mb-2">Precio (USD) *</label>
                <input
                  type="number" value={form.price} onChange={e => set('price', e.target.value)} required min="0" step="0.01"
                  className="w-full bg-surface-container-highest border-none rounded-md px-4 py-3 text-sm text-on-surface focus:ring-1 focus:ring-primary/40 focus:outline-none"
                  placeholder="299"
                />
              </div>
              <div>
                <label className="block text-xs font-mono uppercase tracking-widest text-on-surface-variant mb-2">Stock</label>
                <input
                  type="number" value={form.stock} onChange={e => set('stock', e.target.value)} min="0"
                  className="w-full bg-surface-container-highest border-none rounded-md px-4 py-3 text-sm text-on-surface focus:ring-1 focus:ring-primary/40 focus:outline-none"
                  placeholder="0"
                />
              </div>
              <div>
                <label className="block text-xs font-mono uppercase tracking-widest text-on-surface-variant mb-2">Estado</label>
                <select
                  value={form.status} onChange={e => set('status', e.target.value)}
                  className="w-full bg-surface-container-highest border-none rounded-md px-4 py-3 text-sm text-on-surface focus:ring-1 focus:ring-primary/40 focus:outline-none"
                >
                  <option value="in_stock">En Stock</option>
                  <option value="coming_soon">Próximamente</option>
                  <option value="out_of_stock">Sin Stock</option>
                </select>
              </div>
            </div>

            {/* Featured toggle */}
            <label className="flex items-center gap-3 cursor-pointer">
              <div
                onClick={() => set('featured', !form.featured)}
                className={`w-10 h-6 rounded-full transition-colors relative ${form.featured ? 'bg-primary' : 'bg-surface-container-highest'}`}
              >
                <span className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all ${form.featured ? 'left-5' : 'left-1'}`} />
              </div>
              <span className="text-sm text-on-surface">Producto destacado</span>
            </label>

            <div>
              <label className="block text-xs font-mono uppercase tracking-widest text-on-surface-variant mb-2">Descripción</label>
              <textarea
                value={form.description} onChange={e => set('description', e.target.value)} rows={3}
                className="w-full bg-surface-container-highest border-none rounded-md px-4 py-3 text-sm text-on-surface focus:ring-1 focus:ring-primary/40 focus:outline-none resize-none"
                placeholder="Descripción del producto..."
              />
            </div>
          </section>

          {/* Imágenes */}
          <section className="bg-surface p-8 rounded-xl shadow-2xl space-y-4">
            <h3 className="font-headline font-bold text-lg">Imágenes</h3>
            <div className="flex flex-wrap gap-4">
              {form.images.map((url, i) => (
                <div key={i} className="relative w-24 h-24 rounded-lg overflow-hidden bg-surface-container-high border border-outline-variant/20 group">
                  <img src={url} alt="" className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-surface/70 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-1">
                    <button type="button" onClick={() => moveImage(i, -1)} className="text-on-surface hover:text-primary">
                      <span className="material-symbols-outlined text-xs">arrow_upward</span>
                    </button>
                    <button type="button" onClick={() => removeImage(i)} className="text-error">
                      <span className="material-symbols-outlined text-xs">close</span>
                    </button>
                    <button type="button" onClick={() => moveImage(i, 1)} className="text-on-surface hover:text-primary">
                      <span className="material-symbols-outlined text-xs">arrow_downward</span>
                    </button>
                  </div>
                </div>
              ))}
              <label className={`w-24 h-24 rounded-lg border-2 border-dashed border-outline-variant/30 flex flex-col items-center justify-center cursor-pointer hover:border-primary/50 transition-colors ${uploading ? 'opacity-50 pointer-events-none' : ''}`}>
                {uploading
                  ? <div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                  : <>
                    <span className="material-symbols-outlined text-on-surface-variant text-2xl">add_photo_alternate</span>
                    <span className="text-[10px] font-mono text-on-surface-variant mt-1">Subir</span>
                  </>
                }
                <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} disabled={uploading} />
              </label>
            </div>
          </section>

          {/* Specs dinámicas */}
          <section className="bg-surface p-8 rounded-xl shadow-2xl space-y-4">
            <h3 className="font-headline font-bold text-lg">
              Especificaciones — {form.category === 'keyboard' ? 'Teclado' : 'Raspberry Pi'}
            </h3>

            {form.category === 'keyboard' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {KEYBOARD_SPEC_FIELDS.map(({ key, label, placeholder }) => (
                  <div key={key}>
                    <label className="block text-xs font-mono uppercase tracking-widest text-on-surface-variant mb-2">{label}</label>
                    <input
                      type="text" value={form.specs[key] || ''} onChange={e => setSpec(key, e.target.value)}
                      placeholder={placeholder}
                      className="w-full bg-surface-container-highest border-none rounded-md px-4 py-3 text-sm text-on-surface focus:ring-1 focus:ring-primary/40 focus:outline-none"
                    />
                  </div>
                ))}
              </div>
            )}

            {form.category === 'raspi' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-mono uppercase tracking-widest text-on-surface-variant mb-2">Modelo</label>
                  <select
                    value={form.specs.model || ''} onChange={e => setSpec('model', e.target.value)}
                    className="w-full bg-surface-container-highest border-none rounded-md px-4 py-3 text-sm text-on-surface focus:ring-1 focus:ring-primary/40 focus:outline-none"
                  >
                    <option value="">Seleccionar modelo...</option>
                    {RASPI_MODELS.map(m => <option key={m} value={m}>{m}</option>)}
                  </select>
                </div>
                {RASPI_SPEC_FIELDS.map(({ key, label, placeholder }) => (
                  <div key={key}>
                    <label className="block text-xs font-mono uppercase tracking-widest text-on-surface-variant mb-2">{label}</label>
                    <input
                      type="text" value={form.specs[key] || ''} onChange={e => setSpec(key, e.target.value)}
                      placeholder={placeholder}
                      className="w-full bg-surface-container-highest border-none rounded-md px-4 py-3 text-sm text-on-surface focus:ring-1 focus:ring-primary/40 focus:outline-none"
                    />
                  </div>
                ))}
              </div>
            )}
          </section>

          {/* Actions */}
          <div className="flex gap-4">
            <button
              type="button" onClick={() => navigate('/admin/products')}
              className="flex-1 py-3 border border-outline-variant/30 rounded-md text-sm text-on-surface-variant hover:bg-surface-container-highest transition-all"
            >Cancelar</button>
            <button
              type="submit" disabled={saving}
              className="flex-1 py-3 bg-gradient-to-br from-primary to-primary-container text-on-primary rounded-md font-headline font-bold text-sm uppercase tracking-widest active:scale-95 transition-all disabled:opacity-60"
            >
              {saving ? 'Guardando...' : isEdit ? 'Guardar Cambios' : 'Crear Producto'}
            </button>
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

export default AdminProductForm;
