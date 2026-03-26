import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import SpinWheel from './SpinWheel';

const API = import.meta.env.VITE_API_URL ?? '';

const Referral = () => {
  const { user, authFetch } = useAuth();
  const [data, setData]       = useState(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied]   = useState(false);
  const [showWheel, setShowWheel] = useState(false);
  const [spinning, setSpinning]   = useState(false);
  const [prize, setPrize]         = useState(null);

  useEffect(() => {
    if (!user) { setLoading(false); return; }
    authFetch(`${API}/api/referral/me`)
      .then(r => r.json())
      .then(d => setData(d))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [user]);

  const handleCopy = () => {
    const link = `${window.location.origin}/register?ref=${data?.referralCode}`;
    navigator.clipboard.writeText(link).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const handleSpin = async (result) => {
    setSpinning(true);
    try {
      const res = await authFetch(`${API}/api/referral/spin`, { method: 'POST' });
      const d = await res.json();
      if (res.ok) {
        setPrize(d.prize);
        setData(prev => ({ ...prev, spinsAvailable: Math.max(0, (prev?.spinsAvailable || 1) - 1) }));
      }
    } catch { } finally { setSpinning(false); }
  };

  if (!user) return (
    <main className="pt-32 pb-20 px-6 max-w-3xl mx-auto text-center min-h-screen">
      <span className="material-symbols-outlined text-5xl text-on-surface-variant/20 block mb-4">share</span>
      <h1 className="font-headline font-bold text-2xl mb-3">Inicia sesión para ver tu programa de referidos</h1>
    </main>
  );

  const referralLink = data?.referralCode ? `${window.location.origin}/register?ref=${data.referralCode}` : '';

  return (
    <main className="pt-32 pb-20 px-6 max-w-4xl mx-auto min-h-screen">
      <div className="mb-10">
        <p className="font-mono text-primary text-xs tracking-widest uppercase mb-2">Programa Trebor</p>
        <h1 className="font-headline font-black text-4xl tracking-tight mb-3">Refiere y Gana</h1>
        <p className="text-on-surface-variant max-w-xl">Comparte tu link, cuando alguien se registre y haga su primera compra, ambos ganan. Tú obtienes una ruleta para ganar descuentos exclusivos.</p>
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      ) : (
        <div className="space-y-8">
          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { label: 'Total Referidos', value: data?.totalReferrals ?? 0, icon: 'group_add', color: 'text-primary' },
              { label: 'Ruletas Usadas', value: data?.spinsUsed ?? 0, icon: 'casino', color: 'text-tertiary' },
              { label: 'Ruletas Disponibles', value: data?.spinsAvailable ?? 0, icon: 'stars', color: 'text-amber-400' },
            ].map(({ label, value, icon, color }) => (
              <div key={label} className="bg-surface-container-low rounded-xl border border-outline-variant/10 p-6 relative overflow-hidden">
                <span className={`material-symbols-outlined absolute top-4 right-4 text-4xl opacity-10 ${color}`}>{icon}</span>
                <p className="text-xs font-mono uppercase tracking-widest text-on-surface-variant mb-2">{label}</p>
                <p className={`text-4xl font-headline font-black ${color}`}>{value}</p>
              </div>
            ))}
          </div>

          {/* Link copy */}
          <div className="bg-surface-container-low rounded-xl border border-outline-variant/10 p-6 space-y-4">
            <h3 className="font-headline font-bold text-sm uppercase tracking-widest text-on-surface-variant">Tu Link de Referido</h3>
            <div className="flex items-center gap-3">
              <div className="flex-1 bg-surface-container-high rounded-lg px-4 py-3 font-mono text-sm text-on-surface-variant truncate">
                {referralLink || '—'}
              </div>
              <button
                onClick={handleCopy}
                className={`flex items-center gap-2 px-4 py-3 rounded-lg font-bold text-xs uppercase tracking-widest transition-all ${copied ? 'bg-green-500/10 text-green-400' : 'bg-primary-container text-on-primary-container hover:bg-primary hover:text-on-primary'}`}
              >
                <span className="material-symbols-outlined text-sm">{copied ? 'check' : 'content_copy'}</span>
                {copied ? 'Copiado' : 'Copiar'}
              </button>
            </div>
          </div>

          {/* Spin wheel */}
          {(data?.spinsAvailable ?? 0) > 0 && !prize && (
            <div className="bg-surface-container-low rounded-xl border border-primary/20 p-8 text-center space-y-6">
              <div>
                <span className="material-symbols-outlined text-4xl text-amber-400 mb-3 block" style={{ fontVariationSettings: "'FILL' 1" }}>stars</span>
                <h3 className="font-headline font-bold text-xl">¡Tienes {data.spinsAvailable} ruleta{data.spinsAvailable !== 1 ? 's' : ''} disponible{data.spinsAvailable !== 1 ? 's' : ''}!</h3>
                <p className="text-sm text-on-surface-variant mt-1">Gira para ganar un descuento exclusivo</p>
              </div>
              {showWheel ? (
                <SpinWheel onSpin={handleSpin} spinning={spinning} />
              ) : (
                <button
                  onClick={() => setShowWheel(true)}
                  className="inline-flex items-center gap-2 bg-amber-500/10 text-amber-400 border border-amber-500/30 px-8 py-4 rounded-xl font-headline font-bold text-sm uppercase tracking-widest hover:bg-amber-500/20 transition-all"
                >
                  <span className="material-symbols-outlined">casino</span>
                  Girar Ruleta
                </button>
              )}
            </div>
          )}

          {prize && (
            <div className="bg-green-500/5 border border-green-500/20 rounded-xl p-8 text-center space-y-3">
              <span className="material-symbols-outlined text-5xl text-green-400 block" style={{ fontVariationSettings: "'FILL' 1" }}>celebration</span>
              <h3 className="font-headline font-bold text-2xl text-green-400">¡Ganaste!</h3>
              <p className="text-on-surface-variant">{prize.label}</p>
              {prize.couponCode && (
                <div className="inline-flex items-center gap-2 bg-green-500/10 border border-green-500/30 px-6 py-3 rounded-lg">
                  <span className="font-mono font-bold text-lg text-green-400">{prize.couponCode}</span>
                  <button onClick={() => navigator.clipboard.writeText(prize.couponCode)}
                    className="text-green-400/60 hover:text-green-400 transition-colors">
                    <span className="material-symbols-outlined text-sm">content_copy</span>
                  </button>
                </div>
              )}
              <p className="text-xs text-on-surface-variant font-mono">Válido por 15 días · Aplica en tu próxima compra</p>
            </div>
          )}

          {/* How it works */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[
              { step: '01', title: 'Comparte tu link', desc: 'Envía tu link único a amigos y contactos.' },
              { step: '02', title: 'Ellos se registran', desc: 'Tu amigo se crea una cuenta con tu código.' },
              { step: '03', title: 'Ambos ganan', desc: 'Cuando hagan su primera compra, tú ganas una ruleta.' },
            ].map(({ step, title, desc }) => (
              <div key={step} className="bg-surface-container-low rounded-xl p-6 border border-outline-variant/10 space-y-2">
                <span className="font-mono text-4xl font-black text-primary/20">{step}</span>
                <h4 className="font-headline font-bold text-sm">{title}</h4>
                <p className="text-xs text-on-surface-variant">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </main>
  );
};

export default Referral;
