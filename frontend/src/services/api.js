/**
 * Capa de acceso a datos del frontend.
 *
 * - Si VITE_API_URL está definido → habla con el backend Express.
 * - Si no → usa el backend simulado en localStorage (modo demostración),
 *   lo que permite publicar la tienda en GitHub Pages sin servidor.
 */
import { localBackend } from './localBackend.js';

const BASE = (import.meta.env.VITE_API_URL || '').replace(/\/$/, '');
const DEMO = !BASE || import.meta.env.VITE_DEMO_MODE === 'true';
const TOKEN_KEY = 'lemonate.token';

const getToken = () => localStorage.getItem(TOKEN_KEY);

async function request(path, { method = 'GET', body, auth = false } = {}) {
  const headers = { 'Content-Type': 'application/json' };
  if (auth) {
    const token = getToken();
    if (token) headers.Authorization = `Bearer ${token}`;
  }
  const response = await fetch(`${BASE}${path}`, {
    method,
    headers,
    body: body === undefined ? undefined : JSON.stringify(body),
  });

  let payload = null;
  try {
    payload = await response.json();
  } catch {
    payload = null;
  }

  if (!response.ok) {
    const message = payload?.message || `Error ${response.status}`;
    const error = new Error(message);
    error.status = response.status;
    error.details = payload?.errors;
    throw error;
  }
  return payload;
}

const remote = {
  isDemo: false,

  listProducts: (params = {}) => {
    const query = new URLSearchParams(
      Object.entries(params).filter(([, v]) => v !== undefined && v !== '' && v !== null)
    ).toString();
    return request(`/products${query ? `?${query}` : ''}`);
  },
  getProduct: (id) => request(`/products/${id}`),
  createProduct: (payload) => request('/products', { method: 'POST', body: payload, auth: true }),
  updateProduct: (id, payload) => request(`/products/${id}`, { method: 'PATCH', body: payload, auth: true }),
  removeProduct: (id) => request(`/products/${id}`, { method: 'DELETE', auth: true }),

  register: async (payload) => {
    const data = await request('/auth/register', { method: 'POST', body: payload });
    localStorage.setItem(TOKEN_KEY, data.token);
    return data;
  },
  login: async (payload) => {
    const data = await request('/auth/login', { method: 'POST', body: payload });
    localStorage.setItem(TOKEN_KEY, data.token);
    return data;
  },
  me: () => request('/auth/me', { auth: true }).catch(() => ({ user: null })),
  updateMe: (payload) => request('/auth/me', { method: 'PATCH', body: payload, auth: true }),
  logout: () => localStorage.removeItem(TOKEN_KEY),

  createOrder: (payload) => request('/orders', { method: 'POST', body: payload, auth: true }),
  listOrders: () => request('/orders', { auth: true }),
  myOrders: () => request('/orders/mine', { auth: true }),
  trackOrder: ({ code, pin }) =>
    request(`/orders/track?code=${encodeURIComponent(code)}&pin=${encodeURIComponent(pin)}`),
  updateOrderStatus: (id, status) =>
    request(`/orders/${id}/status`, { method: 'PATCH', body: { status }, auth: true }),

  createMessage: (payload) => request('/messages', { method: 'POST', body: payload }),
  listMessages: () => request('/messages', { auth: true }),
  markMessage: (id) => request(`/messages/${id}`, { method: 'PATCH', body: { status: 'leido' }, auth: true }),

  getSettings: () => request('/settings'),
  updateSettings: (payload) => request('/settings', { method: 'PUT', body: payload, auth: true }),

  chat: (payload) => request('/ai/chat', { method: 'POST', body: payload }),
};

export const api = DEMO ? localBackend : remote;
export const isDemoMode = DEMO;
