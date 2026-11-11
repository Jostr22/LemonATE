import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import {
  describeComboLabels,
  getComboTemplate,
} from '../../../shared/combos.js';

const CartContext = createContext(null);
const STORAGE_KEY = 'lemonate.cart.v1';

function lineKey(productId, customization = {}) {
  const extras = [...(customization.extras || [])].sort().join(',');
  const combo = Object.entries(customization.combo || {})
    .sort(([slotA], [slotB]) => slotA.localeCompare(slotB))
    .map(([slot, slug]) => `${slot}:${slug}`)
    .join(',');
  return `${productId}|${customization.size || ''}|${customization.ice || ''}|${customization.sugar || ''}|${extras}|${combo}`;
}

export function CartProvider({ children }) {
  const [items, setItems] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
    } catch {
      return [];
    }
  });
  const [open, setOpen] = useState(false);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  }, [items]);

  const add = useCallback((product, customization = {}, qty = 1, unitPrice) => {
    const key = lineKey(product._id, customization);
    const comboTemplate = getComboTemplate(product.slug);
    setItems((current) => {
      const existing = current.find((item) => item.key === key);
      if (existing) {
        return current.map((item) =>
          item.key === key ? { ...item, qty: Math.min(item.qty + qty, 99) } : item
        );
      }
      return [
        ...current,
        {
          key,
          productId: product._id,
          slug: product.slug,
          name: product.name,
          image: product.image,
          category: product.category,
          customizable: Boolean(product.customizable),
          customization: product.customizable || comboTemplate ? customization : {},
          comboLabel: comboTemplate ? describeComboLabels(comboTemplate, customization) : null,
          qty,
          unitPrice,
        },
      ];
    });
    setOpen(true);
  }, []);

  const remove = useCallback((key) => {
    setItems((current) => current.filter((item) => item.key !== key));
  }, []);

  const setQty = useCallback((key, qty) => {
    const value = Math.max(1, Math.min(99, Number(qty) || 1));
    setItems((current) => current.map((item) => (item.key === key ? { ...item, qty: value } : item)));
  }, []);

  const clear = useCallback(() => setItems([]), []);

  const value = useMemo(() => {
    const count = items.reduce((sum, item) => sum + item.qty, 0);
    const subtotal = items.reduce((sum, item) => sum + item.unitPrice * item.qty, 0);
    return {
      items,
      count,
      subtotal,
      open,
      setOpen,
      add,
      remove,
      setQty,
      clear,
    };
  }, [items, open, add, remove, setQty, clear]);

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) throw new Error('useCart debe usarse dentro de CartProvider');
  return context;
}

export { lineKey };
