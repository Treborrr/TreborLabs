import { Link } from 'react-router-dom';
import SEOMeta from '../components/SEOMeta';

const sectionTitle = (text) => (
  <h2 className="font-headline text-2xl font-bold mb-4 text-on-surface border-b border-outline/10 pb-2">{text}</h2>
);

const ReturnsPolicy = () => {
  return (
    <main className="bg-surface text-on-surface min-h-screen">
      <SEOMeta
        title="Política de Devoluciones — Trebor Labs"
        description="Conoce las condiciones y el proceso para solicitar una devolución o cambio en Trebor Labs."
      />

      <section className="pt-40 pb-16 px-8">
        <div className="max-w-3xl mx-auto">
          <p className="font-mono text-primary text-xs tracking-widest uppercase mb-4">Post-compra</p>
          <h1 className="font-headline text-5xl font-black tracking-tighter mb-6">Política de <span className="text-primary italic">Devoluciones</span></h1>
          <p className="text-on-surface-variant">Última actualización: Marzo 2026</p>
        </div>
      </section>

      <section className="pb-24 px-8">
        <div className="max-w-3xl mx-auto space-y-10">

          {sectionTitle('Plazos para solicitar devolución')}
          <div className="grid md:grid-cols-2 gap-4">
            {[
              { icon: 'calendar_today', title: '7 días', desc: 'Para devoluciones por arrepentimiento (producto sin uso, en su empaque original).' },
              { icon: 'hardware', title: '30 días', desc: 'Para devoluciones por defecto de fábrica desde la fecha de recepción del producto.' },
            ].map(item => (
              <div key={item.title} className="bg-surface-container rounded-xl p-6 border border-outline/10 flex gap-4">
                <span className="material-symbols-outlined text-primary text-3xl">{item.icon}</span>
                <div>
                  <p className="font-bold text-primary text-xl mb-1">{item.title}</p>
                  <p className="text-sm text-on-surface-variant">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>

          {sectionTitle('Condiciones para la devolución')}
          <ul className="space-y-3 text-on-surface-variant">
            {[
              'El producto debe estar en su empaque original sin señales de uso (para devoluciones por arrepentimiento).',
              'Se debe adjuntar prueba de compra (número de orden).',
              'Los accesorios, manuales y todos los elementos incluidos deben estar presentes.',
              'Los productos personalizados (teclados a pedido) no aceptan devolución por arrepentimiento.',
              'Los switches sueltos y keycaps no son retornables por motivos de higiene.',
            ].map((item, idx) => (
              <li key={idx} className="flex items-start gap-3">
                <span className="material-symbols-outlined text-primary text-sm mt-0.5">check_circle</span>
                <span>{item}</span>
              </li>
            ))}
          </ul>

          {sectionTitle('Proceso de devolución')}
          <ol className="space-y-4">
            {[
              { step: '1', title: 'Inicia la solicitud', desc: 'Accede a tu perfil → Mis Órdenes → selecciona la orden → "Solicitar devolución". Describe el motivo e incluye fotos si hay defecto.' },
              { step: '2', title: 'Revisión (1–2 días hábiles)', desc: 'Nuestro equipo revisará tu solicitud y te contactará por correo para aprobarla o pedirte información adicional.' },
              { step: '3', title: 'Envío de regreso', desc: 'Si la devolución es aprobada: para defectos de fábrica cubrimos el costo de envío. Para arrepentimiento, el costo está a cargo del cliente.' },
              { step: '4', title: 'Reembolso o cambio', desc: 'Al recibir el producto, procesaremos el reembolso o envío de reemplazo en un plazo de 3–5 días hábiles.' },
            ].map(item => (
              <li key={item.step} className="flex gap-5 items-start">
                <div className="w-8 h-8 rounded-full bg-primary text-on-primary flex items-center justify-center font-bold flex-shrink-0 text-sm">{item.step}</div>
                <div>
                  <p className="font-bold text-on-surface mb-1">{item.title}</p>
                  <p className="text-sm text-on-surface-variant">{item.desc}</p>
                </div>
              </li>
            ))}
          </ol>

          {sectionTitle('Reembolsos')}
          <p className="text-on-surface-variant leading-relaxed">Los reembolsos se procesan a través del mismo método de pago original (tarjeta o Yape/Plin). El tiempo de acreditación puede variar según tu banco o billetera digital (3–10 días hábiles).</p>

          <div className="mt-8 bg-primary/10 rounded-xl p-6 border border-primary/20 flex gap-4">
            <span className="material-symbols-outlined text-primary text-3xl flex-shrink-0">support_agent</span>
            <div>
              <p className="font-bold text-on-surface mb-1">¿Tienes dudas?</p>
              <p className="text-sm text-on-surface-variant">Escríbenos a través de nuestro <Link to="/contact" className="text-primary hover:underline">formulario de contacto</Link>. Respondemos en menos de 24 horas.</p>
            </div>
          </div>

        </div>
      </section>
    </main>
  );
};

export default ReturnsPolicy;
