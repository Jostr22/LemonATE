import { Product } from '../models/Product.js';
import { Order } from '../models/Order.js';
import { Settings } from '../models/Settings.js';
import { ApiError } from '../utils/ApiError.js';
import { generateOrderCode, generatePin } from '../utils/orderCode.js';
import {
  computeDelivery,
  computeTotals,
  computeUnitPrice,
  sizeById,
} from '../../../shared/pricing.js';

/** Crea el pedido recalculando todos los precios en el servidor. */
export async function createOrder(payload, user) {
  const ids = payload.items.map((item) => item.productId);
  const products = await Product.find({ _id: { $in: ids } });
  const byId = new Map(products.map((product) => [String(product._id), product]));

  const items = payload.items.map((raw) => {
    const product = byId.get(String(raw.productId));
    if (!product || product.active === false) {
      throw ApiError.badRequest('Un producto del carrito ya no está disponible.');
    }
    if (product.stock < raw.qty) {
      throw ApiError.badRequest(`No hay existencias suficientes de ${product.name.es}.`);
    }
    const customization = product.customizable ? raw.customization || {} : {};
    const unitPrice = computeUnitPrice(product, customization);
    return {
      productId: product._id,
      name: product.name,
      category: product.category,
      image: product.image,
      qty: raw.qty,
      customization,
      sizeLabel: product.customizable ? sizeById(customization.size).label : { es: '', en: '' },
      unitPrice,
      lineTotal: unitPrice * raw.qty,
    };
  });

  const settings = await Settings.getMain();
  const delivery = computeDelivery(payload.address.distanceKm, settings.delivery);
  if (!delivery.available) {
    throw ApiError.badRequest(
      `Sin cobertura para ${payload.address.distanceKm} km. El máximo es ${settings.delivery.maxKm} km.`
    );
  }

  const totals = computeTotals(items, delivery.fee, payload.discount || 0);

  let code = generateOrderCode();
  for (let attempt = 0; attempt < 5; attempt++) {
    const exists = await Order.exists({ code });
    if (!exists) break;
    code = generateOrderCode();
  }

  const order = await Order.create({
    code,
    pin: generatePin(),
    userId: user?._id || null,
    items,
    customer: payload.customer,
    address: payload.address,
    ...totals,
    paymentMethod: payload.paymentMethod,
    paymentStatus: 'pending',
    status: 'recibido',
    history: [{ status: 'recibido', at: new Date() }],
  });

  return order;
}

/** Descuenta inventario una sola vez al confirmar el pago. */
export async function confirmPaymentAndStock(order) {
  if (order.paymentStatus === 'confirmed') return order;

  for (const item of order.items) {
    const product = await Product.findById(item.productId);
    if (!product) {
      throw ApiError.badRequest('Un producto del pedido ya no existe.');
    }
    if (product.stock < item.qty) {
      throw ApiError.badRequest(`No hay existencias suficientes de ${product.name.es}.`);
    }
    product.stock -= item.qty;
    await product.save();
  }

  order.paymentStatus = 'confirmed';
  return order;
}

/** Devuelve el inventario si un pedido pagado se cancela. */
export async function restoreStock(order) {
  if (order.paymentStatus !== 'confirmed') return order;
  for (const item of order.items) {
    await Product.findByIdAndUpdate(item.productId, { $inc: { stock: item.qty } });
  }
  order.paymentStatus = 'cancelled';
  return order;
}
