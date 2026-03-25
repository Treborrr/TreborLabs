import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Register = () => {
  const { user, loading, API } = useAuth();
  const navigate = useNavigate();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [done, setDone] = useState(false);

  useEffect(() => {
    if (!loading && user) navigate('/profile', { replace: true });
  }, [user, loading]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (password.length < 8) {
      setError('La contraseña debe tener al menos 8 caracteres');
      return;
    }
    setSubmitting(true);
    try {
      const res = await fetch(`${API}/api/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Error al registrarse');
        return;
      }
      setDone(true);
    } catch {
      setError('Error de conexión. Intenta de nuevo.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return null;

  return (
    <main className="min-h-screen bg-surface text-on-surface flex items-center justify-center px-4">
      <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary-container/15 rounded-full blur-[120px]"></div>
      </div>

      <div className="relative z-10 w-full max-w-sm space-y-8">
        <div className="text-center space-y-2">
          <Link to="/" className="inline-block">
            <img src="/logo.png" alt="Trebor Labs" className="w-12 h-12 object-contain mx-auto mb-3" />
          </Link>
          <h1 className="font-headline text-3xl font-black tracking-tighter text-on-surface">Crear cuenta</h1>
          <p className="text-on-surface-variant text-sm">Únete a la comunidad de builders.</p>
        </div>

        {done ? (
          <div className="space-y-6">
            <div className="bg-green-500/10 border border-green-500/30 rounded-xl p-6 text-center space-y-3">
              <span className="material-symbols-outlined text-green-400 text-4xl">mark_email_read</span>
              <h2 className="font-headline font-bold text-lg">Revisa tu correo</h2>
              <p className="text-sm text-on-surface-variant">
                Enviamos un enlace de confirmación a <strong className="text-on-surface">{email}</strong>.
                Válido por 15 minutos.
              </p>
            </div>
            <p className="text-center text-sm text-on-surface-variant">
              ¿Ya confirmaste?{' '}
              <Link to="/login" className="text-primary hover:underline">Iniciar sesión</Link>
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="bg-error/10 border border-error/30 rounded-lg px-4 py-3 flex items-start gap-3">
                <span className="material-symbols-outlined text-error text-sm mt-0.5">error</span>
                <p className="text-sm text-error">{error}</p>
              </div>
            )}

            <div>
              <label className="block text-xs font-mono uppercase tracking-widest text-on-surface-variant mb-2">Nombre</label>
              <input
                type="text"
                required
                value={name}
                onChange={e => setName(e.target.value)}
                className="w-full bg-surface-container-high border border-outline-variant/20 rounded-xl px-4 py-3 text-sm text-on-surface focus:ring-1 focus:ring-primary/40 focus:outline-none focus:border-primary/40 transition-all"
                placeholder="Tu nombre"
              />
            </div>
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
              <label className="block text-xs font-mono uppercase tracking-widest text-on-surface-variant mb-2">Contraseña</label>
              <input
                type="password"
                required
                value={password}
                onChange={e => setPassword(e.target.value)}
                className="w-full bg-surface-container-high border border-outline-variant/20 rounded-xl px-4 py-3 text-sm text-on-surface focus:ring-1 focus:ring-primary/40 focus:outline-none focus:border-primary/40 transition-all"
                placeholder="Mínimo 8 caracteres"
              />
            </div>
            <button
              type="submit"
              disabled={submitting}
              className="w-full bg-primary hover:bg-primary/90 text-on-primary font-headline font-bold text-sm uppercase tracking-widest py-3.5 rounded-xl transition-all disabled:opacity-50"
            >
              {submitting ? 'Creando cuenta...' : 'Crear Cuenta'}
            </button>
            <p className="text-center text-sm text-on-surface-variant">
              ¿Ya tienes cuenta?{' '}
              <Link to="/login" className="text-primary hover:underline font-medium">Iniciar sesión</Link>
            </p>
          </form>
        )}

        <p className="text-center">
          <Link to="/" className="font-mono text-xs text-on-surface-variant hover:text-primary transition-colors">
            ← Volver a la tienda
          </Link>
        </p>
      </div>
    </main>
  );
};

export default Register;
