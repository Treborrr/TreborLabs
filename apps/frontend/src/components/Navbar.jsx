import { Link, useLocation } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';

const Navbar = () => {
  const location = useLocation();
  const { count } = useCart();
  const { user } = useAuth();

  const navLinks = [
    {
      label: 'Tienda',
      isDropdown: true,
      path: '/products',
      dropdownItems: [
        { path: '/products', label: 'Teclados Custom' },
        { path: '/raspi', label: 'Raspberry Pi' },
      ]
    },
    { path: '/blog', label: 'Blog' },
    { path: '/contact', label: 'Contacto' },
  ];

  return (
    <nav className="fixed top-0 w-full z-50 flex justify-between items-center px-8 h-20 bg-[#131315]/80 backdrop-blur-xl shadow-[0_20px_40px_rgba(107,76,154,0.08)]">
      {/* Logo */}
      <div className="flex items-center gap-4">
        <Link to="/" className="flex items-center gap-3 no-underline group">
          <div className="relative w-9 h-9 group-hover:scale-110 transition-transform duration-300 flex-shrink-0">
            <img
              src="/logo.png"
              alt="Trebor Labs"
              className="w-full h-full object-contain relative z-10"
            />
            <div className="logo-ring-base" aria-hidden="true" />
            <div className="logo-tracer-ring" aria-hidden="true" />
          </div>
          <span className="text-2xl font-black text-primary tracking-tighter font-headline">
            Trebor Labs
          </span>
        </Link>
      </div>

      {/* Nav Links */}
      <div className="hidden md:flex items-center gap-8">
        {navLinks.map((link) => {
          if (link.isDropdown) {
            const isActive = location.pathname.startsWith('/products') || location.pathname.startsWith('/raspi');
            return (
              <div key={link.label} className="relative group py-2">
                <div
                  className={`cursor-pointer font-headline font-bold tracking-tight text-sm uppercase transition-all duration-300 px-2 py-1 rounded no-underline flex items-center justify-center ${
                    isActive
                      ? 'text-primary border-b-2 border-primary pb-1'
                      : 'text-gray-400 group-hover:text-white group-hover:bg-primary/10'
                  }`}
                >
                  {link.label}
                  <span className="material-symbols-outlined text-[16px] overflow-hidden transition-all duration-300 opacity-0 w-0 -ml-2 group-hover:opacity-100 group-hover:w-4 group-hover:ml-1 group-hover:rotate-180">expand_more</span>
                </div>
                {/* Dropdown Menu */}
                <div className="absolute left-0 top-full pt-2 w-48 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 transform translate-y-2 group-hover:translate-y-0 z-50">
                  <div className="bg-[#131315]/95 backdrop-blur-md rounded-xl border border-primary/20 shadow-[0_10px_30px_rgba(107,76,154,0.15)] overflow-hidden py-2 font-headline">
                    {link.dropdownItems.map((item) => (
                      <Link
                        key={item.path}
                        to={item.path}
                        className="block px-4 py-2 text-sm font-bold text-gray-400 hover:text-primary hover:bg-primary/10 hover:pl-6 transition-all duration-300 no-underline"
                      >
                        {item.label}
                      </Link>
                    ))}
                  </div>
                </div>
              </div>
            );
          }

          const isActive = location.pathname === link.path;
          return (
            <Link
              key={link.path}
              to={link.path}
              className={`font-headline font-bold tracking-tight text-sm uppercase transition-all duration-300 px-2 py-1 rounded no-underline ${
                isActive
                  ? 'text-primary border-b-2 border-primary pb-1'
                  : 'text-gray-400 hover:text-white hover:bg-primary/10 hover:shadow-[0_0_15px_rgba(214,186,255,0.3)]'
              }`}
            >
              {link.label}
            </Link>
          );
        })}
      </div>

      {/* Right Icons */}
      <div className="flex items-center gap-6 text-primary">
        <button className="flex items-center gap-2 hover:text-white transition-colors">
          <span className="material-symbols-outlined">language</span>
          <span className="font-mono text-xs uppercase tracking-widest">ES</span>
        </button>
        <Link to="/checkout" className="relative text-primary hover:text-white transition-colors">
          <span className="material-symbols-outlined cursor-pointer hover:scale-110 transition-transform">shopping_cart</span>
          {count > 0 && (
            <span className="absolute -top-2 -right-2 w-4 h-4 bg-primary text-surface text-[9px] font-black rounded-full flex items-center justify-center leading-none">
              {count > 9 ? '9+' : count}
            </span>
          )}
        </Link>
        {user ? (
          <Link to="/profile" className="flex items-center gap-2 text-primary hover:text-white transition-colors group">
            {user.avatar ? (
              <img
                src={user.avatar}
                alt={user.name}
                className="w-7 h-7 rounded-full object-cover ring-1 ring-primary/40 group-hover:ring-primary transition-all"
              />
            ) : (
              <div className="w-7 h-7 rounded-full bg-primary-container flex items-center justify-center text-xs font-bold text-white">
                {user.name?.charAt(0).toUpperCase() || '?'}
              </div>
            )}
          </Link>
        ) : (
          <Link to="/login" className="text-primary hover:text-white transition-colors">
            <span className="material-symbols-outlined cursor-pointer hover:scale-110 transition-transform">person</span>
          </Link>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
