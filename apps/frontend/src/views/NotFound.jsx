import { Link } from 'react-router-dom';
import SEOMeta from '../components/SEOMeta';

const NotFound = () => {
  return (
    <main className="bg-surface text-on-surface min-h-screen flex items-center justify-center px-8">
      <SEOMeta
        title="404 — Página no encontrada · Trebor Labs"
        description="La página que buscas no existe o fue movida."
      />

      {/* Ambient blobs */}
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary/5 rounded-full blur-[100px]" />
        <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-secondary/5 rounded-full blur-[80px]" />
      </div>

      <div className="relative z-10 text-center max-w-lg">
        {/* Big 404 */}
        <div className="relative mb-8 select-none">
          <p className="text-[180px] font-black leading-none text-primary/5 absolute inset-0 flex items-center justify-center user-select-none pointer-events-none">404</p>
          <div className="relative z-10 flex flex-col items-center justify-center h-48">
            <span className="material-symbols-outlined text-7xl text-primary mb-4" style={{ fontVariationSettings: "'FILL' 0, 'wght' 200" }}>
              search_off
            </span>
            <span className="font-mono text-primary text-xs tracking-widest uppercase">Error 404</span>
          </div>
        </div>

        <h1 className="font-headline text-4xl md:text-5xl font-black tracking-tighter mb-4">
          Esta página <span className="text-primary italic">no existe.</span>
        </h1>
        <p className="text-on-surface-variant text-lg mb-10 leading-relaxed">
          El link que seguiste puede estar roto, o la página fue movida a una URL diferente.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            to="/"
            className="px-8 py-4 bg-primary-container text-on-primary-container rounded-md font-bold tracking-tight hover:shadow-[0_0_20px_rgba(107,76,154,0.4)] transition-all active:scale-95 no-underline"
          >
            Ir al Inicio
          </Link>
          <Link
            to="/products"
            className="px-8 py-4 bg-surface-container-highest text-on-surface rounded-md font-bold tracking-tight hover:bg-surface-container border border-outline/20 transition-all active:scale-95 no-underline"
          >
            Ver Productos
          </Link>
        </div>

        {/* Quick links */}
        <div className="mt-12 flex flex-wrap gap-3 justify-center">
          {[
            { to: '/blog', label: 'Blog' },
            { to: '/faq', label: 'FAQ' },
            { to: '/contact', label: 'Contacto' },
            { to: '/about', label: 'Nosotros' },
          ].map(link => (
            <Link
              key={link.to}
              to={link.to}
              className="text-xs font-mono text-on-surface-variant hover:text-primary transition-colors no-underline border border-outline/10 px-3 py-1.5 rounded-full hover:border-primary/30"
            >
              {link.label}
            </Link>
          ))}
        </div>
      </div>
    </main>
  );
};

export default NotFound;
