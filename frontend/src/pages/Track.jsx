import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useLang } from '../context/LangContext.jsx';
import { api } from '../services/api.js';
import { formatCOP } from '../../../shared/pricing.js';
import { ORDER_STATUSES } from '../i18n/index.js';

const FLOW = ['recibido', 'pago-pendiente', 'pago-confirmado', 'en-preparacion', 'en-camino', 'entregado'];

export default function Track() {
  const { t, pick, lang } = useLang();
  const [searchParams] = useSearchParams();
  const [code, setCode] = useState(searchParams.get('code') || '');
  const [pin, setPin] = useState(searchParams.get('pin') || '');
  const [order, setOrder] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const search = async (event) => {
    event?.preventDefault();
    setLoading(true);
    setError(null);
    setOrder(null);
    try {
      const data = await api.trackOrder({ code, pin });
      setOrder(data);
    } catch (err) {
      setError(err.message || t('track.notFound'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (code && pin) search();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const currentIndex = order ? FLOW.indexOf(order.status) : -1;

  return (
    <div className="shell section">
      <span className="eyebrow">{t('nav.track')}</span>
      <h1 style={{ fontSize: 'var(--step-4)', marginBottom: '0.5rem' }}>{t('track.title')}</h1>
      <p>{t('track.lead')}</p>

      <form className="panel" onSubmit={search} style={{ maxWidth: 620, marginBottom: 'var(--space-5)' }}>
        <div className="form-grid">
          <label className="field">
            <span>{t('track.code')}</span>
            <input value={code} onChange={(event) => setCode(event.target.value.toUpperCase())} placeholder="LMT-123456" required />
          </label>
          <label className="field">
            <span>{t('track.pin')}</span>
            <input value={pin} onChange={(event) => setPin(event.target.value)} inputMode="numeric" maxLength={4} placeholder="0000" required />
          </label>
        </div>
        <button type="submit" className="btn" disabled={loading}>
          {loading ? t('common.loading') : t('track.check')}
        </button>
      </form>

      {error && <div className="notice notice--error" style={{ maxWidth: 620 }}>{error}</div>}

      {order && (
        <div className="grid grid--2">
          <div className="panel">
            <div className="row" style={{ justifyContent: 'space-between' }}>
              <div>
                <span className="tiny muted">{t('admin.code')}</span>
                <h3 style={{ marginTop: '0.2rem' }}>{order.code}</h3>
              </div>
              <span className={`status ${order.status === 'cancelado' ? 'status--danger' : 'status--ok'}`}>
                {t(`status.${order.status}`)}
              </span>
            </div>

            <div className="divider" />

            <div className="timeline">
              {FLOW.map((status, index) => (
                <div
                  key={status}
                  className={`timeline__step ${
                    index < currentIndex ? 'timeline__step--done' : index === currentIndex ? 'timeline__step--current' : ''
                  }`}
                >
                  <span className="timeline__dot" />
                  <div>
                    <strong style={{ fontSize: '0.85rem' }}>{t(`status.${status}`)}</strong>
                    {order.history?.find((entry) => entry.status === status)?.at && (
                      <div className="tiny muted">
                        {new Date(order.history.find((entry) => entry.status === status).at).toLocaleString(lang)}
                      </div>
                    )}
                  </div>
                </div>
              ))}
              {order.status === 'cancelado' && (
                <div className="timeline__step timeline__step--current">
                  <span className="timeline__dot" style={{ background: 'var(--danger)', borderColor: 'var(--danger)' }} />
                  <strong style={{ fontSize: '0.85rem' }}>{t('status.cancelado')}</strong>
                </div>
              )}
            </div>
          </div>

          <div className="panel">
            <h4 style={{ marginBottom: '0.8rem' }}>{t('track.items')}</h4>
            <ul className="stack" style={{ marginBottom: '1rem' }}>
              {order.items.map((item) => (
                <li key={`${item.productId}-${item.customization?.size || ''}-${item.comboLabel?.es || ''}`} className="row" style={{ justifyContent: 'space-between' }}>
                  <span className="tiny">
                    {item.qty}× {pick(item.name)}
                    {item.sizeLabel && ` · ${pick(item.sizeLabel)}`}
                    {item.comboLabel && (
                      <span className="muted" style={{ display: 'block' }}>{pick(item.comboLabel)}</span>
                    )}
                  </span>
                  <span className="tiny">{formatCOP(item.lineTotal, lang)}</span>
                </li>
              ))}
            </ul>
            <div className="divider" />
            <div className="cart-total-row">
              <span>{t('cart.subtotal')}</span>
              <span>{formatCOP(order.subtotal, lang)}</span>
            </div>
            <div className="cart-total-row">
              <span>{t('cart.delivery')}</span>
              <span>{formatCOP(order.deliveryFee, lang)}</span>
            </div>
            <div className="cart-total-row cart-total-row--grand">
              <span>{t('cart.total')}</span>
              <strong>{formatCOP(order.total, lang)}</strong>
            </div>
            <div className="divider" />
            <p className="tiny muted" style={{ margin: 0 }}>
              {t('track.address')}: {order.address?.line}, {order.address?.neighborhood}
            </p>
            <p className="tiny muted">
              {t('track.placed')}: {new Date(order.createdAt).toLocaleString(lang)} · {t('checkout.payment')}:{' '}
              {t(`payment.${order.paymentMethod}`)}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
