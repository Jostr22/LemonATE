/**
 * Prueba de integraciÃ³n real: React (Vite) contra la API Express.
 * Requiere: API en http://localhost:4001 y frontend en http://localhost:5174.
 * Uso: node tools/fullstack-check.mjs
 */
import { spawn } from 'node:child_process';

const FRONT = 'http://localhost:5174';
const API = 'http://localhost:4001/api';
const CHROME = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const PORT = 9334;

const products = await (await fetch(`${API}/products`)).json();
const target = products[7];

const chrome = spawn(
  CHROME,
  [
    '--headless=new',
    '--disable-gpu',
    '--no-first-run',
    '--no-default-browser-check',
    `--remote-debugging-port=${PORT}`,
    '--user-data-dir=C:\\Users\\Usuario\\AppData\\Local\\Temp\\opencode\\chrome-full',
    'about:blank',
  ],
  { stdio: 'ignore' }
);

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

let wsUrl;
for (let i = 0; i < 60 && !wsUrl; i++) {
  try {
    const list = await (await fetch(`http://127.0.0.1:${PORT}/json/list`)).json();
    wsUrl = list.find((item) => item.type === 'page')?.webSocketDebuggerUrl;
  } catch {
    /* esperando */
  }
  if (!wsUrl) await sleep(250);
}

const ws = new WebSocket(wsUrl);
await new Promise((resolve, reject) => {
  ws.onopen = resolve;
  ws.onerror = reject;
});

let id = 0;
const pending = new Map();
const errors = [];
ws.onmessage = (event) => {
  const message = JSON.parse(event.data);
  if (message.id && pending.has(message.id)) {
    pending.get(message.id)(message);
    pending.delete(message.id);
    return;
  }
  if (message.method === 'Runtime.exceptionThrown') {
    errors.push(message.params.exceptionDetails?.exception?.description || 'excepciÃ³n');
  }
  if (message.method === 'Runtime.consoleAPICalled' && message.params.type === 'error') {
    errors.push(message.params.args.map((arg) => arg.value || arg.description).join(' '));
  }
};

const send = (method, params = {}) =>
  new Promise((resolve) => {
    const messageId = ++id;
    pending.set(messageId, resolve);
    ws.send(JSON.stringify({ id: messageId, method, params }));
  });

await send('Runtime.enable');
await send('Page.enable');

const evaluate = async (expression) => {
  const result = await send('Runtime.evaluate', {
    expression,
    awaitPromise: true,
    returnByValue: true,
    userGesture: true,
  });
  return result.result?.result?.value;
};

const goto = async (hash, wait = 1200) => {
  errors.length = 0;
  await send('Page.navigate', { url: `${FRONT}/${hash}` });
  await sleep(wait);
  return (await evaluate('document.body.innerText')) || '';
};

const results = [];
const check = (name, ok, detail = '') => {
  results.push(ok);
  console.log(`${ok ? 'OK  ' : 'FAIL'} ${name}${detail ? ` â€” ${detail}` : ''}`);
};

let text = await goto('#/');
check('Landing carga productos desde la API', text.toUpperCase().includes(target.name.es.toUpperCase()), errors.slice(0, 2).join(' | '));

text = await goto('#/tienda');
check('CatÃ¡logo remoto visible', text.toUpperCase().includes(target.name.es.toUpperCase()), errors.slice(0, 2).join(' | '));

text = await goto(`#/producto/${target._id}`);
check('Detalle remoto visible', text.toUpperCase().includes(target.name.es.toUpperCase()), errors.slice(0, 2).join(' | '));

await goto('#/login');
await evaluate(`
  (() => {
    const inputs = document.querySelectorAll('input');
    const setValue = (el, value) => {
      Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value').set.call(el, value);
      el.dispatchEvent(new Event('input', { bubbles: true }));
    };
    setValue(inputs[0], 'admin@lemonate.com');
    setValue(inputs[1], 'LemonATE2026');
    document.querySelector('form').requestSubmit();
  })()
`);
await sleep(1600);
text = await evaluate('document.body.innerText');
check('Login contra la API real', /PANEL ADMINISTRATIVO/.test(text), errors.slice(0, 2).join(' | '));

text = await goto('#/');
await evaluate(`document.querySelector('.chat-fab').click()`);
await sleep(300);
await evaluate(`
  (() => {
    const input = document.querySelector('.chat-form input');
    Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value').set.call(input, 'Â¿cuÃ¡nto cuesta la limonada de coco?');
    input.dispatchEvent(new Event('input', { bubbles: true }));
    document.querySelector('.chat-form').requestSubmit();
  })()
`);
await sleep(1200);
const chat = await evaluate(`document.querySelector('.chat-log')?.innerText || ''`);
check('IA consulta el catÃ¡logo de MongoDB', /coco/i.test(chat), chat.slice(-100));

const failed = results.filter((ok) => !ok).length;
console.log(`\n${results.length - failed}/${results.length} comprobaciones full stack`);
console.log(`Modo demostraciÃ³n activo: ${await evaluate(`localStorage.getItem('lemonate.demo.v1') ? 'sÃ­' : 'no'`)}`);

ws.close();
chrome.kill();
process.exit(failed ? 1 : 0);

