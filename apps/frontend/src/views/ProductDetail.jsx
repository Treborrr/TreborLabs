import { useState, useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useCart } from '../context/CartContext';

const API = import.meta.env.VITE_API_URL ?? '';

const KEYBOARD_SPEC_LABELS = {
  layout:       'Layout',
  material:     'Case Material',
  switches:     'Switch Type',
  pcb:          'PCB Features',
  connectivity: 'Connectivity',
  weight:       'Weight',
};

const RASPI_SPEC_LABELS = {
  model:        'Model',
  ram:          'RAM',
  storage:      'Storage',
  connectivity: 'Connectivity',
};

const ProductDetail = () => {
  const { id } = useParams();
  const { addToCart } = useCart();

  const [product, setProduct]   = useState(null);
  const [loading, setLoading]   = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [activeImg, setActiveImg] = useState(0);

  useEffect(() => {
    setLoading(true);
    setNotFound(false);
    fetch(`${API}/api/products/${id}`)
      .then(r => {
        if (r.status === 404) { setNotFound(true); return null; }
        return r.json();
      })
      .then(data => {
        if (data?.product) setProduct(data.product);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <main className="pt-32 pb-24 px-4 md:px-8 max-w-screen-2xl mx-auto flex items-center justify-center min-h-screen">
        <div className="w-10 h-10 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </main>
    );
  }

  if (notFound || !product) {
    return (
      <main className="pt-32 pb-24 px-4 md:px-8 max-w-screen-2xl mx-auto flex flex-col items-center justify-center min-h-screen gap-6">
        <span className="material-symbols-outlined text-6xl text-on-surface-variant">inventory_2</span>
        <h1 className="font-headline text-3xl font-black">Producto no encontrado</h1>
        <Link to="/products" className="text-primary font-mono text-sm flex items-center gap-2 no-underline hover:underline">
          <span className="material-symbols-outlined text-sm">arrow_back</span> Ver catálogo
        </Link>
      </main>
    );
  }

  const specLabels = product.category === 'raspi' ? RASPI_SPEC_LABELS : KEYBOARD_SPEC_LABELS;
  const specs = Object.entries(specLabels)
    .filter(([key]) => product.specs?.[key])
    .map(([key, label]) => ({ label, value: product.specs[key] }));

  const images = product.images?.length > 0 ? product.images : [null];
  const isInStock = product.status === 'in_stock';

  return (
    <main className="pt-32 pb-24 px-4 md:px-8 max-w-screen-2xl mx-auto">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
        {/* Gallery */}
        <section className="lg:col-span-7 space-y-6">
          <div className="relative group">
            <div className="aspect-[4/3] w-full bg-surface-container-low overflow-hidden rounded-xl border border-outline-variant/15">
              {images[activeImg]
                ? <img
                    src={images[activeImg]}
                    alt={product.name}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                : <div className="w-full h-full flex items-center justify-center text-on-surface-variant">
                    <span className="material-symbols-outlined text-8xl">image</span>
                  </div>
              }
              <div className="absolute top-4 left-4">
                <span className="bg-primary/20 backdrop-blur-md text-primary px-3 py-1 text-xs font-mono tracking-widest uppercase border border-primary/30 rounded-lg">
                  {product.category === 'raspi' ? 'Raspberry Pi' : 'Custom Keyboard'} / {product.specs?.model || product.category}
                </span>
              </div>
            </div>
          </div>
          {images.length > 1 && (
            <div className="grid grid-cols-4 gap-4">
              {images.map((src, i) => (
                <div
                  key={i}
                  onClick={() => setActiveImg(i)}
                  className={`aspect-square bg-surface-container-high rounded-lg overflow-hidden border cursor-pointer transition-colors ${activeImg === i ? 'border-primary' : 'border-outline-variant/15 hover:border-primary/50'}`}
                >
                  {src
                    ? <img src={src} alt={`${product.name} ${i + 1}`} className="w-full h-full object-cover" />
                    : <div className="w-full h-full flex items-center justify-center text-on-surface-variant">
                        <span className="material-symbols-outlined text-sm">image</span>
                      </div>
                  }
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Product Info */}
        <section className="lg:col-span-5 space-y-8 sticky top-28">
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <span className={`flex items-center gap-1 px-3 py-1 text-[10px] font-bold uppercase tracking-widest rounded-full border ${
                isInStock
                  ? 'bg-green-500/10 text-green-400 border-green-500/20'
                  : product.status === 'coming_soon'
                    ? 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                    : 'bg-error/10 text-error border-error/20'
              }`}>
                {isInStock && <span className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse" />}
                {isInStock ? 'En Stock' : product.status === 'coming_soon' ? 'Próximamente' : 'Sin Stock'}
              </span>
              <span className="text-on-surface-variant font-mono text-xs">SKU: {product.id.slice(-8).toUpperCase()}</span>
            </div>
            <h1 className="text-4xl md:text-5xl font-black font-headline tracking-tighter text-on-surface">
              {product.name.split(' ').slice(0, -1).join(' ')}{' '}
              <span className="text-primary">{product.name.split(' ').slice(-1)[0]}</span>
            </h1>
            <div className="flex items-baseline gap-4">
              <span className="text-3xl font-mono font-medium text-primary">${product.price}</span>
            </div>
            {product.description && (
              <p className="text-on-surface-variant leading-relaxed font-body max-w-lg">
                {product.description}
              </p>
            )}
          </div>

          {/* Specs */}
          {specs.length > 0 && (
            <div className="bg-surface-container-low rounded-xl overflow-hidden border border-outline-variant/10">
              <div className="px-6 py-4 border-b border-outline-variant/10 bg-surface-container">
                <h3 className="font-headline font-bold text-xs uppercase tracking-widest text-primary">Especificaciones Técnicas</h3>
              </div>
              <div className="divide-y divide-outline-variant/10">
                {specs.map(({ label, value }) => (
                  <div key={label} className="grid grid-cols-2 px-6 py-4 hover:bg-surface-container-high transition-colors">
                    <span className="text-xs font-mono text-on-surface-variant uppercase tracking-tighter">{label}</span>
                    <span className="text-sm font-medium">{value}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* CTAs */}
          <div className="flex flex-col gap-4">
            {isInStock ? (
              <>
                <Link to="/checkout">
                  <button
                    onClick={() => addToCart({ ...product, price: `$${product.price}`, image: product.images?.[0] || '' })}
                    className="group relative w-full h-14 bg-gradient-to-r from-primary-container to-[#8b6dc7] rounded-md font-headline font-bold uppercase tracking-widest text-white shadow-[0_0_20px_rgba(107,76,154,0.3)] hover:shadow-[0_0_30px_rgba(107,76,154,0.5)] transition-all active:scale-[0.98] overflow-hidden"
                  >
                    <span className="relative z-10 flex items-center justify-center gap-2">
                      Comprar
                      <span className="material-symbols-outlined text-lg">shopping_bag</span>
                    </span>
                    <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </button>
                </Link>
                <button className="w-full h-14 bg-surface-container-highest border border-outline-variant/20 rounded-md font-headline font-bold uppercase tracking-widest text-primary hover:bg-primary/10 transition-all flex items-center justify-center gap-2">
                  Contactar por WhatsApp
                  <span className="material-symbols-outlined text-lg">chat</span>
                </button>
              </>
            ) : (
              <button className="w-full h-14 border border-primary/40 rounded-md font-headline font-bold uppercase tracking-widest text-primary hover:bg-primary hover:text-surface transition-all">
                Notificarme cuando esté disponible
              </button>
            )}
          </div>

          {/* Featured badge */}
          {product.featured && (
            <div className="flex items-center gap-2 text-amber-400 text-xs font-mono">
              <span className="material-symbols-outlined text-sm">star</span>
              Producto destacado
            </div>
          )}
        </section>
      </div>

      {/* Footer */}
      <footer className="mt-32 w-full py-12 border-t border-primary/10">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
          <div className="space-y-4">
            <div className="text-primary font-headline font-bold text-xl uppercase">Trebor Labs</div>
            <p className="font-body text-sm text-gray-400 leading-relaxed">© 2026 Trebor Labs. Technical Hardware Editorial.</p>
          </div>
          {[
            { title: 'Productos', links: ['Teclados Custom', 'Kits Raspberry Pi', 'Switch Testers', 'Hardware Accs'] },
            { title: 'Empresa',   links: ['Privacy', 'Terms', 'Shipping', 'Returns'] },
          ].map(({ title, links }) => (
            <div key={title} className="space-y-4">
              <h4 className="text-white font-headline text-sm font-bold uppercase tracking-widest">{title}</h4>
              <ul className="space-y-2 font-body text-sm text-gray-400">
                {links.map(l => <li key={l}><a className="hover:text-primary transition-colors opacity-80 hover:opacity-100" href="#">{l}</a></li>)}
              </ul>
            </div>
          ))}
          <div className="space-y-4">
            <h4 className="text-white font-headline text-sm font-bold uppercase tracking-widest">Newsfeed</h4>
            <p className="text-gray-400 text-xs font-mono uppercase tracking-tighter">Unirse a la lista de tácticos:</p>
            <div className="flex gap-2">
              <input className="bg-surface-container border-none focus:ring-1 focus:ring-primary text-xs w-full p-2 focus:outline-none" placeholder="tu@email.com" type="email" />
              <button className="bg-primary text-on-primary p-2 hover:bg-white transition-colors">
                <span className="material-symbols-outlined text-sm">send</span>
              </button>
            </div>
          </div>
        </div>
      </footer>
    </main>
  );
};

export default ProductDetail;
