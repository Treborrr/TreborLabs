import { useState } from 'react';
import InfoTooltip from '../components/InfoTooltip';
import { SETTINGS_TOOLTIPS } from '../constants/adminTooltips';

const tabs = ['General', 'Payments', 'Shipping', 'Security', 'Integrations'];

const AdminSettings = () => {
  const [activeTab, setActiveTab] = useState('General');
  const [mpEnabled, setMpEnabled] = useState(true);
  const [stripeEnabled, setStripeEnabled] = useState(false);

  return (
    <main className="min-h-screen bg-surface-container-low flex flex-col w-full">
        <header className="h-20 px-10 flex items-center justify-between bg-surface/50 backdrop-blur-md sticky top-0 z-40">
          <div>
            <h2 className="font-headline font-bold text-2xl text-on-surface tracking-tight">System Settings</h2>
            <p className="text-xs font-mono text-on-surface-variant">/root/admin/config_v4</p>
          </div>
          <button className="flex items-center gap-2 bg-gradient-to-br from-primary to-primary-container text-on-primary px-5 py-2.5 rounded-md font-headline font-bold text-xs uppercase tracking-widest shadow-[0_0_15px_rgba(214,186,255,0.2)] hover:shadow-[0_0_25px_rgba(214,186,255,0.3)] transition-all active:scale-95">
            <span className="material-symbols-outlined text-sm">save</span>
            Save Changes
          </button>
        </header>

        <div className="p-10 space-y-8">
          {/* Tabs */}
          <div className="flex gap-1 p-1 bg-surface-container rounded-xl border border-outline-variant/15 w-fit">
            {tabs.map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-5 py-2.5 rounded-lg text-sm font-medium transition-all ${activeTab === tab ? 'bg-primary-container text-on-primary-container shadow-lg' : 'text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface'}`}
              >
                {tab}
              </button>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Settings */}
            <div className="lg:col-span-2 space-y-8">
              {/* Store Info */}
              <section className="bg-surface rounded-xl p-8 shadow-xl">
                <div className="flex items-center gap-3 mb-8">
                  <div className="w-10 h-10 bg-primary-container/20 rounded-lg flex items-center justify-center">
                    <span className="material-symbols-outlined text-primary">store</span>
                  </div>
                  <div>
                    <h3 className="font-headline font-bold text-lg">Store Information</h3>
                    <p className="text-xs text-on-surface-variant font-mono">Core identity settings</p>
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {[
                    { label: 'Store Name', placeholder: 'Trebor Labs', type: 'text', tip: SETTINGS_TOOLTIPS.storeName },
                    { label: 'Support Email', placeholder: 'support@treborlabs.io', type: 'email', tip: SETTINGS_TOOLTIPS.supportEmail },
                    { label: 'Store URL', placeholder: 'https://treborlabs.io', type: 'url', tip: SETTINGS_TOOLTIPS.storeUrl },
                    { label: 'Default Currency', placeholder: 'USD', type: 'text', tip: SETTINGS_TOOLTIPS.currency },
                  ].map(({ label, placeholder, type, tip }) => (
                    <div key={label}>
                      <label className="block text-xs font-mono uppercase tracking-widest text-on-surface-variant mb-2">{label}{tip && <InfoTooltip text={tip} />}</label>
                      <input
                        type={type}
                        defaultValue={placeholder}
                        className="w-full bg-surface-container-highest border-none rounded-md px-4 py-3 text-sm text-on-surface focus:ring-1 focus:ring-primary/40 focus:outline-none transition-all"
                      />
                    </div>
                  ))}
                </div>
              </section>

              {/* Payment Gateways */}
              <section className="bg-surface rounded-xl p-8 shadow-xl">
                <div className="flex items-center gap-3 mb-8">
                  <div className="w-10 h-10 bg-primary-container/20 rounded-lg flex items-center justify-center">
                    <span className="material-symbols-outlined text-primary">payments</span>
                  </div>
                  <div>
                    <h3 className="font-headline font-bold text-lg">Payment Gateways</h3>
                    <p className="text-xs text-on-surface-variant font-mono">Modular payment configuration</p>
                  </div>
                </div>
                <div className="space-y-4">
                  {/* Mercado Pago */}
                  <div className="p-6 bg-surface-container-low rounded-xl border border-primary/20">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-primary/20 rounded-lg flex items-center justify-center">
                          <span className="material-symbols-outlined text-primary">account_balance_wallet</span>
                        </div>
                        <div>
                          <h4 className="font-bold text-sm">Mercado Pago<InfoTooltip text={SETTINGS_TOOLTIPS.mercadoPago} /></h4>
                          <p className="text-xs text-on-surface-variant">Yape, Plin, Transferencia bancaria</p>
                        </div>
                      </div>
                      <button
                        onClick={() => setMpEnabled(!mpEnabled)}
                        className={`relative w-12 h-6 rounded-full transition-all ${mpEnabled ? 'bg-primary' : 'bg-surface-container-highest'}`}
                      >
                        <span className={`absolute top-1 w-4 h-4 rounded-full bg-white shadow transition-all ${mpEnabled ? 'left-7' : 'left-1'}`}></span>
                      </button>
                    </div>
                    {mpEnabled && (
                      <div className="space-y-3 pt-4 border-t border-outline-variant/20">
                        <div>
                          <label className="block text-xs font-mono uppercase tracking-widest text-on-surface-variant mb-2">Public Key<InfoTooltip text={SETTINGS_TOOLTIPS.mpPublicKey} /></label>
                          <input className="w-full bg-surface-container-highest border-none rounded-md px-4 py-3 text-sm font-mono text-on-surface-variant focus:ring-1 focus:ring-primary/40 focus:outline-none" placeholder="APP_USR-..." type="password" />
                        </div>
                        <div>
                          <label className="block text-xs font-mono uppercase tracking-widest text-on-surface-variant mb-2">Access Token<InfoTooltip text={SETTINGS_TOOLTIPS.mpAccessToken} /></label>
                          <input className="w-full bg-surface-container-highest border-none rounded-md px-4 py-3 text-sm font-mono text-on-surface-variant focus:ring-1 focus:ring-primary/40 focus:outline-none" placeholder="APP_USR-..." type="password" />
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Stripe */}
                  <div className="p-6 bg-surface-container-low rounded-xl border border-outline-variant/20 opacity-60">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-surface-container-highest rounded-lg flex items-center justify-center">
                          <span className="material-symbols-outlined text-outline">credit_card</span>
                        </div>
                        <div>
                          <h4 className="font-bold text-sm">Stripe</h4>
                          <p className="text-xs text-on-surface-variant">Global payments — Próximamente</p>
                        </div>
                      </div>
                      <span className="font-mono text-[10px] uppercase tracking-tighter bg-surface-container-highest px-3 py-1 rounded">Soon</span>
                    </div>
                  </div>
                </div>
              </section>
            </div>

            {/* Right Panel */}
            <div className="space-y-6">
              {/* System Status */}
              <div className="bg-surface rounded-xl p-6 shadow-xl">
                <h4 className="font-headline font-bold text-sm uppercase tracking-widest mb-6">System Status</h4>
                <div className="space-y-4">
                  {[
                    { label: 'API Server', status: 'Online', color: 'bg-green-400' },
                    { label: 'Database', status: 'Connected', color: 'bg-green-400' },
                    { label: 'Webhooks', status: 'Active', color: 'bg-green-400' },
                    { label: 'CDN', status: 'Operational', color: 'bg-green-400' },
                  ].map(({ label, status, color }) => (
                    <div key={label} className="flex items-center justify-between">
                      <span className="text-sm text-on-surface-variant">{label}</span>
                      <div className="flex items-center gap-2">
                        <span className={`w-2 h-2 rounded-full ${color} animate-pulse`}></span>
                        <span className="font-mono text-[10px] text-green-400">{status}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Build Info */}
              <div className="bg-surface-container-lowest rounded-xl p-6 border border-outline-variant/10">
                <h4 className="font-mono text-[10px] uppercase tracking-widest text-on-surface-variant mb-4">Build Info</h4>
                <div className="space-y-2 font-mono text-[10px] text-on-surface-variant">
                  <div className="flex justify-between"><span>Version</span><span className="text-primary">v1.0.0</span></div>
                  <div className="flex justify-between"><span>Environment</span><span className="text-tertiary">PRODUCTION</span></div>
                  <div className="flex justify-between"><span>Last Deploy</span><span>2026-03-25</span></div>
                </div>
              </div>
            </div>
          </div>
        </div>
    </main>
  );
};

export default AdminSettings;
