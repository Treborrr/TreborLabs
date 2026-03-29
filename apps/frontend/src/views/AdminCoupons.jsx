import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import InfoTooltip from '../components/InfoTooltip';
import { COUPON_TOOLTIPS } from '../constants/adminTooltips';

const API = import.meta.env.VITE_API_URL ?? '';

const emptyForm = { code: '', type: 'percent', value: '', minOrderTotal: '', maxUses: '', expiresAt: '', enabled: true };

const fmtDate = (iso) => iso ? new Date(iso).toLocaleDateString('es-PE', { day: 'numeric', month: 'short', year: 'numeric' }) : '—';

const AdminCoupons = () => {
  const { authFetch } = useAuth();
  const [coupons, setCoupons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm]       = useState(null);
  const [saving, setSaving]   = useState(false);
  const [error, setError]     = useState('');
  const [toast, setToast]     = useState('');

  const showToast = (msg) => { setToast(msg); setTimeout(() => setToast(''), 3000); };

  useEffect(() => { loadCoupons(); }, []);

  const loadCoupons = () => {
    setLoading(true);
    authFetch(`${API}/api/admin/coupons`)
      .then(r => r.json())
      .then(data => setCoupons(data.coupons || []))
      .catch(() => setCoupons([]))
      .finally(() => setLoading(false));
  };

  const handleDelete = async (id) => {
    if (!window.confirm('¿Eliminar este cupón?')) return;
    const res = await authFetch(`${API}/api/admin/coupons/${id}`, { method: 'DELETE' });
    if (res.ok || res.status === 204) {
      setCoupons(prev => prev.filter(c => c.id !== id));
      showToast('Cupón eliminado');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!form.code || !form.value) { setError('Código y valor son requeridos'); return; }
    setSaving(true);
    const isNew = !form.id;
    const url = isNew ? `${API}/api/admin/coupons` : `${API}/api/admin/coupons/${form.id}`;
    try {
      const res = await authFetch(url, {
        method: isNew ? 'POST' : 'PATCH',
        body: JSON.stringify({
          code: form.code.toUpperCase().trim(),
          type: form.type,
          value: parseFloat(form.value),
          minOrderTotal: form.minOrderTotal ? parseFloat(form.minOrderTotal) : null,
          maxUses: form.maxUses ? parseInt(form.maxUses) : null,
          expiresAt: form.expiresAt || null,
          enabled: form.enabled,
        }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error || 'Error al guardar'); return; }
      isNew
        ? setCoupons(prev => [...prev, data.coupon])
        : setCoupons(prev => prev.map(c => c.id === data.coupon.id ? data.coupon : c));
      setForm(null);
      showToast(isNew ? 'Cupón creado' : 'Cupón actualizado');
    } catch { setError('Error de conexión'); }
    finally { setSaving(false); }
  };

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  return (
    <>
      <main className="min-h-screen bg-surface-container-low flex flex-col w-full">
        <header className="h-20 px-10 flex items-center justify-between bg-surface/50 backdrop-blur-md sticky top-0 z-40 border-b border-outline-variant/10">
          <div>
            <h2 className="font-headline font-bold text-2xl tracking-tight">Cupones</h2>
            <p className="text-xs font-mono text-on-surface-variant">/root/admin/coupons</p>
          </div>
          {!form && (
            <button
              onClick={() => { setForm({ ...emptyForm }); setError(''); }}
              className="flex items-center gap-2 bg-primary-container text-on-primary-container px-5 py-2.5 rounded-lg font-headline font-bold text-xs uppercase tracking-widest hover:bg-primary hover:text-on-primary transition-all"
            >
              <span className="material-symbols-outlined text-sm">add</span>
              Nuevo Cupón
            </button>
          )}
        </header>

        <div className="p-10 max-w-5xl space-y-8">

          {/* Form */}
          {form && (
            <section className="bg-surface rounded-xl shadow-2xl p-8 space-y-6">
              <h3 className="font-headline font-bold text-lg">{form.id ? 'Editar Cupón' : 'Nuevo Cupón'}</h3>
              {error && <div className="bg-error/10 border border-error/30 rounded-lg px-4 py-3 text-sm text-error">{error}</div>}
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-mono uppercase tracking-widest text-on-surface-variant mb-2">Código *<InfoTooltip text={COUPON_TOOLTIPS.code} /></label>
                    <input type="text" required value={form.code} onChange={e => set('code', e.target.value.toUpperCase())}
                      placeholder="VERANO20"
                      className="w-full bg-surface-container-highest border-none rounded-md px-4 py-3 text-sm font-mono focus:ring-1 focus:ring-primary/40 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-mono uppercase tracking-widest text-on-surface-variant mb-2">Tipo *<InfoTooltip text={COUPON_TOOLTIPS.type} /></label>
                    <select value={form.type} onChange={e => set('type', e.target.value)}
                      className="w-full bg-surface-container-highest border-none rounded-md px-4 py-3 text-sm focus:ring-1 focus:ring-primary/40 focus:outline-none">
                      <option value="percent">Porcentaje (%)</option>
                      <option value="fixed">Monto fijo (USD)</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-mono uppercase tracking-widest text-on-surface-variant mb-2">
                      Valor * {form.type === 'percent' ? '(%)' : '(USD)'}<InfoTooltip text={COUPON_TOOLTIPS.value} />
                    </label>
                    <input type="number" required min="0" step={form.type === 'percent' ? '1' : '0.01'}
                      max={form.type === 'percent' ? '100' : undefined}
                      value={form.value} onChange={e => set('value', e.target.value)}
                      placeholder={form.type === 'percent' ? '20' : '15.00'}
                      className="w-full bg-surface-container-highest border-none rounded-md px-4 py-3 text-sm focus:ring-1 focus:ring-primary/40 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-mono uppercase tracking-widest text-on-surface-variant mb-2">Mínimo de compra (USD)<InfoTooltip text={COUPON_TOOLTIPS.minOrderTotal} /></label>
                    <input type="number" min="0" step="0.01" value={form.minOrderTotal}
                      onChange={e => set('minOrderTotal', e.target.value)} placeholder="50.00"
                      className="w-full bg-surface-container-highest border-none rounded-md px-4 py-3 text-sm focus:ring-1 focus:ring-primary/40 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-mono uppercase tracking-widest text-on-surface-variant mb-2">Usos máximos<InfoTooltip text={COUPON_TOOLTIPS.maxUses} /></label>
                    <input type="number" min="1" value={form.maxUses} onChange={e => set('maxUses', e.target.value)}
                      placeholder="100"
                      className="w-full bg-surface-container-highest border-none rounded-md px-4 py-3 text-sm focus:ring-1 focus:ring-primary/40 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-mono uppercase tracking-widest text-on-surface-variant mb-2">Vence el<InfoTooltip text={COUPON_TOOLTIPS.expiresAt} /></label>
                    <input type="date" value={form.expiresAt ? form.expiresAt.slice(0, 10) : ''}
                      onChange={e => set('expiresAt', e.target.value)}
                      className="w-full bg-surface-container-highest border-none rounded-md px-4 py-3 text-sm focus:ring-1 focus:ring-primary/40 focus:outline-none"
                    />
                  </div>
                </div>
                <label className="flex items-center gap-3 cursor-pointer">
                  <input type="checkbox" checked={!!form.enabled} onChange={e => set('enabled', e.target.checked)}
                    className="w-4 h-4 accent-primary rounded" />
                  <span className="text-sm text-on-surface-variant">Cupón habilitado<InfoTooltip text={COUPON_TOOLTIPS.enabled} /></span>
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
            ) : coupons.length === 0 ? (
              <div className="text-center py-16 text-on-surface-variant">
                <span className="material-symbols-outlined text-4xl mb-3 block opacity-30">local_offer</span>
                <p className="text-sm">No hay cupones creados.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full min-w-[700px]">
                  <thead>
                    <tr className="border-b border-outline-variant/10 bg-surface-container">
                      {['Código', 'Descuento', 'Mínimo', 'Usos', 'Vence', 'Estado', ''].map(h => (
                        <th key={h} className="px-5 py-3 text-left text-[10px] font-mono uppercase tracking-widest text-on-surface-variant">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-outline-variant/10">
                    {coupons.map(c => {
                      const expired = c.expiresAt && new Date(c.expiresAt) < new Date();
                      const exhausted = c.maxUses && c.usedCount >= c.maxUses;
                      return (
                        <tr key={c.id} className="hover:bg-surface-container-low transition-colors">
                          <td className="px-5 py-4">
                            <span className="font-mono font-bold text-sm text-primary bg-primary/10 px-2 py-0.5 rounded">
                              {c.code}
                            </span>
                          </td>
                          <td className="px-5 py-4 text-sm font-mono text-on-surface">
                            {c.type === 'percent' ? `${c.value}%` : `$${Number(c.value).toFixed(2)}`}
                          </td>
                          <td className="px-5 py-4 text-sm text-on-surface-variant font-mono">
                            {c.minOrderTotal ? `$${Number(c.minOrderTotal).toFixed(2)}` : '—'}
                          </td>
                          <td className="px-5 py-4 text-sm font-mono">
                            <span className={c.maxUses && c.usedCount >= c.maxUses ? 'text-error' : 'text-on-surface-variant'}>
                              {c.usedCount}{c.maxUses ? `/${c.maxUses}` : ''}
                            </span>
                          </td>
                          <td className="px-5 py-4 text-sm text-on-surface-variant font-mono">
                            <span className={expired ? 'text-error' : ''}>{fmtDate(c.expiresAt)}</span>
                          </td>
                          <td className="px-5 py-4">
                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-widest ${
                              !c.enabled || expired || exhausted
                                ? 'bg-surface-container-highest text-on-surface-variant'
                                : 'bg-green-500/10 text-green-400'
                            }`}>
                              {!c.enabled ? 'Inactivo' : expired ? 'Expirado' : exhausted ? 'Agotado' : 'Activo'}
                            </span>
                          </td>
                          <td className="px-5 py-4">
                            <div className="flex items-center gap-1">
                              <button onClick={() => {
                                setForm({ ...c, expiresAt: c.expiresAt ? c.expiresAt.slice(0, 10) : '' });
                                setError('');
                              }} className="p-1.5 rounded-lg text-on-surface-variant hover:bg-surface-container-high hover:text-primary transition-all">
                                <span className="material-symbols-outlined text-sm">edit</span>
                              </button>
                              <button onClick={() => handleDelete(c.id)}
                                className="p-1.5 rounded-lg text-on-surface-variant hover:bg-error/10 hover:text-error transition-all">
                                <span className="material-symbols-outlined text-sm">delete</span>
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
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

export default AdminCoupons;
