import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { imgUrl } from '../utils/imgUrl';
import InfoTooltip from '../components/InfoTooltip';
import { PRODUCT_TOOLTIPS } from '../constants/adminTooltips';

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
    name: '', slug: '', category: '', price: '', stock: '',
    status: 'in_stock', featured: false, description: '', images: [],
    specs: {}, variants: [], afiche: null,
  });

  const [categories, setCategories] = useState([]);

  // Variant editing state
  const [variantDraft, setVariantDraft] = useState(null); // null | { idx: number|null, label, color, available }

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
          if (!p.category && categories.length > 0) {
            p.category = categories[0].slug;
          }
          setForm({
            name: p.name, slug: p.slug, category: p.category,
            price: p.price, stock: p.stock, status: p.status,
            featured: p.featured, description: p.description || '',
            images: p.images || [], specs: p.specs || {}, variants: p.variants || [],
            afiche: p.afiche || null,
          });
        }
      } catch {
        showToast('Error al cargar el producto', 'error');
      } finally {
        setLoading(false);
      }
    })();
  }, [id, isEdit]);

  useEffect(() => {
    fetch(`${API}/api/categories`)
      .then(res => res.json())
      .then(data => {
        setCategories(data);
        setForm(f => {
          if (!f.category && data.length > 0) {
            return { ...f, category: data[0].slug };
          }
          return f;
        });
      })
      .catch(err => console.error("Error loading categories", err));
  }, []);

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
      const fd = new FormData();
      fd.append('file', file);
      const res = await authFetch(`${API}/api/admin/upload`, {
        method: 'POST',
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
      <main className="flex-1 flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </main>
    );
  }

  return (
    <>
      <main className="min-h-screen bg-surface-container-low flex flex-col w-full">
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
                <label className="block text-xs font-mono uppercase tracking-widest text-on-surface-variant mb-2">Nombre *<InfoTooltip text={PRODUCT_TOOLTIPS.name} /></label>
                <input
                  type="text" value={form.name} onChange={handleNameChange} required
                  className="w-full bg-surface-container-highest border-none rounded-md px-4 py-3 text-sm text-on-surface focus:ring-1 focus:ring-primary/40 focus:outline-none"
                  placeholder="Trebor Split v2"
                />
              </div>
              <div>
                <label className="block text-xs font-mono uppercase tracking-widest text-on-surface-variant mb-2">Slug<InfoTooltip text={PRODUCT_TOOLTIPS.slug} /></label>
                <input
                  type="text" value={form.slug} onChange={e => set('slug', e.target.value)}
                  className="w-full bg-surface-container-highest border-none rounded-md px-4 py-3 text-sm text-on-surface focus:ring-1 focus:ring-primary/40 focus:outline-none font-mono"
                  placeholder="trebor-split-v2"
                />
              </div>
              <div>
                <label className="block text-xs font-mono uppercase tracking-widest text-on-surface-variant mb-2">Categoría *<InfoTooltip text={PRODUCT_TOOLTIPS.category} /></label>
                <select
                  value={form.category} onChange={e => set('category', e.target.value)} required
                  className="w-full bg-surface-container-highest border-none rounded-md px-4 py-3 text-sm text-on-surface focus:ring-1 focus:ring-primary/40 focus:outline-none"
                >
                  <option value="" disabled>Selecciona categoría...</option>
                  {categories.map(c => (
                    <option key={c.slug} value={c.slug}>{c.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-mono uppercase tracking-widest text-on-surface-variant mb-2">Precio (USD) *<InfoTooltip text={PRODUCT_TOOLTIPS.price} /></label>
                <input
                  type="number" value={form.price} onChange={e => set('price', e.target.value)} required min="0" step="0.01"
                  className="w-full bg-surface-container-highest border-none rounded-md px-4 py-3 text-sm text-on-surface focus:ring-1 focus:ring-primary/40 focus:outline-none"
                  placeholder="299"
                />
              </div>
              <div>
                <label className="block text-xs font-mono uppercase tracking-widest text-on-surface-variant mb-2">Stock<InfoTooltip text={PRODUCT_TOOLTIPS.stock} /></label>
                <input
                  type="number" value={form.stock} onChange={e => set('stock', e.target.value)} min="0"
                  className="w-full bg-surface-container-highest border-none rounded-md px-4 py-3 text-sm text-on-surface focus:ring-1 focus:ring-primary/40 focus:outline-none"
                  placeholder="0"
                />
              </div>
              <div>
                <label className="block text-xs font-mono uppercase tracking-widest text-on-surface-variant mb-2">Estado<InfoTooltip text={PRODUCT_TOOLTIPS.status} /></label>
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
              <span className="text-sm text-on-surface">Producto destacado<InfoTooltip text={PRODUCT_TOOLTIPS.featured} /></span>
            </label>

            <div>
              <label className="block text-xs font-mono uppercase tracking-widest text-on-surface-variant mb-2">Descripción<InfoTooltip text={PRODUCT_TOOLTIPS.description} /></label>
              <textarea
                value={form.description} onChange={e => set('description', e.target.value)} rows={3}
                className="w-full bg-surface-container-highest border-none rounded-md px-4 py-3 text-sm text-on-surface focus:ring-1 focus:ring-primary/40 focus:outline-none resize-none"
                placeholder="Descripción del producto..."
              />
            </div>
          </section>

          {/* Imágenes */}
          <section className="bg-surface p-8 rounded-xl shadow-2xl space-y-4">
            <h3 className="font-headline font-bold text-lg">Imágenes<InfoTooltip text={PRODUCT_TOOLTIPS.images} /></h3>
            <div className="flex flex-wrap gap-4">
              {form.images.map((url, i) => (
                <div key={i} className="relative w-24 h-24 rounded-lg overflow-hidden bg-surface-container-high border border-outline-variant/20 group">
                  <img src={imgUrl(url)} alt="" className="w-full h-full object-cover" />
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
                    <label className="block text-xs font-mono uppercase tracking-widest text-on-surface-variant mb-2">{label}{PRODUCT_TOOLTIPS[key] && <InfoTooltip text={PRODUCT_TOOLTIPS[key]} />}</label>
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
                  <label className="block text-xs font-mono uppercase tracking-widest text-on-surface-variant mb-2">Modelo<InfoTooltip text={PRODUCT_TOOLTIPS.piModel} /></label>
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
                    <label className="block text-xs font-mono uppercase tracking-widest text-on-surface-variant mb-2">{label}{PRODUCT_TOOLTIPS[key] && <InfoTooltip text={PRODUCT_TOOLTIPS[key]} />}</label>
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

          {/* Afiche */}
          <section className="bg-surface p-8 rounded-xl shadow-2xl space-y-4">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h3 className="font-headline font-bold text-lg">Afiche del Producto<InfoTooltip text={PRODUCT_TOOLTIPS.afiche} /></h3>
                <p className="text-xs font-mono text-on-surface-variant mt-1">Imagen promocional vertical — recomendado 768×1276 px</p>
              </div>
              {form.afiche && (
                <button
                  type="button"
                  onClick={() => set('afiche', null)}
                  className="text-xs font-mono text-error hover:underline flex items-center gap-1"
                >
                  <span className="material-symbols-outlined text-sm">delete</span> Quitar
                </button>
              )}
            </div>

            {form.afiche ? (
              <div className="relative w-48 rounded-xl overflow-hidden border border-outline-variant/20 shadow-xl">
                <img src={imgUrl(form.afiche)} alt="Afiche" className="w-full h-auto object-cover" />
              </div>
            ) : (
              <label className={`flex flex-col items-center justify-center w-48 h-80 rounded-xl border-2 border-dashed border-outline-variant/30 cursor-pointer hover:border-primary/50 transition-colors ${uploading ? 'opacity-50 pointer-events-none' : ''}`}>
                {uploading
                  ? <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                  : <>
                    <span className="material-symbols-outlined text-on-surface-variant text-3xl">add_photo_alternate</span>
                    <span className="text-[10px] font-mono text-on-surface-variant mt-2 text-center px-4">Subir afiche<br/>768×1276 px</span>
                  </>
                }
                <input
                  type="file" accept="image/*" className="hidden" disabled={uploading}
                  onChange={async (e) => {
                    const file = e.target.files?.[0];
                    if (!file) return;
                    setUploading(true);
                    try {
                      const fd = new FormData();
                      fd.append('file', file);
                      const res = await authFetch(`${API}/api/admin/upload`, {
                        method: 'POST',
                        body: fd,
                      });
                      const data = await res.json();
                      if (data.url) set('afiche', data.url);
                      else showToast('Error al subir afiche', 'error');
                    } catch { showToast('Error al subir afiche', 'error'); }
                    finally { setUploading(false); }
                  }}
                />
              </label>
            )}
          </section>

          {/* Variants */}
          <section className="bg-surface p-8 rounded-xl shadow-2xl space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-headline font-bold text-lg">Variantes</h3>
              {!variantDraft && (
                <button
                  type="button"
                  onClick={() => setVariantDraft({ idx: null, label: '', color: '#d6baff', available: true })}
                  className="flex items-center gap-2 bg-primary-container text-on-primary-container px-4 py-2 rounded-lg font-headline font-bold text-xs uppercase tracking-widest hover:bg-primary hover:text-on-primary transition-all"
                >
                  <span className="material-symbols-outlined text-sm">add</span>
                  Agregar
                </button>
              )}
            </div>

            {/* Draft form */}
            {variantDraft && (
              <div className="bg-surface-container-low rounded-xl p-5 border border-outline-variant/15 space-y-4">
                <h4 className="font-mono text-xs uppercase tracking-widest text-on-surface-variant">
                  {variantDraft.idx !== null ? 'Editar variante' : 'Nueva variante'}
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-mono uppercase tracking-widest text-on-surface-variant mb-2">Nombre *<InfoTooltip text={PRODUCT_TOOLTIPS.variantName} /></label>
                    <input
                      type="text"
                      value={variantDraft.label}
                      onChange={e => setVariantDraft(d => ({ ...d, label: e.target.value }))}
                      placeholder="Black, Silver, Blue…"
                      className="w-full bg-surface-container-highest border-none rounded-md px-4 py-3 text-sm focus:ring-1 focus:ring-primary/40 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-mono uppercase tracking-widest text-on-surface-variant mb-2">Color (hex)<InfoTooltip text={PRODUCT_TOOLTIPS.variantColor} /></label>
                    <div className="flex items-center gap-3">
                      <input
                        type="color"
                        value={variantDraft.color || '#d6baff'}
                        onChange={e => setVariantDraft(d => ({ ...d, color: e.target.value }))}
                        className="w-12 h-12 rounded-lg cursor-pointer border-none bg-transparent"
                      />
                      <input
                        type="text"
                        value={variantDraft.color || ''}
                        onChange={e => setVariantDraft(d => ({ ...d, color: e.target.value }))}
                        placeholder="#d6baff"
                        className="flex-1 bg-surface-container-highest border-none rounded-md px-4 py-3 text-sm font-mono focus:ring-1 focus:ring-primary/40 focus:outline-none"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-mono uppercase tracking-widest text-on-surface-variant mb-2">Disponible<InfoTooltip text={PRODUCT_TOOLTIPS.variantAvail} /></label>
                    <label className="flex items-center gap-3 cursor-pointer mt-3">
                      <div
                        onClick={() => setVariantDraft(d => ({ ...d, available: !d.available }))}
                        className={`w-10 h-6 rounded-full transition-colors relative ${variantDraft.available ? 'bg-primary' : 'bg-surface-container-highest'}`}
                      >
                        <span className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all ${variantDraft.available ? 'left-5' : 'left-1'}`} />
                      </div>
                      <span className="text-sm text-on-surface-variant">{variantDraft.available ? 'Sí' : 'No'}</span>
                    </label>
                  </div>
                </div>
                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => {
                      if (!variantDraft.label.trim()) return;
                      const entry = { id: variantDraft.id || `v_${Date.now()}`, label: variantDraft.label.trim(), color: variantDraft.color, available: variantDraft.available };
                      if (variantDraft.idx !== null) {
                        set('variants', form.variants.map((v, i) => i === variantDraft.idx ? entry : v));
                      } else {
                        set('variants', [...form.variants, entry]);
                      }
                      setVariantDraft(null);
                    }}
                    className="flex items-center gap-2 bg-primary-container text-on-primary-container px-4 py-2 rounded-lg font-headline font-bold text-xs uppercase tracking-widest hover:bg-primary hover:text-on-primary transition-all"
                  >
                    <span className="material-symbols-outlined text-sm">save</span>
                    Guardar
                  </button>
                  <button
                    type="button"
                    onClick={() => setVariantDraft(null)}
                    className="px-4 py-2 rounded-lg font-mono text-xs text-on-surface-variant hover:bg-surface-container-highest transition-all"
                  >
                    Cancelar
                  </button>
                </div>
              </div>
            )}

            {/* Variants list */}
            {form.variants.length > 0 ? (
              <div className="flex flex-wrap gap-3">
                {form.variants.map((v, i) => (
                  <div
                    key={v.id || i}
                    className={`flex items-center gap-2 px-3 py-2 rounded-lg border transition-colors ${v.available !== false ? 'border-outline-variant/20 bg-surface-container-low' : 'border-outline-variant/10 bg-surface-container-low opacity-50'}`}
                  >
                    {v.color && (
                      <div className="w-4 h-4 rounded-full border border-outline-variant/30 flex-shrink-0" style={{ backgroundColor: v.color }} />
                    )}
                    <span className="text-sm font-mono">{v.label}</span>
                    {v.available === false && (
                      <span className="text-[10px] font-mono text-error">agotado</span>
                    )}
                    <div className="flex items-center gap-0.5 ml-1">
                      <button
                        type="button"
                        onClick={() => setVariantDraft({ ...v, idx: i })}
                        className="p-1 rounded text-on-surface-variant hover:text-primary hover:bg-primary/10 transition-all"
                      >
                        <span className="material-symbols-outlined text-xs">edit</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => set('variants', form.variants.filter((_, idx) => idx !== i))}
                        className="p-1 rounded text-on-surface-variant hover:text-error hover:bg-error/10 transition-all"
                      >
                        <span className="material-symbols-outlined text-xs">close</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-on-surface-variant/50 font-mono">Sin variantes — el producto se vende en versión única.</p>
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
    </>
  );
};

export default AdminProductForm;
