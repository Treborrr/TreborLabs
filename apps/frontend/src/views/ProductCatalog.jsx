import { Link, useLocation } from 'react-router-dom';
import { useMemo, useState, useEffect } from 'react';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import { useAuth } from '../context/AuthContext';
import { imgUrl } from '../utils/imgUrl';
import SEOMeta from '../components/SEOMeta';

const API = import.meta.env.VITE_API_URL ?? '';

const keyboardLayouts   = ['Split (Dividado)', 'Ortho (Lineal)', 'TKL (Compacto)'];
const keyboardMaterials = ['Aluminio', 'Madera de Nogal', 'Resina', 'Policarbonato'];
const raspiModels       = ['Todos', 'Pi 5', 'Pi 4', 'Pi Zero'];
const raspiUses         = ['Kit Completo', 'NAS / Servidor', 'IoT / Maker', 'AI / Vision', 'Retro / Gaming'];

const mapStatusLabel = (s) => s === 'in_stock' ? 'En Stock' : s === 'coming_soon' ? 'Coming Soon' : 'Sin Stock';
const mapStatusColor = (s) => s === 'in_stock' ? 'bg-emerald-500/90' : s === 'coming_soon' ? 'bg-amber-500/90' : 'bg-red-500/90';

const ProductCatalog = () => {
  const { addToCart } = useCart();
  const { user } = useAuth();
  const { ids: wishlistIds, toggle: toggleWishlist } = useWishlist();
  const location = useLocation();
  
  const queryParams = new URLSearchParams(location.search);
  const qCategory = queryParams.get('category');
  
  // Si la ruta es /raspi, forzamos categoría raspi por defecto
  const initCategory = location.pathname.includes('/raspi') ? 'raspi' : (qCategory || '');
  
  const [currentCategory, setCurrentCategory] = useState(initCategory);
  const [categories, setCategories] = useState([]);
  const [products, setProducts]   = useState([]);
  const [loading, setLoading]     = useState(true);
  const [searchQuery, setSearch]  = useState('');
  const [raspiModel, setModel]    = useState('Todos');

  // Actualizar categoría si cambian los params o la ruta
  useEffect(() => {
    const newCat = location.pathname.includes('/raspi') ? 'raspi' : (new URLSearchParams(location.search).get('category') || '');
    setCurrentCategory(newCat);
  }, [location.search, location.pathname]);

  useEffect(() => {
    fetch(`${API}/api/categories`)
      .then(r => r.json())
      .then(data => setCategories(data || []))
      .catch(console.error);
  }, []);

  useEffect(() => {
    setLoading(true);
    setProducts([]);
    const url = currentCategory ? `${API}/api/products?category=${currentCategory}&limit=50` : `${API}/api/products?limit=50`;
    fetch(url)
      .then(r => r.json())
      .then(data => setProducts(data.products || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [currentCategory]);

  const isRaspi = currentCategory === 'raspi';
  const isKeyboard = currentCategory === 'keyboard';

  const filteredProducts = useMemo(() => {
    let list = products;
    if (isRaspi && raspiModel !== 'Todos') {
      list = list.filter(p => p.specs?.model === raspiModel);
    }
    if (searchQuery) {
      list = list.filter(p =>
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (p.description || '').toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    return list;
  }, [products, isRaspi, raspiModel, searchQuery]);

  return (
    <main className="pt-32 pb-20 px-8 max-w-[1600px] mx-auto min-h-screen">
      <SEOMeta
        title={isRaspi ? 'Raspberry Pi & SBCs' : isKeyboard ? 'Teclados Custom' : 'Catálogo'}
        description={isRaspi ? 'Kits Raspberry Pi, single board computers y accesorios IoT.' : 'Teclados mecánicos custom, kits y periféricos de alta calidad.'}
      />
      {/* Header */}
      <header className="mb-12 flex flex-col md:flex-row md:items-end justify-between gap-8">
        <div className="space-y-2">
          <p className="font-mono text-primary text-xs tracking-widest uppercase">
            {isRaspi ? 'Single Board Computers' : isKeyboard ? 'Directorio Técnico' : 'Catálogo General'}
          </p>
          <h1 className="font-headline text-5xl font-black tracking-tighter uppercase italic">
            {isRaspi ? 'Raspberry Pi & SBCs' : isKeyboard ? 'Teclados Custom' : 'Todos los Productos'}
          </h1>
        </div>
        <div className="w-full max-w-xl">
          <div className="relative flex items-center bg-surface-container-high rounded-xl overflow-hidden focus-within:ring-2 ring-primary/40 transition-all">
            <span className="material-symbols-outlined absolute left-4 text-on-surface-variant">search</span>
            <input
              className="w-full bg-transparent border-none py-4 pl-12 pr-6 text-on-surface focus:ring-0 placeholder:text-on-surface-variant/50"
              placeholder={'Buscar periféricos o hardware...'}
              type="text"
              value={searchQuery}
              onChange={e => setSearch(e.target.value)}
            />
            <div className="pr-4 hidden md:block">
              <kbd className="bg-surface-container text-[10px] font-mono px-2 py-1 rounded border border-outline-variant/30 text-on-surface-variant">CMD + K</kbd>
            </div>
          </div>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
        {/* Sidebar filtros */}
        <aside className="lg:col-span-3 space-y-10">
          <div className="space-y-6">
            <h3 className="font-headline font-bold text-lg flex items-center gap-2">
              <span className="material-symbols-outlined text-primary">filter_list</span>
              Filtros Avanzados
            </h3>

            {/* Category toggle dinámico */}
            <div className="space-y-2">
              <p className="font-mono text-[10px] uppercase text-on-surface-variant tracking-widest">Categoría</p>
              
              <Link to="/products" className="flex items-center gap-3 cursor-pointer group no-underline">
                <div className={`w-4 h-4 rounded border flex items-center justify-center transition-colors ${currentCategory === '' ? 'bg-primary border-primary text-surface' : 'bg-surface-container-highest border-outline-variant/30 group-hover:border-primary/50'}`}>
                  {currentCategory === '' && <span className="material-symbols-outlined text-[12px] font-bold">check</span>}
                </div>
                <span className={`text-sm group-hover:text-primary transition-colors ${currentCategory === '' ? 'text-primary font-medium' : 'text-on-surface'}`}>Todos</span>
              </Link>
              
              {categories.map(cat => (
                <Link to={`/products?category=${cat.slug}`} key={cat.id} className="flex items-center gap-3 cursor-pointer group no-underline">
                  <div className={`w-4 h-4 rounded border flex items-center justify-center transition-colors ${currentCategory === cat.slug ? 'bg-primary border-primary text-surface' : 'bg-surface-container-highest border-outline-variant/30 group-hover:border-primary/50'}`}>
                    {currentCategory === cat.slug && <span className="material-symbols-outlined text-[12px] font-bold">check</span>}
                  </div>
                  <span className={`text-sm group-hover:text-primary transition-colors ${currentCategory === cat.slug ? 'text-primary font-medium' : 'text-on-surface'}`}>{cat.name}</span>
                </Link>
              ))}
            </div>

            {/* Keyboard filters (legacy) */}
            {isKeyboard && (
              <>
                <div className="space-y-2">
                  <p className="font-mono text-[10px] uppercase text-on-surface-variant tracking-widest">Configuración</p>
                  {keyboardLayouts.map((t, i) => (
                    <label key={t} className="flex items-center gap-3 cursor-pointer group">
                      <input className="w-4 h-4 rounded bg-surface-container-highest border-none text-primary focus:ring-primary/20" type="checkbox" defaultChecked={i === 2} />
                      <span className={`text-sm group-hover:text-primary transition-colors ${i === 2 ? 'text-primary font-medium' : ''}`}>{t}</span>
                    </label>
                  ))}
                </div>
                <div className="space-y-2">
                  <p className="font-mono text-[10px] uppercase text-on-surface-variant tracking-widest">Material Chasis</p>
                  <div className="flex flex-wrap gap-2">
                    {keyboardMaterials.map(m => (
                      <button key={m} className={`px-4 py-2 rounded-xl text-xs border transition-all ${m === 'Madera de Nogal' ? 'bg-primary/20 text-primary border-primary/40' : 'bg-surface-container-highest border-outline-variant/20 hover:border-primary/40'}`}>{m}</button>
                    ))}
                  </div>
                </div>
              </>
            )}

            {/* Raspi filters (legacy) */}
            {isRaspi && (
              <>
                <div className="space-y-2">
                  <p className="font-mono text-[10px] uppercase text-on-surface-variant tracking-widest">Modelo</p>
                  {raspiModels.map(m => (
                    <button
                      key={m}
                      onClick={() => setModel(m)}
                      className={`flex items-center justify-between w-full px-4 py-2.5 rounded-lg text-sm transition-all ${raspiModel === m ? 'bg-primary/15 text-primary font-bold border border-primary/30' : 'text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface'}`}
                    >
                      <span>{m}</span>
                      {raspiModel === m && <span className="material-symbols-outlined text-sm">check</span>}
                    </button>
                  ))}
                </div>
                <div className="space-y-2">
                  <p className="font-mono text-[10px] uppercase text-on-surface-variant tracking-widest">Uso</p>
                  {raspiUses.map(c => (
                    <label key={c} className="flex items-center gap-3 cursor-pointer group">
                      <input className="w-4 h-4 rounded bg-surface-container-highest border-none text-primary focus:ring-primary/20" type="checkbox" />
                      <span className="text-sm text-on-surface-variant group-hover:text-primary transition-colors">{c}</span>
                    </label>
                  ))}
                </div>
              </>
            )}

            {/* Price range */}
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <p className="font-mono text-[10px] uppercase text-on-surface-variant tracking-widest">Inversión (USD)</p>
                <span className="font-mono text-xs text-primary">$50 - $600</span>
              </div>
              <input className="w-full h-1 bg-surface-container-highest rounded-full appearance-none accent-primary cursor-pointer" max="600" min="50" type="range" defaultValue="600" />
            </div>

            {/* Availability */}
            <div className="space-y-2">
              <p className="font-mono text-[10px] uppercase text-on-surface-variant tracking-widest">Disponibilidad</p>
              <div className="flex gap-4">
                <button className="flex-1 py-3 text-xs rounded-xl bg-surface-container-low border border-outline-variant/10 hover:bg-surface-container-high transition-colors">En Stock</button>
                <button className="flex-1 py-3 text-xs rounded-xl bg-surface-container-low border border-outline-variant/10 hover:bg-surface-container-high transition-colors">Próximamente</button>
              </div>
            </div>
          </div>

          {/* CTA card */}
          <div className="bg-gradient-to-br from-primary/20 to-primary-container/40 p-6 rounded-2xl relative overflow-hidden group">
            <div className="relative z-10 space-y-3">
              <h4 className="font-headline font-bold italic leading-tight uppercase">
                {isRaspi ? 'Pi Dev Program' : isKeyboard ? 'Custom Labs Program' : 'Trebor Pro'}
              </h4>
              <p className="text-xs text-on-surface-variant">
                {isRaspi
                  ? 'Accede a documentación avanzada, descuentos y soporte prioritario.'
                  : 'Diseña tu PCB o accede a early access de productos.'}
              </p>
              <button className="text-xs font-bold text-primary flex items-center gap-2 group-hover:gap-3 transition-all uppercase tracking-tighter">
                {isRaspi ? 'Registrarme' : 'Explorar Programa'}
                <span className="material-symbols-outlined text-sm">arrow_forward</span>
              </button>
            </div>
            <span className="material-symbols-outlined absolute -bottom-4 -right-4 text-primary/10 text-8xl rotate-12 group-hover:rotate-0 transition-transform duration-500">memory</span>
          </div>
        </aside>

        {/* Product grid */}
        <div className="lg:col-span-9">
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-x-8 gap-y-12">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="animate-pulse">
                  <div className="aspect-square mb-6 rounded-xl bg-surface-container-high" />
                  <div className="h-4 bg-surface-container-high rounded w-3/4 mb-2" />
                  <div className="h-3 bg-surface-container-high rounded w-1/2" />
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-x-8 gap-y-12">
              {filteredProducts.map(p => {
                const comingSoon = p.status !== 'in_stock';
                return (
                  <div key={p.id} className="group">
                    <Link to={`/products/${p.slug || p.id}`} className="block relative aspect-square mb-6 overflow-hidden rounded-xl bg-surface-container-low no-underline">
                      {p.images?.[0]
                        ? <img src={imgUrl(p.images[0])} alt={p.name} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                        : <div className="w-full h-full flex items-center justify-center text-on-surface-variant">
                            <span className="material-symbols-outlined text-5xl">image</span>
                          </div>
                      }
                      <div className="absolute top-4 left-4">
                        <span className={`px-3 py-1 ${mapStatusColor(p.status)} backdrop-blur text-white text-[10px] font-bold uppercase tracking-widest rounded-full shadow-lg`}>
                          {mapStatusLabel(p.status)}
                        </span>
                      </div>
                      {comingSoon && <div className="absolute inset-0 bg-surface/40 group-hover:bg-transparent transition-all" />}
                      {/* Wishlist button */}
                      {user && (
                        <button
                          onClick={e => { e.preventDefault(); toggleWishlist(p.id); }}
                          className="absolute top-3 right-3 w-9 h-9 bg-surface/70 backdrop-blur-sm rounded-full flex items-center justify-center transition-all opacity-0 group-hover:opacity-100 hover:bg-surface"
                          title={wishlistIds.has(p.id) ? 'Quitar de wishlist' : 'Agregar a wishlist'}
                        >
                          <span className="material-symbols-outlined text-sm" style={{ fontVariationSettings: wishlistIds.has(p.id) ? "'FILL' 1" : "'FILL' 0", color: wishlistIds.has(p.id) ? '#ef4444' : undefined }}>
                             favorite
                          </span>
                        </button>
                      )}
                      {!comingSoon && (
                        <button
                          onClick={e => { e.preventDefault(); addToCart({ ...p, price: `$${p.price}`, image: p.images?.[0] || '' }); }}
                          className="absolute bottom-4 right-4 w-12 h-12 bg-white text-surface rounded-full flex items-center justify-center opacity-0 translate-y-4 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300 shadow-xl"
                        >
                          <span className="material-symbols-outlined">add_shopping_cart</span>
                        </button>
                      )}
                    </Link>
                    <div className={`space-y-1 ${comingSoon ? 'opacity-70 group-hover:opacity-100 transition-opacity' : ''}`}>
                      <div className="flex justify-between items-start">
                        <Link to={`/products/${p.slug || p.id}`} className="no-underline">
                          <h3 className="font-headline font-bold text-xl tracking-tight uppercase group-hover:text-primary transition-colors">{p.name}</h3>
                        </Link>
                        <span className="font-mono text-primary font-medium">${p.price}</span>
                      </div>
                      {comingSoon ? (
                        <div className="pt-4">
                          <button className="text-[10px] font-bold uppercase tracking-widest border border-primary/40 px-4 py-2 rounded hover:bg-primary hover:text-surface transition-all">Notificarme</button>
                        </div>
                      ) : (
                        <div className="pt-4">
                          <button
                            onClick={() => addToCart({ ...p, price: `$${p.price}`, image: p.images?.[0] || '' })}
                            className="w-full py-2.5 bg-surface-container-highest rounded-md text-on-surface text-xs font-bold hover:bg-primary hover:text-surface transition-colors flex items-center justify-center gap-2"
                          >
                            <span className="material-symbols-outlined text-sm">shopping_bag</span>
                            Añadir al carrito
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}

              {filteredProducts.length === 0 && !loading && (
                <div className="col-span-3 text-center py-24 text-on-surface-variant">
                  <span className="material-symbols-outlined text-5xl mb-4 block">search_off</span>
                  <p className="font-headline font-bold">
                    {searchQuery ? `Sin resultados para "${searchQuery}"` : 'Sin productos en esta categoría'}
                  </p>
                </div>
              )}

              {/* Custom Build CTA */}
              {(isKeyboard || currentCategory === '') && (
                <div className="group flex flex-col items-center justify-center border-2 border-dashed border-outline-variant/30 rounded-xl aspect-[4/5] text-center p-8">
                  <span className="material-symbols-outlined text-4xl text-outline-variant mb-4">settings_input_component</span>
                  <h3 className="font-headline font-bold uppercase tracking-tight mb-2">Build Custom</h3>
                  <p className="text-xs text-on-surface-variant mb-6">¿No encuentras tu layout ideal? Diseñamos a medida.</p>
                  <button className="bg-surface-container-highest px-6 py-3 rounded-xl text-xs font-bold uppercase tracking-widest hover:bg-primary hover:text-surface transition-all">Solicitar Demo</button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

    </main>
  );
};

export default ProductCatalog;
