/**
 * Composiciones de los combos.
 *
 * El combo conserva un precio cerrado, pero el cliente elige qué bebida y
 * qué postre lleva cada espacio. Las opciones salen del catálogo compartido
 * para que el navegador y Express validen exactamente lo mismo.
 */

import { SEED_PRODUCTS } from './catalog.js';
import { sizeById } from './pricing.js';

const productBySlug = new Map(SEED_PRODUCTS.map((product) => [product.slug, product]));
const templateBySlug = new Map(
  SEED_PRODUCTS.filter((product) => product.combo).map((product) => [product.slug, product.combo])
);

const pick = (value, lang = 'es') => value?.[lang] || value?.es || '';

export function getComboTemplate(slug) {
  return templateBySlug.get(slug) || null;
}

export function getComboOption(slug) {
  return productBySlug.get(slug) || null;
}

export function comboOptionsFor(template, kind) {
  return (template?.options?.[kind] || [])
    .map((slug) => productBySlug.get(slug))
    .filter(Boolean);
}

/** Valida que todos los espacios del combo tengan una opción permitida. */
export function validateComboSelection(template, customization = {}) {
  if (!template) return { ok: false, value: {}, errors: ['combo'] };

  const raw = customization?.combo;
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) {
    return { ok: false, value: {}, errors: template.slots.map((slot) => slot.id) };
  }

  const value = {};
  const errors = [];
  for (const slot of template.slots) {
    const slug = typeof raw[slot.id] === 'string' ? raw[slot.id] : '';
    const allowed = template.options?.[slot.kind] || [];
    if (!slug || !allowed.includes(slug)) {
      errors.push(slot.id);
    } else {
      value[slot.id] = slug;
    }
  }

  return { ok: errors.length === 0, value, errors };
}

/** Opciones iniciales coherentes para un combo recién abierto. */
export function defaultComboSelection(template, products = []) {
  if (!template) return {};
  const liveBySlug = new Map(products.map((product) => [product.slug, product]));

  return Object.fromEntries(
    template.slots.map((slot, index) => {
      const allowed = template.options?.[slot.kind] || [];
      const isUsable = (slug) => {
        const live = liveBySlug.get(slug);
        if (!live) return true;
        if (live.active === false) return false;
        if (live.availability) return live.availability !== 'soldout';
        return Number(live.stock) > 0;
      };
      const preferred = slot.defaultSlug;
      const fallback = allowed.find(isUsable) || allowed[index % Math.max(allowed.length, 1)] || '';
      return [slot.id, preferred && isUsable(preferred) ? preferred : fallback];
    })
  );
}

function slotText(slot, slug, lang) {
  const option = productBySlug.get(slug);
  const name = option ? pick(option.name, lang) : '—';
  const size = slot.size ? sizeById(slot.size) : null;
  const label = pick(slot.label, lang) || slot.id;
  return `${label}: ${name}${size ? ` (${size.note})` : ''}`;
}

/** Texto legible para carrito, checkout, seguimiento y correo al dueño. */
export function describeCombo(template, customization = {}, lang = 'es') {
  if (!template) return '';
  return template.slots
    .map((slot) => slotText(slot, customization?.combo?.[slot.id] || '', lang))
    .join(' · ');
}

export function describeComboLabels(template, customization = {}) {
  return {
    es: describeCombo(template, customization, 'es'),
    en: describeCombo(template, customization, 'en'),
  };
}

export function comboSizeLabel(template, customization = {}) {
  if (!template) return { es: '', en: '' };
  const sizes = [
    ...new Set(template.slots.filter((slot) => slot.size).map((slot) => slot.size)),
  ];
  if (sizes.length === 0) return { es: '', en: '' };
  const labels = sizes.map((id) => sizeById(id).label);
  return {
    es: labels.map((label) => label.es).join(' / '),
    en: labels.map((label) => label.en).join(' / '),
  };
}
