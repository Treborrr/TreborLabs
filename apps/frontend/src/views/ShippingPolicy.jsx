import SEOMeta from '../components/SEOMeta';

const sectionTitle = (text) => (
  <h2 className="font-headline text-2xl font-bold mb-4 text-on-surface border-b border-outline/10 pb-2">{text}</h2>
);

const ShippingPolicy = () => {
  return (
    <main className="bg-surface text-on-surface min-h-screen">
      <SEOMeta
        title="Política de Envíos — Trebor Labs"
        description="Información sobre tiempos de envío, zonas de cobertura, costos y seguimiento de pedidos en Trebor Labs."
      />

      <section className="pt-40 pb-16 px-8">
        <div className="max-w-3xl mx-auto">
          <p className="font-mono text-primary text-xs tracking-widest uppercase mb-4">Logística</p>
          <h1 className="font-headline text-5xl font-black tracking-tighter mb-6">Política de <span className="text-primary italic">Envíos</span></h1>
          <p className="text-on-surface-variant">Última actualización: Marzo 2026</p>
        </div>
      </section>

      <section className="pb-24 px-8">
        <div className="max-w-3xl mx-auto space-y-10">

          {sectionTitle('Zonas de cobertura y costos')}
          <div className="overflow-x-auto rounded-xl border border-outline/10">
            <table className="w-full text-sm">
              <thead className="bg-surface-container-high text-on-surface-variant">
                <tr>
                  <th className="p-4 text-left font-semibold">Zona</th>
                  <th className="p-4 text-left font-semibold">Regiones / Distritos</th>
                  <th className="p-4 text-center font-semibold">Costo</th>
                  <th className="p-4 text-center font-semibold">Tiempo estimado</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-outline/10">
                {[
                  { zona: 'Lima Metropolitana', regiones: 'Lima Metropolitana', costo: 'S/ 10', tiempo: '1–3 días hábiles' },
                  { zona: 'Lima Provincias', regiones: 'Barranca, Cañete, Huaral, Huarochirí, Huaura, Oyón, Yauyos', costo: 'S/ 15', tiempo: '3–5 días hábiles' },
                  { zona: 'Resto del Perú', regiones: 'Todas las demás regiones', costo: 'S/ 18', tiempo: '5–7 días hábiles' },
                ].map((row) => (
                  <tr key={row.zona} className="bg-surface-container">
                    <td className="p-4 font-medium text-on-surface">{row.zona}</td>
                    <td className="p-4 text-on-surface-variant">{row.regiones}</td>
                    <td className="p-4 text-center text-primary font-bold">{row.costo}</td>
                    <td className="p-4 text-center text-on-surface-variant">{row.tiempo}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {sectionTitle('Procesamiento de pedidos')}
          <p className="text-on-surface-variant leading-relaxed">Los pedidos se procesan de lunes a viernes. Los pedidos realizados después de las 12:00 pm (hora Lima) o en fines de semana se procesarán el siguiente día hábil. Recibirás un correo de confirmación una vez que tu pedido sea despachado.</p>

          {sectionTitle('Seguimiento de tu pedido')}
          <p className="text-on-surface-variant leading-relaxed">Cuando tu pedido sea enviado, recibirás un correo con el número de guía y el enlace de tracking de la empresa de transporte (Olva Courier o Shalom, según la zona). También puedes revisar el estado de tu pedido desde tu perfil en <a href="/profile" className="text-primary hover:underline">/profile</a>.</p>

          {sectionTitle('Pedidos perdidos o dañados')}
          <p className="text-on-surface-variant leading-relaxed">Si tu pedido llega dañado o no lo recibes dentro del plazo estimado, contáctanos inmediatamente a través de <a href="/contact" className="text-primary hover:underline">nuestro formulario de contacto</a>. Investigaremos el caso y buscaremos la mejor solución, ya sea un reenvío o reembolso.</p>

          {sectionTitle('Envíos internacionales')}
          <p className="text-on-surface-variant leading-relaxed">Por el momento, solo realizamos envíos dentro del territorio peruano. Si estás interesado en un envío internacional, contáctanos directamente para evaluar las opciones.</p>

        </div>
      </section>
    </main>
  );
};

export default ShippingPolicy;
