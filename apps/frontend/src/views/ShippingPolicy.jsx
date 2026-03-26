import SEOMeta from '../components/SEOMeta';

const ShippingPolicy = () => (
  <main className="pt-32 pb-20 px-6 max-w-3xl mx-auto min-h-screen">
    <SEOMeta title="Política de Envíos" description="Información sobre zonas de cobertura, tiempos y costos de envío de Trebor Labs." />
    <div className="mb-10 space-y-3">
      <p className="font-mono text-primary text-xs tracking-widest uppercase">Logística</p>
      <h1 className="font-headline font-black text-4xl tracking-tight">Política de Envíos</h1>
    </div>
    <div className="prose-blog space-y-8 text-on-surface-variant">
      <section className="space-y-3">
        <h2 className="font-headline font-bold text-xl text-on-surface">Zonas de Cobertura</h2>
        <p>Actualmente operamos a nivel nacional en Perú. Las zonas y tarifas disponibles se muestran dinámicamente en el checkout según tu dirección de entrega.</p>
        <p>La cobertura incluye Lima Metropolitana, principales provincias y ciudades del interior del país.</p>
      </section>
      <section className="space-y-3">
        <h2 className="font-headline font-bold text-xl text-on-surface">Tiempos de Entrega</h2>
        <ul className="space-y-2 list-disc list-inside">
          <li><strong className="text-on-surface">Lima Metropolitana:</strong> 1–2 días hábiles</li>
          <li><strong className="text-on-surface">Provincias principales:</strong> 3–5 días hábiles</li>
          <li><strong className="text-on-surface">Zonas remotas:</strong> 5–10 días hábiles</li>
        </ul>
        <p>Los teclados custom con configuración especial pueden requerir hasta 5 días adicionales de preparación.</p>
      </section>
      <section className="space-y-3">
        <h2 className="font-headline font-bold text-xl text-on-surface">Costos de Envío</h2>
        <p>Los costos varían según la zona. Se calculan automáticamente al ingresar tu dirección en el checkout. Pedidos superiores a USD 200 pueden aplicar a envío bonificado según promoción vigente.</p>
      </section>
      <section className="space-y-3">
        <h2 className="font-headline font-bold text-xl text-on-surface">Rastreo de Pedido</h2>
        <p>Una vez despachado el pedido, recibirás un email con el número de tracking. También puedes consultar el estado en tiempo real desde "Mis Pedidos" en tu cuenta.</p>
      </section>
      <section className="space-y-3">
        <h2 className="font-headline font-bold text-xl text-on-surface">Embalaje</h2>
        <p>Todos los productos son embalados con protección anti-impacto. Los teclados custom incluyen caja individual con espuma de alta densidad.</p>
      </section>
    </div>
  </main>
);

export default ShippingPolicy;
