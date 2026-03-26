import { useState, useEffect, useRef } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { useWishlist } from '../context/WishlistContext';
import StarRating from '../components/StarRating';
import { imgUrl } from '../utils/imgUrl';
import SEOMeta from '../components/SEOMeta';

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
  const { user, authFetch } = useAuth();
  const { ids: wishlistIds, toggle: toggleWishlist } = useWishlist();

  const [product, setProduct]       = useState(null);
  const [loading, setLoading]       = useState(true);
  const [notFound, setNotFound]     = useState(false);
  const [activeImg, setActiveImg]   = useState(0);
  const [selectedVariant, setSelectedVariant] = useState(null);

  // Reviews
  const [reviews, setReviews]         = useState([]);
  const [ratingAvg, setRatingAvg]     = useState(0);
  const [ratingCount, setRatingCount] = useState(0);
  const [distribution, setDistribution] = useState({});
  const [myReview, setMyReview]       = useState(null);
  const [reviewsLoading, setReviewsLoading] = useState(false);
  const [reviewPage, setReviewPage]   = useState(1);
  const REVIEWS_PER_PAGE = 5;

  // Review form
  const [reviewForm, setReviewForm]   = useState({ rating: 0, comment: '' });
  const [reviewSaving, setReviewSaving] = useState(false);
  const [reviewError, setReviewError] = useState('');
  const reviewFormRef = useRef(null);

  useEffect(() => {
    setLoading(true);
    setNotFound(false);
    setSelectedVariant(null);
    fetch(`${API}/api/products/${id}`)
      .then(r => {
        if (r.status === 404) { setNotFound(true); return null; }
        return r.json();
      })
      .then(data => {
        if (data?.product) {
          setProduct(data.product);
          const variants = data.product.variants;
          if (Array.isArray(variants) && variants.length > 0) {
            const firstAvailable = variants.find(v => v.available !== false) || variants[0];
            setSelectedVariant(firstAvailable);
          }
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [id]);

  useEffect(() => {
    if (!id) return;
    setReviewsLoading(true);
    fetch(`${API}/api/products/${id}/reviews`)
      .then(r => r.ok ? r.json() : null)
      .then(data => {
        if (!data) return;
        setReviews(data.reviews || []);
        setRatingAvg(data.ratingAvg ?? 0);
        setRatingCount(data.ratingCount ?? 0);
        setDistribution(data.distribution ?? {});
      })
      .catch(() => {})
      .finally(() => setReviewsLoading(false));
  }, [id]);

  useEffect(() => {
    if (!user || !id) return;
    authFetch(`${API}/api/products/${id}/reviews/my`)
      .then(r => r.ok ? r.json() : null)
      .then(data => { if (data?.review) setMyReview(data.review); })
      .catch(() => {});
  }, [user, id]);

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    if (!reviewForm.rating) { setReviewError('Selecciona una calificación'); return; }
    setReviewSaving(true);
    setReviewError('');
    try {
      const res = await authFetch(`${API}/api/products/${id}/reviews`, {
        method: 'POST',
        body: JSON.stringify(reviewForm),
      });
      const data = await res.json();
      if (!res.ok) { setReviewError(data.error || 'Error al enviar'); return; }
      setMyReview(data.review);
      setReviews(prev => [data.review, ...prev]);
      setRatingCount(c => c + 1);
      setReviewForm({ rating: 0, comment: '' });
    } catch { setReviewError('Error de conexión'); }
    finally { setReviewSaving(false); }
  };

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
      <SEOMeta
        title={`${product.name} — Trebor Labs`}
        description={product.description || `${product.name} · ${product.category === 'raspi' ? 'Raspberry Pi' : 'Teclado Custom'} disponible en Trebor Labs.`}
        image={product.images?.[0] ? imgUrl(product.images[0]) : undefined}
      />
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
        {/* Gallery */}
        <section className="lg:col-span-7 space-y-6">
          <div className="relative group">
            <div className="aspect-square w-full bg-surface-container-low overflow-hidden rounded-xl border border-outline-variant/15">
              {images[activeImg]
                ? <img
                    src={imgUrl(images[activeImg])}
                    alt={product.name}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                : <div className="w-full h-full flex items-center justify-center text-on-surface-variant">
                    <span className="material-symbols-outlined text-8xl">image</span>
                  </div>
              }
              <div className="absolute top-4 right-4">
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
                    ? <img src={imgUrl(src)} alt={`${product.name} ${i + 1}`} className="w-full h-full object-cover" />
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

          {/* Variants */}
          {Array.isArray(product.variants) && product.variants.length > 0 && (
            <div className="space-y-3">
              <p className="text-xs font-mono uppercase tracking-widest text-on-surface-variant">
                Variante{selectedVariant ? `: ${selectedVariant.label}` : ''}
              </p>
              <div className="flex flex-wrap gap-2">
                {product.variants.map(v => {
                  const isSelected = selectedVariant?.id === v.id;
                  const unavailable = v.available === false;
                  return (
                    <button
                      key={v.id}
                      onClick={() => !unavailable && setSelectedVariant(v)}
                      title={v.label}
                      className={`relative w-10 h-10 rounded-full border-2 transition-all ${
                        isSelected ? 'border-primary scale-110 shadow-[0_0_10px_rgba(214,186,255,0.4)]' : 'border-outline-variant/30 hover:border-primary/50'
                      } ${unavailable ? 'opacity-40 cursor-not-allowed' : 'cursor-pointer'}`}
                      style={v.color ? { backgroundColor: v.color } : {}}
                    >
                      {unavailable && (
                        <span
                          className="absolute inset-0 rounded-full overflow-hidden"
                          style={{ background: 'linear-gradient(135deg, transparent calc(50% - 1px), #ef4444 calc(50% - 1px), #ef4444 calc(50% + 1px), transparent calc(50% + 1px))' }}
                        />
                      )}
                      {isSelected && (
                        <span className="absolute inset-0 flex items-center justify-center">
                          <span className="material-symbols-outlined text-xs text-white drop-shadow-lg" style={{ fontVariationSettings: "'FILL' 1" }}>check</span>
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
              {selectedVariant?.available === false && (
                <p className="text-xs text-error font-mono">Esta variante no está disponible</p>
              )}
            </div>
          )}

          {/* CTAs */}
          <div className="flex flex-col gap-4">
            {isInStock && selectedVariant?.available !== false ? (
              <>
                <Link to="/checkout">
                  <button
                    onClick={() => addToCart({ ...product, price: `$${product.price}`, image: product.images?.[0] || '', variant: selectedVariant?.label })}
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

          {/* Wishlist + Featured */}
          <div className="flex items-center gap-4">
            {user && (
              <button
                onClick={() => toggleWishlist(product.id)}
                className={`flex items-center gap-2 text-xs font-mono transition-colors ${wishlistIds.has(product.id) ? 'text-error' : 'text-on-surface-variant hover:text-error'}`}
              >
                <span className="material-symbols-outlined text-sm" style={{ fontVariationSettings: wishlistIds.has(product.id) ? "'FILL' 1" : "'FILL' 0" }}>
                  favorite
                </span>
                {wishlistIds.has(product.id) ? 'En wishlist' : 'Agregar a wishlist'}
              </button>
            )}
            {product.featured && (
              <div className="flex items-center gap-2 text-amber-400 text-xs font-mono">
                <span className="material-symbols-outlined text-sm">star</span>
                Producto destacado
              </div>
            )}
          </div>
        </section>
      </div>

      {/* Afiche */}
      {product.afiche && (
        <section className="mt-20 flex justify-center">
          <div className="relative w-full max-w-[768px] overflow-hidden rounded-2xl shadow-[0_0_80px_rgba(107,76,154,0.25)] border border-primary/15">
            <img
              src={imgUrl(product.afiche)}
              alt={`Afiche ${product.name}`}
              className="w-full h-auto object-cover"
            />
          </div>
        </section>
      )}

      {/* Reviews */}
      <section className="mt-20 space-y-8">
        <div className="flex items-center justify-between">
          <h2 className="font-headline font-black text-2xl tracking-tight">Reseñas</h2>
          {ratingCount > 0 && (
            <div className="flex items-center gap-3">
              <StarRating value={Math.round(ratingAvg)} size="md" />
              <span className="font-mono text-sm text-on-surface-variant">{ratingAvg.toFixed(1)} · {ratingCount} reseñas</span>
            </div>
          )}
        </div>

        {ratingCount > 0 && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Distribution */}
            <div className="lg:col-span-4 bg-surface-container-low rounded-xl p-6 border border-outline-variant/10 space-y-3">
              <p className="font-headline font-bold text-sm uppercase tracking-widest text-on-surface-variant mb-4">Distribución</p>
              {[5, 4, 3, 2, 1].map(star => {
                const count = distribution[star] ?? 0;
                const pct = ratingCount > 0 ? (count / ratingCount) * 100 : 0;
                return (
                  <div key={star} className="flex items-center gap-3">
                    <span className="font-mono text-xs text-on-surface-variant w-4">{star}</span>
                    <span className="material-symbols-outlined text-sm text-amber-400" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
                    <div className="flex-1 h-1.5 bg-surface-container-high rounded-full overflow-hidden">
                      <div className="h-full bg-amber-400 rounded-full transition-all" style={{ width: `${pct}%` }} />
                    </div>
                    <span className="font-mono text-xs text-on-surface-variant w-6 text-right">{count}</span>
                  </div>
                );
              })}
            </div>

            {/* Reviews list */}
            <div className="lg:col-span-8 space-y-4">
              {reviews.slice(0, reviewPage * REVIEWS_PER_PAGE).map(review => (
                <div key={review.id} className="bg-surface-container-low rounded-xl p-6 border border-outline-variant/10 space-y-3">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-primary-container/30 flex items-center justify-center flex-shrink-0">
                        <span className="font-bold text-xs text-primary">{(review.user?.name || 'U')[0].toUpperCase()}</span>
                      </div>
                      <div>
                        <p className="font-bold text-sm text-on-surface">{review.user?.name || 'Usuario'}</p>
                        <div className="flex items-center gap-2 mt-0.5">
                          <StarRating value={review.rating} size="sm" />
                          {review.verified && (
                            <span className="flex items-center gap-1 text-[10px] font-mono text-green-400">
                              <span className="material-symbols-outlined text-xs" style={{ fontVariationSettings: "'FILL' 1" }}>verified</span>
                              Compra verificada
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    <span className="text-xs text-on-surface-variant/60 font-mono flex-shrink-0">
                      {new Date(review.createdAt).toLocaleDateString('es-PE', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </span>
                  </div>
                  {review.comment && (
                    <p className="text-sm text-on-surface-variant leading-relaxed">{review.comment}</p>
                  )}
                </div>
              ))}
              {reviews.length > reviewPage * REVIEWS_PER_PAGE && (
                <button
                  onClick={() => setReviewPage(p => p + 1)}
                  className="w-full py-3 border border-outline-variant/20 rounded-xl text-xs font-mono text-on-surface-variant hover:bg-surface-container-high transition-all"
                >
                  Cargar más reseñas
                </button>
              )}
              {reviewsLoading && (
                <div className="flex justify-center py-8">
                  <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                </div>
              )}
            </div>
          </div>
        )}

        {/* Write review form */}
        {user && !myReview && (
          <div ref={reviewFormRef} className="bg-surface-container-low rounded-xl p-8 border border-outline-variant/10 space-y-6">
            <h3 className="font-headline font-bold text-lg">Escribir una Reseña</h3>
            {reviewError && (
              <div className="bg-error/10 border border-error/30 rounded-lg px-4 py-3 text-sm text-error">{reviewError}</div>
            )}
            <form onSubmit={handleReviewSubmit} className="space-y-5">
              <div>
                <label className="block text-xs font-mono uppercase tracking-widest text-on-surface-variant mb-3">Tu calificación *</label>
                <StarRating value={reviewForm.rating} max={5} onChange={v => setReviewForm(f => ({ ...f, rating: v }))} size="lg" />
              </div>
              <div>
                <label className="block text-xs font-mono uppercase tracking-widest text-on-surface-variant mb-2">Comentario (opcional)</label>
                <textarea
                  value={reviewForm.comment}
                  onChange={e => setReviewForm(f => ({ ...f, comment: e.target.value }))}
                  rows={4}
                  placeholder="Comparte tu experiencia con este producto..."
                  className="w-full bg-surface-container-highest border-none rounded-md px-4 py-3 text-sm text-on-surface focus:ring-1 focus:ring-primary/40 focus:outline-none resize-none"
                />
              </div>
              <button
                type="submit"
                disabled={reviewSaving}
                className="flex items-center gap-2 bg-primary-container text-on-primary-container px-6 py-3 rounded-lg font-headline font-bold text-xs uppercase tracking-widest hover:bg-primary hover:text-on-primary transition-all disabled:opacity-50"
              >
                <span className="material-symbols-outlined text-sm">rate_review</span>
                {reviewSaving ? 'Enviando…' : 'Publicar Reseña'}
              </button>
            </form>
          </div>
        )}

        {user && myReview && (
          <div className="bg-green-500/5 border border-green-500/20 rounded-xl p-5 flex items-center gap-3">
            <span className="material-symbols-outlined text-green-400" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
            <p className="text-sm text-green-400">Ya has reseñado este producto. ¡Gracias!</p>
          </div>
        )}

        {!user && (
          <div className="bg-surface-container-low rounded-xl p-6 border border-outline-variant/10 text-center space-y-3">
            <p className="text-sm text-on-surface-variant">¿Compraste este producto? Inicia sesión para dejar tu reseña.</p>
            <Link to="/login" className="inline-flex items-center gap-2 text-primary font-mono text-sm hover:underline no-underline">
              <span className="material-symbols-outlined text-sm">login</span>
              Iniciar sesión
            </Link>
          </div>
        )}

        {ratingCount === 0 && !reviewsLoading && (
          <div className="text-center py-12 text-on-surface-variant">
            <span className="material-symbols-outlined text-4xl mb-3 block opacity-20">reviews</span>
            <p className="text-sm">Sé el primero en reseñar este producto.</p>
          </div>
        )}
      </section>

    </main>
  );
};

export default ProductDetail;
