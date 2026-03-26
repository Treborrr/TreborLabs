import { useState, useEffect } from 'react';

const API = import.meta.env.VITE_API_URL ?? '';

const STATIC_PAGES = [
  { path: '/', label: 'Inicio', icon: 'home' },
  { path: '/products', label: 'Tienda', icon: 'storefront' },
  { path: '/products?category=keyboard', label: 'Teclados', icon: 'keyboard' },
  { path: '/products?category=raspi', label: 'Raspberry Pi', icon: 'memory' },
  { path: '/raspi', label: 'Página Raspberry Pi', icon: 'developer_board' },
  { path: '/blog', label: 'Blog', icon: 'article' },
  { path: '/about', label: 'Nuestra Historia', icon: 'groups' },
  { path: '/contact', label: 'Contacto', icon: 'mail' },
  { path: '/faq', label: 'FAQ', icon: 'help' },
  { path: '/envios', label: 'Envíos', icon: 'local_shipping' },
  { path: '/devoluciones', label: 'Devoluciones', icon: 'undo' },
  { path: '/terminos', label: 'Términos', icon: 'gavel' },
  { path: '/privacidad', label: 'Privacidad', icon: 'shield' },
];

const TABS = ['Páginas', 'Productos', 'Blog', 'Manual'];

const LinkPicker = ({ value, onChange }) => {
  const [open, setOpen] = useState(false);
  const [tab, setTab] = useState(0);
  const [products, setProducts] = useState([]);
  const [posts, setPosts] = useState([]);
  const [loadingProducts, setLoadingProducts] = useState(false);
  const [loadingPosts, setLoadingPosts] = useState(false);
  const [productSearch, setProductSearch] = useState('');
  const [postSearch, setPostSearch] = useState('');
  const [manualUrl, setManualUrl] = useState(value || '');

  useEffect(() => {
    if (open && tab === 1 && products.length === 0) {
      setLoadingProducts(true);
      fetch(`${API}/api/products?limit=100`)
        .then(r => r.ok ? r.json() : { products: [] })
        .then(d => setProducts(d.products || []))
        .catch(() => setProducts([]))
        .finally(() => setLoadingProducts(false));
    }
  }, [open, tab]);

  useEffect(() => {
    if (open && tab === 2 && posts.length === 0) {
      setLoadingPosts(true);
      fetch(`${API}/api/posts?limit=100`)
        .then(r => r.ok ? r.json() : [])
        .then(d => setPosts(Array.isArray(d) ? d : (d.posts || [])))
        .catch(() => setPosts([]))
        .finally(() => setLoadingPosts(false));
    }
  }, [open, tab]);

  useEffect(() => {
    setManualUrl(value || '');
  }, [value]);

  const select = (url) => {
    onChange(url);
    setOpen(false);
  };

  const filteredProducts = products.filter(p =>
    p.name?.toLowerCase().includes(productSearch.toLowerCase())
  );

  const filteredPosts = posts.filter(p =>
    p.title?.toLowerCase().includes(postSearch.toLowerCase())
  );

  return (
    <>
      <div className="flex items-center gap-3 bg-surface-container-high p-3 rounded-lg">
        <span className="material-symbols-outlined text-[18px] text-on-surface-variant flex-shrink-0">link</span>
        <span className="font-mono text-sm text-on-surface flex-1 truncate min-w-0">
          {value || <span className="text-on-surface-variant italic text-xs">sin destino</span>}
        </span>
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="flex items-center gap-1.5 bg-primary/10 hover:bg-primary/20 text-primary text-xs font-mono font-bold px-3 py-1.5 rounded-md transition-colors flex-shrink-0 border-none cursor-pointer"
        >
          <span className="material-symbols-outlined text-[16px]">edit</span>
          Cambiar Destino
        </button>
      </div>

      {open && (
        <div
          className="fixed inset-0 z-[500] flex items-center justify-center bg-surface/80 backdrop-blur-md p-4"
          onClick={(e) => { if (e.target === e.currentTarget) setOpen(false); }}
        >
          <div className="bg-surface w-full max-w-2xl rounded-xl shadow-2xl flex flex-col max-h-[85vh] overflow-hidden border border-outline-variant/20">
            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-outline-variant/20 flex-shrink-0">
              <h3 className="font-headline font-bold text-on-surface text-lg">Seleccionar Destino</h3>
              <button
                onClick={() => setOpen(false)}
                className="text-on-surface-variant hover:text-on-surface transition-colors border-none bg-transparent cursor-pointer p-1 rounded"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            {/* Tabs */}
            <div className="flex border-b border-outline-variant/20 flex-shrink-0">
              {TABS.map((t, i) => (
                <button
                  key={i}
                  onClick={() => setTab(i)}
                  className={`flex-1 py-3 text-[11px] font-mono tracking-widest uppercase transition-colors border-none cursor-pointer ${
                    tab === i
                      ? 'text-primary border-b-2 border-primary bg-primary/5'
                      : 'text-on-surface-variant hover:text-on-surface bg-transparent'
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>

            {/* Tab Content */}
            <div className="flex-1 overflow-y-auto p-4">
              {/* Tab 0: Static Pages */}
              {tab === 0 && (
                <div className="space-y-1">
                  {STATIC_PAGES.map(page => (
                    <button
                      key={page.path}
                      onClick={() => select(page.path)}
                      className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm transition-colors text-left border-none cursor-pointer ${
                        value === page.path
                          ? 'bg-primary/15 text-primary'
                          : 'hover:bg-surface-container-high text-on-surface bg-transparent'
                      }`}
                    >
                      <span className="material-symbols-outlined text-[18px] text-on-surface-variant">{page.icon}</span>
                      <span className="flex-1 font-medium">{page.label}</span>
                      <span className="font-mono text-[11px] text-on-surface-variant">{page.path}</span>
                      {value === page.path && (
                        <span className="material-symbols-outlined text-[16px] text-primary">check_circle</span>
                      )}
                    </button>
                  ))}
                </div>
              )}

              {/* Tab 1: Products */}
              {tab === 1 && (
                <div>
                  <div className="mb-4 relative">
                    <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant text-[18px]">search</span>
                    <input
                      type="text"
                      placeholder="Buscar producto..."
                      value={productSearch}
                      onChange={(e) => setProductSearch(e.target.value)}
                      className="w-full bg-surface-container-high pl-9 pr-4 py-2.5 rounded-lg text-sm text-on-surface focus:ring-1 focus:ring-primary/40 focus:outline-none border-none"
                    />
                  </div>
                  {loadingProducts ? (
                    <div className="flex justify-center py-12">
                      <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                    </div>
                  ) : (
                    <div className="grid grid-cols-2 gap-3">
                      {filteredProducts.length === 0 ? (
                        <div className="col-span-2 text-center py-8 text-on-surface-variant text-sm font-mono">
                          No se encontraron productos
                        </div>
                      ) : filteredProducts.map(product => {
                        const img = Array.isArray(product.images) ? product.images[0] : null;
                        const imgSrc = img ? (img.startsWith('http') ? img : `${API}${img}`) : null;
                        const productLink = `/products/${product.slug || product.id}`;
                        return (
                          <button
                            key={product.id}
                            onClick={() => select(productLink)}
                            className={`flex items-center gap-3 p-3 rounded-lg border transition-all text-left cursor-pointer ${
                              value === productLink
                                ? 'border-primary bg-primary/10'
                                : 'border-outline-variant/20 hover:border-primary/40 hover:bg-surface-container-high bg-transparent'
                            }`}
                          >
                            <div className="w-12 h-12 rounded-md bg-surface-container-high flex-shrink-0 overflow-hidden">
                              {imgSrc ? (
                                <img src={imgSrc} alt={product.name} className="w-full h-full object-cover" />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center">
                                  <span className="material-symbols-outlined text-on-surface-variant/40 text-sm">image</span>
                                </div>
                              )}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-xs font-bold text-on-surface truncate">{product.name}</p>
                              <p className="text-[11px] font-mono text-primary">${Number(product.price || 0).toFixed(2)}</p>
                              {product.category && (
                                <span className="text-[9px] font-mono text-on-surface-variant bg-surface-container px-1.5 py-0.5 rounded mt-0.5 inline-block">
                                  {product.category}
                                </span>
                              )}
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}

              {/* Tab 2: Blog Posts */}
              {tab === 2 && (
                <div>
                  <div className="mb-4 relative">
                    <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant text-[18px]">search</span>
                    <input
                      type="text"
                      placeholder="Buscar post..."
                      value={postSearch}
                      onChange={(e) => setPostSearch(e.target.value)}
                      className="w-full bg-surface-container-high pl-9 pr-4 py-2.5 rounded-lg text-sm text-on-surface focus:ring-1 focus:ring-primary/40 focus:outline-none border-none"
                    />
                  </div>
                  {loadingPosts ? (
                    <div className="flex justify-center py-12">
                      <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {filteredPosts.length === 0 ? (
                        <div className="text-center py-8 text-on-surface-variant text-sm font-mono">
                          No se encontraron posts
                        </div>
                      ) : filteredPosts.map(post => {
                        const postLink = `/blog/${post.slug || post.id}`;
                        const date = post.createdAt
                          ? new Date(post.createdAt).toLocaleDateString('es-ES', { year: 'numeric', month: 'short', day: 'numeric' })
                          : '';
                        return (
                          <button
                            key={post.id || post.slug}
                            onClick={() => select(postLink)}
                            className={`w-full flex flex-col gap-1 p-3 rounded-lg border transition-all text-left cursor-pointer ${
                              value === postLink
                                ? 'border-primary bg-primary/10'
                                : 'border-outline-variant/20 hover:border-primary/40 hover:bg-surface-container-high bg-transparent'
                            }`}
                          >
                            <p className="text-sm font-bold text-on-surface">{post.title}</p>
                            {date && <p className="text-[10px] font-mono text-on-surface-variant">{date}</p>}
                            {post.excerpt && (
                              <p className="text-xs text-on-surface-variant line-clamp-2 mt-0.5">{post.excerpt}</p>
                            )}
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}

              {/* Tab 3: Manual URL */}
              {tab === 3 && (
                <div className="space-y-4 pt-2">
                  <p className="text-xs font-mono text-on-surface-variant leading-relaxed">
                    Ingresa una URL personalizada. Debe comenzar con{' '}
                    <code className="bg-surface-container px-1 py-0.5 rounded text-primary">/</code>
                    {' '}(ruta interna) o{' '}
                    <code className="bg-surface-container px-1 py-0.5 rounded text-primary">http</code>
                    {' '}(externa).
                  </p>
                  <input
                    type="text"
                    placeholder="/mi-pagina o https://..."
                    value={manualUrl}
                    onChange={(e) => setManualUrl(e.target.value)}
                    className="w-full bg-surface-container-high border-none p-3 rounded-lg text-sm font-mono text-on-surface focus:ring-1 focus:ring-primary/40 focus:outline-none"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && (manualUrl.startsWith('/') || manualUrl.startsWith('http'))) {
                        select(manualUrl);
                      }
                    }}
                  />
                  {manualUrl && !manualUrl.startsWith('/') && !manualUrl.startsWith('http') && (
                    <p className="text-xs text-error font-mono flex items-center gap-1">
                      <span className="material-symbols-outlined text-[14px]">error</span>
                      La URL debe comenzar con / o http
                    </p>
                  )}
                  <button
                    onClick={() => {
                      if (manualUrl.startsWith('/') || manualUrl.startsWith('http')) {
                        select(manualUrl);
                      }
                    }}
                    disabled={!manualUrl || (!manualUrl.startsWith('/') && !manualUrl.startsWith('http'))}
                    className="w-full bg-primary text-on-primary py-3 rounded-lg text-sm font-bold transition-colors hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed border-none cursor-pointer"
                  >
                    Aplicar URL
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default LinkPicker;
