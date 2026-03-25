import { Link, useLocation } from 'react-router-dom';
import { useMemo, useState } from 'react';
import { useCart } from '../context/CartContext';

const productsData = [
  {
    id: 1, category: 'keyboards', name: 'Trebor Split v1', price: '$299', description: '65% Split Mechanical Kit • CNC Aluminum',
    status: 'En Stock', statusColor: 'bg-emerald-500/90', comingSoon: false,
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBlWA3N2N4makraxA_ECr2MkPrbuHbNm0mQjwO-O30tB6TVJK8qWgpUsCr_U804IvhCvGgqbm6Uc8JI7k-JfZFXBTQIqrskLEHjga4G3BU2JhZsu_45pZJCYgpYZw1kf3ziyIjQfpdPUejkfQBX6tQeFa3qCYdHp38KgFVGvLFKqBoAs9putub4hKSL-btxF98XB9xsFwIxR4u42asdgsRJFh_b2Z2t_q8qCsSrEU67SS8fgZQKnmE_qy12zTA5jX-mODj0Viqmov7L',
  },
  {
    id: 2, category: 'keyboards', name: 'Ortho Alpha X', price: '$420', description: '40% Ortholinear Kit • Walnut Wood Frame',
    status: 'Coming Soon', statusColor: 'bg-amber-500/90', comingSoon: true,
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCWfngz6-Bt9H3a--FYtQRryqdwlkhV3I057OJo3wPN77LZi6YgHiTgCjbw4pY5WHbNFbYzZms7agBAipdFTCQIeDguLbBj0SO6eiqD_2cuTm-vbdnafPrvbwwEz_P4EprlEWcXrDDgYX83tLQNchO1L_CwUUe9JlTXn34BiIl5seWQkPb5doUzvePIGHrdMi7_4j-RH_J3ZAUaerdxrJqZGkyVj11Nh8nXBrBN2FPB01YymPYsFkVUU73o4fDmYGPFu9rDi_Uhio2W',
  },
  {
    id: 3, category: 'keyboards', name: 'Tactician TKL-87', price: '$185', description: 'Tenkeyless Layout • Polycarbonate Case',
    status: 'En Stock', statusColor: 'bg-emerald-500/90', comingSoon: false,
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAYuKpIlu-5oy2vErrnQL8myeYqZF8MydgKVdmqo5iYPbFJBsBnvYbOVLh6jC_eKhxVZL4s7vkoR8a4o8_la0IOXoGoXEmPaJEcGP80StdZ8lU1ZaTV5hXC2eETd42bGPxYTVAQY-0IHc2lSj9dK3MgoXEIUqC8Of3fuhL9V0cGzMQMsSdAXja4gzqqPgBT-LWvscr4KsxSt3xqvpUJULgaYeAV8Hupct8tLwdcOlcjpPYvH05lYlrgCtEw6cCDARiiYhGEgEaCc63-',
  },
  {
    id: 4, category: 'keyboards', name: 'Ghost PCB Edition', price: '$550', description: 'Split-60% • Frosted Resin & Gold PCB',
    status: 'En Stock', statusColor: 'bg-emerald-500/90', comingSoon: false,
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBgkBAqa-ThneyYlu5EOlxqW5ms4xNI_o3iyz3CAlH0UynG_miUqHdaLyfX5VOI8sCHkZDAHFXB-Z9uxrllJYdnkdW5WOfCA-zbn6P2KX5LvO7DprzAHT4Dvml7o078DmzS2NWBbanTebbGBwDYvQpXWoEC73IspOaXvE_xr8LmTu9sAPB3s27k4Rchh5ZozU33ggCcoduuJCETUb_CsiOpmx-ut5b2kI7d-aOgi4sqmz86_2xK8Q6kNcgEtvTdpWL_lF_h78jC3SEw',
  },
  {
    id: 5, category: 'keyboards', name: 'Retro Lab 1984', price: '$315', description: 'TKL Retro Aesthetic • ABS High Profile',
    status: 'Coming Soon', statusColor: 'bg-amber-500/90', comingSoon: true,
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDb8lRwZ9a2OwBRu9hZzyBZl2f4p9Z9V85FAMi2AfqAlGinAcCQh_f1v-ZdRIEf0VS3OK05ifg-8mV9yYxKGekkbgqs59W9Ft__PQkC-IHZ--YCt5XW0ANBW-SpH2NbGvittQJx5MkxeFGr3F6pft4vv23vb7aGcqWcUGWj3p0__mrM8Fviup87VHe_i_9GGAg7Q4g3F0STqjsfdvmAJbxHC3yy7n7mixshE8kDAJE7v2SwZcBzrFa376W8Vxte96r5p2XOM0nIidzY',
  },
  // Raspberry Pi
  {
    id: 101, category: 'raspi', name: 'Pro Pi 5 Starter Kit', price: '$124', description: 'Pi 5 8GB · Caja aluminio · USB-C 27W · Disipador activo',
    status: 'En Stock', statusColor: 'bg-emerald-500/90', comingSoon: false, model: 'Pi 5',
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuApuve3n0pKb9YaV-kiYU8M3yUSHpxGp2_ArAw50ea0Acpj0gcxce9xE3edHIgEdFKXtfHvUGyK8dZvr_AcmIhDOKQe19Z7oyyZNwebS-egSjiz3dNqo8poW3O6yAeitoUtBJm0-5ICKUekcum6GbdwrIhXHxL6P-sVZqbj56N7-MK_Z4UrHJvSP9WJRjtKdYy-1QWKGOCj3htjjQM3oIT7PfsCJTe70ct4D0QLNV8KRfYx7a3OdyYQQRxy6fXG76Lbswzo5FtUPNWT',
  },
  {
    id: 102, category: 'raspi', name: 'Pi 5 NAS Server Kit', price: '$189', description: 'Pi 5 8GB · Case NAS · 2× SATA HAT · Ventilador 40mm',
    status: 'En Stock', statusColor: 'bg-emerald-500/90', comingSoon: false, model: 'Pi 5',
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBVJH3hZrzVsDBx2tnw62y_sLwDWiCc7WJNT21NG9VkCHx8fbe7GI1WoixJv6pfhKNx-_P29R7odfQ4A6KByhhwRmq11WKHAsfVZmAD3G-PQR2hM196dq_OGIGZMtAal9ErPVug2jA0KfRwo86D4e3d9Sj1NqUn8lr88ed6LIYeuhE2xQFMZx4zuCuva_Iqj3mXIQ-gEyTgsxCkQzoRFCKcT7i4GxqFwRgfX7G0c5d1qD-eqE8blxv4-j3N7OU6FY4dhDXnfXYTOIeC',
  },
  {
    id: 103, category: 'raspi', name: 'Pi 4 Classic Kit 8GB', price: '$89', description: 'Pi 4B 8GB · Caja oficial · Fuente 15W · microSD 32GB',
    status: 'En Stock', statusColor: 'bg-emerald-500/90', comingSoon: false, model: 'Pi 4',
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCjeCdHzmWOEmgxVUOvCVLamPKH4FVOvlIyu21XqkW40z9ZYvPKM2gTcdSQ5SGzO7GBNQmijGAfLAXx3N2FjSP3CS7MDzXyN905P8SBQIW5f0rKkRCequv7v6uXtzfC773_UWsKx1G2snoNshzgEfh0R_GLxgnUutBoJ5d31x81Rrx4zJwTJ5QBkJhnAgtmdthnb3O-EumK6C8V6stWd1MENiT0Ht0nO4S3x65CUpLUfj-y_T5i8uzoFscmKxCKPEZ1gkXyb0DosOMp',
  },
  {
    id: 104, category: 'raspi', name: 'Pi Zero 2W IoT Bundle', price: '$35', description: 'Zero 2W · Headers soldados · Case · microSD · GPIO Pinout card',
    status: 'En Stock', statusColor: 'bg-emerald-500/90', comingSoon: false, model: 'Pi Zero',
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuB9wKqSi4MUHN6f2lrbJOat58R47pWrpMQXt-Ht9-vcBbjudUxRaDemw4sfjczFwyg86IdWXU2We5N5FLnVJD5faWpd9YDC-AZeuoSqJ6vUHDvSkrDupxyDb6waodR7hLdu2Gzs9r9vuJKJL2uIDvPf49T7wHaBgsiI-Zcp6AyiJOXFG0A8jmnQvUcOZfC8cqRWhRfS34_en2IXelscnwvzocXyc9BrkYl7Wx4isf-HtiVSBUzdNn4mjEQeMLJYQjPe2s1LFGG9sbjv',
  },
  {
    id: 105, category: 'raspi', name: 'Pi 5 AI Vision Kit', price: '$245', description: 'Pi 5 8GB · Hailo-8L NPU · Cámara Global Shutter · Trípode',
    status: 'Coming Soon', statusColor: 'bg-amber-500/90', comingSoon: true, model: 'Pi 5',
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAYuKpIlu-5oy2vErrnQL8myeYqZF8MydgKVdmqo5iYPbFJBsBnvYbOVLh6jC_eKhxVZL4s7vkoR8a4o8_la0IOXoGoXEmPaJEcGP80StdZ8lU1ZaTV5hXC2eETd42bGPxYTVAQY-0IHc2lSj9dK3MgoXEIUqC8Of3fuhL9V0cGzMQMsSdAXja4gzqqPgBT-LWvscr4KsxSt3xqvpUJULgaYeAV8Hupct8tLwdcOlcjpPYvH05lYlrgCtEw6cCDARiiYhGEgEaCc63-',
  },
  {
    id: 106, category: 'raspi', name: 'Pi 5 Retro Console Kit', price: '$165', description: 'Pi 5 4GB · Case RetroFlag · Mandos SNES · RetroPie preinstalado',
    status: 'Coming Soon', statusColor: 'bg-amber-500/90', comingSoon: true, model: 'Pi 5',
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDb8lRwZ9a2OwBRu9hZzyBZl2f4p9Z9V85FAMi2AfqAlGinAcCQh_f1v-ZdRIEf0VS3OK05ifg-8mV9yYxKGekkbgqs59W9Ft__PQkC-IHZ--YCt5XW0ANBW-SpH2NbGvittQJx5MkxeFGr3F6pft4vv23vb7aGcqWcUGWj3p0__mrM8Fviup87VHe_i_9GGAg7Q4g3F0STqjsfdvmAJbxHC3yy7n7mixshE8kDAJE7v2SwZcBzrFa376W8Vxte96r5p2XOM0nIidzY',
  },
];

const keyboardLayouts = ['Split (Dividido)', 'Ortho (Lineal)', 'TKL (Compacto)'];
const keyboardMaterials = ['Aluminio', 'Madera de Nogal', 'Resina', 'Policarbonato'];
const raspiModels = ['Todos', 'Pi 5', 'Pi 4', 'Pi Zero'];
const raspiUses = ['Kit Completo', 'NAS / Servidor', 'IoT / Maker', 'AI / Vision', 'Retro / Gaming'];

const ProductCatalog = () => {
  const { addToCart } = useCart();
  const location = useLocation();
  const isRaspi = location.pathname.includes('raspi');
  const currentCategory = isRaspi ? 'raspi' : 'keyboards';

  const [searchQuery, setSearchQuery] = useState('');
  const [raspiModel, setRaspiModel] = useState('Todos');

  const filteredProducts = useMemo(() => {
    let filtered = productsData.filter(p => p.category === currentCategory);
    if (isRaspi && raspiModel !== 'Todos') {
      filtered = filtered.filter(p => p.model === raspiModel);
    }
    if (searchQuery) {
      filtered = filtered.filter(p =>
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.description.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    return filtered;
  }, [currentCategory, isRaspi, raspiModel, searchQuery]);

  return (
    <main className="pt-32 pb-20 px-8 max-w-[1600px] mx-auto min-h-screen">
      {/* Header */}
      <header className="mb-12 flex flex-col md:flex-row md:items-end justify-between gap-8">
        <div className="space-y-2">
          <p className="font-mono text-primary text-xs tracking-widest uppercase">
            {isRaspi ? 'Single Board Computers' : 'Directorio Técnico'}
          </p>
          <h1 className="font-headline text-5xl font-black tracking-tighter uppercase italic">
            {isRaspi ? 'Raspberry Pi & SBCs' : 'Teclados Custom'}
          </h1>
        </div>
        <div className="w-full max-w-xl">
          <div className="relative flex items-center bg-surface-container-high rounded-xl overflow-hidden focus-within:ring-2 ring-primary/40 transition-all">
            <span className="material-symbols-outlined absolute left-4 text-on-surface-variant">search</span>
            <input
              className="w-full bg-transparent border-none py-4 pl-12 pr-6 text-on-surface focus:ring-0 placeholder:text-on-surface-variant/50"
              placeholder={isRaspi ? 'Buscar kits y SBCs...' : 'Buscar periféricos...'}
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
            />
            <div className="pr-4 hidden md:block">
              <kbd className="bg-surface-container text-[10px] font-mono px-2 py-1 rounded border border-outline-variant/30 text-on-surface-variant">CMD + K</kbd>
            </div>
          </div>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
        {/* Sidebar */}
        <aside className="lg:col-span-3 space-y-10">
          <div className="space-y-6">
            <h3 className="font-headline font-bold text-lg flex items-center gap-2">
              <span className="material-symbols-outlined text-primary">filter_list</span>
              Filtros Avanzados
            </h3>

            {/* Category toggle — always visible */}
            <div className="space-y-2">
              <p className="font-mono text-[10px] uppercase text-on-surface-variant tracking-widest">Categoría</p>
              {[
                { id: 'keyboards', label: 'Teclados Custom', link: '/products' },
                { id: 'raspi', label: 'Raspberry Pi', link: '/raspi' },
              ].map((cat) => (
                <Link to={cat.link} key={cat.id} className="flex items-center gap-3 cursor-pointer group no-underline">
                  <div className={`w-4 h-4 rounded border flex items-center justify-center transition-colors ${currentCategory === cat.id ? 'bg-primary border-primary text-surface' : 'bg-surface-container-highest border-outline-variant/30 group-hover:border-primary/50'}`}>
                    {currentCategory === cat.id && <span className="material-symbols-outlined text-[12px] font-bold">check</span>}
                  </div>
                  <span className={`text-sm group-hover:text-primary transition-colors ${currentCategory === cat.id ? 'text-primary font-medium' : 'text-on-surface'}`}>{cat.label}</span>
                </Link>
              ))}
            </div>

            {/* Keyboard-specific filters */}
            {!isRaspi && (
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
                    {keyboardMaterials.map((m) => (
                      <button key={m} className={`px-4 py-2 rounded-xl text-xs border transition-all ${m === 'Madera de Nogal' ? 'bg-primary/20 text-primary border-primary/40' : 'bg-surface-container-highest border-outline-variant/20 hover:border-primary/40'}`}>{m}</button>
                    ))}
                  </div>
                </div>
              </>
            )}

            {/* Raspi-specific filters */}
            {isRaspi && (
              <>
                <div className="space-y-2">
                  <p className="font-mono text-[10px] uppercase text-on-surface-variant tracking-widest">Modelo</p>
                  {raspiModels.map((m) => (
                    <button
                      key={m}
                      onClick={() => setRaspiModel(m)}
                      className={`flex items-center justify-between w-full px-4 py-2.5 rounded-lg text-sm transition-all ${raspiModel === m ? 'bg-primary/15 text-primary font-bold border border-primary/30' : 'text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface'}`}
                    >
                      <span>{m}</span>
                      {raspiModel === m && <span className="material-symbols-outlined text-sm">check</span>}
                    </button>
                  ))}
                </div>
                <div className="space-y-2">
                  <p className="font-mono text-[10px] uppercase text-on-surface-variant tracking-widest">Uso</p>
                  {raspiUses.map((c) => (
                    <label key={c} className="flex items-center gap-3 cursor-pointer group">
                      <input className="w-4 h-4 rounded bg-surface-container-highest border-none text-primary focus:ring-primary/20" type="checkbox" />
                      <span className="text-sm text-on-surface-variant group-hover:text-primary transition-colors">{c}</span>
                    </label>
                  ))}
                </div>
              </>
            )}

            {/* Price range — always visible */}
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <p className="font-mono text-[10px] uppercase text-on-surface-variant tracking-widest">Inversión (USD)</p>
                <span className="font-mono text-xs text-primary">$50 - $600</span>
              </div>
              <input className="w-full h-1 bg-surface-container-highest rounded-full appearance-none accent-primary cursor-pointer" max="600" min="50" type="range" defaultValue="600" />
            </div>

            {/* Availability — always visible */}
            <div className="space-y-2">
              <p className="font-mono text-[10px] uppercase text-on-surface-variant tracking-widest">Disponibilidad</p>
              <div className="flex gap-4">
                <button className="flex-1 py-3 text-xs rounded-xl bg-surface-container-low border border-outline-variant/10 hover:bg-surface-container-high transition-colors">En Stock</button>
                <button className="flex-1 py-3 text-xs rounded-xl bg-surface-container-low border border-outline-variant/10 hover:bg-surface-container-high transition-colors">Próximamente</button>
              </div>
            </div>
          </div>

          {/* CTA card — contextual */}
          <div className="bg-gradient-to-br from-primary/20 to-primary-container/40 p-6 rounded-2xl relative overflow-hidden group">
            <div className="relative z-10 space-y-3">
              <h4 className="font-headline font-bold italic leading-tight uppercase">
                {isRaspi ? 'Pi Dev Program' : 'Custom Labs Program'}
              </h4>
              <p className="text-xs text-on-surface-variant">
                {isRaspi
                  ? 'Accede a documentación avanzada, descuentos y soporte prioritario.'
                  : 'Diseña tu PCB desde cero con nuestra guía experta.'}
              </p>
              <button className="text-xs font-bold text-primary flex items-center gap-2 group-hover:gap-3 transition-all uppercase tracking-tighter">
                {isRaspi ? 'Registrarme' : 'Explorar Programa'}
                <span className="material-symbols-outlined text-sm">arrow_forward</span>
              </button>
            </div>
            <span className="material-symbols-outlined absolute -bottom-4 -right-4 text-primary/10 text-8xl rotate-12 group-hover:rotate-0 transition-transform duration-500">memory</span>
          </div>
        </aside>

        {/* Grid */}
        <div className="lg:col-span-9">
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-x-8 gap-y-12">
            {filteredProducts.map((p) => (
              <div key={p.id} className="group">
                <div className="relative aspect-[4/5] mb-6 overflow-hidden rounded-xl bg-surface-container-low">
                  <img src={p.image} alt={p.name} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                  <div className="absolute top-4 left-4">
                    <span className={`px-3 py-1 ${p.statusColor} backdrop-blur text-white text-[10px] font-bold uppercase tracking-widest rounded-full shadow-lg`}>{p.status}</span>
                  </div>
                  {p.comingSoon && <div className="absolute inset-0 bg-surface/40 group-hover:bg-transparent transition-all"></div>}
                  {!p.comingSoon && (
                    <button
                      onClick={() => addToCart(p)}
                      className="absolute bottom-4 right-4 w-12 h-12 bg-white text-surface rounded-full flex items-center justify-center opacity-0 translate-y-4 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300 shadow-xl"
                    >
                      <span className="material-symbols-outlined">add_shopping_cart</span>
                    </button>
                  )}
                </div>
                <div className={`space-y-1 ${p.comingSoon ? 'opacity-70 group-hover:opacity-100 transition-opacity' : ''}`}>
                  <div className="flex justify-between items-start">
                    <h3 className="font-headline font-bold text-xl tracking-tight uppercase group-hover:text-primary transition-colors">{p.name}</h3>
                    <span className="font-mono text-primary font-medium">{p.price}</span>
                  </div>
                  <p className="text-sm text-on-surface-variant">{p.description}</p>
                  {p.comingSoon ? (
                    <div className="pt-4">
                      <button className="text-[10px] font-bold uppercase tracking-widest border border-primary/40 px-4 py-2 rounded hover:bg-primary hover:text-surface transition-all">Notificarme</button>
                    </div>
                  ) : (
                    <div className="pt-4">
                      <button
                        onClick={() => addToCart(p)}
                        className="w-full py-2.5 bg-surface-container-highest rounded-md text-on-surface text-xs font-bold hover:bg-primary hover:text-surface transition-colors flex items-center justify-center gap-2"
                      >
                        <span className="material-symbols-outlined text-sm">shopping_bag</span>
                        Añadir al carrito
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))}

            {filteredProducts.length === 0 && (
              <div className="col-span-3 text-center py-24 text-on-surface-variant">
                <span className="material-symbols-outlined text-5xl mb-4 block">search_off</span>
                <p className="font-headline font-bold">Sin resultados para "{searchQuery}"</p>
              </div>
            )}

            {/* Custom Build CTA */}
            {!isRaspi && (
              <div className="group flex flex-col items-center justify-center border-2 border-dashed border-outline-variant/30 rounded-xl aspect-[4/5] text-center p-8">
                <span className="material-symbols-outlined text-4xl text-outline-variant mb-4">settings_input_component</span>
                <h3 className="font-headline font-bold uppercase tracking-tight mb-2">Build Custom</h3>
                <p className="text-xs text-on-surface-variant mb-6">¿No encuentras tu layout ideal? Diseñamos a medida.</p>
                <button className="bg-surface-container-highest px-6 py-3 rounded-xl text-xs font-bold uppercase tracking-widest hover:bg-primary hover:text-surface transition-all">Solicitar Demo</button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="mt-32 pt-12 border-t border-primary/10">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
          <div className="space-y-4">
            <span className="text-primary font-headline font-bold text-xl uppercase tracking-widest italic">Trebor Labs</span>
            <p className="font-body text-sm text-gray-400">© 2026 Trebor Labs. Technical Hardware Editorial.</p>
          </div>
          {[
            {
              title: isRaspi ? 'Pi Kits' : 'Explorar',
              links: isRaspi
                ? ['Starter Kits', 'NAS Server', 'IoT Bundles', 'AI Vision']
                : ['Novedades', 'Guías de Montaje', 'Firmware QMK/VIA'],
            },
            { title: 'Legal', links: ['Privacy', 'Terms', 'Shipping', 'Returns'] },
          ].map(({ title, links }) => (
            <div key={title} className="space-y-4">
              <p className="font-mono text-[10px] text-primary tracking-widest uppercase">{title}</p>
              <ul className="space-y-2">{links.map((l) => <li key={l}><a className="font-body text-sm text-gray-500 hover:text-primary transition-all" href="#">{l}</a></li>)}</ul>
            </div>
          ))}
          <div className="space-y-4">
            <p className="font-mono text-[10px] text-primary tracking-widest uppercase">Newsletter</p>
            <div className="flex border-b border-outline-variant pb-2">
              <input className="bg-transparent border-none text-xs w-full focus:outline-none placeholder:text-gray-600" placeholder="technical@tactician.com" type="email" />
              <button className="text-primary"><span className="material-symbols-outlined">arrow_forward</span></button>
            </div>
          </div>
        </div>
      </footer>
    </main>
  );
};

export default ProductCatalog;
