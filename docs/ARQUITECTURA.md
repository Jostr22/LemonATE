# Arquitectura de LemonATE

## 1. Alcance

LemonATE es una tienda virtual con cinco frentes:

1. **Escaparate**: landing, catálogo, promociones e historia de marca.
2. **Compra**: carrito, personalización de bebidas, checkout y seguimiento.
3. **Cuentas**: registro, sesión, perfil, direcciones, favoritos e historial.
4. **Administración**: productos, existencias, pedidos, mensajes y configuración.
5. **LemonATE AI**: asistente basado en reglas que consulta el catálogo real.

## 2. Diagrama general

```
┌──────────────────────────┐        HTTPS / JSON        ┌──────────────────────────┐
│  Frontend (React + Vite) │ ─────────────────────────► │  Backend (Express)       │
│  GitHub Pages            │ ◄───────────────────────── │  Render                  │
└───────────┬──────────────┘                            └────────────┬─────────────┘
            │                                                        │ mongoose
            │ localStorage (carrito, sesión,                       │
            │ direcciones, borradores)                             ▼
            │                                             ┌──────────────────────┐
            └────────── modo demostración ────────────────► │  MongoDB Atlas       │
              (misma API simulada en el navegador)         │  users, products,    │
                                                           │  orders, messages,   │
                                                           │  settings            │
                                                           └──────────────────────┘
```

## 3. Capas del backend

```
backend/src/
├── config/        conexión a MongoDB, validación de variables de entorno
├── models/        esquemas Mongoose (User, Product, Order, Message, Settings)
├── controllers/   lógica de cada recurso
├── routes/        definición de endpoints REST
├── middleware/    autenticación JWT, roles, errores, validación, rate limit
├── services/      reglas de negocio (precios, domicilios, inventario, IA)
└── utils/         helpers (códigos, fechas, respuestas)
```

Flujo de una petición:

```
route → middleware (auth / validate) → controller → service → model → MongoDB
                                     ← respuesta JSON normalizada
```

## 4. Modelo de datos

### User
| Campo | Tipo | Nota |
|---|---|---|
| name | String | requerido |
| email | String | único, minúsculas |
| passwordHash | String | bcrypt, nunca se devuelve |
| role | `customer` \| `admin` | un solo administrador principal |
| phone | String | opcional |
| addresses | [Address] | etiqueta, línea, barrio, referencia, coordenadas |
| favorites | [ObjectId] | referencias a Product |
| createdAt | Date | automático |

### Product
| Campo | Tipo | Nota |
|---|---|---|
| name | { es, en } | bilingüe |
| description | { es, en } | bilingüe |
| category | `limonadas` \| `especiales` \| `postres` \| `combos` |
| price | Number | COP, precio base |
| stock | Number | 0 ⇒ «Agotado» |
| image | String | ruta o URL; el admin puede reemplazarla |
| customizable | Boolean | habilita tamaño, hielo, azúcar y extras |
| tags | [String] | filtros y recomendaciones |
| featured | Boolean | aparece en inicio |
| active | Boolean | borrado lógico |

### Order
| Campo | Tipo | Nota |
|---|---|---|
| code | String | `LMT-XXXXXX`, único |
| items | [OrderItem] | producto, cantidad, personalización, precio unitario |
| customer | Object | nombre, teléfono, correo |
| address | Object | dirección de entrega y distancia |
| subtotal / deliveryFee / discount / total | Number | calculados en el servidor |
| paymentMethod | Enum | nequi, daviplata, bancolombia, bre-b, tarjeta-demo |
| paymentStatus | Enum | pending, confirmed (solo el admin confirma) |
| status | Enum | recibido, pago-pendiente, pago-confirmado, en-preparacion, en-camino, entregado, cancelado |
| trackingPin | String | 4 dígitos para consultar el pedido |
| createdAt | Date | automático |

### Message
Formulario de contacto: nombre, teléfono/correo, asunto, mensaje, estado (`nuevo`/`leido`) y fecha.

### Settings
Documento único con: marca, contacto, redes, horarios, festivos, dirección del negocio,
radio de cobertura, tarifas por rango, métodos de pago, costo de extras y textos legales.

## 5. API REST

| Método | Ruta | Acceso | Descripción |
|---|---|---|---|
| GET | `/api/health` | público | estado del servicio |
| GET | `/api/products` | público | catálogo con filtros `category`, `q`, `featured` |
| GET | `/api/products/:id` | público | detalle |
| POST | `/api/products` | admin | crear |
| PATCH | `/api/products/:id` | admin | editar |
| DELETE | `/api/products/:id` | admin | desactivar |
| POST | `/api/auth/register` | público | crear cuenta |
| POST | `/api/auth/login` | público | iniciar sesión |
| GET | `/api/auth/me` | cliente | perfil |
| PATCH | `/api/auth/me` | cliente | perfil, direcciones, favoritos |
| GET | `/api/orders` | admin | listado de pedidos |
| POST | `/api/orders` | público | crear pedido (invitado o registrado) |
| GET | `/api/orders/track` | público | seguimiento con código + PIN |
| PATCH | `/api/orders/:id/status` | admin | cambiar estado |
| POST | `/api/messages` | público | formulario de contacto |
| GET | `/api/messages` | admin | bandeja de mensajes |
| PATCH | `/api/messages/:id` | admin | marcar como leído |
| GET | `/api/settings` | público | configuración pública |
| PUT | `/api/settings` | admin | actualizar configuración |
| POST | `/api/ai/chat` | público | LemonATE AI (reglas + catálogo) |

## 6. Reglas de negocio

- **Precios**: el servidor recalcula todo. El cliente nunca envía el total definitivo.
- **Personalización**: tamaño (12/16/22 oz), hielo, azúcar y extras con precio.
- **Domicilio**: se calcula por rangos de distancia; fuera del radio no hay cobertura.
- **Inventario**: al confirmar el pago se descuenta la existencia; si falta, el pedido se rechaza.
- **Pagos**: flujo de demostración. Ningún pedido se marca pagado automáticamente.
- **Seguimiento**: código + PIN de 4 dígitos; sin PIN no se revelan datos personales.
- **Seguridad**: bcrypt para contraseñas, JWT para sesión, Helmet, CORS restringido y
  rate limit en autenticación y formularios.

## 7. Decisiones de diseño

- **Vite + React** por velocidad de desarrollo y build estático compatible con Pages.
- **Modo demostración** en el frontend: si no hay `VITE_API_URL`, la misma interfaz opera
  contra una API simulada en el navegador. Sirve para la publicación en GitHub Pages y
  para exponer sin depender de la red del aula.
- **Datos bilingües** dentro del mismo documento (`{ es, en }`) para evitar colecciones extra.
- **Sin pasarela de pago** en esta entrega: se documenta como mejora futura.
- **Fotografías reales del negocio** integradas en WebP (4:5, 600 × 750 px) y collages
  para los combos. El administrador puede sustituirlas desde el panel; el detalle está
  en [`FOTOS.md`](FOTOS.md).

## 8. Riesgos y limitaciones conocidas

| Riesgo | Mitigación |
|---|---|
| Sin conexión a Atlas en el aula | Modo demostración con datos locales |
| Backend gratuito de Render se suspende | Despertar el servicio antes de la defensa |
| Datos provisionales (dirección, teléfono) | Todo editable desde el panel |
| Sin verificación real de pagos | Flujo marcado como demostración |
