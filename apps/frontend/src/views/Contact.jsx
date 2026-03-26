import { useState } from 'react';
import { Link } from 'react-router-dom';
import SEOMeta from '../components/SEOMeta';

const Contact = () => {
  const [sent, setSent] = useState(false);
  const [form, setForm] = useState({ name: '', email: '', subject: '', message: '' });

  const handleSubmit = (e) => {
    e.preventDefault();
    setSent(true);
  };

  return (
    <main className="bg-surface text-on-surface">
      <SEOMeta title="Contacto" description="Contáctanos para soporte técnico, builds personalizados o consultas. Respondemos en menos de 24h." />
      {/* Hero */}

      <header className="relative pt-32 pb-20 px-8 overflow-hidden">
        <div className="absolute inset-0 z-0 opacity-30">
          <div className="absolute top-0 left-1/4 w-[600px] h-[600px] bg-primary-container/20 rounded-full blur-[120px]"></div>
        </div>
        <div className="relative z-10 max-w-4xl mx-auto text-center space-y-6">
          <div className="inline-flex items-center gap-3 px-3 py-1 border border-primary/40 bg-transparent rounded-sm">
            <span className="font-mono text-[10px] font-bold text-primary tracking-widest uppercase">SOPORTE_TÉCNICO</span>
          </div>
          <h1 className="font-headline text-6xl md:text-8xl font-black tracking-tighter text-on-surface">
            Hablemos.
          </h1>
          <p className="text-on-surface-variant text-lg max-w-xl mx-auto leading-relaxed">
            ¿Tienes una pregunta técnica, quieres un build personalizado o necesitas soporte? Estamos aquí.
          </p>
        </div>
      </header>

      {/* Main content */}
      <section className="pb-32 px-8">
        <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-5 gap-16">
          {/* Form */}
          <div className="lg:col-span-3">
            <div className="bg-surface-container-low rounded-xl p-10 border border-outline-variant/10">
              {sent ? (
                <div className="text-center py-16 space-y-6">
                  <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
                    <span className="material-symbols-outlined text-primary text-3xl">check_circle</span>
                  </div>
                  <h3 className="font-headline font-bold text-2xl">Mensaje enviado</h3>
                  <p className="text-on-surface-variant">Te respondemos en menos de 24h. Gracias por contactarnos.</p>
                  <button
                    onClick={() => { setSent(false); setForm({ name: '', email: '', subject: '', message: '' }); }}
                    className="px-6 py-3 border border-primary/30 rounded-md text-primary text-sm font-bold hover:bg-primary/10 transition-all"
                  >
                    Enviar otro mensaje
                  </button>
                </div>
              ) : (
                <>
                  <div className="mb-8">
                    <h2 className="font-headline font-bold text-2xl tracking-tight">Envíanos un mensaje</h2>
                    <p className="text-on-surface-variant text-sm mt-2 font-mono">Tiempo de respuesta promedio: &lt; 24h</p>
                  </div>
                  <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-xs font-mono uppercase tracking-widest text-on-surface-variant mb-2">Nombre</label>
                        <input
                          type="text"
                          required
                          value={form.name}
                          onChange={e => setForm(p => ({ ...p, name: e.target.value }))}
                          placeholder="Tu nombre"
                          className="w-full bg-surface-container-highest border-none rounded-md px-4 py-3 text-sm text-on-surface focus:ring-1 focus:ring-primary/40 focus:outline-none transition-all placeholder:text-on-surface-variant/40"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-mono uppercase tracking-widest text-on-surface-variant mb-2">Email</label>
                        <input
                          type="email"
                          required
                          value={form.email}
                          onChange={e => setForm(p => ({ ...p, email: e.target.value }))}
                          placeholder="tu@email.com"
                          className="w-full bg-surface-container-highest border-none rounded-md px-4 py-3 text-sm text-on-surface focus:ring-1 focus:ring-primary/40 focus:outline-none transition-all placeholder:text-on-surface-variant/40"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs font-mono uppercase tracking-widest text-on-surface-variant mb-2">Asunto</label>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mb-3">
                        {['Soporte', 'Custom Build', 'Pedido', 'Otro'].map((s) => (
                          <button
                            key={s}
                            type="button"
                            onClick={() => setForm(p => ({ ...p, subject: s }))}
                            className={`py-2 rounded-md text-xs font-bold transition-all ${form.subject === s ? 'bg-primary text-surface' : 'bg-surface-container-highest text-on-surface-variant hover:bg-surface-container-high'}`}
                          >
                            {s}
                          </button>
                        ))}
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs font-mono uppercase tracking-widest text-on-surface-variant mb-2">Mensaje</label>
                      <textarea
                        required
                        rows={6}
                        value={form.message}
                        onChange={e => setForm(p => ({ ...p, message: e.target.value }))}
                        placeholder="Describe tu consulta con el mayor detalle posible..."
                        className="w-full bg-surface-container-highest border-none rounded-md px-4 py-3 text-sm text-on-surface focus:ring-1 focus:ring-primary/40 focus:outline-none transition-all resize-none placeholder:text-on-surface-variant/40"
                      />
                    </div>
                    <button
                      type="submit"
                      className="w-full py-4 bg-gradient-to-br from-primary to-primary-container text-on-primary rounded-md font-headline font-bold uppercase tracking-widest shadow-[0_0_20px_rgba(214,186,255,0.2)] hover:shadow-[0_0_30px_rgba(214,186,255,0.3)] transition-all active:scale-95 flex items-center justify-center gap-3"
                    >
                      <span className="material-symbols-outlined text-sm">send</span>
                      Enviar Mensaje
                    </button>
                  </form>
                </>
              )}
            </div>
          </div>

          {/* Info panel */}
          <div className="lg:col-span-2 space-y-6">
            {[
              {
                icon: 'mail',
                title: 'Email',
                value: 'soporte@treborlabs.io',
                sub: 'Respuesta en menos de 24h',
              },
              {
                icon: 'phone_iphone',
                title: 'WhatsApp',
                value: '+51 999 888 777',
                sub: 'Lun – Vie, 9am – 6pm PET',
              },
              {
                icon: 'location_on',
                title: 'Ubicación',
                value: 'Lima, Perú',
                sub: 'Envíos a todo el país',
              },
            ].map(({ icon, title, value, sub }) => (
              <div key={title} className="bg-surface-container-low rounded-xl p-6 border border-outline-variant/10 flex items-start gap-5 hover:border-primary/20 transition-all group">
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0 group-hover:bg-primary/20 transition-all">
                  <span className="material-symbols-outlined text-primary">{icon}</span>
                </div>
                <div>
                  <p className="font-mono text-[10px] uppercase tracking-widest text-on-surface-variant mb-1">{title}</p>
                  <p className="font-headline font-bold text-sm text-on-surface">{value}</p>
                  <p className="text-xs text-on-surface-variant mt-1">{sub}</p>
                </div>
              </div>
            ))}

            {/* FAQ quick links */}
            <div className="bg-surface-container-low rounded-xl p-6 border border-outline-variant/10">
              <h3 className="font-headline font-bold text-sm uppercase tracking-widest mb-5 text-primary">Preguntas Frecuentes</h3>
              <div className="space-y-3">
                {[
                  '¿Cuánto tarda un build personalizado?',
                  '¿Hacen envíos internacionales?',
                  '¿Qué garantía tienen los productos?',
                  '¿Puedo probar los switches antes de comprar?',
                ].map((q) => (
                  <a key={q} href="#" className="flex items-start gap-3 group text-sm text-on-surface-variant hover:text-primary transition-colors">
                    <span className="material-symbols-outlined text-sm text-primary/50 mt-0.5 flex-shrink-0">chevron_right</span>
                    <span>{q}</span>
                  </a>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

    </main>
  );
};

export default Contact;
