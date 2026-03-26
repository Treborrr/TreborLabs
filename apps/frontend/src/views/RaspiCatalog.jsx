import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';

const raspiProducts = [
  {
    id: 101,
    name: 'Pro Pi 5 Starter Kit',
    price: '$124',
    description: 'Pi 5 8GB · Caja aluminio · USB-C 27W · Disipador activo',
    status: 'En Stock', statusColor: 'bg-emerald-500/90',
    model: 'Pi 5', category: 'Kit Completo',
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuApuve3n0pKb9YaV-kiYU8M3yUSHpxGp2_ArAw50ea0Acpj0gcxce9xE3edHIgEdFKXtfHvUGyK8dZvr_AcmIhDOKQe19Z7oyyZNwebS-egSjiz3dNqo8poW3O6yAeitoUtBJm0-5ICKUekcum6GbdwrIhXHxL6P-sVZqbj56N7-MK_Z4UrHJvSP9WJRjtKdYy-1QWKGOCj3htjjQM3oIT7PfsCJTe70ct4D0QLNV8KRfYx7a3OdyYQQRxy6fXG76Lbswzo5FtUPNWT',
    comingSoon: false,
  },
  {
    id: 102,
    name: 'Pi 5 NAS Server Kit',
    price: '$189',
    description: 'Pi 5 8GB · Case NAS · 2× SATA HAT · Ventilador 40mm',
    status: 'En Stock', statusColor: 'bg-emerald-500/90',
    model: 'Pi 5', category: 'NAS / Servidor',
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBVJH3hZrzVsDBx2tnw62y_sLwDWiCc7WJNT21NG9VkCHx8fbe7GI1WoixJv6pfhKNx-_P29R7odfQ4A6KByhhwRmq11WKHAsfVZmAD3G-PQR2hM196dq_OGIGZMtAal9ErPVug2jA0KfRwo86D4e3d9Sj1NqUn8lr88ed6LIYeuhE2xQFMZx4zuCuva_Iqj3mXIQ-gEyTgsxCkQzoRFCKcT7i4GxqFwRgfX7G0c5d1qD-eqE8blxv4-j3N7OU6FY4dhDXnfXYTOIeC',
    comingSoon: false,
  },
  {
    id: 103,
    name: 'Pi 4 Classic Kit 8GB',
    price: '$89',
    description: 'Pi 4B 8GB · Caja oficial · Fuente 15W · microSD 32GB',
    status: 'En Stock', statusColor: 'bg-emerald-500/90',
    model: 'Pi 4', category: 'Kit Completo',
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCjeCdHzmWOEmgxVUOvCVLamPKH4FVOvlIyu21XqkW40z9ZYvPKM2gTcdSQ5SGzO7GBNQmijGAfLAXx3N2FjSP3CS7MDzXyN905P8SBQIW5f0rKkRCequv7v6uXtzfC773_UWsKx1G2snoNshzgEfh0R_GLxgnUutBoJ5d31x81Rrx4zJwTJ5QBkJhnAgtmdthnb3O-EumK6C8V6stWd1MENiT0Ht0nO4S3x65CUpLUfj-y_T5i8uzoFscmKxCKPEZ1gkXyb0DosOMp',
    comingSoon: false,
  },
  {
    id: 104,
    name: 'Pi Zero 2W IoT Bundle',
    price: '$35',
    description: 'Zero 2W · Headers soldados · Case · microSD · GPIO Pinout card',
    status: 'En Stock', statusColor: 'bg-emerald-500/90',
    model: 'Pi Zero', category: 'IoT / Maker',
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuB9wKqSi4MUHN6f2lrbJOat58R47pWrpMQXt-Ht9-vcBbjudUxRaDemw4sfjczFwyg86IdWXU2We5N5FLnVJD5faWpd9YDC-AZeuoSqJ6vUHDvSkrDupxyDb6waodR7hLdu2Gzs9r9vuJKJL2uIDvPf49T7wHaBgsiI-Zcp6AyiJOXFG0A8jmnQvUcOZfC8cqRWhRfS34_en2IXelscnwvzocXyc9BrkYl7Wx4isf-HtiVSBUzdNn4mjEQeMLJYQjPe2s1LFGG9sbjv',
    comingSoon: false,
  },
  {
    id: 105,
    name: 'Pi 5 AI Vision Kit',
    price: '$245',
    description: 'Pi 5 8GB · Hailo-8L NPU · Cámara Global Shutter · Trípode',
    status: 'Coming Soon', statusColor: 'bg-amber-500/90',
    model: 'Pi 5', category: 'AI / Vision',
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAYuKpIlu-5oy2vErrnQL8myeYqZF8MydgKVdmqo5iYPbFJBsBnvYbOVLh6jC_eKhxVZL4s7vkoR8a4o8_la0IOXoGoXEmPaJEcGP80StdZ8lU1ZaTV5hXC2eETd42bGPxYTVAQY-0IHc2lSj9dK3MgoXEIUqC8Of3fuhL9V0cGzMQMsSdAXja4gzqqPgBT-LWvscr4KsxSt3xqvpUJULgaYeAV8Hupct8tLwdcOlcjpPYvH05lYlrgCtEw6cCDARiiYhGEgEaCc63-',
    comingSoon: true,
  },
  {
    id: 106,
    name: 'Pi 5 Retro Console Kit',
    price: '$165',
    description: 'Pi 5 4GB · Case RetroFlag · Mandos SNES · RetroPie preinstalado',
    status: 'Coming Soon', statusColor: 'bg-amber-500/90',
    model: 'Pi 5', category: 'Retro / Gaming',
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDb8lRwZ9a2OwBRu9hZzyBZl2f4p9Z9V85FAMi2AfqAlGinAcCQh_f1v-ZdRIEf0VS3OK05ifg-8mV9yYxKGekkbgqs59W9Ft__PQkC-IHZ--YCt5XW0ANBW-SpH2NbGvittQJx5MkxeFGr3F6pft4vv23vb7aGcqWcUGWj3p0__mrM8Fviup87VHe_i_9GGAg7Q4g3F0STqjsfdvmAJbxHC3yy7n7mixshE8kDAJE7v2SwZcBzrFa376W8Vxte96r5p2XOM0nIidzY',
    comingSoon: true,
  },
];

const models = ['Todos', 'Pi 5', 'Pi 4', 'Pi Zero'];
const categories = ['Kit Completo', 'NAS / Servidor', 'IoT / Maker', 'AI / Vision', 'Retro / Gaming'];

const RaspiCatalog = () => {
  const { addToCart } = useCart();
  const [activeModel, setActiveModel] = useState('Todos');
  const [searchQuery, setSearchQuery] = useState('');

  const filtered = raspiProducts.filter(p => {
    const matchModel = activeModel === 'Todos' || p.model === activeModel;
    const matchSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchModel && matchSearch;
  });

  return (
    <main className="pt-32 pb-20 px-8 max-w-[1600px] mx-auto min-h-screen">
      {/* Header */}
      <header className="mb-12 flex flex-col md:flex-row md:items-end justify-between gap-8">
        <div className="space-y-2">
          <p className="font-mono text-primary text-xs tracking-widest uppercase">Single Board Computers</p>
          <h1 className="font-headline text-5xl font-black tracking-tighter uppercase italic">Raspberry Pi &amp; SBCs</h1>
        </div>
        <div className="w-full max-w-xl">
          <div className="relative flex items-center bg-surface-container-high rounded-xl overflow-hidden focus-within:ring-2 ring-primary/40 transition-all">
            <span className="material-symbols-outlined absolute left-4 text-on-surface-variant">search</span>
            <input
              className="w-full bg-transparent border-none py-4 pl-12 pr-6 text-on-surface focus:ring-0 placeholder:text-on-surface-variant/50"
              placeholder="Buscar kits y accesorios..."
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
            />
          </div>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
        {/* Sidebar */}
        <aside className="lg:col-span-3 space-y-10">
          <div className="space-y-6">
            <h3 className="font-headline font-bold text-lg flex items-center gap-2">
              <span className="material-symbols-outlined text-primary">filter_list</span>
              Filtros
            </h3>

            {/* Model filter */}
            <div className="space-y-3">
              <p className="font-mono text-[10px] uppercase text-on-surface-variant tracking-widest">Modelo</p>
              {models.map((m) => (
                <button
                  key={m}
                  onClick={() => setActiveModel(m)}
                  className={`flex items-center justify-between w-full px-4 py-2.5 rounded-lg text-sm transition-all ${activeModel === m ? 'bg-primary/15 text-primary font-bold border border-primary/30' : 'text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface'}`}
                >
                  <span>{m}</span>
                  {activeModel === m && <span className="material-symbols-outlined text-sm">check</span>}
                </button>
              ))}
            </div>

            {/* Categories */}
            <div className="space-y-3">
              <p className="font-mono text-[10px] uppercase text-on-surface-variant tracking-widest">Uso</p>
              {categories.map((c) => (
                <label key={c} className="flex items-center gap-3 cursor-pointer group">
                  <input className="w-4 h-4 rounded bg-surface-container-highest border-none text-primary focus:ring-primary/20" type="checkbox" />
                  <span className="text-sm text-on-surface-variant group-hover:text-primary transition-colors">{c}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Dev program CTA */}
          <div className="bg-gradient-to-br from-primary/20 to-primary-container/40 p-6 rounded-2xl relative overflow-hidden group">
            <div className="relative z-10 space-y-3">
              <h4 className="font-headline font-bold italic leading-tight uppercase">Pi Dev Program</h4>
              <p className="text-xs text-on-surface-variant">Accede a documentación avanzada, descuentos y soporte prioritario.</p>
              <button className="text-xs font-bold text-primary flex items-center gap-2 group-hover:gap-3 transition-all uppercase tracking-tighter">
                Registrarme <span className="material-symbols-outlined text-sm">arrow_forward</span>
              </button>
            </div>
            <span className="material-symbols-outlined absolute -bottom-4 -right-4 text-primary/10 text-8xl rotate-12 group-hover:rotate-0 transition-transform duration-500">memory</span>
          </div>
        </aside>

        {/* Grid */}
        <div className="lg:col-span-9">
          {/* Model tabs */}
          <div className="flex gap-2 mb-8 overflow-x-auto no-scrollbar pb-2">
            {models.map((m) => (
              <button
                key={m}
                onClick={() => setActiveModel(m)}
                className={`px-5 py-2 rounded-lg text-xs font-bold uppercase tracking-widest whitespace-nowrap transition-all ${activeModel === m ? 'bg-primary text-surface shadow-lg shadow-primary/20' : 'bg-surface-container-high text-on-surface-variant hover:bg-surface-container-highest'}`}
              >
                {m}
              </button>
            ))}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-x-8 gap-y-12">
            {filtered.map((p) => (
              <div key={p.id} className="group">
                <div className="relative aspect-[4/5] mb-6 overflow-hidden rounded-xl bg-surface-container-low">
                  <img src={p.image} alt={p.name} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                  <div className="absolute top-4 left-4 flex flex-col gap-2">
                    <span className={`px-3 py-1 ${p.statusColor} backdrop-blur text-white text-[10px] font-bold uppercase tracking-widest rounded-full shadow-lg`}>{p.status}</span>
                    <span className="px-3 py-1 bg-surface/70 backdrop-blur text-primary text-[10px] font-mono tracking-widest uppercase border border-primary/20 rounded-full">{p.category}</span>
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

            {filtered.length === 0 && (
              <div className="col-span-3 text-center py-24 text-on-surface-variant">
                <span className="material-symbols-outlined text-5xl mb-4 block">search_off</span>
                <p className="font-headline font-bold">Sin resultados para "{searchQuery}"</p>
              </div>
            )}
          </div>
        </div>
      </div>

    </main>
  );
};

export default RaspiCatalog;
