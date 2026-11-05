/**
 * Modo demostración: implementa la misma API del backend Express pero
 * contra localStorage. Permite publicar la tienda en GitHub Pages y
 * mostrarla sin depender de MongoDB ni de Render.
 *
 * En producción (VITE_API_URL definido) este archivo no se utiliza.
 */
import {
  computeUnitPrice,
  computeDelivery,
  computeTotals,
  sizeById,
} from '../../../shared/pricing.js';
import { SEED_PRODUCTS, DEFAULT_SETTINGS } from '../../../shared/catalog.js';
import { buildReply } from '../../../shared/aiEngine.js';

const KEY = 'lemonate.demo.v1';
const TOKEN_KEY = 'lemonate.demo.token';

const clone = (value) => JSON.parse(JSON.stringify(value));

function read() {
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) return JSON.parse(raw);
  } catch {
    /* almacenamiento no disponible: se reinicia */
  }
  return seed();
}

function write(db) {
  localStorage.setItem(KEY, JSON.stringify(db));
}

function seed() {
  const db = {
    products: SEED_PRODUCTS.map((p, i) => ({ ...clone(p), _id: `p_${String(i + 1).padStart(2, '0')}` })),
    users: [
      {
        _id: 'u_admin',
        name: 'Administrador LemonATE',
        email: 'admin@lemonate.com',
        role: 'admin',
        phone: '',
        addresses: [],
        favorites: [],
        salt: 'demo-admin',
        // Contraseña de demostración: LemonATE2026 (se reemplaza por bcrypt en el backend real)
        passwordHash: null,
        createdAt: new Date().toISOString(),
      },
    ],
    orders: [],
    messages: [],
    settings: clone(DEFAULT_SETTINGS),
    seq: { user: 1, order: 1, message: 1 },
  };
  localStorage.setItem(KEY, JSON.stringify(db));
  hashPassword('LemonATE2026', 'demo-admin').then((hash) => {
    const current = JSON.parse(localStorage.getItem(KEY));
    const admin = current.users.find((u) => u._id === 'u_admin');
    if (admin) {
      admin.passwordHash = hash;
      localStorage.setItem(KEY, JSON.stringify(current));
    }
  });
  return db;
}

/* ---------------- utilidades ---------------- */

function uid(prefix, n) {
  return `${prefix}_${Date.now().toString(36)}${n}${Math.random().toString(36).slice(2, 6)}`;
}

function normalizeEmail(email) {
  return String(email || '').trim().toLowerCase();
}

async function hashPassword(password, salt) {
  const data = new TextEncoder().encode(`${salt}:${password}`);
  const buffer = await crypto.subtle.digest('SHA-256', data);
  return Array.from(new Uint8Array(buffer))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

function publicUser(user) {
  if (!user) return null;
  const { passwordHash, salt, ...rest } = user;
  return rest;
}

function makeToken(user) {
  const payload = { uid: user._id, role: user.role, exp: Date.now() + 1000 * 60 * 60 * 24 * 7 };
  return btoa(unescape(encodeURIComponent(JSON.stringify(payload))));
}

function decodeToken(token) {
  try {
    return JSON.parse(decodeURIComponent(escape(atob(token))));
  } catch {
    return null;
  }
}

function currentUser(db) {
  const token = localStorage.getItem(TOKEN_KEY);
  if (!token) return null;
  const payload = decodeToken(token);
  if (!payload || payload.exp < Date.now()) return null;
  return db.users.find((u) => u._id === payload.uid) || null;
}

function requireAdmin(db) {
  const user = currentUser(db);
  if (!user || user.role !== 'admin') {
    const err = new Error('No autorizado. Inicia sesión como administrador.');
    err.status = 401;
    throw err;
  }
  return user;
}

function requireUser(db) {
  const user = currentUser(db);
  if (!user) {
    const err = new Error('Inicia sesión para continuar.');
    err.status = 401;
    throw err;
  }
  return user;
}

const delay = (result, ms = 120) => new Promise((resolve) => setTimeout(() => resolve(result), ms));

/* ---------------- API ---------------- */

export const localBackend = {
  isDemo: true,

  async listProducts({ category, q, featured } = {}) {
    const db = read();
    let list = db.products.filter((p) => p.active !== false);
    if (category) list = list.filter((p) => p.category === category);
    if (featured) list = list.filter((p) => p.featured);
    if (q) {
      const needle = q.toLowerCase();
      list = list.filter(
        (p) =>
          p.name.es.toLowerCase().includes(needle) ||
          p.name.en.toLowerCase().includes(needle) ||
          (p.tags || []).some((t) => t.includes(needle))
      );
    }
    return delay(clone(list));
  },

  async getProduct(id) {
    const db = read();
    const product = db.products.find((p) => p._id === id);
    if (!product) throw new Error('Producto no encontrado.');
    return delay(clone(product));
  },

  async createProduct(payload) {
    const db = read();
    requireAdmin(db);
    const product = {
      _id: uid('p', db.seq.order),
      slug: payload.slug || `producto-${Date.now()}`,
      name: payload.name || { es: 'Nuevo producto', en: 'New product' },
      description: payload.description || { es: '', en: '' },
      category: payload.category || 'limonadas',
      price: Number(payload.price) || 0,
      stock: Number(payload.stock) || 0,
      image: payload.image || 'products/limonada-natural.svg',
      customizable: Boolean(payload.customizable),
      tags: payload.tags || [],
      featured: Boolean(payload.featured),
      active: true,
    };
    db.products.push(product);
    write(db);
    return delay(clone(product));
  },

  async updateProduct(id, patch) {
    const db = read();
    requireAdmin(db);
    const product = db.products.find((p) => p._id === id);
    if (!product) throw new Error('Producto no encontrado.');
    Object.assign(product, patch);
    write(db);
    return delay(clone(product));
  },

  async removeProduct(id) {
    const db = read();
    requireAdmin(db);
    const product = db.products.find((p) => p._id === id);
    if (!product) throw new Error('Producto no encontrado.');
    product.active = false;
    write(db);
    return delay({ ok: true });
  },

  async register({ name, email, password, phone }) {
    const db = read();
    const cleanEmail = normalizeEmail(email);
    if (!name || !cleanEmail || !password) throw new Error('Completa nombre, correo y contraseña.');
    if (password.length < 8) throw new Error('La contraseña debe tener al menos 8 caracteres.');
    if (db.users.some((u) => u.email === cleanEmail)) throw new Error('Ese correo ya está registrado.');
    const salt = Math.random().toString(36).slice(2, 12);
    const user = {
      _id: uid('u', db.seq.user++),
      name: String(name).trim(),
      email: cleanEmail,
      phone: phone || '',
      role: 'customer',
      addresses: [],
      favorites: [],
      salt,
      passwordHash: await hashPassword(password, salt),
      createdAt: new Date().toISOString(),
    };
    db.users.push(user);
    write(db);
    localStorage.setItem(TOKEN_KEY, makeToken(user));
    return delay({ user: publicUser(user) });
  },

  async login({ email, password }) {
    const db = read();
    const cleanEmail = normalizeEmail(email);
    const user = db.users.find((u) => u.email === cleanEmail);
    if (!user) throw new Error('Correo o contraseña incorrectos.');
    const hash = await hashPassword(password, user.salt);
    if (hash !== user.passwordHash) throw new Error('Correo o contraseña incorrectos.');
    localStorage.setItem(TOKEN_KEY, makeToken(user));
    return delay({ user: publicUser(user) });
  },

  async me() {
    const db = read();
    const user = currentUser(db);
    if (!user) return delay(null);
    return delay({ user: publicUser(user) });
  },

  async updateMe(patch) {
    const db = read();
    const user = requireUser(db);
    const allowed = ['name', 'phone', 'addresses', 'favorites'];
    for (const key of allowed) {
      if (patch[key] !== undefined) user[key] = patch[key];
    }
    write(db);
    return delay({ user: publicUser(user) });
  },

  logout() {
    localStorage.removeItem(TOKEN_KEY);
  },

  async createOrder(payload) {
    const db = read();
    const items = [];
    for (const raw of payload.items || []) {
      const product = db.products.find((p) => p._id === raw.productId);
      if (!product) throw new Error('Un producto del carrito ya no está disponible.');
      const qty = Math.max(1, Number(raw.qty) || 1);
      if (product.stock < qty) {
        throw new Error(`No hay existencias suficientes de ${product.name.es}.`);
      }
      const customization = product.customizable ? raw.customization || {} : {};
      const unitPrice = computeUnitPrice(product, customization);
      items.push({
        productId: product._id,
        name: product.name,
        category: product.category,
        image: product.image,
        qty,
        customization,
        sizeLabel: product.customizable
          ? sizeById(customization.size).label
          : null,
        unitPrice,
        lineTotal: unitPrice * qty,
      });
    }
    if (items.length === 0) throw new Error('El carrito está vacío.');

    const distanceKm = Number(payload.address?.distanceKm);
    const delivery = computeDelivery(distanceKm, db.settings.delivery);
    if (!delivery.available) {
      throw new Error('La dirección está fuera de la cobertura de domicilio.');
    }
    const totals = computeTotals(items, delivery.fee, payload.discount || 0);

    const code = `LMT-${Math.floor(100000 + Math.random() * 899999)}`;
    const pin = String(Math.floor(1000 + Math.random() * 8999));
    const order = {
      _id: uid('o', db.seq.order++),
      code,
      pin,
      items,
      customer: {
        name: payload.customer?.name || 'Invitado',
        phone: payload.customer?.phone || '',
        email: payload.customer?.email || '',
      },
      address: payload.address || {},
      ...totals,
      paymentMethod: payload.paymentMethod || 'nequi',
      paymentStatus: 'pending',
      status: 'recibido',
      userId: currentUser(db)?._id || null,
      createdAt: new Date().toISOString(),
      history: [{ status: 'recibido', at: new Date().toISOString() }],
    };
    db.orders.unshift(order);
    write(db);
    return delay(clone(order));
  },

  async listOrders() {
    const db = read();
    requireAdmin(db);
    return delay(clone(db.orders));
  },

  async myOrders() {
    const db = read();
    const user = requireUser(db);
    return delay(clone(db.orders.filter((o) => o.userId === user._id)));
  },

  async trackOrder({ code, pin }) {
    const db = read();
    const order = db.orders.find(
      (o) => o.code.toUpperCase() === String(code).trim().toUpperCase() && o.pin === String(pin).trim()
    );
    if (!order) throw new Error('Código o PIN incorrectos. Verifica los datos e intenta de nuevo.');
    return delay(clone(order));
  },

  async updateOrderStatus(id, status) {
    const db = read();
    requireAdmin(db);
    const order = db.orders.find((o) => o._id === id);
    if (!order) throw new Error('Pedido no encontrado.');

    // El inventario se descuenta una sola vez, al confirmar el pago.
    if (status === 'pago-confirmado' && order.paymentStatus !== 'confirmed') {
      for (const item of order.items) {
        const product = db.products.find((p) => p._id === item.productId);
        if (!product) continue;
        if (product.stock < item.qty) {
          throw new Error(`No hay existencias suficientes de ${product.name.es}.`);
        }
        product.stock -= item.qty;
      }
      order.paymentStatus = 'confirmed';
    }
    if (status === 'cancelado' && order.paymentStatus === 'confirmed') {
      for (const item of order.items) {
        const product = db.products.find((p) => p._id === item.productId);
        if (product) product.stock += item.qty;
      }
      order.paymentStatus = 'cancelled';
    }
    order.status = status;
    order.history = [...(order.history || []), { status, at: new Date().toISOString() }];
    write(db);
    return delay(clone(order));
  },

  async createMessage(payload) {
    const db = read();
    if (!payload.name || !payload.contact || !payload.subject || !payload.message) {
      throw new Error('Completa todos los campos del formulario.');
    }
    const message = {
      _id: uid('m', db.seq.message++),
      name: payload.name,
      contact: payload.contact,
      subject: payload.subject,
      message: payload.message,
      status: 'nuevo',
      createdAt: new Date().toISOString(),
    };
    db.messages.unshift(message);
    write(db);
    return delay(clone(message));
  },

  async listMessages() {
    const db = read();
    requireAdmin(db);
    return delay(clone(db.messages));
  },

  async markMessage(id) {
    const db = read();
    requireAdmin(db);
    const message = db.messages.find((m) => m._id === id);
    if (message) message.status = 'leido';
    write(db);
    return delay(message ? clone(message) : null);
  },

  async getSettings() {
    const db = read();
    return delay(clone(db.settings));
  },

  async updateSettings(patch) {
    const db = read();
    requireAdmin(db);
    db.settings = { ...db.settings, ...patch };
    write(db);
    return delay(clone(db.settings));
  },

  async chat({ message, lang = 'es' }) {
    const db = read();
    const products = db.products.filter((p) => p.active !== false);
    return delay(buildReply({ message, lang, products, settings: db.settings }), 320);
  },

  /** Solo para la demo: restablecer los datos de ejemplo. */
  async resetDemo() {
    localStorage.removeItem(KEY);
    localStorage.removeItem(TOKEN_KEY);
    return delay({ ok: true });
  },
};
