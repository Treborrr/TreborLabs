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

  // Orders tab
  const [orders, setOrders]         = useState([]);
  const [ordersLoading, setOrdersLoading] = useState(false);
  const [ordersFetched, setOrdersFetched] = useState(false);

  // Addresses tab
  const [addresses, setAddresses]           = useState([]);
  const [addrLoading, setAddrLoading]       = useState(false);
  const [addrFetched, setAddrFetched]       = useState(false);
  const [addrForm, setAddrForm]             = useState(null); // null=hidden, {}=new, {id,...}=edit
  const [addrSaving, setAddrSaving]         = useState(false);
  const [addrError, setAddrError]           = useState('');

  const emptyAddr = { label: '', fullName: '', phone: '', line1: '', line2: '', district: '', city: '', region: '', isDefault: false };

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

  useEffect(() => {
    if (tab !== 'orders' || ordersFetched) return;
    setOrdersLoading(true);
    authFetch(`${API}/api/users/me/orders`)
      .then(r => r.json())
      .then(data => setOrders(data.orders || []))
      .catch(() => {})
      .finally(() => { setOrdersLoading(false); setOrdersFetched(true); });
  }, [tab]);

  useEffect(() => {
    if (tab !== 'addresses' || addrFetched) return;
    setAddrLoading(true);
    authFetch(`${API}/api/users/me/addresses`)
      .then(r => r.json())
      .then(data => setAddresses(data.addresses || []))
      .catch(() => {})
      .finally(() => { setAddrLoading(false); setAddrFetched(true); });
  }, [tab]);

  const handleAddrSubmit = async (e) => {
    e.preventDefault();
    setAddrSaving(true);
    setAddrError('');
    const isNew = !addrForm.id;
    const url = isNew
      ? `${API}/api/users/me/addresses`
      : `${API}/api/users/me/addresses/${addrForm.id}`;
    try {
      const res = await authFetch(url, {
        method: isNew ? 'POST' : 'PATCH',
        body: JSON.stringify(addrForm),
      });
      const data = await res.json();
      if (!res.ok) { setAddrError(data.error || 'Error al guardar'); return; }
      if (isNew) {
        setAddresses(prev => [...prev, data.address]);
      } else {
        setAddresses(prev => prev.map(a => a.id === data.address.id ? data.address : a));
      }
      setAddrForm(null);
    } catch {
      setAddrError('Error de conexión');
    } finally {
      setAddrSaving(false);
    }
  };

  const handleAddrDelete = async (id) => {
    if (!window.confirm('¿Eliminar esta dirección?')) return;
    await authFetch(`${API}/api/users/me/addresses/${id}`, { method: 'DELETE' });
    setAddresses(prev => prev.filter(a => a.id !== id));
  };

  const handleAddrSetDefault = async (id) => {
    const res = await authFetch(`${API}/api/users/me/addresses/${id}/default`, { method: 'PATCH' });
    if (res.ok) {
      setAddresses(prev => prev.map(a => ({ ...a, isDefault: a.id === id })));
    }
  };

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
    { key: 'addresses', icon: 'location_on', label: 'Direcciones' },
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
              {ordersLoading ? (
                <div className="flex justify-center py-12">
                  <div className="w-7 h-7 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                </div>
              ) : orders.length === 0 ? (
                <div className="text-center py-12 text-on-surface-variant">
                  <span className="material-symbols-outlined text-5xl mb-3 block opacity-30">receipt_long</span>
                  <p className="text-sm">No tienes pedidos aún.</p>
                  <Link to="/products" className="text-primary hover:underline text-sm mt-2 inline-block">Ver productos</Link>
                </div>
              ) : (
                <div className="space-y-4">
                  {orders.map(order => {
                    const statusColors = {
                      pending:    'text-on-surface-variant bg-surface-container-highest',
                      processing: 'text-tertiary bg-tertiary/10',
                      shipped:    'text-blue-400 bg-blue-400/10',
                      delivered:  'text-green-400 bg-green-400/10',
                      cancelled:  'text-error bg-error/10',
                    };
                    const statusLabels = {
                      pending: 'Pendiente', processing: 'En proceso',
                      shipped: 'Enviado', delivered: 'Entregado', cancelled: 'Cancelado',
                    };
                    return (
                      <Link
                        key={order.id}
                        to={`/orders/${order.id}`}
                        className="no-underline flex items-center justify-between p-4 bg-surface rounded-lg border border-outline-variant/10 hover:border-primary/20 transition-colors"
                      >
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 bg-primary-container/20 rounded-lg flex items-center justify-center flex-shrink-0">
                            <span className="material-symbols-outlined text-primary text-sm">receipt</span>
                          </div>
                          <div>
                            <p className="font-mono text-sm font-bold text-primary">#{order.id.slice(-8).toUpperCase()}</p>
                            <p className="text-xs text-on-surface-variant mt-0.5">
                              {order.items?.length || 0} producto{order.items?.length !== 1 ? 's' : ''} ·{' '}
                              {new Date(order.createdAt).toLocaleDateString('es-PE', { day: 'numeric', month: 'short', year: 'numeric' })}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="font-mono font-bold text-sm text-on-surface">${Number(order.total).toFixed(2)}</span>
                          <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest ${statusColors[order.status] || ''}`}>
                            {statusLabels[order.status] || order.status}
                          </span>
                          <span className="material-symbols-outlined text-sm text-on-surface-variant/40">chevron_right</span>
                        </div>
                      </Link>
                    );
                  })}
                </div>
              )}
            </section>
          )}

          {/* Addresses tab */}
          {tab === 'addresses' && (
            <section className="bg-surface-container-low rounded-xl p-8 border border-outline-variant/10">
              <div className="flex justify-between items-center mb-6">
                <h3 className="font-headline font-bold text-xl tracking-tight">Mis Direcciones</h3>
                {!addrForm && (
                  <button
                    onClick={() => { setAddrForm({ ...emptyAddr }); setAddrError(''); }}
                    className="flex items-center gap-2 bg-primary-container text-on-primary-container px-4 py-2 rounded-lg font-headline font-bold text-xs uppercase tracking-widest hover:bg-primary hover:text-on-primary transition-all"
                  >
                    <span className="material-symbols-outlined text-sm">add</span>
                    Nueva
                  </button>
                )}
              </div>

              {addrLoading ? (
                <div className="flex justify-center py-12">
                  <div className="w-7 h-7 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                </div>
              ) : (
                <>
                  {/* Address list */}
                  {!addrForm && (
                    <div className="space-y-3">
                      {addresses.length === 0 ? (
                        <div className="text-center py-12 text-on-surface-variant">
                          <span className="material-symbols-outlined text-5xl mb-3 block opacity-30">location_off</span>
                          <p className="text-sm">No tienes direcciones guardadas.</p>
                        </div>
                      ) : addresses.map(addr => (
                        <div
                          key={addr.id}
                          className={`relative p-5 rounded-xl border transition-colors ${addr.isDefault ? 'border-primary/40 bg-primary/5' : 'border-outline-variant/15 bg-surface hover:border-outline-variant/30'}`}
                        >
                          <div className="flex items-start justify-between gap-4">
                            <div className="min-w-0">
                              <div className="flex items-center gap-2 mb-1">
                                <p className="font-bold text-sm text-on-surface">{addr.label}</p>
                                {addr.isDefault && (
                                  <span className="px-2 py-0.5 bg-primary/20 text-primary text-[10px] font-mono tracking-widest uppercase rounded-full border border-primary/30">
                                    Default
                                  </span>
                                )}
                              </div>
                              <p className="text-sm text-on-surface-variant">{addr.fullName} · {addr.phone}</p>
                              <p className="text-xs text-on-surface-variant/70 mt-1">
                                {addr.line1}{addr.line2 ? `, ${addr.line2}` : ''}, {addr.district}, {addr.city}, {addr.region}
                              </p>
                            </div>
                            <div className="flex items-center gap-1 flex-shrink-0">
                              {!addr.isDefault && (
                                <button
                                  onClick={() => handleAddrSetDefault(addr.id)}
                                  title="Usar como default"
                                  className="p-2 rounded-lg text-on-surface-variant hover:bg-primary/10 hover:text-primary transition-all"
                                >
                                  <span className="material-symbols-outlined text-sm">star</span>
                                </button>
                              )}
                              <button
                                onClick={() => { setAddrForm({ ...addr }); setAddrError(''); }}
                                className="p-2 rounded-lg text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface transition-all"
                              >
                                <span className="material-symbols-outlined text-sm">edit</span>
                              </button>
                              <button
                                onClick={() => handleAddrDelete(addr.id)}
                                className="p-2 rounded-lg text-on-surface-variant hover:bg-error/10 hover:text-error transition-all"
                              >
                                <span className="material-symbols-outlined text-sm">delete</span>
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Add / Edit form */}
                  {addrForm && (
                    <form onSubmit={handleAddrSubmit} className="space-y-4">
                      <h4 className="font-headline font-bold text-sm uppercase tracking-widest text-on-surface-variant mb-4">
                        {addrForm.id ? 'Editar Dirección' : 'Nueva Dirección'}
                      </h4>

                      {addrError && (
                        <div className="bg-error/10 border border-error/30 rounded-lg px-4 py-3 text-sm text-error">{addrError}</div>
                      )}

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {[
                          { field: 'label', label: 'Etiqueta', placeholder: 'Casa, Oficina…', full: false },
                          { field: 'fullName', label: 'Nombre completo', placeholder: 'Juan Pérez', full: false },
                          { field: 'phone', label: 'Teléfono', placeholder: '+51 999 999 999', full: false },
                          { field: 'line1', label: 'Dirección', placeholder: 'Jr. Flores 123', full: true },
                          { field: 'line2', label: 'Referencia (opcional)', placeholder: 'Piso 2, Dpto 301', full: true },
                          { field: 'district', label: 'Distrito', placeholder: 'Miraflores', full: false },
                          { field: 'city', label: 'Ciudad', placeholder: 'Lima', full: false },
                          { field: 'region', label: 'Región', placeholder: 'Lima Metropolitana', full: false },
                        ].map(({ field, label, placeholder, full }) => (
                          <div key={field} className={full ? 'md:col-span-2' : ''}>
                            <label className="block text-xs font-mono uppercase tracking-widest text-on-surface-variant mb-1.5">{label}</label>
                            <input
                              type="text"
                              value={addrForm[field] || ''}
                              onChange={e => setAddrForm(prev => ({ ...prev, [field]: e.target.value }))}
                              required={field !== 'line2'}
                              placeholder={placeholder}
                              className="w-full bg-surface-container-highest border-none rounded-md px-4 py-2.5 text-sm text-on-surface focus:ring-1 focus:ring-primary/40 focus:outline-none transition-all placeholder:text-on-surface-variant/40"
                            />
                          </div>
                        ))}
                      </div>

                      <label className="flex items-center gap-3 cursor-pointer mt-1">
                        <input
                          type="checkbox"
                          checked={!!addrForm.isDefault}
                          onChange={e => setAddrForm(prev => ({ ...prev, isDefault: e.target.checked }))}
                          className="w-4 h-4 accent-primary rounded"
                        />
                        <span className="text-sm text-on-surface-variant">Usar como dirección predeterminada</span>
                      </label>

                      <div className="flex items-center gap-3 pt-2">
                        <button
                          type="submit"
                          disabled={addrSaving}
                          className="flex items-center gap-2 bg-primary-container text-on-primary-container px-5 py-2.5 rounded-lg font-headline font-bold text-xs uppercase tracking-widest hover:bg-primary hover:text-on-primary transition-all disabled:opacity-50"
                        >
                          <span className="material-symbols-outlined text-sm">save</span>
                          {addrSaving ? 'Guardando…' : 'Guardar'}
                        </button>
                        <button
                          type="button"
                          onClick={() => { setAddrForm(null); setAddrError(''); }}
                          className="px-4 py-2.5 rounded-lg font-mono text-xs text-on-surface-variant hover:bg-surface-container-high transition-all"
                        >
                          Cancelar
                        </button>
                      </div>
                    </form>
                  )}
                </>
              )}
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

    </main>
  );
};

export default Profile;
