import SEOMeta from '../components/SEOMeta';

const Privacy = () => (
  <main className="pt-32 pb-20 px-6 max-w-3xl mx-auto min-h-screen">
    <SEOMeta title="Política de Privacidad" description="Cómo Trebor Labs recopila, usa y protege tu información personal." />
    <div className="mb-10 space-y-3">
      <p className="font-mono text-primary text-xs tracking-widest uppercase">Legal</p>
      <h1 className="font-headline font-black text-4xl tracking-tight">Política de Privacidad</h1>
      <p className="text-xs text-on-surface-variant font-mono">Última actualización: enero 2026</p>
    </div>
    <div className="space-y-8 text-on-surface-variant text-sm leading-relaxed">
      {[
        { title: 'Datos que Recopilamos', content: 'Al crear una cuenta, recopilamos tu nombre, email y contraseña (cifrada). Al realizar una compra, recopilamos tu dirección de entrega y teléfono. Los datos de pago son procesados y almacenados por MercadoPago — Trebor Labs no almacena datos de tarjeta.' },
        { title: 'Uso de la Información', content: 'Usamos tus datos para: procesar pedidos, enviar confirmaciones por email, mejorar la plataforma, personalizar recomendaciones y cumplir obligaciones legales.' },
        { title: 'Cookies', content: 'Utilizamos cookies de sesión para mantener tu login y cookies de analytics para entender el uso de la plataforma. Puedes desactivarlas desde la configuración de tu navegador, aunque algunas funciones podrían verse afectadas.' },
        { title: 'Compartición de Datos', content: 'No vendemos ni alquilamos tu información personal. Podemos compartir datos con proveedores de servicio (mensajería, email, pagos) únicamente para procesar tu pedido.' },
        { title: 'Seguridad', content: 'Aplicamos cifrado TLS en todas las comunicaciones, contraseñas hasheadas con bcrypt y tokens de sesión seguros. Sin embargo, ningún sistema es 100% infalible.' },
        { title: 'Tus Derechos', content: 'Puedes solicitar el acceso, corrección o eliminación de tus datos en cualquier momento escribiéndonos al email de soporte. Procesamos estas solicitudes en un máximo de 30 días.' },
        { title: 'Menores de Edad', content: 'La plataforma no está destinada a menores de 18 años. Si detectamos que un menor ha creado una cuenta, la eliminaremos de inmediato.' },
        { title: 'Contacto', content: 'Para consultas sobre privacidad: privacidad@treborlabs.com' },
      ].map(({ title, content }) => (
        <section key={title} className="space-y-2">
          <h2 className="font-headline font-bold text-base text-on-surface">{title}</h2>
          <p>{content}</p>
        </section>
      ))}
    </div>
  </main>
);

export default Privacy;
