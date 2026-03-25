import { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const oauthErrors = {
  google_failed: 'Error al conectar con Google. Intenta de nuevo.',
  github_failed: 'Error al conectar con GitHub. Intenta de nuevo.',
  no_email: 'No se pudo obtener tu email de GitHub. Asegurate de tener un email público.',
};

const Login = () => {
  const { user, loading, loginWithToken, API } = useAuth();
  const navigate = useNavigate();
  const [params] = useSearchParams();

  const [tab, setTab] = useState('oauth'); // 'oauth' | 'email'
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(params.get('error') || '');
  const [success, setSuccess] = useState(params.get('msg') || '');

  useEffect(() => {
    if (!loading && user) navigate('/profile', { replace: true });
  }, [user, loading]);

  const handleOAuth = (provider) => {
    sessionStorage.setItem('returnTo', document.referrer.includes(window.location.origin)
      ? new URL(document.referrer).pathname
      : '/profile'
    );
    window.location.href = `${API}/auth/${provider}`;
  };

  const handleEmailLogin = async (e) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      const res = await fetch(`${API}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Error al iniciar sesión');
        return;
      }
      await loginWithToken(data.token);
      navigate('/profile', { replace: true });
    } catch {
      setError('Error de conexión. Intenta de nuevo.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return null;

  const oauthError = oauthErrors[error] || (tab === 'oauth' && error ? 'Ocurrió un error inesperado.' : '');

  return (
    <main className="min-h-screen bg-surface text-on-surface flex items-center justify-center px-4">
      <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary-container/15 rounded-full blur-[120px]"></div>
      </div>

      <div className="relative z-10 w-full max-w-sm space-y-8">
        {/* Logo */}
        <div className="text-center space-y-2">
          <Link to="/" className="inline-block">
            <img src="/logo.png" alt="Trebor Labs" className="w-12 h-12 object-contain mx-auto mb-3" />
          </Link>
          <h1 className="font-headline text-3xl font-black tracking-tighter text-on-surface">Bienvenido</h1>
          <p className="text-on-surface-variant text-sm">Inicia sesión para gestionar tus pedidos y builds.</p>
        </div>

        {/* Success */}
        {success && (
          <div className="bg-green-500/10 border border-green-500/30 rounded-lg px-4 py-3 flex items-start gap-3">
            <span className="material-symbols-outlined text-green-400 text-sm mt-0.5">check_circle</span>
            <p className="text-sm text-green-400">{success}</p>
          </div>
        )}

        {/* Tabs */}
        <div className="flex rounded-xl bg-surface-container-high p-1 gap-1">
          {[['oauth', 'OAuth'], ['email', 'Email']].map(([key, label]) => (
            <button
              key={key}
              onClick={() => { setTab(key); setError(''); }}
              className={`flex-1 py-2 rounded-lg font-headline font-bold text-xs uppercase tracking-widest transition-all ${
                tab === key ? 'bg-primary text-on-primary' : 'text-on-surface-variant hover:text-on-surface'
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        {/* Error shared */}
        {error && (oauthError || (tab === 'email' && error)) && (
          <div className="bg-error/10 border border-error/30 rounded-lg px-4 py-3 flex items-start gap-3">
            <span className="material-symbols-outlined text-error text-sm mt-0.5">error</span>
            <p className="text-sm text-error">{oauthError || error}</p>
          </div>
        )}

        {tab === 'oauth' ? (
          <div className="space-y-3">
            <button
              onClick={() => handleOAuth('google')}
              className="w-full flex items-center justify-center gap-4 px-6 py-4 bg-surface-container-high rounded-xl border border-outline-variant/20 hover:bg-surface-container-highest hover:border-primary/20 transition-all group"
            >
              <svg className="w-5 h-5 flex-shrink-0" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              <span className="font-headline font-bold text-sm text-on-surface group-hover:text-primary transition-colors">Continuar con Google</span>
            </button>

            <button
              onClick={() => handleOAuth('github')}
              className="w-full flex items-center justify-center gap-4 px-6 py-4 bg-surface-container-high rounded-xl border border-outline-variant/20 hover:bg-surface-container-highest hover:border-primary/20 transition-all group"
            >
              <svg className="w-5 h-5 flex-shrink-0 fill-on-surface" viewBox="0 0 24 24">
                <path d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"/>
              </svg>
              <span className="font-headline font-bold text-sm text-on-surface group-hover:text-primary transition-colors">Continuar con GitHub</span>
            </button>
          </div>
        ) : (
          <form onSubmit={handleEmailLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-mono uppercase tracking-widest text-on-surface-variant mb-2">Email</label>
              <input
                type="email"
                required
                value={email}
                onChange={e => setEmail(e.target.value)}
                className="w-full bg-surface-container-high border border-outline-variant/20 rounded-xl px-4 py-3 text-sm text-on-surface focus:ring-1 focus:ring-primary/40 focus:outline-none focus:border-primary/40 transition-all"
                placeholder="tu@email.com"
              />
            </div>
            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="block text-xs font-mono uppercase tracking-widest text-on-surface-variant">Contraseña</label>
                <Link to="/forgot-password" className="text-xs text-primary hover:underline">¿Olvidaste tu contraseña?</Link>
              </div>
              <input
                type="password"
                required
                value={password}
                onChange={e => setPassword(e.target.value)}
                className="w-full bg-surface-container-high border border-outline-variant/20 rounded-xl px-4 py-3 text-sm text-on-surface focus:ring-1 focus:ring-primary/40 focus:outline-none focus:border-primary/40 transition-all"
                placeholder="••••••••"
              />
            </div>
            <button
              type="submit"
              disabled={submitting}
              className="w-full bg-primary hover:bg-primary/90 text-on-primary font-headline font-bold text-sm uppercase tracking-widest py-3.5 rounded-xl transition-all disabled:opacity-50"
            >
              {submitting ? 'Iniciando...' : 'Iniciar Sesión'}
            </button>
            <p className="text-center text-sm text-on-surface-variant">
              ¿No tienes cuenta?{' '}
              <Link to="/register" className="text-primary hover:underline font-medium">Crear cuenta</Link>
            </p>
          </form>
        )}

        {/* Divider */}
        <div className="flex items-center gap-4">
          <div className="flex-1 h-px bg-outline-variant/20"></div>
          <span className="font-mono text-[10px] text-on-surface-variant tracking-widest uppercase">Seguro</span>
          <div className="flex-1 h-px bg-outline-variant/20"></div>
        </div>

        <p className="text-center">
          <Link to="/" className="font-mono text-xs text-on-surface-variant hover:text-primary transition-colors">
            ← Volver a la tienda
          </Link>
        </p>
      </div>
    </main>
  );
};

export default Login;
