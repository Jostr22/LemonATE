# Guía de exposición — LemonATE

## 1. Guion corto (5 minutos)

**Apertura.** «LemonATE es una tienda de limonadas, postres y combos. El problema es simple:
un negocio pequeño necesita mostrar su catálogo, recibir pedidos completos y dar
seguimiento sin depender de mensajes sueltos de WhatsApp.»

**Recorrido.** «Esta es la landing: marca, propuesta y accesos. Entro a la tienda, filtro por
categoría, abro una limonada, elijo tamaño, hielo, azúcar y extras; el precio cambia. La
agrego al carrito, voy al checkout, ingreso mi dirección y la distancia calcula el domicilio.
Confirmo y recibo un código y un PIN para seguir el pedido.»

**Panel.** «Con la cuenta de administrador entro al panel: creo o edito productos, cambio
existencias y precios, actualizo el estado de un pedido a "pago confirmado" y el inventario
se descuenta. También leo los mensajes del formulario.»

**IA.** «LemonATE AI no es ChatGPT: es un motor de reglas. Recibe la pregunta, busca en el
catálogo real y responde con productos, precios y existencias. Por eso no inventa nada.»

**Cierre.** «El frontend está en React y se publica en GitHub Pages; la API en Express y
MongoDB Atlas se publica en Render. El sitio incluye un modo demostración para que funcione
aunque no haya internet en el salón.»

## 2. Conceptos en palabras sencillas

### ¿Qué problema resuelve LemonATE?

Centraliza catálogo, pedidos, seguimiento y administración en un solo sitio. El cliente no
tiene que preguntar precios por chat y el negocio no pierde solicitudes.

### ¿Qué es el frontend?

Lo que ve y usa el cliente en el navegador: páginas, botones, formularios, carrito.

### ¿Qué es el backend?

El programa en el servidor que recibe las peticiones, valida, calcula y guarda. El navegador
no puede decidir el precio final: lo hace el backend.

### ¿Para qué sirve React?

Para construir la interfaz por componentes reutilizables (tarjeta, carrito, formulario) y
actualizar la pantalla cuando cambia el estado, sin recargar la página.

### ¿Qué hace Node.js?

Ejecuta JavaScript fuera del navegador, en el servidor.

### ¿Qué hace Express?

Es el framework que organiza las rutas de la API: «si llega un POST a /orders, ejecuta este
controlador».

### ¿Qué es una API REST?

Un conjunto de URLs que reciben y devuelven JSON. Ejemplo: `GET /api/products` devuelve el
catálogo; `POST /api/orders` crea un pedido.

### ¿Para qué se usa MongoDB?

Para guardar documentos flexibles (usuarios, productos, pedidos, mensajes) sin definir
columnas rígidas. Mongoose valida los esquemas desde Node.

### ¿Cómo se registran los usuarios?

El formulario envía nombre, correo y contraseña. El backend verifica que el correo no exista,
cifra la contraseña con bcrypt y guarda el usuario. Devuelve un token JWT para mantener la
sesión.

### ¿Cómo funciona el carrito?

Vive en el navegador (`localStorage`). Guarda producto, personalización, cantidad y precio.
Al recargar la página sigue ahí.

### ¿Cómo se genera un pedido?

El carrito envía producto, cantidad y personalización. El backend consulta precios y
existencias reales, calcula subtotal, domicilio y total, genera el código `LMT-XXXXXX` y el
PIN, y guarda el pedido.

### ¿Cómo funciona el panel administrativo?

Es una ruta privada. Solo un usuario con rol `admin` puede entrar. Desde allí se modifican
productos, pedidos, mensajes y configuración.

### ¿Cómo funciona LemonATE AI?

Normaliza la pregunta, detecta palabras clave y arma una respuesta con datos del catálogo.
No usa un modelo generativo, así que no puede inventar productos ni precios.

### ¿Por qué se usa GitHub?

Para guardar el historial de versiones, trabajar por commits y publicar el frontend con
GitHub Pages.

### ¿Cómo se despliega?

GitHub Actions compila React y publica `dist/` en Pages. Render ejecuta Express y se conecta
a MongoDB Atlas con variables de entorno. Las claves nunca se suben al repositorio.

## 3. Preguntas probables del profesor

**¿Dónde está la base de datos?**
En MongoDB Atlas. La cadena de conexión está en la variable `MONGODB_URI` del backend. En
las pruebas locales se usa una instancia en memoria.

**¿Qué pasa si el backend está caído?**
El frontend entra en modo demostración: usa el mismo catálogo y guarda todo en el navegador.
Es una decisión de diseño para que la tienda siempre se pueda presentar.

**¿El pago es real?**
No. Es un flujo de demostración. Ningún pedido se marca como pagado automáticamente; el
administrador lo confirma. La pasarela real queda como mejora futura.

**¿Por qué no hay opción de recoger en tienda?**
El modelo de negocio definido es solo domicilios. La dirección y el radio son configurables.

**¿Cómo evitan que alguien vea un pedido ajeno?**
El seguimiento exige código y PIN. Sin ambos no se devuelve información.

**¿Dónde se guarda la contraseña?**
Como hash bcrypt en la base de datos. Nunca se devuelve al cliente.

**¿Cómo se calcula el domicilio?**
Por rangos de distancia configurables. Si la distancia supera el radio máximo, el sistema
bloquea el pedido y avisa que no hay cobertura.

**¿Qué pasa si dos personas compran el último producto?**
El backend valida existencias al crear el pedido y al confirmar el pago. En una versión
profesional se usarían transacciones y bloqueos; aquí se documenta como limitación.

**¿Por qué el carrito está en el navegador y no en la base de datos?**
Porque permite comprar como invitado sin crear cuenta. El pedido sí queda en la base de
datos cuando se confirma.

**¿Qué es el PIN?**
Un código de 4 dígitos que se entrega al crear el pedido y sirve, junto con el código, para
consultar el estado sin revelar pedidos de otras personas.

**¿La IA recomienda productos agotados?**
El motor penaliza los agotados y muestra su estado. No inventa existencias.

**¿Cómo se cambia un precio o una foto?**
Desde el panel: Productos → Editar. La imagen acepta una ruta del proyecto o una URL.

**¿Cómo se agregan productos?**
Panel → Productos → Nuevo producto. Se guardan en MongoDB y aparecen en la tienda.

**¿Cuántos commits tiene el proyecto?**
El historial de Git los muestra. Cada etapa se registró con un commit descriptivo.

**¿Qué mejorarían?**
Pagos reales, notificaciones por WhatsApp, seguimiento GPS y pruebas E2E en integración
continua.

## 4. Demostración paso a paso (checklist)

1. Abrir la landing y cambiar el idioma a inglés y de vuelta a español.
2. Ir a Menú, buscar «maracumango» y cambiar entre las pestañas de categoría.
3. Abrir una limonada, cambiar a tamaño grande y agregar un extra; ver el precio.
4. Agregar dos productos y abrir el carrito; cambiar cantidades.
5. Checkout con distancia de 3 km: debe cobrar $5.000 de domicilio.
6. Probar 20 km: debe mostrar «sin cobertura».
7. Confirmar el pedido y anotar código y PIN.
8. Ir a Seguimiento, consultar con código y PIN.
9. Iniciar sesión como administrador (ver credenciales abajo).
10. Cambiar el pedido a «Pago confirmado» y verificar que baja el stock.
11. Crear un producto y verlo en la tienda.
12. Enviar un mensaje desde Contacto y leerlo en el panel.
13. Abrir LemonATE AI y pedir «algo ácido sin azúcar».
14. Mostrar `git log --oneline` y el workflow de GitHub Pages.

## 5. Credenciales de demostración

| Rol | Correo | Contraseña |
|---|---|---|
| Administrador | `admin@lemonate.com` | `LemonATE2026` |

En el backend real, el seed usa `ADMIN_EMAIL` y `ADMIN_PASSWORD` del archivo `.env`.
**Cambiar la contraseña antes de publicar.**

## 6. Frases para recordar

- «El frontend muestra; el backend decide.»
- «El precio final siempre lo calcula el servidor.»
- «La IA es un motor de reglas que lee el catálogo real.»
- «Si la nube falla, el modo demostración mantiene la tienda en pie.»
