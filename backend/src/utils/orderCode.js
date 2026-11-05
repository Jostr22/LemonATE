import crypto from 'node:crypto';

/** Código legible y único para el cliente: LMT-XXXXXX. */
export function generateOrderCode() {
  return `LMT-${crypto.randomInt(100000, 999999)}`;
}

/** PIN de 4 dígitos para consultar el pedido. */
export function generatePin() {
  return String(crypto.randomInt(1000, 9999));
}

export function slugify(value) {
  return String(value)
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80);
}
