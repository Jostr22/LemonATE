/**
 * Servidor de desarrollo con MongoDB en memoria y datos de ejemplo.
 * Sirve para probar el frontend contra la API real sin instalar MongoDB.
 *
 * Uso (dentro de backend/): node scripts/dev-memory.js
 */
process.env.NODE_ENV = process.env.NODE_ENV || 'development';
process.env.JWT_SECRET = process.env.JWT_SECRET || 'clave-local-de-pruebas-con-mas-de-24-caracteres';
process.env.CORS_ORIGIN = process.env.CORS_ORIGIN || 'http://localhost:5174';
process.env.PORT = process.env.PORT || '4001';

const { MongoMemoryServer } = await import('mongodb-memory-server');
const mongo = await MongoMemoryServer.create();
process.env.MONGODB_URI = mongo.getUri();

const bcrypt = (await import('bcryptjs')).default;
const { connectDB } = await import('../src/config/db.js');
const { User } = await import('../src/models/User.js');
const { Product } = await import('../src/models/Product.js');
const { Settings } = await import('../src/models/Settings.js');
const { SEED_PRODUCTS, DEFAULT_SETTINGS } = await import('../../shared/catalog.js');
const { createApp } = await import('../src/app.js');

await connectDB(mongo.getUri());
await Settings.create({ key: 'main', ...DEFAULT_SETTINGS });
await Product.insertMany(SEED_PRODUCTS);
await User.create({
  name: 'Administrador LemonATE',
  email: 'admin@lemonate.com',
  passwordHash: await bcrypt.hash('LemonATE2026', 10),
  role: 'admin',
});

const app = createApp();
const server = app.listen(Number(process.env.PORT), () => {
  console.log(`[dev-memory] API en http://localhost:${process.env.PORT}/api`);
});

const shutdown = async () => {
  server.close(async () => {
    await mongo.stop();
    process.exit(0);
  });
};
process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);
