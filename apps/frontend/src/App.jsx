import { lazy, Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { CartProvider } from './context/CartContext';
import { AuthProvider } from './context/AuthContext';
import { WishlistProvider } from './context/WishlistContext';
import ErrorBoundary from './components/ErrorBoundary';
import Navbar from './components/Navbar';
import AdminRoute from './components/AdminRoute';
import AdminLayout from './components/AdminLayout';
import Footer from './components/Footer';
import './index.css';

// ── Critical path (no lazy) ────────────────────────────────────────────────────
import Home from './views/Home';
import NotFound from './views/NotFound';

// ── B6.5 — Lazy-loaded views ────────────────────────────────────────────────────
const Checkout          = lazy(() => import('./views/Checkout'));
const ProductCatalog    = lazy(() => import('./views/ProductCatalog'));
const ProductDetail     = lazy(() => import('./views/ProductDetail'));
const Profile           = lazy(() => import('./views/Profile'));
const Blog              = lazy(() => import('./views/Blog'));
const BlogPost          = lazy(() => import('./views/BlogPost'));
const Contact           = lazy(() => import('./views/Contact'));
const Login             = lazy(() => import('./views/Login'));
const Register          = lazy(() => import('./views/Register'));
const ForgotPassword    = lazy(() => import('./views/ForgotPassword'));
const ResetPassword     = lazy(() => import('./views/ResetPassword'));
const AuthCallback      = lazy(() => import('./views/AuthCallback'));
const Wishlist          = lazy(() => import('./views/Wishlist'));
const Referral          = lazy(() => import('./views/Referral'));
const Notifications     = lazy(() => import('./views/Notifications'));
const OrderDetail       = lazy(() => import('./views/OrderDetail'));
const OrderConfirmation = lazy(() => import('./views/OrderConfirmation'));
const About             = lazy(() => import('./views/About'));
const FAQ               = lazy(() => import('./views/FAQ'));
const ShippingPolicy    = lazy(() => import('./views/ShippingPolicy'));
const ReturnsPolicy     = lazy(() => import('./views/ReturnsPolicy'));
const Terms             = lazy(() => import('./views/Terms'));
const Privacy           = lazy(() => import('./views/Privacy'));

// Admin views (lazy — only loaded when admin navigates)
const AdminDashboard    = lazy(() => import('./views/AdminDashboard'));
const AdminOrders       = lazy(() => import('./views/AdminOrders'));
const AdminOrderDetail  = lazy(() => import('./views/AdminOrderDetail'));
const AdminBlog         = lazy(() => import('./views/AdminBlog'));
const AdminBlogForm     = lazy(() => import('./views/AdminBlogForm'));
const AdminProducts     = lazy(() => import('./views/AdminProducts'));
const AdminProductForm  = lazy(() => import('./views/AdminProductForm'));
const AdminSettings     = lazy(() => import('./views/AdminSettings'));
const AdminShipping     = lazy(() => import('./views/AdminShipping'));
const AdminCoupons      = lazy(() => import('./views/AdminCoupons'));
const AdminComments     = lazy(() => import('./views/AdminComments'));
const AdminUsers        = lazy(() => import('./views/AdminUsers'));
const AdminUserDetail   = lazy(() => import('./views/AdminUserDetail'));
const AdminReturns      = lazy(() => import('./views/AdminReturns'));
const AdminLogs         = lazy(() => import('./views/AdminLogs'));
const AdminAnalytics    = lazy(() => import('./views/AdminAnalytics'));
const AdminSiteConfig   = lazy(() => import('./views/AdminSiteConfig'));
const AdminCategories   = lazy(() => import('./views/AdminCategories'));

// ── Suspense fallback ───────────────────────────────────────────────────────────
const PageLoader = () => (
  <div className="min-h-screen flex items-center justify-center bg-surface">
    <div className="flex flex-col items-center gap-4">
      <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      <span className="font-mono text-xs text-on-surface-variant/50 tracking-widest uppercase">Cargando…</span>
    </div>
  </div>
);

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
      <Suspense fallback={<PageLoader />}>
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
            <Route path="/admin/site-config" element={<AdminSiteConfig />} />
            <Route path="/admin/categories" element={<AdminCategories />} />
          </Route>

          <Route path="*" element={<NotFound />} />
        </Routes>
      </Suspense>
      {!hideFooter && <Footer />}
    </div>
  );
}

function App() {
  return (
    <Router>
      <ErrorBoundary>
        <AuthProvider>
          <CartProvider>
            <WishlistProvider>
              <AppContent />
            </WishlistProvider>
          </CartProvider>
        </AuthProvider>
      </ErrorBoundary>
    </Router>
  );
}

export default App;
