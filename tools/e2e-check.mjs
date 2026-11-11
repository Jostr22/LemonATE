/**
 * Verificación automática con Chrome headless (CDP, sin dependencias).
 * Uso: node tools/e2e-check.mjs http://localhost:4173
 */
import { spawn } from 'node:child_process';
import fs from 'node:fs';

const BASE = process.argv[2] || 'http://localhost:4173';
const CHROME = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const PORT = 9333;
const profile = 'C:\\Users\\Usuario\\AppData\\Local\\Temp\\opencode\\chrome-e2e';

const chrome = spawn(
  CHROME,
  [
    '--headless=new',
    '--disable-gpu',
    '--no-first-run',
    '--no-default-browser-check',
    `--remote-debugging-port=${PORT}`,
    `--user-data-dir=${profile}`,
    'about:blank',
  ],
  { stdio: 'ignore' }
);

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function getTarget() {
  for (let i = 0; i < 60; i++) {
    try {
      const response = await fetch(`http://127.0.0.1:${PORT}/json/list`);
      const list = await response.json();
      const page = list.find((target) => target.type === 'page');
      if (page) return page.webSocketDebuggerUrl;
    } catch {
      /* Chrome aún no escucha */
    }
    await sleep(250);
  }
  throw new Error('Chrome no respondió');
}

const wsUrl = await getTarget();
const ws = new WebSocket(wsUrl);
await new Promise((resolve, reject) => {
  ws.onopen = resolve;
  ws.onerror = reject;
});

let id = 0;
const pending = new Map();
const errors = [];
const logs = [];

ws.onmessage = (event) => {
  const message = JSON.parse(event.data);
  if (message.id && pending.has(message.id)) {
    pending.get(message.id)(message);
    pending.delete(message.id);
    return;
  }
  if (message.method === 'Runtime.exceptionThrown') {
    errors.push(message.params.exceptionDetails?.exception?.description || 'Excepción sin descripción');
  }
  if (message.method === 'Runtime.consoleAPICalled' && message.params.type === 'error') {
    errors.push(message.params.args.map((arg) => arg.value || arg.description || '').join(' '));
  }
  if (message.method === 'Log.entryAdded') {
    const entry = message.params.entry;
    if (entry.level === 'error') errors.push(`${entry.source}: ${entry.text}`);
    else logs.push(`${entry.level}: ${entry.text}`);
  }
};

function send(method, params = {}) {
  return new Promise((resolve) => {
    const messageId = ++id;
    pending.set(messageId, resolve);
    ws.send(JSON.stringify({ id: messageId, method, params }));
  });
}

await send('Runtime.enable');
await send('Log.enable');
await send('Page.enable');

// Estado limpio para que la prueba sea reproducible.
await send('Page.navigate', { url: `${BASE}/#/` });
await sleep(700);
await send('Runtime.evaluate', { expression: 'localStorage.clear()' });
await send('Page.reload');
await sleep(900);

async function evaluate(expression) {
  const result = await send('Runtime.evaluate', {
    expression,
    awaitPromise: true,
    returnByValue: true,
    userGesture: true,
  });
  if (result.result?.exceptionDetails) {
    throw new Error(result.result.exceptionDetails.exception?.description || 'Error de evaluación');
  }
  return result.result?.result?.value;
}

async function goto(hash, wait = 900) {
  errors.length = 0;
  await send('Page.navigate', { url: `${BASE}/${hash}` });
  await sleep(wait);
  const text = await evaluate('document.body.innerText');
  return text || '';
}

const results = [];
function check(name, condition, detail = '') {
  results.push({ name, ok: Boolean(condition), detail });
  console.log(`${condition ? 'OK  ' : 'FAIL'} ${name}${detail ? ` — ${detail}` : ''}`);
}

// ---------- rutas ----------
const routes = [
  ['#/', 'Inicio', 'EXPRIME'],
  ['#/tienda', 'Tienda', 'TIENDA'],
  ['#/tienda/limonadas', 'Categoría', 'LIMONADAS'],
  ['#/tienda/postres', 'Postres', 'POSTRES'],
  ['#/promociones', 'Promociones', 'COMBO'],
  ['#/producto/p_01', 'Producto', 'LIMONADA NATURAL'],
  ['#/carrito', 'Carrito', 'CARRITO'],
  ['#/checkout', 'Checkout', 'CHECKOUT'],
  ['#/seguimiento', 'Seguimiento', 'SEGUIMIENTO'],
  ['#/login', 'Login', 'INICIAR SESIÓN'],
  ['#/registro', 'Registro', 'CREAR CUENTA'],
  ['#/contacto', 'Contacto', 'CONTACTO'],
  ['#/marca', 'Marca', 'EXPRIME EL MOMENTO'],
  ['#/ruta-inexistente', '404', '404'],
];

for (const [hash, name, marker] of routes) {
  const text = await goto(hash);
  check(`Ruta ${name}`, text.includes(marker), errors.length ? errors.slice(0, 2).join(' | ') : '');
}

// ---------- marca y medios de pago ----------
const brandText = await goto('#/marca');
check(
  'Fundador visible en la marca',
  /amilkar josé castro martínez/i.test(brandText) && brandText.includes('amilkar0322@gmail.com'),
  ''
);
check('Sin pago con tarjeta en el pie', !brandText.includes('Contra entrega'), '');

// ---------- flujo demo: combo con contenido elegido ----------
await goto('#/tienda/combos');
const comboHref = await evaluate(
  `document.querySelector('a[href*="/producto/"]')?.getAttribute('href') || ''`
);
if (comboHref) {
  await goto(comboHref.includes('#') ? comboHref.slice(comboHref.indexOf('#')) : comboHref);
  const comboFilled = await evaluate(`
    (() => {
      const selects = [...document.querySelectorAll('.pdp select')];
      const setSelect = (select, value) => {
        Object.getOwnPropertyDescriptor(HTMLSelectElement.prototype, 'value').set.call(select, value);
        select.dispatchEvent(new Event('change', { bubbles: true }));
      };
      selects.forEach((select, index) => {
        const option = index === 0
          ? 'limonada-fresa'
          : index === 1
            ? 'cheesecake-limon'
            : select.options[0]?.value;
        if (option) setSelect(select, option);
      });
      document.querySelector('.pdp .btn.grow')?.click();
      return selects.length;
    })()
  `);
  await sleep(700);
  const cartText = await evaluate(`document.querySelector('.cart-drawer')?.innerText || ''`);
  check(
    'Combo con contenido elegido',
    comboFilled >= 2 && /Limonada de fresa/.test(cartText) && /Cheesecake de limón/.test(cartText),
    cartText.slice(0, 180)
  );
  await evaluate(`localStorage.removeItem('lemonate.cart.v1'); location.reload()`);
  await sleep(900);
}

// ---------- flujo demo: login admin ----------
await goto('#/login');
await evaluate(`
  (async () => {
    const inputs = document.querySelectorAll('input');
    const setValue = (el, value) => {
      const setter = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value').set;
      setter.call(el, value);
      el.dispatchEvent(new Event('input', { bubbles: true }));
    };
    setValue(inputs[0], 'admin@lemonate.com');
    setValue(inputs[1], 'LemonATE2026');
    document.querySelector('form').requestSubmit();
  })()
`);
await sleep(1400);
let text = await evaluate('document.body.innerText');
check('Login admin', /Panel administrativo|Productos/.test(text), errors.slice(0, 2).join(' | '));

const adminLoaded = /Panel administrativo/.test(text);
if (adminLoaded) {
  await evaluate(
    `[...document.querySelectorAll('.tabs button')].find(b => b.textContent.includes('Pedidos')).click()`
  );
  await sleep(500);
  text = await evaluate('document.body.innerText');
  check('Pestaña Pedidos', text.includes('Pedidos'), '');
}

// ---------- flujo demo: compra ----------
await goto('#/producto/p_01');
await evaluate(`document.querySelector('.pdp .btn.grow').click()`);
await sleep(600);
text = await evaluate('document.body.innerText');
check('Agregar al carrito', /carrito|Carrito/.test(text), errors.slice(0, 2).join(' | '));

await goto('#/checkout');
const filled = await evaluate(`
  (() => {
    const setValue = (el, value) => {
      const proto = el.tagName === 'TEXTAREA' ? HTMLTextAreaElement.prototype : HTMLInputElement.prototype;
      Object.getOwnPropertyDescriptor(proto, 'value').set.call(el, value);
      el.dispatchEvent(new Event('input', { bubbles: true }));
    };
    const inputs = [...document.querySelectorAll('.checkout-grid input')];
    const values = ['Cliente Prueba', '3001234567', 'prueba@example.com', 'Calle 1 #2-3', 'Centro', '3'];
    inputs.slice(0, 6).forEach((input, index) => setValue(input, values[index]));
    const terms = [...document.querySelectorAll('input[type=checkbox]')].pop();
    terms.click();
    return inputs.length;
  })()
`);
await sleep(400);
const buttonClicked = await evaluate(`
  (() => {
    const button = [...document.querySelectorAll('button')].find(b => /Confirmar pedido|Place order/.test(b.textContent));
    if (!button) return false;
    button.click();
    return true;
  })()
`);
await sleep(1500);
text = await evaluate('document.body.innerText');
const orderError = await evaluate(`document.querySelector('.notice--error')?.innerText || ''`);
check(
  'Crear pedido',
  /PEDIDO RECIBIDO|ORDER RECEIVED/i.test(text) && /LMT-/.test(text),
  `inputs:${filled} botón:${buttonClicked} error:${orderError} ${errors.slice(0, 2).join(' | ')}`
);
if (!/Pedido recibido/.test(text)) {
  console.log('--- texto del checkout ---');
  console.log(text.slice(0, 1200));
}

// ---------- flujo demo: el admin ve el contenido del pedido ----------
await goto('#/admin');
await evaluate(
  `[...document.querySelectorAll('.tabs button')].find(b => b.textContent.includes('Pedidos'))?.click()`
);
await sleep(900);
const adminOrdersText = await evaluate('document.body.innerText');
check(
  'Admin ve productos del pedido',
  /Limonada/i.test(adminOrdersText) && /Nequi/.test(adminOrdersText),
  ''
);

// ---------- IA ----------
await goto('#/');
await evaluate(`document.querySelector('.chat-fab').click()`);
await sleep(300);
await evaluate(`
  (() => {
    const input = document.querySelector('.chat-form input');
    const setter = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value').set;
    setter.call(input, 'recomiéndame algo ácido');
    input.dispatchEvent(new Event('input', { bubbles: true }));
    document.querySelector('.chat-form').requestSubmit();
  })()
`);
await sleep(1200);
const chatText = await evaluate(`document.querySelector('.chat-log')?.innerText || ''`);
check('LemonATE AI responde', /sugiero|recomiendo|catálogo/i.test(chatText), chatText.slice(-120));

// ---------- resumen ----------
const failed = results.filter((result) => !result.ok);
console.log(`\n${results.length - failed.length}/${results.length} comprobaciones correctas`);
if (errors.length) console.log('Errores de consola:', errors.slice(0, 5));

fs.writeFileSync(
  'C:\\Users\\Usuario\\AppData\\Local\\Temp\\opencode\\e2e-results.json',
  JSON.stringify({ results, errors }, null, 2)
);

ws.close();
chrome.kill();
process.exit(failed.length ? 1 : 0);
