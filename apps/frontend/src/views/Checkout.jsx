import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';

const API    = import.meta.env.VITE_API_URL ?? '';
const MP_KEY = import.meta.env.VITE_MP_PUBLIC_KEY ?? '';

const fmtPrice = (n) => `$${Number(n ?? 0).toFixed(2)}`;

// ── Stepper header ─────────────────────────────────────────────────────────────
const STEPS = [
  { n: 1, label: 'Resumen' },
  { n: 2, label: 'Dirección' },
  { n: 3, label: 'Cupón' },
  { n: 4, label: 'Pago' },
];

const Stepper = ({ current }) => (
  <div className="flex items-center justify-center gap-0 mb-12">
    {STEPS.map((s, i) => {
      const done    = s.n < current;
      const active  = s.n === current;
      return (
        <div key={s.n} className="flex items-center">
          <div className="flex flex-col items-center gap-1.5">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-mono font-bold transition-all ${
              done   ? 'bg-primary text-on-primary' :
              active ? 'bg-primary-container text-on-primary-container ring-2 ring-primary/40' :
                       'bg-surface-container-high text-on-surface-variant/40'
            }`}>
              {done ? <span className="material-symbols-outlined text-sm">check</span> : s.n}
            </div>
            <span className={`text-[10px] font-mono uppercase tracking-widest ${active ? 'text-primary' : 'text-on-surface-variant/40'}`}>
              {s.label}
            </span>
          </div>
          {i < STEPS.length - 1 && (
            <div className={`w-16 h-px mx-2 mb-5 transition-colors ${s.n < current ? 'bg-primary' : 'bg-outline-variant/20'}`} />
          )}
        </div>
      );
    })}
  </div>
);

// ── Minimal header/footer ──────────────────────────────────────────────────────
const CheckoutHeader = () => (
  <header className="fixed top-0 w-full z-50 bg-[#131315]/90 backdrop-blur-xl flex justify-between items-center px-8 h-20 border-b border-primary/10">
    <Link to="/" className="flex items-center gap-3 no-underline group">
      <div className="relative w-9 h-9 group-hover:scale-110 transition-transform duration-300 flex-shrink-0">
        <img src="/logo.png" alt="Trebor Labs" className="w-full h-full object-contain relative z-10" />
        <div className="logo-ring-base" aria-hidden="true" />
        <div className="logo-tracer-ring" aria-hidden="true" />
      </div>
      <span className="text-xl font-black text-primary tracking-tighter font-headline">Trebor Labs</span>
    </Link>
    <span className="font-mono text-xs text-on-surface-variant/50 uppercase tracking-widest hidden md:block">Checkout Seguro</span>
    <span className="flex items-center gap-1.5 text-[10px] font-mono text-on-surface-variant/40 uppercase tracking-widest">
      <span className="material-symbols-outlined text-sm">lock</span> SSL 256-bit
    </span>
  </header>
);

// ── Order summary sidebar ──────────────────────────────────────────────────────
const OrderSummary = ({ items, subtotal, shipping, discount, total, coupon }) => (
  <div className="bg-surface-container-low rounded-xl border border-outline-variant/15 overflow-hidden sticky top-28">
    <div className="px-6 py-4 border-b border-outline-variant/10">
      <h3 className="font-headline font-bold text-sm uppercase tracking-widest">Resumen</h3>
    </div>
    <div className="divide-y divide-outline-variant/10 max-h-64 overflow-y-auto">
      {items.map(item => (
        <div key={item.id} className="flex gap-3 px-6 py-3">
          <div className="w-10 h-10 bg-surface-container-high rounded-lg overflow-hidden flex-shrink-0">
            {item.image
              ? <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
              : <div className="w-full h-full flex items-center justify-center"><span className="material-symbols-outlined text-on-surface-variant/30 text-xs">image</span></div>
            }
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-bold text-on-surface truncate">{item.name}</p>
            <p className="text-[10px] text-on-surface-variant font-mono mt-0.5">×{item.qty}</p>
          </div>
          <p className="text-xs font-mono text-primary flex-shrink-0">{fmtPrice(item.price * item.qty)}</p>
        </div>
      ))}
    </div>
    <div className="px-6 py-4 border-t border-outline-variant/10 space-y-2">
      <div className="flex justify-between text-xs text-on-surface-variant">
        <span>Subtotal</span><span className="font-mono">{fmtPrice(subtotal)}</span>
      </div>
      <div className="flex justify-between text-xs text-on-surface-variant">
        <span>Envío</span>
        <span className="font-mono">{shipping > 0 ? fmtPrice(shipping) : <span className="text-on-surface-variant/40">Por calcular</span>}</span>
      </div>
      {coupon && discount > 0 && (
        <div className="flex justify-between text-xs text-green-400">
          <span className="flex items-center gap-1"><span className="material-symbols-outlined text-xs">discount</span>{coupon}</span>
          <span className="font-mono">−{fmtPrice(discount)}</span>
        </div>
      )}
      <div className="flex justify-between font-bold text-sm pt-2 border-t border-outline-variant/10">
        <span className="font-headline">Total</span>
        <span className="font-mono text-primary">{fmtPrice(total)}</span>
      </div>
    </div>
  </div>
);

// ── Main component ─────────────────────────────────────────────────────────────
const Checkout = () => {
  const navigate = useNavigate();
  const { items, total, updateQty, removeFromCart, clearCart } = useCart();
  const { user, authFetch } = useAuth();

  const [step, setStep] = useState(1);

  // Step 2 — Address + Shipping
  const [addresses, setAddresses]     = useState([]);
  const [addrLoaded, setAddrLoaded]   = useState(false);
  const [selectedAddr, setSelectedAddr] = useState(null);  // full address object
  const [showNewAddr, setShowNewAddr] = useState(false);
  const [newAddr, setNewAddr] = useState({ fullName: '', phone: '', line1: '', line2: '', district: '', city: '', region: 'Lima' });
  const [shippingZone, setShippingZone] = useState(null);  // { id, name, price }
  const [calcShipping, setCalcShipping] = useState(false);
  const [noZoneCoverage, setNoZoneCoverage] = useState(false);

  // Step 3 — Coupon
  const [couponCode, setCouponCode]   = useState('');
  const [couponData, setCouponData]   = useState(null);  // { type, value }
  const [couponErr, setCouponErr]     = useState('');
  const [validating, setValidating]   = useState(false);

  // Step 4 — Payment
  const [orderId, setOrderId]           = useState(null);
  const [preferenceId, setPreferenceId] = useState(null);
  const [submitting, setSubmitting]     = useState(false);
  const [submitErr, setSubmitErr]       = useState('');
  const mpContainerRef = useRef(null);
  const mpBrickRef = useRef(null);

  // Totals
  const shippingCost = shippingZone?.price ?? 0;
  const discount = couponData
    ? couponData.type === 'percent'
      ? Math.round(total * couponData.value) / 100
      : couponData.value
    : 0;
  const orderTotal = Math.max(0, total + shippingCost - discount);

  // Load addresses when entering step 2
  useEffect(() => {
    if (step !== 2 || addrLoaded || !user) return;
    authFetch(`${API}/api/users/me/addresses`)
      .then(r => r.json())
      .then(data => {
        const addrs = data.addresses || [];
        setAddresses(addrs);
        const def = addrs.find(a => a.isDefault) || addrs[0];
        if (def) { setSelectedAddr(def); calcZone(def.region); }
        else setShowNewAddr(true);
      })
      .catch(() => setShowNewAddr(true))
      .finally(() => setAddrLoaded(true));
  }, [step, addrLoaded, user]);

  const calcZone = async (region) => {
    if (!region) return;
    setCalcShipping(true);
    setNoZoneCoverage(false);
    try {
      const res = await fetch(`${API}/api/shipping/calculate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ region }),
      });
      if (res.ok) {
        const data = await res.json();
        setShippingZone(data.zone || null);
        setNoZoneCoverage(!data.zone);
      } else {
        setShippingZone(null);
        setNoZoneCoverage(true);
      }
    } catch {
      setShippingZone(null);
    } finally {
      setCalcShipping(false);
    }
  };

  const handleSelectAddr = (addr) => {
    setSelectedAddr(addr);
    setShowNewAddr(false);
    setNoZoneCoverage(false);
    calcZone(addr.region);
  };

  const handleNewAddrRegionChange = (region) => {
    setNewAddr(f => ({ ...f, region }));
    calcZone(region);
  };

  const canProceedStep2 = () => {
    if (noZoneCoverage) return false;
    if (showNewAddr) {
      return newAddr.fullName && newAddr.phone && newAddr.line1 && newAddr.city && newAddr.region;
    }
    return Boolean(selectedAddr);
  };

  const getActiveAddress = () => showNewAddr ? newAddr : selectedAddr;

  // Validate coupon
  const handleValidateCoupon = async () => {
    if (!couponCode.trim()) return;
    setValidating(true); setCouponErr(''); setCouponData(null);
    try {
      const res = await authFetch(`${API}/api/coupons/validate?code=${encodeURIComponent(couponCode.trim().toUpperCase())}`);
      const data = await res.json();
      if (!res.ok) { setCouponErr(data.error || 'Cupón inválido'); return; }
      setCouponData(data.coupon);
    } catch { setCouponErr('Error al validar'); }
    finally { setValidating(false); }
  };

  const removeCoupon = () => { setCouponData(null); setCouponCode(''); setCouponErr(''); };

  // Create order + get MP preferenceId
  const initCheckout = async () => {
    setSubmitting(true); setSubmitErr('');
    try {
      const addr = getActiveAddress();
      const res = await authFetch(`${API}/api/checkout`, {
        method: 'POST',
        body: JSON.stringify({
          items: items.map(i => ({ productId: i.id, quantity: i.qty })),
          shippingAddress: addr,
          shippingZoneId: shippingZone?.id ?? null,
          couponCode: couponData ? couponCode.trim().toUpperCase() : null,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Error al procesar el pedido');
      clearCart();
      setOrderId(data.order.id);
      setPreferenceId(data.preferenceId ?? null);
      if (!data.preferenceId) {
        navigate(`/orders/${data.order.id}/confirmation`);
      }
    } catch (err) {
      setSubmitErr(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  // Load MercadoPago Bricks when preferenceId is ready
  useEffect(() => {
    if (!preferenceId || !MP_KEY || !mpContainerRef.current) return;
    if (mpBrickRef.current) return; // Already initialized

    const init = async () => {
      if (!window.MercadoPago) {
        await new Promise(resolve => {
          const s = document.createElement('script');
          s.src = 'https://sdk.mercadopago.com/js/v2';
          s.onload = resolve;
          document.head.appendChild(s);
        });
      }
      const mp = new window.MercadoPago(MP_KEY, { locale: 'es-PE' });
      const bricks = mp.bricks();
      mpBrickRef.current = await bricks.create('payment', 'mp-brick-container', {
        initialization: { amount: orderTotal, preferenceId },
        customization: {
          paymentMethods: { creditCard: 'all', debitCard: 'all', ticket: 'all' },
        },
        callbacks: {
          onReady: () => {},
          onError: (err) => setSubmitErr(err?.message || 'Error en el pago'),
          onSubmit: () => {
            if (orderId) navigate(`/orders/${orderId}/confirmation`);
          },
        },
      });
    };
    init().catch(err => setSubmitErr(err.message));
  }, [preferenceId, MP_KEY]);

  // ── Empty cart ──────────────────────────────────────────────────────────────
  if (!items.length && step < 4) {
    return (
      <div className="bg-surface text-on-surface min-h-screen flex flex-col">
        <CheckoutHeader />
        <main className="flex-1 flex items-center justify-center px-6">
          <div className="text-center max-w-sm py-24 space-y-6">
            <span className="material-symbols-outlined text-6xl text-on-surface-variant/20 block">shopping_cart</span>
            <h2 className="font-headline font-bold text-2xl">Tu carrito está vacío</h2>
            <p className="text-on-surface-variant text-sm">Agrega productos antes de continuar.</p>
            <Link to="/products" className="inline-block bg-primary-container text-on-primary-container font-headline font-bold px-6 py-3 rounded-lg text-xs uppercase tracking-widest hover:bg-primary hover:text-on-primary transition-all no-underline">
              Ver productos
            </Link>
          </div>
        </main>
      </div>
    );
  }

  // ── Main layout ─────────────────────────────────────────────────────────────
  return (
    <div className="bg-surface text-on-surface min-h-screen flex flex-col">
      <CheckoutHeader />

      <main className="flex-1 pt-28 pb-20 px-6 max-w-6xl mx-auto w-full">
        <Stepper current={step} />

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          {/* Left: step content */}
          <div className="lg:col-span-7 space-y-6">

            {/* STEP 1 — Resumen */}
            {step === 1 && (
              <section className="space-y-4">
                <h2 className="font-headline font-bold text-xl tracking-tight">
                  <span className="text-primary font-mono mr-2">01;</span> Resumen del pedido
                </h2>
                <div className="bg-surface-container-low rounded-xl border border-outline-variant/15 divide-y divide-outline-variant/10 overflow-hidden">
                  {items.map(item => (
                    <div key={item.id} className="flex gap-4 px-6 py-4">
                      <div className="w-16 h-16 bg-surface-container-high rounded-lg overflow-hidden flex-shrink-0">
                        {item.image
                          ? <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                          : <div className="w-full h-full flex items-center justify-center"><span className="material-symbols-outlined text-on-surface-variant/30">image</span></div>
                        }
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-bold text-sm text-on-surface">{item.name}</p>
                        <p className="text-xs font-mono text-primary mt-1">{fmtPrice(item.price)}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <button onClick={() => updateQty(item.id, item.qty - 1)}
                          className="w-7 h-7 rounded-lg bg-surface-container-high hover:bg-primary/10 hover:text-primary transition-all flex items-center justify-center text-on-surface-variant">
                          <span className="material-symbols-outlined text-sm">remove</span>
                        </button>
                        <span className="font-mono text-sm w-5 text-center">{item.qty}</span>
                        <button onClick={() => updateQty(item.id, item.qty + 1)}
                          className="w-7 h-7 rounded-lg bg-surface-container-high hover:bg-primary/10 hover:text-primary transition-all flex items-center justify-center text-on-surface-variant">
                          <span className="material-symbols-outlined text-sm">add</span>
                        </button>
                        <button onClick={() => removeFromCart(item.id)}
                          className="w-7 h-7 rounded-lg hover:bg-error/10 hover:text-error transition-all flex items-center justify-center text-on-surface-variant/40 ml-1">
                          <span className="material-symbols-outlined text-sm">delete</span>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
                <button onClick={() => setStep(2)}
                  className="w-full py-4 bg-primary-container text-on-primary-container font-headline font-bold uppercase tracking-widest rounded-xl hover:bg-primary hover:text-on-primary transition-all flex items-center justify-center gap-2">
                  Continuar <span className="material-symbols-outlined">arrow_forward</span>
                </button>
              </section>
            )}

            {/* STEP 2 — Dirección + Envío */}
            {step === 2 && (
              <section className="space-y-6">
                <h2 className="font-headline font-bold text-xl tracking-tight">
                  <span className="text-primary font-mono mr-2">02;</span> Dirección y envío
                </h2>

                {/* Saved addresses */}
                {addresses.length > 0 && !showNewAddr && (
                  <div className="space-y-3">
                    {addresses.map(addr => (
                      <div key={addr.id}
                        onClick={() => handleSelectAddr(addr)}
                        className={`p-4 rounded-xl border cursor-pointer transition-all ${
                          selectedAddr?.id === addr.id
                            ? 'border-primary/50 bg-primary/5'
                            : 'border-outline-variant/15 hover:border-outline-variant/30 bg-surface-container-low'
                        }`}>
                        <div className="flex items-start justify-between">
                          <div>
                            <p className="font-bold text-sm">{addr.label} · {addr.fullName}</p>
                            <p className="text-xs text-on-surface-variant mt-0.5">
                              {addr.line1}, {addr.district}, {addr.city}
                            </p>
                          </div>
                          <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${
                            selectedAddr?.id === addr.id ? 'border-primary' : 'border-outline-variant/40'
                          }`}>
                            {selectedAddr?.id === addr.id && <div className="w-2.5 h-2.5 rounded-full bg-primary" />}
                          </div>
                        </div>
                      </div>
                    ))}
                    <button onClick={() => { setShowNewAddr(true); setSelectedAddr(null); setShippingZone(null); }}
                      className="w-full py-3 border border-dashed border-outline-variant/30 rounded-xl text-sm text-on-surface-variant hover:border-primary/40 hover:text-primary transition-all font-mono">
                      + Usar otra dirección
                    </button>
                  </div>
                )}

                {/* New address form */}
                {(showNewAddr || !user) && (
                  <div className="bg-surface-container-low rounded-xl border border-outline-variant/15 p-6 space-y-4">
                    <p className="font-headline font-bold text-sm">Nueva dirección de envío</p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {[
                        { key: 'fullName', label: 'Nombre completo', placeholder: 'Juan Pérez', full: true },
                        { key: 'phone',    label: 'Teléfono',        placeholder: '+51 999 999 999', full: false },
                        { key: 'line1',    label: 'Dirección',       placeholder: 'Jr. Flores 123',  full: true },
                        { key: 'district', label: 'Distrito',        placeholder: 'Miraflores',       full: false },
                        { key: 'city',     label: 'Ciudad',          placeholder: 'Lima',             full: false },
                      ].map(({ key, label, placeholder, full }) => (
                        <div key={key} className={full ? 'md:col-span-2' : ''}>
                          <label className="block text-xs font-mono uppercase tracking-widest text-on-surface-variant mb-1.5">{label}</label>
                          <input type="text" value={newAddr[key] || ''} placeholder={placeholder}
                            onChange={e => setNewAddr(f => ({ ...f, [key]: e.target.value }))}
                            className="w-full bg-surface-container-highest border-none rounded-md px-4 py-2.5 text-sm focus:ring-1 focus:ring-primary/40 focus:outline-none placeholder:text-on-surface-variant/40"
                          />
                        </div>
                      ))}
                      <div>
                        <label className="block text-xs font-mono uppercase tracking-widest text-on-surface-variant mb-1.5">Región</label>
                        <input type="text" value={newAddr.region || ''} placeholder="Lima Metropolitana"
                          onChange={e => handleNewAddrRegionChange(e.target.value)}
                          className="w-full bg-surface-container-highest border-none rounded-md px-4 py-2.5 text-sm focus:ring-1 focus:ring-primary/40 focus:outline-none placeholder:text-on-surface-variant/40"
                        />
                      </div>
                    </div>
                    {addresses.length > 0 && (
                      <button type="button" onClick={() => { setShowNewAddr(false); handleSelectAddr(addresses[0]); }}
                        className="text-xs text-primary font-mono hover:underline">
                        ← Usar dirección guardada
                      </button>
                    )}
                  </div>
                )}

                {/* Shipping zone result */}
                {noZoneCoverage ? (
                  <div className="bg-error/10 border border-error/30 rounded-xl p-4 flex items-start gap-3">
                    <span className="material-symbols-outlined text-error text-sm mt-0.5">warning</span>
                    <div>
                      <p className="text-sm font-bold text-error">Sin cobertura de envío</p>
                      <p className="text-xs text-error/80 mt-1">No hay cobertura para tu región. Contáctanos por WhatsApp para coordinar tu pedido.</p>
                    </div>
                  </div>
                ) : (
                  <div className="bg-surface-container-low rounded-xl border border-outline-variant/15 p-4">
                    <div className="flex items-center gap-3">
                      <span className="material-symbols-outlined text-primary">local_shipping</span>
                      <div className="flex-1">
                        {calcShipping ? (
                          <div className="flex items-center gap-2">
                            <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                            <p className="text-sm text-on-surface-variant font-mono">Calculando envío…</p>
                          </div>
                        ) : shippingZone ? (
                          <div className="flex items-center justify-between">
                            <p className="text-sm font-bold">{shippingZone.name}</p>
                            <p className="font-mono text-primary font-bold">{fmtPrice(shippingZone.price)}</p>
                          </div>
                        ) : (
                          <p className="text-sm text-on-surface-variant">Selecciona una dirección para calcular el envío</p>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                <div className="flex gap-3">
                  <button onClick={() => setStep(1)}
                    className="px-5 py-3 border border-outline-variant/20 rounded-xl text-sm text-on-surface-variant hover:bg-surface-container-high transition-all font-mono">
                    ← Volver
                  </button>
                  <button
                    disabled={!canProceedStep2() || calcShipping}
                    onClick={() => setStep(3)}
                    className="flex-1 py-3 bg-primary-container text-on-primary-container font-headline font-bold uppercase tracking-widest rounded-xl hover:bg-primary hover:text-on-primary transition-all disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2">
                    Continuar <span className="material-symbols-outlined">arrow_forward</span>
                  </button>
                </div>
              </section>
            )}

            {/* STEP 3 — Cupón */}
            {step === 3 && (
              <section className="space-y-6">
                <h2 className="font-headline font-bold text-xl tracking-tight">
                  <span className="text-primary font-mono mr-2">03;</span> Cupón de descuento
                </h2>

                <div className="bg-surface-container-low rounded-xl border border-outline-variant/15 p-6 space-y-4">
                  {couponData ? (
                    <div className="flex items-center justify-between p-4 bg-green-500/5 border border-green-500/20 rounded-xl">
                      <div className="flex items-center gap-3">
                        <span className="material-symbols-outlined text-green-400" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
                        <div>
                          <p className="font-mono font-bold text-sm text-green-400">{couponCode.toUpperCase()}</p>
                          <p className="text-xs text-on-surface-variant mt-0.5">
                            {couponData.type === 'percent'
                              ? `${couponData.value}% de descuento`
                              : `$${couponData.value} de descuento`
                            } → ahoras {fmtPrice(discount)}
                          </p>
                        </div>
                      </div>
                      <button onClick={removeCoupon} className="text-on-surface-variant hover:text-error transition-colors">
                        <span className="material-symbols-outlined text-sm">close</span>
                      </button>
                    </div>
                  ) : (
                    <>
                      <p className="text-sm text-on-surface-variant">¿Tienes un cupón? Ingrésalo aquí.</p>
                      <div className="flex gap-3">
                        <input
                          type="text" value={couponCode}
                          onChange={e => { setCouponCode(e.target.value.toUpperCase()); setCouponErr(''); }}
                          onKeyDown={e => e.key === 'Enter' && handleValidateCoupon()}
                          placeholder="CÓDIGO"
                          className="flex-1 bg-surface-container-highest border-none rounded-xl px-4 py-3 text-sm font-mono uppercase focus:ring-1 focus:ring-primary/40 focus:outline-none placeholder:text-on-surface-variant/40 placeholder:normal-case"
                        />
                        <button onClick={handleValidateCoupon} disabled={!couponCode.trim() || validating}
                          className="px-5 py-3 bg-surface-container-highest border border-outline-variant/20 rounded-xl text-sm font-mono hover:bg-primary/10 hover:text-primary transition-all disabled:opacity-40 flex items-center gap-2">
                          {validating
                            ? <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                            : 'Aplicar'}
                        </button>
                      </div>
                      {couponErr && <p className="text-sm text-error font-mono">{couponErr}</p>}
                    </>
                  )}
                </div>

                <div className="flex gap-3">
                  <button onClick={() => setStep(2)}
                    className="px-5 py-3 border border-outline-variant/20 rounded-xl text-sm text-on-surface-variant hover:bg-surface-container-high transition-all font-mono">
                    ← Volver
                  </button>
                  <button onClick={() => { setStep(4); initCheckout(); }}
                    className="flex-1 py-3 bg-primary-container text-on-primary-container font-headline font-bold uppercase tracking-widest rounded-xl hover:bg-primary hover:text-on-primary transition-all flex items-center justify-center gap-2">
                    Ir al pago <span className="material-symbols-outlined">lock</span>
                  </button>
                </div>
                <button onClick={() => { setCouponData(null); setCouponCode(''); setStep(4); initCheckout(); }}
                  className="w-full text-center text-xs text-on-surface-variant/50 hover:text-on-surface-variant transition-colors font-mono">
                  Continuar sin cupón →
                </button>
              </section>
            )}

            {/* STEP 4 — Pago */}
            {step === 4 && (
              <section className="space-y-6">
                <h2 className="font-headline font-bold text-xl tracking-tight">
                  <span className="text-primary font-mono mr-2">04;</span> Pago
                </h2>

                {submitting && (
                  <div className="bg-surface-container-low rounded-xl border border-outline-variant/15 p-12 flex flex-col items-center gap-4">
                    <div className="w-10 h-10 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                    <p className="text-sm text-on-surface-variant font-mono">Preparando tu pedido…</p>
                  </div>
                )}

                {submitErr && (
                  <div className="bg-error/10 border border-error/30 rounded-xl px-5 py-4 flex items-start gap-3">
                    <span className="material-symbols-outlined text-error text-sm mt-0.5">error</span>
                    <div>
                      <p className="text-sm text-error font-bold">Error al procesar</p>
                      <p className="text-xs text-error/80 mt-1">{submitErr}</p>
                    </div>
                  </div>
                )}

                {/* MP Bricks container */}
                {preferenceId && !submitting && (
                  <div id="mp-brick-container" ref={mpContainerRef} className="min-h-[200px]" />
                )}

                {/* Fallback if no MP key configured */}
                {!submitting && !submitErr && !preferenceId && orderId && (
                  <div className="bg-surface-container-low rounded-xl border border-outline-variant/15 p-8 text-center space-y-4">
                    <span className="material-symbols-outlined text-4xl text-primary/40 block">payments</span>
                    <p className="text-sm text-on-surface-variant">Procesando con MercadoPago…</p>
                  </div>
                )}

                {submitErr && (
                  <button onClick={() => setStep(3)}
                    className="w-full py-3 border border-outline-variant/20 rounded-xl text-sm text-on-surface-variant hover:bg-surface-container-high transition-all font-mono">
                    ← Volver al cupón
                  </button>
                )}

                <div className="flex items-center justify-center gap-2 text-[10px] text-on-surface-variant/40 uppercase tracking-widest font-mono mt-4">
                  <span className="material-symbols-outlined text-sm">lock</span>
                  Transacción cifrada · 256-bit SSL
                </div>
              </section>
            )}
          </div>

          {/* Right: Order summary */}
          <div className="lg:col-span-5">
            <OrderSummary
              items={items}
              subtotal={total}
              shipping={shippingCost}
              discount={discount}
              total={orderTotal}
              coupon={couponData ? couponCode : null}
            />
          </div>
        </div>
      </main>
    </div>
  );
};

export default Checkout;
