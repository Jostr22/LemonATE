/**
 * LemonATE AI — motor de respuestas de la tienda.
 *
 * Interpreta la intención del mensaje y responde con el catálogo y la
 * configuración reales (MongoDB en producción, datos locales en la demo).
 * Es determinista: no inventa productos, precios, horarios ni medios de pago.
 */

import { EXTRAS, SIZES } from './pricing.js';

const norm = (text = '') =>
  String(text)
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[¿?¡!.,;:()"'“”]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

const pick = (value, lang = 'es') => value?.[lang] || value?.es || '';

const money = (value, lang) =>
  new Intl.NumberFormat(lang === 'en' ? 'en-US' : 'es-CO', {
    style: 'currency',
    currency: 'COP',
    maximumFractionDigits: 0,
  }).format(Number(value) || 0);

const CATEGORY_LABELS = {
  limonadas: { es: 'Limonadas', en: 'Lemonades' },
  especiales: { es: 'Bebidas especiales', en: 'Special drinks' },
  postres: { es: 'Postres', en: 'Desserts' },
  combos: { es: 'Combos', en: 'Combos' },
};

const PAYMENT_LABELS = [
  ['nequi', 'Nequi'],
  ['daviplata', 'Daviplata'],
  ['bancolombia', 'Bancolombia'],
  ['breB', 'Bre-B'],
];

/* ------------------------------------------------------------------ */
/* Horarios, domicilios y datos del negocio                            */
/* ------------------------------------------------------------------ */

function hourLabel(value, lang) {
  const [rawHour, rawMinute] = String(value || '').split(':').map(Number);
  if (!Number.isFinite(rawHour)) return '';
  const hour = rawHour % 12 || 12;
  const minute = String(Number.isFinite(rawMinute) ? rawMinute : 0).padStart(2, '0');
  const suffix = rawHour >= 12 ? 'PM' : 'AM';
  return `${hour}:${minute} ${suffix}`;
}

function minutesOf(value) {
  const [hour, minute] = String(value || '').split(':').map(Number);
  if (!Number.isFinite(hour)) return null;
  return hour * 60 + (Number.isFinite(minute) ? minute : 0);
}

function bogotaNow() {
  try {
    const parts = new Intl.DateTimeFormat('en-US', {
      timeZone: 'America/Bogota',
      weekday: 'short',
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    }).formatToParts(new Date());
    const map = Object.fromEntries(parts.map((part) => [part.type, part.value]));
    return {
      weekday: map.weekday,
      minutes: (Number(map.hour) % 24) * 60 + Number(map.minute),
      date: `${map.year}-${map.month}-${map.day}`,
    };
  } catch {
    return null;
  }
}

function hoursText(settings, lang) {
  const weekdays = settings?.hours?.weekdays || { open: '10:00', close: '20:00' };
  const sunday = settings?.hours?.sunday || { open: '10:00', close: '16:00' };
  const now = bogotaNow();
  const isHoliday = now && (settings?.holidays || []).includes(now.date);
  const sundaySchedule = now?.weekday === 'Sun' || isHoliday;
  const slot = sundaySchedule ? sunday : weekdays;
  const open = minutesOf(slot.open);
  const close = minutesOf(slot.close);
  const state =
    now && open !== null && close !== null
      ? now.minutes >= open && now.minutes < close
        ? lang === 'en'
          ? 'We are open right now.'
          : 'Ahora mismo estamos abiertos.'
        : lang === 'en'
          ? 'We are closed right now.'
          : 'Ahora mismo estamos cerrados.'
      : '';

  const schedule =
    lang === 'en'
      ? `Monday to Saturday: ${hourLabel(weekdays.open, lang)} to ${hourLabel(weekdays.close, lang)}. Sundays and holidays: ${hourLabel(sunday.open, lang)} to ${hourLabel(sunday.close, lang)}.`
      : `Lunes a sábado: ${hourLabel(weekdays.open, lang)} a ${hourLabel(weekdays.close, lang)}. Domingos y festivos: ${hourLabel(sunday.open, lang)} a ${hourLabel(sunday.close, lang)}.`;

  return [schedule, state].filter(Boolean).join(' ');
}

function deliveryText(settings, lang) {
  const maxKm = Number(settings?.delivery?.maxKm) || 12;
  const ranges = [...(settings?.delivery?.ranges || [])].sort((a, b) => a.maxKm - b.maxKm);
  const fees = ranges
    .map((range, index) => {
      const from = index === 0 ? 0 : ranges[index - 1].maxKm;
      return `${from}–${range.maxKm} km: ${money(range.fee, lang)}`;
    })
    .join(' · ');

  return lang === 'en'
    ? `We deliver in Barranquilla and nearby municipalities, up to ${maxKm} km. Fees: ${fees}. You can confirm the exact fee at checkout.`
    : `Hacemos domicilios en Barranquilla y municipios cercanos, hasta ${maxKm} km. Tarifas: ${fees}. El valor exacto se confirma en el checkout.`;
}

function paymentsText(lang) {
  const labels = PAYMENT_LABELS.map(([, label]) => (typeof label === 'string' ? label : pick(label, lang)));
  return lang === 'en'
    ? `We accept ${labels.join(', ')}. We do not take card payments. After you place the order we share the payment details on WhatsApp, and the team confirms it manually.`
    : `Aceptamos ${labels.join(', ')}. No recibimos pagos con tarjeta. Al confirmar el pedido te compartimos los datos de pago por WhatsApp y el equipo lo verifica.`;
}

function contactText(settings, lang) {
  const whatsapp = String(settings?.contact?.whatsapp || '').replace(/\D/g, '');
  const extra = whatsapp ? (lang === 'en' ? `\nWhatsApp: +${whatsapp}` : `\nWhatsApp: +${whatsapp}`) : '';
  return lang === 'en'
    ? `The fastest channel is WhatsApp. You can also use the contact form.${extra}`
    : `El canal más rápido es WhatsApp. También puedes usar el formulario de contacto.${extra}`;
}

function trackingText(lang) {
  return lang === 'en'
    ? 'Go to “Tracking”, enter the order code (for example LMT-123456) and the 4-digit PIN you received when ordering.'
    : 'Entra a «Seguimiento», escribe el código del pedido (por ejemplo LMT-123456) y el PIN de 4 dígitos que recibiste al comprar.';
}

function locationText(settings, lang) {
  const address = settings?.delivery?.businessAddress || 'Barranquilla, Atlántico, Colombia';
  const coverage = pick(settings?.coverage, lang) || pick(settings?.coverage, 'es');
  return lang === 'en'
    ? `We are located in ${address}. Delivery coverage: ${coverage}. You can choose delivery or pickup at checkout.`
    : `Estamos ubicados en ${address}. Cobertura de domicilios: ${coverage}. En el checkout eliges domicilio o recogida.`;
}

function cancellationText(settings, lang) {
  const whatsapp = String(settings?.contact?.whatsapp || '').replace(/\D/g, '');
  const suffix = whatsapp
    ? lang === 'en'
      ? `\nWhatsApp: +${whatsapp}`
      : `\nWhatsApp: +${whatsapp}`
    : '';
  return lang === 'en'
    ? `If the order has not been prepared yet, we can cancel it. Message us on WhatsApp with the order code as soon as possible.${suffix}`
    : `Si el pedido aún no entró a preparación, podemos cancelarlo. Escríbenos por WhatsApp con el código del pedido lo antes posible.${suffix}`;
}

function pickupText(lang) {
  return lang === 'en'
    ? 'We work with delivery and pickup orders. You can place the order here and coordinate pickup on WhatsApp.'
    : 'Trabajamos con domicilio y pedidos para recoger. Puedes hacer el pedido aquí y coordinar la recogida por WhatsApp.';
}

function hotDrinksText(lang) {
  return lang === 'en'
    ? 'All our drinks are served cold. We do not offer hot drinks, coffee or alcohol.'
    : 'Todas nuestras bebidas se sirven frías. No ofrecemos bebidas calientes, café ni alcohol.';
}

function orderHelpText(lang) {
  return lang === 'en'
    ? 'Choose your products, add them to the cart and confirm the order at checkout. You will receive an order code and a 4-digit PIN to track it. Payment details are shared on WhatsApp after confirmation.'
    : 'Elige tus productos, agrégalos al carrito y confirma el pedido en el checkout. Al final recibes un código de pedido y un PIN de 4 dígitos para seguirlo. Los datos de pago se comparten por WhatsApp al confirmar.';
}

function changeOrderText(settings, lang) {
  const whatsapp = String(settings?.contact?.whatsapp || '').replace(/\D/g, '');
  const suffix = whatsapp ? `\nWhatsApp: +${whatsapp}` : '';
  return lang === 'en'
    ? `If you need to change an order, message us on WhatsApp with the order code as soon as possible. If it has not been prepared yet, we can adjust it.${suffix}`
    : `Si necesitas cambiar un pedido, escríbenos por WhatsApp con el código lo antes posible. Si aún no entró a preparación, podemos ajustarlo.${suffix}`;
}

function etaText(lang) {
  return lang === 'en'
    ? 'Preparation usually takes 15 to 25 minutes. Delivery time depends on the distance and the order volume; we confirm an estimate on WhatsApp when the order is placed.'
    : 'La preparación suele tomar entre 15 y 25 minutos. El domicilio depende de la distancia y del volumen de pedidos; al confirmar te damos un estimado por WhatsApp.';
}

function nutritionText(lang) {
  return lang === 'en'
    ? 'We do not have a published calorie or nutrition table yet. Most lemonades can be adjusted for less sugar or no sugar. If you have a specific dietary need, message us on WhatsApp.'
    : 'Todavía no tenemos una tabla publicada de calorías o nutrición. La mayoría de limonadas se pueden ajustar con menos azúcar o sin azúcar. Si tienes una necesidad dietética específica, escríbenos por WhatsApp.';
}

function eventsText(settings, lang) {
  const whatsapp = String(settings?.contact?.whatsapp || '').replace(/\D/g, '');
  return lang === 'en'
    ? `For offices, events or group orders we recommend our combos. Tell us the number of people on WhatsApp${whatsapp ? ` (+${whatsapp})` : ''} and we prepare a proposal.`
    : `Para oficinas, eventos o pedidos grupales te recomendamos los combos. Cuéntanos cuántas personas son por WhatsApp${whatsapp ? ` (+${whatsapp})` : ''} y preparamos una propuesta.`;
}

function sizesText(lang) {
  const sizes = SIZES.map((size) => {
    const price = size.delta > 0 ? ` (+${money(size.delta, lang)})` : '';
    return `${size.oz} oz ${pick(size.label, lang).toLowerCase()}${price}`;
  }).join(', ');
  const extras = EXTRAS.map((extra) => pick(extra.label, lang).toLowerCase()).join(', ');
  return lang === 'en'
    ? `Customizable drinks come in ${sizes}. You also choose ice, sugar and extras such as ${extras}.`
    : `Las bebidas personalizables vienen en ${sizes}. También eliges hielo, azúcar y extras como ${extras}.`;
}

function sugarText(lang) {
  return lang === 'en'
    ? 'Yes. All customizable drinks can be ordered with no sugar, less sweet or regular sweetness, at no extra cost. You choose it when adding the product to the cart.'
    : 'Sí. Todas las bebidas personalizables se pueden pedir sin azúcar, menos dulce o con dulzor normal, sin costo adicional. Lo eliges al agregar el producto al carrito.';
}

function veganText(lang) {
  return lang === 'en'
    ? 'Most classic lemonades are dairy free and can be vegan if you skip the whipped cream. Desserts and creamy drinks may contain milk, egg or gluten. Tell us your restriction on WhatsApp and we confirm the specific product.'
    : 'La mayoría de limonadas clásicas son sin lácteos y pueden ser veganas si no agregas crema batida. Los postres y bebidas cremosas pueden contener leche, huevo o gluten. Cuéntanos tu restricción por WhatsApp y confirmamos el producto exacto.';
}

function allergensText(lang) {
  return lang === 'en'
    ? 'Desserts and creamy drinks may contain milk, gluten and egg. Classic lemonades are dairy free. If you have an allergy, message us on WhatsApp before ordering.'
    : 'Los postres y bebidas cremosas pueden contener leche, gluten y huevo. Las limonadas clásicas son sin lácteos. Si tienes una alergia, escríbenos por WhatsApp antes de pedir.';
}

/* ------------------------------------------------------------------ */
/* Catálogo                                                            */
/* ------------------------------------------------------------------ */

function availability(product, lang) {
  const stock = Number(product?.stock);
  if (!Number.isFinite(stock) || stock <= 0) return lang === 'en' ? 'sold out' : 'agotado';
  if (stock <= 5) return lang === 'en' ? 'last units' : 'últimas unidades';
  return lang === 'en' ? 'available' : 'disponible';
}

function productLine(product, lang) {
  return `• ${pick(product.name, lang)} — ${money(product.price, lang)} (${availability(product, lang)})`;
}

function matchProduct(query, products, lang) {
  const qWords = new Set(query.split(' ').filter(Boolean));
  const scored = [];

  for (const product of products) {
    const name = norm(pick(product.name, lang));
    const nameEs = norm(pick(product.name, 'es'));
    const nameEn = norm(pick(product.name, 'en'));
    let score = 0;

    for (const candidate of [name, nameEs, nameEn]) {
      if (!candidate) continue;
      if (query.includes(candidate)) score = Math.max(score, 100 + candidate.length);
    }

    for (const candidate of [name, nameEs]) {
      const tokens = [...new Set(candidate.split(' '))].filter(
        (token) => token.length > 3 && !['limonada', 'postre', 'combo', 'bebida', 'especial'].includes(token)
      );
      if (tokens.length === 0) continue;
      const hits = tokens.filter((token) =>
        [...qWords].some((word) => word === token || (word.startsWith(token) && word.length - token.length <= 2))
      ).length;
      if (hits === tokens.length) score = Math.max(score, 50 + tokens.length * 5);
    }

    if (score > 0) scored.push({ product, score });
  }

  scored.sort((a, b) => b.score - a.score);
  return scored[0]?.product || null;
}

function categorySummary(products, lang) {
  const rows = ['limonadas', 'especiales', 'postres', 'combos']
    .map((category) => {
      const items = products.filter((product) => product.category === category);
      if (items.length === 0) return null;
      const min = Math.min(...items.map((item) => Number(item.price) || 0));
      return `• ${pick(CATEGORY_LABELS[category], lang)}: ${items.length} ${
        lang === 'en' ? 'options from' : 'opciones desde'
      } ${money(min, lang)}`;
    })
    .filter(Boolean);

  return lang === 'en'
    ? `This is our menu today:\n${rows.join('\n')}`
    : `Este es el menú de hoy:\n${rows.join('\n')}`;
}

function budgetFrom(query) {
  const thousands = query.match(/(\d{1,3})\s*mil/);
  if (thousands) return Number(thousands[1]) * 1000;
  const numbers = [...query.matchAll(/\d[\d.]{2,}/g)]
    .map((match) => Number(match[0].replace(/\./g, '')))
    .filter((value) => Number.isFinite(value) && value >= 3000);
  return numbers[0] || null;
}

/* ------------------------------------------------------------------ */
/* Intenciones                                                         */
/* ------------------------------------------------------------------ */

const FLAVOR_HINTS = [
  { keys: ['fresa', 'strawberry'], tags: ['frutal', 'dulce'], terms: ['fresa'] },
  { keys: ['mango'], tags: ['tropical', 'dulce'], terms: ['mango'] },
  { keys: ['coco', 'coconut'], tags: ['cremoso', 'tropical'], terms: ['coco'] },
  { keys: ['maracuya', 'passion fruit'], tags: ['tropical', 'acido'], terms: ['maracuya', 'maracumango'] },
  { keys: ['mora', 'berry', 'frutos rojos'], tags: ['frutal'], terms: ['mora', 'frutos'] },
  { keys: ['cereza', 'cherry'], tags: ['frutal', 'dulce'], terms: ['cereza'] },
  { keys: ['sandia', 'watermelon'], tags: ['frutal', 'refrescante'], terms: ['sandia'] },
  { keys: ['maracumango'], tags: ['tropical', 'dulce'], terms: ['maracumango'] },
  { keys: ['brasilena', 'brazilian', 'condensada'], tags: ['cremoso', 'dulce'], terms: ['brasilena'] },
  { keys: ['panela'], tags: ['tradicional'], terms: ['panela'] },
  { keys: ['hierbabuena', 'menta', 'mint'], tags: ['hierbas'], terms: ['hierbabuena'] },
  { keys: ['acido', 'agrio', 'sour'], tags: ['acido'], terms: [] },
  { keys: ['dulce', 'sweet'], tags: ['dulce'], terms: [] },
  { keys: ['cremoso', 'creamy'], tags: ['cremoso'], terms: [] },
  { keys: ['refrescante', 'frio', 'cold', 'calor', 'fresh'], tags: ['refrescante', 'frio'], terms: [] },
  { keys: ['chocolate', 'brownie'], tags: ['chocolate'], terms: ['brownie', 'chocolate'], category: 'postres' },
  { keys: ['postre', 'dessert', 'torta', 'cake'], tags: ['postre'], terms: [], category: 'postres' },
  { keys: ['combo', 'promo', 'promocion', 'promociones', 'descuento', 'descuentos', 'fiesta', 'oficina', 'compartir', 'para dos'], tags: ['combo'], terms: [], category: 'combos' },
  { keys: ['frappe', 'especial', 'slush'], tags: ['frio'], terms: [], category: 'especiales' },
  { keys: ['limonada', 'lemonade'], tags: ['citrico'], terms: [], category: 'limonadas' },
];

const RECOMMEND_INTENT =
  /(recomiend|sugiere|recommend|suggest|antojo|que me|algo|no se que|que tomo|que pido|para el calor|para la tarde|para compartir|para dos|para fiesta|que hay)/;

function scoreProducts(pool, hints, lang) {
  const categories = [...new Set(hints.map((hint) => hint.category).filter(Boolean))];
  let candidates = pool;
  if (categories.length === 1) {
    candidates = candidates.filter((product) => product.category === categories[0]);
  }

  const tags = hints.flatMap((hint) => hint.tags);
  const terms = hints.flatMap((hint) => hint.terms);

  const scored = candidates
    .map((product) => {
      const haystack = norm(`${pick(product.name, lang)} ${pick(product.name, 'es')} ${pick(product.description, lang)}`);
      let score = 0;
      score += tags.filter((tag) => (product.tags || []).includes(tag)).length * 3;
      score += terms.filter((term) => haystack.includes(term)).length * 4;
      if (product.featured) score += 1;
      if (Number(product.stock) <= 0) score -= 8;
      return { product, score };
    })
    .sort((a, b) => b.score - a.score || Number(b.product.featured) - Number(a.product.featured));

  const positive = scored.filter((entry) => entry.score > 0);
  const selection = positive.length >= 3 ? positive : scored;
  return selection.slice(0, 3).map((entry) => entry.product);
}

/* ------------------------------------------------------------------ */
/* Respuesta principal                                                 */
/* ------------------------------------------------------------------ */

export const AI_CHIPS = {
  es: ['Recomiéndame algo', '¿Qué combos tienen?', 'Precios', 'Domicilios', 'Horarios'],
  en: ['Recommend something', 'What combos do you have?', 'Prices', 'Delivery', 'Hours'],
};

export function buildReply({ message, lang = 'es', products = [], settings } = {}) {
  const langKey = lang === 'en' ? 'en' : 'es';
  const q = norm(message);
  const active = (products || []).filter((product) => product && product.active !== false);
  const chips = AI_CHIPS[langKey];

  const answer = (reply, productIds = []) => ({ reply, chips, productIds });

  if (!q) {
    return answer(
      langKey === 'en'
        ? 'Hi, I am LemonATE AI. I can help you choose a drink, dessert or combo, and answer questions about delivery, payment and opening hours. What are you craving?'
        : 'Hola, soy LemonATE AI. Te ayudo a elegir una limonada, un postre o un combo, y resuelvo dudas de domicilio, pagos y horarios. ¿Qué se te antoja?'
    );
  }

  /* Saludos y cierre ------------------------------------------------- */
  if (/(^|\b)(hola|buenas|buenos dias|buenas tardes|buenas noches|hello|hi|hey|saludos)(\b|$)/.test(q) && q.length < 32) {
    return answer(
      langKey === 'en'
        ? 'Hi! I can recommend something from the menu or help with delivery, payment and order tracking. What would you like?'
        : '¡Hola! Puedo recomendarte algo del menú o ayudarte con domicilios, pagos y seguimiento. ¿Qué necesitas?'
    );
  }
  if (/(gracias|thanks|thank you|chao|adios|bye)/.test(q)) {
    return answer(
      langKey === 'en' ? 'You are welcome. Enjoy your order.' : 'Con gusto. Que disfrutes tu pedido.'
    );
  }

  /* Cancelaciones y ayuda para pedir -------------------------------- */
  if (/(cancelar|cancela|cancel|devolucion|refund)/.test(q)) {
    return answer(cancellationText(settings, langKey));
  }
  if (/(cambiar mi pedido|modificar mi pedido|change my order|modify my order)/.test(q)) {
    return answer(changeOrderText(settings, langKey));
  }
  if (/(como pido|como compro|como hago|hacer un pedido|quiero pedir|how do i order|how to order|place an order)/.test(q)) {
    return answer(orderHelpText(langKey));
  }

  /* Recogida y consumo en el local ---------------------------------- */
  if (/(recoger|recogida|para llevar|pickup|take away|mesa|salon|comer ahi|dine in)/.test(q)) {
    return answer(pickupText(langKey));
  }

  /* Seguimiento ------------------------------------------------------ */
  if (/lmt[-\s]?\d{4,}/i.test(message || '')) {
    return answer(trackingText(langKey));
  }
  if (/(seguimiento|rastrear|track|order status|mi pedido|mi orden|my order|consultar pedido|estado del pedido|codigo de pedido)/.test(q)) {
    return answer(trackingText(langKey));
  }

  /* Ubicación -------------------------------------------------------- */
  if (/(ubicacion|ubicados|donde estan|donde queda|nuestra direccion|direccion del local|sede|where are you|your address|location)/.test(q)) {
    return answer(locationText(settings, langKey));
  }

  /* Eventos y pedidos grupales -------------------------------------- */
  if (/(empresa|empresas|evento|eventos|oficina|oficinas|grupal|event|corporate|birthday|cumpleanos)/.test(q) && !/(combo|combos)/.test(q)) {
    return answer(eventsText(settings, langKey));
  }

  /* Bebidas calientes ------------------------------------------------ */
  if (/(bebida caliente|bebidas calientes|hot drink|hot drinks|caliente)/.test(q)) {
    return answer(hotDrinksText(langKey));
  }

  /* Contacto y atención humana -------------------------------------- */
  if (/(whatsapp|contacto|contact|asesor|humano|persona|hablar con|telefono|numero)/.test(q)) {
    return answer(contactText(settings, langKey));
  }

  /* Horarios --------------------------------------------------------- */
  if (/(horario|\bhora|abren|cierran|abierto|cerrado|open|close|hours)/.test(q)) {
    return answer(hoursText(settings, langKey));
  }

  /* Tiempos de entrega ---------------------------------------------- */
  if (/(demora|tarda|tiempo de entrega|cuanto se demora|how long|delivery time|\beta\b)/.test(q)) {
    return answer(etaText(langKey));
  }

  /* Domicilios ------------------------------------------------------- */
  if (/(domicilio|envio|envian|enviar|otra direccion|cobertura|delivery|deliver|shipping|llegan|distancia|reparto|another address)/.test(q)) {
    return answer(deliveryText(settings, langKey));
  }

  /* Pagos ------------------------------------------------------------ */
  if (/(pago|pagar|nequi|daviplata|bancolombia|bre-b|bre b|tarjeta|efectivo|payment|pay|card|cash)/.test(q)) {
    return answer(paymentsText(langKey));
  }

  /* Personalización, tamaños y extras ------------------------------- */
  if (/(tamano|tamanos|oz|onza|size|hielo|personaliz|extra|custom|ice)/.test(q)) {
    return answer(sizesText(langKey));
  }
  if (/(azucar|sugar|endulz|dulzor)/.test(q) && !RECOMMEND_INTENT.test(q) && !/(limonada|postre|combo|bebida)/.test(q)) {
    return answer(sugarText(langKey));
  }

  /* Alergias y dieta ------------------------------------------------- */
  if (/(vegano|vegana|vegetariano|vegetarian|vegan)/.test(q)) {
    return answer(veganText(langKey));
  }

  const asksDairyFree = /(sin leche|sin lacteos|dairy free|lactose free|sin lactosa)/.test(q);
  if (asksDairyFree) {
    const dairyFree = active
      .filter((product) => {
        const haystack = norm(`${pick(product.name, langKey)} ${(product.tags || []).join(' ')}`);
        return product.category === 'limonadas' && !/brasilena|coco|cremoso/.test(haystack);
      })
      .slice(0, 3);
    if (dairyFree.length > 0) {
      return answer(
        (langKey === 'en'
          ? 'These lemonades are dairy free by default. Desserts and creamy drinks may contain milk or egg:'
          : 'Estas limonadas son sin lácteos por defecto. Los postres y bebidas cremosas pueden contener leche o huevo:') +
          '\n' +
          dairyFree.map((product) => productLine(product, langKey)).join('\n'),
        dairyFree.map((product) => product._id || product.id).filter(Boolean)
      );
    }
  }

  if (/(ingrediente|alergia|alergen|lactosa|gluten|ingredient|allerg)/.test(q)) {
    return answer(allergensText(langKey));
  }

  if (/(caloria|calorias|nutri|nutrition|calorie|dietetico)/.test(q)) {
    return answer(nutritionText(langKey));
  }

  /* Café y alcohol: no forman parte del menú ------------------------- */
  if (/(cafe|coffee|espresso|capuchino|latte|cerveza|vino|alcohol|licor)/.test(q)) {
    return answer(
      langKey === 'en'
        ? 'We do not serve coffee or alcohol. Our menu is built around lemon: lemonades, frappés and desserts. I can recommend a lemonade if you want.'
        : 'No manejamos café ni alcohol. Nuestro menú gira alrededor del limón: limonadas, frappés y postres. Si quieres, te recomiendo una limonada.'
    );
  }

  /* Producto mencionado por nombre ---------------------------------- */
  const mentioned = RECOMMEND_INTENT.test(q) ? null : matchProduct(q, active, langKey);
  if (mentioned) {
    const name = pick(mentioned.name, langKey);
    const description = pick(mentioned.description, langKey);
    const category = pick(CATEGORY_LABELS[mentioned.category], langKey);
    const tags = (mentioned.tags || []).map((tag) => `#${tag}`).join(' ');
    const lines = [
      name,
      `${category} · ${money(mentioned.price, langKey)} · ${availability(mentioned, langKey)}`,
      description,
      tags,
    ].filter(Boolean);
    if (/(leche|lacteo|alergia|ingrediente)/.test(q)) lines.push(allergensText(langKey));
    return answer(lines.join('\n'), [mentioned._id || mentioned.id].filter(Boolean));
  }

  /* Presupuesto ------------------------------------------------------ */
  const budget = budgetFrom(q);
  if (budget) {
    const options = active
      .filter((product) => Number(product.price) <= budget && Number(product.stock) > 0)
      .sort((a, b) => Number(b.price) - Number(a.price))
      .slice(0, 4);
    if (options.length > 0) {
      return answer(
        (langKey === 'en'
          ? `Options up to ${money(budget, langKey)}:`
          : `Opciones hasta ${money(budget, langKey)}:`) +
          '\n' +
          options.map((product) => productLine(product, langKey)).join('\n'),
        options.map((product) => product._id || product.id).filter(Boolean)
      );
    }
    const cheapest = [...active].sort((a, b) => Number(a.price) - Number(b.price))[0];
    return answer(
      langKey === 'en'
        ? `I could not find anything under ${money(budget, langKey)}. The most accessible option is ${pick(cheapest?.name, 'en')} at ${money(cheapest?.price, 'en')}.`
        : `No encontré opciones por debajo de ${money(budget, langKey)}. La más accesible es ${pick(cheapest?.name, 'es')} por ${money(cheapest?.price, 'es')}.`
    );
  }

  /* Precio general --------------------------------------------------- */
  if (/(precio|cuanto|vale|cost|price|barato|cheap|economico|caro|premium)/.test(q)) {
    const cheapest = [...active].sort((a, b) => Number(a.price) - Number(b.price)).slice(0, 3);
    return answer(categorySummary(active, langKey) + '\n' + cheapest.map((product) => productLine(product, langKey)).join('\n'), cheapest.map((product) => product._id || product.id).filter(Boolean));
  }

  /* Menú completo ---------------------------------------------------- */
  if (/(menu|catalogo|que venden|que tienen|opciones|products|productos)/.test(q)) {
    const favorites = active.filter((product) => product.featured).slice(0, 3);
    return answer(
      categorySummary(active, langKey) +
        (favorites.length > 0
          ? '\n' +
            (langKey === 'en' ? 'Customer favorites:' : 'Los favoritos de la casa:') +
            '\n' +
            favorites.map((product) => productLine(product, langKey)).join('\n')
          : ''),
      favorites.map((product) => product._id || product.id).filter(Boolean)
    );
  }

  /* Disponibilidad --------------------------------------------------- */
  if (/(disponible|agotado|hay stock|out of stock|available)/.test(q)) {
    const available = active.filter((product) => Number(product.stock) > 0).slice(0, 4);
    return answer(
      (langKey === 'en' ? 'Available right now:' : 'Disponibles ahora:') +
        '\n' +
        available.map((product) => productLine(product, langKey)).join('\n'),
      available.map((product) => product._id || product.id).filter(Boolean)
    );
  }

  /* Recomendaciones -------------------------------------------------- */
  if (/(mas vendido|favorito|favoritos|popular|best seller|bestseller|favorite|favorites)/.test(q)) {
    const favorites = active
      .filter((product) => product.featured && Number(product.stock) > 0)
      .slice(0, 3);
    if (favorites.length > 0) {
      return answer(
        (langKey === 'en' ? 'Customer favorites right now:' : 'Los favoritos de la casa:') +
          '\n' +
          favorites.map((product) => productLine(product, langKey)).join('\n'),
        favorites.map((product) => product._id || product.id).filter(Boolean)
      );
    }
  }

  const hints = FLAVOR_HINTS.filter((hint) => hint.keys.some((key) => q.includes(key)));
  const wantsRecommendation = RECOMMEND_INTENT.test(q);

  if (hints.length > 0 || wantsRecommendation) {
    const sugarFree = /(sin azucar|sugar free|sin azúcar|sin endulz)/.test(q);
    const pool = sugarFree
      ? active.filter((product) => ['limonadas', 'especiales'].includes(product.category))
      : active;
    const suggestions = scoreProducts(pool, hints, langKey);
    if (suggestions.length > 0) {
      const sugarNote = sugarFree
        ? langKey === 'en'
          ? 'All lemonades can be ordered sugar free. '
          : 'Todas las limonadas se pueden pedir sin azúcar. '
        : '';
      const intro =
        hints.length > 0
          ? langKey === 'en'
            ? 'According to what you asked for, I suggest:'
            : 'Según lo que pediste, te sugiero:'
          : langKey === 'en'
            ? 'These are good options from our menu:'
            : 'Estas son buenas opciones del menú:';
      return answer(
        sugarNote + intro + '\n' + suggestions.map((product) => productLine(product, langKey)).join('\n'),
        suggestions.map((product) => product._id || product.id).filter(Boolean)
      );
    }
  }

  /* Combos y acompañamientos ---------------------------------------- */
  if (/(combinacion|maridaje|pair|acompan|junto|con que)/.test(q)) {
    const drink = active.find((product) => product.category === 'limonadas' && Number(product.stock) > 0);
    const dessert = active.find((product) => product.category === 'postres' && Number(product.stock) > 0);
    if (drink && dessert) {
      return answer(
        (langKey === 'en'
          ? `A safe pairing: ${pick(drink.name, 'en')} with ${pick(dessert.name, 'en')}.`
          : `Una combinación segura: ${pick(drink.name, 'es')} con ${pick(dessert.name, 'es')}.`) +
          '\n' +
          [drink, dessert].map((product) => productLine(product, langKey)).join('\n'),
        [drink._id, dessert._id].filter(Boolean)
      );
    }
  }

  /* Respaldo --------------------------------------------------------- */
  const favorites = active.filter((product) => product.featured && Number(product.stock) > 0).slice(0, 3);
  const whatsapp = String(settings?.contact?.whatsapp || '').replace(/\D/g, '');
  return answer(
    (langKey === 'en'
      ? 'I did not find that exact question in the menu, but I can help with recommendations, prices, ingredients, delivery, payment, hours and order tracking.'
      : 'No encontré esa pregunta exacta en el menú, pero puedo ayudarte con recomendaciones, precios, ingredientes, domicilios, pagos, horarios y seguimiento.') +
      (favorites.length > 0
        ? '\n' +
          (langKey === 'en' ? 'Popular right now:' : 'Populares ahora:') +
          '\n' +
          favorites.map((product) => productLine(product, langKey)).join('\n')
        : '') +
      (whatsapp
        ? `\n${langKey === 'en' ? 'If you prefer, message us on WhatsApp: +' : 'Si prefieres, escríbenos por WhatsApp: +'}${whatsapp}`
        : ''),
    favorites.map((product) => product._id || product.id).filter(Boolean)
  );
}
