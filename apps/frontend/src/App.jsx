import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { CartProvider } from './context/CartContext';
import { AuthProvider } from './context/AuthContext';
import Navbar from './components/Navbar';
import AdminRoute from './components/AdminRoute';
import Home from './views/Home';
import Checkout from './views/Checkout';
import AdminDashboard from './views/AdminDashboard';
import AdminOrders from './views/AdminOrders';
import AdminBlog from './views/AdminBlog';
import AdminBlogForm from './views/AdminBlogForm';
import AdminProducts from './views/AdminProducts';
import AdminProductForm from './views/AdminProductForm';
import AdminSettings from './views/AdminSettings';
import ProductCatalog from './views/ProductCatalog';
import ProductDetail from './views/ProductDetail';
import Profile from './views/Profile';
import Blog from './views/Blog';
import Contact from './views/Contact';
import Login from './views/Login';
import Register from './views/Register';
import ForgotPassword from './views/ForgotPassword';
import ResetPassword from './views/ResetPassword';
import AuthCallback from './views/AuthCallback';
import './index.css';

function AppContent() {
  const location = useLocation();
  const isAdmin = location.pathname.startsWith('/admin');
  const hideNav = isAdmin
    || ['/login', '/register', '/forgot-password', '/auth/callback'].includes(location.pathname)
    || location.pathname.startsWith('/auth/reset-password');

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
        <Route path="/register" element={<Register />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/auth/reset-password" element={<ResetPassword />} />
        <Route path="/auth/callback" element={<AuthCallback />} />

        {/* Admin routes — require ADMIN role */}
        <Route path="/admin" element={<AdminRoute><AdminDashboard /></AdminRoute>} />
        <Route path="/admin/products" element={<AdminRoute><AdminProducts /></AdminRoute>} />
        <Route path="/admin/products/new" element={<AdminRoute><AdminProductForm /></AdminRoute>} />
        <Route path="/admin/products/:id/edit" element={<AdminRoute><AdminProductForm /></AdminRoute>} />
        <Route path="/admin/orders" element={<AdminRoute><AdminOrders /></AdminRoute>} />
        <Route path="/admin/blog" element={<AdminRoute><AdminBlog /></AdminRoute>} />
        <Route path="/admin/blog/new" element={<AdminRoute><AdminBlogForm /></AdminRoute>} />
        <Route path="/admin/blog/:id/edit" element={<AdminRoute><AdminBlogForm /></AdminRoute>} />
        <Route path="/admin-settings" element={<AdminRoute><AdminSettings /></AdminRoute>} />
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
