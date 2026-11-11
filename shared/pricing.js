/**
 * Reglas de precio compartidas entre el frontend y el backend.
 * Se mantiene un único archivo para que el navegador (respaldo local)
 * y Express calculen exactamente lo mismo.
 */

export const SIZES = [
  { id: 'small', oz: 12, delta: 0, label: { es: 'Pequeño', en: 'Small' }, note: '12 oz' },
  { id: 'medium', oz: 16, delta: 2000, label: { es: 'Mediano', en: 'Medium' }, note: '16 oz' },
  { id: 'large', oz: 22, delta: 4000, label: { es: 'Grande', en: 'Large' }, note: '22 oz' },
];

export const ICE_OPTIONS = [
  { id: 'none', delta: 0, label: { es: 'Sin hielo', en: 'No ice' } },
  { id: 'light', delta: 0, label: { es: 'Poco hielo', en: 'Light ice' } },
  { id: 'normal', delta: 0, label: { es: 'Hielo normal', en: 'Regular ice' } },
];

export const SUGAR_OPTIONS = [
  { id: 'none', delta: 0, label: { es: 'Sin azúcar', en: 'No sugar' } },
  { id: 'less', delta: 0, label: { es: 'Menos dulce', en: 'Less sweet' } },
  { id: 'normal', delta: 0, label: { es: 'Normal', en: 'Regular' } },
];

export const EXTRA_GROUPS = [
  { id: 'frutas', label: { es: 'Frutas frescas', en: 'Fresh fruit' } },
  { id: 'toppings', label: { es: 'Hierbas y toppings', en: 'Herbs and toppings' } },
];

export const EXTRAS = [
  { id: 'fresa', group: 'frutas', price: 2000, label: { es: 'Fresa', en: 'Strawberry' } },
  { id: 'mango', group: 'frutas', price: 2000, label: { es: 'Mango', en: 'Mango' } },
  { id: 'maracuya', group: 'frutas', price: 2000, label: { es: 'Maracuyá', en: 'Passion fruit' } },
  { id: 'mora', group: 'frutas', price: 2000, label: { es: 'Mora', en: 'Blackberry' } },
  { id: 'limon', group: 'toppings', price: 1000, label: { es: 'Limón extra', en: 'Extra lemon' } },
  { id: 'hierbabuena', group: 'toppings', price: 1000, label: { es: 'Hierbabuena', en: 'Mint' } },
  { id: 'crema', group: 'toppings', price: 2500, label: { es: 'Crema batida', en: 'Whipped cream' } },
];


export const DEFAULT_DELIVERY = {
  businessAddress: 'Barranquilla, Atlántico, Colombia',
  maxKm: 12,
  ranges: [
    { maxKm: 2, fee: 3000 },
    { maxKm: 5, fee: 5000 },
    { maxKm: 8, fee: 7000 },
    { maxKm: 12, fee: 10000 },
  ],
};

export const TAX_RATE = 0;

export function sizeById(id) {
  return SIZES.find((s) => s.id === id) || SIZES[0];
}

export function extraById(id) {
  return EXTRAS.find((e) => e.id === id);
}

/** Precio unitario de un producto con su personalización. */
export function computeUnitPrice(product, customization = {}) {
  const base = Number(product?.price) || 0;
  if (!product?.customizable) return base;

  let price = base;
  price += sizeById(customization.size).delta;

  const extras = Array.isArray(customization.extras) ? customization.extras : [];
  for (const id of extras) {
    const extra = extraById(id);
    if (extra) price += extra.price;
  }
  return price;
}

/** Costo de domicilio según la distancia en kilómetros. */
export function computeDelivery(distanceKm, config = DEFAULT_DELIVERY) {
  const km = Number(distanceKm);
  const ranges = [...(config?.ranges || DEFAULT_DELIVERY.ranges)].sort((a, b) => a.maxKm - b.maxKm);
  const maxKm = config?.maxKm ?? DEFAULT_DELIVERY.maxKm;

  if (!Number.isFinite(km) || km < 0) {
    return { available: false, fee: 0, reason: 'invalid' };
  }
  if (km > maxKm) {
    return { available: false, fee: 0, reason: 'coverage' };
  }
  const range = ranges.find((r) => km <= r.maxKm);
  if (!range) {
    return { available: false, fee: 0, reason: 'coverage' };
  }
  return { available: true, fee: range.fee, rangeMaxKm: range.maxKm };
}

/** Totales de un pedido. El backend vuelve a calcularlos siempre. */
export function computeTotals(items, deliveryFee = 0, discount = 0) {
  const subtotal = items.reduce((sum, item) => {
    const unit = Number(item.unitPrice) || 0;
    const qty = Math.max(1, Number(item.qty) || 1);
    return sum + unit * qty;
  }, 0);
  const safeDiscount = Math.min(Math.max(0, Number(discount) || 0), subtotal);
  const total = Math.max(0, subtotal - safeDiscount) + Math.max(0, Number(deliveryFee) || 0);
  return { subtotal, discount: safeDiscount, deliveryFee: Number(deliveryFee) || 0, total };
}

export function formatCOP(value, lang = 'es') {
  const amount = Number(value) || 0;
  return new Intl.NumberFormat(lang === 'en' ? 'en-US' : 'es-CO', {
    style: 'currency',
    currency: 'COP',
    maximumFractionDigits: 0,
  }).format(amount);
}

const labelOf = (entry, lang) => entry?.label?.[lang] || entry?.label?.es || '';

/** Texto legible para el carrito: "16 oz · Hielo normal · Sin azúcar · Fresa". */
export function describeCustomization(customization = {}, lang = 'es') {
  if (!customization?.size) return '';
  const size = sizeById(customization.size);
  const ice = ICE_OPTIONS.find((option) => option.id === customization.ice);
  const sugar = SUGAR_OPTIONS.find((option) => option.id === customization.sugar);
  const extras = (customization.extras || [])
    .map((id) => extraById(id))
    .filter(Boolean)
    .map((extra) => labelOf(extra, lang));

  return [size?.oz ? `${size.oz} oz` : '', labelOf(ice, lang), labelOf(sugar, lang), ...extras]
    .filter(Boolean)
    .join(' · ');
}
