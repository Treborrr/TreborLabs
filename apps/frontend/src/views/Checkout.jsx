import { useState } from 'react';
import { Link } from 'react-router-dom';

const orderItems = [
  {
    id: 1,
    name: 'Trebor-65 Tactile Keyboard',
    serial: '2940-X1',
    qty: '01',
    price: '$189.00',
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAW6caV-Lz7X98If8F7b_2KM36nmMZadX93TCMs1GlMvpSaMy99NEbsKEa6UsqEiBssPH3vRTNADoESrImZ65M6gD2MsI7WxgegAvKB9GIVDXM5LSKZwpyWjiCJaMA0Dv0G4YZPmTMlPNkuaYTIGhK_R-KLz2baQdFEVlf0opAQ0lUCDRFfJ7almxwtnQAkzn7kb75YPYf8ZWsuZPBKuJDPOTgOS3L-7IdRy_ucUZsjwqHIV5yLamuvBCHf_VCSuiB06MaDJ2koT8GH',
  },
  {
    id: 2,
    name: 'Compute Module 4 Kit',
    serial: 'RP-MOD-V4',
    qty: '01',
    price: '$75.00',
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCK4-9tDnXQp2tcF9fxU9rkkslcX9LJtJFmwVvycDZGYO7DkKT-96WyXa8Q6yCsCom-74kFbna9_kZip0NS7-E3DA7_dkaABdLKE5oArriXQV3mrv4by2tAXORKDANYwpm0GohnJsREOp4Yx-r_mWJ4i_6s5XeGxybWRBEsivScQL8aXE4Pk6QO5mmKkKZR1NciZMDiUnALtjeWJzEvwZg-zNe_XSiENuhIstarWcASJxexJIlqvaT-l-vIq2515NfrCj8_HDa69v1M',
  },
];

const paymentMethods = [
  { id: 'mercadopago', name: 'Mercado Pago', desc: 'Instant processing via local gateway', icon: 'account_balance_wallet', available: true },
  { id: 'stripe', name: 'Stripe', desc: 'Global payments support', icon: 'credit_card', available: false },
  { id: 'paypal', name: 'PayPal', desc: 'Fast checkout for members', icon: 'payments', available: false },
];

const Checkout = () => {
  const [selectedPayment, setSelectedPayment] = useState('mercadopago');

  return (
    <div className="bg-surface text-on-surface min-h-screen">
      {/* Header */}
      <header className="fixed top-0 w-full z-50 bg-[#131315]/80 backdrop-blur-xl flex justify-between items-center px-8 h-20 shadow-[0_20px_40px_rgba(107,76,154,0.08)]">
        <Link to="/" className="text-2xl font-black text-primary tracking-tighter font-headline no-underline">Trebor Labs</Link>
        <nav className="hidden md:flex gap-8 items-center">
          {['Teclados', 'Raspi', 'Blog', 'Contacto'].map((item) => (
            <a key={item} className="font-headline font-bold tracking-tight text-sm uppercase text-gray-400 hover:text-white transition-colors" href="#">{item}</a>
          ))}
        </nav>
        <div className="flex items-center gap-6 text-primary">
          <span className="material-symbols-outlined cursor-pointer hover:bg-primary/10 p-2 rounded-lg transition-all">language</span>
          <span className="material-symbols-outlined cursor-pointer hover:bg-primary/10 p-2 rounded-lg transition-all">shopping_cart</span>
          <span className="material-symbols-outlined cursor-pointer hover:bg-primary/10 p-2 rounded-lg transition-all">person</span>
        </div>
      </header>

      <main className="pt-32 pb-20 px-6 max-w-7xl mx-auto">
        <div className="flex flex-col md:grid md:grid-cols-12 gap-12">
          {/* Left: Checkout Form */}
          <div className="md:col-span-7 space-y-12">
            {/* 01 Information */}
            <section>
              <h2 className="font-headline text-2xl font-bold tracking-tight mb-8 flex items-center gap-3">
                <span className="text-primary font-mono text-lg">01;</span> Information
              </h2>
              <div>
                <label className="block text-xs font-mono uppercase tracking-widest text-on-surface-variant mb-2">Contact Email</label>
                <input
                  className="w-full bg-surface-container-highest border-none p-4 text-on-surface placeholder:text-outline focus:ring-1 focus:ring-primary/40 rounded-none transition-all focus:outline-none"
                  placeholder="engineer@treborlabs.io"
                  type="email"
                />
              </div>
            </section>

            {/* 02 Shipping */}
            <section>
              <h2 className="font-headline text-2xl font-bold tracking-tight mb-8 flex items-center gap-3">
                <span className="text-primary font-mono text-lg">02;</span> Shipping
              </h2>
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className="block text-xs font-mono uppercase tracking-widest text-on-surface-variant mb-2">Full Name</label>
                  <input className="w-full bg-surface-container-highest border-none p-4 text-on-surface placeholder:text-outline focus:ring-1 focus:ring-primary/40 rounded-none transition-all focus:outline-none" placeholder="Alex Rivera" type="text" />
                </div>
                <div className="col-span-2">
                  <label className="block text-xs font-mono uppercase tracking-widest text-on-surface-variant mb-2">Address</label>
                  <input className="w-full bg-surface-container-highest border-none p-4 text-on-surface placeholder:text-outline focus:ring-1 focus:ring-primary/40 rounded-none transition-all focus:outline-none" placeholder="Av. Principal 404, Lima" type="text" />
                </div>
                <div>
                  <label className="block text-xs font-mono uppercase tracking-widest text-on-surface-variant mb-2">City</label>
                  <input className="w-full bg-surface-container-highest border-none p-4 text-on-surface placeholder:text-outline focus:ring-1 focus:ring-primary/40 rounded-none transition-all focus:outline-none" placeholder="Lima" type="text" />
                </div>
                <div>
                  <label className="block text-xs font-mono uppercase tracking-widest text-on-surface-variant mb-2">Postal Code</label>
                  <input className="w-full bg-surface-container-highest border-none p-4 text-on-surface placeholder:text-outline focus:ring-1 focus:ring-primary/40 rounded-none transition-all focus:outline-none" placeholder="15001" type="text" />
                </div>
              </div>
            </section>

            {/* 03 Payment */}
            <section>
              <h2 className="font-headline text-2xl font-bold tracking-tight mb-8 flex items-center gap-3">
                <span className="text-primary font-mono text-lg">03;</span> Payment Method
              </h2>
              <div className="grid grid-cols-1 gap-4">
                {paymentMethods.map((method) => (
                  <div
                    key={method.id}
                    onClick={() => method.available && setSelectedPayment(method.id)}
                    className={`relative p-6 border cursor-pointer transition-all ${
                      !method.available
                        ? 'bg-surface-container-lowest border-outline-variant/20 opacity-50 cursor-not-allowed grayscale'
                        : selectedPayment === method.id
                        ? 'bg-surface-container-low border-primary/40 hover:bg-surface-container-high'
                        : 'bg-surface-container-low border-outline-variant/20 hover:bg-surface-container-high'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className={`w-10 h-10 flex items-center justify-center ${method.available ? 'bg-primary/20' : 'bg-surface-container-highest'}`}>
                          <span className={`material-symbols-outlined ${method.available ? 'text-primary' : 'text-outline'}`}>{method.icon}</span>
                        </div>
                        <div>
                          <h3 className="font-bold text-on-surface">{method.name}</h3>
                          <p className="text-xs text-on-surface-variant">{method.desc}</p>
                        </div>
                      </div>
                      {method.available ? (
                        <div className="w-5 h-5 rounded-full border-2 border-primary flex items-center justify-center">
                          {selectedPayment === method.id && <div className="w-2.5 h-2.5 rounded-full bg-primary"></div>}
                        </div>
                      ) : (
                        <span className="font-mono text-[10px] uppercase tracking-tighter bg-surface-container-highest px-2 py-1">Soon</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </section>
          </div>

          {/* Right: Order Summary */}
          <div className="md:col-span-5">
            <div className="sticky top-32 space-y-8">
              <div className="bg-surface-container-low p-8 shadow-[0_20px_40px_rgba(0,0,0,0.2)]">
                <h3 className="font-headline text-xl font-bold tracking-tight mb-8">Order Summary</h3>
                <div className="space-y-6 mb-10">
                  {orderItems.map((item) => (
                    <div key={item.id} className="flex gap-4">
                      <div className="w-20 h-20 bg-surface-container-highest overflow-hidden">
                        <img src={item.image} alt={item.name} className="w-full h-full object-cover grayscale hover:grayscale-0 transition-all duration-500" />
                      </div>
                      <div className="flex-1">
                        <h4 className="font-bold text-sm text-on-surface">{item.name}</h4>
                        <p className="text-xs text-on-surface-variant font-mono mt-1">S/N: {item.serial}</p>
                        <div className="flex justify-between mt-2">
                          <span className="text-xs font-medium">QTY: {item.qty}</span>
                          <span className="text-sm font-bold text-primary">{item.price}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="space-y-4 pt-8 border-t border-outline-variant/20">
                  <div className="flex justify-between text-sm">
                    <span className="text-on-surface-variant">Subtotal</span>
                    <span className="font-mono">$264.00</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-on-surface-variant">Shipping (Express)</span>
                    <span className="font-mono">$12.50</span>
                  </div>
                  <div className="flex justify-between text-xl font-bold pt-4">
                    <span className="font-headline tracking-tight">Total</span>
                    <span className="text-primary font-mono">$276.50</span>
                  </div>
                </div>

                <button className="w-full mt-10 py-5 bg-primary-container text-on-primary-container font-headline font-bold uppercase tracking-widest hover:bg-primary transition-all duration-300 shadow-[0_0_30px_rgba(107,76,154,0.3)] active:scale-95 group overflow-hidden relative">
                  <span className="relative z-10 flex items-center justify-center gap-2">
                    Confirm Order
                    <span className="material-symbols-outlined text-sm group-hover:translate-x-1 transition-transform">arrow_forward</span>
                  </span>
                  <div className="absolute inset-0 bg-gradient-to-r from-primary to-primary-container opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                </button>

                <div className="mt-6 flex items-center justify-center gap-2 text-[10px] text-outline uppercase tracking-widest font-mono">
                  <span className="material-symbols-outlined text-sm">lock</span>
                  Encrypted 256-bit Secure Transaction
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-[#131315] w-full py-12 px-8 mt-auto border-t border-primary/10">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 max-w-7xl mx-auto">
          <div>
            <div className="text-primary font-headline font-bold text-xl mb-4">Trebor Labs</div>
            <p className="font-body text-sm text-gray-400 leading-relaxed">Technical hardware editorial and boutique peripheral design.</p>
          </div>
          {[
            { title: 'Navigation', links: ['Products', 'Documentation', 'Open Source'] },
            { title: 'Legal', links: ['Privacy', 'Terms', 'Shipping', 'Returns'] },
          ].map(({ title, links }) => (
            <div key={title} className="flex flex-col gap-3">
              <h4 className="font-mono text-xs uppercase text-primary mb-2">{title}</h4>
              {links.map((l) => <a key={l} className="text-gray-500 hover:text-primary transition-all text-sm" href="#">{l}</a>)}
            </div>
          ))}
          <div className="flex flex-col gap-3">
            <h4 className="font-mono text-xs uppercase text-primary mb-2">Newsletter</h4>
            <div className="flex bg-surface-container-high">
              <input className="bg-transparent border-none text-xs p-3 w-full focus:outline-none" placeholder="Your Email" type="text" />
              <button className="bg-primary text-on-primary px-4 hover:bg-primary-container transition-colors">
                <span className="material-symbols-outlined text-sm">send</span>
              </button>
            </div>
          </div>
        </div>
        <div className="max-w-7xl mx-auto mt-12 pt-8 border-t border-outline-variant/10 text-center">
          <p className="font-body text-sm text-gray-400">© 2026 Trebor Labs. Technical Hardware Editorial.</p>
        </div>
      </footer>
    </div>
  );
};

export default Checkout;
