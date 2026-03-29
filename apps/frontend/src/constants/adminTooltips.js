export const BLOG_TOOLTIPS = {
  title:      'El título principal del artículo. Es lo primero que verán los lectores y aparece en el navegador, redes sociales y resultados de búsqueda.',
  slug:       'La parte de la URL que identifica este artículo. Se genera automáticamente desde el título pero puedes editarlo. Ej: /blog/mi-articulo-sobre-teclados',
  content:    'El cuerpo completo del artículo escrito en Markdown. Puedes usar # para títulos, **negrita**, *cursiva*, listas y más.',
  excerpt:    'Resumen corto del artículo (2-3 oraciones). Aparece en las listas del blog, resultados de búsqueda y previsualizaciones en redes sociales.',
  status:     'Borrador: solo tú puedes verlo. Publicado: visible para todos los visitantes del sitio.',
  category:   'Categoría temática del artículo. Ayuda a organizar el blog y permite filtrar contenido por tema.',
  coverImage: 'Imagen principal del artículo. Aparece en la cabecera del post y en las tarjetas de listado del blog.',
};

export const PRODUCT_TOOLTIPS = {
  name:         'Nombre del producto tal como aparecerá en la tienda, en el carrito y en los pedidos.',
  slug:         'Identificador único del producto en la URL. Ej: /productos/teclado-mecanico-pro. Se genera solo desde el nombre.',
  category:     'Categoría a la que pertenece este producto. Determina en qué sección de la tienda aparecerá.',
  price:        'Precio de venta al público en la moneda configurada. Este es el precio que verá el cliente.',
  stock:        'Cantidad de unidades disponibles. Cuando llegue a 0, el producto se marcará como agotado automáticamente.',
  status:       'Activo: visible y comprable en la tienda. Inactivo: oculto para los clientes.',
  featured:     'Los productos destacados aparecen en la sección principal de la tienda y tienen mayor visibilidad.',
  description:  'Descripción detallada del producto. Admite Markdown para formato. Es clave para SEO y para informar al comprador.',
  images:       'Fotos del producto. La primera imagen es la principal. Puedes reordenarlas usando las flechas.',
  layout:       'Distribución del teclado. Ej: TKL (sin numpad), 65%, Full Size. Ayuda al comprador a elegir el tamaño correcto.',
  material:     'Material de la carcasa. Ej: Aluminio, POM, Policarbonato. Afecta el sonido y la durabilidad.',
  switches:     'Tipo de switches instalados. Ej: Cherry MX Red, Gateron Brown. Define la experiencia de tipeo.',
  pcb:          'Tipo de PCB. Ej: Hot-swap (intercambiable sin soldar), soldado. Hot-swap permite cambiar switches fácilmente.',
  connectivity: 'Cómo se conecta el teclado. Ej: USB-C, Bluetooth, 2.4GHz inalámbrico.',
  weight:       'Peso del teclado en gramos o kg. Importante para quienes buscan teclados portátiles o de escritorio.',
  piModel:      'Modelo de Raspberry Pi incluido. Determina la potencia de procesamiento del dispositivo.',
  ram:          'Memoria RAM del dispositivo. Más RAM permite ejecutar más aplicaciones simultáneamente.',
  storage:      'Capacidad de almacenamiento. Determina cuántos datos, programas o archivos puede guardar el dispositivo.',
  afiche:       'Imagen promocional grande. Aparece en destacados de la tienda o en campañas especiales.',
  variantName:  'Nombre de esta variante. Ej: Negro, Blanco, Edición especial. Aparece en el selector de opciones del producto.',
  variantColor: 'Color representativo de la variante. Se muestra como círculo de color en el selector.',
  variantAvail: 'Si está activa, los clientes pueden seleccionar y comprar esta variante.',
};

export const CATEGORY_TOOLTIPS = {
  name:    'Nombre de la categoría tal como aparecerá en el menú y filtros de la tienda.',
  slug:    'Identificador de la categoría en la URL. Ej: /categorias/teclados-mecanicos',
  icon:    'Nombre del ícono (Lucide React) para representar visualmente esta categoría.',
  order:   'Número de orden para determinar la posición en el listado. Menor número = aparece primero.',
  enabled: 'Si está activa, la categoría es visible en la tienda. Desactivarla la oculta sin eliminarla.',
};

export const ORDER_TOOLTIPS = {
  search:           'Busca pedidos por número de orden, email del cliente o nombre.',
  statusFilter:     'Filtra los pedidos según su estado actual en el flujo de compra.',
  statusSelect:     'Cambia el estado actual del pedido. Esto notifica al cliente y actualiza el seguimiento.',
  manualEmail:      'Email del cliente para el pedido manual. Se usará para notificaciones y el historial del cliente.',
  manualName:       'Nombre completo del destinatario para el envío.',
  manualAddress:    'Dirección de calle y número donde se entregará el pedido.',
  manualDistrict:   'Distrito o barrio de la dirección de entrega.',
  manualCity:       'Ciudad de la dirección de entrega.',
  manualRegion:     'Región o estado de la dirección de entrega.',
  manualPhone:      'Teléfono de contacto del cliente para coordinar la entrega.',
  manualProductName:  'Nombre del producto a agregar al pedido manual.',
  manualProductPrice: 'Precio unitario del producto para este pedido.',
  manualProductQty:   'Cantidad de unidades de este producto en el pedido.',
  manualNotes:      'Notas internas del pedido. Solo visibles para administradores, no para el cliente.',
};

export const ORDER_DETAIL_TOOLTIPS = {
  statusSelect:  'Actualiza el estado del pedido. El cliente puede recibir una notificación automática según la configuración.',
  internalNotes: 'Notas privadas sobre este pedido. Solo las ven los administradores. Útil para seguimiento interno.',
};

export const USER_TOOLTIPS = {
  search:      'Busca usuarios por nombre o email.',
  roleFilter:  'Filtra la lista por rol: todos, usuarios normales o administradores.',
  roleSelect:  'Cambia el rol del usuario. Admin: acceso total al panel. User: solo puede comprar y ver sus pedidos.',
  suspend:     'Suspender impide que el usuario inicie sesión. Sus datos y pedidos se conservan.',
};

export const USER_DETAIL_TOOLTIPS = {
  name:    'Nombre completo del usuario. Se muestra en pedidos, facturas y comunicaciones.',
  email:   'Email del usuario. Es su identificador de acceso y donde recibe notificaciones.',
  role:    'Admin: acceso completo al panel de administración. User: solo acceso a la tienda y sus pedidos.',
  suspend: 'Suspender bloquea el acceso sin eliminar la cuenta. Útil para cuentas sospechosas.',
};

export const COMMENT_TOOLTIPS = {
  search: 'Busca comentarios por contenido, autor o producto.',
};

export const COUPON_TOOLTIPS = {
  code:          'El código que el cliente ingresa al pagar. Ej: VERANO20. Se recomienda usar mayúsculas y sin espacios.',
  type:          'Porcentaje: descuenta un % del total. Monto fijo: descuenta una cantidad exacta en la moneda del sitio.',
  value:         'El valor del descuento. Si el tipo es porcentaje, escribe 20 para 20%. Si es fijo, escribe el monto exacto.',
  minOrderTotal: 'Monto mínimo del carrito para poder usar este cupón. Déjalo en 0 para que no haya mínimo.',
  maxUses:       'Cuántas veces en total puede usarse este cupón. Déjalo en 0 para usos ilimitados.',
  expiresAt:     'Fecha límite para usar el cupón. Después de esta fecha quedará inválido automáticamente.',
  enabled:       'Activo: los clientes pueden usar este cupón. Inactivo: el cupón existe pero no funciona.',
};

export const SHIPPING_TOOLTIPS = {
  zoneName:    'Nombre de la zona de envío. Ej: Lima Metropolitana, Provincias, Envío Express.',
  zonePrice:   'Costo de envío para esta zona. Los clientes verán este monto al hacer checkout.',
  regions:     'Lista de regiones cubiertas por esta zona, separadas por coma. Ej: Lima, Callao, Miraflores.',
  zoneEnabled: 'Activa o desactiva esta zona. Si está inactiva, los clientes en esas regiones no podrán elegirla.',
};

export const SETTINGS_TOOLTIPS = {
  storeName:    'Nombre de tu tienda. Aparece en el encabezado del sitio, emails y documentos.',
  supportEmail: 'Email de soporte que verán los clientes para contactarte. También recibe notificaciones del sistema.',
  storeUrl:     'URL pública de tu tienda. Se usa para generar links en emails y redes sociales.',
  currency:     'Moneda usada en toda la tienda. Ej: PEN, USD, EUR. Afecta cómo se muestran los precios.',
  mercadoPago:  'Activa o desactiva Mercado Pago como método de pago en el checkout.',
  mpPublicKey:  'Clave pública de tu cuenta de Mercado Pago. Se obtiene en tu panel de desarrolladores de MP.',
  mpAccessToken:'Token privado de Mercado Pago. NUNCA lo compartas. Se usa para procesar pagos en el servidor.',
};

export const SITE_CONFIG_TOOLTIPS = {
  heroBadge:       "Texto pequeño que aparece arriba del título principal en la sección hero. Ej: 'Nuevo' o 'Disponible ahora'.",
  heroHeadline1:   'Primera línea del título principal del hero. Es el texto más grande y visible de la página de inicio.',
  heroHeadline2:   'Segunda línea del título, generalmente resaltada con color de acento para énfasis visual.',
  heroSubtitle:    'Texto descriptivo debajo del título. Explica brevemente qué ofrece la tienda.',
  ctaPrimaryText:  "Texto del botón principal de llamada a la acción. Ej: 'Ver productos', 'Comprar ahora'.",
  ctaPrimaryLink:  'URL a la que dirige el botón principal. Puede ser una página interna o externa.',
  ctaSecondaryText:"Texto del botón secundario. Suele ser una acción alternativa como 'Conocer más'.",
  ctaSecondaryLink:'URL del botón secundario.',
  heroBg:          'Fondo de la sección hero. Puede ser un color sólido, gradiente o imagen.',
  heroImage:       'Imagen principal del hero. Recomendado: PNG con fondo transparente para mejores resultados.',
  specSwitches:    'Texto del primer atributo de la tarjeta de especificaciones del hero. Ej: Cherry MX Red.',
  specKeycaps:     'Texto del segundo atributo de la tarjeta de especificaciones. Ej: PBT Double Shot.',
  specPosition:    'Posición vertical de la tarjeta de especificaciones sobre la imagen del hero.',
  specSize:        'Tamaño de la tarjeta de especificaciones: S (pequeño), M (mediano), L (grande).',
  aboutTitle:      "Título de la sección 'Nosotros' o 'Quiénes somos' en la página de inicio.",
  aboutP1:         'Primer párrafo de la sección about. Presenta la empresa o marca.',
  aboutP2:         'Segundo párrafo de la sección about. Detalla valores, misión o diferenciadores.',
  aboutCtaText:    "Texto del botón de la sección about. Ej: 'Conoce nuestra historia'.",
  aboutCtaLink:    'URL del botón de la sección about.',
  aboutImage1:     'Primera imagen decorativa de la sección about. Aparece junto al texto.',
  aboutImage2:     'Segunda imagen decorativa de la sección about.',
  footerTagline:   'Texto descriptivo que aparece en el pie de página debajo del logo de la tienda.',
};

export const RETURN_TOOLTIPS = {
  statusFilter:     'Filtra las devoluciones por estado: todas, pendientes de revisión, aprobadas, rechazadas o completadas.',
  resolutionSelect: 'Elige cómo se resuelve esta devolución: aprobada (proceder), rechazada (denegar) o completada (finalizada).',
  adminNotes:       'Notas internas sobre esta devolución. Solo las ven los administradores. Explica el motivo de la decisión.',
};
