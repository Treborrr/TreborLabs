import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';

const API = import.meta.env.VITE_API_URL ?? '';

const emptyForm = { name: '', regions: '', price: '', enabled: true };

const AdminShipping = () => {
  const { authFetch } = useAuth();
  const [zones, setZones]     = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm]       = useState(null);  // null = hidden, {} = new/edit
  const [saving, setSaving]   = useState(false);
  const [error, setError]     = useState('');
  const [toast, setToast]     = useState('');

  const showToast = (msg) => { setToast(msg); setTimeout(() => setToast(''), 3000); };

  useEffect(() => {
    loadZones();
  }, []);

  const loadZones = () => {
    setLoading(true);
    authFetch(`${API}/api/admin/shipping/zones`)
      .then(r => r.json())
      .then(data => setZones(data.zones || []))
      .catch(() => setZones([]))
      .finally(() => setLoading(false));
  };

  const handleToggle = async (zone) => {
    const res = await authFetch(`${API}/api/admin/shipping/zones/${zone.id}`, {
      method: 'PATCH',
      body: JSON.stringify({ enabled: !zone.enabled }),
    });
    if (res.ok) {
      setZones(prev => prev.map(z => z.id === zone.id ? { ...z, enabled: !z.enabled } : z));
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('¿Eliminar esta zona de envío?')) return;
    const res = await authFetch(`${API}/api/admin/shipping/zones/${id}`, { method: 'DELETE' });
    if (res.ok || res.status === 204) {
      setZones(prev => prev.filter(z => z.id !== id));
      showToast('Zona eliminada');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!form.name || !form.price) { setError('Nombre y precio son requeridos'); return; }
    setSaving(true);
    const isNew = !form.id;
    const url = isNew
      ? `${API}/api/admin/shipping/zones`
      : `${API}/api/admin/shipping/zones/${form.id}`;
    try {
      const res = await authFetch(url, {
        method: isNew ? 'POST' : 'PATCH',
        body: JSON.stringify({
          name: form.name,
          regions: form.regions.split(',').map(r => r.trim()).filter(Boolean),
          price: parseFloat(form.price),
          enabled: form.enabled,
        }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error || 'Error al guardar'); return; }
      isNew
        ? setZones(prev => [...prev, data.zone])
        : setZones(prev => prev.map(z => z.id === data.zone.id ? data.zone : z));
      setForm(null);
      showToast(isNew ? 'Zona creada' : 'Zona actualizada');
    } catch { setError('Error de conexión'); }
    finally { setSaving(false); }
  };

  return (
    <>
      <main className="min-h-screen bg-surface-container-low flex flex-col w-full">
        <header className="h-20 px-10 flex items-center justify-between bg-surface/50 backdrop-blur-md sticky top-0 z-40 border-b border-outline-variant/10">
          <div>
            <h2 className="font-headline font-bold text-2xl tracking-tight">Zonas de Envío</h2>
            <p className="text-xs font-mono text-on-surface-variant">/root/admin/shipping</p>
          </div>
          {!form && (
            <button
              onClick={() => { setForm({ ...emptyForm }); setError(''); }}
              className="flex items-center gap-2 bg-primary-container text-on-primary-container px-5 py-2.5 rounded-lg font-headline font-bold text-xs uppercase tracking-widest hover:bg-primary hover:text-on-primary transition-all"
            >
              <span className="material-symbols-outlined text-sm">add</span>
              Nueva Zona
            </button>
          )}
        </header>

        <div className="p-10 max-w-4xl space-y-8">

          {/* Form */}
          {form && (
            <section className="bg-surface rounded-xl shadow-2xl p-8 space-y-6">
              <h3 className="font-headline font-bold text-lg">{form.id ? 'Editar Zona' : 'Nueva Zona de Envío'}</h3>
              {error && <div className="bg-error/10 border border-error/30 rounded-lg px-4 py-3 text-sm text-error">{error}</div>}
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-mono uppercase tracking-widest text-on-surface-variant mb-2">Nombre *</label>
                    <input
                      type="text" required value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                      placeholder="Lima Metropolitana"
                      className="w-full bg-surface-container-highest border-none rounded-md px-4 py-3 text-sm focus:ring-1 focus:ring-primary/40 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-mono uppercase tracking-widest text-on-surface-variant mb-2">Precio (USD) *</label>
                    <input
                      type="number" required min="0" step="0.01" value={form.price}
                      onChange={e => setForm(f => ({ ...f, price: e.target.value }))}
                      placeholder="12.50"
                      className="w-full bg-surface-container-highest border-none rounded-md px-4 py-3 text-sm focus:ring-1 focus:ring-primary/40 focus:outline-none"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-xs font-mono uppercase tracking-widest text-on-surface-variant mb-2">
                      Regiones cubiertas <span className="normal-case text-on-surface-variant/60">(separadas por coma)</span>
                    </label>
                    <input
                      type="text" value={form.regions}
                      onChange={e => setForm(f => ({ ...f, regions: e.target.value }))}
                      placeholder="Miraflores, San Isidro, Barranco, Surco…"
                      className="w-full bg-surface-container-highest border-none rounded-md px-4 py-3 text-sm focus:ring-1 focus:ring-primary/40 focus:outline-none"
                    />
                  </div>
                </div>
                <label className="flex items-center gap-3 cursor-pointer">
                  <input type="checkbox" checked={!!form.enabled} onChange={e => setForm(f => ({ ...f, enabled: e.target.checked }))}
                    className="w-4 h-4 accent-primary rounded" />
                  <span className="text-sm text-on-surface-variant">Zona habilitada</span>
                </label>
                <div className="flex gap-3 pt-2">
                  <button type="submit" disabled={saving}
                    className="flex items-center gap-2 bg-primary-container text-on-primary-container px-5 py-2.5 rounded-lg font-headline font-bold text-xs uppercase tracking-widest hover:bg-primary hover:text-on-primary transition-all disabled:opacity-50">
                    <span className="material-symbols-outlined text-sm">save</span>
                    {saving ? 'Guardando…' : 'Guardar'}
                  </button>
                  <button type="button" onClick={() => { setForm(null); setError(''); }}
                    className="px-4 py-2.5 rounded-lg font-mono text-xs text-on-surface-variant hover:bg-surface-container-highest transition-all">
                    Cancelar
                  </button>
                </div>
              </form>
            </section>
          )}

          {/* Table */}
          <section className="bg-surface rounded-xl shadow-2xl overflow-hidden">
            {loading ? (
              <div className="flex justify-center py-16">
                <div className="w-7 h-7 border-2 border-primary border-t-transparent rounded-full animate-spin" />
              </div>
            ) : zones.length === 0 ? (
              <div className="text-center py-16 text-on-surface-variant">
                <span className="material-symbols-outlined text-4xl mb-3 block opacity-30">local_shipping</span>
                <p className="text-sm">No hay zonas de envío configuradas.</p>
              </div>
            ) : (
              <table className="w-full">
                <thead>
                  <tr className="border-b border-outline-variant/10 bg-surface-container">
                    {['Zona', 'Precio', 'Regiones', 'Estado', 'Acciones'].map(h => (
                      <th key={h} className="px-6 py-3 text-left text-[10px] font-mono uppercase tracking-widest text-on-surface-variant">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-outline-variant/10">
                  {zones.map(zone => (
                    <tr key={zone.id} className="hover:bg-surface-container-low transition-colors">
                      <td className="px-6 py-4 font-bold text-sm text-on-surface">{zone.name}</td>
                      <td className="px-6 py-4 font-mono text-sm text-primary">${Number(zone.price).toFixed(2)}</td>
                      <td className="px-6 py-4 text-xs text-on-surface-variant max-w-[200px] truncate">
                        {Array.isArray(zone.regions) ? zone.regions.join(', ') : zone.regions || '—'}
                      </td>
                      <td className="px-6 py-4">
                        <button onClick={() => handleToggle(zone)}
                          className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest border transition-colors ${
                            zone.enabled
                              ? 'bg-green-500/10 text-green-400 border-green-500/20 hover:bg-green-500/20'
                              : 'bg-surface-container-highest text-on-surface-variant border-outline-variant/20 hover:bg-surface-container-high'
                          }`}>
                          <span className="material-symbols-outlined text-xs">{zone.enabled ? 'check_circle' : 'cancel'}</span>
                          {zone.enabled ? 'Activa' : 'Inactiva'}
                        </button>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-1">
                          <button onClick={() => { setForm({ ...zone, regions: Array.isArray(zone.regions) ? zone.regions.join(', ') : zone.regions || '' }); setError(''); }}
                            className="p-1.5 rounded-lg text-on-surface-variant hover:bg-surface-container-high hover:text-primary transition-all">
                            <span className="material-symbols-outlined text-sm">edit</span>
                          </button>
                          <button onClick={() => handleDelete(zone.id)}
                            className="p-1.5 rounded-lg text-on-surface-variant hover:bg-error/10 hover:text-error transition-all">
                            <span className="material-symbols-outlined text-sm">delete</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
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

export default AdminShipping;
