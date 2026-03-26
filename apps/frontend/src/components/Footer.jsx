import { Link } from 'react-router-dom';
import useSiteConfig from '../hooks/useSiteConfig';

const Footer = () => {
  const { config } = useSiteConfig();
  const tagline = config?.footer?.tagline ?? "Teclados custom & Raspberry Pi para makers y enthusiasts.";

  return (
  <footer className="bg-[#0e0e10] border-t border-outline-variant/10 mt-20 py-12 px-8">
    <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-8">
      {/* Brand */}
      <div className="md:col-span-1">
        <Link to="/" className="flex items-center gap-2 no-underline mb-3">
          <img src="/logo.png" alt="Trebor Labs" className="w-10 h-10 object-contain" />
          <span className="font-headline font-black text-primary tracking-tighter text-xl">Trebor Labs</span>
        </Link>
        <p className="text-xs text-on-surface-variant font-mono leading-relaxed">
          {tagline}
        </p>
      </div>

      {/* Tienda */}
      <div>
        <h4 className="font-mono text-[10px] uppercase tracking-widest text-on-surface-variant mb-3">Tienda</h4>
        <ul className="space-y-2">
          {[
            { to: '/products', label: 'Teclados Custom' },
            { to: '/raspi', label: 'Raspberry Pi' },
            { to: '/blog', label: 'Blog' },
            { to: '/about', label: 'Nosotros' },
            { to: '/faq', label: 'FAQ' },
          ].map(({ to, label }) => (
            <li key={to}>
              <Link to={to} className="text-xs text-on-surface-variant hover:text-primary transition-colors no-underline font-mono">
                {label}
              </Link>
            </li>
          ))}
        </ul>
      </div>

      {/* Soporte */}
      <div>
        <h4 className="font-mono text-[10px] uppercase tracking-widest text-on-surface-variant mb-3">Soporte</h4>
        <ul className="space-y-2">
          {[
            { to: '/contact', label: 'Contacto' },
            { to: '/envios', label: 'Política de Envíos' },
            { to: '/devoluciones', label: 'Devoluciones' },
          ].map(({ to, label }) => (
            <li key={to}>
              <Link to={to} className="text-xs text-on-surface-variant hover:text-primary transition-colors no-underline font-mono">
                {label}
              </Link>
            </li>
          ))}
        </ul>
      </div>

      {/* Legal */}
      <div>
        <h4 className="font-mono text-[10px] uppercase tracking-widest text-on-surface-variant mb-3">Legal</h4>
        <ul className="space-y-2">
          {[
            { to: '/terminos', label: 'Términos de Uso' },
            { to: '/privacidad', label: 'Privacidad' },
          ].map(({ to, label }) => (
            <li key={to}>
              <Link to={to} className="text-xs text-on-surface-variant hover:text-primary transition-colors no-underline font-mono">
                {label}
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </div>

    <div className="max-w-6xl mx-auto mt-10 pt-6 border-t border-outline-variant/10 flex flex-col md:flex-row items-center justify-between gap-3">
      <p className="text-[11px] text-on-surface-variant font-mono">
        © {new Date().getFullYear()} Trebor Labs. Todos los derechos reservados.
      </p>
      <p className="text-[11px] text-on-surface-variant/40 font-mono">Lima, Perú 🇵🇪</p>
    </div>
  </footer>
  );
};

export default Footer;
