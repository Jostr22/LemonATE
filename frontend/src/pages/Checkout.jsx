import { useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext.jsx';
import { useLang } from '../context/LangContext.jsx';
import { useStore } from '../context/StoreContext.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { api } from '../services/api.js';
import { PAYMENT_METHODS } from '../i18n/index.js';
import { computeDelivery, computeTotals, formatCOP } from '../../../shared/pricing.js';
import { IconArrow } from '../components/Icons.jsx';

const SAVED_KEY = 'lemonate.checkout.v1';

function readSaved() {
  try {
    return JSON.parse(localStorage.getItem(SAVED_KEY)) || {};
  } catch {
    return {};
  }
}

export default function Checkout() {
  const { items, subtotal, clear } = useCart();
  const { t, pick, lang } = useLang();
  const { settings } = useStore();
  const { user } = useAuth();
  const navigate = useNavigate();
  const saved = readSaved();

  const [form, setForm] = useState({
    name: user?.name || saved.name || '',
    phone: user?.phone || saved.phone || '',
    email: user?.email || saved.email || '',
    addressLine: saved.addressLine || '',
    neighborhood: saved.neighborhood || '',
    notes: saved.notes || '',
    distanceKm: saved.distanceKm || '',
    paymentMethod: 'nequi',
    saveData: true,
    terms: false,
  });
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [order, setOrder] = useState(null);
  const [serverError, setServerError] = useState(null);

  const distance = Number(form.distanceKm);
  const delivery = useMemo(
    () => computeDelivery(distance, settings?.delivery),
    [distance, settings]
  );
  const totals = useMemo(
    () => computeTotals(items, delivery.available ? delivery.fee : 0, 0),
    [items, delivery]
  );

  const update = (field) => (event) => {
    const value = event.target.type === 'checkbox' ? event.target.checked : event.target.value;
    setForm((current) => ({ ...current, [field]: value }));
  };

  const validate = () => {
    const found = {};
    if (!form.name.trim()) found.name = t('checkout.requiredFields');
    if (!form.phone.trim()) found.phone = t('checkout.requiredFields');
    if (!form.addressLine.trim()) found.addressLine = t('checkout.requiredFields');
    if (!form.neighborhood.trim()) found.neighborhood = t('checkout.requiredFields');
    if (form.distanceKm === '' || Number.isNaN(distance) || distance < 0) {
      found.distanceKm = t('checkout.requiredFields');
    } else if (!delivery.available) {
      found.distanceKm = t('checkout.noCoverage', { max: settings?.delivery?.maxKm ?? 12 });
    }
    if (!form.terms) found.terms = t('checkout.requiredFields');
    setErrors(found);
    return Object.keys(found).length === 0;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setServerError(null);
    if (!validate()) return;
    setSubmitting(true);
    try {
      const created = await api.createOrder({
        items: items.map((item) => ({
          productId: item.productId,
          qty: item.qty,
          customization: item.customization,
        })),
        customer: { name: form.name, phone: form.phone, email: form.email },
        address: {
          line: form.addressLine,
          neighborhood: form.neighborhood,
          notes: form.notes,
          distanceKm: distance,
        },
        paymentMethod: form.paymentMethod,
      });

      if (form.saveData) {
        localStorage.setItem(
          SAVED_KEY,
          JSON.stringify({
            name: form.name,
            phone: form.phone,
            email: form.email,
            addressLine: form.addressLine,
            neighborhood: form.neighborhood,
            notes: form.notes,
            distanceKm: form.distanceKm,
          })
        );
      }

      if (user && form.addressLine) {
        const exists = (user.addresses || []).some((address) => address.line === form.addressLine);
        if (!exists) {
          api
            .updateMe({
              addresses: [
                ...(user.addresses || []),
                {
                  label: form.neighborhood,
                  line: form.addressLine,
                  notes: form.notes,
                  distanceKm: distance,
                },
              ],
            })
            .catch(() => {});
        }
      }

      setOrder(created);
      clear();
    } catch (error) {
      setServerError(error.message);
    } finally {
      setSubmitting(false);
    }
  };

  if (order) {
    return (
      <div className="shell section">
        <div className="panel" style={{ maxWidth: 620, marginInline: 'auto', textAlign: 'center' }}>
          <span className="badge" style={{ position: 'static', display: 'inline-block', marginBottom: '1rem' }}>
            {t('checkout.success')}
          </span>
          <h1 style={{ fontSize: 'var(--step-3)', marginBottom: '0.6rem' }}>{t('checkout.success')}</h1>
          <p>{t('checkout.successLead')}</p>
          <div className="row" style={{ justifyContent: 'center', marginBlock: '1.5rem' }}>
            <div className="panel" style={{ textAlign: 'center' }}>
              <span className="tiny muted">{t('checkout.code')}</span>
              <div className="pdp__price" style={{ fontSize: 'var(--step-2)' }}>{order.code}</div>
            </div>
            <div className="panel" style={{ textAlign: 'center' }}>
              <span className="tiny muted">{t('checkout.pin')}</span>
              <div className="pdp__price" style={{ fontSize: 'var(--step-2)' }}>{order.pin}</div>
            </div>
          </div>
          <div className="cart-total-row">
            <span>{t('cart.total')}</span>
            <strong>{formatCOP(order.total, lang)}</strong>
          </div>
          <Link
            to={`/seguimiento?code=${order.code}&pin=${order.pin}`}
            className="btn btn--block"
            style={{ marginTop: '1rem' }}
          >
            {t('checkout.track')} <IconArrow />
          </Link>
          <Link to="/tienda" className="btn btn--ghost btn--block" style={{ marginTop: '0.5rem' }}>
            {t('cart.emptyCta')}
          </Link>
        </div>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="shell section">
        <span className="eyebrow">{t('checkout.title')}</span>
        <h1 style={{ fontSize: 'var(--step-4)', marginBottom: 'var(--space-4)' }}>{t('checkout.title')}</h1>
        <div className="empty">
          <p>{t('cart.empty')}</p>
          <Link to="/tienda" className="btn btn--sm">
            {t('cart.emptyCta')}
          </Link>
        </div>
      </div>
    );
  }

  const paymentLabels = {
    nequi: 'Nequi',
    daviplata: 'Daviplata',
    bancolombia: 'Bancolombia',
    'bre-b': 'Llaves Bre-B',
    tarjeta: t('payment.tarjeta'),
  };

  return (
    <div className="shell section">
      <span className="eyebrow">{t('checkout.title')}</span>
      <h1 style={{ fontSize: 'var(--step-4)', marginBottom: '0.5rem' }}>{t('checkout.title')}</h1>
      <p>{t('checkout.lead')}</p>

      {!user && (
        <div className="notice notice--warn">
          {t('checkout.guest')}. {t('checkout.loginHint')} <Link to="/login"> {t('auth.login')} →</Link>
        </div>
      )}

      <form className="checkout-grid" onSubmit={handleSubmit} noValidate>
        <div>
          <div className="panel" style={{ marginBottom: 'var(--space-4)' }}>
            <h3 style={{ fontSize: 'var(--step-1)', marginBottom: '1rem' }}>{t('checkout.customer')}</h3>
            <div className="form-grid">
              <label className="field">
                <span>{t('checkout.name')} *</span>
                <input value={form.name} onChange={update('name')} aria-invalid={Boolean(errors.name)} autoComplete="name" />
                {errors.name && <p className="field__error">{errors.name}</p>}
              </label>
              <label className="field">
                <span>{t('checkout.phone')} *</span>
                <input value={form.phone} onChange={update('phone')} aria-invalid={Boolean(errors.phone)} autoComplete="tel" inputMode="tel" />
                {errors.phone && <p className="field__error">{errors.phone}</p>}
              </label>
              <label className="field field--full">
                <span>{t('checkout.email')} ({t('common.optional')})</span>
                <input type="email" value={form.email} onChange={update('email')} autoComplete="email" />
              </label>
            </div>
          </div>

          <div className="panel" style={{ marginBottom: 'var(--space-4)' }}>
            <h3 style={{ fontSize: 'var(--step-1)', marginBottom: '1rem' }}>{t('checkout.address')}</h3>
            <div className="form-grid">
              <label className="field field--full">
                <span>{t('checkout.addressLine')} *</span>
                <input value={form.addressLine} onChange={update('addressLine')} aria-invalid={Boolean(errors.addressLine)} autoComplete="street-address" />
                {errors.addressLine && <p className="field__error">{errors.addressLine}</p>}
              </label>
              <label className="field">
                <span>{t('checkout.neighborhood')} *</span>
                <input value={form.neighborhood} onChange={update('neighborhood')} aria-invalid={Boolean(errors.neighborhood)} />
                {errors.neighborhood && <p className="field__error">{errors.neighborhood}</p>}
              </label>
              <label className="field">
                <span>{t('checkout.distance')} *</span>
                <input
                  type="number"
                  min="0"
                  max="60"
                  step="0.1"
                  value={form.distanceKm}
                  onChange={update('distanceKm')}
                  aria-invalid={Boolean(errors.distanceKm)}
                />
                <p className="field__hint">{t('checkout.distanceHint')}</p>
                {errors.distanceKm && <p className="field__error">{errors.distanceKm}</p>}
              </label>
              <label className="field field--full">
                <span>{t('checkout.notes')} ({t('common.optional')})</span>
                <textarea value={form.notes} onChange={update('notes')} rows={2} />
              </label>
            </div>

            {form.distanceKm !== '' && (
              <div className={`notice ${delivery.available ? 'notice--ok' : 'notice--error'}`} style={{ marginBottom: 0 }}>
                {delivery.available
                  ? `${t('checkout.coverage')}: ${formatCOP(delivery.fee, lang)}`
                  : t('checkout.noCoverage', { max: settings?.delivery?.maxKm ?? 12 })}
              </div>
            )}
          </div>

          <div className="panel">
            <h3 style={{ fontSize: 'var(--step-1)', marginBottom: '1rem' }}>{t('checkout.payment')}</h3>
            <div className="option-list">
              {PAYMENT_METHODS.map((method) => (
                <button
                  key={method}
                  type="button"
                  className="option-chip"
                  aria-pressed={form.paymentMethod === method}
                  onClick={() => setForm((current) => ({ ...current, paymentMethod: method }))}
                >
                  {paymentLabels[method]}
                </button>
              ))}
            </div>
            <p className="tiny muted" style={{ marginTop: '0.8rem' }}>
              {settings?.payments?.[form.paymentMethod === 'bre-b' ? 'breB' : form.paymentMethod === 'tarjeta' ? 'card' : form.paymentMethod]}
            </p>
            <div className="notice notice--warn" style={{ marginBottom: 0 }}>
              {t('checkout.paymentNote')}
            </div>
          </div>
        </div>

        <aside className="panel summary">
          <h3 style={{ fontSize: 'var(--step-1)', marginBottom: '1rem' }}>{t('checkout.summary')}</h3>
          <ul className="stack" style={{ marginBottom: '1rem' }}>
            {items.map((item) => (
              <li key={item.key} className="row" style={{ justifyContent: 'space-between', gap: '0.5rem' }}>
                <span className="tiny" style={{ flex: 1 }}>
                  {item.qty}× {pick(item.name)}
                </span>
                <span className="tiny">{formatCOP(item.unitPrice * item.qty, lang)}</span>
              </li>
            ))}
          </ul>
          <div className="cart-total-row">
            <span>{t('cart.subtotal')}</span>
            <strong>{formatCOP(subtotal, lang)}</strong>
          </div>
          <div className="cart-total-row">
            <span>{t('cart.delivery')}</span>
            <span>{delivery.available ? formatCOP(delivery.fee, lang) : '—'}</span>
          </div>
          <div className="cart-total-row cart-total-row--grand">
            <span>{t('cart.total')}</span>
            <strong>{formatCOP(totals.total, lang)}</strong>
          </div>

          <label className="checkbox" style={{ marginTop: '1rem' }}>
            <input type="checkbox" checked={form.saveData} onChange={update('saveData')} />
            <span>{t('checkout.saveData')}</span>
          </label>
          <label className="checkbox">
            <input type="checkbox" checked={form.terms} onChange={update('terms')} aria-invalid={Boolean(errors.terms)} />
            <span>{t('checkout.terms')}</span>
          </label>
          {errors.terms && <p className="field__error" style={{ marginTop: '-0.5rem' }}>{errors.terms}</p>}

          {serverError && <div className="notice notice--error">{serverError}</div>}

          <button type="submit" className="btn btn--block" disabled={submitting || !delivery.available}>
            {submitting ? t('common.loading') : t('checkout.placeOrder')}
          </button>
        </aside>
      </form>
    </div>
  );
}
