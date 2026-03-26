import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { CartProvider } from './context/CartContext';
import { AuthProvider } from './context/AuthContext';
import { WishlistProvider } from './context/WishlistContext';
import Navbar from './components/Navbar';
import AdminRoute from './components/AdminRoute';
import AdminLayout from './components/AdminLayout';
import Home from './views/Home';
import Checkout from './views/Checkout';
import AdminDashboard from './views/AdminDashboard';
import AdminOrders from './views/AdminOrders';
import AdminOrderDetail from './views/AdminOrderDetail';
import AdminBlog from './views/AdminBlog';
import AdminBlogForm from './views/AdminBlogForm';
import AdminProducts from './views/AdminProducts';
import AdminProductForm from './views/AdminProductForm';
import AdminSettings from './views/AdminSettings';
import AdminShipping from './views/AdminShipping';
import AdminCoupons from './views/AdminCoupons';
import AdminComments from './views/AdminComments';
import AdminUsers from './views/AdminUsers';
import AdminUserDetail from './views/AdminUserDetail';
import AdminReturns from './views/AdminReturns';
import AdminLogs from './views/AdminLogs';
import AdminAnalytics from './views/AdminAnalytics';
import OrderDetail from './views/OrderDetail';
import OrderConfirmation from './views/OrderConfirmation';
import ProductCatalog from './views/ProductCatalog';
import ProductDetail from './views/ProductDetail';
import Profile from './views/Profile';
import Blog from './views/Blog';
import BlogPost from './views/BlogPost';
import Contact from './views/Contact';
import Login from './views/Login';
import Register from './views/Register';
import ForgotPassword from './views/ForgotPassword';
import ResetPassword from './views/ResetPassword';
import AuthCallback from './views/AuthCallback';
import Wishlist from './views/Wishlist';
import Referral from './views/Referral';
import Notifications from './views/Notifications';
import About from './views/About';
import FAQ from './views/FAQ';
import ShippingPolicy from './views/ShippingPolicy';
import ReturnsPolicy from './views/ReturnsPolicy';
import Terms from './views/Terms';
import Privacy from './views/Privacy';
import NotFound from './views/NotFound';
import Footer from './components/Footer';
import './index.css';

function AppContent() {
  const location = useLocation();
  const isAdmin = location.pathname.startsWith('/admin');
  const hideNav = isAdmin
    || ['/login', '/register', '/forgot-password', '/auth/callback', '/checkout'].includes(location.pathname)
    || location.pathname.startsWith('/auth/reset-password')
    || location.pathname.endsWith('/confirmation');
  const hideFooter = isAdmin
    || ['/login', '/register', '/forgot-password', '/auth/callback', '/checkout'].includes(location.pathname)
    || location.pathname.startsWith('/auth/reset-password')
    || location.pathname.endsWith('/confirmation');

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
        <Route path="/blog/:slug" element={<BlogPost />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/orders/:id" element={<OrderDetail />} />
        <Route path="/orders/:id/confirmation" element={<OrderConfirmation />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/auth/reset-password" element={<ResetPassword />} />
        <Route path="/auth/callback" element={<AuthCallback />} />
        <Route path="/wishlist" element={<Wishlist />} />
        <Route path="/referral" element={<Referral />} />
        <Route path="/notifications" element={<Notifications />} />
        <Route path="/about" element={<About />} />
        <Route path="/faq" element={<FAQ />} />
        <Route path="/envios" element={<ShippingPolicy />} />
        <Route path="/devoluciones" element={<ReturnsPolicy />} />
        <Route path="/terminos" element={<Terms />} />
        <Route path="/privacidad" element={<Privacy />} />

        {/* Admin routes — AdminLayout renderiza el sidebar una sola vez (Outlet) */}
        <Route element={<AdminRoute><AdminLayout /></AdminRoute>}>
          <Route path="/admin" element={<AdminDashboard />} />
          <Route path="/admin/products" element={<AdminProducts />} />
          <Route path="/admin/products/new" element={<AdminProductForm />} />
          <Route path="/admin/products/:id/edit" element={<AdminProductForm />} />
          <Route path="/admin/orders" element={<AdminOrders />} />
          <Route path="/admin/orders/:id" element={<AdminOrderDetail />} />
          <Route path="/admin/blog" element={<AdminBlog />} />
          <Route path="/admin/blog/new" element={<AdminBlogForm />} />
          <Route path="/admin/blog/:id/edit" element={<AdminBlogForm />} />
          <Route path="/admin/comments" element={<AdminComments />} />
          <Route path="/admin/users" element={<AdminUsers />} />
          <Route path="/admin/users/:id" element={<AdminUserDetail />} />
          <Route path="/admin/returns" element={<AdminReturns />} />
          <Route path="/admin/logs" element={<AdminLogs />} />
          <Route path="/admin/analytics" element={<AdminAnalytics />} />
          <Route path="/admin/shipping" element={<AdminShipping />} />
          <Route path="/admin/coupons" element={<AdminCoupons />} />
          <Route path="/admin/settings" element={<AdminSettings />} />
        </Route>

        <Route path="*" element={<NotFound />} />
      </Routes>
      {!hideFooter && <Footer />}
    </div>
  );
}

function App() {
  return (
    <Router>
      <AuthProvider>
        <CartProvider>
          <WishlistProvider>
            <AppContent />
          </WishlistProvider>
        </CartProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;
