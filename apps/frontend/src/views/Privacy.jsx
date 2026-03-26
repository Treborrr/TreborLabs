import SEOMeta from '../components/SEOMeta';

const section = (title, children) => (
  <div className="space-y-3">
    <h2 className="font-headline text-xl font-bold text-on-surface border-b border-outline/10 pb-2">{title}</h2>
    {children}
  </div>
);

const p = (text) => <p className="text-on-surface-variant leading-relaxed text-sm">{text}</p>;

const Privacy = () => {
  return (
    <main className="bg-surface text-on-surface min-h-screen">
      <SEOMeta
        title="Política de Privacidad — Trebor Labs"
        description="Conoce cómo Trebor Labs recopila, usa y protege tus datos personales conforme a la LPDP - Ley 29733 del Perú."
      />

      <div className="pt-40 pb-24 px-8">
        <div className="max-w-3xl mx-auto">
          <p className="font-mono text-primary text-xs tracking-widest uppercase mb-4">Privacidad</p>
          <h1 className="font-headline text-5xl font-black tracking-tighter mb-3">Política de <span className="text-primary italic">Privacidad</span></h1>
          <p className="text-on-surface-variant text-sm mb-12">Última actualización: Marzo 2026 · Ley N° 29733 — Ley de Protección de Datos Personales (LPDP, Perú)</p>

          <div className="space-y-10">

            {section('1. Responsable del tratamiento',
              p('Trebor Labs, con domicilio en Lima, Perú, es el responsable del tratamiento de los datos personales que proporciones al utilizar nuestro sitio web o al realizar compras.')
            )}

            {section('2. Datos que recopilamos',
              <>
                {p('Recopilamos los siguientes datos cuando usas nuestros servicios:')}
                <ul className="list-disc pl-5 space-y-1 text-sm text-on-surface-variant">
                  <li><strong className="text-on-surface">Datos de registro:</strong> nombre, correo electrónico, contraseña (encriptada).</li>
                  <li><strong className="text-on-surface">Datos de compra:</strong> dirección de envío, teléfono, historial de pedidos.</li>
                  <li><strong className="text-on-surface">Datos de uso:</strong> páginas visitadas, productos vistos (a través de cookies analíticas).</li>
                  <li><strong className="text-on-surface">Datos de pago:</strong> procesados exclusivamente por MercadoPago. No almacenamos datos de tarjeta.</li>
                </ul>
              </>
            )}

            {section('3. Finalidad del tratamiento',
              <>
                {p('Utilizamos tus datos para:')}
                <ul className="list-disc pl-5 space-y-1 text-sm text-on-surface-variant">
                  <li>Gestionar tus pedidos y devoluciones.</li>
                  <li>Enviarte comunicaciones sobre el estado de tu pedido.</li>
                  <li>Mejorar la experiencia de usuario en el Sitio.</li>
                  <li>Enviarte comunicaciones comerciales si has dado tu consentimiento (puedes cancelar en cualquier momento).</li>
                  <li>Cumplir con obligaciones legales y fiscales.</li>
                </ul>
              </>
            )}

            {section('4. Base legal',
              p('El tratamiento de tus datos se basa en: (a) la ejecución del contrato de compra, (b) tu consentimiento explícito para comunicaciones comerciales, y (c) el cumplimiento de obligaciones legales.')
            )}

            {section('5. Compartición de datos',
              p('No vendemos tus datos a terceros. Compartimos información únicamente con proveedores necesarios para la prestación del servicio: operadores logísticos (Olva, Shalom), pasarela de pago (MercadoPago), y servicio de correo electrónico (Gmail). Todos bajo contratos de confidencialidad.')
            )}

            {section('6. Tiempo de conservación',
              p('Conservamos tus datos mientras mantengas una cuenta activa. Puedes solicitar la eliminación de tu cuenta en cualquier momento desde tu perfil. Los datos de transacciones se conservan por el tiempo exigido por la legislación tributaria peruana (4 años).')
            )}

            {section('7. Tus derechos (ARCO)',
              <>
                {p('Conforme a la Ley N° 29733, tienes derecho a:')}
                <ul className="list-disc pl-5 space-y-1 text-sm text-on-surface-variant">
                  <li><strong className="text-on-surface">Acceso:</strong> obtener información sobre los datos que tenemos de ti.</li>
                  <li><strong className="text-on-surface">Rectificación:</strong> corregir datos inexactos.</li>
                  <li><strong className="text-on-surface">Cancelación:</strong> solicitar la eliminación de tus datos.</li>
                  <li><strong className="text-on-surface">Oposición:</strong> oponerte al tratamiento de tus datos para fines comerciales.</li>
                </ul>
                {p('Puedes ejercer estos derechos contactándonos en trebor-labs.com/contact.')}
              </>
            )}

            {section('8. Cookies',
              p('Usamos cookies estrictamente necesarias para el funcionamiento del Sitio (autenticación, carrito) y cookies analíticas opcionales. Puedes desactivar las cookies analíticas desde la configuración de tu navegador.')
            )}

            {section('9. Seguridad',
              p('Implementamos medidas técnicas y organizativas para proteger tus datos: HTTPS, contraseñas hasheadas con bcrypt, tokens JWT de corta vigencia, y acceso restringido a los datos del sistema.')
            )}

            {section('10. Cambios en esta política',
              p('Notificaremos por correo electrónico cualquier cambio significativo en esta política. El uso continuado del Sitio tras los cambios implica la aceptación de la política actualizada.')
            )}

          </div>
        </div>
      </div>
    </main>
  );
};

export default Privacy;
