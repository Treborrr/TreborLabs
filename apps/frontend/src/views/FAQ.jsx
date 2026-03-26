import { useState } from 'react';
import SEOMeta from '../components/SEOMeta';

const FAQS = [
  {
    section: 'Pedidos y Envíos',
    items: [
      { q: '¿Cuánto tarda el envío?', a: 'Lima Metropolitana: 1–2 días hábiles. Provincias: 3–5 días hábiles. Los kits Raspberry Pi suelen tener stock inmediato; los teclados custom pueden tener hasta 5 días de preparación.' },
      { q: '¿Realizan envíos internacionales?', a: 'Por el momento solo operamos dentro de Perú. Estamos trabajando para habilitar envíos a Colombia, Chile y México próximamente.' },
      { q: '¿Puedo rastrear mi pedido?', a: 'Sí. Una vez que tu pedido pase a estado "Enviado" recibirás un email con el número de tracking y la empresa de mensajería.' },
    ],
  },
  {
    section: 'Productos',
    items: [
      { q: '¿Los teclados son hot-swap?', a: 'La mayoría de nuestros modelos cuenta con PCB hot-swap de 5 pines. Puedes verificarlo en la ficha técnica de cada producto.' },
      { q: '¿Qué diferencia hay entre los kits Raspberry Pi?', a: 'Ofrecemos kits básicos (placa + fuente + tarjeta SD) y kits completos (placa + case + fuente + tarjeta SD + accesorios según el uso: NAS, AI, retro-gaming, etc.).' },
      { q: '¿Puedo pedir un build personalizado?', a: 'Sí. Escríbenos por el formulario de contacto o WhatsApp y uno de nuestros técnicos te asesorará en la configuración ideal.' },
    ],
  },
  {
    section: 'Pagos',
    items: [
      { q: '¿Qué métodos de pago aceptan?', a: 'Aceptamos tarjetas de crédito/débito Visa, Mastercard, American Express, así como Yape y Plin a través de MercadoPago.' },
      { q: '¿El pago es seguro?', a: 'Todos los pagos se procesan mediante MercadoPago con cifrado SSL. Trebor Labs no almacena datos de tarjeta.' },
    ],
  },
  {
    section: 'Devoluciones',
    items: [
      { q: '¿Cuál es la política de devoluciones?', a: 'Aceptamos devoluciones dentro de los 5 días hábiles posteriores a la entrega, siempre que el producto esté en su estado original y con empaque completo.' },
      { q: '¿Cómo solicito una devolución?', a: 'Desde tu cuenta, en "Mis Pedidos", selecciona el pedido entregado y haz click en "Solicitar devolución". Recibirás instrucciones de recojo en 24h.' },
    ],
  },
];

const FAQ = () => {
  const [open, setOpen] = useState({});

  const toggle = (key) => setOpen(prev => ({ ...prev, [key]: !prev[key] }));

  return (
    <main className="pt-32 pb-20 px-6 max-w-3xl mx-auto min-h-screen">
      <SEOMeta title="Preguntas Frecuentes" description="Respuestas a las dudas más comunes sobre pedidos, envíos, productos y devoluciones en Trebor Labs." />

      <div className="mb-12 space-y-3">
        <p className="font-mono text-primary text-xs tracking-widest uppercase">Soporte</p>
        <h1 className="font-headline font-black text-4xl tracking-tight">Preguntas Frecuentes</h1>
        <p className="text-on-surface-variant">¿No encuentras tu respuesta? <a href="/contact" className="text-primary hover:underline">Contáctanos</a>.</p>
      </div>

      <div className="space-y-8">
        {FAQS.map(({ section, items }) => (
          <div key={section} className="space-y-2">
            <h2 className="font-headline font-bold text-xs uppercase tracking-widest text-primary border-b border-primary/20 pb-3 mb-4">{section}</h2>
            {items.map((item, i) => {
              const key = `${section}-${i}`;
              const isOpen = !!open[key];
              return (
                <div key={key} className={`rounded-xl border transition-colors overflow-hidden ${isOpen ? 'border-primary/30 bg-primary/5' : 'border-outline-variant/15 bg-surface-container-low hover:border-outline-variant/30'}`}>
                  <button
                    onClick={() => toggle(key)}
                    className="w-full flex items-center justify-between gap-4 px-6 py-4 text-left"
                  >
                    <span className="font-bold text-sm text-on-surface">{item.q}</span>
                    <span className={`material-symbols-outlined text-sm text-on-surface-variant flex-shrink-0 transition-transform ${isOpen ? 'rotate-180' : ''}`}>expand_more</span>
                  </button>
                  {isOpen && (
                    <div className="px-6 pb-5">
                      <p className="text-sm text-on-surface-variant leading-relaxed">{item.a}</p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        ))}
      </div>
    </main>
  );
};

export default FAQ;
