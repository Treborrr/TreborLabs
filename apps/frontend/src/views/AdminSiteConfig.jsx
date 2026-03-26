import { useState } from 'react';
import useSiteConfig from '../hooks/useSiteConfig';
import { useAuth } from '../context/AuthContext';

const AdminSiteConfig = () => {
  const { authFetch, API } = useAuth();
  const { config, loading } = useSiteConfig();
  const [formData, setFormData] = useState(null);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState({ type: '', text: '' });
  const [uploading, setUploading] = useState(false);

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
      const d = await res.json();
      const url = d.url;

      if (index !== null) {
        // array of images (like about.images)
        const newImages = [...(formData[section][field] || [])];
        newImages[index] = url;
        handleChange(section, field, newImages);
      } else {
        handleChange(section, field, url);
      }
    } catch (err) {
      console.error(err);
      setMsg({ type: 'error', text: 'Error subiendo imagen' });
    } finally {
      setUploading(false);
    }
  };

  const saveConfig = async () => {
    setSaving(true);
    setMsg({ type: '', text: '' });
    try {
      await authFetch(`${API}/api/admin/site-config`, {
        method: 'PUT',
        body: JSON.stringify(formData),
      });
      setMsg({ type: 'success', text: 'Configuración guardada correctamente.' });
      // Clear user frontend cache so they see it instantly if they go to home
      sessionStorage.removeItem('trebor_site_config');
    } catch (err) {
      console.error(err);
      setMsg({ type: 'error', text: 'Error guardando config' });
    } finally {
      setSaving(false);
    }
  };

  if (loading || !formData) return <div className="p-8">Cargando...</div>;

  return (
    <div className="p-8 max-w-5xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Configuración del Sitio</h1>
        <button
          onClick={saveConfig}
          disabled={saving || uploading}
          className="bg-primary text-on-primary px-6 py-2 rounded font-bold disabled:opacity-50"
        >
          {saving ? 'Guardando...' : 'Guardar Cambios'}
        </button>
      </div>

      {msg.text && (
        <div className={`p-4 mb-8 text-sm font-bold rounded ${msg.type === 'error' ? 'bg-red-500/20 text-red-500' : 'bg-green-500/20 text-green-500'}`}>
          {msg.text}
        </div>
      )}

      {/* Hero Section */}
      <section className="bg-surface-container rounded-xl p-6 mb-8 border border-outline/20">
        <h2 className="text-xl font-bold mb-6 text-primary border-b border-outline/20 pb-2">Sección: Hero</h2>
        <div className="grid grid-cols-2 gap-6">
          <div>
            <label className="block text-sm mb-1 text-on-surface-variant">Badge</label>
            <input type="text" value={formData.hero.badge || ''} onChange={(e) => handleChange('hero', 'badge', e.target.value)} className="w-full bg-surface p-2 rounded border border-outline/20" />
          </div>
          <div>
            <label className="block text-sm mb-1 text-on-surface-variant">Titular Parte 1</label>
            <input type="text" value={formData.hero.headlinePart1 || ''} onChange={(e) => handleChange('hero', 'headlinePart1', e.target.value)} className="w-full bg-surface p-2 rounded border border-outline/20" />
          </div>
          <div>
            <label className="block text-sm mb-1 text-on-surface-variant">Titular Parte 2 (Italic & Primary)</label>
            <input type="text" value={formData.hero.headlinePart2 || ''} onChange={(e) => handleChange('hero', 'headlinePart2', e.target.value)} className="w-full bg-surface p-2 rounded border border-outline/20" />
          </div>
          <div className="col-span-2">
            <label className="block text-sm mb-1 text-on-surface-variant">Subtítulo</label>
            <textarea value={formData.hero.subtitle || ''} onChange={(e) => handleChange('hero', 'subtitle', e.target.value)} className="w-full bg-surface p-2 rounded border border-outline/20" rows={2} />
          </div>

          <div>
            <label className="block text-sm mb-1 text-on-surface-variant">CTA Principal (Texto)</label>
            <input type="text" value={formData.hero.ctaPrimary || ''} onChange={(e) => handleChange('hero', 'ctaPrimary', e.target.value)} className="w-full bg-surface p-2 rounded border border-outline/20" />
          </div>
          <div>
            <label className="block text-sm mb-1 text-on-surface-variant">CTA Principal (Link)</label>
            <input type="text" value={formData.hero.ctaPrimaryLink || ''} onChange={(e) => handleChange('hero', 'ctaPrimaryLink', e.target.value)} className="w-full bg-surface p-2 rounded border border-outline/20" />
          </div>

          <div>
            <label className="block text-sm mb-1 text-on-surface-variant">CTA Secundario (Texto)</label>
            <input type="text" value={formData.hero.ctaSecondary || ''} onChange={(e) => handleChange('hero', 'ctaSecondary', e.target.value)} className="w-full bg-surface p-2 rounded border border-outline/20" />
          </div>
          <div>
            <label className="block text-sm mb-1 text-on-surface-variant">CTA Secundario (Link)</label>
            <input type="text" value={formData.hero.ctaSecondaryLink || ''} onChange={(e) => handleChange('hero', 'ctaSecondaryLink', e.target.value)} className="w-full bg-surface p-2 rounded border border-outline/20" />
          </div>
          
          <div className="col-span-2">
            <label className="block text-sm mb-1 text-on-surface-variant">Imagen Principal (Cuadro Rotado)</label>
            <div className="flex items-center gap-4">
              {formData.hero.image && (
                <img src={formData.hero.image.startsWith('http') ? formData.hero.image : `${import.meta.env.VITE_API_URL || ''}${formData.hero.image}`} alt="Preview" className="w-20 h-20 object-cover rounded shadow" />
              )}
              <input type="file" accept="image/*" onChange={(e) => handleUpload(e, 'hero', 'image')} />
            </div>
            <input type="text" placeholder="O pega un URL externa" value={formData.hero.image || ''} onChange={(e) => handleChange('hero', 'image', e.target.value)} className="w-full bg-surface p-2 rounded mt-2 border border-outline/20" />
          </div>

          <div className="col-span-2 border-t border-outline/10 pt-4 mt-2">
            <h3 className="text-md font-bold mb-2 text-on-surface">Spec Card Flotante</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-[11px] mb-1 text-on-surface-variant uppercase tracking-widest">Atributo 1</label>
                <input type="text" value={formData.hero?.specCard?.switches || ''} onChange={(e) => handleHeroSpecChange('switches', e.target.value)} className="w-full bg-surface p-2 rounded border border-outline/20 text-sm" placeholder="Ej: Gateron Milky Yellow Pro" />
              </div>
              <div>
                <label className="block text-[11px] mb-1 text-on-surface-variant uppercase tracking-widest">Atributo 2</label>
                <input type="text" value={formData.hero?.specCard?.keycaps || ''} onChange={(e) => handleHeroSpecChange('keycaps', e.target.value)} className="w-full bg-surface p-2 rounded border border-outline/20 text-sm" placeholder="Ej: PBT Double Shot" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* About Section */}
      <section className="bg-surface-container rounded-xl p-6 border border-outline/20">
        <h2 className="text-xl font-bold mb-6 text-primary border-b border-outline/20 pb-2">Sección: About / Historia</h2>
        
        <div className="grid grid-cols-2 gap-6">
          <div className="col-span-2">
            <label className="block text-sm mb-1 text-on-surface-variant">Título</label>
            <input type="text" value={formData.about.title || ''} onChange={(e) => handleChange('about', 'title', e.target.value)} className="w-full bg-surface p-2 rounded border border-outline/20" />
          </div>
          
          <div className="col-span-2">
            <label className="block text-sm mb-1 text-on-surface-variant">Párrafo 1</label>
            <textarea value={formData.about.paragraphs?.[0] || ''} onChange={(e) => handleAboutParagraphChange(0, e.target.value)} className="w-full bg-surface p-2 rounded border border-outline/20" rows={3} />
          </div>
          <div className="col-span-2">
            <label className="block text-sm mb-1 text-on-surface-variant">Párrafo 2</label>
            <textarea value={formData.about.paragraphs?.[1] || ''} onChange={(e) => handleAboutParagraphChange(1, e.target.value)} className="w-full bg-surface p-2 rounded border border-outline/20" rows={3} />
          </div>

          <div>
            <label className="block text-sm mb-1 text-on-surface-variant">CTA (Texto)</label>
            <input type="text" value={formData.about.cta || ''} onChange={(e) => handleChange('about', 'cta', e.target.value)} className="w-full bg-surface p-2 rounded border border-outline/20" />
          </div>
          <div>
            <label className="block text-sm mb-1 text-on-surface-variant">CTA (Link)</label>
            <input type="text" value={formData.about.ctaLink || ''} onChange={(e) => handleChange('about', 'ctaLink', e.target.value)} className="w-full bg-surface p-2 rounded border border-outline/20" />
          </div>

          <div className="col-span-2 grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm mb-1 text-on-surface-variant">Imagen Decorativa 1</label>
              {formData.about.images?.[0] && (
                <img src={formData.about.images[0].startsWith('http') ? formData.about.images[0] : `${import.meta.env.VITE_API_URL || ''}${formData.about.images[0]}`} className="w-full h-32 object-cover rounded mb-2" />
              )}
              <input type="file" accept="image/*" onChange={(e) => handleUpload(e, 'about', 'images', 0)} className="text-sm" />
              <input type="text" placeholder="URL remota" value={formData.about.images?.[0] || ''} onChange={(e) => {
                const newImgs = [...(formData.about.images || [])];
                newImgs[0] = e.target.value;
                handleChange('about', 'images', newImgs);
              }} className="w-full mt-2 bg-surface p-1 rounded text-xs border border-outline/20" />
            </div>
            
            <div>
              <label className="block text-sm mb-1 text-on-surface-variant">Imagen Decorativa 2</label>
              {formData.about.images?.[1] && (
                <img src={formData.about.images[1].startsWith('http') ? formData.about.images[1] : `${import.meta.env.VITE_API_URL || ''}${formData.about.images[1]}`} className="w-full h-32 object-cover rounded mb-2" />
              )}
              <input type="file" accept="image/*" onChange={(e) => handleUpload(e, 'about', 'images', 1)} className="text-sm" />
              <input type="text" placeholder="URL remota" value={formData.about.images?.[1] || ''} onChange={(e) => {
                const newImgs = [...(formData.about.images || [])];
                newImgs[1] = e.target.value;
                handleChange('about', 'images', newImgs);
              }} className="w-full mt-2 bg-surface p-1 rounded text-xs border border-outline/20" />
            </div>
          </div>
        </div>
      </section>
      
    </div>
  );
};

export default AdminSiteConfig;
