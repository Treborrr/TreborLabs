import { useState } from 'react';
import SEOMeta from '../components/SEOMeta';

const faqs = [
  {
    category: 'Envíos',
    items: [
      { q: '¿Cuánto tarda el envío?', a: 'Lima Metropolitana: 1-3 días hábiles. Provincias: 3-7 días hábiles. Recibirás un correo de confirmación con tracking.' },
      { q: '¿Hacen envíos a todo el Perú?', a: 'Sí, enviamos a todas las regiones del Perú. Los costos varían según la zona y se calculan al momento del checkout.' },
      { q: '¿El envío tiene seguro?', a: 'Todos los pedidos incluyen seguro básico de envío. Para productos de alto valor, contactamos al cliente para coordinar un seguro adicional.' },
    ],
  },
  {
    category: 'Pagos',
    items: [
      { q: '¿Qué métodos de pago aceptan?', a: 'Aceptamos tarjetas de débito/crédito VISA y Mastercard, y Yape/Plin a través de MercadoPago. Próximamente Stripe para tarjetas internacionales.' },
      { q: '¿Es seguro pagar en el sitio?', a: 'Sí. Usamos MercadoPago como pasarela de pago. Nunca almacenamos los datos de tu tarjeta en nuestros servidores.' },
      { q: '¿Puedo pagar en cuotas?', a: 'Sí, dependiendo del banco emisor de tu tarjeta y las opciones de MercadoPago. Las cuotas disponibles se muestran al momento del pago.' },
    ],
  },
  {
    category: 'Productos',
    items: [
      { q: '¿Los teclados vienen armados?', a: 'Ofrecemos modelos ya ensamblados listos para usar, y también kits para armar (hot-swap). En la descripción de cada producto se especifica el tipo.' },
      { q: '¿Puedo personalizar mi teclado?', a: 'Sí, a través de nuestro Custom Labs Program puedes elegir switches, keycaps, case y más. Contáctanos para solicitar un presupuesto.' },
      { q: '¿Las Raspberry Pi vienen con sistema operativo?', a: 'Algunos kits incluyen tarjeta SD con el SO preinstalado (se indica en la descripción). También ofrecemos kits "bare metal" sin SO.' },
    ],
  },
  {
    category: 'Garantía y Devoluciones',
    items: [
      { q: '¿Cuál es la garantía de los productos?', a: 'Todos nuestros productos tienen garantía de 6 meses por defectos de fábrica. Kits Raspberry Pi oficiales mantienen la garantía del fabricante.' },
      { q: '¿Cómo solicito una devolución?', a: 'Tienes 7 días desde la recepción para solicitar una devolución. El producto debe estar sin uso y en su empaque original. Accede a /devoluciones para más detalles.' },
      { q: '¿Hacen cambios por defecto de fábrica?', a: 'Sí. Si recibes un producto con defecto de fábrica, puedes solicitarlo dentro de los primeros 30 días. Cubrimos el costo del envío de vuelta.' },
    ],
  },
];

const FAQ = () => {
  const [openItem, setOpenItem] = useState(null);

  return (
    <main className="bg-surface text-on-surface min-h-screen">
      <SEOMeta
        title="Preguntas Frecuentes — Trebor Labs"
        description="Resolvemos tus dudas sobre envíos, pagos, garantías y productos Trebor Labs."
      />

      <section className="pt-40 pb-16 px-8">
        <div className="max-w-3xl mx-auto text-center">
          <p className="font-mono text-primary text-xs tracking-widest uppercase mb-4">Centro de Ayuda</p>
          <h1 className="font-headline text-5xl font-black tracking-tighter mb-6">Preguntas <span className="text-primary italic">Frecuentes</span></h1>
          <p className="text-on-surface-variant text-lg">Todo lo que necesitas saber antes de hacer tu compra.</p>
        </div>
      </section>

      <section className="pb-24 px-8">
        <div className="max-w-3xl mx-auto space-y-12">
          {faqs.map((group) => (
            <div key={group.category}>
              <h2 className="font-mono text-[10px] text-primary tracking-widest uppercase mb-6 flex items-center gap-2">
                <span className="flex-1 h-[1px] bg-primary/20" />
                {group.category}
                <span className="flex-1 h-[1px] bg-primary/20" />
              </h2>
              <div className="space-y-3">
                {group.items.map((item, idx) => {
                  const key = `${group.category}-${idx}`;
                  const isOpen = openItem === key;
                  return (
                    <div
                      key={key}
                      className={`rounded-xl border transition-all ${isOpen ? 'border-primary/30 bg-surface-container' : 'border-outline/10 bg-surface-container-low hover:border-outline/20'}`}
                    >
                      <button
                        onClick={() => setOpenItem(isOpen ? null : key)}
                        className="w-full flex justify-between items-center px-6 py-4 text-left gap-4"
                      >
                        <span className="font-medium text-on-surface">{item.q}</span>
                        <span className={`material-symbols-outlined text-primary flex-shrink-0 transition-transform ${isOpen ? 'rotate-45' : ''}`}>add</span>
                      </button>
                      {isOpen && (
                        <div className="px-6 pb-5">
                          <p className="text-on-surface-variant text-sm leading-relaxed">{item.a}</p>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        {/* Contact CTA */}
        <div className="max-w-3xl mx-auto mt-16 bg-primary-container/10 rounded-2xl p-8 text-center border border-primary/10">
          <span className="material-symbols-outlined text-primary text-4xl block mb-4">support_agent</span>
          <h2 className="font-headline font-bold text-xl mb-2">¿No encontraste tu respuesta?</h2>
          <p className="text-on-surface-variant text-sm mb-6">Escríbenos directamente y te respondemos en menos de 24 horas.</p>
          <a href="/contact" className="inline-block px-6 py-3 bg-primary text-on-primary rounded-md font-bold text-sm hover:opacity-90 transition-opacity no-underline">
            Contactar Soporte
          </a>
        </div>
      </section>
    </main>
  );
};

export default FAQ;
