import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';

const AdminCategories = () => {
  const { authFetch, API } = useAuth();
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [newCat, setNewCat] = useState({ name: '', slug: '', icon: '', order: 0, enabled: true });
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState(null);

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  const loadCategories = useCallback(async () => {
    setLoading(true);
    try {
      const res = await authFetch(`${API}/api/admin/categories`);
      if (!res.ok) throw new Error('Error en respuesta del servidor');
      const data = await res.json();
      setCategories(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error(err);
      showToast('Error al cargar categorías', 'error');
    } finally {
      setLoading(false);
    }
  }, [API, authFetch]);

  useEffect(() => {
    loadCategories();
  }, [loadCategories]);

  const handleCreate = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const orderParsed = parseInt(newCat.order, 10) || 0;
      const res = await authFetch(`${API}/api/admin/categories`, {
        method: 'POST',
        body: JSON.stringify({ ...newCat, order: orderParsed }),
      });
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error?.error || 'Error al crear');
      }
      showToast('Categoría creada satisfactoriamente');
      setShowAdd(false);
      setNewCat({ name: '', slug: '', icon: '', order: 0, enabled: true });
      loadCategories();
    } catch (err) {
      console.error(err);
      showToast(err.message || 'Error al crear la categoría', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleToggle = async (id, currentEnabled) => {
    try {
      const res = await authFetch(`${API}/api/admin/categories/${id}`, {
        method: 'PATCH',
        body: JSON.stringify({ enabled: !currentEnabled }),
      });
      if (!res.ok) throw new Error('Error al actualizar');
      setCategories(categories.map(c => c.id === id ? { ...c, enabled: !currentEnabled } : c));
      showToast(`Categoría ${currentEnabled ? 'desactivada' : 'activada'}`);
    } catch (err) {
      showToast('Error al actualizar el estado', 'error');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("¿Seguro que deseas eliminar esta categoría? Si tiene productos, fallará.")) return;
    try {
      const res = await authFetch(`${API}/api/admin/categories/${id}`, {
        method: 'DELETE',
      });
      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData?.error || 'Error al eliminar');
      }
      showToast('Categoría eliminada');
      loadCategories();
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  return (
    <>
      <main className="min-h-screen bg-surface-container-low flex flex-col w-full">
        {/* Header */}
        <header className="h-20 px-10 flex items-center justify-between bg-surface/50 backdrop-blur-md sticky top-0 z-40">
          <div>
            <h2 className="font-headline font-bold text-2xl text-on-surface tracking-tight">Gestión de Categorías</h2>
            <p className="text-xs font-mono text-on-surface-variant">/root/admin/categories_v1</p>
          </div>
          <button
            onClick={() => setShowAdd(!showAdd)}
            className="flex items-center gap-2 bg-gradient-to-br from-primary to-primary-container text-on-primary px-5 py-2.5 rounded-md font-headline font-bold text-xs uppercase tracking-widest shadow-[0_0_15px_rgba(214,186,255,0.2)] hover:shadow-[0_0_25px_rgba(214,186,255,0.3)] transition-all active:scale-95 border-none cursor-pointer"
          >
            <span className="material-symbols-outlined text-sm">{showAdd ? 'close' : 'add'}</span>
            {showAdd ? 'Cancelar' : 'Nueva Categoría'}
          </button>
        </header>

        <div className="p-10 space-y-6">
          {/* Create Form */}
          {showAdd && (
            <section className="bg-surface p-6 rounded-xl shadow-2xl animate-fade-in">
              <h3 className="text-lg font-bold mb-4 font-headline text-primary border-b border-outline-variant/20 pb-2">Crear nueva categoría</h3>
              <form onSubmit={handleCreate}>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
                  <div>
                    <label className="block text-xs font-mono tracking-widest text-on-surface-variant uppercase mb-2">Nombre</label>
                    <input type="text" required value={newCat.name} onChange={e => Object.assign(newCat, { name: e.target.value }) && setNewCat({ ...newCat, slug: e.target.value.toLowerCase().replace(/[^a-z0-9]+/g, '-') })} className="w-full bg-surface-container-high border-none p-3 rounded-lg text-sm text-on-surface focus:ring-1 focus:ring-primary/40 focus:outline-none" placeholder="Ej: Switches" />
                  </div>
                  <div>
                    <label className="block text-xs font-mono tracking-widest text-on-surface-variant uppercase mb-2">Slug</label>
                    <input type="text" required value={newCat.slug} onChange={e => setNewCat({ ...newCat, slug: e.target.value })} placeholder="ej-teclados" className="w-full bg-surface-container-high border-none p-3 rounded-lg text-sm text-on-surface focus:ring-1 focus:ring-primary/40 focus:outline-none" pattern="[a-z0-9-]+" title="Solo minúsculas, números y guiones" />
                  </div>
                  <div>
                    <label className="block text-xs font-mono tracking-widest text-on-surface-variant uppercase mb-2">Ícono</label>
                    <input type="text" value={newCat.icon} onChange={e => setNewCat({ ...newCat, icon: e.target.value })} placeholder="keyboard" className="w-full bg-surface-container-high border-none p-3 rounded-lg text-sm text-on-surface focus:ring-1 focus:ring-primary/40 focus:outline-none" />
                  </div>
                  <div>
                    <label className="block text-xs font-mono tracking-widest text-on-surface-variant uppercase mb-2">Orden</label>
                    <input type="number" required value={newCat.order} onChange={e => setNewCat({ ...newCat, order: e.target.value })} className="w-full bg-surface-container-high border-none p-3 rounded-lg text-sm text-on-surface focus:ring-1 focus:ring-primary/40 focus:outline-none" />
                  </div>
                </div>
                <div className="flex justify-end">
                  <button type="submit" disabled={saving} className="bg-primary/10 text-primary hover:bg-primary/20 px-6 py-2.5 rounded-lg font-bold text-xs uppercase tracking-widest transition-colors disabled:opacity-50">
                    {saving ? 'Guardando...' : 'Guardar Categoría'}
                  </button>
                </div>
              </form>
            </section>
          )}

          {/* Table Area */}
          <section className="bg-surface p-8 rounded-xl shadow-2xl">
            <div className="flex justify-between items-center mb-6">
              <p className="text-xs font-mono text-on-surface-variant">{categories.length} categoría{categories.length !== 1 ? 's' : ''} configurada{categories.length !== 1 ? 's' : ''}</p>
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
                      <th className="text-left pb-4 text-[10px] font-mono tracking-widest text-on-surface-variant uppercase pr-4">Categoría</th>
                      <th className="text-left pb-4 text-[10px] font-mono tracking-widest text-on-surface-variant uppercase pr-4">Slug (URL)</th>
                      <th className="text-left pb-4 text-[10px] font-mono tracking-widest text-on-surface-variant uppercase pr-4">Orden</th>
                      <th className="text-left pb-4 text-[10px] font-mono tracking-widest text-on-surface-variant uppercase pr-4">Estado</th>
                      <th className="text-right pb-4 text-[10px] font-mono tracking-widest text-on-surface-variant uppercase pr-4">Acciones</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-outline-variant/10">
                    {categories.map((cat) => (
                      <tr key={cat.id} className="hover:bg-surface-container-low transition-colors group">
                        <td className="py-4 pr-4">
                          <div className="flex items-center gap-3">
                            <span className="material-symbols-outlined text-primary text-xl">{cat.icon || 'category'}</span>
                            <span className="font-headline font-bold text-sm">{cat.name}</span>
                          </div>
                        </td>
                        <td className="py-4 pr-4">
                          <span className="font-mono text-xs text-on-surface-variant">{cat.slug}</span>
                        </td>
                        <td className="py-4 pr-4">
                          <span className="font-mono text-sm text-on-surface-variant">{cat.order}</span>
                        </td>
                        <td className="py-4 pr-4">
                          <button
                            onClick={() => handleToggle(cat.id, cat.enabled)}
                            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${cat.enabled ? 'bg-primary' : 'bg-surface-container-highest'}`}
                          >
                            <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${cat.enabled ? 'translate-x-6' : 'translate-x-1'}`} />
                          </button>
                        </td>
                        <td className="py-4 pr-4 text-right">
                          <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button
                              onClick={() => handleDelete(cat.id)}
                              className="text-on-surface-variant hover:text-error transition-colors"
                              title="Eliminar"
                            >
                              <span className="material-symbols-outlined text-sm">delete</span>
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                    {categories.length === 0 && (
                      <tr>
                        <td colSpan="5">
                          <div className="text-center py-16 text-on-surface-variant">
                            <span className="material-symbols-outlined text-4xl mb-3 block">category</span>
                            <p className="font-mono text-sm">No hay categorías configuradas</p>
                          </div>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </section>
        </div>
      </main>

      {/* Toast */}
      {toast && (
        <div className={`fixed bottom-6 right-6 z-[200] px-6 py-3 rounded-xl shadow-2xl text-sm font-bold animate-fade-in ${toast.type === 'error' ? 'bg-error text-on-error' : 'bg-primary-container text-on-primary-container'}`}>
          {toast.msg}
        </div>
      )}
    </>
  );
};

export default AdminCategories;
