import SEOMeta from '../components/SEOMeta';

const Terms = () => (
  <main className="pt-32 pb-20 px-6 max-w-3xl mx-auto min-h-screen">
    <SEOMeta title="Términos y Condiciones" description="Términos y condiciones de uso de Trebor Labs." />
    <div className="mb-10 space-y-3">
      <p className="font-mono text-primary text-xs tracking-widest uppercase">Legal</p>
      <h1 className="font-headline font-black text-4xl tracking-tight">Términos y Condiciones</h1>
      <p className="text-xs text-on-surface-variant font-mono">Última actualización: enero 2026</p>
    </div>
    <div className="space-y-8 text-on-surface-variant text-sm leading-relaxed">
      {[
        { title: '1. Aceptación', content: 'Al acceder y utilizar Trebor Labs, aceptas quedar vinculado por estos Términos. Si no estás de acuerdo, no utilices la plataforma.' },
        { title: '2. Uso de la Plataforma', content: 'Trebor Labs es una plataforma de comercio electrónico para la compraventa de hardware técnico. Debes tener al menos 18 años o contar con autorización de un adulto responsable.' },
        { title: '3. Cuentas de Usuario', content: 'Eres responsable de mantener la confidencialidad de tus credenciales. Trebor Labs no se hace responsable por accesos no autorizados a tu cuenta.' },
        { title: '4. Precios y Pagos', content: 'Todos los precios están expresados en USD. Los pagos se procesan mediante MercadoPago. Trebor Labs se reserva el derecho de modificar precios sin previo aviso.' },
        { title: '5. Propiedad Intelectual', content: 'Todo el contenido de Trebor Labs (logos, imágenes, textos, diseños) es propiedad de Trebor Labs o sus licenciantes y está protegido por leyes de propiedad intelectual.' },
        { title: '6. Limitación de Responsabilidad', content: 'Trebor Labs no será responsable por daños indirectos, incidentales o consecuentes derivados del uso de la plataforma o sus productos.' },
        { title: '7. Modificaciones', content: 'Nos reservamos el derecho de modificar estos Términos en cualquier momento. Los cambios entran en vigencia al publicarse en la plataforma.' },
        { title: '8. Ley Aplicable', content: 'Estos Términos se rigen por las leyes de la República del Perú. Cualquier disputa será resuelta ante los tribunales competentes de Lima.' },
      ].map(({ title, content }) => (
        <section key={title} className="space-y-2">
          <h2 className="font-headline font-bold text-base text-on-surface">{title}</h2>
          <p>{content}</p>
        </section>
      ))}
    </div>
  </main>
);

export default Terms;
