const API = import.meta.env.VITE_API_URL ?? '';

export const HERO_PRESETS = [
  {
    id: 'amethyst-bloom',
    name: 'Amethyst Bloom',
    thumbStyle: {
      background: 'radial-gradient(ellipse at 55% 60%, #6b21a8 0%, #4c1d95 35%, #180828 65%, #0d0d14 100%)',
    },
  },
  {
    id: 'deep-space',
    name: 'Deep Space',
    thumbStyle: {
      background: 'radial-gradient(ellipse at 25% 75%, rgba(6,182,212,0.55) 0%, transparent 52%), radial-gradient(ellipse at 80% 22%, rgba(124,58,237,0.6) 0%, transparent 52%), #050510',
    },
  },
  {
    id: 'neon-grid',
    name: 'Neon Grid',
    thumbStyle: {
      backgroundColor: '#0d0d14',
      backgroundImage:
        'radial-gradient(ellipse at 50% 50%, rgba(139,92,246,0.18) 0%, transparent 65%), repeating-linear-gradient(0deg, transparent, transparent 11px, rgba(139,92,246,0.22) 11px, rgba(139,92,246,0.22) 12px), repeating-linear-gradient(90deg, transparent, transparent 11px, rgba(139,92,246,0.22) 11px, rgba(139,92,246,0.22) 12px)',
    },
  },
  {
    id: 'mesh-gradient',
    name: 'Mesh Gradient',
    thumbStyle: {
      background: 'linear-gradient(135deg, #1e0a3c 0%, #0d1440 25%, #1a0d33 50%, #0d0d1a 75%, #050510 100%)',
    },
  },
  {
    id: 'dot-matrix',
    name: 'Dot Matrix',
    thumbStyle: {
      backgroundColor: '#0d0d14',
      backgroundImage:
        'radial-gradient(circle at 50% 50%, rgba(139,92,246,0.28) 0%, transparent 60%), radial-gradient(circle, rgba(139,92,246,0.22) 1px, transparent 1px)',
      backgroundSize: 'auto, 8px 8px',
    },
  },
  {
    id: 'void-dark',
    name: 'Void Dark',
    thumbStyle: {
      background: '#0d0d14',
    },
  },
];

const HeroBgPicker = ({ value, onChange, onUpload, uploading }) => {
  const currentPreset = value?.preset || 'amethyst-bloom';
  const currentType = value?.type || 'preset';

  const handlePresetSelect = (id) => {
    onChange({ type: 'preset', preset: id, url: value?.url || null });
  };

  const handleImageUrl = (url) => {
    onChange({ ...(value || {}), type: 'image', url });
  };

  const handleFileUpload = (e) => {
    if (onUpload) onUpload(e);
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-4 sm:grid-cols-7 gap-3">
        {HERO_PRESETS.map(preset => (
          <button
            key={preset.id}
            type="button"
            onClick={() => handlePresetSelect(preset.id)}
            title={preset.name}
            className={`group flex flex-col items-center gap-2 p-2 rounded-xl border-2 transition-all cursor-pointer bg-transparent ${
              currentType === 'preset' && currentPreset === preset.id
                ? 'border-primary shadow-[0_0_12px_rgba(214,186,255,0.3)]'
                : 'border-outline-variant/20 hover:border-primary/40'
            }`}
          >
            <div
              className="w-[72px] h-[72px] rounded-lg overflow-hidden flex-shrink-0"
              style={preset.thumbStyle}
            />
            <span className="text-[9px] font-mono text-on-surface-variant group-hover:text-on-surface transition-colors leading-tight text-center w-full truncate px-1">
              {preset.name}
            </span>
          </button>
        ))}

        {/* Custom image option */}
        <button
          type="button"
          onClick={() => onChange({ ...(value || {}), type: 'image' })}
          title="Imagen Personalizada"
          className={`group flex flex-col items-center gap-2 p-2 rounded-xl border-2 transition-all cursor-pointer bg-transparent ${
            currentType === 'image'
              ? 'border-primary shadow-[0_0_12px_rgba(214,186,255,0.3)]'
              : 'border-outline-variant/20 hover:border-primary/40'
          }`}
        >
          <div className="w-[72px] h-[72px] rounded-lg bg-surface-container-high flex items-center justify-center border border-dashed border-outline-variant/40">
            <span className="material-symbols-outlined text-on-surface-variant text-2xl">add_photo_alternate</span>
          </div>
          <span className="text-[9px] font-mono text-on-surface-variant group-hover:text-on-surface transition-colors leading-tight text-center w-full truncate px-1">
            Imagen Propia
          </span>
        </button>
      </div>

      {/* Custom image controls */}
      {currentType === 'image' && (
        <div className="bg-surface-container border border-outline-variant/20 rounded-lg p-4 space-y-3">
          <label className="block text-[10px] font-mono tracking-widest text-on-surface-variant uppercase">
            Imagen de Fondo Personalizada
          </label>
          <div className="flex items-center gap-4">
            {value?.url && (
              <img
                src={value.url.startsWith('http') ? value.url : `${API}${value.url}`}
                alt="Preview"
                className="w-16 h-10 object-cover rounded-md border border-outline/20 flex-shrink-0"
              />
            )}
            <input
              type="file"
              accept="image/*"
              onChange={handleFileUpload}
              disabled={uploading}
              className="text-sm font-mono text-on-surface-variant file:mr-4 file:py-1.5 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-semibold file:bg-primary/10 file:text-primary hover:file:bg-primary/20 cursor-pointer disabled:opacity-50"
            />
          </div>
          <input
            type="text"
            placeholder="O pega un URL externo aquí"
            value={value?.url || ''}
            onChange={(e) => handleImageUrl(e.target.value)}
            className="w-full bg-surface-container-high border-none p-2.5 rounded-lg text-sm font-mono text-on-surface focus:ring-1 focus:ring-primary/40 focus:outline-none"
          />
        </div>
      )}
    </div>
  );
};

export default HeroBgPicker;
