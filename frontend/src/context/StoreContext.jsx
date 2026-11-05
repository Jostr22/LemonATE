import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { api } from '../services/api.js';
import { DEFAULT_SETTINGS } from '../../../shared/catalog.js';

const StoreContext = createContext(null);

export function StoreProvider({ children }) {
  const [products, setProducts] = useState([]);
  const [settings, setSettings] = useState(DEFAULT_SETTINGS);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const refresh = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [productList, currentSettings] = await Promise.all([api.listProducts(), api.getSettings()]);
      setProducts(productList);
      setSettings(currentSettings || DEFAULT_SETTINGS);
    } catch (err) {
      setError(err.message || 'No se pudo cargar la tienda.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const value = useMemo(
    () => ({
      products,
      settings,
      loading,
      error,
      refresh,
      setProducts,
      setSettings,
      featured: products.filter((p) => p.featured).slice(0, 8),
      byCategory: (category) => products.filter((p) => p.category === category),
    }),
    [products, settings, loading, error, refresh]
  );

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}

export function useStore() {
  const context = useContext(StoreContext);
  if (!context) throw new Error('useStore debe usarse dentro de StoreProvider');
  return context;
}
