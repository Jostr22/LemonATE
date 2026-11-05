/**
 * LemonATE AI — motor de reglas compartido.
 * No es una IA generativa: interpreta palabras clave y responde con datos
 * reales del catálogo recibido (MongoDB en producción, datos locales en demo).
 * Nunca inventa productos ni precios.
 */

const norm = (text = '') =>
  text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[¿?¡!.,;:()"'“”]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

const money = (value, lang) =>
  new Intl.NumberFormat(lang === 'en' ? 'en-US' : 'es-CO', {
    style: 'currency',
    currency: 'COP',
    maximumFractionDigits: 0,
  }).format(Number(value) || 0);

const T = {
  greet: {
    es: 'Hola, soy LemonATE AI, el asistente virtual de la tienda. Funciono con reglas y con el catálogo real, no con IA generativa. ¿Te recomiendo una limonada o revisamos un pedido?',
    en: 'Hi, I am LemonATE AI, the store virtual assistant. I run on rules and the real catalog, not generative AI. Shall I recommend a lemonade or check an order?',
  },
  thanks: {
    es: 'Con gusto. Si necesitas otra recomendación, aquí estoy.',
    en: 'You are welcome. If you need another recommendation, I am here.',
  },
  hours: {
    es: 'Atendemos de lunes a sábado de 10:00 a. m. a 8:00 p. m. y domingos o festivos de 10:00 a. m. a 4:00 p. m. Solo hacemos domicilios.',
    en: 'We are open Monday to Saturday from 10:00 to 20:00 and Sundays or holidays from 10:00 to 16:00. Delivery only.',
  },
  coverage: {
    es: 'Hacemos domicilios en Barranquilla y municipios cercanos. El costo depende de la distancia: 0–2 km $3.000, 2–5 km $5.000, 5–8 km $7.000 y 8–12 km $10.000. Fuera de 12 km no tenemos cobertura. Puedes confirmar el valor exacto en el checkout.',
    en: 'We deliver in Barranquilla and nearby municipalities. The fee depends on distance: 0–2 km $3,000, 2–5 km $5,000, 5–8 km $7,000 and 8–12 km $10,000. Beyond 12 km there is no coverage. You can confirm the exact fee at checkout.',
  },
  payments: {
    es: 'Aceptamos Nequi, Daviplata, Bancolombia, llaves Bre-B y tarjetas en modo demostración. Ningún pago se marca como confirmado automáticamente: el administrador lo verifica.',
    en: 'We accept Nequi, Daviplata, Bancolombia, Bre-B keys and cards in demo mode. No payment is marked as confirmed automatically: the admin verifies it.',
  },
  contact: {
    es: 'El canal principal es WhatsApp Business; también puedes usar el formulario de contacto del sitio. Un asesor responde en horario de atención.',
    en: 'The main channel is WhatsApp Business; you can also use the site contact form. An advisor replies during opening hours.',
  },
  tracking: {
    es: 'Para consultar un pedido entra a «Seguimiento», escribe el código (por ejemplo LMT-123456) y el PIN de 4 dígitos que recibiste al comprar.',
    en: 'To check an order go to “Tracking”, enter the code (for example LMT-123456) and the 4-digit PIN you received at purchase.',
  },
  sizes: {
    es: 'Las bebidas personalizables vienen en 12 oz (pequeño), 16 oz (mediano, +$2.000) y 22 oz (grande, +$4.000). También eliges hielo, azúcar y extras como fruta, hierbabuena o crema.',
    en: 'Customizable drinks come in 12 oz (small), 16 oz (medium, +$2,000) and 22 oz (large, +$4,000). You also choose ice, sugar and extras such as fruit, mint or cream.',
  },
  allergens: {
    es: 'Los postres y bebidas cremosas pueden contener leche, gluten y huevo. Las limonadas clásicas y los granizados son sin lácteos. Si tienes una alergia, escríbenos por WhatsApp antes de pedir.',
    en: 'Desserts and creamy drinks may contain milk, gluten and egg. Classic lemonades and slushies are dairy free. If you have an allergy, message us on WhatsApp before ordering.',
  },
  fallback: {
    es: 'Puedo ayudarte con recomendaciones, precios, tamaños, ingredientes, horarios, domicilios y seguimiento de pedidos. Prueba con «algo ácido y sin azúcar» o «recomiéndame un postre».',
    en: 'I can help with recommendations, prices, sizes, ingredients, hours, delivery and order tracking. Try “something sour and sugar free” or “recommend a dessert”.',
  },
};

const CHIPS = {
  es: ['Recomiéndame algo', '¿Tienen sin azúcar?', 'Precios', 'Horarios', 'Domicilios'],
  en: ['Recommend something', 'Sugar free?', 'Prices', 'Hours', 'Delivery'],
};

function productLine(product, lang) {
  const name = product.name?.[lang] || product.name?.es;
  const stock = Number(product.stock) || 0;
  const availability =
    stock > 0
      ? lang === 'en'
        ? 'available'
        : 'disponible'
      : lang === 'en'
        ? 'sold out'
        : 'agotado';
  return `• ${name} — ${money(product.price, lang)} (${availability})`;
}

const FLAVOR_MAP = [
  { keys: ['fresa', 'strawberry'], tags: ['frutal', 'dulce'], terms: ['fresa'] },
  { keys: ['mango'], tags: ['tropical', 'dulce'], terms: ['mango'] },
  { keys: ['coco', 'coconut'], tags: ['cremoso', 'tropical'], terms: ['coco'] },
  { keys: ['maracuya', 'passion'], tags: ['tropical', 'acido'], terms: ['maracuya'] },
  { keys: ['mora', 'berry', 'frutos rojos'], tags: ['frutal'], terms: ['mora', 'frutos'] },
  { keys: ['cafe', 'coffee', 'caramelo', 'caramel'], tags: ['cafe'], terms: ['caramelo', 'cafe'] },
  { keys: ['chocolate', 'brownie'], tags: ['chocolate'], terms: ['brownie', 'chocolate'] },
  { keys: ['hierbabuena', 'menta', 'mint'], tags: ['hierbas'], terms: ['hierbabuena'] },
  { keys: ['panela'], tags: ['tradicional'], terms: ['panela'] },
  { keys: ['acido', 'agrio', 'sour'], tags: ['acido'], terms: [] },
  { keys: ['dulce', 'sweet'], tags: ['dulce'], terms: [] },
  { keys: ['cremoso', 'creamy'], tags: ['cremoso'], terms: [] },
  { keys: ['refrescante', 'frio', 'cold', 'fresh'], tags: ['refrescante', 'frio'], terms: [] },
  { keys: ['postre', 'dessert', 'dulcecito'], tags: ['postre'], terms: [], category: 'postres' },
  { keys: ['combo'], tags: ['combo'], terms: [], category: 'combos' },
  { keys: ['limonada', 'lemonade'], tags: ['citrico'], terms: [], category: 'limonadas' },
  { keys: ['frappe', 'granizado', 'slushie'], tags: ['frio'], terms: [], category: 'especiales' },
];

export function buildReply({ message, lang = 'es', products = [], settings } = {}) {
  const q = norm(message);
  const langKey = lang === 'en' ? 'en' : 'es';
  const active = (products || []).filter((p) => p && p.active !== false);
  const chips = CHIPS[langKey];

  const answer = (reply, productIds = []) => ({ reply, chips, productIds });

  if (!q) return answer(T.greet[langKey]);

  if (/(hola|buenas|hello|hi|hey|saludos)/.test(q) && q.length < 28) {
    return answer(T.greet[langKey]);
  }
  if (/(gracias|thanks|thank you|chao|adios|bye)/.test(q)) {
    return answer(T.thanks[langKey]);
  }
  if (/(horario|hora|abren|cierran|open|close|hours)/.test(q)) {
    return answer(T.hours[langKey]);
  }
  if (/(domicilio|envio|envian|cobertura|delivery|shipping|llegan|distancia)/.test(q)) {
    return answer(T.coverage[langKey]);
  }
  if (/(pago|pagar|nequi|daviplata|bancolombia|bre-b|bre b|tarjeta|payment|card)/.test(q)) {
    return answer(T.payments[langKey]);
  }
  if (/(pedido|codigo|seguimiento|rastrear|track|order status)/.test(q)) {
    return answer(T.tracking[langKey]);
  }
  if (/(whatsapp|contacto|contact|asesor|humano|persona|hablar con)/.test(q)) {
    const wa = settings?.contact?.whatsapp;
    const extra = wa
      ? langKey === 'en'
        ? `\nWhatsApp: +${wa}`
        : `\nWhatsApp: +${wa}`
      : '';
    return answer(T.contact[langKey] + extra);
  }
  if (/(tamano|tamanos|oz|onza|size|hielo|azucar|personaliz|extra|sugar|ice)/.test(q)) {
    return answer(T.sizes[langKey]);
  }
  if (/(ingrediente|alergia|alergen|vegano|lactosa|gluten|ingredient|allerg)/.test(q)) {
    return answer(T.allergens[langKey]);
  }

  // Precio de un producto mencionado por nombre
  const mentioned = active.find((p) => {
    const name = norm(p.name?.[langKey] || p.name?.es || '');
    const main = name.split(' ').filter((w) => w.length > 3);
    return main.length > 0 && main.every((w) => q.includes(w));
  });
  if (mentioned) {
    const name = mentioned.name?.[langKey] || mentioned.name?.es;
    const desc = mentioned.description?.[langKey] || mentioned.description?.es;
    const stock = Number(mentioned.stock) || 0;
    const availability =
      stock > 0
        ? langKey === 'en'
          ? `${stock} units available.`
          : `${stock} unidades disponibles.`
        : langKey === 'en'
          ? 'Currently sold out.'
          : 'Por ahora está agotado.';
    return answer(
      `${name}\n${desc}\n${money(mentioned.price, langKey)} · ${availability}`,
      [mentioned._id || mentioned.id].filter(Boolean)
    );
  }

  // Intención de precio general
  if (/(precio|cuanto|vale|cost|price|barato|cheap|economico)/.test(q)) {
    const sorted = [...active].sort((a, b) => a.price - b.price).slice(0, 4);
    const title =
      langKey === 'en' ? 'Our most accessible options:' : 'Nuestras opciones más accesibles:';
    return answer(
      title + '\n' + sorted.map((p) => productLine(p, langKey)).join('\n'),
      sorted.map((p) => p._id || p.id).filter(Boolean)
    );
  }

  // Recomendación por sabor, categoría o etiqueta
  const wants = FLAVOR_MAP.filter((entry) => entry.keys.some((k) => q.includes(k)));
  if (wants.length > 0 || /(recomiend|sugiere|recommend|suggest|algo|que me|antojo)/.test(q)) {
    let pool = active;
    const categories = [...new Set(wants.map((w) => w.category).filter(Boolean))];
    if (categories.length === 1) pool = pool.filter((p) => p.category === categories[0]);
    const tags = wants.flatMap((w) => w.tags);
    const terms = wants.flatMap((w) => w.terms);

    const scored = pool
      .map((p) => {
        let score = 0;
        const pTags = p.tags || [];
        const name = norm(`${p.name?.es} ${p.name?.en} ${p.description?.es}`);
        score += tags.filter((t) => pTags.includes(t)).length * 3;
        score += terms.filter((t) => name.includes(t)).length * 4;
        if (Number(p.stock) === 0) score -= 5;
        if (p.featured) score += 1;
        return { p, score };
      })
      .sort((a, b) => b.score - a.score)
      .filter((x, i) => x.score > 0 || i < 3)
      .slice(0, 3)
      .map((x) => x.p);

    if (scored.length > 0) {
      const intro =
        langKey === 'en'
          ? 'Based on our current catalog I suggest:'
          : 'Según el catálogo actual te sugiero:';
      return answer(
        intro + '\n' + scored.map((p) => productLine(p, langKey)).join('\n'),
        scored.map((p) => p._id || p.id).filter(Boolean)
      );
    }
  }

  // Combinación bebida + postre
  if (/(combinacion|maridaje|pair|combo|acompan|junto)/.test(q)) {
    const drink = active.find((p) => p.category === 'limonadas' && Number(p.stock) > 0);
    const dessert = active.find((p) => p.category === 'postres' && Number(p.stock) > 0);
    if (drink && dessert) {
      const text =
        langKey === 'en'
          ? `A safe pairing: ${drink.name.en} with ${dessert.name.en}.`
          : `Una combinación segura: ${drink.name.es} con ${dessert.name.es}.`;
      return answer(
        text + '\n' + [drink, dessert].map((p) => productLine(p, langKey)).join('\n'),
        [drink._id, dessert._id].filter(Boolean)
      );
    }
  }

  return answer(T.fallback[langKey]);
}

export const AI_CHIPS = CHIPS;
