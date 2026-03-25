import { Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';

const Home = () => {
  const { addToCart } = useCart();
  return (
    <main className="bg-surface text-on-surface">
      {/* Hero Section */}
      <header className="relative w-full min-h-screen flex items-center pt-20 overflow-hidden bg-surface">
        {/* Ambient background blobs */}
        <div className="absolute inset-0 z-0 opacity-40">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-primary-container/20 rounded-full blur-[120px]"></div>
          <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-secondary-container/10 rounded-full blur-[100px]"></div>
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-8 w-full grid md:grid-cols-2 gap-16 items-center">
          <div className="space-y-8">
            <div className="inline-flex items-center gap-3 px-3 py-1 border border-[#6b4c9a]/60 bg-transparent rounded-sm">
              <span className="font-mono text-[10px] font-bold text-primary tracking-widest uppercase">
                [MOD_V2.0]
              </span>
              <span className="font-mono text-[10px] font-medium tracking-widest uppercase text-gray-300">
                Nueva Colección 2026
              </span>
            </div>

            <h1 className="font-headline text-5xl md:text-7xl font-extrabold tracking-tighter leading-[1.1] text-on-surface">
              Tu próximo gran proyecto{' '}
              <span className="text-primary italic">empieza aquí.</span>
            </h1>

            <p className="text-on-surface-variant text-lg max-w-lg font-light leading-relaxed">
              Hardware de precisión para mentes técnicas. Desde teclados mecánicos personalizados hasta kits Raspberry Pi de alto rendimiento.
            </p>

            <div className="flex flex-wrap gap-4">
              <Link to="/products">
                <button className="px-8 py-4 bg-primary-container text-on-primary-container rounded-md font-bold tracking-tight hover:shadow-[0_0_20px_rgba(107,76,154,0.4)] transition-all active:scale-95">
                  Explorar Teclados
                </button>
              </Link>
              <Link to="/raspi">
                <button className="px-8 py-4 bg-secondary-container text-on-secondary-container rounded-md font-bold tracking-tight border border-secondary/20 hover:bg-secondary/10 transition-all active:scale-95">
                  Descubre Raspi
                </button>
              </Link>
              <Link to="/blog">
                <button className="px-8 py-4 bg-surface-container-highest text-primary rounded-md font-bold tracking-tight hover:text-white transition-all active:scale-95">
                  Lee el Blog
                </button>
              </Link>
            </div>
          </div>

          <div className="relative hidden md:block">
            <div className="aspect-square bg-surface-container-high rounded-xl overflow-hidden shadow-2xl rotate-2 hover:rotate-0 transition-transform duration-500">
              <img
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuDDC4F6gV9FO7T7gXcp2-vC2TnCGhhlMnsT7Xyl5CnhQEsNqF_l_KqHbDeJBwNRKg34R65CYDhBz2AyKPv1EYZohl7fVQe40_moa0J6R8392u5Ghb2t7EPek9jY2B0GwdIs0usdbFbjR7kyAxjWNSvNzu1kHo7EgWCF1JOvQ4MlV0aWeSDTgOSioP3YGFD_XECXCvBEU-IsY9eFqRMGAMinSKGfyugVudgo1I8ke-ADBaJYK1qzkqvvrsZiCTFEV3cSsHvT3Vtfs3aV"
                alt="Custom Mechanical Keyboard"
                className="w-full h-full object-cover"
              />
            </div>
            <div className="absolute -bottom-8 -left-8 p-6 bg-surface-container-highest rounded-xl shadow-xl max-w-[200px] border border-outline-variant/30">
              <span className="font-mono text-[10px] text-primary block mb-2 tracking-widest uppercase">Spec Highlights</span>
              <p className="font-headline font-bold text-sm text-on-surface">65% Layout, Gasket Mount, CNC Aluminum</p>
            </div>
          </div>
        </div>
      </header>

      {/* Featured Products */}
      <section className="bg-surface-container-low py-32 px-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex justify-between items-end mb-16">
            <div>
              <h2 className="font-headline text-4xl font-bold tracking-tight text-on-surface mb-2">Equipamiento Destacado</h2>
              <p className="text-on-surface-variant">Selección curada de hardware táctico.</p>
            </div>
            <Link to="/products" className="text-primary font-mono text-sm tracking-widest hover:underline flex items-center gap-2">
              VER TODO <span className="material-symbols-outlined text-xs">arrow_forward</span>
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Card 1 */}
            <div className="group bg-surface-container-low rounded-xl p-4 transition-all hover:bg-surface-container-high hover:-translate-y-2">
              <div className="relative aspect-[4/3] rounded-lg overflow-hidden mb-6 bg-surface-container">
                <img
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuBVJH3hZrzVsDBx2tnw62y_sLwDWiCc7WJNT21NG9VkCHx8fbe7GI1WoixJv6pfhKNx-_P29R7odfQ4A6KByhhwRmq11WKHAsfVZmAD3G-PQR2hM196dq_OGIGZMtAal9ErPVug2jA0KfRwo86D4e3d9Sj1NqUn8lr88ed6LIYeuhE2xQFMZx4zuCuva_Iqj3mXIQ-gEyTgsxCkQzoRFCKcT7i4GxqFwRgfX7G0c5d1qD-eqE8blxv4-j3N7OU6FY4dhDXnfXYTOIeC"
                  alt="TKL Mechanical Keyboard"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute top-4 right-4 px-3 py-1 bg-primary text-on-primary-fixed text-[10px] font-bold uppercase tracking-widest rounded-full">
                  En Stock
                </div>
              </div>
              <div className="flex justify-between items-start mb-2">
                <h3 className="font-headline font-bold text-xl text-on-surface">Neon Tactile 65%</h3>
                <span className="font-mono text-primary font-bold">$189.00</span>
              </div>
              <p className="text-on-surface-variant text-sm mb-6">Hot-swappable, switches lubricados de fábrica.</p>
              <button
                onClick={() => addToCart({ id: 'home-1', name: 'Neon Tactile 65%', price: '$189' })}
                className="w-full py-3 bg-surface-container-highest rounded-md text-on-surface text-sm font-bold hover:bg-primary hover:text-on-primary transition-colors flex items-center justify-center gap-2"
              >
                <span className="material-symbols-outlined text-sm">shopping_bag</span>
                Añadir al carrito
              </button>
            </div>

            {/* Card 2 */}
            <div className="group bg-surface-container-low rounded-xl p-4 transition-all hover:bg-surface-container-high hover:-translate-y-2">
              <div className="relative aspect-[4/3] rounded-lg overflow-hidden mb-6 bg-surface-container">
                <img
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuApuve3n0pKb9YaV-kiYU8M3yUSHpxGp2_ArAw50ea0Acpj0gcxce9xE3edHIgEdFKXtfHvUGyK8dZvr_AcmIhDOKQe19Z7oyyZNwebS-egSjiz3dNqo8poW3O6yAeitoUtBJm0-5ICKUekcum6GbdwrIhXHxL6P-sVZqbj56N7-MK_Z4UrHJvSP9WJRjtKdYy-1QWKGOCj3htjjQM3oIT7PfsCJTe70ct4D0QLNV8KRfYx7a3OdyYQQRxy6fXG76Lbswzo5FtUPNWT"
                  alt="Raspberry Pi 5 Kit"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute top-4 right-4 px-3 py-1 bg-primary text-on-primary-fixed text-[10px] font-bold uppercase tracking-widest rounded-full">
                  En Stock
                </div>
              </div>
              <div className="flex justify-between items-start mb-2">
                <h3 className="font-headline font-bold text-xl text-on-surface">Pro Pi 5 Starter Kit</h3>
                <span className="font-mono text-primary font-bold">$124.50</span>
              </div>
              <p className="text-on-surface-variant text-sm mb-6">8GB RAM, Caja de aluminio, Fuente 27W USB-C.</p>
              <button
                onClick={() => addToCart({ id: 'home-2', name: 'Pro Pi 5 Starter Kit', price: '$124' })}
                className="w-full py-3 bg-surface-container-highest rounded-md text-on-surface text-sm font-bold hover:bg-primary hover:text-on-primary transition-colors flex items-center justify-center gap-2"
              >
                <span className="material-symbols-outlined text-sm">shopping_bag</span>
                Añadir al carrito
              </button>
            </div>

            {/* Card 3 */}
            <div className="group bg-surface-container-low rounded-xl p-4 transition-all hover:bg-surface-container-high hover:-translate-y-2">
              <div className="relative aspect-[4/3] rounded-lg overflow-hidden mb-6 bg-surface-container">
                <img
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuAhKNE3_0THQu9kkJhdNr46I-BQKSpz-UERx3L6rSKD0JS3V9WEp8NIt6hEselll9uDfJ0ajyIxpNGtOJGycfcK8W7KZFk7WQmFjnv0gDANk5bpzOZyLKfuG7MfmBds2CMmEiKvmEaJkKOrZ9RCBzIygVSbJuSLkStvLLNFNmhRfj7sqMu0gY123zYJet3pTmDOLzcWzuXH1K_G88CTaMtTYFI81EOtfZyzSkLYSWiJy5daX9JEFX-herqu2TGatfXa-wHZRGY0ObpB"
                  alt="Coiled Aviator Cable"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute top-4 right-4 px-3 py-1 bg-primary text-on-primary-fixed text-[10px] font-bold uppercase tracking-widest rounded-full">
                  En Stock
                </div>
              </div>
              <div className="flex justify-between items-start mb-2">
                <h3 className="font-headline font-bold text-xl text-on-surface">Aviator Coiled Cable</h3>
                <span className="font-mono text-primary font-bold">$45.00</span>
              </div>
              <p className="text-on-surface-variant text-sm mb-6">Paracord y Techflex premium, GX16 Aviator.</p>
              <button
                onClick={() => addToCart({ id: 'home-3', name: 'Aviator Coiled Cable', price: '$45' })}
                className="w-full py-3 bg-surface-container-highest rounded-md text-on-surface text-sm font-bold hover:bg-primary hover:text-on-primary transition-colors flex items-center justify-center gap-2"
              >
                <span className="material-symbols-outlined text-sm">shopping_bag</span>
                Añadir al carrito
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* About Snippet */}
      <section className="bg-surface py-32 px-8 overflow-hidden">
        <div className="max-w-7xl mx-auto grid md:grid-cols-2 gap-24 items-center">
          <div className="relative">
            <div className="absolute -top-12 -left-12 text-[120px] font-black text-primary/5 select-none leading-none">TECH</div>
            <h2 className="font-headline text-4xl font-bold tracking-tight text-on-surface mb-8">Sobre Trebor Labs</h2>
            <div className="space-y-6 text-on-surface-variant leading-relaxed">
              <p>
                No somos solo una tienda de hardware; somos un laboratorio para el artesano digital. Creemos que las herramientas con las que interactúas cada día deben ser tan precisas como el código que escribes.
              </p>
              <p>
                Desde Perú, curamos y diseñamos componentes que cierran la brecha entre la electrónica cruda y la experiencia de usuario refinada. Cada interruptor, cada PCB y cada línea de nuestro blog está pensada para el profesional que no se conforma con lo estándar.
              </p>
            </div>
            <div className="mt-12">
              <a className="inline-flex items-center gap-4 group cursor-pointer" href="#">
                <span className="w-12 h-[1px] bg-primary group-hover:w-20 transition-all"></span>
                <span className="font-headline font-bold uppercase tracking-widest text-sm text-primary">Nuestra Filosofía</span>
              </a>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-4">
              <div className="aspect-[3/4] rounded-lg bg-surface-container-high overflow-hidden grayscale hover:grayscale-0 transition-all">
                <img
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuCjeCdHzmWOEmgxVUOvCVLamPKH4FVOvlIyu21XqkW40z9ZYvPKM2gTcdSQ5SGzO7GBNQmijGAfLAXx3N2FjSP3CS7MDzXyN905P8SBQIW5f0rKkRCequv7v6uXtzfC773_UWsKx1G2snoNshzgEfh0R_GLxgnUutBoJ5d31x81Rrx4zJwTJ5QBkJhnAgtmdthnb3O-EumK6C8V6stWd1MENiT0Ht0nO4S3x65CUpLUfj-y_T5i8uzoFscmKxCKPEZ1gkXyb0DosOMp"
                  alt="Circuit Detail"
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="h-32 rounded-lg bg-primary-container/20 flex items-center justify-center border border-primary/10">
                <span className="text-4xl font-black text-primary">;</span>
              </div>
            </div>
            <div className="space-y-4 pt-12">
              <div className="h-32 rounded-lg bg-secondary-container/20 flex items-center justify-center border border-secondary/10">
                <span className="material-symbols-outlined text-primary scale-[2]">memory</span>
              </div>
              <div className="aspect-[3/4] rounded-lg bg-surface-container-high overflow-hidden grayscale hover:grayscale-0 transition-all">
                <img
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuB9wKqSi4MUHN6f2lrbJOat58R47pWrpMQXt-Ht9-vcBbjudUxRaDemw4sfjczFwyg86IdWXU2We5N5FLnVJD5faWpd9YDC-AZeuoSqJ6vUHDvSkrDupxyDb6waodR7hLdu2Gzs9r9vuJKJL2uIDvPf49T7wHaBgsiI-Zcp6AyiJOXFG0A8jmnQvUcOZfC8cqRWhRfS34_en2IXelscnwvzocXyc9BrkYl7Wx4isf-HtiVSBUzdNn4mjEQeMLJYQjPe2s1LFGG9sbjv"
                  alt="Mechanical Switch"
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-[#131315] w-full py-12 px-8 border-t border-primary/10">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 max-w-7xl mx-auto">
          <div className="space-y-6">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 flex items-center justify-center bg-primary-container rounded">
                <span className="text-white font-bold">;</span>
              </div>
              <span className="text-primary font-headline font-bold text-xl uppercase tracking-tighter">Trebor Labs</span>
            </div>
            <p className="font-body text-sm text-gray-400 leading-relaxed">
              Technical Hardware Editorial. Precision tools for the modern builder.
            </p>
          </div>

          <div className="space-y-6">
            <h4 className="font-headline font-bold text-white text-sm uppercase tracking-widest">Navegación</h4>
            <ul className="space-y-4">
              {['Privacy', 'Terms', 'Shipping', 'Returns'].map((item) => (
                <li key={item}>
                  <a className="font-body text-sm text-gray-500 hover:text-primary underline decoration-primary underline-offset-4 transition-all" href="#">{item}</a>
                </li>
              ))}
            </ul>
          </div>

          <div className="space-y-6">
            <h4 className="font-headline font-bold text-white text-sm uppercase tracking-widest">Catálogo</h4>
            <ul className="space-y-4">
              {['Keyboards', 'Raspberry Pi Kits', 'Custom Switches', 'Desktop Accessories'].map((item) => (
                <li key={item}>
                  <a className="text-gray-500 hover:text-primary transition-colors text-sm" href="#">{item}</a>
                </li>
              ))}
            </ul>
          </div>

          <div className="space-y-6">
            <h4 className="font-headline font-bold text-white text-sm uppercase tracking-widest">Newsletter</h4>
            <p className="text-sm text-gray-400">Recibe actualizaciones técnicas y lanzamientos exclusivos.</p>
            <div className="relative">
              <input
                className="w-full bg-surface-container-high border-none rounded-md px-4 py-3 text-sm text-on-surface focus:ring-1 focus:ring-primary/40 font-mono"
                placeholder="email@labs.com"
                type="email"
              />
              <button className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 text-primary hover:bg-primary/10 rounded-md transition-all">
                <span className="material-symbols-outlined">send</span>
              </button>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto mt-20 pt-8 border-t border-outline-variant/10 flex flex-col md:flex-row justify-between items-center gap-6">
          <p className="font-body text-sm text-gray-400">© 2026 Trebor Labs. Technical Hardware Editorial.</p>
          <div className="flex items-center gap-8">
            <span className="font-mono text-[10px] text-gray-600 tracking-tighter">BUILD_V1.0.0_STABLE</span>
            <span className="font-mono text-[10px] text-gray-600 tracking-tighter flex items-center gap-1">
              <span className="w-1.5 h-1.5 bg-green-500 rounded-full"></span> SYSTEM_ONLINE
            </span>
          </div>
        </div>
      </footer>
    </main>
  );
};

export default Home;
