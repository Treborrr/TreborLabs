import SEOMeta from '../components/SEOMeta';

const section = (title, children) => (
  <div className="space-y-3">
    <h2 className="font-headline text-xl font-bold text-on-surface border-b border-outline/10 pb-2">{title}</h2>
    {children}
  </div>
);

const p = (text) => <p className="text-on-surface-variant leading-relaxed text-sm">{text}</p>;

const Terms = () => {
  return (
    <main className="bg-surface text-on-surface min-h-screen">
      <SEOMeta
        title="Términos de Servicio — Trebor Labs"
        description="Lee los términos y condiciones de uso de la plataforma Trebor Labs."
      />

      <div className="pt-40 pb-24 px-8">
        <div className="max-w-3xl mx-auto">
          <p className="font-mono text-primary text-xs tracking-widest uppercase mb-4">Legal</p>
          <h1 className="font-headline text-5xl font-black tracking-tighter mb-3">Términos de <span className="text-primary italic">Servicio</span></h1>
          <p className="text-on-surface-variant text-sm mb-12">Última actualización: Marzo 2026</p>

          <div className="space-y-10">

            {section('1. Aceptación de los términos',
              p('Al acceder o utilizar el sitio web trebor-labs.com ("el Sitio") o realizar una compra, aceptas quedar vinculado por estos Términos de Servicio. Si no estás de acuerdo con alguna parte de estos términos, no podrás acceder al Servicio.')
            )}

            {section('2. Uso del sitio',
              <>
                {p('El Sitio y su contenido son propiedad de Trebor Labs. Te concedemos una licencia limitada, no exclusiva, y no transferible para usar el Sitio con fines personales y no comerciales.')}
                <ul className="list-disc pl-5 space-y-1 text-sm text-on-surface-variant">
                  <li>No puedes reproducir, distribuir o crear obras derivadas del contenido sin autorización escrita.</li>
                  <li>No puedes usar el Sitio para actividades ilegales o dañinas.</li>
                  <li>No puedes intentar acceder a áreas restringidas del sistema sin autorización.</li>
                </ul>
              </>
            )}

            {section('3. Productos y precios',
              <>
                {p('Nos reservamos el derecho de modificar los precios sin previo aviso. Los precios mostrados incluyen IGV cuando aplique. En caso de error en el precio, nos pondremos en contacto contigo antes de procesar el pedido.')}
              </>
            )}

            {section('4. Proceso de compra',
              p('Al realizar un pedido, confirmas que la información proporcionada es exacta y completa. La confirmación del pedido por correo electrónico no constituye aceptación del contrato; ésta se produce cuando el producto es despachado.')
            )}

            {section('5. Envíos y entrega',
              p('Los tiempos de entrega son estimados y pueden verse afectados por factores externos. Trebor Labs no se hace responsable de retrasos causados por el operador logístico o causas de fuerza mayor. Consulta nuestra Política de Envíos para más detalles.')
            )}

            {section('6. Devoluciones y reembolsos',
              p('Las devoluciones y reembolsos se rigen por nuestra Política de Devoluciones, disponible en /devoluciones. Al aceptar estos términos, también aceptas dicha política.')
            )}

            {section('7. Limitación de responsabilidad',
              p('En ningún caso Trebor Labs será responsable de daños indirectos, incidentales, especiales o consecuentes derivados del uso o la imposibilidad de usar el Sitio o los productos adquiridos.')
            )}

            {section('8. Ley aplicable',
              p('Estos Términos se regirán e interpretarán de conformidad con las leyes de la República del Perú. Cualquier disputa se someterá a la jurisdicción de los tribunales de Lima, Perú.')
            )}

            {section('9. Cambios en los términos',
              p('Nos reservamos el derecho de modificar estos Términos en cualquier momento. Los cambios significativos serán notificados por correo electrónico. El uso continuado del Sitio tras los cambios implica la aceptación de los nuevos términos.')
            )}

            {section('10. Contacto',
              p('Para consultas sobre estos términos, puedes contactarnos a través del formulario en trebor-labs.com/contact.')
            )}

          </div>
        </div>
      </div>
    </main>
  );
};

export default Terms;
