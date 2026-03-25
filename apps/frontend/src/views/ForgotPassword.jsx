import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ForgotPassword = () => {
  const { API } = useAuth();
  const [email, setEmail] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [done, setDone] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      const res = await fetch(`${API}/api/auth/forgot-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Error al enviar el correo');
        return;
      }
      setDone(true);
    } catch {
      setError('Error de conexión. Intenta de nuevo.');
    } finally {
      setSubmitting(false);
    }
  };

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
          <h1 className="font-headline text-3xl font-black tracking-tighter text-on-surface">Recuperar contraseña</h1>
          <p className="text-on-surface-variant text-sm">Te enviaremos un enlace para restablecerla.</p>
        </div>

        {done ? (
          <div className="space-y-6">
            <div className="bg-green-500/10 border border-green-500/30 rounded-xl p-6 text-center space-y-3">
              <span className="material-symbols-outlined text-green-400 text-4xl">mark_email_read</span>
              <h2 className="font-headline font-bold text-lg">Revisa tu correo</h2>
              <p className="text-sm text-on-surface-variant">
                Si existe una cuenta con ese correo, recibirás un enlace en los próximos minutos.
              </p>
            </div>
            <p className="text-center text-sm text-on-surface-variant">
              <Link to="/login" className="text-primary hover:underline">← Volver al login</Link>
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
            <button
              type="submit"
              disabled={submitting}
              className="w-full bg-primary hover:bg-primary/90 text-on-primary font-headline font-bold text-sm uppercase tracking-widest py-3.5 rounded-xl transition-all disabled:opacity-50"
            >
              {submitting ? 'Enviando...' : 'Enviar enlace'}
            </button>
            <p className="text-center text-sm text-on-surface-variant">
              <Link to="/login" className="text-primary hover:underline">← Volver al login</Link>
            </p>
          </form>
        )}
      </div>
    </main>
  );
};

export default ForgotPassword;
