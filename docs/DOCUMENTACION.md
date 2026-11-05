# LemonATE — Documentación académica

## 1. Introducción

LemonATE es una tienda virtual de limonadas, bebidas especiales, postres y combos
elaborados a partir del limón. El proyecto nace como entrega final de un programa de
desarrollo web y busca demostrar, con código real y ejecutable, el recorrido completo de
una aplicación: identidad de marca, catálogo, carrito, pedidos, cuentas, administración,
inteligencia artificial basada en reglas y despliegue.

El sitio se publica en GitHub Pages y la API en Render, con MongoDB Atlas como base de
datos. Cuando el backend no está disponible, el frontend funciona en **modo demostración**
con datos locales, de forma que la tienda siempre puede presentarse.

## 2. Descripción del negocio

| Aspecto | Definición |
|---|---|
| Nombre | LemonATE |
| Eslogan | «Exprime el momento» |
| Actividad | Limonadas, bebidas especiales, postres y combos |
| Cobertura | Barranquilla y municipios cercanos (12 km, configurable) |
| Público | Jóvenes y adultos |
| Personalidad | Fresca, juvenil, atrevida, creativa, energética |
| Canal principal | WhatsApp Business; Instagram y TikTok como contenido |
| Modalidad | Solo domicilios, sin recogida en tienda |

Los precios, la dirección, el teléfono y los datos de pago son **provisionales**. El panel
administrativo permite cambiarlos; no se inventaron datos reales de terceros.

## 3. Objetivos

### Objetivo general

Construir una aplicación web full stack funcional, responsive y publicada, que convierta una
idea de negocio de bebidas cítricas en una experiencia digital completa.

### Objetivos específicos

1. Diseñar una identidad visual coherente con la marca.
2. Implementar un catálogo bilingüe con cuatro categorías y personalización de bebidas.
3. Desarrollar un flujo de compra con carrito, checkout y seguimiento por código y PIN.
4. Implementar registro, inicio de sesión y rutas privadas con contraseñas cifradas.
5. Construir un panel administrativo para productos, existencias, pedidos, mensajes y ajustes.
6. Incorporar un asistente basado en reglas que consulte el catálogo real.
7. Publicar el frontend en GitHub Pages y la API en Render con MongoDB Atlas.
8. Documentar la arquitectura y preparar una defensa comprensible.

## 4. Justificación

El limón es un ingrediente cotidiano y económico. LemonATE lo convierte en el centro de una
propuesta juvenil con combinaciones poco habituales. Digitalizar el negocio resuelve tres
necesidades concretas: mostrar el catálogo sin depender de redes sociales, recibir pedidos
con datos completos y dar seguimiento sin llamadas telefónicas. El proyecto también
justifica académicamente el uso de frontend, backend, base de datos, autenticación y
despliegue en una sola solución.

## 5. Tecnologías utilizadas

| Capa | Tecnología | Uso |
|---|---|---|
| Frontend | HTML5 semántico | Estructura accesible |
| Frontend | CSS3 | Sistema de diseño, responsive, animaciones ligeras |
| Frontend | JavaScript (ES2022) | Lógica del cliente |
| Frontend | React 18 | Componentes, estado y rutas |
| Frontend | React Router 6 | Navegación con `HashRouter` |
| Frontend | Vite 5 | Servidor de desarrollo y build |
| Backend | Node.js 20+ | Entorno de ejecución |
| Backend | Express 4 | API REST |
| Backend | Mongoose 8 | Modelado de MongoDB |
| Base de datos | MongoDB Atlas | Persistencia en la nube |
| Seguridad | bcryptjs, JWT, Helmet, CORS, rate limit | Contraseñas, sesión y protección |
| Validación | Zod | Esquemas de entrada |
| Pruebas | node:test, Supertest, mongodb-memory-server | Integración de la API |
| Verificación UI | Chrome headless + CDP | Recorridos automáticos del frontend |
| Control de versiones | Git + GitHub | Historial y publicación |
| Despliegue | GitHub Pages + Render | Frontend y backend |

## 6. Arquitectura del sistema

```
┌──────────────────────────┐      HTTPS / JSON       ┌──────────────────────────┐
│ Frontend React (Pages)   │ ──────────────────────► │ API Express (Render)     │
│ · componentes y páginas  │ ◄────────────────────── │ · controladores y rutas  │
│ · contextos de estado    │                         │ · servicios de negocio   │
│ · localStorage (carrito, │                         └────────────┬─────────────┘
│   sesión, direcciones)   │                                      │ Mongoose
└───────────┬──────────────┘                                      ▼
            │                                           ┌──────────────────────┐
            └──── modo demostración (sin API) ─────────►│ MongoDB Atlas        │
                 misma interfaz, datos locales          │ users · products     │
                                                        │ orders · messages    │
                                                        │ settings             │
                                                        └──────────────────────┘
```

### Capas del backend

```
backend/src/
├── config/        variables de entorno y conexión
├── models/        esquemas Mongoose
├── controllers/   entrada HTTP y respuestas
├── routes/        endpoints y middleware por recurso
├── middleware/    auth, validación, errores, rate limit
├── services/      reglas de pedido, inventario e IA
└── utils/         códigos, slugs, tokens, errores
```

Flujo: `ruta → auth/validación → controlador → servicio → modelo → MongoDB → JSON`.

## 7. Explicación del frontend

- **Páginas** (`src/pages`): Inicio, Tienda, Producto, Carrito, Checkout, Seguimiento,
  Login, Registro, Cuenta, Admin, Contacto, Marca y 404.
- **Componentes** (`src/components`): cabecera, pie, tarjeta de producto, carrito lateral,
  asistente, ruta protegida e iconos.
- **Contextos**: idioma (ES/EN), autenticación, catálogo/configuración, carrito y avisos.
- **Servicios**: `api.js` decide entre la API real y el backend simulado.
- **Estilos**: variables de marca, base y componentes; diseño responsive desde 320 px.
- **Accesibilidad**: HTML semántico, `aria-*`, foco visible, enlace de salto, textos
  alternativos, contraste alto y respeto por `prefers-reduced-motion`.

El carrito, la sesión en modo demostración, los datos de contacto del checkout y las
direcciones se guardan en `localStorage`. El carrito se conserva entre visitas y puede
editarse o vaciarse.

## 8. Explicación del backend

Express expone una API REST bajo `/api`. Cada recurso tiene su router:

- `/auth`: registro, login, perfil.
- `/products`: catálogo público y CRUD administrativo.
- `/orders`: creación pública, historial, seguimiento y cambio de estado.
- `/messages`: formulario de contacto y bandeja administrativa.
- `/settings`: configuración pública y edición administrativa.
- `/ai`: motor de reglas.

Los controladores no calculan precios: delegan en `orderService`, que usa las mismas
funciones compartidas (`shared/pricing.js`) que el frontend. Así el navegador muestra un
valor y el servidor lo recalcula con la misma regla.

## 9. Diseño de la base de datos

### `users`

| Campo | Tipo | Regla |
|---|---|---|
| name | String | 2–80 caracteres |
| email | String | único, minúsculas |
| passwordHash | String | bcrypt, `select: false` |
| role | Enum | `customer` / `admin` |
| phone | String | opcional |
| addresses | Array | etiqueta, dirección, barrio, notas, distancia |
| favorites | [ObjectId] | referencia a productos |
| timestamps | Date | creación y actualización |

### `products`

| Campo | Tipo | Regla |
|---|---|---|
| slug | String | único |
| name / description | { es, en } | bilingüe |
| category | Enum | limonadas, especiales, postres, combos |
| price | Number | COP, ≥ 0 |
| stock | Number | ≥ 0; 0 ⇒ «Agotado» |
| image | String | ruta o URL reemplazable |
| customizable | Boolean | habilita tamaños y extras |
| tags | [String] | filtros e IA |
| featured / active | Boolean | destacado / borrado lógico |

### `orders`

| Campo | Tipo | Regla |
|---|---|---|
| code | String | `LMT-XXXXXX`, único |
| pin | String | 4 dígitos, solo se entrega al crear |
| items | Array | producto, cantidad, personalización, precios |
| customer | Object | nombre, teléfono, correo |
| address | Object | dirección, barrio, notas, distancia |
| subtotal, deliveryFee, discount, total | Number | calculados en el servidor |
| paymentMethod | Enum | Nequi, Daviplata, Bancolombia, Bre-B, tarjeta |
| paymentStatus | Enum | pending, confirmed, cancelled |
| status | Enum | 7 estados del pedido |
| history | Array | estado y fecha |
| userId | ObjectId | nulo si es invitado |

### `messages`

Nombre, contacto, asunto, mensaje, estado (`nuevo`/`leido`) y fecha.

### `settings`

Documento único (`key: main`) con marca, contacto, redes, horarios, festivos, dirección del
negocio, radio y tarifas de domicilio, métodos de pago y cobertura.

## 10. Explicación de la API

| Método | Ruta | Acceso |
|---|---|---|
| GET | `/api/health` | público |
| GET | `/api/products` | público (`category`, `q`, `featured`) |
| GET | `/api/products/:id` | público |
| POST / PATCH / DELETE | `/api/products` | administrador |
| POST | `/api/auth/register` | público |
| POST | `/api/auth/login` | público |
| GET / PATCH | `/api/auth/me` | cliente autenticado |
| POST | `/api/orders` | público (invitado o cliente) |
| GET | `/api/orders/track` | público con código + PIN |
| GET | `/api/orders/mine` | cliente |
| GET | `/api/orders` | administrador |
| PATCH | `/api/orders/:id/status` | administrador |
| POST | `/api/messages` | público |
| GET / PATCH | `/api/messages` | administrador |
| GET | `/api/settings` | público |
| PUT | `/api/settings` | administrador |
| POST | `/api/ai/chat` | público |

Formato de error: `{ "message": "...", "errors": [{ "field", "message" }] }`.

## 11. Autenticación

1. El registro recibe nombre, correo, contraseña y teléfono.
2. La contraseña se cifra con **bcrypt** (10 rondas) y nunca se devuelve.
3. El login compara el hash y genera un **JWT** con id, rol y nombre (7 días).
4. El frontend guarda el token y lo envía como `Authorization: Bearer`.
5. `requireAuth` valida el token y carga el usuario; `requireAdmin` exige rol `admin`.
6. Las rutas privadas del frontend usan `ProtectedRoute`.
7. En modo demostración se usa SHA-256 con sal y un token local; es solo para la vitrina,
   no para producción. El backend real usa bcrypt y JWT firmados.

## 12. Carrito y pedidos

1. El cliente agrega productos; si la bebida es personalizable elige tamaño, hielo, azúcar
   y extras, y el precio se recalcula al instante.
2. El carrito guarda producto, personalización, cantidad y precio unitario.
3. En el checkout ingresa sus datos y la distancia aproximada.
4. El domicilio se calcula por rangos: 0–2 km $3.000, 2–5 km $5.000, 5–8 km $7.000 y
   8–12 km $10.000 (valores configurables). Fuera del radio se bloquea el pedido.
5. Al confirmar, el servidor vuelve a validar existencias y precios, genera `LMT-XXXXXX` y
   un PIN, y guarda el pedido con estado «Recibido».
6. El cliente consulta el estado con código + PIN; el administrador lo cambia manualmente.
7. Al pasar a «Pago confirmado» se descuenta el inventario una sola vez. Si se cancela un
   pedido pagado, el inventario se devuelve.

```
Recibido → Pago pendiente → Pago confirmado → En preparación → En camino → Entregado
                                                                        ↘ Cancelado
```

## 13. Panel administrativo

Un único administrador accede con correo y contraseña. Puede:

- Ver indicadores (productos activos, pedidos, pendientes, mensajes nuevos).
- Crear, editar y desactivar productos; cambiar precios, existencias, imagen, destacado y
  si es personalizable.
- Consultar pedidos, ver cliente, total y estado; cambiarlo con un selector.
- Leer mensajes del formulario y marcarlos como leídos.
- Editar contacto, redes, horarios, dirección, radio, tarifas y datos de pago.
- En modo demostración, restablecer los datos locales.

## 14. LemonATE AI

Es un **asistente basado en reglas**, no una IA generativa. `shared/aiEngine.js` normaliza el
texto, detecta intención (saludo, horarios, domicilio, pagos, seguimiento, tamaños, alergias,
precio, recomendación o combinación) y responde en español o inglés.

En producción, `POST /api/ai/chat` consulta MongoDB, envía el catálogo real al motor y
filtra los identificadores antes de responder. Por eso no puede inventar productos ni
precios. En modo demostración usa el catálogo local. La interfaz lo presenta explícitamente
como asistente de reglas.

## 15. Instalación y ejecución local

```bash
# 1. Backend
cd backend
npm install
copy .env.example .env      # macOS/Linux: cp .env.example .env
# Edita MONGODB_URI y JWT_SECRET
npm run seed
npm run dev                 # http://localhost:4000/api

# 2. Frontend
cd ../frontend
npm install
copy .env.example .env
npm run dev                 # http://localhost:5173
```

Sin backend o sin `VITE_API_URL`, la tienda arranca en modo demostración. Para probar la API:

```bash
cd backend
npm test
```

## 16. Despliegue

### MongoDB Atlas

1. Crear un clúster gratuito y un usuario de base de datos.
2. Permitir la IP del servicio (o `0.0.0.0/0` solo durante la entrega).
3. Copiar la cadena `mongodb+srv://...` en `MONGODB_URI`.

### Backend en Render

- New → Web Service → repositorio.
- Root Directory: `backend`.
- Build Command: `npm install`; Start Command: `npm start`.
- Variables: `MONGODB_URI`, `JWT_SECRET`, `CORS_ORIGIN`, `NODE_ENV=production`,
  `ADMIN_EMAIL`, `ADMIN_PASSWORD`.
- Ejecutar el seed una vez desde la consola del servicio (`npm run seed`).

### Frontend en GitHub Pages

El workflow `.github/workflows/deploy.yml` compila `frontend/` y publica `dist/` al hacer
push a `main`. En Settings → Pages se elige «GitHub Actions».

- Sin variable `VITE_API_URL`: se publica en modo demostración.
- Con la variable de repositorio `VITE_API_URL=https://tu-servicio.onrender.com/api`: se
  conecta a Render.

## 17. Conclusiones

El proyecto integra las piezas de una aplicación full stack real: interfaz, API, base de
datos, autenticación, reglas de negocio, pruebas y despliegue. La decisión de compartir las
reglas de precio entre cliente y servidor evita discrepancias y facilita explicar el flujo.
El modo demostración garantiza que la entrega pueda mostrarse incluso si la red o el
servicio en la nube fallan.

## 18. Posibles mejoras futuras

- Pasarela de pago real (Wompi, Mercado Pago) con verificación automática.
- Seguimiento GPS e integración con una empresa de domicilios con API.
- Notificaciones por WhatsApp Business API y correo transaccional.
- Cupones, programa de puntos y recuperación de carritos.
- Reseñas verificadas y moderación.
- Panel con roles, auditoría y reportes de ventas.
- Pruebas E2E con Playwright en CI y monitoreo de errores.
- Imágenes fotográficas propias en formato AVIF/WebP.

## Estado y limitaciones (honesto)

| Elemento | Estado |
|---|---|
| Frontend (rutas, catálogo, carrito, checkout, cuentas, admin, IA) | Implementado y probado en Chrome headless (18 comprobaciones) |
| API Express + modelos + autenticación | Implementado y probado con 14 pruebas de integración |
| MongoDB Atlas | Integración por variable de entorno; las pruebas usan MongoDB en memoria |
| Despliegue en Render y Pages | Configuración incluida; requiere que el estudiante conecte sus cuentas |
| Pagos | Solo demostración; no se cobra ni se confirma automáticamente |
| Imágenes | Ilustraciones SVG propias, reemplazables desde el panel; no son fotos reales |
| Datos de contacto y dirección | Provisionales, editables desde el panel |

No se afirma que el sitio esté publicado: el repositorio incluye el workflow y la
configuración, pero la publicación depende de las credenciales del propietario.
