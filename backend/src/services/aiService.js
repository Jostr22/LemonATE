import { Product } from '../models/Product.js';
import { Settings } from '../models/Settings.js';
import { buildReply } from '../../../shared/aiEngine.js';

/**
 * LemonATE AI: motor de reglas. Consulta el catálogo real en MongoDB
 * y responde en el idioma solicitado. No inventa productos ni precios.
 */
export async function chat({ message, lang = 'es' }) {
  const [products, settings] = await Promise.all([
    Product.find({ active: true }).lean(),
    Settings.getMain(),
  ]);

  const result = buildReply({ message, lang, products, settings });

  // Solo devuelve ids que existan realmente en el catálogo.
  const validIds = new Set(products.map((product) => String(product._id)));
  const productIds = (result.productIds || []).filter((id) => validIds.has(String(id)));

  return { ...result, productIds };
}
