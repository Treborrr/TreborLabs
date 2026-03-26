import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useWishlist } from '../context/WishlistContext';
import SEOMeta from '../components/SEOMeta';

const API = import.meta.env.VITE_API_URL ?? '';

const Wishlist = () => {
  const { user, authFetch } = useAuth();
  const { toggle } = useWishlist();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    authFetch(`${API}/api/users/me/wishlist`)
      .then(r => r.json())
      .then(data => setItems(data.items || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [user]);

  const handleRemove = async (productId) => {
    setItems(prev => prev.filter(i => i.productId !== productId));
    await toggle(productId);
  };

  if (!user) {
    return (
      <main className="pt-32 pb-20 px-6 max-w-3xl mx-auto text-center min-h-screen">
        <span className="material-symbols-outlined text-5xl text-on-surface-variant/20 block mb-4">favorite</span>
        <h1 className="font-headline font-bold text-2xl mb-3">Inicia sesión para ver tu wishlist</h1>
        <Link to="/login" className="text-primary font-mono text-sm hover:underline no-underline">Iniciar sesión</Link>
      </main>
    );
  }

  return (
    <main className="pt-32 pb-20 px-6 max-w-6xl mx-auto min-h-screen">
      <SEOMeta title="Wishlist" description="Tus productos favoritos guardados en Trebor Labs." />
      <div className="mb-10">

        <h1 className="font-headline font-black text-4xl tracking-tight mb-2">Wishlist</h1>
        <p className="text-on-surface-variant font-mono text-sm">{items.length} producto{items.length !== 1 ? 's' : ''} guardados</p>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="animate-pulse">
              <div className="aspect-[4/5] rounded-xl bg-surface-container-high mb-4" />
              <div className="h-4 bg-surface-container-high rounded w-3/4 mb-2" />
              <div className="h-3 bg-surface-container-high rounded w-1/2" />
            </div>
          ))}
        </div>
      ) : items.length === 0 ? (
        <div className="text-center py-24 text-on-surface-variant">
          <span className="material-symbols-outlined text-6xl mb-4 block opacity-20">favorite_border</span>
          <p className="font-headline font-bold text-xl mb-2">Tu wishlist está vacía</p>
          <p className="text-sm mb-8">Guarda productos que te interesen para encontrarlos fácilmente.</p>
          <Link to="/products" className="bg-primary-container text-on-primary-container font-headline font-bold px-6 py-3 rounded-lg text-xs uppercase tracking-widest hover:bg-primary hover:text-on-primary transition-all no-underline">
            Ver catálogo
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {items.map(({ productId, product }) => {
            const p = product || {};
            return (
              <div key={productId} className="group relative">
                <div className="relative aspect-[4/5] rounded-xl bg-surface-container-low overflow-hidden mb-4">
                  {p.images?.[0]
                    ? <img src={p.images[0]} alt={p.name} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
                    : <div className="w-full h-full flex items-center justify-center text-on-surface-variant">
                        <span className="material-symbols-outlined text-5xl">image</span>
                      </div>
                  }
                  <button
                    onClick={() => handleRemove(productId)}
                    className="absolute top-3 right-3 w-9 h-9 bg-surface/80 backdrop-blur-sm rounded-full flex items-center justify-center text-error hover:bg-error hover:text-white transition-all"
                    title="Quitar de wishlist"
                  >
                    <span className="material-symbols-outlined text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>favorite</span>
                  </button>
                </div>
                <div className="space-y-1">
                  <div className="flex items-start justify-between gap-2">
                    <Link to={`/products/${p.slug || productId}`} className="no-underline">
                      <h3 className="font-headline font-bold text-base tracking-tight uppercase group-hover:text-primary transition-colors">{p.name || 'Producto'}</h3>
                    </Link>
                    <span className="font-mono text-primary font-medium flex-shrink-0">${p.price}</span>
                  </div>
                  <Link
                    to={`/products/${p.slug || productId}`}
                    className="block text-center mt-3 py-2.5 bg-surface-container-highest rounded-md text-on-surface text-xs font-bold hover:bg-primary hover:text-on-primary transition-colors no-underline"
                  >
                    Ver producto
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      )}

    </main>
  );
};

export default Wishlist;
