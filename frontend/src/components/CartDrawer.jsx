import { Link } from 'react-router-dom';
import { useCart } from '../context/CartContext.jsx';
import { useLang } from '../context/LangContext.jsx';
import { describeCustomization, formatCOP } from '../../../shared/pricing.js';
import { IconClose, IconTrash } from './Icons.jsx';

export default function CartDrawer() {
  const { items, open, setOpen, remove, setQty, subtotal } = useCart();
  const { t, pick, lang } = useLang();

  if (!open) return null;

  return (
    <>
      <div className="overlay" onClick={() => setOpen(false)} aria-hidden="true" />
      <aside className="cart-drawer" aria-label={t('cart.title')} aria-modal="true" role="dialog">
        <div className="cart-drawer__head">
          <h2>{t('cart.title')}</h2>
          <button type="button" className="icon-btn" onClick={() => setOpen(false)} aria-label={t('common.close')}>
            <IconClose />
          </button>
        </div>

        <div className="cart-drawer__body">
          {items.length === 0 ? (
            <div className="empty">
              <p>{t('cart.empty')}</p>
              <Link to="/tienda" className="btn btn--sm" onClick={() => setOpen(false)}>
                {t('cart.emptyCta')}
              </Link>
            </div>
          ) : (
            <ul>
              {items.map((item) => (
                <li className="cart-line" key={item.key}>
                  <img src={item.image} alt="" loading="lazy" width="62" height="62" />
                  <div>
                    <div className="cart-line__name">{pick(item.name)}</div>
                    <div className="cart-line__meta">
                      {item.comboLabel
                        ? pick(item.comboLabel)
                        : item.customizable
                          ? describeCustomization(item.customization, lang)
                          : item.category}
                    </div>
                    <div className="cart-line__controls">
                      <div className="qty">
                        <button
                          type="button"
                          onClick={() => setQty(item.key, item.qty - 1)}
                          aria-label="−"
                        >
                          −
                        </button>
                        <span>{item.qty}</span>
                        <button
                          type="button"
                          onClick={() => setQty(item.key, item.qty + 1)}
                          aria-label="+"
                        >
                          +
                        </button>
                      </div>
                      <Link to={`/producto/${item.productId}?editar=${encodeURIComponent(item.key)}`} onClick={() => setOpen(false)}>
                        {t('cart.edit')}
                      </Link>
                      <button type="button" onClick={() => remove(item.key)}>
                        <IconTrash /> {t('cart.remove')}
                      </button>
                    </div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <strong>{formatCOP(item.unitPrice * item.qty, lang)}</strong>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        {items.length > 0 && (
          <div className="cart-drawer__foot">
            <div className="cart-total-row">
              <span>{t('cart.subtotal')}</span>
              <strong>{formatCOP(subtotal, lang)}</strong>
            </div>
            <div className="cart-total-row">
              <span>{t('cart.delivery')}</span>
              <span>{t('cart.deliveryLater')}</span>
            </div>
            <Link to="/checkout" className="btn btn--block" style={{ marginTop: '0.8rem' }} onClick={() => setOpen(false)}>
              {t('cart.checkout')}
            </Link>
          </div>
        )}
      </aside>
    </>
  );
}
