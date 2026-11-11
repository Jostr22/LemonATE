import { Order } from '../models/Order.js';
import { ApiError } from '../utils/ApiError.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import {
  confirmPaymentAndStock,
  createOrder as createOrderService,
  restoreStock,
} from '../services/orderService.js';
import { notifyOwnerOfOrder } from '../services/ownerNotifier.js';

export const createOrder = asyncHandler(async (req, res) => {
  const order = await createOrderService(req.body, req.user);
  // El correo al dueño no bloquea ni hace fallar el pedido si falla el envío.
  void notifyOwnerOfOrder(order);
  // El PIN solo se entrega al crear el pedido; después se exige junto con el código.
  res.status(201).json({ ...order.toPublic(), pin: order.pin });
});

export const listOrders = asyncHandler(async (_req, res) => {
  const orders = await Order.find().sort({ createdAt: -1 }).limit(200);
  res.json(orders.map((order) => order.toPublic()));
});

export const myOrders = asyncHandler(async (req, res) => {
  const orders = await Order.find({ userId: req.user._id }).sort({ createdAt: -1 });
  res.json(orders.map((order) => order.toPublic()));
});

export const trackOrder = asyncHandler(async (req, res) => {
  const { code, pin } = req.query;
  if (!code || !pin) {
    throw ApiError.badRequest('Escribe el código del pedido y el PIN.');
  }

  const order = await Order.findOne({
    code: String(code).trim().toUpperCase(),
    pin: String(pin).trim(),
  });

  if (!order) throw ApiError.notFound('No encontramos un pedido con esos datos.');

  res.json(order.toPublic());
});

export const updateStatus = asyncHandler(async (req, res) => {
  const { status } = req.body;
  const order = await Order.findById(req.params.id);
  if (!order) throw ApiError.notFound('Pedido no encontrado.');

  if (order.status === status) return res.json(order.toPublic());

  if (order.status === 'cancelado' && status !== 'cancelado') {
    throw ApiError.badRequest('Un pedido cancelado no puede reabrirse.');
  }

  if (status === 'pago-confirmado') {
    await confirmPaymentAndStock(order);
  }

  if (status === 'cancelado') {
    await restoreStock(order);
  }

  order.status = status;
  order.history.push({ status, at: new Date() });
  await order.save();

  res.json(order.toPublic());
});
