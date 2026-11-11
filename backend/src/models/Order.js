import mongoose from 'mongoose';

const ORDER_STATUSES = [
  'recibido',
  'pago-pendiente',
  'pago-confirmado',
  'en-preparacion',
  'en-camino',
  'entregado',
  'cancelado',
];

const PAYMENT_METHODS = ['nequi', 'daviplata', 'bancolombia', 'bre-b'];
// Pedidos antiguos: se conserva el valor para poder leerlos y actualizarlos,
// pero ya no se ofrece ni se acepta en pedidos nuevos.
const LEGACY_PAYMENT_METHODS = ['tarjeta'];

const orderItemSchema = new mongoose.Schema(
  {
    productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
    name: {
      es: { type: String, required: true },
      en: { type: String, default: '' },
    },
    category: { type: String, required: true },
    image: { type: String, default: '' },
    qty: { type: Number, required: true, min: 1, max: 99 },
    customization: {
      size: { type: String, enum: ['small', 'medium', 'large', ''] , default: '' },
      ice: { type: String, enum: ['none', 'light', 'normal', ''], default: '' },
      sugar: { type: String, enum: ['none', 'less', 'normal', ''], default: '' },
      extras: { type: [String], default: [] },
      combo: { type: mongoose.Schema.Types.Mixed, default: undefined },
    },
    comboLabel: {
      es: { type: String, default: '' },
      en: { type: String, default: '' },
    },
    sizeLabel: {
      es: { type: String, default: '' },
      en: { type: String, default: '' },
    },
    unitPrice: { type: Number, required: true, min: 0 },
    lineTotal: { type: Number, required: true, min: 0 },
  },
  { _id: false }
);

const orderSchema = new mongoose.Schema(
  {
    code: { type: String, required: true, unique: true, index: true },
    pin: { type: String, required: true },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
    items: { type: [orderItemSchema], validate: [(value) => value.length > 0, 'El pedido no tiene productos'] },
    customer: {
      name: { type: String, required: true, trim: true },
      phone: { type: String, required: true, trim: true },
      email: { type: String, trim: true, default: '' },
    },
    address: {
      line: { type: String, required: true, trim: true },
      neighborhood: { type: String, trim: true, default: '' },
      notes: { type: String, trim: true, default: '' },
      distanceKm: { type: Number, required: true, min: 0 },
    },
    subtotal: { type: Number, required: true, min: 0 },
    deliveryFee: { type: Number, required: true, min: 0 },
    discount: { type: Number, default: 0, min: 0 },
    total: { type: Number, required: true, min: 0 },
    paymentMethod: {
      type: String,
      enum: [...PAYMENT_METHODS, ...LEGACY_PAYMENT_METHODS],
      required: true,
    },
    paymentStatus: { type: String, enum: ['pending', 'confirmed', 'cancelled'], default: 'pending' },
    status: { type: String, enum: ORDER_STATUSES, default: 'recibido' },
    history: {
      type: [
        {
          status: { type: String, enum: ORDER_STATUSES },
          at: { type: Date, default: Date.now },
        },
      ],
      default: [],
    },
  },
  { timestamps: true }
);

orderSchema.methods.toPublic = function toPublic() {
  return {
    _id: this._id,
    code: this.code,
    items: this.items,
    customer: this.customer,
    address: this.address,
    subtotal: this.subtotal,
    deliveryFee: this.deliveryFee,
    discount: this.discount,
    total: this.total,
    paymentMethod: this.paymentMethod,
    paymentStatus: this.paymentStatus,
    status: this.status,
    history: this.history,
    createdAt: this.createdAt,
  };
};

export const Order = mongoose.model('Order', orderSchema);
export { ORDER_STATUSES, PAYMENT_METHODS, LEGACY_PAYMENT_METHODS };
