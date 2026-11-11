/**
 * Carga inicial de datos: catálogo, configuración y administrador.
 * Uso: npm run seed
 */
import bcrypt from 'bcryptjs';
import { assertEnv, env } from './config/env.js';
import { connectDB, disconnectDB } from './config/db.js';
import { User } from './models/User.js';
import { Product } from './models/Product.js';
import { Settings } from './models/Settings.js';
import { SEED_PRODUCTS, DEFAULT_SETTINGS } from '../../shared/catalog.js';
import { slugify } from './utils/orderCode.js';

async function seed() {
  assertEnv();
  await connectDB();

  // Administrador principal
  const passwordHash = await bcrypt.hash(env.admin.password, 10);
  const admin = await User.findOneAndUpdate(
    { email: env.admin.email },
    {
      name: env.admin.name,
      email: env.admin.email,
      passwordHash,
      role: 'admin',
    },
    { upsert: true, new: true, setDefaultsOnInsert: true }
  );
  console.log(`[seed] Administrador: ${admin.email}`);

  // Catálogo
  for (const product of SEED_PRODUCTS) {
    await Product.findOneAndUpdate(
      { slug: product.slug || slugify(product.name.es) },
      { ...product, slug: product.slug || slugify(product.name.es) },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );
  }
  console.log(`[seed] ${SEED_PRODUCTS.length} productos cargados.`);

  // Configuración
  const settings = await Settings.getMain();
  settings.brand = DEFAULT_SETTINGS.brand;
  settings.contact = DEFAULT_SETTINGS.contact;
  settings.hours = DEFAULT_SETTINGS.hours;
  settings.delivery = DEFAULT_SETTINGS.delivery;
  settings.payments = DEFAULT_SETTINGS.payments;
  settings.coverage = DEFAULT_SETTINGS.coverage;
  await settings.save();
  console.log('[seed] Configuración inicial aplicada.');

  await disconnectDB();
  console.log('[seed] Listo.');
}

seed().catch(async (error) => {
  console.error('[seed] Error:', error.message);
  await disconnectDB().catch(() => {});
  process.exit(1);
});
