/**
 * Pruebas de integración de la API con MongoDB en memoria.
 * Ejecutar: npm test (dentro de backend/)
 */
import { after, before, describe, it } from 'node:test';
import assert from 'node:assert/strict';

process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = 'secreto-de-pruebas-con-mas-de-24-caracteres';
process.env.ADMIN_EMAIL = 'admin@test.com';
process.env.ADMIN_PASSWORD = 'LemonATE2026';
process.env.CORS_ORIGIN = 'http://localhost:5173';

const { MongoMemoryServer } = await import('mongodb-memory-server');
const { default: mongoose } = await import('mongoose');
const { default: request } = await import('supertest');
const bcrypt = (await import('bcryptjs')).default;

let mongo;
let app;
let User;
let Product;
let Settings;
let adminToken;
let customerToken;

before(async () => {
  mongo = await MongoMemoryServer.create();
  process.env.MONGODB_URI = mongo.getUri();

  const { connectDB } = await import('../src/config/db.js');
  await connectDB(mongo.getUri());

  ({ User } = await import('../src/models/User.js'));
  ({ Product } = await import('../src/models/Product.js'));
  ({ Settings } = await import('../src/models/Settings.js'));
  const { createApp } = await import('../src/app.js');
  const { SEED_PRODUCTS, DEFAULT_SETTINGS } = await import('../../shared/catalog.js');

  app = createApp();

  await Settings.create({ key: 'main', ...DEFAULT_SETTINGS });
  await Product.create(
    SEED_PRODUCTS.map((product) => ({
      ...product,
      price: product.price,
    }))
  );
  await User.create({
    name: 'Administrador',
    email: 'admin@test.com',
    passwordHash: await bcrypt.hash('LemonATE2026', 10),
    role: 'admin',
  });
});

after(async () => {
  await mongoose.connection.close();
  await mongo.stop();
});

describe('LemonATE API', () => {
  it('responde el estado del servicio', async () => {
    const response = await request(app).get('/api/health');
    assert.equal(response.status, 200);
    assert.equal(response.body.ok, true);
  });

  it('lista el catálogo público', async () => {
    const response = await request(app).get('/api/products');
    assert.equal(response.status, 200);
    assert.ok(response.body.length >= 20);
    assert.ok(response.body.every((product) => product.active !== false));
  });

  it('registra un cliente y devuelve token', async () => {
    const response = await request(app).post('/api/auth/register').send({
      name: 'Cliente Prueba',
      email: 'cliente@test.com',
      password: 'password123',
      phone: '3001234567',
    });
    assert.equal(response.status, 201);
    assert.ok(response.body.token);
    assert.equal(response.body.user.role, 'customer');
    assert.equal(response.body.user.passwordHash, undefined);
    customerToken = response.body.token;
  });

  it('rechaza un registro duplicado', async () => {
    const response = await request(app).post('/api/auth/register').send({
      name: 'Cliente Prueba',
      email: 'cliente@test.com',
      password: 'password123',
    });
    assert.equal(response.status, 409);
  });

  it('inicia sesión del administrador', async () => {
    const response = await request(app)
      .post('/api/auth/login')
      .send({ email: 'admin@test.com', password: 'LemonATE2026' });
    assert.equal(response.status, 200);
    assert.equal(response.body.user.role, 'admin');
    adminToken = response.body.token;
  });

  it('rechaza credenciales inválidas', async () => {
    const response = await request(app)
      .post('/api/auth/login')
      .send({ email: 'admin@test.com', password: 'incorrecta' });
    assert.equal(response.status, 401);
  });

  it('crea un pedido, calcula domicilio y permite seguimiento', async () => {
    const products = await request(app).get('/api/products');
    const lemonade = products.body.find((product) => product.category === 'limonadas');
    const dessert = products.body.find((product) => product.category === 'postres');

    const response = await request(app)
      .post('/api/orders')
      .set('Authorization', `Bearer ${customerToken}`)
      .send({
        items: [
          { productId: lemonade._id, qty: 2, customization: { size: 'large', ice: 'normal', sugar: 'less', extras: ['limon'] } },
          { productId: dessert._id, qty: 1 },
        ],
        customer: { name: 'Cliente Prueba', phone: '3001234567', email: 'cliente@test.com' },
        address: { line: 'Calle 1 #2-3', neighborhood: 'Centro', distanceKm: 3 },
        paymentMethod: 'nequi',
      });

    assert.equal(response.status, 201);
    assert.match(response.body.code, /^LMT-\d{6}$/);
    assert.equal(response.body.deliveryFee, 5000);
    assert.equal(response.body.items[0].unitPrice, lemonade.price + 4000 + 1000);
    assert.equal(response.body.status, 'recibido');

    const track = await request(app)
      .get(`/api/orders/track?code=${response.body.code}&pin=${response.body.pin}`);
    assert.equal(track.status, 200);
    assert.equal(track.body.code, response.body.code);

    const wrong = await request(app)
      .get(`/api/orders/track?code=${response.body.code}&pin=0000`);
    assert.equal(wrong.status, 404);
  });

  it('rechaza pedidos fuera de cobertura', async () => {
    const products = await request(app).get('/api/products');
    const response = await request(app)
      .post('/api/orders')
      .send({
        items: [{ productId: products.body[0]._id, qty: 1 }],
        customer: { name: 'Cliente', phone: '3000000000' },
        address: { line: 'Muy lejos', distanceKm: 40 },
        paymentMethod: 'nequi',
      });
    assert.equal(response.status, 400);
  });

  it('protege las rutas de administración', async () => {
    const response = await request(app)
      .get('/api/orders')
      .set('Authorization', `Bearer ${customerToken}`);
    assert.equal(response.status, 403);

    const anonymous = await request(app).get('/api/orders');
    assert.equal(anonymous.status, 401);
  });

  it('descuenta inventario al confirmar el pago', async () => {
    const orders = await request(app)
      .get('/api/orders')
      .set('Authorization', `Bearer ${adminToken}`);
    const order = orders.body[0];

    const before = await Product.findById(order.items[0].productId);
    const stockBefore = before.stock;

    const response = await request(app)
      .patch(`/api/orders/${order._id}/status`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ status: 'pago-confirmado' });

    assert.equal(response.status, 200);
    assert.equal(response.body.paymentStatus, 'confirmed');

    const afterProduct = await Product.findById(order.items[0].productId);
    assert.equal(afterProduct.stock, stockBefore - order.items[0].qty);
  });

  it('crea, actualiza y desactiva productos como administrador', async () => {
    const created = await request(app)
      .post('/api/products')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        name: { es: 'Limonada de prueba', en: 'Test lemonade' },
        description: { es: 'Producto de prueba', en: 'Test product' },
        category: 'limonadas',
        price: 9500,
        stock: 12,
        image: 'products/limonada-natural.svg',
        customizable: true,
      });

    assert.equal(created.status, 201);

    const updated = await request(app)
      .patch(`/api/products/${created.body._id}`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ price: 10500 });

    assert.equal(updated.status, 200);
    assert.equal(updated.body.price, 10500);

    const removed = await request(app)
      .delete(`/api/products/${created.body._id}`)
      .set('Authorization', `Bearer ${adminToken}`);
    assert.equal(removed.status, 200);
    assert.equal(removed.body.product.active, false);
  });

  it('guarda mensajes de contacto y los lista solo al administrador', async () => {
    const created = await request(app).post('/api/messages').send({
      name: 'Persona',
      contact: '3001112233',
      subject: 'Consulta',
      message: 'Quisiera saber si tienen cobertura en mi barrio.',
    });
    assert.equal(created.status, 201);

    const forbidden = await request(app)
      .get('/api/messages')
      .set('Authorization', `Bearer ${customerToken}`);
    assert.equal(forbidden.status, 403);

    const list = await request(app)
      .get('/api/messages')
      .set('Authorization', `Bearer ${adminToken}`);
    assert.equal(list.status, 200);
    assert.ok(list.body.length >= 1);
  });

  it('responde con el motor de reglas usando el catálogo real', async () => {
    const response = await request(app)
      .post('/api/ai/chat')
      .send({ message: 'recomiéndame algo ácido y sin azúcar', lang: 'es' });

    assert.equal(response.status, 200);
    assert.ok(response.body.reply.length > 0);
    assert.ok(Array.isArray(response.body.productIds));
    for (const id of response.body.productIds) {
      assert.ok(await Product.exists({ _id: id }), 'El id recomendado debe existir');
    }
  });

  it('actualiza la configuración y la expone públicamente', async () => {
    const updated = await request(app)
      .put('/api/settings')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ delivery: { maxKm: 15 } });

    assert.equal(updated.status, 200);
    assert.equal(updated.body.delivery.maxKm, 15);

    const publicSettings = await request(app).get('/api/settings');
    assert.equal(publicSettings.status, 200);
    assert.equal(publicSettings.body.delivery.maxKm, 15);
  });
});
