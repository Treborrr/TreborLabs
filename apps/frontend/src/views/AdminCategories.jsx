import { useState, useEffect } from 'react';
import api from '../utils/api';

const AdminCategories = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [newCat, setNewCat] = useState({ name: '', slug: '', icon: '', order: 0, enabled: true });
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState({ type: '', text: '' });

  const loadCategories = async () => {
    setLoading(true);
    try {
      const res = await api.get('/admin/categories');
      setCategories(res.data);
    } catch (err) {
      console.error(err);
      setMsg({ type: 'error', text: 'Error cargando categorías' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCategories();
  }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMsg({ type: '', text: '' });
    try {
      const orderParsed = parseInt(newCat.order, 10) || 0;
      await api.post('/admin/categories', { ...newCat, order: orderParsed });
      setMsg({ type: 'success', text: 'Categoría creada' });
      setShowAdd(false);
      setNewCat({ name: '', slug: '', icon: '', order: 0, enabled: true });
      loadCategories();
    } catch (err) {
      console.error(err);
      setMsg({ type: 'error', text: err.response?.data?.error || 'Error al crear' });
    } finally {
      setSaving(false);
    }
  };

  const handleToggle = async (id, currentEnabled) => {
    try {
      await api.patch(`/admin/categories/${id}`, { enabled: !currentEnabled });
      setCategories(categories.map(c => c.id === id ? { ...c, enabled: !currentEnabled } : c));
    } catch (err) {
      console.error(err);
      setMsg({ type: 'error', text: 'Error al cambiar estado' });
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("¿Seguro que deseas eliminar esta categoría? Si tiene productos, fallará.")) return;
    try {
      await api.delete(`/admin/categories/${id}`);
      setMsg({ type: 'success', text: 'Categoría eliminada' });
      loadCategories();
    } catch (err) {
      console.error(err);
      setMsg({ type: 'error', text: err.response?.data?.error || 'Error al eliminar' });
    }
  };

  return (
    <div className="p-8 max-w-5xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Categorías</h1>
        <button
          onClick={() => setShowAdd(!showAdd)}
          className="bg-primary text-on-primary px-4 py-2 rounded font-bold"
        >
          {showAdd ? 'Cancelar' : '+ Nueva Categoría'}
        </button>
      </div>

      {msg.text && (
        <div className={`p-4 mb-8 text-sm font-bold rounded ${msg.type === 'error' ? 'bg-red-500/20 text-red-500' : 'bg-green-500/20 text-green-500'}`}>
          {msg.text}
        </div>
      )}

      {showAdd && (
        <form onSubmit={handleCreate} className="bg-surface-container rounded-xl p-6 mb-8 border border-outline/20">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
            <div>
              <label className="block text-sm mb-1">Nombre</label>
              <input type="text" required value={newCat.name} onChange={e => Object.assign(newCat, { name: e.target.value }) && setNewCat({ ...newCat, slug: e.target.value.toLowerCase().replace(/[^a-z0-9]+/g, '-') })} className="w-full bg-surface p-2 rounded border border-outline/20" />
            </div>
            <div>
              <label className="block text-sm mb-1">Slug (URL)</label>
              <input type="text" required value={newCat.slug} onChange={e => setNewCat({ ...newCat, slug: e.target.value })} placeholder="ej-teclados" className="w-full bg-surface p-2 rounded border border-outline/20" pattern="[a-z0-9-]+" title="Solo minúsculas, números y guiones" />
            </div>
            <div>
              <label className="block text-sm mb-1">Ícono (Material Symbol)</label>
              <input type="text" value={newCat.icon} onChange={e => setNewCat({ ...newCat, icon: e.target.value })} placeholder="keyboard" className="w-full bg-surface p-2 rounded border border-outline/20" />
            </div>
            <div>
              <label className="block text-sm mb-1">Orden</label>
              <input type="number" required value={newCat.order} onChange={e => setNewCat({ ...newCat, order: e.target.value })} className="w-full bg-surface p-2 rounded border border-outline/20" />
            </div>
          </div>
          <button type="submit" disabled={saving} className="bg-primary-container text-on-primary-container px-6 py-2 rounded font-bold w-full disabled:opacity-50">
            {saving ? 'Guardando...' : 'Crear Categoría'}
          </button>
        </form>
      )}

      {loading ? (
        <p>Cargando categorías...</p>
      ) : (
        <div className="overflow-x-auto bg-surface-container rounded-xl shadow-sm border border-outline/20">
          <table className="w-full text-left border-collapse">
            <thead className="bg-surface-container-high text-on-surface-variant text-sm border-b border-outline/20">
              <tr>
                <th className="p-4 font-semibold uppercase tracking-wider">Categoría</th>
                <th className="p-4 font-semibold uppercase tracking-wider">Slug</th>
                <th className="p-4 font-semibold uppercase tracking-wider text-center">Orden</th>
                <th className="p-4 font-semibold uppercase tracking-wider text-center">Estado</th>
                <th className="p-4 font-semibold uppercase tracking-wider text-right">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {categories.map((cat) => (
                <tr key={cat.id} className="border-b border-outline/10 hover:bg-surface-container-high/50 transition-colors">
                  <td className="p-4 flex items-center gap-3">
                    <span className="material-symbols-outlined text-primary">{cat.icon || 'category'}</span>
                    <span className="font-medium text-on-surface">{cat.name}</span>
                  </td>
                  <td className="p-4 font-mono text-sm text-on-surface-variant">{cat.slug}</td>
                  <td className="p-4 text-center text-on-surface-variant">{cat.order}</td>
                  <td className="p-4 text-center">
                    <button
                      onClick={() => handleToggle(cat.id, cat.enabled)}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${cat.enabled ? 'bg-primary' : 'bg-surface-container-highest'}`}
                    >
                      <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${cat.enabled ? 'translate-x-6' : 'translate-x-1'}`} />
                    </button>
                  </td>
                  <td className="p-4 text-right">
                    <button onClick={() => handleDelete(cat.id)} className="p-2 text-error hover:bg-error/10 rounded-full transition-colors" title="Eliminar">
                      <span className="material-symbols-outlined text-sm">delete</span>
                    </button>
                  </td>
                </tr>
              ))}
              {categories.length === 0 && (
                <tr>
                  <td colSpan="5" className="p-8 text-center text-on-surface-variant">No hay categorías configuradas.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default AdminCategories;
