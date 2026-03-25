import { Link } from 'react-router-dom';

const orders = [
  { id: '#TL-2941', product: 'Trebor Split v1', date: 'Mar 20, 2026', status: 'Shipped', price: '$299.00', statusColor: 'text-green-400 bg-green-400/10' },
  { id: '#TL-2890', product: 'Tactician TKL-87', date: 'Feb 14, 2026', status: 'Delivered', price: '$185.00', statusColor: 'text-primary bg-primary/10' },
  { id: '#TL-2812', product: 'Aviator Coiled Cable', date: 'Jan 05, 2026', status: 'Delivered', price: '$45.00', statusColor: 'text-primary bg-primary/10' },
];

const Profile = () => (
  <main className="pt-32 pb-20 px-6 md:px-12 max-w-6xl mx-auto min-h-screen">
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
      {/* Left: Profile Card */}
      <aside className="lg:col-span-4 space-y-6">
        {/* Avatar & Info */}
        <div className="bg-surface-container-low rounded-xl p-8 text-center space-y-4 border border-outline-variant/10">
          <div className="relative mx-auto w-24 h-24">
            <div className="w-24 h-24 rounded-full bg-primary-container overflow-hidden">
              <div className="w-full h-full bg-gradient-to-br from-primary-container to-secondary-container flex items-center justify-center">
                <span className="text-3xl font-black text-white font-headline">R</span>
              </div>
            </div>
            <button className="absolute bottom-0 right-0 w-8 h-8 bg-primary-container rounded-full flex items-center justify-center hover:bg-primary transition-colors">
              <span className="material-symbols-outlined text-white text-sm">edit</span>
            </button>
          </div>
          <div>
            <h2 className="font-headline font-bold text-xl tracking-tight">Robert Alvarado</h2>
            <p className="text-on-surface-variant text-sm font-mono">robert@treborlabs.io</p>
          </div>
          <div className="flex justify-center gap-2">
            <span className="px-3 py-1 bg-primary/20 text-primary text-[10px] font-mono uppercase tracking-widest rounded-full border border-primary/30">Tactician Pro</span>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="bg-surface-container-low rounded-xl p-6 border border-outline-variant/10">
          <h3 className="font-mono text-[10px] uppercase tracking-widest text-on-surface-variant mb-6">Activity</h3>
          <div className="grid grid-cols-3 gap-4 text-center">
            {[
              { value: '3', label: 'Orders' },
              { value: '$529', label: 'Spent' },
              { value: '2', label: 'Builds' },
            ].map(({ value, label }) => (
              <div key={label}>
                <p className="text-2xl font-headline font-black text-primary">{value}</p>
                <p className="text-[10px] font-mono text-on-surface-variant uppercase tracking-widest mt-1">{label}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Navigation */}
        <div className="bg-surface-container-low rounded-xl overflow-hidden border border-outline-variant/10">
          {[
            { icon: 'person', label: 'My Profile', active: true },
            { icon: 'receipt_long', label: 'Orders' },
            { icon: 'notifications', label: 'Notifications' },
            { icon: 'security', label: 'Security' },
          ].map(({ icon, label, active }) => (
            <button
              key={label}
              className={`w-full flex items-center gap-4 px-6 py-4 text-left transition-all border-b border-outline-variant/10 last:border-none ${
                active ? 'bg-primary/10 text-primary' : 'text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface'
              }`}
            >
              <span className="material-symbols-outlined text-sm">{icon}</span>
              <span className="text-sm font-medium">{label}</span>
              {active && <span className="ml-auto material-symbols-outlined text-sm text-primary">chevron_right</span>}
            </button>
          ))}
        </div>
      </aside>

      {/* Right: Content */}
      <div className="lg:col-span-8 space-y-8">
        {/* Personal Info */}
        <section className="bg-surface-container-low rounded-xl p-8 border border-outline-variant/10">
          <div className="flex justify-between items-center mb-8">
            <div>
              <h3 className="font-headline font-bold text-xl tracking-tight">Personal Information</h3>
              <p className="text-xs text-on-surface-variant font-mono mt-1">Update your profile details</p>
            </div>
            <button className="flex items-center gap-2 bg-primary-container text-on-primary-container px-4 py-2 rounded-md font-headline font-bold text-xs uppercase tracking-widest hover:bg-primary transition-all">
              <span className="material-symbols-outlined text-sm">save</span>
              Save
            </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[
              { label: 'First Name', value: 'Robert' },
              { label: 'Last Name', value: 'Alvarado' },
              { label: 'Email', value: 'robert@treborlabs.io' },
              { label: 'Phone', value: '+51 999 000 000' },
            ].map(({ label, value }) => (
              <div key={label}>
                <label className="block text-xs font-mono uppercase tracking-widest text-on-surface-variant mb-2">{label}</label>
                <input
                  defaultValue={value}
                  className="w-full bg-surface-container-highest border-none rounded-md px-4 py-3 text-sm text-on-surface focus:ring-1 focus:ring-primary/40 focus:outline-none transition-all"
                  type="text"
                />
              </div>
            ))}
            <div className="col-span-1 md:col-span-2">
              <label className="block text-xs font-mono uppercase tracking-widest text-on-surface-variant mb-2">Address</label>
              <input
                defaultValue="Lima, Perú"
                className="w-full bg-surface-container-highest border-none rounded-md px-4 py-3 text-sm text-on-surface focus:ring-1 focus:ring-primary/40 focus:outline-none transition-all"
                type="text"
              />
            </div>
          </div>
        </section>

        {/* Order History */}
        <section className="bg-surface-container-low rounded-xl p-8 border border-outline-variant/10">
          <div className="flex justify-between items-center mb-8">
            <div>
              <h3 className="font-headline font-bold text-xl tracking-tight">Order History</h3>
              <p className="text-xs text-on-surface-variant font-mono mt-1">{orders.length} orders total</p>
            </div>
            <Link to="/products" className="text-primary font-mono text-xs tracking-widest hover:underline flex items-center gap-1 no-underline">
              SHOP MORE <span className="material-symbols-outlined text-sm">arrow_forward</span>
            </Link>
          </div>
          <div className="space-y-4">
            {orders.map((order) => (
              <div key={order.id} className="flex items-center justify-between p-5 bg-surface rounded-xl hover:bg-surface-container transition-colors group">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-primary-container/20 rounded-lg flex items-center justify-center">
                    <span className="material-symbols-outlined text-primary">keyboard</span>
                  </div>
                  <div>
                    <p className="font-headline font-bold text-sm group-hover:text-primary transition-colors">{order.product}</p>
                    <div className="flex items-center gap-3 mt-1">
                      <span className="font-mono text-[10px] text-primary">{order.id}</span>
                      <span className="text-[10px] text-on-surface-variant">{order.date}</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <span className="font-mono font-bold text-sm">{order.price}</span>
                  <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest ${order.statusColor}`}>{order.status}</span>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>

    {/* Footer */}
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

export default Profile;
