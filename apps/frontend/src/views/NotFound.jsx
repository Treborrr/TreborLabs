import { Link } from 'react-router-dom';
import SEOMeta from '../components/SEOMeta';

const NotFound = () => (
  <main className="min-h-screen flex flex-col items-center justify-center px-6 text-center">
    <SEOMeta title="404 — Página no encontrada" />
    <div className="space-y-6 max-w-md">
      <div className="font-mono text-[120px] font-black leading-none text-primary/10 select-none">404</div>
      <div className="space-y-2">
        <h1 className="font-headline font-black text-3xl tracking-tight">Página no encontrada</h1>
        <p className="text-on-surface-variant">La ruta que buscas no existe o fue movida.</p>
      </div>
      <div className="flex flex-col sm:flex-row gap-3 justify-center">
        <Link
          to="/"
          className="bg-primary-container text-on-primary-container font-headline font-bold px-6 py-3 rounded-lg text-xs uppercase tracking-widest hover:bg-primary hover:text-on-primary transition-all no-underline"
        >
          Ir al inicio
        </Link>
        <Link
          to="/products"
          className="border border-outline-variant/30 text-on-surface-variant font-headline font-bold px-6 py-3 rounded-lg text-xs uppercase tracking-widest hover:bg-surface-container-high transition-all no-underline"
        >
          Ver productos
        </Link>
      </div>
    </div>
  </main>
);

export default NotFound;
