import { useState } from 'react';
import useSiteConfig from '../hooks/useSiteConfig';
import { useAuth } from '../context/AuthContext';
import LinkPicker from '../components/LinkPicker';
import HeroBgPicker from '../components/HeroBgPicker';

const AdminSiteConfig = () => {
  const { authFetch, API } = useAuth();
  const { config, loading } = useSiteConfig();
  const [formData, setFormData] = useState(null);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [toast, setToast] = useState(null);

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  // Initialize form when config is loaded
  if (!loading && config && !formData) {
    setFormData(config);
  }

  const handleChange = (section, field, value) => {
    setFormData(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: value
      }
    }));
  };

  const handleHeroSpecChange = (key, value) => {
    setFormData(prev => ({
      ...prev,
      hero: {
        ...prev.hero,
        specCard: {
          ...prev.hero.specCard,
          [key]: value
        }
      }
    }));
  };

  const handleAboutParagraphChange = (index, value) => {
    const newParagraphs = [...(formData.about.paragraphs || [])];
    newParagraphs[index] = value;
    setFormData(prev => ({
      ...prev,
      about: { ...prev.about, paragraphs: newParagraphs }
    }));
  };

  const handleBgUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploading(true);
    const data = new FormData();
    data.append('file', file);
    try {
      const res = await authFetch(`${API}/api/admin/upload`, { method: 'POST', body: data });
      if (!res.ok) throw new Error('Upload failed');
      const d = await res.json();
      setFormData(prev => ({
        ...prev,
        hero: {
          ...prev.hero,
          background: { ...(prev.hero.background || {}), type: 'image', url: d.url }
        }
      }));
      showToast('Imagen subida con éxito');
    } catch {
      showToast('Error subiendo imagen', 'error');
    } finally {
      setUploading(false);
    }
  };

  const handleUpload = async (e, section, field, index = null) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploading(true);
    const data = new FormData();
    data.append('file', file);

    try {
      const res = await authFetch(`${API}/api/admin/upload`, {
        method: 'POST',
        body: data,
      });
      if (!res.ok) throw new Error('Error al subir imagen');
      const d = await res.json();
      const url = d.url;

      if (index !== null) {
        const newImages = [...(formData[section][field] || [])];
        newImages[index] = url;
        handleChange(section, field, newImages);
      } else {
        handleChange(section, field, url);
      }
      showToast('Imagen subida con éxito');
    } catch (err) {
      console.error(err);
      showToast('Error subiendo imagen', 'error');
    } finally {
      setUploading(false);
    }
  };

  const saveConfig = async () => {
    setSaving(true);
    try {
      const res = await authFetch(`${API}/api/admin/site-config`, {
        method: 'PUT',
        body: JSON.stringify(formData),
      });
      if (!res.ok) throw new Error('Error guardando configuración');
      showToast('Configuración guardada correctamente');
      sessionStorage.removeItem('trebor_site_config');
    } catch (err) {
      console.error(err);
      showToast('Error guardando config', 'error');
    } finally {
      setSaving(false);
    }
  };

  if (loading || !formData) {
    return (
      <main className="min-h-screen bg-surface-container-low flex items-center justify-center w-full">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </main>
    );
  }

  return (
    <>
      <main className="min-h-screen bg-surface-container-low flex flex-col w-full">
        {/* Header */}
        <header className="h-20 px-4 md:px-10 flex items-center justify-between bg-surface/50 backdrop-blur-md sticky top-0 z-40">
          <div>
            <h2 className="font-headline font-bold text-2xl text-on-surface tracking-tight">Configuración del Sitio</h2>
            <p className="text-xs font-mono text-on-surface-variant">/root/admin/site_config_v1</p>
          </div>
          <button
            onClick={saveConfig}
            disabled={saving || uploading}
            className="flex items-center gap-2 bg-gradient-to-br from-primary to-primary-container text-on-primary px-5 py-2.5 rounded-md font-headline font-bold text-xs uppercase tracking-widest shadow-[0_0_15px_rgba(214,186,255,0.2)] hover:shadow-[0_0_25px_rgba(214,186,255,0.3)] transition-all active:scale-95 border-none cursor-pointer disabled:opacity-50 disabled:grayscale"
          >
            <span className="material-symbols-outlined text-sm">save</span>
            {saving ? 'Guardando...' : 'Guardar Cambios'}
          </button>
        </header>

        <div className="p-4 md:p-10 space-y-6">
          {/* Hero Section */}
          <section className="bg-surface p-8 rounded-xl shadow-2xl animate-fade-in">
            <h2 className="text-lg font-bold mb-6 font-headline text-primary border-b border-outline-variant/20 pb-2">Sección: Hero</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-xs font-mono tracking-widest text-on-surface-variant uppercase mb-2">Badge</label>
                <input type="text" value={formData.hero.badge || ''} onChange={(e) => handleChange('hero', 'badge', e.target.value)} className="w-full bg-surface-container-high border-none p-3 rounded-lg text-sm text-on-surface focus:ring-1 focus:ring-primary/40 focus:outline-none" />
              </div>
              <div className="md:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-xs font-mono tracking-widest text-on-surface-variant uppercase mb-2">Titular Parte 1</label>
                  <input type="text" value={formData.hero.headlinePart1 || ''} onChange={(e) => handleChange('hero', 'headlinePart1', e.target.value)} className="w-full bg-surface-container-high border-none p-3 rounded-lg text-sm text-on-surface focus:ring-1 focus:ring-primary/40 focus:outline-none" />
                </div>
                <div>
                  <label className="block text-xs font-mono tracking-widest text-on-surface-variant uppercase mb-2">Titular Parte 2 (Italic & Primary)</label>
                  <input type="text" value={formData.hero.headlinePart2 || ''} onChange={(e) => handleChange('hero', 'headlinePart2', e.target.value)} className="w-full bg-surface-container-high border-none p-3 rounded-lg text-sm text-on-surface focus:ring-1 focus:ring-primary/40 focus:outline-none" />
                </div>
              </div>
              <div className="md:col-span-2">
                <label className="block text-xs font-mono tracking-widest text-on-surface-variant uppercase mb-2">Subtítulo</label>
                <textarea value={formData.hero.subtitle || ''} onChange={(e) => handleChange('hero', 'subtitle', e.target.value)} className="w-full bg-surface-container-high border-none p-3 rounded-lg text-sm text-on-surface focus:ring-1 focus:ring-primary/40 focus:outline-none" rows={2} />
              </div>

              <div>
                <label className="block text-xs font-mono tracking-widest text-on-surface-variant uppercase mb-2">CTA Principal (Texto)</label>
                <input type="text" value={formData.hero.ctaPrimary || ''} onChange={(e) => handleChange('hero', 'ctaPrimary', e.target.value)} className="w-full bg-surface-container-high border-none p-3 rounded-lg text-sm text-on-surface focus:ring-1 focus:ring-primary/40 focus:outline-none" />
              </div>
              <div>
                <label className="block text-xs font-mono tracking-widest text-on-surface-variant uppercase mb-2">CTA Principal (Link)</label>
                <LinkPicker value={formData.hero.ctaPrimaryLink || ''} onChange={(v) => handleChange('hero', 'ctaPrimaryLink', v)} />
              </div>

              <div>
                <label className="block text-xs font-mono tracking-widest text-on-surface-variant uppercase mb-2">CTA Secundario (Texto)</label>
                <input type="text" value={formData.hero.ctaSecondary || ''} onChange={(e) => handleChange('hero', 'ctaSecondary', e.target.value)} className="w-full bg-surface-container-high border-none p-3 rounded-lg text-sm text-on-surface focus:ring-1 focus:ring-primary/40 focus:outline-none" />
              </div>
              <div>
                <label className="block text-xs font-mono tracking-widest text-on-surface-variant uppercase mb-2">CTA Secundario (Link)</label>
                <LinkPicker value={formData.hero.ctaSecondaryLink || ''} onChange={(v) => handleChange('hero', 'ctaSecondaryLink', v)} />
              </div>
              
              <div className="md:col-span-2">
                <label className="block text-xs font-mono tracking-widest text-on-surface-variant uppercase mb-3">Fondo del Hero</label>
                <HeroBgPicker
                  value={formData.hero.background || { type: 'preset', preset: 'amethyst-bloom', url: null }}
                  onChange={(bgConfig) => handleChange('hero', 'background', bgConfig)}
                  onUpload={handleBgUpload}
                  uploading={uploading}
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-xs font-mono tracking-widest text-on-surface-variant uppercase mb-2">Imagen Principal (Cuadro Rotado)</label>
                <div className="flex items-center gap-4 bg-surface-container px-4 py-3 border border-outline-variant/30 rounded-lg">
                  {formData.hero.image && (
                    <img src={formData.hero.image.startsWith('http') ? formData.hero.image : `${API || ''}${formData.hero.image}`} alt="Preview" className="w-16 h-16 object-cover rounded-md shadow-md border border-outline/20" />
                  )}
                  <input type="file" accept="image/*" onChange={(e) => handleUpload(e, 'hero', 'image')} className="text-sm font-mono text-on-surface-variant file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-semibold file:bg-primary/10 file:text-primary hover:file:bg-primary/20 cursor-pointer" />
                </div>
                <input type="text" placeholder="O pega un URL externo aquí" value={formData.hero.image || ''} onChange={(e) => handleChange('hero', 'image', e.target.value)} className="w-full bg-surface-container-high border-none p-3 rounded-lg text-sm text-on-surface focus:ring-1 focus:ring-primary/40 focus:outline-none mt-3" />
              </div>

              <div className="md:col-span-2 border-t border-outline-variant/10 pt-6 mt-4">
                <h3 className="text-sm font-bold mb-4 font-headline text-on-surface flex items-center gap-2"><span className="material-symbols-outlined text-[18px]">style</span> Spec Card Flotante</h3>
                <div className="grid grid-cols-1 lg:grid-cols-[1fr_180px] gap-4">
                  {/* Controls */}
                  <div className="bg-surface-container border border-outline-variant/30 p-5 rounded-lg space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-[10px] font-mono tracking-widest text-on-surface-variant uppercase mb-1">Atributo 1</label>
                        <input type="text" value={formData.hero?.specCard?.switches || ''} onChange={(e) => handleHeroSpecChange('switches', e.target.value)} className="w-full bg-surface-container-high border-none p-2.5 rounded text-sm text-on-surface focus:ring-1 focus:ring-primary/40 focus:outline-none" placeholder="Ej: Gateron Milky Yellow Pro" />
                      </div>
                      <div>
                        <label className="block text-[10px] font-mono tracking-widest text-on-surface-variant uppercase mb-1">Atributo 2</label>
                        <input type="text" value={formData.hero?.specCard?.keycaps || ''} onChange={(e) => handleHeroSpecChange('keycaps', e.target.value)} className="w-full bg-surface-container-high border-none p-2.5 rounded text-sm text-on-surface focus:ring-1 focus:ring-primary/40 focus:outline-none" placeholder="Ej: PBT Double Shot" />
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between items-center mb-2">
                        <label className="text-[10px] font-mono tracking-widest text-on-surface-variant uppercase">Posición Vertical</label>
                        <span className="text-[10px] font-mono text-primary font-bold">{formData.hero?.specCard?.offsetY ?? 75}%</span>
                      </div>
                      <input
                        type="range" min="5" max="95"
                        value={formData.hero?.specCard?.offsetY ?? 75}
                        onChange={(e) => handleHeroSpecChange('offsetY', Number(e.target.value))}
                        className="w-full accent-primary cursor-pointer"
                      />
                      <div className="flex justify-between text-[9px] font-mono text-on-surface-variant/40 mt-1">
                        <span>Arriba</span><span>Abajo</span>
                      </div>
                    </div>
                    <div>
                      <label className="block text-[10px] font-mono tracking-widest text-on-surface-variant uppercase mb-2">Tamaño</label>
                      <div className="flex gap-2">
                        {[{ id: 'sm', label: 'S — Compacto' }, { id: 'md', label: 'M — Normal' }, { id: 'lg', label: 'L — Grande' }].map(({ id, label }) => (
                          <button
                            key={id} type="button"
                            onClick={() => handleHeroSpecChange('size', id)}
                            className={`flex-1 py-2 rounded-md text-[10px] font-mono font-bold border transition-colors cursor-pointer ${
                              (formData.hero?.specCard?.size || 'md') === id
                                ? 'bg-primary text-on-primary border-primary'
                                : 'bg-transparent text-on-surface-variant border-outline-variant/30 hover:border-primary/40'
                            }`}
                          >{label}</button>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Live Preview */}
                  <div className="flex flex-col gap-2">
                    <span className="text-[10px] font-mono tracking-widest text-on-surface-variant uppercase">Vista Previa</span>
                    <div className="bg-surface-container-high rounded-lg flex-1 flex items-center justify-center p-4 min-h-[200px]">
                      <div className="relative" style={{ width: '80px', height: '160px' }}>
                        <div className="absolute inset-0 rounded-lg overflow-hidden bg-surface-container flex items-center justify-center border border-outline-variant/20">
                          {formData.hero.image ? (
                            <img
                              src={formData.hero.image.startsWith('http') ? formData.hero.image : `${API || ''}${formData.hero.image}`}
                              className="w-full h-full object-contain opacity-50"
                            />
                          ) : (
                            <span className="material-symbols-outlined text-on-surface-variant/20 text-3xl">keyboard</span>
                          )}
                        </div>
                        {(formData.hero?.specCard?.switches || formData.hero?.specCard?.keycaps) && (
                          <div
                            className="absolute z-10"
                            style={{ top: `${formData.hero?.specCard?.offsetY ?? 75}%`, transform: 'translateY(-50%)', left: '-36px' }}
                          >
                            <div className={`bg-surface-container-highest rounded-lg shadow-xl border border-outline-variant/30 ${
                              (formData.hero?.specCard?.size || 'md') === 'sm' ? 'p-1.5' :
                              (formData.hero?.specCard?.size || 'md') === 'lg' ? 'p-3' : 'p-2'
                            }`}>
                              <span className="font-mono text-[6px] text-primary block mb-0.5 tracking-wider uppercase">Spec</span>
                              {[formData.hero?.specCard?.switches, formData.hero?.specCard?.keycaps].filter(Boolean).map((v, i) => (
                                <p key={i} className="font-headline font-bold text-[7px] text-on-surface leading-tight max-w-[72px] truncate">{v}</p>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* About Section */}
          <section className="bg-surface p-8 rounded-xl shadow-2xl animate-fade-in">
            <h2 className="text-lg font-bold mb-6 font-headline text-primary border-b border-outline-variant/20 pb-2">Sección: About / Historia</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="md:col-span-2">
                <label className="block text-xs font-mono tracking-widest text-on-surface-variant uppercase mb-2">Título</label>
                <input type="text" value={formData.about.title || ''} onChange={(e) => handleChange('about', 'title', e.target.value)} className="w-full bg-surface-container-high border-none p-3 rounded-lg text-sm text-on-surface focus:ring-1 focus:ring-primary/40 focus:outline-none" />
              </div>
              
              <div className="md:col-span-2">
                <label className="block text-xs font-mono tracking-widest text-on-surface-variant uppercase mb-2">Párrafo 1</label>
                <textarea value={formData.about.paragraphs?.[0] || ''} onChange={(e) => handleAboutParagraphChange(0, e.target.value)} className="w-full bg-surface-container-high border-none p-3 rounded-lg text-sm text-on-surface focus:ring-1 focus:ring-primary/40 focus:outline-none" rows={3} />
              </div>
              <div className="md:col-span-2">
                <label className="block text-xs font-mono tracking-widest text-on-surface-variant uppercase mb-2">Párrafo 2</label>
                <textarea value={formData.about.paragraphs?.[1] || ''} onChange={(e) => handleAboutParagraphChange(1, e.target.value)} className="w-full bg-surface-container-high border-none p-3 rounded-lg text-sm text-on-surface focus:ring-1 focus:ring-primary/40 focus:outline-none" rows={3} />
              </div>

              <div>
                <label className="block text-xs font-mono tracking-widest text-on-surface-variant uppercase mb-2">CTA (Texto)</label>
                <input type="text" value={formData.about.cta || ''} onChange={(e) => handleChange('about', 'cta', e.target.value)} className="w-full bg-surface-container-high border-none p-3 rounded-lg text-sm text-on-surface focus:ring-1 focus:ring-primary/40 focus:outline-none" />
              </div>
              <div>
                <label className="block text-xs font-mono tracking-widest text-on-surface-variant uppercase mb-2">CTA (Link)</label>
                <LinkPicker value={formData.about.ctaLink || ''} onChange={(v) => handleChange('about', 'ctaLink', v)} />
              </div>

              <div className="md:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-outline-variant/10 mt-2">
                <div className="bg-surface-container border border-outline-variant/30 p-5 rounded-lg">
                  <label className="block text-xs font-mono tracking-widest text-on-surface-variant uppercase mb-3"><span className="material-symbols-outlined text-[14px] align-middle mr-1">image</span> Decorativa 1</label>
                  {formData.about.images?.[0] && (
                    <img src={formData.about.images[0].startsWith('http') ? formData.about.images[0] : `${API || ''}${formData.about.images[0]}`} className="w-full h-32 object-cover rounded-md mb-3 border border-outline/20 shadow-sm" />
                  )}
                  <input type="file" accept="image/*" onChange={(e) => handleUpload(e, 'about', 'images', 0)} className="text-[11px] w-full font-mono text-on-surface-variant file:mr-2 file:py-1 file:px-3 file:rounded-full file:border-0 file:bg-primary/10 file:text-primary hover:file:bg-primary/20 mb-2 cursor-pointer" />
                  <input type="text" placeholder="URL remota" value={formData.about.images?.[0] || ''} onChange={(e) => {
                    const newImgs = [...(formData.about.images || [])];
                    newImgs[0] = e.target.value;
                    handleChange('about', 'images', newImgs);
                  }} className="w-full bg-surface-container-high border-none p-2 rounded text-[11px] font-mono focus:ring-1 focus:ring-primary/40 focus:outline-none" />
                </div>
                
                <div className="bg-surface-container border border-outline-variant/30 p-5 rounded-lg">
                  <label className="block text-xs font-mono tracking-widest text-on-surface-variant uppercase mb-3"><span className="material-symbols-outlined text-[14px] align-middle mr-1">image</span> Decorativa 2</label>
                  {formData.about.images?.[1] && (
                    <img src={formData.about.images[1].startsWith('http') ? formData.about.images[1] : `${API || ''}${formData.about.images[1]}`} className="w-full h-32 object-cover rounded-md mb-3 border border-outline/20 shadow-sm" />
                  )}
                  <input type="file" accept="image/*" onChange={(e) => handleUpload(e, 'about', 'images', 1)} className="text-[11px] w-full font-mono text-on-surface-variant file:mr-2 file:py-1 file:px-3 file:rounded-full file:border-0 file:bg-primary/10 file:text-primary hover:file:bg-primary/20 mb-2 cursor-pointer" />
                  <input type="text" placeholder="URL remota" value={formData.about.images?.[1] || ''} onChange={(e) => {
                    const newImgs = [...(formData.about.images || [])];
                    newImgs[1] = e.target.value;
                    handleChange('about', 'images', newImgs);
                  }} className="w-full bg-surface-container-high border-none p-2 rounded text-[11px] font-mono focus:ring-1 focus:ring-primary/40 focus:outline-none" />
                </div>
              </div>
            </div>
          </section>
          {/* Footer Section */}
          <section className="bg-surface p-8 rounded-xl shadow-2xl animate-fade-in">
            <h2 className="text-lg font-bold mb-6 font-headline text-primary border-b border-outline-variant/20 pb-2">Sección: Footer</h2>
            <div>
              <label className="block text-xs font-mono tracking-widest text-on-surface-variant uppercase mb-2">Descripción / Tagline</label>
              <textarea value={formData.footer?.tagline || ''} onChange={(e) => handleChange('footer', 'tagline', e.target.value)} className="w-full bg-surface-container-high border-none p-3 rounded-lg text-sm text-on-surface focus:ring-1 focus:ring-primary/40 focus:outline-none" rows={2} />
            </div>
          </section>
        </div>
      </main>

      {/* Toast */}
      {toast && (
        <div className={`fixed bottom-6 right-6 z-[200] px-6 py-3 rounded-xl shadow-2xl text-sm font-bold animate-fade-in flex items-center gap-2 ${toast.type === 'error' ? 'bg-error text-on-error' : 'bg-primary-container text-on-primary-container'}`}>
          <span className="material-symbols-outlined text-lg">{toast.type === 'error' ? 'error' : 'check_circle'}</span>
          {toast.msg}
        </div>
      )}
    </>
  );
};

export default AdminSiteConfig;
