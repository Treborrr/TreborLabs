import { Link } from 'react-router-dom';

const specs = [
  { label: 'Case Material', value: 'CNC Aluminum 6063' },
  { label: 'Switch Type', value: 'Trebor Violet (Tactile 65g)' },
  { label: 'PCB Features', value: 'Hotswap, RGB, QMK/VIA' },
  { label: 'Weight', value: '2.4 kg (Fully Assembled)' },
  { label: 'Connectivity', value: 'USB-C / BT 5.2 / 2.4GHz' },
];

const chips = ['FR4 Plate', 'Gasket Mount', 'Poron Foam Kit', 'Screw-in Stabs'];

const thumbs = [
  'https://lh3.googleusercontent.com/aida-public/AB6AXuBpWcNDZ4UlNenWv7hs05Q98IL5RGKJ8_vfnnNDcmpDoSdK3RzsF3fB5rqPWQOqjuKHjrivPwO7-0WmGSgq__t-fMvrWeUEbMoupoFBG66oveCTITKNbTk2Nr42naBEDiHkQlIIqfXKqdxhdDDPImzclYaf8zKRmzjBF5tpEq1-n7Y7ob2LiK7o1665l4Zyd5xJCOrJkxAUw5uEcSHglPhuiMzhFT7-OoydYmVjFY5xKZG_S721QNJqyP5OLC_9ppm9SyNoEKukG8vN',
  'https://lh3.googleusercontent.com/aida-public/AB6AXuCJVoUEgIvXWkODVY16xYl5lA9Rnc8Cripbz1f3kmNblXz9nsIsKJ7bXfkVXkh0Ti4iCDaqmFjIk8bip2nts7FgeFV3lo-ob3YX',
  'https://lh3.googleusercontent.com/aida-public/AB6AXuANRI3BDA8FImWCl33DX4PaNqcMofs06C7m1538DSVxHqYiCV88l59L_Gsc49qEok4q2p0qoQM-2KqJywQs1zEqhwpHf0y4PVVpRT-1746tA-yK6YvRPhhOFJ-RlcNQiWkXvoL-JtoYma2mjz0E_a7DOzuU3mKZo5D2KVXeEhWAKAuvXxEsyLoceAr94qxMsTQpox12iwBYZyFiShNKHQ4hHl1y5Uqxaq910vcWlu63hk-pqub3GFs5qC4mUwOSwrEhUJXjMGx1PNDb',
  'https://lh3.googleusercontent.com/aida-public/AB6AXuDF0F01PkMjsOthg6ktfmu4M48lrsy10PoQYJ_9IptT3qxYQ5C_itvrS9qp7bPw3ArYX7dgVDLvudR4t2a3_rxStC4RU5NUGErLhhsatzdrxsuMUFGZQMZx7Qi4MdGWLHowtkFkWNkdP81OB6OmuYB2KawCkYBA626OQ6atMpj5haiOk6nioD5PTrNJEG3q3ArDRMo5mnZE7MuKPOq2HDYUSOFscXDFtUXkHCsxEzHnfGdyBgNQwgFF3fqz74oPzcY3xkcV35wevmHw',
];

const ProductDetail = () => (
  <main className="pt-32 pb-24 px-4 md:px-8 max-w-screen-2xl mx-auto">
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
      {/* Gallery */}
      <section className="lg:col-span-7 space-y-6">
        <div className="relative group">
          <div className="aspect-[4/3] w-full bg-surface-container-low overflow-hidden rounded-xl border border-outline-variant/15">
            <img
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuCl42ziAsqFIgWXeJv1gwYllYupRnipce3-DIdWL1NGRiLNW-0B1KXUT9baVGnXbIJ38oFiqwxeSoxJyqP0Dr9STnUfJi1GSosPh2x2nLVwWi9FCBR3bcMQw0rK5KKUyzE8lVnpiXr-4AfixBN6CDjSGd8Gh31ZDjzrQnSwEJy7V8yuoS190pISmOmg8dXlBv2AjloTrSGGAwUkMRyJMV53lzN-hX1S7WKKgG_S1pCnEBjI8NKwWR-YAEKNhBqI9wKvH7CVHFJe3E8J"
              alt="TL-MK75 Tactician Main View"
              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
            />
          </div>
          <div className="absolute top-4 left-4">
            <span className="bg-primary/20 backdrop-blur-md text-primary px-3 py-1 text-xs font-mono tracking-widest uppercase border border-primary/30 rounded-lg">Technical Series / 01</span>
          </div>
        </div>
        <div className="grid grid-cols-4 gap-4">
          {thumbs.map((src, i) => (
            <div key={i} className="aspect-square bg-surface-container-high rounded-lg overflow-hidden border border-outline-variant/15 cursor-pointer hover:border-primary/50 transition-colors">
              <img src={src} alt={`Detail ${i + 1}`} className="w-full h-full object-cover" />
            </div>
          ))}
        </div>
      </section>

      {/* Product Info */}
      <section className="lg:col-span-5 space-y-8 sticky top-28">
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1 px-3 py-1 bg-green-500/10 text-green-400 text-[10px] font-bold uppercase tracking-widest rounded-full border border-green-500/20">
              <span className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse"></span>
              En Stock
            </span>
            <span className="text-on-surface-variant font-mono text-xs">SKU: TL-MK75-BLK</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-black font-headline tracking-tighter text-on-surface">
            TL-MK75 <span className="text-primary">Tactician</span>
          </h1>
          <div className="flex items-baseline gap-4">
            <span className="text-3xl font-mono font-medium text-primary">349.00€</span>
            <span className="text-on-surface-variant line-through text-sm">399.00€</span>
          </div>
          <p className="text-on-surface-variant leading-relaxed font-body max-w-lg">
            Diseñado para la precisión absoluta. El TL-MK75 combina una estética brutalista con una ingeniería acústica de vanguardia. Cada pulsación es una declaración de intenciones táctiles.
          </p>
        </div>

        {/* Specs */}
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

        {/* CTAs */}
        <div className="flex flex-col gap-4">
          <Link to="/checkout">
            <button className="group relative w-full h-14 bg-gradient-to-r from-primary-container to-[#8b6dc7] rounded-md font-headline font-bold uppercase tracking-widest text-white shadow-[0_0_20px_rgba(107,76,154,0.3)] hover:shadow-[0_0_30px_rgba(107,76,154,0.5)] transition-all active:scale-[0.98] overflow-hidden">
              <span className="relative z-10 flex items-center justify-center gap-2">
                Comprar
                <span className="material-symbols-outlined text-lg">shopping_bag</span>
              </span>
              <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity"></div>
            </button>
          </Link>
          <button className="w-full h-14 bg-surface-container-highest border border-outline-variant/20 rounded-md font-headline font-bold uppercase tracking-widest text-primary hover:bg-primary/10 transition-all flex items-center justify-center gap-2">
            Contactar por WhatsApp
            <span className="material-symbols-outlined text-lg">chat</span>
          </button>
        </div>

        {/* Kit-Spec Chips */}
        <div className="flex flex-wrap gap-2 pt-4">
          {chips.map((chip) => (
            <span key={chip} className="px-2 py-1 bg-surface-container-lowest border border-outline-variant/15 font-mono text-[10px] text-on-surface-variant uppercase">{chip}</span>
          ))}
        </div>
      </section>
    </div>

    {/* Engineering Section */}
    <section className="mt-32 grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
      <div className="order-2 md:order-1 space-y-6">
        <h2 className="text-3xl font-headline font-black tracking-tight leading-none uppercase">
          El Corazón de la <br /><span className="text-primary">Estructura</span>
        </h2>
        <p className="text-on-surface-variant font-body text-lg leading-relaxed">
          Nuestra placa de circuito impreso (PCB) no es solo una pieza de hardware; es una obra de arte técnica. Con sockets hotswap de Kailh y soporte completo para QMK, la personalización está en el ADN de cada unidad.
        </p>
        <div className="pt-4">
          <a className="inline-flex items-center gap-2 text-primary font-mono text-sm group" href="#">
            EXPLORAR INGENIERÍA
            <span className="material-symbols-outlined group-hover:translate-x-1 transition-transform">arrow_forward</span>
          </a>
        </div>
      </div>
      <div className="order-1 md:order-2 relative">
        <div className="absolute -top-12 -right-12 w-64 h-64 bg-primary/5 rounded-full blur-3xl"></div>
        <div className="aspect-square bg-surface-container-low rounded-2xl rotate-3 scale-95 border border-outline-variant/20 overflow-hidden shadow-2xl">
          <img
            src="https://lh3.googleusercontent.com/aida-public/AB6AXuCN5ete1Hcbwi3n2ruzzsKP1eQNI14gXxKf7U7MoIlC0nCzpIcbi-ETiveNYY-iWxeCiWHa--O2rZaVtP7V7zvzMxQODnw7Qz_DTSUV6dQ7RKaHk59IcILYMgZ4uw0C5uzUsB3TWDSUXecKhS0Oyyl5p1AO4NW3h6zIg__dwyD-CueWUulX9h5gOEFicuPpvjiwU4RZG_R1BXw55Hl_5Vl0y_VKPviq8fY77xDZBUPu_nh0FWpGkOrAWRm3VHS9Up5LYIIhzkBHQ0"
            alt="Hardware Engineering"
            className="w-full h-full object-cover grayscale hover:grayscale-0 transition-all duration-1000"
          />
        </div>
        <div className="absolute -bottom-8 -left-8 aspect-video w-64 bg-surface-container-high border border-outline-variant/30 rounded-lg p-6 flex flex-col justify-between shadow-xl -rotate-2">
          <span className="text-primary font-mono text-xs">Latencia de Entrada</span>
          <div className="text-3xl font-headline font-bold">0.125<span className="text-sm font-normal text-on-surface-variant ml-1 uppercase">ms</span></div>
          <div className="w-full bg-surface-variant h-1 rounded-full overflow-hidden">
            <div className="w-4/5 h-full bg-primary"></div>
          </div>
        </div>
      </div>
    </section>

    {/* Footer */}
    <footer className="mt-32 w-full py-12 border-t border-primary/10">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
        <div className="space-y-4">
          <div className="text-primary font-headline font-bold text-xl uppercase">Trebor Labs</div>
          <p className="font-body text-sm text-gray-400 leading-relaxed">© 2026 Trebor Labs. Technical Hardware Editorial.</p>
        </div>
        {[
          { title: 'Productos', links: ['Teclados Custom', 'Kits Raspberry Pi', 'Switch Testers', 'Hardware Accs'] },
          { title: 'Empresa', links: ['Privacy', 'Terms', 'Shipping', 'Returns'] },
        ].map(({ title, links }) => (
          <div key={title} className="space-y-4">
            <h4 className="text-white font-headline text-sm font-bold uppercase tracking-widest">{title}</h4>
            <ul className="space-y-2 font-body text-sm text-gray-400">
              {links.map((l) => <li key={l}><a className="hover:text-primary transition-colors opacity-80 hover:opacity-100" href="#">{l}</a></li>)}
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

export default ProductDetail;
