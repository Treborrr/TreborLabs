import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const API = import.meta.env.VITE_API_URL ?? '';
const LIMIT = 20;

const statusStyles = {
  in_stock:    'text-green-400 bg-green-400/10 border-green-400/30',
  coming_soon: 'text-amber-400 bg-amber-400/10 border-amber-400/30',
  out_of_stock:'text-error bg-error/10 border-error/30',
};
const statusLabels = {
  in_stock:    'En Stock',
  coming_soon: 'Próximamente',
  out_of_stock:'Sin Stock',
};

const AdminProducts = () => {
  const { authFetch } = useAuth();

  const [products, setProducts]       = useState([]);
  const [total, setTotal]             = useState(0);
  const [loading, setLoading]         = useState(true);
  const [search, setSearch]           = useState('');
  const [categoryFilter, setCat]      = useState('');
  const [statusFilter, setStatus]     = useState('');
  const [page, setPage]               = useState(0);
  const [confirmDelete, setConfirm]   = useState(null);
  const [toast, setToast]             = useState(null);

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  const loadProducts = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        limit: LIMIT,
        offset: page * LIMIT,
        ...(search && { search }),
        ...(categoryFilter && { category: categoryFilter }),
        ...(statusFilter && { status: statusFilter }),
      });
      const res = await fetch(`${API}/api/products?${params}`);
      const data = await res.json();
      setProducts(data.products || []);
      setTotal(data.total || 0);
    } catch {
      showToast('Error al cargar productos', 'error');
    } finally {
      setLoading(false);
    }
  }, [search, categoryFilter, statusFilter, page]);

  useEffect(() => { loadProducts(); }, [loadProducts]);

  const handleDelete = async (id) => {
    try {
      await authFetch(`${API}/api/products/${id}`, { method: 'DELETE' });
      showToast('Producto eliminado');
      loadProducts();
    } catch {
      showToast('Error al eliminar', 'error');
    }
    setConfirm(null);
  };

  const handleToggleFeatured = async (product) => {
    try {
      await authFetch(`${API}/api/products/${product.id}`, {
        method: 'PUT',
        body: JSON.stringify({ featured: !product.featured }),
      });
      showToast(product.featured ? 'Quitado de destacados' : 'Marcado como destacado');
      loadProducts();
    } catch {
      showToast('Error al actualizar', 'error');
    }
  };

  return (
    <>
      <main className="min-h-screen bg-surface-container-low flex flex-col w-full">
        {/* Header */}
        <header className="h-20 px-4 md:px-10 flex items-center justify-between bg-surface/50 backdrop-blur-md sticky top-0 z-40">
          <div>
            <h2 className="font-headline font-bold text-2xl text-on-surface tracking-tight">Gestión de Productos</h2>
            <p className="text-xs font-mono text-on-surface-variant">/root/admin/products_v1</p>
          </div>
          <Link
            to="/admin/products/new"
            className="flex items-center gap-2 bg-gradient-to-br from-primary to-primary-container text-on-primary px-5 py-2.5 rounded-md font-headline font-bold text-xs uppercase tracking-widest shadow-[0_0_15px_rgba(214,186,255,0.2)] hover:shadow-[0_0_25px_rgba(214,186,255,0.3)] transition-all active:scale-95 no-underline"
          >
            <span className="material-symbols-outlined text-sm">add</span>
            Nuevo Producto
          </Link>
        </header>

        <div className="p-4 md:p-10 space-y-6">
          {/* Filters */}
          <section className="bg-surface p-6 rounded-xl shadow-2xl">
            <div className="flex flex-col md:flex-row gap-4 items-start md:items-center">
              <div className="relative flex items-center bg-surface-container-high rounded-lg overflow-hidden focus-within:ring-1 ring-primary/40 transition-all flex-1">
                <span className="material-symbols-outlined absolute left-3 text-on-surface-variant text-sm">search</span>
                <input
                  className="bg-transparent border-none py-2.5 pl-10 pr-4 text-sm text-on-surface focus:ring-0 placeholder:text-on-surface-variant/50 w-full"
                  placeholder="Buscar producto..."
                  value={search}
                  onChange={e => { setSearch(e.target.value); setPage(0); }}
                />
              </div>
              <select
                value={categoryFilter}
                onChange={e => { setCat(e.target.value); setPage(0); }}
                className="bg-surface-container-high border-none rounded-lg px-4 py-2.5 text-sm text-on-surface focus:ring-1 focus:ring-primary/40 focus:outline-none"
              >
                <option value="">Todas las categorías</option>
                <option value="keyboard">Teclados</option>
                <option value="raspi">Raspberry Pi</option>
              </select>
              <select
                value={statusFilter}
                onChange={e => { setStatus(e.target.value); setPage(0); }}
                className="bg-surface-container-high border-none rounded-lg px-4 py-2.5 text-sm text-on-surface focus:ring-1 focus:ring-primary/40 focus:outline-none"
              >
                <option value="">Todos los estados</option>
                <option value="in_stock">En Stock</option>
                <option value="coming_soon">Próximamente</option>
                <option value="out_of_stock">Sin Stock</option>
              </select>
            </div>
          </section>

          {/* Table */}
          <section className="bg-surface p-8 rounded-xl shadow-2xl">
            <div className="flex justify-between items-center mb-6">
              <p className="text-xs font-mono text-on-surface-variant">{total} producto{total !== 1 ? 's' : ''} encontrado{total !== 1 ? 's' : ''}</p>
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
                      {['Imagen', 'Nombre', 'Categoría', 'Precio', 'Stock', 'Estado', 'Dest.', 'Acciones'].map(h => (
                        <th key={h} className="text-left pb-4 text-[10px] font-mono tracking-widest text-on-surface-variant uppercase pr-4">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-outline-variant/10">
                    {products.map(p => (
                      <tr key={p.id} className="hover:bg-surface-container-low transition-colors group">
                        <td className="py-4 pr-4">
                          <div className="w-12 h-12 rounded-lg overflow-hidden bg-surface-container-high flex items-center justify-center">
                            {p.images?.[0]
                              ? <img src={p.images[0]} alt={p.name} className="w-full h-full object-cover" />
                              : <span className="material-symbols-outlined text-on-surface-variant text-sm">image</span>
                            }
                          </div>
                        </td>
                        <td className="py-4 pr-4">
                          <p className="font-headline font-bold text-sm">{p.name}</p>
                          <p className="text-[10px] font-mono text-on-surface-variant truncate max-w-[140px]">{p.slug}</p>
                        </td>
                        <td className="py-4 pr-4">
                          <span className="px-3 py-1 bg-primary/10 text-primary border border-primary/20 rounded-full text-[10px] font-mono tracking-widest">
                            {p.category === 'keyboard' ? 'Teclado' : 'Raspi'}
                          </span>
                        </td>
                        <td className="py-4 pr-4 font-mono text-primary font-medium">${p.price}</td>
                        <td className="py-4 pr-4">
                          <span className={`font-mono text-sm ${p.stock < 5 ? 'text-error' : 'text-on-surface'}`}>{p.stock}</span>
                          <span className="text-on-surface-variant text-xs ml-1">u</span>
                        </td>
                        <td className="py-4 pr-4">
                          <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest border ${statusStyles[p.status] || ''}`}>
                            {statusLabels[p.status] || p.status}
                          </span>
                        </td>
                        <td className="py-4 pr-4">
                          <button
                            onClick={() => handleToggleFeatured(p)}
                            className={`transition-colors ${p.featured ? 'text-amber-400' : 'text-on-surface-variant hover:text-amber-400'}`}
                          >
                            <span className="material-symbols-outlined text-sm">{p.featured ? 'star' : 'star_border'}</span>
                          </button>
                        </td>
                        <td className="py-4">
                          <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                            <Link to={`/admin/products/${p.id}/edit`} className="text-on-surface-variant hover:text-primary transition-colors no-underline">
                              <span className="material-symbols-outlined text-sm">edit</span>
                            </Link>
                            <button
                              onClick={() => setConfirm(p)}
                              className="text-on-surface-variant hover:text-error transition-colors"
                            >
                              <span className="material-symbols-outlined text-sm">delete</span>
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {products.length === 0 && (
                  <div className="text-center py-16 text-on-surface-variant">
                    <span className="material-symbols-outlined text-4xl mb-3 block">inventory_2</span>
                    <p className="font-mono text-sm">Sin productos para este filtro</p>
                  </div>
                )}
              </div>
            )}

            {/* Pagination */}
            {total > LIMIT && (
              <div className="flex justify-center items-center gap-3 mt-8">
                <button
                  disabled={page === 0}
                  onClick={() => setPage(p => p - 1)}
                  className="px-4 py-2 rounded-lg bg-surface-container-high text-sm disabled:opacity-40 hover:bg-surface-container-highest transition-colors"
                >
                  <span className="material-symbols-outlined text-sm">chevron_left</span>
                </button>
                <span className="font-mono text-xs text-on-surface-variant">
                  {page + 1} / {Math.ceil(total / LIMIT)}
                </span>
                <button
                  disabled={(page + 1) * LIMIT >= total}
                  onClick={() => setPage(p => p + 1)}
                  className="px-4 py-2 rounded-lg bg-surface-container-high text-sm disabled:opacity-40 hover:bg-surface-container-highest transition-colors"
                >
                  <span className="material-symbols-outlined text-sm">chevron_right</span>
                </button>
              </div>
            )}
          </section>
        </div>
      </main>

      {/* Confirm Delete Modal */}
      {confirmDelete && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-surface/80 backdrop-blur-sm">
          <div className="bg-surface-container-high rounded-xl p-8 w-full max-w-sm border border-outline-variant/20 shadow-2xl">
            <h3 className="font-headline font-bold text-lg mb-2">¿Eliminar producto?</h3>
            <p className="text-sm text-on-surface-variant mb-6">
              Se eliminará <span className="text-on-surface font-bold">"{confirmDelete.name}"</span>. Esta acción no se puede deshacer.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setConfirm(null)}
                className="flex-1 py-3 border border-outline-variant/30 rounded-md text-sm text-on-surface-variant hover:bg-surface-container-highest transition-all"
              >Cancelar</button>
              <button
                onClick={() => handleDelete(confirmDelete.id)}
                className="flex-1 py-3 bg-error text-on-error rounded-md font-bold text-sm uppercase tracking-widest active:scale-95 transition-all"
              >Eliminar</button>
            </div>
          </div>
        </div>
      )}

      {/* Toast */}
      {toast && (
        <div className={`fixed bottom-6 right-6 z-[200] px-6 py-3 rounded-xl shadow-2xl text-sm font-bold ${toast.type === 'error' ? 'bg-error text-on-error' : 'bg-primary-container text-on-primary-container'}`}>
          {toast.msg}
        </div>
      )}
    </>
  );
};

export default AdminProducts;
