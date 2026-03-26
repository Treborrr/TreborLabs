import { Link } from 'react-router-dom';
import SEOMeta from '../components/SEOMeta';

const ReturnsPolicy = () => (
  <main className="pt-32 pb-20 px-6 max-w-3xl mx-auto min-h-screen">
    <SEOMeta title="Política de Devoluciones" description="Conoce los términos y proceso de devolución de productos en Trebor Labs." />
    <div className="mb-10 space-y-3">
      <p className="font-mono text-primary text-xs tracking-widest uppercase">Post-venta</p>
      <h1 className="font-headline font-black text-4xl tracking-tight">Política de Devoluciones</h1>
    </div>
    <div className="space-y-8 text-on-surface-variant">
      <section className="space-y-3">
        <h2 className="font-headline font-bold text-xl text-on-surface">Plazo</h2>
        <p>Aceptamos devoluciones dentro de los <strong className="text-on-surface">5 días hábiles</strong> posteriores a la fecha de entrega confirmada.</p>
      </section>
      <section className="space-y-3">
        <h2 className="font-headline font-bold text-xl text-on-surface">Condiciones</h2>
        <ul className="space-y-2 list-disc list-inside">
          <li>El producto debe estar en su estado original, sin uso.</li>
          <li>Embalaje original completo (caja, accesorios, manuales).</li>
          <li>No aplica a productos con personalización (keycaps grabadas, etc.).</li>
          <li>Software activado o tarjetas SD con datos no aplican a devolución.</li>
        </ul>
      </section>
      <section className="space-y-3">
        <h2 className="font-headline font-bold text-xl text-on-surface">Proceso</h2>
        <ol className="space-y-2 list-decimal list-inside">
          <li>Inicia la solicitud desde tu cuenta → Mis Pedidos → Solicitar Devolución.</li>
          <li>Nuestro equipo evaluará la solicitud en 24h hábiles.</li>
          <li>Si es aprobada, coordinaremos el recojo sin costo en tu dirección.</li>
          <li>El reembolso se procesa en 3–5 días hábiles tras recibir el producto.</li>
        </ol>
      </section>
      <section className="space-y-3">
        <h2 className="font-headline font-bold text-xl text-on-surface">Reembolso</h2>
        <p>El reembolso se realiza al mismo método de pago original. En caso de pago con tarjeta puede tomar hasta 10 días hábiles en reflejarse según tu banco.</p>
      </section>
      <div className="bg-primary/5 border border-primary/20 rounded-xl p-6 space-y-2">
        <p className="font-bold text-sm text-on-surface">¿Tienes un problema con tu producto?</p>
        <p className="text-sm">Escríbenos antes de iniciar una devolución — muchas veces podemos resolver el inconveniente de inmediato.</p>
        <Link to="/contact" className="inline-flex items-center gap-1 text-primary font-mono text-sm hover:underline no-underline mt-1">
          <span className="material-symbols-outlined text-sm">chat</span>
          Contactar soporte
        </Link>
      </div>
    </div>
  </main>
);

export default ReturnsPolicy;
