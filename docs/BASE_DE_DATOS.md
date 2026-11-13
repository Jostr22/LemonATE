# Guía de la base de datos

Documento práctico para operar MongoDB Atlas sin miedo: dónde está cada dato, cómo
editarlo, qué no tocar y cómo hacer copias de seguridad.

## 1. Dónde vive la información

| Dato | Valor |
|---|---|
| Proveedor | MongoDB Atlas (plan gratuito M0) |
| Cluster | `lemonate` (`lemonate.yttc8mf.mongodb.net`) |
| Base de datos | **`lemonate`** |
| Usuario de base de datos | el definido en Atlas → *Database Access* |
| Acceso a red | `0.0.0.0/0` (necesario para Render) |

La base anterior se llamaba `test` (nombre por defecto de MongoDB cuando la cadena
de conexión no incluye una base). Se copió completa a `lemonate` y quedó como
respaldo de solo lectura.

La aplicación se conecta con una única cadena, la variable `MONGODB_URI`:

```
mongodb+srv://<usuario>:<clave>@lemonate.yttc8mf.mongodb.net/lemonate
```

- En local: `backend/.env`.
- En producción: Render → servicio `lemonate-api` → *Environment*.

Nunca se sube al repositorio: `.env` está en `.gitignore`.

## 2. Colecciones

| Colección | Documentos | Qué guarda |
|---|---|---|
| `products` | catálogo | nombre y descripción bilingües, categoría, precio, stock, imagen, `active` |
| `users` | cuentas | nombre, correo, `passwordHash`, rol (`customer`/`admin`), direcciones, favoritos |
| `orders` | pedidos | ítems, totales, cliente, dirección, estado, `pin` de seguimiento, historial |
| `messages` | contacto | formulario del sitio: nombre, contacto, asunto, mensaje, `status` |
| `settings` | **1 solo documento** | marca, contacto, horarios, cobertura, tarifas de domicilio, métodos de pago |

## 3. Cómo entrar y editar

1. https://cloud.mongodb.com → inicia sesión.
2. Cluster `lemonate` → **Browse Collections**.
3. En la izquierda elige la base `lemonate` y luego la colección.
4. Para buscar: escribe en *Filter*, por ejemplo `{ "slug": "limonada-natural" }`
   o `{ "category": "combos" }` y pulsa **Apply**.
5. Para editar un campo: pasa el cursor por el documento → icono del lápiz →
   cambia el valor → **Update**.

Los cambios se ven al instante en la tienda: el backend lee de Atlas en cada
petición. El frontend guarda el catálogo en memoria mientras la pestaña esté
abierta; si no ves el cambio, recarga con `Ctrl + F5`.

> Lo más seguro para el día a día es usar **Admin → Productos** del sitio, no el
> panel de Atlas: el panel valida tipos, recalcula precios y guarda el historial
> de cambios de forma consistente.

## 4. Reglas de oro

- **No cambies `_id`.** Es la referencia que usan pedidos, favoritos y usuarios.
- **No edites `passwordHash`.** Es un hash bcrypt; si lo rompes, la cuenta no
  podrá iniciar sesión. Para cambiar una contraseña hay que generar un hash nuevo
  con bcrypt, no escribir texto plano.
- **`settings` es un documento único.** No crees otro: la app siempre lee el
  primero (`Settings.getMain()`).
- **Respeta los valores permitidos** en los campos con lista:
  - `products.category`: `limonadas`, `especiales`, `postres`, `combos`
  - `users.role`: `customer`, `admin`
  - `orders.status`: `recibido`, `pago-pendiente`, `pago-confirmado`,
    `en-preparacion`, `en-camino`, `entregado`, `cancelado`
  - `orders.paymentStatus`: `pending`, `confirmed`
  - `messages.status`: `nuevo`, `leido`
- **Precios en pesos enteros**, sin puntos ni símbolos: `12500`, no `$12.500`.
- **`stock: 0`** equivale a «Agotado» en la tienda.
- **`active: false`** oculta el producto sin borrar su historial.

## 5. Usuarios y seguridad de acceso

Hay dos conceptos distintos que suelen confundirse:

| Qué | Dónde se administra | Para qué sirve |
|---|---|---|
| Usuario de base de datos | Atlas → *Database Access* | la credencial que usa el backend para conectarse |
| Usuario de la tienda | colección `users` | las cuentas con las que se entra al sitio (incluido el admin) |

- El usuario de Atlas recomendado tiene el rol **`readWrite` sobre `lemonate`**
  (no `Atlas admin`).
- Si alguna vez se filtra la clave de Atlas, cámbiala en *Database Access* y
  actualiza `MONGODB_URI` en local y en Render.
- `JWT_SECRET` no tiene relación con Atlas: firma las sesiones del sitio. Si lo
  cambias, todos los usuarios deben iniciar sesión de nuevo.

## 6. Copias de seguridad

El plan gratuito **no** incluye snapshots automáticos. Tres formas de respaldar:

**a) Copia dentro del mismo cluster** (rápida, usa el script del proyecto):

```bash
cd backend
node scripts/migrate-db.js --from lemonate --to lemonate_backup --apply
```

Crea la base `lemonate_backup` con todos los documentos e índices. Se puede
restaurar invirtiendo el orden (`--from lemonate_backup --to lemonate`).

**b) Exportación a archivos JSON** con [MongoDB Database Tools](https://www.mongodb.com/try/download/database-tools):

```bash
mongodump --uri="<MONGODB_URI>" --out=respaldo-2026-11-13
```

Para restaurar: `mongorestore --uri="<MONGODB_URI>" respaldo-2026-11-13`.

**c) Exportar desde Atlas:** *Browse Collections* → colección → **Export**.
Sirve para un vistazo rápido, pero no reproduce índices.

## 7. Límites del plan gratuito M0

- 512 MB de almacenamiento (el catálogo actual ocupa menos de 1 MB).
- Conexiones compartidas y rendimiento variable.
- Sin backups automáticos y sin *point-in-time recovery*.
- Si algún día se supera el límite, basta con borrar `lemonate_backup` o pasar a
  un plan pago.

## 8. Cambiar el nombre de la base (procedimiento ya ejecutado)

1. Copiar: `node scripts/migrate-db.js --from test --to lemonate --apply`.
2. Verificar que el número de documentos coincide.
3. Actualizar `MONGODB_URI` en local y en Render añadiendo `/lemonate`.
4. Redeploy del backend y comprobar `/api/health` y `/api/products`.

El origen `test` **no se borra**: es el respaldo. No lo elimines hasta que
confirmes que producción lleva días funcionando sobre `lemonate`.

## 9. Consultas útiles (mongosh o el panel de Atlas)

```js
// Productos agotados
db.products.find({ stock: 0 }, { name: 1, stock: 1 })

// Pedidos de hoy
db.orders.find({ createdAt: { $gte: new Date('2026-11-13') } })

// Total facturado en pedidos entregados
db.orders.aggregate([
  { $match: { status: 'entregado' } },
  { $group: { _id: null, total: { $sum: '$total' } } }
])

// Mensajes sin leer
db.messages.countDocuments({ status: 'nuevo' })

// Ranking de productos más vendidos
db.orders.aggregate([
  { $unwind: '$items' },
  { $group: { _id: '$items.name.es', unidades: { $sum: '$items.qty' } } },
  { $sort: { unidades: -1 } },
  { $limit: 5 }
])
```

## 10. Problemas frecuentes

| Síntoma | Causa probable | Solución |
|---|---|---|
| `/api/products` devuelve `[]` | la URI apunta a otra base | revisar que termine en `/lemonate` |
| `bad auth` en los logs de Render | usuario o clave de Atlas incorrectos | regenerar la clave en *Database Access* |
| `Could not connect to any servers` | IP no permitida | *Network Access* → `0.0.0.0/0` |
| El admin no puede entrar | se editó `passwordHash` a mano | restaurar el usuario desde un respaldo |
| Los cambios no aparecen | caché en memoria del frontend | recargar con `Ctrl + F5` |
