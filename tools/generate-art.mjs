/**
 * Generador de ilustraciones SVG para el catálogo de LemonATE.
 * Ejecutar: node tools/generate-art.mjs
 * Salida: frontend/public/products/*.svg
 *
 * Son ilustraciones propias (no fotografías). El administrador puede
 * reemplazar la ruta de imagen de cada producto desde el panel.
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const OUT = path.resolve(__dirname, '../frontend/public/products');
fs.mkdirSync(OUT, { recursive: true });

const W = 800;
const H = 680;
const FONT = "'Archivo Black','Arial Black',Impact,sans-serif";

const P = {
  'limonada-natural': { accent: '#B7FF00', liquid: '#E7FF36', label: 'LIMONADA NATURAL', tag: 'LIMONADAS / 01', type: 'glass' },
  'limonada-hierbabuena': { accent: '#7CE86B', liquid: '#C8F58A', label: 'HIERBABUENA', tag: 'LIMONADAS / 02', type: 'glass' },
  'limonada-coco': { accent: '#F4F3EA', liquid: '#EDE6D2', label: 'LIMONADA COCO', tag: 'LIMONADAS / 03', type: 'glass' },
  'limonada-panela': { accent: '#D9A441', liquid: '#C98A3B', label: 'LIMONADA PANELA', tag: 'LIMONADAS / 04', type: 'glass' },
  'limonada-fresa': { accent: '#FF5C8A', liquid: '#FF7FA6', label: 'LIMONADA FRESA', tag: 'LIMONADAS / 05', type: 'glass' },
  'limonada-frutos-rojos': { accent: '#B03A6B', liquid: '#8E2E58', label: 'FRUTOS ROJOS', tag: 'LIMONADAS / 06', type: 'glass' },
  'limonada-maracuya': { accent: '#FFB000', liquid: '#FFC93C', label: 'MARACUYA', tag: 'LIMONADAS / 07', type: 'glass' },
  'limonada-mango': { accent: '#FFD166', liquid: '#FFB627', label: 'LIMONADA MANGO', tag: 'LIMONADAS / 08', type: 'glass' },
  'frappe-limon': { accent: '#E7FF36', liquid: '#D9F27A', label: 'FRAPPE LIMON', tag: 'ESPECIALES / 01', type: 'frappe' },
  'frappe-caramelo': { accent: '#C98A3B', liquid: '#B9762E', label: 'FRAPPE CARAMELO', tag: 'ESPECIALES / 02', type: 'frappe' },
  'granizado-mora': { accent: '#8439B8', liquid: '#6A2A93', label: 'GRANIZADO MORA', tag: 'ESPECIALES / 03', type: 'slush' },
  'granizado-limon': { accent: '#9BD400', liquid: '#B7FF00', label: 'GRANIZADO LIMON', tag: 'ESPECIALES / 04', type: 'slush' },
  'pie-limon': { accent: '#E7FF36', liquid: '#F2D64B', label: 'PIE DE LIMON', tag: 'POSTRES / 01', type: 'pie' },
  'cheesecake-limon': { accent: '#F4F3EA', liquid: '#F0E3B8', label: 'CHEESECAKE', tag: 'POSTRES / 02', type: 'cake' },
  'tartaleta-limon': { accent: '#FFD166', liquid: '#F2C14E', label: 'TARTALETA', tag: 'POSTRES / 03', type: 'tart' },
  'galletas-limon': { accent: '#C98A3B', liquid: '#D9A45B', label: 'GALLETAS', tag: 'POSTRES / 04', type: 'cookies' },
  'brownie-citrico': { accent: '#8439B8', liquid: '#4B2A22', label: 'BROWNIE', tag: 'POSTRES / 05', type: 'brownie' },
  'cupcake-limon': { accent: '#FF9BD2', liquid: '#F4F3EA', label: 'CUPCAKE', tag: 'POSTRES / 06', type: 'cupcake' },
  'mousse-limon': { accent: '#E7FF36', liquid: '#F0F0C0', label: 'MOUSSE LIMON', tag: 'POSTRES / 07', type: 'mousse' },
  'combo-duo': { accent: '#B7FF00', liquid: '#E7FF36', label: 'COMBO DUO', tag: 'COMBOS / 01', type: 'combo' },
  'combo-fiesta': { accent: '#8439B8', liquid: '#B7FF00', label: 'COMBO FIESTA', tag: 'COMBOS / 02', type: 'combo' },
  'combo-oficina': { accent: '#C5C9CC', liquid: '#E7FF36', label: 'COMBO OFICINA', tag: 'COMBOS / 03', type: 'combo' },
};

const chrome = `
  <linearGradient id="chrome" x1="0" y1="0" x2="1" y2="1">
    <stop offset="0" stop-color="#ffffff"/>
    <stop offset="0.18" stop-color="#C5C9CC"/>
    <stop offset="0.34" stop-color="#6F767C"/>
    <stop offset="0.5" stop-color="#FFFFFF"/>
    <stop offset="0.66" stop-color="#9AA1A7"/>
    <stop offset="0.82" stop-color="#E9EEF1"/>
    <stop offset="1" stop-color="#7D848A"/>
  </linearGradient>`;

const noise = `
  <filter id="grain">
    <feTurbulence type="fractalNoise" baseFrequency="0.8" numOctaves="3" result="n"/>
    <feColorMatrix in="n" type="saturate" values="0"/>
    <feComponentTransfer><feFuncA type="linear" slope="0.06"/></feComponentTransfer>
  </filter>`;

function lemonWheel(cx, cy, r, color, opacity = 1) {
  const segs = [];
  const n = 10;
  for (let i = 0; i < n; i++) {
    const a1 = (i / n) * Math.PI * 2;
    const a2 = ((i + 0.82) / n) * Math.PI * 2;
    segs.push(
      `<path d="M${cx} ${cy} L${cx + r * 0.92 * Math.cos(a1)} ${cy + r * 0.92 * Math.sin(a1)} A${r * 0.92} ${r * 0.92} 0 0 1 ${cx + r * 0.92 * Math.cos(a2)} ${cy + r * 0.92 * Math.sin(a2)} Z" fill="${color}" opacity="0.5"/>`
    );
  }
  return `<g opacity="${opacity}">
    <circle cx="${cx}" cy="${cy}" r="${r}" fill="none" stroke="${color}" stroke-width="${r * 0.09}" opacity="0.9"/>
    <circle cx="${cx}" cy="${cy}" r="${r * 0.9}" fill="${color}" opacity="0.12"/>
    ${segs.join('')}
    <circle cx="${cx}" cy="${cy}" r="${r * 0.12}" fill="${color}" opacity="0.85"/>
  </g>`;
}

function glass({ x, y, w, h, liquid, accent, straw = true, cream = false, ice = true }) {
  const cx = x + w / 2;
  const body = `M${x} ${y} L${x + w * 0.09} ${y + h} Q${cx} ${y + h + 18} ${x + w * 0.91} ${y + h} L${x + w} ${y} Z`;
  const clip = `clip-${Math.round(x)}-${Math.round(y)}`;
  return `<g>
    <defs>
      <clipPath id="${clip}"><path d="${body}"/></clipPath>
      <linearGradient id="liq-${clip}" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stop-color="${liquid}" stop-opacity="0.95"/>
        <stop offset="1" stop-color="${liquid}" stop-opacity="0.55"/>
      </linearGradient>
    </defs>
    <path d="${body}" fill="#ffffff" opacity="0.05"/>
    <g clip-path="url(#${clip})">
      <rect x="${x}" y="${y + h * 0.18}" width="${w}" height="${h}" fill="url(#liq-${clip})"/>
      ${ice ? `<rect x="${x + w * 0.16}" y="${y + h * 0.3}" width="${w * 0.3}" height="${w * 0.28}" rx="6" fill="#ffffff" opacity="0.18" transform="rotate(-12 ${cx} ${y + h * 0.4})"/>` : ''}
      ${ice ? `<rect x="${x + w * 0.52}" y="${y + h * 0.46}" width="${w * 0.28}" height="${w * 0.26}" rx="6" fill="#ffffff" opacity="0.14" transform="rotate(9 ${cx} ${y + h * 0.55})"/>` : ''}
      <rect x="${x}" y="${y + h * 0.18}" width="${w}" height="6" fill="#ffffff" opacity="0.35"/>
      ${cream ? `<ellipse cx="${cx}" cy="${y + h * 0.18}" rx="${w * 0.48}" ry="${w * 0.22}" fill="#F4F3EA"/>` : ''}
    </g>
    <path d="${body}" fill="none" stroke="#F4F3EA" stroke-opacity="0.55" stroke-width="3"/>
    <ellipse cx="${cx}" cy="${y}" rx="${w / 2}" ry="${w * 0.1}" fill="none" stroke="#F4F3EA" stroke-opacity="0.5" stroke-width="3"/>
    ${straw ? `<rect x="${cx + w * 0.12}" y="${y - h * 0.32}" width="10" height="${h * 0.5}" rx="5" fill="${accent}" transform="rotate(12 ${cx} ${y})"/>` : ''}
    <path d="M${cx - w * 0.3} ${y + h * 0.25} L${cx - w * 0.26} ${y + h * 0.8}" stroke="#ffffff" stroke-opacity="0.18" stroke-width="6" stroke-linecap="round"/>
  </g>`;
}

function dessertShape(type, accent, liquid) {
  const g = (inner) => `<g transform="translate(400 330)">${inner}</g>`;
  switch (type) {
    case 'pie':
      return g(`
        <ellipse cx="0" cy="90" rx="190" ry="26" fill="#000" opacity="0.35"/>
        <path d="M-170 60 L0 -30 L170 60 Z" fill="#D9A441"/>
        <path d="M-170 60 Q0 130 170 60 L170 72 Q0 142 -170 72 Z" fill="#B9822E"/>
        <path d="M-150 52 L0 -18 L150 52 Q0 112 -150 52 Z" fill="${liquid}"/>
        <path d="M-60 20 Q0 -18 60 20 Q0 46 -60 20 Z" fill="#FFF8D6" opacity="0.85"/>
        ${lemonWheel(96, 30, 34, accent)}
      `);
    case 'cake':
      return g(`
        <ellipse cx="0" cy="110" rx="170" ry="24" fill="#000" opacity="0.35"/>
        <path d="M-140 100 L-130 -40 Q0 -62 130 -40 L140 100 Z" fill="#E8D9AE"/>
        <path d="M-130 -20 L140 -20 L140 30 L-130 30 Z" fill="${liquid}"/>
        <path d="M-130 -40 Q0 -62 130 -40 L130 -10 Q0 -30 -130 -10 Z" fill="#F4F3EA"/>
        ${lemonWheel(0, -46, 30, accent)}
        <path d="M-100 40 L100 40" stroke="#C5A76A" stroke-width="4" opacity="0.6"/>
      `);
    case 'tart':
      return g(`
        <ellipse cx="0" cy="86" rx="160" ry="24" fill="#000" opacity="0.35"/>
        <circle cx="0" cy="0" r="140" fill="#C98A3B"/>
        <circle cx="0" cy="-6" r="118" fill="${liquid}"/>
        <circle cx="0" cy="-6" r="118" fill="none" stroke="#F4F3EA" stroke-opacity="0.4" stroke-width="4"/>
        ${lemonWheel(0, -6, 54, accent)}
        <path d="M-118 -6 A118 118 0 0 1 118 -6" fill="#FFFFFF" opacity="0.08"/>
      `);
    case 'cookies':
      return g(`
        <ellipse cx="0" cy="96" rx="180" ry="24" fill="#000" opacity="0.35"/>
        <g transform="rotate(-14)">
          <circle cx="-66" cy="10" r="96" fill="#C98A3B"/>
          <circle cx="-66" cy="6" r="84" fill="#E0A75E"/>
          ${[0, 1, 2, 3, 4].map((i) => `<circle cx="${-66 + Math.cos(i * 1.7) * 44}" cy="${6 + Math.sin(i * 1.7) * 44}" r="8" fill="#5B3A1E" opacity="0.55"/>`).join('')}
        </g>
        <g transform="rotate(16)">
          <circle cx="86" cy="-6" r="86" fill="#B9822E"/>
          <circle cx="86" cy="-10" r="74" fill="#E7B775"/>
          ${[0, 1, 2, 3].map((i) => `<circle cx="${86 + Math.cos(i * 1.9) * 38}" cy="${-10 + Math.sin(i * 1.9) * 38}" r="7" fill="${accent}" opacity="0.8"/>`).join('')}
        </g>
      `);
    case 'brownie':
      return g(`
        <ellipse cx="0" cy="96" rx="170" ry="22" fill="#000" opacity="0.35"/>
        <path d="M-140 70 L-120 -50 L120 -50 L140 70 Z" fill="#3E2318"/>
        <path d="M-128 30 L128 30 L140 70 L-140 70 Z" fill="#5A3524"/>
        <path d="M-120 -50 L120 -50 L128 -18 L-128 -18 Z" fill="#2A1610"/>
        <path d="M-100 0 L100 0" stroke="${accent}" stroke-width="8" opacity="0.8"/>
        <path d="M-80 42 L80 42" stroke="#C98A3B" stroke-width="5" opacity="0.6"/>
        ${lemonWheel(92, -70, 26, accent)}
      `);
    case 'cupcake':
      return g(`
        <ellipse cx="0" cy="112" rx="140" ry="20" fill="#000" opacity="0.35"/>
        <path d="M-92 20 L-70 110 L70 110 L92 20 Z" fill="${accent}"/>
        <path d="M-92 20 L92 20 L88 34 L-88 34 Z" fill="#000" opacity="0.12"/>
        <circle cx="-46" cy="-8" r="46" fill="#F4F3EA"/>
        <circle cx="0" cy="-38" r="52" fill="#F4F3EA"/>
        <circle cx="46" cy="-8" r="46" fill="#F4F3EA"/>
        <circle cx="0" cy="6" r="48" fill="#FDFBF1"/>
        ${[0, 1, 2, 3, 4].map((i) => `<rect x="${-34 + i * 17}" y="${-70 + (i % 2) * 12}" width="7" height="18" rx="3" fill="${liquid}" transform="rotate(${-20 + i * 10} ${-34 + i * 17} -70)"/>`).join('')}
      `);
    case 'mousse':
      return g(`
        <ellipse cx="0" cy="112" rx="130" ry="20" fill="#000" opacity="0.35"/>
        <path d="M-96 -60 L96 -60 L76 108 L-76 108 Z" fill="#FFFFFF" opacity="0.08"/>
        <path d="M-88 -20 L88 -20 L76 108 L-76 108 Z" fill="${liquid}"/>
        <ellipse cx="0" cy="-60" rx="96" ry="18" fill="${liquid}"/>
        <ellipse cx="0" cy="-64" rx="96" ry="16" fill="#FDFBF1"/>
        ${lemonWheel(0, -88, 34, accent)}
        <path d="M-96 -60 L96 -60 L92 -46 L-92 -46 Z" fill="#FFFFFF" opacity="0.2"/>
      `);
    default:
      return '';
  }
}

function artwork(slug, cfg) {
  const { accent, liquid, label, tag, type } = cfg;
  let subject = '';
  if (type === 'glass') {
    subject = glass({ x: 250, y: 210, w: 190, h: 300, liquid, accent });
    subject += lemonWheel(520, 230, 78, accent, 0.9);
  } else if (type === 'frappe') {
    subject = glass({ x: 260, y: 190, w: 180, h: 310, liquid, accent, cream: true });
    subject += `<g transform="translate(350 130)">${lemonWheel(0, 0, 54, accent)}</g>`;
  } else if (type === 'slush') {
    subject = glass({ x: 260, y: 200, w: 180, h: 300, liquid, accent, ice: false, straw: false });
    subject += `<g opacity="0.9">${[0, 1, 2, 3, 4, 5]
      .map((i) => `<circle cx="${300 + (i % 3) * 52}" cy="${250 + Math.floor(i / 3) * 62}" r="24" fill="${accent}" opacity="0.35"/>`)
      .join('')}</g>`;
    subject += `<g transform="translate(470 240)">${lemonWheel(0, 0, 60, accent)}</g>`;
  } else if (type === 'combo') {
    subject = glass({ x: 210, y: 230, w: 150, h: 270, liquid, accent });
    subject += lemonWheel(560, 220, 70, accent);
    subject += dessertShape('cake', accent, liquid).replace('translate(400 330)', 'translate(430 400) scale(0.62)');
  } else {
    subject = dessertShape(type, accent, liquid);
  }

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}" role="img" aria-label="${label}">
  <defs>
    ${chrome}
    ${noise}
    <radialGradient id="glow" cx="0.68" cy="0.3" r="0.7">
      <stop offset="0" stop-color="${accent}" stop-opacity="0.34"/>
      <stop offset="1" stop-color="${accent}" stop-opacity="0"/>
    </radialGradient>
    <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="#101213"/>
      <stop offset="0.55" stop-color="#17191A"/>
      <stop offset="1" stop-color="#0B0D0E"/>
    </linearGradient>
  </defs>
  <rect width="${W}" height="${H}" fill="url(#bg)"/>
  <rect width="${W}" height="${H}" fill="url(#glow)"/>
  <g opacity="0.5">
    <circle cx="400" cy="300" r="240" fill="none" stroke="url(#chrome)" stroke-width="2" stroke-dasharray="3 9"/>
    <circle cx="400" cy="300" r="196" fill="none" stroke="${accent}" stroke-width="1" opacity="0.4"/>
  </g>
  <text x="46" y="66" fill="${accent}" font-family="${FONT}" font-size="17" letter-spacing="4">${tag}</text>
  <text x="754" y="66" text-anchor="end" fill="#C5C9CC" font-family="${FONT}" font-size="15" letter-spacing="3" opacity="0.7">LIMONATE®</text>
  ${subject}
  <g opacity="0.85">
    <text x="46" y="560" fill="#F4F3EA" font-family="${FONT}" font-size="54" letter-spacing="-1">${label.split(' ').slice(0, 1).join(' ')}</text>
    <text x="46" y="612" fill="none" stroke="#F4F3EA" stroke-opacity="0.55" stroke-width="1.4" font-family="${FONT}" font-size="54" letter-spacing="-1">${label.split(' ').slice(1).join(' ') || 'LEMONATE'}</text>
  </g>
  <g transform="translate(600 560)" opacity="0.55">
    ${[0, 1, 2, 3, 4, 5, 6, 7].map((i) => `<rect x="${i * 13}" y="0" width="${i % 3 === 0 ? 5 : 3}" height="52" fill="#F4F3EA"/>`).join('')}
    <text x="0" y="72" fill="#C5C9CC" font-family="monospace" font-size="11" letter-spacing="2">EXPRIME EL MOMENTO</text>
  </g>
  <rect width="${W}" height="${H}" filter="url(#grain)" opacity="0.5"/>
  <rect x="1" y="1" width="${W - 2}" height="${H - 2}" fill="none" stroke="#F4F3EA" stroke-opacity="0.08"/>
</svg>`;
}

let count = 0;
for (const [slug, cfg] of Object.entries(P)) {
  fs.writeFileSync(path.join(OUT, `${slug}.svg`), artwork(slug, cfg), 'utf8');
  count++;
}
console.log(`Generadas ${count} ilustraciones en ${OUT}`);
