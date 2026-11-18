/**
 * Pedidos guardados en este navegador.
 *
 * Se guarda el código y el PIN para que el cliente pueda consultar su pedido
 * aunque pierda el papel o cierre la página. No reemplaza al historial de la
 * cuenta: es una red de seguridad local para compras como invitado.
 */

const STORAGE_KEY = 'lemonate.savedOrders.v1';
const EVENT = 'lemonate:saved-orders';
const MAX_ORDERS = 25;

function read() {
  try {
    const raw = JSON.parse(localStorage.getItem(STORAGE_KEY));
    return Array.isArray(raw) ? raw.filter((entry) => entry?.code && entry?.pin) : [];
  } catch {
    return [];
  }
}

function write(orders) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(orders));
  } catch {
    // Si el navegador bloquea el almacenamiento, la app sigue funcionando.
  }
  window.dispatchEvent(new Event(EVENT));
}

export function listSavedOrders() {
  return read();
}

export function saveOrder(order) {
  if (!order?.code || !order?.pin) return;

  const entry = {
    code: order.code,
    pin: String(order.pin),
    createdAt: order.createdAt || new Date().toISOString(),
    total: Number(order.total) || 0,
    deliveryPending: Boolean(order.deliveryPending),
    items: (order.items || []).slice(0, 6).map((item) => ({
      name: item.name,
      qty: item.qty,
    })),
  };

  const others = read().filter((saved) => saved.code !== entry.code);
  write([entry, ...others].slice(0, MAX_ORDERS));
}

export function removeSavedOrder(code) {
  write(read().filter((entry) => entry.code !== code));
}

export function clearSavedOrders() {
  write([]);
}

export function subscribeSavedOrders(callback) {
  window.addEventListener(EVENT, callback);
  return () => window.removeEventListener(EVENT, callback);
}
