import { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Profile = () => {
  const { user, loading, logout, authFetch, API } = useAuth();
  const navigate = useNavigate();
  const [params] = useSearchParams();

  const [tab, setTab] = useState('profile');
  const [name, setName] = useState('');
  const [saving, setSaving] = useState(false);
  const [saveMsg, setSaveMsg] = useState('');

  // Security tab
  const [currentPw, setCurrentPw] = useState('');
  const [newPw, setNewPw] = useState('');
  const [confirmPw, setConfirmPw] = useState('');
  const [pwSubmitting, setPwSubmitting] = useState(false);
  const [pwMsg, setPwMsg] = useState({ type: '', text: '' });

  const msgParam = params.get('msg');
  const successMessages = {
    password_changed: '¡Contraseña actualizada correctamente!',
  };

  useEffect(() => {
    if (!loading && !user) navigate('/login', { replace: true });
    if (user) setName(user.name || '');
  }, [user, loading]);

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setSaving(true);
    setSaveMsg('');
    try {
      const res = await authFetch(`${API}/api/users/me`, {
        method: 'PATCH',
        body: JSON.stringify({ name }),
      });
      if (res.ok) {
        setSaveMsg('Perfil actualizado');
        setTimeout(() => setSaveMsg(''), 3000);
      }
    } catch {
      setSaveMsg('Error al guardar');
    } finally {
      setSaving(false);
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    setPwMsg({ type: '', text: '' });
    if (newPw.length < 8) {
      setPwMsg({ type: 'error', text: 'La nueva contraseña debe tener al menos 8 caracteres' });
      return;
    }
    if (newPw !== confirmPw) {
      setPwMsg({ type: 'error', text: 'Las contraseñas no coinciden' });
      return;
    }
    setPwSubmitting(true);
    try {
      const res = await authFetch(`${API}/api/auth/change-password`, {
        method: 'POST',
        body: JSON.stringify({ currentPassword: currentPw, newPassword: newPw }),
      });
      const data = await res.json();
      if (!res.ok) {
        setPwMsg({ type: 'error', text: data.error || 'Error al cambiar la contraseña' });
      } else {
        setPwMsg({ type: 'success', text: data.message || 'Revisa tu correo para confirmar el cambio' });
        setCurrentPw(''); setNewPw(''); setConfirmPw('');
      }
    } catch {
      setPwMsg({ type: 'error', text: 'Error de conexión. Intenta de nuevo.' });
    } finally {
      setPwSubmitting(false);
    }
  };

  const handleLogout = async () => {
    await logout();
    navigate('/login', { replace: true });
  };

  if (loading || !user) return null;

  const initials = (user.name || user.email || 'U').slice(0, 1).toUpperCase();

  const navItems = [
    { key: 'profile', icon: 'person', label: 'Mi Perfil' },
    { key: 'orders', icon: 'receipt_long', label: 'Pedidos' },
    { key: 'security', icon: 'security', label: 'Seguridad' },
  ];

  return (
    <main className="pt-32 pb-20 px-6 md:px-12 max-w-6xl mx-auto min-h-screen">
      {msgParam && successMessages[msgParam] && (
        <div className="mb-8 bg-green-500/10 border border-green-500/30 rounded-xl px-5 py-4 flex items-center gap-3">
          <span className="material-symbols-outlined text-green-400">check_circle</span>
          <p className="text-sm text-green-400">{successMessages[msgParam]}</p>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
        {/* Sidebar */}
        <aside className="lg:col-span-4 space-y-6">
          <div className="bg-surface-container-low rounded-xl p-8 text-center space-y-4 border border-outline-variant/10">
            <div className="relative mx-auto w-24 h-24">
              <div className="w-24 h-24 rounded-full bg-primary-container overflow-hidden">
                {user.avatar ? (
                  <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-primary-container to-secondary-container flex items-center justify-center">
                    <span className="text-3xl font-black text-white font-headline">{initials}</span>
                  </div>
                )}
              </div>
            </div>
            <div>
              <h2 className="font-headline font-bold text-xl tracking-tight">{user.name || 'Usuario'}</h2>
              <p className="text-on-surface-variant text-sm font-mono">{user.email}</p>
            </div>
            <div className="flex justify-center gap-2">
              <span className={`px-3 py-1 text-[10px] font-mono uppercase tracking-widest rounded-full border ${
                user.role === 'ADMIN'
                  ? 'bg-amber-500/20 text-amber-400 border-amber-500/30'
                  : 'bg-primary/20 text-primary border-primary/30'
              }`}>
                {user.role === 'ADMIN' ? 'Admin' : 'Tactician'}
              </span>
            </div>
          </div>

          <div className="bg-surface-container-low rounded-xl overflow-hidden border border-outline-variant/10">
            {navItems.map(({ key, icon, label }) => (
              <button
                key={key}
                onClick={() => setTab(key)}
                className={`w-full flex items-center gap-4 px-6 py-4 text-left transition-all border-b border-outline-variant/10 last:border-none ${
                  tab === key ? 'bg-primary/10 text-primary' : 'text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface'
                }`}
              >
                <span className="material-symbols-outlined text-sm">{icon}</span>
                <span className="text-sm font-medium">{label}</span>
                {tab === key && <span className="ml-auto material-symbols-outlined text-sm text-primary">chevron_right</span>}
              </button>
            ))}
            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-4 px-6 py-4 text-left transition-all text-error/70 hover:bg-error/10 hover:text-error"
            >
              <span className="material-symbols-outlined text-sm">logout</span>
              <span className="text-sm font-medium">Cerrar sesión</span>
            </button>
          </div>

          {user.role === 'ADMIN' && (
            <Link
              to="/admin"
              className="flex items-center justify-center gap-2 w-full bg-amber-500/10 border border-amber-500/30 text-amber-400 hover:bg-amber-500/20 px-4 py-3 rounded-xl font-mono text-xs uppercase tracking-widest transition-all"
            >
              <span className="material-symbols-outlined text-sm">admin_panel_settings</span>
              Panel de Admin
            </Link>
          )}
        </aside>

        {/* Content */}
        <div className="lg:col-span-8 space-y-8">
          {/* Profile tab */}
          {tab === 'profile' && (
            <section className="bg-surface-container-low rounded-xl p-8 border border-outline-variant/10">
              <div className="flex justify-between items-center mb-8">
                <div>
                  <h3 className="font-headline font-bold text-xl tracking-tight">Información Personal</h3>
                  <p className="text-xs text-on-surface-variant font-mono mt-1">Actualiza tu perfil</p>
                </div>
              </div>
              <form onSubmit={handleSaveProfile} className="space-y-5">
                <div>
                  <label className="block text-xs font-mono uppercase tracking-widest text-on-surface-variant mb-2">Nombre</label>
                  <input
                    type="text"
                    value={name}
                    onChange={e => setName(e.target.value)}
                    className="w-full bg-surface-container-highest border-none rounded-md px-4 py-3 text-sm text-on-surface focus:ring-1 focus:ring-primary/40 focus:outline-none transition-all"
                  />
                </div>
                <div>
                  <label className="block text-xs font-mono uppercase tracking-widest text-on-surface-variant mb-2">Email</label>
                  <input
                    type="text"
                    value={user.email}
                    readOnly
                    className="w-full bg-surface-container-highest/50 border-none rounded-md px-4 py-3 text-sm text-on-surface-variant cursor-not-allowed"
                  />
                </div>
                <div className="flex items-center gap-4">
                  <button
                    type="submit"
                    disabled={saving}
                    className="flex items-center gap-2 bg-primary-container text-on-primary-container px-5 py-2.5 rounded-lg font-headline font-bold text-xs uppercase tracking-widest hover:bg-primary hover:text-on-primary transition-all disabled:opacity-50"
                  >
                    <span className="material-symbols-outlined text-sm">save</span>
                    {saving ? 'Guardando...' : 'Guardar'}
                  </button>
                  {saveMsg && <span className="text-sm text-green-400">{saveMsg}</span>}
                </div>
              </form>
            </section>
          )}

          {/* Orders tab */}
          {tab === 'orders' && (
            <section className="bg-surface-container-low rounded-xl p-8 border border-outline-variant/10">
              <h3 className="font-headline font-bold text-xl tracking-tight mb-6">Historial de Pedidos</h3>
              <div className="text-center py-12 text-on-surface-variant">
                <span className="material-symbols-outlined text-5xl mb-3 block opacity-30">receipt_long</span>
                <p className="text-sm">No tienes pedidos aún.</p>
                <Link to="/products" className="text-primary hover:underline text-sm mt-2 inline-block">Ver productos</Link>
              </div>
            </section>
          )}

          {/* Security tab */}
          {tab === 'security' && (
            <section className="bg-surface-container-low rounded-xl p-8 border border-outline-variant/10 space-y-8">
              <div>
                <h3 className="font-headline font-bold text-xl tracking-tight">Seguridad</h3>
                <p className="text-xs text-on-surface-variant font-mono mt-1">Gestiona tu contraseña</p>
              </div>

              {user.password === undefined && !user.email ? null : (
                <form onSubmit={handleChangePassword} className="space-y-4">
                  <h4 className="font-headline font-bold text-sm uppercase tracking-widest text-on-surface-variant">Cambiar contraseña</h4>

                  {pwMsg.text && (
                    <div className={`rounded-lg px-4 py-3 flex items-start gap-3 ${
                      pwMsg.type === 'error' ? 'bg-error/10 border border-error/30' : 'bg-green-500/10 border border-green-500/30'
                    }`}>
                      <span className={`material-symbols-outlined text-sm mt-0.5 ${pwMsg.type === 'error' ? 'text-error' : 'text-green-400'}`}>
                        {pwMsg.type === 'error' ? 'error' : 'check_circle'}
                      </span>
                      <p className={`text-sm ${pwMsg.type === 'error' ? 'text-error' : 'text-green-400'}`}>{pwMsg.text}</p>
                    </div>
                  )}

                  <div>
                    <label className="block text-xs font-mono uppercase tracking-widest text-on-surface-variant mb-2">Contraseña actual</label>
                    <input
                      type="password"
                      required
                      value={currentPw}
                      onChange={e => setCurrentPw(e.target.value)}
                      className="w-full bg-surface-container-highest border-none rounded-md px-4 py-3 text-sm text-on-surface focus:ring-1 focus:ring-primary/40 focus:outline-none transition-all"
                      placeholder="••••••••"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-mono uppercase tracking-widest text-on-surface-variant mb-2">Nueva contraseña</label>
                    <input
                      type="password"
                      required
                      value={newPw}
                      onChange={e => setNewPw(e.target.value)}
                      className="w-full bg-surface-container-highest border-none rounded-md px-4 py-3 text-sm text-on-surface focus:ring-1 focus:ring-primary/40 focus:outline-none transition-all"
                      placeholder="Mínimo 8 caracteres"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-mono uppercase tracking-widest text-on-surface-variant mb-2">Confirmar contraseña</label>
                    <input
                      type="password"
                      required
                      value={confirmPw}
                      onChange={e => setConfirmPw(e.target.value)}
                      className="w-full bg-surface-container-highest border-none rounded-md px-4 py-3 text-sm text-on-surface focus:ring-1 focus:ring-primary/40 focus:outline-none transition-all"
                      placeholder="Repite la nueva contraseña"
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={pwSubmitting}
                    className="flex items-center gap-2 bg-primary-container text-on-primary-container px-5 py-2.5 rounded-lg font-headline font-bold text-xs uppercase tracking-widest hover:bg-primary hover:text-on-primary transition-all disabled:opacity-50"
                  >
                    <span className="material-symbols-outlined text-sm">lock_reset</span>
                    {pwSubmitting ? 'Procesando...' : 'Cambiar contraseña'}
                  </button>

                  <p className="text-xs text-on-surface-variant">
                    Se enviará un enlace de confirmación a tu correo para aplicar el cambio.
                  </p>
                </form>
              )}
            </section>
          )}
        </div>
      </div>

      <footer className="mt-20 pt-12 border-t border-primary/10">
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          <span className="text-primary font-headline font-bold text-lg uppercase tracking-widest">Trebor Labs</span>
          <p className="font-body text-sm text-gray-400">© 2026 Trebor Labs. Technical Hardware Editorial.</p>
          <div className="flex gap-6">
            {['Privacy', 'Terms', 'Support'].map((l) => (
              <a key={l} className="text-gray-500 hover:text-primary text-sm transition-colors" href="#">{l}</a>
            ))}
          </div>
        </div>
      </footer>
    </main>
  );
};

export default Profile;
