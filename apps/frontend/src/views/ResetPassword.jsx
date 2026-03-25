import { useState } from 'react';
import { Link, useSearchParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ResetPassword = () => {
  const { API } = useAuth();
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const token = params.get('token') || '';

  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [done, setDone] = useState(false);

  if (!token) {
    return (
      <main className="min-h-screen bg-surface text-on-surface flex items-center justify-center px-4">
        <div className="text-center space-y-4">
          <span className="material-symbols-outlined text-error text-5xl">link_off</span>
          <h1 className="font-headline font-bold text-xl">Enlace inválido</h1>
          <p className="text-on-surface-variant text-sm">Este enlace no es válido o ha expirado.</p>
          <Link to="/forgot-password" className="text-primary hover:underline text-sm">Solicitar nuevo enlace</Link>
        </div>
      </main>
    );
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (password.length < 8) {
      setError('La contraseña debe tener al menos 8 caracteres');
      return;
    }
    if (password !== confirm) {
      setError('Las contraseñas no coinciden');
      return;
    }
    setSubmitting(true);
    try {
      const res = await fetch(`${API}/api/auth/reset-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, newPassword: password }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Error al restablecer la contraseña');
        return;
      }
      setDone(true);
      setTimeout(() => navigate('/login', { replace: true }), 2000);
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
          <h1 className="font-headline text-3xl font-black tracking-tighter text-on-surface">Nueva contraseña</h1>
          <p className="text-on-surface-variant text-sm">Elige una contraseña segura de al menos 8 caracteres.</p>
        </div>

        {done ? (
          <div className="bg-green-500/10 border border-green-500/30 rounded-xl p-6 text-center space-y-2">
            <span className="material-symbols-outlined text-green-400 text-4xl">check_circle</span>
            <h2 className="font-headline font-bold text-lg">Contraseña actualizada</h2>
            <p className="text-sm text-on-surface-variant">Redirigiendo al login...</p>
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
              <label className="block text-xs font-mono uppercase tracking-widest text-on-surface-variant mb-2">Nueva contraseña</label>
              <input
                type="password"
                required
                value={password}
                onChange={e => setPassword(e.target.value)}
                className="w-full bg-surface-container-high border border-outline-variant/20 rounded-xl px-4 py-3 text-sm text-on-surface focus:ring-1 focus:ring-primary/40 focus:outline-none focus:border-primary/40 transition-all"
                placeholder="Mínimo 8 caracteres"
              />
            </div>
            <div>
              <label className="block text-xs font-mono uppercase tracking-widest text-on-surface-variant mb-2">Confirmar contraseña</label>
              <input
                type="password"
                required
                value={confirm}
                onChange={e => setConfirm(e.target.value)}
                className="w-full bg-surface-container-high border border-outline-variant/20 rounded-xl px-4 py-3 text-sm text-on-surface focus:ring-1 focus:ring-primary/40 focus:outline-none focus:border-primary/40 transition-all"
                placeholder="Repite la contraseña"
              />
            </div>
            <button
              type="submit"
              disabled={submitting}
              className="w-full bg-primary hover:bg-primary/90 text-on-primary font-headline font-bold text-sm uppercase tracking-widest py-3.5 rounded-xl transition-all disabled:opacity-50"
            >
              {submitting ? 'Guardando...' : 'Guardar contraseña'}
            </button>
          </form>
        )}
      </div>
    </main>
  );
};

export default ResetPassword;
