import { Link } from 'react-router-dom';
import { useCart } from '../context/CartContext.jsx';
import { useLang } from '../context/LangContext.jsx';
import { describeCustomization, formatCOP } from '../../../shared/pricing.js';
import { IconTrash } from '../components/Icons.jsx';

export default function Cart() {
  const { items, subtotal, setQty, remove, count } = useCart();
  const { t, pick, lang } = useLang();

  if (items.length === 0) {
    return (
      <div className="shell section">
        <h1 style={{ fontSize: 'var(--step-4)', marginBottom: '1rem' }}>{t('cart.title')}</h1>
        <div className="empty">
          <p>{t('cart.empty')}</p>
          <Link to="/tienda" className="btn btn--sm">
            {t('cart.emptyCta')}
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="shell section">
      <span className="eyebrow">{t('cart.items', { count })}</span>
      <h1 style={{ fontSize: 'var(--step-4)', marginBottom: 'var(--space-5)' }}>{t('cart.title')}</h1>

      <div className="checkout-grid">
        <div className="panel panel--flush">
          <ul>
            {items.map((item) => (
              <li
                key={item.key}
                style={{
                  display: 'grid',
                  gridTemplateColumns: '72px 1fr auto',
                  gap: '1rem',
                  padding: '1rem',
                  borderBottom: '1px solid var(--ink-line)',
                  alignItems: 'center',
                }}
              >
                <img src={item.image} alt="" width="72" height="72" style={{ borderRadius: 8, objectFit: 'cover' }} />
                <div>
                  <strong>{pick(item.name)}</strong>
                  <div className="tiny muted">
                    {item.comboLabel
                      ? pick(item.comboLabel)
                      : item.customizable
                        ? describeCustomization(item.customization, lang)
                        : item.category}
                  </div>
                  <div className="row" style={{ marginTop: '0.5rem' }}>
                    <div className="qty">
                      <button type="button" onClick={() => setQty(item.key, item.qty - 1)} aria-label="−">−</button>
                      <span>{item.qty}</span>
                      <button type="button" onClick={() => setQty(item.key, item.qty + 1)} aria-label="+">+</button>
                    </div>
                    <Link className="tiny" to={`/producto/${item.productId}?editar=${encodeURIComponent(item.key)}`}>
                      {t('cart.edit')}
                    </Link>
                    <button
                      type="button"
                      className="tiny"
                      onClick={() => remove(item.key)}
                      style={{ background: 'none', border: 0, color: 'var(--cream-dim)' }}
                    >
                      <IconTrash /> {t('cart.remove')}
                    </button>
                  </div>
                </div>
                <strong>{formatCOP(item.unitPrice * item.qty, lang)}</strong>
              </li>
            ))}
          </ul>
        </div>

        <aside className="panel summary">
          <h3 style={{ fontSize: 'var(--step-1)', marginBottom: '1rem' }}>{t('checkout.summary')}</h3>
          <div className="cart-total-row">
            <span>{t('cart.subtotal')}</span>
            <strong>{formatCOP(subtotal, lang)}</strong>
          </div>
          <div className="cart-total-row">
            <span>{t('cart.delivery')}</span>
            <span>{t('cart.deliveryLater')}</span>
          </div>
          <Link to="/checkout" className="btn btn--block" style={{ marginTop: '1rem' }}>
            {t('cart.checkout')}
          </Link>
          <Link to="/tienda" className="btn btn--ghost btn--block" style={{ marginTop: '0.5rem' }}>
            {t('common.continue')}
          </Link>
        </aside>
      </div>
    </div>
  );
}
