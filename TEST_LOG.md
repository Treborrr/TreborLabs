# TEST LOG — Trebor Labs

> Plantilla de testing manual diario. Copia la sección del día, rellena los resultados
> y añade al final los bugs o mejoras encontradas.

---

## Cómo usar esta plantilla

1. Al inicio de cada sesión de pruebas, copia la sección "PLANTILLA DIARIA" abajo
2. Cambia la fecha y entorno
3. Prueba cada flujo marcado
4. Anota bugs con el formato `[BUG]` o mejoras con `[MEJORA]`
5. Al terminar, revisa los bugs y crea issues o agrega tareas al BACKLOG

---

## PLANTILLA DIARIA

```
## Sesión: YYYY-MM-DD
**Tester:** Robert
**Entorno:** local Docker | staging | producción
**URL frontend:** http://localhost:5173
**Commit/versión:**

---

### AUTH

| Test | Resultado | Notas |
|---|---|---|
| Registro con email/password nuevo | ✅ / ❌ | |
| Email de verificación llega | ✅ / ❌ / N/A | |
| Login con email/password | ✅ / ❌ | |
| Login con Google | ✅ / ❌ | |
| Login con GitHub | ✅ / ❌ | |
| Logout cierra sesión correctamente | ✅ / ❌ | |
| Token persiste al recargar página | ✅ / ❌ | |

---

### CATÁLOGO

| Test | Resultado | Notas |
|---|---|---|
| /products carga lista de productos | ✅ / ❌ | |
| Filtro por categoría funciona | ✅ / ❌ | |
| Click en producto abre /products/:slug | ✅ / ❌ | |
| Imágenes del producto cargan | ✅ / ❌ | |
| Variantes se muestran correctamente | ✅ / ❌ | |
| Botón "Agregar al carrito" funciona | ✅ / ❌ | |
| /raspi carga solo productos raspi | ✅ / ❌ | |

---

### CARRITO

| Test | Resultado | Notas |
|---|---|---|
| Badge del carrito se actualiza | ✅ / ❌ | |
| Puede cambiar cantidad de producto | ✅ / ❌ | |
| Puede eliminar producto del carrito | ✅ / ❌ | |
| Total se calcula correctamente | ✅ / ❌ | |
| Carrito vacío redirige a /products | ✅ / ❌ | |

---

### CHECKOUT

| Test | Resultado | Notas |
|---|---|---|
| Paso 1 — Dirección se puede rellenar | ✅ / ❌ | |
| Zona de envío se selecciona según región | ✅ / ❌ | |
| Error claro si región sin cobertura | ✅ / ❌ | |
| Cupón válido aplica descuento | ✅ / ❌ | |
| Cupón inválido muestra error | ✅ / ❌ | |
| Cupón expirado muestra error | ✅ / ❌ | |
| Botón "Pagar con MercadoPago" aparece | ✅ / ❌ | N/A si no hay MP_ACCESS_TOKEN |
| Orden se crea en la DB (ver admin) | ✅ / ❌ | |
| Stock se decrementa tras orden | ✅ / ❌ | |
| Email de confirmación llega | ✅ / ❌ | N/A si no hay Gmail config |

---

### BLOG

| Test | Resultado | Notas |
|---|---|---|
| /blog lista posts publicados | ✅ / ❌ | |
| Click en post abre /blog/:slug | ✅ / ❌ | |
| Contenido markdown se renderiza | ✅ / ❌ | |
| Comentarios se pueden escribir | ✅ / ❌ | |

---

### PROFILE

| Test | Resultado | Notas |
|---|---|---|
| /profile requiere login | ✅ / ❌ | |
| Datos del usuario se muestran | ✅ / ❌ | |
| Historial de órdenes carga | ✅ / ❌ | |
| Wishlist muestra productos guardados | ✅ / ❌ | |

---

### ADMIN — Dashboard

| Test | Resultado | Notas |
|---|---|---|
| /admin requiere rol ADMIN | ✅ / ❌ | |
| Stats (órdenes, revenue, productos) carga | ✅ / ❌ | |
| Stock alerts muestra productos con stock < 5 | ✅ / ❌ | |

---

### ADMIN — Productos

| Test | Resultado | Notas |
|---|---|---|
| Lista de productos carga | ✅ / ❌ | |
| Crear nuevo producto | ✅ / ❌ | |
| Editar producto existente | ✅ / ❌ | |
| Subir imagen de producto | ✅ / ❌ | |
| Eliminar producto | ✅ / ❌ | |

---

### ADMIN — Órdenes

| Test | Resultado | Notas |
|---|---|---|
| Lista de órdenes carga | ✅ / ❌ | |
| Cambiar estado de orden funciona | ✅ / ❌ | |
| Filtro por estado funciona | ✅ / ❌ | |

---

### ADMIN — Blog

| Test | Resultado | Notas |
|---|---|---|
| Lista de posts carga | ✅ / ❌ | |
| Crear nuevo post | ✅ / ❌ | |
| Editar post existente | ✅ / ❌ | |
| Publicar / poner en draft | ✅ / ❌ | |

---

### MOBILE (redimensionar a 375px)

| Test | Resultado | Notas |
|---|---|---|
| Navbar hamburguesa funciona | ✅ / ❌ | |
| Menú se cierra al navegar | ✅ / ❌ | |
| Checkout usable en mobile | ✅ / ❌ | |
| Imágenes no se deforman | ✅ / ❌ | |

---

### BUGS ENCONTRADOS

<!-- Formato sugerido:
[BUG-001] Descripción breve del bug
- Pasos para reproducir:
  1.
  2.
- Comportamiento esperado:
- Comportamiento actual:
- Severidad: crítica | alta | media | baja
- Componente: Frontend / Backend / Admin
-->


---

### MEJORAS SUGERIDAS

<!-- Formato sugerido:
[MEJORA-001] Descripción breve
- Contexto: por qué sería útil
- Componente afectado:
- Prioridad: alta | media | baja
-->


---

### RESUMEN DEL DÍA

- Bugs críticos encontrados:
- Bugs menores encontrados:
- Mejoras anotadas:
- Estado general: 🟢 Bien / 🟡 Hay cosas para mejorar / 🔴 Bugs que bloquean
```

---

## Historial de sesiones

<!-- Agrega aquí un resumen de cada sesión completada -->

| Fecha | Tester | Entorno | Bugs | Estado |
|---|---|---|---|---|
| — | — | — | — | — |
