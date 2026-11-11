/**
 * Aviso al dueño cuando entra un pedido nuevo.
 *
 * Usa la API de Resend por HTTPS (sin SDK adicional). Si no hay clave
 * configurada, el pedido sigue funcionando y el aviso queda en el panel
 * administrativo, que consulta pedidos periódicamente.
 */

import { env } from '../config/env.js';
import { formatCOP } from '../../../shared/pricing.js';

const PAYMENT_LABELS = {
  nequi: 'Nequi',
  daviplata: 'Daviplata',
  bancolombia: 'Bancolombia',
  'bre-b': 'Llaves Bre-B',
  tarjeta: 'Contra entrega (pedido anterior)',
};

const itemLine = (item) => {
  const name = item.name?.es || item.name?.en || 'Producto';
  const combo = item.comboLabel?.es ? `\n     ${item.comboLabel.es}` : '';
  return `• ${item.qty} × ${name} — ${formatCOP(item.lineTotal, 'es')}${combo}`;
};

function buildText(order) {
  const placedAt = new Date(order.createdAt).toLocaleString('es-CO', {
    timeZone: 'America/Bogota',
  });
  const notes = order.address?.notes ? `\nNotas: ${order.address.notes}` : '';

  return [
    `Pedido ${order.code}`,
    `Recibido: ${placedAt}`,
    '',
    `Cliente: ${order.customer?.name || '—'}`,
    `Teléfono: ${order.customer?.phone || '—'}`,
    `Correo: ${order.customer?.email || '—'}`,
    `Dirección: ${order.address?.line || '—'}, ${order.address?.neighborhood || ''}`,
    `Distancia: ${order.address?.distanceKm ?? '—'} km${notes}`,
    '',
    'Productos:',
    ...order.items.map(itemLine),
    '',
    `Subtotal: ${formatCOP(order.subtotal, 'es')}`,
    `Domicilio: ${formatCOP(order.deliveryFee, 'es')}`,
    `Total: ${formatCOP(order.total, 'es')}`,
    `Pago: ${PAYMENT_LABELS[order.paymentMethod] || order.paymentMethod}`,
    '',
    'Abre el panel administrativo para confirmar el pago y cambiar el estado.',
  ].join('\n');
}

export async function notifyOwnerOfOrder(order) {
  const { ownerEmail, resendApiKey, fromEmail } = env.notifications;
  if (!resendApiKey || !ownerEmail) {
    return { sent: false, reason: 'not-configured' };
  }

  const signal =
    typeof AbortSignal !== 'undefined' && typeof AbortSignal.timeout === 'function'
      ? AbortSignal.timeout(8000)
      : undefined;

  try {
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${resendApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: fromEmail,
        to: [ownerEmail],
        subject: `Nuevo pedido ${order.code} · ${formatCOP(order.total, 'es')}`,
        text: buildText(order),
      }),
      signal,
    });

    if (!response.ok) {
      const detail = await response.text().catch(() => '');
      console.warn(`[notify] Resend respondió ${response.status}: ${detail.slice(0, 200)}`);
      return { sent: false, reason: `resend-${response.status}` };
    }

    return { sent: true };
  } catch (error) {
    console.warn(`[notify] No se pudo enviar el correo al dueño: ${error.message}`);
    return { sent: false, reason: 'network' };
  }
}
