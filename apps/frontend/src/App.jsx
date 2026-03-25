import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { CartProvider } from './context/CartContext';
import { AuthProvider } from './context/AuthContext';
import Navbar from './components/Navbar';
import Home from './views/Home';
import Checkout from './views/Checkout';
import AdminDashboard from './views/AdminDashboard';
import AdminOrders from './views/AdminOrders';
import AdminBlog from './views/AdminBlog';
import AdminSettings from './views/AdminSettings';
import ProductCatalog from './views/ProductCatalog';
import ProductDetail from './views/ProductDetail';
import Profile from './views/Profile';
import Blog from './views/Blog';
import Contact from './views/Contact';
import Login from './views/Login';
import AuthCallback from './views/AuthCallback';
import './index.css';

function AppContent() {
  const location = useLocation();
  const isAdmin = location.pathname.startsWith('/admin');
  // Ocultar Navbar también en login y callback
  const hideNav = isAdmin
    || location.pathname === '/login'
    || location.pathname === '/auth/callback';

  return (
    <div className="bg-surface text-on-surface font-body antialiased min-h-screen selection:bg-primary/30">
      {!hideNav && <Navbar />}
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/checkout" element={<Checkout />} />
        <Route path="/products" element={<ProductCatalog />} />
        <Route path="/products/:id" element={<ProductDetail />} />
        <Route path="/raspi" element={<ProductCatalog />} />
        <Route path="/blog" element={<Blog />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/login" element={<Login />} />
        <Route path="/auth/callback" element={<AuthCallback />} />
        <Route path="/admin" element={<AdminDashboard />} />
        <Route path="/admin/orders" element={<AdminOrders />} />
        <Route path="/admin/blog" element={<AdminBlog />} />
        <Route path="/admin-settings" element={<AdminSettings />} />
      </Routes>
    </div>
  );
}

function App() {
  return (
    <Router>
      <AuthProvider>
        <CartProvider>
          <AppContent />
        </CartProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;
